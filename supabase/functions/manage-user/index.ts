import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageUserRequest {
  action: "update" | "delete";
  user_id: string;
  full_name?: string;
  is_active?: boolean;
  agency_ids?: string[];
}

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

    // Get the authorization header to verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the requesting user's token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the requesting user is super_admin
    const { data: requesterRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .single();

    if (!requesterRole || requesterRole.role !== "super_admin") {
      return new Response(
        JSON.stringify({ error: "Only super admins can manage users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, user_id, full_name, is_active, agency_ids }: ManageUserRequest = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent super admin from modifying themselves
    if (user_id === requestingUser.id) {
      return new Response(
        JSON.stringify({ error: "Vous ne pouvez pas modifier votre propre compte" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check target user's role - prevent modification of other super admins
    const { data: targetRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user_id)
      .single();

    if (targetRole?.role === "super_admin") {
      return new Response(
        JSON.stringify({ error: "Impossible de modifier un autre Super Admin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      // Delete user from auth (this will cascade to profiles and roles due to ON DELETE CASCADE)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      
      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Clean up admin_agencies entries
      await supabaseAdmin
        .from("admin_agencies")
        .delete()
        .eq("user_id", user_id);

      return new Response(
        JSON.stringify({ message: "User deleted successfully", success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update") {
      // Update profile
      const updateData: Record<string, any> = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (is_active !== undefined) updateData.is_active = is_active;

      if (Object.keys(updateData).length > 0) {
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update(updateData)
          .eq("user_id", user_id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Update admin_agencies if provided (only for admin role)
      if (agency_ids !== undefined && targetRole?.role === "admin") {
        // Delete existing entries
        await supabaseAdmin
          .from("admin_agencies")
          .delete()
          .eq("user_id", user_id);

        // Insert new entries
        if (agency_ids.length > 0) {
          const adminAgencyEntries = agency_ids.map((agencyId) => ({
            user_id: user_id,
            agency_id: agencyId,
          }));

          const { error: adminAgenciesError } = await supabaseAdmin
            .from("admin_agencies")
            .insert(adminAgencyEntries);

          if (adminAgenciesError) {
            console.error("Error updating admin_agencies:", adminAgenciesError);
          }
        }

        // Update primary agency in profile
        if (agency_ids.length > 0) {
          await supabaseAdmin
            .from("profiles")
            .update({ agency_id: agency_ids[0] })
            .eq("user_id", user_id);
        }
      }

      return new Response(
        JSON.stringify({ message: "User updated successfully", success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
