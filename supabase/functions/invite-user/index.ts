import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const getRedirectUrl = (req: Request, supabaseUrl: string) => {
  const origin = req.headers.get("origin");

  if (origin) {
    return `${origin.replace(/\/$/, "")}/auth`;
  }

  return `${supabaseUrl.replace(/\/$/, "")}/auth`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment configuration");
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error("Only admins can invite users");
    }

    let body: { email?: string; role?: string } = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const role = typeof body.role === "string" ? body.role : "user";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("A valid email is required");
    }

    if (!["admin", "user"].includes(role)) {
      throw new Error("Invalid role selected");
    }

    const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      throw new Error("Unable to verify whether the user already exists");
    }

    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      const { error: upsertError } = await adminClient
        .from("user_roles")
        .upsert(
          {
            user_id: existingUser.id,
            role: role,
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        console.error("Error assigning role to existing user:", upsertError);
        throw new Error("Failed to assign role to existing user");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Role "${role}" assigned to existing user ${email}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: getRedirectUrl(req, supabaseUrl),
    });

    if (inviteError) {
      throw inviteError;
    }

    if (inviteData.user) {
      const { error: insertError } = await adminClient.from("user_roles").insert({
        user_id: inviteData.user.id,
        role: role,
      });

      if (insertError) {
        console.error("Error assigning role:", insertError);
        throw new Error("User was invited but role assignment failed");
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `Invitation sent to ${email}` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Error:", error);

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
