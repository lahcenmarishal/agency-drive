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
  agency_id?: string;
  agency_ids?: string[];
  plan_key?: string;
  billing_interval?: string;
}

const PLAN_LIMITS: Record<string, { maxVehicles: number; maxUsers: number; maxAgencies: number; monthlyPrice: number; yearlyPrice: number }> = {
  basic: { maxVehicles: 10, maxUsers: 3, maxAgencies: 1, monthlyPrice: 29, yearlyPrice: 290 },
  pro: { maxVehicles: 50, maxUsers: 10, maxAgencies: 3, monthlyPrice: 59, yearlyPrice: 590 },
  enterprise: { maxVehicles: -1, maxUsers: -1, maxAgencies: -1, monthlyPrice: 99, yearlyPrice: 990 },
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

    const { email, password, full_name, role, agency_id, agency_ids, plan_key, billing_interval }: CreateUserRequest = await req.json();

    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPassword = (password || "").trim();
    const normalizedFullName = (full_name || "").trim();

    // Determine which agency IDs to use
    const agencyIdsToUse = agency_ids && agency_ids.length > 0 ? agency_ids : (agency_id ? [agency_id] : []);

    // Validate input
    if (!normalizedEmail || !normalizedPassword || !normalizedFullName || !role || agencyIdsToUse.length === 0) {
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

      // Verify admin has access to the target agency (check admin_agencies + profile)
      const targetAgencyId = agencyIdsToUse[0];
      if (agencyIdsToUse.length !== 1) {
        return new Response(
          JSON.stringify({ error: "Agents must be assigned to exactly one agency" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check admin_agencies table first, then fall back to profile.agency_id
      const { data: adminAgencies } = await supabaseAdmin
        .from("admin_agencies")
        .select("agency_id")
        .eq("user_id", requestingUser.id);

      const { data: adminProfile } = await supabaseAdmin
        .from("profiles")
        .select("agency_id")
        .eq("user_id", requestingUser.id)
        .single();

      const accessibleAgencyIds = (adminAgencies || []).map((a: any) => a.agency_id);
      if (adminProfile?.agency_id && !accessibleAgencyIds.includes(adminProfile.agency_id)) {
        accessibleAgencyIds.push(adminProfile.agency_id);
      }

      if (!accessibleAgencyIds.includes(targetAgencyId)) {
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
      (user) => user.email?.toLowerCase() === normalizedEmail
    );

    if (userExists) {
      return new Response(
        JSON.stringify({ error: "Un utilisateur avec cet email existe déjà" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: normalizedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: normalizedFullName,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Force password update to guarantee credentials are stored as expected
    const { error: passwordSyncError } = await supabaseAdmin.auth.admin.updateUserById(newUser.user.id, {
      password: normalizedPassword,
      email: normalizedEmail,
      user_metadata: {
        full_name: normalizedFullName,
      },
    });

    if (passwordSyncError) {
      console.error("Error syncing credentials:", passwordSyncError);
      return new Response(
        JSON.stringify({ error: "Impossible de finaliser les identifiants du compte" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Use the first agency for the profile (primary agency)
    const primaryAgencyId = agencyIdsToUse[0];

    // Ensure profile exists (upsert)
    const { error: profileUpsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: newUser.user.id,
          full_name: normalizedFullName,
          email: normalizedEmail,
          agency_id: primaryAgencyId,
        },
        { onConflict: "user_id" }
      );

    if (profileUpsertError) {
      console.error("Error upserting profile:", profileUpsertError);
    }

    // For admins, create entries in admin_agencies table for each agency
    if (role === "admin" && agencyIdsToUse.length > 0) {
      const adminAgencyEntries = agencyIdsToUse.map((agencyId) => ({
        user_id: newUser.user.id,
        agency_id: agencyId,
      }));

      const { error: adminAgenciesError } = await supabaseAdmin
        .from("admin_agencies")
        .insert(adminAgencyEntries);

      if (adminAgenciesError) {
        console.error("Error inserting admin_agencies:", adminAgenciesError);
      }
    }

    // For admins created by super admin, create subscription if plan specified
    if (role === "admin" && plan_key && requesterRole.role === "super_admin") {
      const planLimits = PLAN_LIMITS[plan_key] || PLAN_LIMITS.basic;
      const interval = billing_interval || "monthly";
      const amount = interval === "yearly" ? planLimits.yearlyPrice : planLimits.monthlyPrice;
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (interval === "yearly" ? 12 : 1));

      const { error: subError } = await supabaseAdmin
        .from("tenant_subscriptions")
        .upsert({
          agency_id: primaryAgencyId,
          plan_name: plan_key,
          status: "active",
          billing_interval: interval,
          max_vehicles: planLimits.maxVehicles,
          max_users: planLimits.maxUsers,
          max_agencies: planLimits.maxAgencies,
          amount,
          currency: "usd",
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
        }, { onConflict: "agency_id" });

      if (subError) {
        console.error("Error creating subscription:", subError);
      }
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
