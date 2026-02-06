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
      // Ensure super_admin role (force single role row)
      const { error: deleteRolesError } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", existingAdmin.id);

      if (deleteRolesError) {
        console.error("Error cleaning roles:", deleteRolesError);
      }

      const { error: insertRoleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: existingAdmin.id, role: "super_admin" });

      if (insertRoleError) {
        console.error("Error inserting super_admin role:", insertRoleError);
      }

      // Update password (idempotent)
      await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
        password: adminPassword,
      });

      // Ensure profile exists / updated
      const { error: profileUpsertError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            user_id: existingAdmin.id,
            full_name: "Super Administrateur",
            email: adminEmail,
            agency_id: null,
          },
          { onConflict: "user_id" }
        );

      if (profileUpsertError) {
        console.error("Error upserting profile:", profileUpsertError);
      }

      return new Response(
        JSON.stringify({ message: "Admin updated to super_admin", success: true }),
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
