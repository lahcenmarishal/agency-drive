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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const adminEmail = "admin@autorent.com";
    const adminPassword = "23oct2022";

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(
      (user) => user.email === adminEmail
    );

    if (existingAdmin) {
      // Update existing admin to super_admin role if not already
      const { data: currentRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", existingAdmin.id)
        .single();

      if (currentRole?.role !== "super_admin") {
        await supabaseAdmin
          .from("user_roles")
          .update({ role: "super_admin" })
          .eq("user_id", existingAdmin.id);

        // Update password
        await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
          password: adminPassword,
        });

        return new Response(
          JSON.stringify({ message: "Admin updated to super_admin", success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Super admin already exists", success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create super admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Super Administrateur",
      },
    });

    if (createError) {
      console.error("Error creating admin:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update user role to super_admin
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: "super_admin" })
      .eq("user_id", newUser.user.id);

    if (roleError) {
      console.error("Error updating role:", roleError);
    }

    // Update profile
    await supabaseAdmin
      .from("profiles")
      .update({ full_name: "Super Administrateur", email: adminEmail })
      .eq("user_id", newUser.user.id);

    return new Response(
      JSON.stringify({ 
        message: "Super admin created successfully", 
        success: true,
        userId: newUser.user.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
