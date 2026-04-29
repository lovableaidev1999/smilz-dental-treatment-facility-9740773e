// Dental chatbot edge function — uses OpenAI API directly.
// Scope: dentistry only, grounded in Smilz Dental clinic info.
// No DB writes — conversation state lives in the client.

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
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Sanitize: keep only role + content, cap length
    const cleaned = messages
      .slice(-20)
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

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
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...cleaned,
        ],
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
