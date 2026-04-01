import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eukymrxxmvkchxfpjjuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_secret_P7UluC1FkRC3PLA_qf9blg_6GPHQ0yQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
