import { createClient } from "@supabase/supabase-js";

// Hardcoded to website.smilz.net Supabase project (eukymrxxmvkchxfpjjuz).
// Do NOT switch to Lovable Cloud — user explicitly requires the existing DB.
const SUPABASE_URL = "https://eukymrxxmvkchxfpjjuz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1a3ltcnh4bXZrY2h4ZnBqanV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzg1NTksImV4cCI6MjA5MDYxNDU1OX0.rtXAdsH4BDwRd4zBScoB-sleoQAPTeWPZsExBcM79Fc";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. " +
    "Supabase features will not work until these are configured."
  );
}

export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder"
);
