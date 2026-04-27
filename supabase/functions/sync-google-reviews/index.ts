// Sync Google Place reviews into public.reviews
// Uses Places API (New): https://places.googleapis.com/v1/places/{PLACE_ID}
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function formatRelativeDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const placeId = Deno.env.get("GOOGLE_PLACE_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!apiKey || !placeId) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // rankPreference=NEWEST returns the 5 most recent reviews (instead of "most relevant")
    const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=en&reviews_sort=newest&rankPreference=NEWEST`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      return new Response(
        JSON.stringify({ error: "Google API error", status: res.status, body }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await res.json();
    const reviews: any[] = data?.reviews ?? [];

    let upserts = 0;
    for (const r of reviews) {
      const googleId: string = r.name; // e.g. "places/X/reviews/Y" — unique
      const text: string = r?.text?.text ?? r?.originalText?.text ?? "";
      if (!text) continue;

      const row = {
        google_review_id: googleId,
        source: "google",
        name: r?.authorAttribution?.displayName ?? "Google User",
        profile_photo_url: r?.authorAttribution?.photoUri ?? null,
        rating: r?.rating ?? 5,
        text,
        date: formatRelativeDate(r?.publishTime),
        review_time: r?.publishTime ?? null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("reviews")
        .upsert(row, { onConflict: "google_review_id" });

      if (error) {
        console.error("Upsert failed:", error.message, googleId);
      } else {
        upserts++;
      }
    }

    // Optionally update site_settings.general with rating + count
    if (typeof data?.rating === "number" && typeof data?.userRatingCount === "number") {
      try {
        const { data: settings } = await supabase
          .from("site_settings")
          .select("*")
          .eq("key", "general")
          .maybeSingle();
        if (settings) {
          const merged = {
            ...(settings.value ?? {}),
            google_rating: data.rating,
            review_count: data.userRatingCount,
          };
          await supabase
            .from("site_settings")
            .update({ value: merged })
            .eq("key", "general");
        }
      } catch (e) {
        console.warn("site_settings update skipped:", (e as Error).message);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        fetched: reviews.length,
        upserted: upserts,
        rating: data?.rating ?? null,
        userRatingCount: data?.userRatingCount ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
