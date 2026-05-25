import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://pokfcklwtcpsisaewime.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const supabaseConfigMessage =
  "Configura VITE_SUPABASE_PUBLISHABLE_KEY o VITE_SUPABASE_ANON_KEY en .env o .env.local para leer y guardar datos en Supabase.";
