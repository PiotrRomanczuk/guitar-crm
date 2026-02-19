export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deletion_requested_at: string | null
          deletion_scheduled_for: string | null
          email: string
          failed_login_attempts: number
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean
          is_admin: boolean
          is_development: boolean
          is_shadow: boolean | null
          is_student: boolean
          is_teacher: boolean
          last_name: string | null
          last_sign_in_at: string | null
          lead_source: string | null
          locked_until: string | null
          notes: string | null
          onboarding_completed: boolean
          phone: string | null
          sign_in_count: number
          status_changed_at: string | null
          student_status: Database["public"]["Enums"]["student_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          deletion_scheduled_for?: string | null
          email: string
          failed_login_attempts?: number
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean
          is_development?: boolean
          is_shadow?: boolean | null
          is_student?: boolean
          is_teacher?: boolean
          last_name?: string | null
          last_sign_in_at?: string | null
          lead_source?: string | null
          locked_until?: string | null
          notes?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          sign_in_count?: number
          status_changed_at?: string | null
          student_status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          deletion_scheduled_for?: string | null
          email?: string
          failed_login_attempts?: number
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean
          is_development?: boolean
          is_shadow?: boolean | null
          is_student?: boolean
          is_teacher?: boolean
          last_name?: string | null
          last_sign_in_at?: string | null
          lead_source?: string | null
          locked_until?: string | null
          notes?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          sign_in_count?: number
          status_changed_at?: string | null
          student_status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
          user_id?: string | null
        }
      }
    }
    Enums: {
      student_status: "active" | "archived"
    }
  }
}
