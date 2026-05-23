// src/types/database.types.ts
// Generated from schema.sql – Apex Design Labs 3D Configurator

export type Database = {
  public: {
    Tables: {
      builders: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      base_models: {
        Row: {
          id: string;
          builder_id: string;
          name: string;
          base_price: number;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          builder_id: string;
          name: string;
          base_price?: number;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          builder_id?: string;
          name?: string;
          base_price?: number;
          slug?: string;
          created_at?: string;
        };
      };
      materials: {
        Row: {
          id: string;
          builder_id: string;
          category: string;
          name: string;
          price_modifier: number;
          hex_color: string | null;
          texture_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          builder_id: string;
          category: string;
          name: string;
          price_modifier?: number;
          hex_color?: string | null;
          texture_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          builder_id?: string;
          category?: string;
          name?: string;
          price_modifier?: number;
          hex_color?: string | null;
          texture_url?: string | null;
          created_at?: string;
        };
      };
      saved_configurations: {
        Row: {
          id: string;
          builder_id: string;
          model_id: string | null;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          selected_materials: Record<string, string>;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          builder_id: string;
          model_id?: string | null;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          selected_materials: Record<string, string>;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          builder_id?: string;
          model_id?: string | null;
          client_name?: string;
          client_email?: string;
          client_phone?: string | null;
          selected_materials?: Record<string, string>;
          total_price?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
