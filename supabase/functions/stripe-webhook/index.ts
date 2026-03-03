import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

// Plan limits mapping by product ID
const PLAN_LIMITS: Record<string, { name: string; maxVehicles: number; maxUsers: number; maxAgencies: number }> = {
  "prod_U56EfSGZpZHXTR": { name: "basic", maxVehicles: 10, maxUsers: 3, maxAgencies: 1 },
  "prod_U56GpPCyeMV1vZ": { name: "basic", maxVehicles: 10, maxUsers: 3, maxAgencies: 1 },
  "prod_U56Ff0HFvg7ZY4": { name: "pro", maxVehicles: 50, maxUsers: 10, maxAgencies: 3 },
  "prod_U56GeMyU4nEdP0": { name: "pro", maxVehicles: 50, maxUsers: 10, maxAgencies: 3 },
  "prod_U56FUtvxzuCJwd": { name: "enterprise", maxVehicles: -1, maxUsers: -1, maxAgencies: -1 },
  "prod_U56H83bPS752DT": { name: "enterprise", maxVehicles: -1, maxUsers: -1, maxAgencies: -1 },
};

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
      // In test mode without webhook secret, parse directly
      event = JSON.parse(body) as Stripe.Event;
    }

    logStep("Event type", { type: event.type });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
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
          // Find the agency and mark subscription as past_due
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
