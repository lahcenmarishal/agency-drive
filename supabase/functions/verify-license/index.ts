import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { license_key, domain } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ valid: false, error: "Domaine requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Domain-only check: verify if this domain already has an active license
    if (!license_key) {
      const { data: domainLicense } = await supabaseAdmin
        .from("licenses")
        .select("id, is_active, expires_at")
        .eq("allowed_domain", domain)
        .eq("is_active", true)
        .maybeSingle();

      if (domainLicense) {
        const notExpired = !domainLicense.expires_at || new Date(domainLicense.expires_at) >= new Date();
        if (notExpired) {
          return new Response(
            JSON.stringify({ valid: true, message: "Domaine déjà activé" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ valid: false, error: "Aucune licence active pour ce domaine" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find the license
    const { data: license, error: fetchError } = await supabaseAdmin
      .from("licenses")
      .select("*")
      .eq("license_key", license_key)
      .maybeSingle();

    if (fetchError || !license) {
      return new Response(
        JSON.stringify({ valid: false, error: "Clé de licence invalide" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!license.is_active) {
      return new Response(
        JSON.stringify({ valid: false, error: "Licence désactivée" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: "Licence expirée" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check domain binding
    if (license.allowed_domain && license.allowed_domain !== domain) {
      return new Response(
        JSON.stringify({ valid: false, error: "Cette licence est déjà liée à un autre domaine" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Bind domain if not yet bound
    if (!license.allowed_domain) {
      await supabaseAdmin
        .from("licenses")
        .update({ allowed_domain: domain, activated_at: new Date().toISOString() })
        .eq("id", license.id);
    }

    return new Response(
      JSON.stringify({ valid: true, message: "Licence activée avec succès" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ valid: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
