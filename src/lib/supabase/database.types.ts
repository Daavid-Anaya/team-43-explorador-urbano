/**
 * Database type definitions for Supabase client.
 * Generated/maintained to match the actual database schema.
 */

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
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          latitude: number;
          longitude: number;
          radius_meters: number;
          points: number;
          photo_prompt: string;
          difficulty: string;
          estimated_minutes: number;
          city: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          latitude: number;
          longitude: number;
          radius_meters?: number;
          points: number;
          photo_prompt: string;
          difficulty: string;
          estimated_minutes: number;
          city: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          latitude?: number;
          longitude?: number;
          radius_meters?: number;
          points?: number;
          photo_prompt?: string;
          difficulty?: string;
          estimated_minutes?: number;
          city?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      completions: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          completed_at: string;
          latitude: number;
          longitude: number;
          accuracy_meters: number;
          evidence_path: string;
          points_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          completed_at?: string;
          latitude: number;
          longitude: number;
          accuracy_meters: number;
          evidence_path: string;
          points_awarded: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          completed_at?: string;
          latitude?: number;
          longitude?: number;
          accuracy_meters?: number;
          evidence_path?: string;
          points_awarded?: number;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          earned_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          earned_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          earned_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      submit_completion: {
        Args: {
          p_challenge_id: string;
          p_latitude: number;
          p_longitude: number;
          p_accuracy_meters: number;
          p_evidence_path: string;
        };
        Returns: {
          completion_id: string;
          points_awarded: number;
          total_points: number;
          new_badges: string[];
        };
      };
    };
    Enums: {
      challenge_category: 'Art' | 'History' | 'Nature' | 'Landmark' | 'Hidden Gem';
      challenge_difficulty: 'Easy' | 'Medium' | 'Hard';
      badge_type: 'First Completion' | 'City Explorer' | 'Challenge Master';
    };
  };
}
