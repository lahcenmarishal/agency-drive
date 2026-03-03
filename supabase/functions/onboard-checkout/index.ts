import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[ONBOARD-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const {
      full_name,
      email,
      password,
      agency_name,
      agency_city,
      agency_address,
      agency_phone,
      agency_email,
      plan_key,
      price_id,
      billing_interval,
    } = await req.json();

    // Validate required fields
    if (!full_name?.trim() || !email?.trim() || !password?.trim() || !agency_name?.trim() || !price_id) {
      return new Response(
        JSON.stringify({ error: "Tous les champs obligatoires doivent être remplis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );
    if (userExists) {
      return new Response(
        JSON.stringify({ error: "Un utilisateur avec cet email existe déjà. Connectez-vous à la place." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check pending registration with same email
    const { data: existingPending } = await supabaseAdmin
      .from("pending_registrations")
      .select("id")
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existingPending) {
      // Delete old pending registration
      await supabaseAdmin
        .from("pending_registrations")
        .delete()
        .eq("id", existingPending.id);
    }

    // Store pending registration (password stored as base64-encoded for retrieval after payment)
    // This is temporary and deleted after account creation
    const encodedPassword = btoa(password.trim());

    const { data: pendingReg, error: insertError } = await supabaseAdmin
      .from("pending_registrations")
      .insert({
        full_name: full_name.trim(),
        email: normalizedEmail,
        password_hash: encodedPassword,
        agency_name: agency_name.trim(),
        agency_city: agency_city?.trim() || null,
        agency_address: agency_address?.trim() || null,
        agency_phone: agency_phone?.trim() || null,
        agency_email: agency_email?.trim() || null,
        plan_key: plan_key || "basic",
        price_id,
        billing_interval: billing_interval || "monthly",
      })
      .select("id")
      .single();

    if (insertError) {
      logStep("Insert error", insertError);
      throw new Error("Impossible de créer l'inscription");
    }

    logStep("Pending registration created", { id: pendingReg.id });

    // Create Stripe checkout session
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Create or find customer
    const customers = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: normalizedEmail,
        name: full_name.trim(),
        metadata: { pending_registration_id: pendingReg.id },
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://agency-drive.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/auth?onboarded=true`,
      cancel_url: `${origin}/onboarding?cancelled=true`,
      metadata: {
        pending_registration_id: pendingReg.id,
        onboarding: "true",
      },
      subscription_data: {
        metadata: {
          pending_registration_id: pendingReg.id,
          onboarding: "true",
        },
      },
    });

    // Store session ID
    await supabaseAdmin
      .from("pending_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", pendingReg.id);

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
