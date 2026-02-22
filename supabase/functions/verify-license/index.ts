import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { license_key, domain } = await req.json();

    if (!license_key || !domain) {
      return new Response(
        JSON.stringify({ valid: false, error: "Clé et domaine requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the license
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key", license_key.trim())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !license) {
      return new Response(
        JSON.stringify({ valid: false, error: "Clé de licence invalide" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: "Licence expirée" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check domain: if already bound to a different domain, reject
    if (license.allowed_domain && license.allowed_domain !== domain) {
      return new Response(
        JSON.stringify({ valid: false, error: "Cette licence est déjà activée sur un autre domaine" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Bind the domain and mark as activated (one-time activation)
    if (!license.allowed_domain) {
      await supabase
        .from("licenses")
        .update({ allowed_domain: domain, activated_at: new Date().toISOString() })
        .eq("id", license.id);
    }

    return new Response(
      JSON.stringify({
        valid: true,
        client_name: license.client_name,
        expires_at: license.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, error: "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
