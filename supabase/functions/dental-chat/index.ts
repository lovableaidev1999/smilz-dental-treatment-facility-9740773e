// Dental chatbot edge function — uses OpenAI API directly + logs to Supabase.
// Scope: dentistry only, grounded in Smilz Dental clinic info.
// Logs each turn to chat_conversations + chat_messages with light NLP for
// language / locality / intent / service so admins can mine for SEO/GEO/leads.
// All DB writes wrapped in try/catch — never blocks the chat reply.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CLINIC = {
  name: "Smilz Dental Treatment Facility",
  doctor: "Dr. Dibyendu Dutta (25+ years experience)",
  address: "21, Garia Park, Opposite Garia Park Club, Near Andrews College, Garia, Kolkata, West Bengal 700084",
  phone: "8961775554",
  whatsapp: "+91 8961775554",
  email: "dr.d.dutta@gmail.com",
  website: "https://smilz.net",
  hours: "Monday–Saturday: 9:00 AM – 1:00 PM and 5:00 PM – 9:00 PM. Closed Sunday.",
  services: [
    "Dental Implants (incl. stent-guided for complex cases)",
    "Painless Root Canal Treatment",
    "Orthodontics — conventional braces, clear aligners, Invisalign, adult orthodontics",
    "Smile Designing with virtual preview",
    "Tooth Whitening",
    "Scaling & Polishing",
    "Pediatric Dentistry",
    "Crown & Bridge, Cosmetic & Restorative Dentistry",
    "Oral & Dental Surgery",
  ],
};

const SYSTEM_PROMPT = `You are "Smilz Assistant", a friendly dental information assistant for ${CLINIC.name} in Garia, Kolkata.

STRICT SCOPE:
- Only answer questions related to dentistry, oral health, dental procedures, and the clinic.
- For non-dental topics, politely refuse and redirect: "I can only help with dental questions. For other queries please contact the clinic."
- NEVER give a clinical diagnosis, prescription, dosage, or specific treatment plan. Provide general educational information only.
- For any clinical question or symptom, ALWAYS recommend an in-person consultation with ${CLINIC.doctor} at ${CLINIC.name}.

CLINIC FACTS (use these exactly):
- Name: ${CLINIC.name}
- Doctor: ${CLINIC.doctor}
- Address: ${CLINIC.address}
- Phone / WhatsApp: ${CLINIC.whatsapp}
- Hours: ${CLINIC.hours}
- Website: ${CLINIC.website}
- Services offered: ${CLINIC.services.join("; ")}

STYLE:
- Be warm, concise, and reassuring. Use short paragraphs and bullet points.
- After answering any clinical or appointment question, end with a clear hand-off line such as:
  "For personalized advice or to book an appointment, please contact us on WhatsApp at +91 8961775554 or call 8961775554."
- Do NOT invent prices, doctors, or services not listed above. If unsure, say so and direct the visitor to contact the clinic.
- Reply in the same language the visitor uses (English, Hindi, or Bengali).`;

/* ------------------------- light NLP helpers ------------------------- */

const LOCALITIES = [
  "Garia","Sonarpur","Narendrapur","Patuli","Baghajatin","Jadavpur","Tollygunge",
  "Bansdroni","Behala","Rajpur","Kasba","Ballygunge","Gariahat","Park Circus",
  "Salt Lake","New Town","Howrah","Dum Dum","Lake Town","Ruby","Santoshpur",
  "Mukundapur","Anandapur","Kalikapur","Haltu","Jodhpur Park","Hiland Park",
  "Ajoy Nagar","Survey Park","Ranikuthi","Kudghat","New Alipore","Alipore",
  "Chetla","Bhowanipore","Tangra","Topsia","Beleghata","Phoolbagan","Sealdah",
  "Esplanade","Park Street","Shyambazar","Maniktala","Ultadanga","Kankurgachi",
  "Picnic Garden","Tiljala","Kolkata",
];

const SERVICE_KEYWORDS: Record<string, string[]> = {
  implants:   ["implant","implants","stent guided","tooth replacement"],
  braces:     ["brace","braces","aligner","aligners","invisalign","orthodontic","orthodontics"],
  rct:        ["root canal","rct","painless root canal","endodontic"],
  whitening:  ["whitening","bleach","bleaching","stain","stains"],
  scaling:    ["scaling","polishing","cleaning","tartar","plaque"],
  cosmetic:   ["smile design","cosmetic","veneer","veneers","makeover"],
  pediatric:  ["child","kid","kids","pediatric","paediatric","baby teeth","milk teeth"],
  crown:      ["crown","bridge","cap","caps"],
  surgery:    ["wisdom tooth","extraction","surgery","oral surgery"],
};

const INTENT_KEYWORDS: Record<string, RegExp> = {
  pricing:  /\b(price|cost|charge|fee|fees|rate|rates|how much|kitna|koto|kemon|estimate|quote)\b/i,
  booking:  /\b(book|appointment|schedule|visit|consult|consultation|come in|slot|when can)\b/i,
  symptom:  /\b(pain|hurts|hurt|swell|swollen|bleeding|bleed|sensitive|cavity|decay|broken|loose|infection|abscess|toothache)\b/i,
  service:  /\b(treatment|service|procedure|do you offer|do you do)\b/i,
};

const detectLanguage = (text: string): string | null => {
  if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali
  if (/[\u0900-\u097F]/.test(text)) return "hi"; // Devanagari
  if (/[a-zA-Z]/.test(text)) return "en";
  return null;
};

const detectLocality = (text: string): string | null => {
  const lower = text.toLowerCase();
  for (const loc of LOCALITIES) {
    if (lower.includes(loc.toLowerCase())) return loc;
  }
  return null;
};

const detectService = (text: string): string | null => {
  const lower = text.toLowerCase();
  for (const [svc, kws] of Object.entries(SERVICE_KEYWORDS)) {
    if (kws.some((k) => lower.includes(k))) return svc;
  }
  return null;
};

const detectIntent = (text: string): string | null => {
  for (const [intent, re] of Object.entries(INTENT_KEYWORDS)) {
    if (re.test(text)) return intent;
  }
  return "other";
};

const detectLead = (text: string, intent: string | null): boolean => {
  if (intent === "pricing" || intent === "booking") return true;
  // phone number volunteered (Indian 10-digit or +91)
  if (/(\+?91[\s-]?)?[6-9]\d{9}/.test(text.replace(/\s+/g, ""))) return true;
  return false;
};

const sha256 = async (s: string): Promise<string> => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

/* ------------------------------ handler ------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : null;
    const sessionId: string | null = typeof body?.session_id === "string" ? body.session_id : null;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleaned = messages
      .slice(-20)
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

    /* --------- call OpenAI --------- */
    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 500,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleaned],
      }),
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      console.error("OpenAI error", openaiResp.status, errText);
      return new Response(
        JSON.stringify({ error: "AI provider error", status: openaiResp.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await openaiResp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ??
      "I'm sorry, I couldn't generate a response. Please contact the clinic on WhatsApp at +91 8961775554.";

    /* --------- log to Supabase (best-effort, non-blocking) --------- */
    if (sessionId) {
      (async () => {
        try {
          const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
          const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          if (!SUPABASE_URL || !SERVICE_ROLE) return;

          const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
            auth: { persistSession: false },
          });

          const lastUserMsg = [...cleaned].reverse().find((m: any) => m.role === "user");
          const userText = lastUserMsg?.content ?? "";

          const language = detectLanguage(userText);
          const locality = detectLocality(userText);
          const service = detectService(userText);
          const intent = detectIntent(userText);
          const isLead = detectLead(userText, intent);

          const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
          const ipHash = ip ? await sha256(ip) : null;
          const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;

          // Find existing conversation by session_id
          const { data: existing } = await sb
            .from("chat_conversations")
            .select("id, message_count, detected_locality, detected_service, language, is_lead")
            .eq("session_id", sessionId)
            .maybeSingle();

          let convId: string | null = existing?.id ?? null;

          if (!convId) {
            const { data: inserted, error: insErr } = await sb
              .from("chat_conversations")
              .insert({
                session_id: sessionId,
                language,
                detected_locality: locality,
                detected_service: service,
                detected_intent: intent,
                is_lead: isLead,
                user_agent: userAgent,
                ip_hash: ipHash,
                message_count: 0,
              })
              .select("id")
              .maybeSingle();
            if (insErr) { console.warn("conv insert", insErr.message); return; }
            convId = inserted?.id ?? null;
          } else {
            await sb
              .from("chat_conversations")
              .update({
                last_message_at: new Date().toISOString(),
                message_count: (existing?.message_count ?? 0) + 2,
                language: existing?.language ?? language,
                detected_locality: existing?.detected_locality ?? locality,
                detected_service: existing?.detected_service ?? service,
                detected_intent: intent,
                is_lead: existing?.is_lead || isLead,
              })
              .eq("id", convId);
          }

          if (convId) {
            await sb.from("chat_messages").insert([
              { conversation_id: convId, role: "user", content: userText },
              { conversation_id: convId, role: "assistant", content: reply },
            ]);

            if (!existing) {
              await sb
                .from("chat_conversations")
                .update({ message_count: 2 })
                .eq("id", convId);
            }
          }
        } catch (e) {
          console.warn("chat log failed (non-fatal):", String(e));
        }
      })();
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("dental-chat error", err);
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
