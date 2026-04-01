import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eukymrxxmvkchxfpjjuz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1a3ltcnh4bXZrY2h4ZnBqanV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzg1NTksImV4cCI6MjA5MDYxNDU1OX0.rtXAdsH4BDwRd4zBScoB-sleoQAPTeWPZsExBcM79Fc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
