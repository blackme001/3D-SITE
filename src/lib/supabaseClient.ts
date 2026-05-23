// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseSetup = !!(supabaseUrl && supabaseAnonKey);

/**
 * Clean, strongly-typed Supabase client for Apex Design Labs.
 * Serves as the core database bridge for multi-tenant assets and high-ticket leads.
 */
export const supabaseClient = createClient(
  supabaseUrl || "https://exlzwydjljwobkkyvugr.supabase.co",
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHp3eWRqbGp3b2Jra3l2dWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MDI2NDcsImV4cCI6MjA2NTEyeSJ9.c5kQc75f3x9n7x578c044b-D2_Lw6qL9qgB1e_R-x58"
);

// Helpful database helpers
export type BuilderRow = Database["public"]["Tables"]["builders"]["Row"];
export type BaseModelRow = Database["public"]["Tables"]["base_models"]["Row"];
export type MaterialRow = Database["public"]["Tables"]["materials"]["Row"];
export type SavedConfigurationRow = Database["public"]["Tables"]["saved_configurations"]["Row"];
