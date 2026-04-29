// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CLINIC = {
  name: "Smilz Dental Treatment Facility",
  doctor: "Dr. Dibyendu Dutta (BDS, MDS — practicing since 1999)",
  address: "21, Garia Park, Opposite Garia Park Club, Near Andrews College, Garia, Kolkata, West Bengal 700084",
  phone: "+91 8961775554",
  whatsapp: "https://wa.me/918961775554",
  emergency: "+91 9831070248",
  hours: "Mon–Sat: 9:00 AM – 1:00 PM and 5:00 PM – 9:00 PM. Closed Sunday.",
  website: "https://smilz.net",
  services: [
    "Dental Implants (incl. stent-guided)",
    "Painless Root Canal Treatment",
    "Orthodontics — Conventional Braces, Clear Aligners, Invisalign, Adult & Skeletal corrections",
    "Smile Designing with virtual preview",
    "Professional Tooth Whitening",
    "Scaling & Polishing",
    "Pediatric Dentistry",
    "Crown & Bridge, Restorative & Cosmetic Dentistry",
  ],
};

function buildSystemPrompt(extraContext: string): string {
  return `You are "Smilz Assistant", the friendly virtual dental assistant for ${CLINIC.name} in Garia, Kolkata, India.

# CRITICAL RULES
1. **Dentistry only.** You may discuss teeth, gums, oral health, dental procedures, costs (in general ranges), oral hygiene, and clinic-related questions. If asked anything off-topic (politics, coding, general chitchat, other medical fields), politely reply: "I can only help with dental questions. Is there something about your teeth or oral health I can assist with?" and stop.
2. **Never diagnose or prescribe.** Give educational info only. For any clinical concern (pain, swelling, bleeding, decay, treatment recommendation), you MUST direct the visitor to consult ${CLINIC.doctor} at ${CLINIC.name}.
3. **Always end every reply with a clear next step** that points to the clinic — book an appointment, WhatsApp, or call. Use this exact closing phrase format: "👉 For personalised advice, please WhatsApp us at ${CLINIC.phone} or visit ${CLINIC.name}, Garia."
4. **Be concise.** 2–4 short paragraphs max. Use bullet lists where helpful. Plain language, no jargon dumps.
5. **Use the clinic's own info first** (below). If the visitor asks about something not covered, give safe general dental knowledge, then redirect to the clinic.
6. **Do not invent prices.** If asked exact cost, say prices vary by case and invite them to contact the clinic for a personalised quote.
7. **Language:** Match the user's language. If they write in Bengali or Hindi, reply in the same. Default to English.

# CLINIC FACTS
- Name: ${CLINIC.name}
- Doctor: ${CLINIC.doctor}
- Address: ${CLINIC.address}
- Phone / WhatsApp: ${CLINIC.phone}
- Emergency: ${CLINIC.emergency}
- Hours: ${CLINIC.hours}
- Website: ${CLINIC.website}

# SERVICES OFFERED
${CLINIC.services.map((s) => `- ${s}`).join("\n")}

# WEBSITE CONTENT (recent)
${extraContext || "(none)"}

Stay warm, professional, and brief. Always close with the clinic CTA.`;
}

async function fetchSiteContext(supabase: any): Promise<string> {
  try {
    const [{ data: blogs }, { data: services }] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("title, excerpt, slug")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(15),
      supabase
        .from("services")
        .select("title, short_description, slug")
        .eq("is_published", true)
        .limit(20),
    ]);
    const lines: string[] = [];
    if (services?.length) {
      lines.push("## Services on website:");
      for (const s of services) {
        lines.push(`- ${s.title}: ${s.short_description ?? ""} (/services/${s.slug})`);
      }
    }
    if (blogs?.length) {
      lines.push("\n## Recent blog posts:");
      for (const b of blogs) {
        lines.push(`- ${b.title}: ${(b.excerpt ?? "").slice(0, 160)} (/blog/${b.slug})`);
      }
    }
    return lines.join("\n");
  } catch (e) {
    console.warn("fetchSiteContext failed:", e);
    return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const sessionId: string = body.session_id;
    const messages: Array<{ role: "user" | "assistant"; content: string }> = body.messages ?? [];

    if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Trim each message and cap length
    const cleanMessages = messages
      .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
      .slice(-12);

    const lastUserMsg = [...cleanMessages].reverse().find((m) => m.role === "user")?.content ?? "";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const siteContext = await fetchSiteContext(supabase);
    const systemPrompt = buildSystemPrompt(siteContext);

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...cleanMessages],
        temperature: 0.5,
        max_tokens: 600,
      }),
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      console.error("OpenAI error", openaiResp.status, errText);
      const friendly =
        openaiResp.status === 429
          ? "Our assistant is busy right now. Please try again in a moment, or message us on WhatsApp."
          : openaiResp.status === 401
          ? "AI service is not configured correctly. Please contact us on WhatsApp."
          : "Something went wrong. Please try again or contact us on WhatsApp.";
      return new Response(JSON.stringify({ error: friendly, status: openaiResp.status }), {
        status: openaiResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await openaiResp.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? "";

    // Persist to DB (best-effort, non-blocking failures)
    try {
      // Upsert conversation
      const { data: convo } = await supabase
        .from("chatbot_conversations")
        .upsert(
          {
            session_id: sessionId,
            last_message_at: new Date().toISOString(),
            visitor_meta: {
              ua: req.headers.get("user-agent") ?? "",
              referer: req.headers.get("referer") ?? "",
            },
          },
          { onConflict: "session_id" },
        )
        .select("id")
        .maybeSingle();

      if (convo?.id) {
        await supabase.from("chatbot_messages").insert([
          { conversation_id: convo.id, role: "user", content: lastUserMsg },
          { conversation_id: convo.id, role: "assistant", content: reply },
        ]);
      }
    } catch (logErr) {
      console.warn("Logging failed:", logErr);
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dental-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
