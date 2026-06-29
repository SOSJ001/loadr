export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          assigned_driver_id: string | null;
          assigned_vehicle_id: string | null;
          company_id: string;
          completed_at: string | null;
          created_at: string;
          dropoff_address: string;
          dropoff_lat: number;
          dropoff_lng: number;
          fuel_cost: number | null;
          has_return_leg: boolean | null;
          id: string;
          job_value: number | null;
          notes: string | null;
          pickup_address: string;
          pickup_lat: number;
          pickup_lng: number;
          reference: string;
          return_leg_empty: boolean | null;
          scheduled_at: string;
          started_at: string | null;
          status: string;
        };
        Insert: {
          assigned_driver_id?: string | null;
          assigned_vehicle_id?: string | null;
          company_id: string;
          completed_at?: string | null;
          created_at?: string;
          dropoff_address: string;
          dropoff_lat: number;
          dropoff_lng: number;
          fuel_cost?: number | null;
          has_return_leg?: boolean | null;
          id?: string;
          job_value?: number | null;
          notes?: string | null;
          pickup_address: string;
          pickup_lat: number;
          pickup_lng: number;
          reference?: string;
          return_leg_empty?: boolean | null;
          scheduled_at: string;
          started_at?: string | null;
          status?: string;
        };
        Update: {
          assigned_driver_id?: string | null;
          assigned_vehicle_id?: string | null;
          company_id?: string;
          completed_at?: string | null;
          created_at?: string;
          dropoff_address?: string;
          dropoff_lat?: number;
          dropoff_lng?: number;
          fuel_cost?: number | null;
          has_return_leg?: boolean | null;
          id?: string;
          job_value?: number | null;
          notes?: string | null;
          pickup_address?: string;
          pickup_lat?: number;
          pickup_lng?: number;
          reference?: string;
          return_leg_empty?: boolean | null;
          scheduled_at?: string;
          started_at?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      job_status_history: {
        Row: {
          attachment_url: string | null;
          changed_by: string;
          company_id: string;
          created_at: string;
          id: string;
          job_id: string;
          new_status: string;
          note: string | null;
          old_status: string | null;
        };
        Insert: {
          attachment_url?: string | null;
          changed_by: string;
          company_id: string;
          created_at?: string;
          id?: string;
          job_id: string;
          new_status: string;
          note?: string | null;
          old_status?: string | null;
        };
        Update: {
          attachment_url?: string | null;
          changed_by?: string;
          company_id?: string;
          created_at?: string;
          id?: string;
          job_id?: string;
          new_status?: string;
          note?: string | null;
          old_status?: string | null;
        };
        Relationships: [];
      };
      proof_of_delivery: {
        Row: {
          blockchain_confirmed: boolean;
          blockchain_hash: string | null;
          company_id: string;
          completed_at: string;
          created_at: string;
          driver_id: string;
          file_url: string;
          gps_lat: number | null;
          gps_lng: number | null;
          id: string;
          job_id: string;
          recipient_name: string | null;
          type: string;
        };
        Insert: {
          blockchain_confirmed?: boolean;
          blockchain_hash?: string | null;
          company_id: string;
          completed_at: string;
          created_at?: string;
          driver_id: string;
          file_url: string;
          gps_lat?: number | null;
          gps_lng?: number | null;
          id?: string;
          job_id: string;
          recipient_name?: string | null;
          type: string;
        };
        Update: {
          blockchain_confirmed?: boolean;
          blockchain_hash?: string | null;
          company_id?: string;
          completed_at?: string;
          created_at?: string;
          driver_id?: string;
          file_url?: string;
          gps_lat?: number | null;
          gps_lng?: number | null;
          id?: string;
          job_id?: string;
          recipient_name?: string | null;
          type?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          company_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          make: string | null;
          model: string | null;
          registration: string;
          type: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          make?: string | null;
          model?: string | null;
          registration: string;
          type: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          make?: string | null;
          model?: string | null;
          registration?: string;
          type?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          company_id: string;
          created_at: string;
          id: string;
          is_read: boolean;
          job_id: string | null;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body: string;
          company_id: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          job_id?: string | null;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string;
          company_id?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          job_id?: string | null;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          company_id: string;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          invite_expires_at: string | null;
          invite_token: string | null;
          last_active_at: string | null;
          phone: string | null;
          removed_at: string | null;
          role: string;
          status: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          invite_expires_at?: string | null;
          invite_token?: string | null;
          last_active_at?: string | null;
          phone?: string | null;
          removed_at?: string | null;
          role: string;
          status?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          invite_expires_at?: string | null;
          invite_token?: string | null;
          last_active_at?: string | null;
          phone?: string | null;
          removed_at?: string | null;
          role?: string;
          status?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          companies_house_number: string | null;
          created_at: string;
          email: string;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          phone: string | null;
          plan: string;
          registered_name: string | null;
          stripe_customer_id: string | null;
          verification_status: string;
        };
        Insert: {
          companies_house_number?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          phone?: string | null;
          plan?: string;
          registered_name?: string | null;
          stripe_customer_id?: string | null;
          verification_status?: string;
        };
        Update: {
          companies_house_number?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          phone?: string | null;
          plan?: string;
          registered_name?: string | null;
          stripe_customer_id?: string | null;
          verification_status?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
