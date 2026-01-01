import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ulhmtigqpujdqmzzpczk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsaG10aWdxcHVqZHFtenpwY3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjMyNjksImV4cCI6MjA3NzgzOTI2OX0.2prSdGLs3iTsvzFjOd5uC-Udfk06yN-50b1TX-bS0qs';


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          schedule: string;
          coach: string;
          max_players: number;
          current_players: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          schedule?: string;
          coach: string;
          max_players?: number;
          current_players?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          schedule?: string;
          coach?: string;
          max_players?: number;
          current_players?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          position: string;
          group_id: string | null;
          birth_date: string | null;
          emergency_contact: string;
          join_date: string;
          jersey_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          position: string;
          group_id?: string | null;
          birth_date?: string | null;
          emergency_contact?: string;
          join_date?: string;
          jersey_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          position?: string;
          group_id?: string | null;
          birth_date?: string | null;
          emergency_contact?: string;
          join_date?: string;
          jersey_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          player_id: string;
          amount: number;
          month: string;
          year: number;
          status: 'paid' | 'pending';
          due_date: string;
          paid_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          player_id: string;
          amount?: number;
          month: string;
          year: number;
          status?: 'paid' | 'pending';
          due_date: string;
          paid_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          player_id?: string;
          amount?: number;
          month?: string;
          year?: number;
          status?: 'paid' | 'pending';
          due_date?: string;
          paid_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}