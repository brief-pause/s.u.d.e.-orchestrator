import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DUST_WEBHOOK_URL =
  "https://dust.tt/api/v1/w/oVtIBqNmLp/triggers/hooks/whs_5sQCZlZtoiq/esnPv502RVVxvn9QzUq7YUwD35OtVunMkTefIPSFsx3ayZ6vsi7fOacxZJUoHWUq";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_id } = await req.json();

    if (!project_id) {
      return new Response(JSON.stringify({ error: "project_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a Supabase admin client to read from the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the project's target URL
    const { data: project, error: projErr } = await supabase
      .from("discovery_projects")
      .select("url, name")
      .eq("id", project_id)
      .single();

    if (projErr || !project?.url) {
      return new Response(
        JSON.stringify({ error: "Project not found or missing URL" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch persona traits linked to this project
    const { data: personas } = await supabase
      .from("persona_snapshots")
      .select("name, traits")
      .eq("project_id", project_id);

    const personaTraits = (personas || []).map((p) => ({
      name: p.name,
      ...p.traits,
    }));

    // Callback URL — Dust sends results back here
    const callbackUrl = `${supabaseUrl}/functions/v1/sentinel-callback?project_id=${project_id}`;

    // Fire the POST to Dust
    const dustPayload = {
      url: project.url,
      persona_traits: JSON.stringify(personaTraits),
      callback_url: callbackUrl,
    };

    const dustResponse = await fetch(DUST_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dustPayload),
    });

    const dustBody = await dustResponse.text();

    // Update project status to 'simulating'
    await supabase
      .from("discovery_projects")
      .update({ status: "simulating" })
      .eq("id", project_id);

    return new Response(
      JSON.stringify({
        success: true,
        dust_status: dustResponse.status,
        dust_response: dustBody,
        callback_url: callbackUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
