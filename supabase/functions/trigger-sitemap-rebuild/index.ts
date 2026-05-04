// Trigger a sitemap-only rebuild & deploy via GitHub Actions repository_dispatch.
// Requires secrets: GITHUB_DISPATCH_TOKEN, GITHUB_REPO (e.g. "owner/repo")
// Caller must be an authenticated admin user (verify_jwt = true by default).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = Deno.env.get("GITHUB_DISPATCH_TOKEN");
    const repo = Deno.env.get("GITHUB_REPO");
    if (!token || !repo) {
      return new Response(
        JSON.stringify({ error: "Server missing GITHUB_DISPATCH_TOKEN or GITHUB_REPO" }),
        { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } },
      );
    }

    const r = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "smilz-cms",
      },
      body: JSON.stringify({
        event_type: "sitemap-updated",
        client_payload: { triggered_at: new Date().toISOString() },
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(
        JSON.stringify({ error: `GitHub dispatch failed: ${r.status} ${txt}` }),
        { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        actionsUrl: `https://github.com/${repo}/actions/workflows/rebuild-sitemap.yml`,
      }),
      { headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  }
});
