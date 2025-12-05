export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lesson_id: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_overview"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "user_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lesson_songs: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          notes: string | null
          song_id: string
          status: Database["public"]["Enums"]["lesson_song_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          notes?: string | null
          song_id: string
          status?: Database["public"]["Enums"]["lesson_song_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          song_id?: string
          status?: Database["public"]["Enums"]["lesson_song_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_songs_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song_usage_stats"
            referencedColumns: ["song_id"]
          },
          {
            foreignKeyName: "lesson_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          google_event_id: string | null
          id: string
          lesson_teacher_number: number
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          teacher_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          google_event_id?: string | null
          id?: string
          lesson_teacher_number: number
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          teacher_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          google_event_id?: string | null
          id?: string
          lesson_teacher_number?: number
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id?: string
          teacher_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_overview"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "user_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean
          is_development: boolean
          is_shadow: boolean | null
          is_student: boolean
          is_teacher: boolean
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_development?: boolean
          is_shadow?: boolean | null
          is_student?: boolean
          is_teacher?: boolean
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_development?: boolean
          is_shadow?: boolean | null
          is_student?: boolean
          is_teacher?: boolean
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          author: string
          chords: string | null
          created_at: string
          deleted_at: string | null
          id: string
          key: Database["public"]["Enums"]["music_key"]
          level: Database["public"]["Enums"]["difficulty_level"]
          short_title: string | null
          title: string
          ultimate_guitar_link: string
          updated_at: string
        }
        Insert: {
          author: string
          chords?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          key: Database["public"]["Enums"]["music_key"]
          level: Database["public"]["Enums"]["difficulty_level"]
          short_title?: string | null
          title: string
          ultimate_guitar_link: string
          updated_at?: string
        }
        Update: {
          author?: string
          chords?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          key?: Database["public"]["Enums"]["music_key"]
          level?: Database["public"]["Enums"]["difficulty_level"]
          short_title?: string | null
          title?: string
          ultimate_guitar_link?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: number | null
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: number | null
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: number | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      lesson_counts_per_student: {
        Row: {
          student_id: string | null
          total_lessons: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lesson_counts_per_teacher: {
        Row: {
          teacher_id: string | null
          total_lessons: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "user_overview"
            referencedColumns: ["user_id"]
          },
        ]
      }
      song_usage_stats: {
        Row: {
          song_id: string | null
          times_assigned: number | null
          title: string | null
        }
        Relationships: []
      }
      user_overview: {
        Row: {
          created_at: string | null
          email: string | null
          is_admin: boolean | null
          is_student: boolean | null
          is_teacher: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_active_lesson_assignments: {
        Args: { song_uuid: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_student: { Args: never; Returns: boolean }
      is_teacher: { Args: never; Returns: boolean }
      soft_delete_song_with_cascade: {
        Args: { song_uuid: string; user_uuid: string }
        Returns: Json
      }
    }
    Enums: {
      assignment_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "overdue"
        | "cancelled"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      lesson_song_status:
        | "to_learn"
        | "started"
        | "remembered"
        | "with_author"
        | "mastered"
      lesson_status:
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
        | "RESCHEDULED"
      music_key:
        | "C"
        | "C#"
        | "Db"
        | "D"
        | "D#"
        | "Eb"
        | "E"
        | "F"
        | "F#"
        | "Gb"
        | "G"
        | "G#"
        | "Ab"
        | "A"
        | "A#"
        | "Bb"
        | "B"
        | "Cm"
        | "C#m"
        | "Dm"
        | "D#m"
        | "Ebm"
        | "Em"
        | "Fm"
        | "F#m"
        | "Gm"
        | "G#m"
        | "Am"
        | "A#m"
        | "Bbm"
        | "Bm"
      task_priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      task_status:
        | "OPEN"
        | "IN_PROGRESS"
        | "PENDING_REVIEW"
        | "COMPLETED"
        | "CANCELLED"
        | "BLOCKED"
      user_role: "admin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      assignment_status: [
        "not_started",
        "in_progress",
        "completed",
        "overdue",
        "cancelled",
      ],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      lesson_song_status: [
        "to_learn",
        "started",
        "remembered",
        "with_author",
        "mastered",
      ],
      lesson_status: [
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "RESCHEDULED",
      ],
      music_key: [
        "C",
        "C#",
        "Db",
        "D",
        "D#",
        "Eb",
        "E",
        "F",
        "F#",
        "Gb",
        "G",
        "G#",
        "Ab",
        "A",
        "A#",
        "Bb",
        "B",
        "Cm",
        "C#m",
        "Dm",
        "D#m",
        "Ebm",
        "Em",
        "Fm",
        "F#m",
        "Gm",
        "G#m",
        "Am",
        "A#m",
        "Bbm",
        "Bm",
      ],
      task_priority: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      task_status: [
        "OPEN",
        "IN_PROGRESS",
        "PENDING_REVIEW",
        "COMPLETED",
        "CANCELLED",
        "BLOCKED",
      ],
      user_role: ["admin", "teacher", "student"],
    },
  },
} as const

