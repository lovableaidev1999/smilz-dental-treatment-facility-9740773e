// Triggers GitHub Actions rebuild via repository_dispatch.
// Secrets used (never hardcoded): GITHUB_DISPATCH_TOKEN, GITHUB_REPO
//
// NOTE on auth: the admin website lives on a different Supabase project than
// this edge function (Lovable Cloud). We can't validate the website's user JWT
// here. Defense-in-depth: require *any* Authorization header (so the function
// can't be hit anonymously / by a random scraper) and rely on the admin route
// being gated client-side. The GitHub PAT itself stays server-side regardless.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Require an Authorization header (anon key is acceptable).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let requestedBy = "unknown";
    try {
      const body = await req.json();
      if (body && typeof body.requestedBy === "string") {
        requestedBy = body.requestedBy.slice(0, 200);
      }
    } catch {
      // body optional
    }

    const githubToken = Deno.env.get("GITHUB_DISPATCH_TOKEN");
    const githubRepo = Deno.env.get("GITHUB_REPO");
    if (!githubToken || !githubRepo) {
      return new Response(
        JSON.stringify({ error: "Server not configured (missing GitHub secrets)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[trigger-rebuild] requestedBy="${requestedBy}" → ${githubRepo}`);

    const ghRes = await fetch(
      `https://api.github.com/repos/${githubRepo}/dispatches`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${githubToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "smilz-cms-trigger",
        },
        body: JSON.stringify({
          event_type: "content-updated",
          client_payload: {
            triggered_by: requestedBy,
            triggered_at: new Date().toISOString(),
          },
        }),
      },
    );

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      console.error(`[trigger-rebuild] GitHub API error ${ghRes.status}: ${errText}`);
      return new Response(
        JSON.stringify({
          error: "GitHub dispatch failed",
          status: ghRes.status,
          details: errText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Rebuild triggered",
        repo: githubRepo,
        actionsUrl: `https://github.com/${githubRepo}/actions`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[trigger-rebuild] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
