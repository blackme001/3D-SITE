import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface Lead {
  id?: string;
  created_at?: string;
  full_name: string;
  email: string;
  project_location: string;
  configuration: Record<string, any>;
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Saves a configuration lead.
 * Pushes to `/api/leads` to trigger server-side database logging and email notifications.
 * If Supabase is not configured, it also saves to client-side localStorage as a fallback.
 */
export async function saveLead(lead: Omit<Lead, "id" | "created_at">) {
  let serverData: any = null;
  try {
    // Trigger server-side database insertion and email dispatch (real or simulated)
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(lead)
    });
    if (response.ok) {
      serverData = await response.json();
    }
  } catch (err) {
    console.error("Failed to POST lead to server API:", err);
  }

  // Client-side local storage fallback
  if (!isSupabaseConfigured || !serverData?.db_status || serverData.db_status === "skipped") {
    console.warn(
      "APEX BLUEPRINT: Supabase keys are not set up or server insert skipped. Saving configuration to LocalStorage fallback."
    );

    const localData = localStorage.getItem("apex_blueprint_leads") || "[]";
    const leads = JSON.parse(localData);

    const mockLead = {
      id: serverData?.id || `lead_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      ...lead,
    };

    leads.push(mockLead);
    localStorage.setItem("apex_blueprint_leads", JSON.stringify(leads));

    return { 
      success: true, 
      data: [mockLead], 
      source: "local_storage",
      email_status: serverData?.email_status || "simulated" 
    };
  }

  return { 
    success: true, 
    data: serverData, 
    source: "supabase",
    email_status: serverData.email_status 
  };
}

/**
 * Fetches leads from Supabase if configured, or falls back to client-side localStorage.
 */
export async function fetchLeads(): Promise<Lead[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        return data;
      }
      console.error("Supabase select error:", error);
    } catch (err) {
      console.error("Failed to fetch leads from Supabase:", err);
    }
  }

  // LocalStorage fallback
  if (typeof window !== "undefined") {
    const localData = localStorage.getItem("apex_blueprint_leads") || "[]";
    return JSON.parse(localData).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  return [];
}

/**
 * Deletes/archives a lead from Supabase or client-side localStorage.
 */
export async function deleteLead(leadId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      // If it doesn't look like a local mock lead ID
      if (!leadId.toString().startsWith("lead_")) {
        const { error } = await supabase
          .from("leads")
          .delete()
          .eq("id", leadId);
        
        if (!error) return true;
        console.error("Supabase delete error:", error);
      }
    } catch (err) {
      console.error("Failed to delete lead from Supabase:", err);
    }
  }

  // LocalStorage fallback
  if (typeof window !== "undefined") {
    const localData = localStorage.getItem("apex_blueprint_leads") || "[]";
    let leads = JSON.parse(localData);
    leads = leads.filter((l: any) => l.id.toString() !== leadId.toString());
    localStorage.setItem("apex_blueprint_leads", JSON.stringify(leads));
    return true;
  }
  return false;
}

