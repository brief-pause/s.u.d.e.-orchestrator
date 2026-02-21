import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function formatMarkdownReport(targetUrl: string, data: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push(`# AI Generated Market Analysis`);
  lines.push(`## Target: ${targetUrl}`);
  lines.push(`> Generated on ${new Date().toISOString()}\n`);

  // Peak Friction section
  const friction = (data.peak_friction ?? data.peakFriction ?? data.friction) as Record<string, unknown> | undefined;
  lines.push(`## Peak Friction`);
  if (friction && typeof friction === "object") {
    for (const [key, value] of Object.entries(friction)) {
      lines.push(`- **${key}**: ${typeof value === "object" ? JSON.stringify(value) : value}`);
    }
  } else {
    lines.push(`_No peak friction data available._`);
  }
  lines.push("");

  // Sentiment Radar section
  const sentiment = (data.sentiment_radar ?? data.sentimentRadar ?? data.sentiment) as Record<string, unknown> | undefined;
  lines.push(`## Sentiment Radar`);
  if (sentiment && typeof sentiment === "object") {
    lines.push(`| Metric | Score |`);
    lines.push(`|--------|-------|`);
    for (const [key, value] of Object.entries(sentiment)) {
      lines.push(`| ${key} | ${value} |`);
    }
  } else {
    lines.push(`_No sentiment radar data available._`);
  }
  lines.push("");

  // Raw data summary
  lines.push(`## Full Data`);
  lines.push("```json");
  lines.push(JSON.stringify(data, null, 2));
  lines.push("```");

  return lines.join("\n");
}

function sanitizeFilename(url: string): string {
  return url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9.-]/g, "_");
}

async function publishToGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  commitMessage: string,
  token: string
) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Check if file already exists (to get its sha for updates)
  let sha: string | undefined;
  const existing = await fetch(apiUrl, {
    headers: { Authorization: `token ${token}`, "User-Agent": "sentinel-callback" },
  });
  if (existing.ok) {
    const existingData = await existing.json();
    sha = existingData.sha;
  } else {
    await existing.text(); // consume body
  }

  const body: Record<string, string> = {
    message: commitMessage,
    content: btoa(unescape(encodeURIComponent(content))),
  };
  if (sha) body.sha = sha;

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "sentinel-callback",
    },
    body: JSON.stringify(body),
  });

  const resBody = await res.text();
  return { status: res.status, body: resBody };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("project_id");

    if (!projectId) {
      return new Response(JSON.stringify({ error: "project_id query param required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store Dust results as market_data on the project
    await supabase
      .from("discovery_projects")
      .update({ market_data: body, status: "complete" })
      .eq("id", projectId);

    // Fetch the project URL for the report filename
    const { data: project } = await supabase
      .from("discovery_projects")
      .select("url")
      .eq("id", projectId)
      .single();

    const targetUrl = project?.url || projectId;
    const safeFilename = sanitizeFilename(targetUrl);
    const filePath = `reports/${safeFilename}.md`;
    const markdown = formatMarkdownReport(targetUrl, body);
    const commitMessage = `AI Generated Market Analysis for ${targetUrl}`;

    // Publish to GitHub
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    let githubResult = null;

    if (githubToken) {
      // Extract owner/repo from the GitHub token's associated repo
      // Users should set GITHUB_OWNER and GITHUB_REPO secrets, or we fall back to defaults
      const owner = Deno.env.get("GITHUB_OWNER") || "user";
      const repo = Deno.env.get("GITHUB_REPO") || "repo";

      githubResult = await publishToGitHub(owner, repo, filePath, markdown, commitMessage, githubToken);
    }

    return new Response(
      JSON.stringify({ success: true, github: githubResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
