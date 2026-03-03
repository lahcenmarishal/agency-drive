import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("User not authenticated");

    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    // Get agency_id from body or profile
    let agencyId: string | null = null;
    try {
      const body = await req.json();
      agencyId = body.agencyId || null;
    } catch {
      // no body
    }

    if (!agencyId) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("agency_id")
        .eq("user_id", user.id)
        .maybeSingle();
      agencyId = profile?.agency_id || null;
    }

    if (!agencyId) {
      logStep("No agency found for user");
      return new Response(JSON.stringify({ subscribed: false, plan: null, status: "no_agency" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check existing subscription in DB first
    const { data: existingSub } = await supabaseClient
      .from("tenant_subscriptions")
      .select("*")
      .eq("agency_id", agencyId)
      .maybeSingle();

    // If we have a Stripe customer ID, check Stripe directly
    if (existingSub?.stripe_customer_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

      const subscriptions = await stripe.subscriptions.list({
        customer: existingSub.stripe_customer_id,
        status: "active",
        limit: 1,
      });

      // Also check trialing
      const trialSubs = await stripe.subscriptions.list({
        customer: existingSub.stripe_customer_id,
        status: "trialing",
        limit: 1,
      });

      const allSubs = [...subscriptions.data, ...trialSubs.data];

      if (allSubs.length > 0) {
        const sub = allSubs[0];
        const productId = sub.items.data[0].price.product as string;
        const priceId = sub.items.data[0].price.id;
        const planInfo = PLAN_LIMITS[productId] || { name: "basic", maxVehicles: 10, maxUsers: 3, maxAgencies: 1 };
        const interval = sub.items.data[0].price.recurring?.interval === "year" ? "yearly" : "monthly";

        // Update local DB
        await supabaseClient
          .from("tenant_subscriptions")
          .upsert({
            agency_id: agencyId,
            stripe_customer_id: existingSub.stripe_customer_id,
            stripe_subscription_id: sub.id,
            plan_name: planInfo.name,
            status: sub.status,
            billing_interval: interval,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            max_vehicles: planInfo.maxVehicles,
            max_users: planInfo.maxUsers,
            max_agencies: planInfo.maxAgencies,
            price_id: priceId,
            amount: (sub.items.data[0].price.unit_amount || 0) / 100,
            currency: sub.items.data[0].price.currency,
          }, { onConflict: "agency_id" });

        logStep("Active subscription found", { plan: planInfo.name, status: sub.status });

        return new Response(JSON.stringify({
          subscribed: true,
          plan: planInfo.name,
          status: sub.status,
          subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
          max_vehicles: planInfo.maxVehicles,
          max_users: planInfo.maxUsers,
          max_agencies: planInfo.maxAgencies,
          billing_interval: interval,
          amount: (sub.items.data[0].price.unit_amount || 0) / 100,
          currency: sub.items.data[0].price.currency,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // No active sub found on Stripe - mark as expired
      await supabaseClient
        .from("tenant_subscriptions")
        .update({ status: "expired" })
        .eq("agency_id", agencyId);
    }

    // Check by email if no stripe_customer_id stored
    if (!existingSub?.stripe_customer_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });

      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0];
          const productId = sub.items.data[0].price.product as string;
          const priceId = sub.items.data[0].price.id;
          const planInfo = PLAN_LIMITS[productId] || { name: "basic", maxVehicles: 10, maxUsers: 3, maxAgencies: 1 };
          const interval = sub.items.data[0].price.recurring?.interval === "year" ? "yearly" : "monthly";

          await supabaseClient
            .from("tenant_subscriptions")
            .upsert({
              agency_id: agencyId,
              stripe_customer_id: customerId,
              stripe_subscription_id: sub.id,
              plan_name: planInfo.name,
              status: sub.status,
              billing_interval: interval,
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              max_vehicles: planInfo.maxVehicles,
              max_users: planInfo.maxUsers,
              max_agencies: planInfo.maxAgencies,
              price_id: priceId,
              amount: (sub.items.data[0].price.unit_amount || 0) / 100,
              currency: sub.items.data[0].price.currency,
            }, { onConflict: "agency_id" });

          return new Response(JSON.stringify({
            subscribed: true,
            plan: planInfo.name,
            status: sub.status,
            subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
            max_vehicles: planInfo.maxVehicles,
            max_users: planInfo.maxUsers,
            max_agencies: planInfo.maxAgencies,
            billing_interval: interval,
            amount: (sub.items.data[0].price.unit_amount || 0) / 100,
            currency: sub.items.data[0].price.currency,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    // Return existing DB data if available
    if (existingSub) {
      return new Response(JSON.stringify({
        subscribed: existingSub.status === "active" || existingSub.status === "trialing",
        plan: existingSub.plan_name,
        status: existingSub.status,
        subscription_end: existingSub.current_period_end,
        max_vehicles: existingSub.max_vehicles,
        max_users: existingSub.max_users,
        max_agencies: existingSub.max_agencies,
        billing_interval: existingSub.billing_interval,
        amount: existingSub.amount,
        currency: existingSub.currency,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No subscription found");
    return new Response(JSON.stringify({ subscribed: false, plan: null, status: "none" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
