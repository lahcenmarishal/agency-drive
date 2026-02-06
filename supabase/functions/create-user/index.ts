import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "agent";
  agency_id: string;
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

    // Check if the requesting user has permission
    const { data: requesterRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .single();

    if (!requesterRole) {
      return new Response(
        JSON.stringify({ error: "Role not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, full_name, role, agency_id }: CreateUserRequest = await req.json();

    // Validate input
    if (!email || !password || !full_name || !role || !agency_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Permission checks
    if (requesterRole.role === "super_admin") {
      // Super admin can create admin or agent for any agency
      if (!["admin", "agent"].includes(role)) {
        return new Response(
          JSON.stringify({ error: "Invalid role" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (requesterRole.role === "admin") {
      // Admin can only create agents in their own agency
      if (role !== "agent") {
        return new Response(
          JSON.stringify({ error: "Admins can only create agent accounts" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify admin belongs to the same agency
      const { data: adminProfile } = await supabaseAdmin
        .from("profiles")
        .select("agency_id")
        .eq("user_id", requestingUser.id)
        .single();

      if (adminProfile?.agency_id !== agency_id) {
        return new Response(
          JSON.stringify({ error: "Cannot create users for other agencies" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      (user) => user.email === email
    );

    if (userExists) {
      return new Response(
        JSON.stringify({ error: "Un utilisateur avec cet email existe déjà" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure exactly one role row for the user
    const { error: deleteRolesError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", newUser.user.id);

    if (deleteRolesError) {
      console.error("Error cleaning existing roles:", deleteRolesError);
    }

    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role });

    if (roleInsertError) {
      console.error("Error inserting role:", roleInsertError);
    }

    // Ensure profile exists (upsert)
    const { error: profileUpsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: newUser.user.id,
          full_name,
          email,
          agency_id,
        },
        { onConflict: "user_id" }
      );

    if (profileUpsertError) {
      console.error("Error upserting profile:", profileUpsertError);
    }

    return new Response(
      JSON.stringify({ 
        message: "User created successfully", 
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
