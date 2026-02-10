export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      world_gold_prices: {
        Row: {
          id: string;
          price: number;
          previous_close: number | null;
          change: number | null;
          change_percent: number | null;
          high_24h: number | null;
          low_24h: number | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          price: number;
          previous_close?: number | null;
          change?: number | null;
          change_percent?: number | null;
          high_24h?: number | null;
          low_24h?: number | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          price?: number;
          previous_close?: number | null;
          change?: number | null;
          change_percent?: number | null;
          high_24h?: number | null;
          low_24h?: number | null;
          source?: string | null;
          created_at?: string;
        };
      };
      vn_gold_prices: {
        Row: {
          id: string;
          gold_type: string;
          brand: string;
          buy_price: number;
          sell_price: number;
          region: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gold_type: string;
          brand: string;
          buy_price: number;
          sell_price: number;
          region?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gold_type?: string;
          brand?: string;
          buy_price?: number;
          sell_price?: number;
          region?: string | null;
          source?: string | null;
          created_at?: string;
        };
      };
      exchange_rates: {
        Row: {
          id: string;
          usd_to_vnd: number;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          usd_to_vnd: number;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          usd_to_vnd?: number;
          source?: string | null;
          created_at?: string;
        };
      };
      world_gold_history: {
        Row: {
          id: string;
          price: number;
          open_price: number | null;
          high_price: number | null;
          low_price: number | null;
          close_price: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          price: number;
          open_price?: number | null;
          high_price?: number | null;
          low_price?: number | null;
          close_price?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          price?: number;
          open_price?: number | null;
          high_price?: number | null;
          low_price?: number | null;
          close_price?: number | null;
          created_at?: string;
        };
      };
      vn_gold_history: {
        Row: {
          id: string;
          gold_type: string;
          brand: string;
          buy_price: number;
          sell_price: number;
          region: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gold_type: string;
          brand: string;
          buy_price: number;
          sell_price: number;
          region?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gold_type?: string;
          brand?: string;
          buy_price?: number;
          sell_price?: number;
          region?: string | null;
          source?: string | null;
          created_at?: string;
        };
      };
      price_alerts: {
        Row: {
          id: string;
          user_id: string;
          telegram_chat_id: string;
          gold_type: string;
          brand: string | null;
          condition: string;
          target_price: number;
          is_active: boolean;
          triggered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          telegram_chat_id: string;
          gold_type: string;
          brand?: string | null;
          condition: string;
          target_price: number;
          is_active?: boolean;
          triggered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          telegram_chat_id?: string;
          gold_type?: string;
          brand?: string | null;
          condition?: string;
          target_price?: number;
          is_active?: boolean;
          triggered_at?: string | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          telegram_chat_id: string | null;
          telegram_username: string | null;
          daily_report_enabled: boolean;
          report_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          telegram_chat_id?: string | null;
          telegram_username?: string | null;
          daily_report_enabled?: boolean;
          report_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          telegram_chat_id?: string | null;
          telegram_username?: string | null;
          daily_report_enabled?: boolean;
          report_time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_latest_world_gold: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          price: number;
          previous_close: number | null;
          change: number | null;
          change_percent: number | null;
          high_24h: number | null;
          low_24h: number | null;
          source: string | null;
          created_at: string;
        }[];
      };
      get_latest_vn_gold: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          gold_type: string;
          brand: string;
          buy_price: number;
          sell_price: number;
          region: string | null;
          source: string | null;
          created_at: string;
        }[];
      };
      get_latest_exchange_rate: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          usd_to_vnd: number;
          source: string | null;
          created_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
