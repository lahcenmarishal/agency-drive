import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const PLAN_LIMITS: Record<string, { name: string; maxVehicles: number; maxUsers: number; maxAgencies: number }> = {
  "prod_U56EfSGZpZHXTR": { name: "basic", maxVehicles: 10, maxUsers: 3, maxAgencies: 1 },
  "prod_U56GpPCyeMV1vZ": { name: "basic", maxVehicles: 10, maxUsers: 3, maxAgencies: 1 },
  "prod_U56Ff0HFvg7ZY4": { name: "pro", maxVehicles: 50, maxUsers: 10, maxAgencies: 3 },
  "prod_U56GeMyU4nEdP0": { name: "pro", maxVehicles: 50, maxUsers: 10, maxAgencies: 3 },
  "prod_U56FUtvxzuCJwd": { name: "enterprise", maxVehicles: -1, maxUsers: -1, maxAgencies: -1 },
  "prod_U56H83bPS752DT": { name: "enterprise", maxVehicles: -1, maxUsers: -1, maxAgencies: -1 },
};

async function handleOnboardingCheckout(
  supabaseClient: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  const pendingId = session.metadata?.pending_registration_id;
  if (!pendingId) {
    logStep("No pending_registration_id in session metadata");
    return;
  }

  const { data: pending, error: fetchError } = await supabaseClient
    .from("pending_registrations")
    .select("*")
    .eq("id", pendingId)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchError || !pending) {
    logStep("Pending registration not found or already processed", { pendingId, error: fetchError });
    return;
  }

  logStep("Processing onboarding", { email: pending.email, agency: pending.agency_name });

  // 1. Create agency
  const { data: agency, error: agencyError } = await supabaseClient
    .from("agencies")
    .insert({
      name: pending.agency_name,
      city: pending.agency_city,
      address: pending.agency_address,
      phone: pending.agency_phone,
      email: pending.agency_email,
    })
    .select("id")
    .single();

  if (agencyError || !agency) {
    logStep("Error creating agency", agencyError);
    throw new Error("Failed to create agency");
  }
  logStep("Agency created", { agencyId: agency.id });

  // 2. Create user account
  const decodedPassword = atob(pending.password_hash);
  const { data: newUser, error: userError } = await supabaseClient.auth.admin.createUser({
    email: pending.email,
    password: decodedPassword,
    email_confirm: true,
    user_metadata: { full_name: pending.full_name },
  });

  if (userError || !newUser.user) {
    logStep("Error creating user", userError);
    throw new Error("Failed to create user");
  }
  logStep("User created", { userId: newUser.user.id });

  // Force password sync
  await supabaseClient.auth.admin.updateUserById(newUser.user.id, {
    password: decodedPassword,
  });

  // 3. Set role to admin (delete default agent role first)
  await supabaseClient
    .from("user_roles")
    .delete()
    .eq("user_id", newUser.user.id);

  await supabaseClient
    .from("user_roles")
    .insert({ user_id: newUser.user.id, role: "admin" });

  // 4. Update profile with agency
  await supabaseClient
    .from("profiles")
    .upsert(
      {
        user_id: newUser.user.id,
        full_name: pending.full_name,
        email: pending.email,
        agency_id: agency.id,
      },
      { onConflict: "user_id" }
    );

  // 5. Create admin_agencies link
  await supabaseClient
    .from("admin_agencies")
    .insert({ user_id: newUser.user.id, agency_id: agency.id });

  // 6. Create subscription record
  const subscriptionId = session.subscription as string;
  let subData: any = {
    agency_id: agency.id,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionId,
    plan_name: pending.plan_key,
    status: "active",
    billing_interval: pending.billing_interval,
    price_id: pending.price_id,
  };

  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const productId = sub.items.data[0].price.product as string;
      const planInfo = PLAN_LIMITS[productId] || { name: pending.plan_key, maxVehicles: 10, maxUsers: 3, maxAgencies: 1 };
      subData = {
        ...subData,
        plan_name: planInfo.name,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        max_vehicles: planInfo.maxVehicles,
        max_users: planInfo.maxUsers,
        max_agencies: planInfo.maxAgencies,
        amount: (sub.items.data[0].price.unit_amount || 0) / 100,
        currency: sub.items.data[0].price.currency,
      };

      // Update subscription metadata with agency_id for future webhook events
      await stripe.subscriptions.update(subscriptionId, {
        metadata: { agency_id: agency.id },
      });
    } catch (e) {
      logStep("Error fetching subscription details", e);
    }
  }

  await supabaseClient
    .from("tenant_subscriptions")
    .upsert(subData, { onConflict: "agency_id" });

  // 7. Mark pending registration as completed
  await supabaseClient
    .from("pending_registrations")
    .update({ status: "completed" })
    .eq("id", pendingId);

  // 8. Delete the password from pending_registrations for security
  await supabaseClient
    .from("pending_registrations")
    .update({ password_hash: "***REDACTED***" })
    .eq("id", pendingId);

  logStep("Onboarding complete", { userId: newUser.user.id, agencyId: agency.id });
}

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const sig = req.headers.get("stripe-signature");
      if (!sig) throw new Error("No stripe-signature header");
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    logStep("Event type", { type: event.type });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.onboarding === "true") {
          await handleOnboardingCheckout(supabaseClient, session, stripe);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;
        if (!agencyId) {
          logStep("No agency_id in subscription metadata, skipping");
          break;
        }

        const productId = subscription.items.data[0].price.product as string;
        const priceId = subscription.items.data[0].price.id;
        const planInfo = PLAN_LIMITS[productId] || { name: "basic", maxVehicles: 10, maxUsers: 3, maxAgencies: 1 };
        const interval = subscription.items.data[0].price.recurring?.interval === "year" ? "yearly" : "monthly";

        const upsertData = {
          agency_id: agencyId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          plan_name: planInfo.name,
          status: subscription.status,
          billing_interval: interval,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          max_vehicles: planInfo.maxVehicles,
          max_users: planInfo.maxUsers,
          max_agencies: planInfo.maxAgencies,
          price_id: priceId,
          amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
          currency: subscription.items.data[0].price.currency,
        };

        await supabaseClient
          .from("tenant_subscriptions")
          .upsert(upsertData, { onConflict: "agency_id" });

        logStep("Subscription upserted", { agencyId, plan: planInfo.name, status: subscription.status });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;
        if (agencyId) {
          await supabaseClient
            .from("tenant_subscriptions")
            .update({ status: "cancelled" })
            .eq("agency_id", agencyId);
          logStep("Subscription cancelled", { agencyId });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment succeeded", { invoiceId: invoice.id, amount: invoice.amount_paid });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (subId) {
          const { data: sub } = await supabaseClient
            .from("tenant_subscriptions")
            .select("agency_id")
            .eq("stripe_subscription_id", subId)
            .maybeSingle();

          if (sub) {
            await supabaseClient
              .from("tenant_subscriptions")
              .update({ status: "past_due" })
              .eq("agency_id", sub.agency_id);
            logStep("Payment failed, marked past_due", { agencyId: sub.agency_id });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
