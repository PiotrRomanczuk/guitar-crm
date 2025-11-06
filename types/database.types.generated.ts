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
      lesson_songs: {
        Row: {
          created_at: string
          lesson_id: string
          song_id: string
          song_status: Database["public"]["Enums"]["learning_status"]
          student_id: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          lesson_id: string
          song_id: string
          song_status?: Database["public"]["Enums"]["learning_status"]
          student_id?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          lesson_id?: string
          song_id?: string
          song_status?: Database["public"]["Enums"]["learning_status"]
          student_id?: string | null
          teacher_id?: string | null
          updated_at?: string | null
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
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_songs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lesson_songs_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          creator_user_id: string
          date: string
          id: string
          lesson_number: number | null
          lesson_teacher_number: number | null
          notes: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          teacher_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          creator_user_id: string
          date: string
          id?: string
          lesson_number?: number | null
          lesson_teacher_number?: number | null
          notes?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          teacher_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          creator_user_id?: string
          date?: string
          id?: string
          lesson_number?: number | null
          lesson_teacher_number?: number | null
          notes?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id?: string
          teacher_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          canEdit: boolean
          created_at: string
          email: string | null
          firstname: string | null
          id: number
          isActive: boolean | null
          isadmin: boolean
          isdevelopment: boolean | null
          isstudent: boolean
          isteacher: boolean
          isTest: boolean | null
          lastname: string | null
          notes: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          bio?: string | null
          canEdit?: boolean
          created_at?: string
          email?: string | null
          firstname?: string | null
          id?: number
          isActive?: boolean | null
          isadmin?: boolean
          isdevelopment?: boolean | null
          isstudent?: boolean
          isteacher?: boolean
          isTest?: boolean | null
          lastname?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          bio?: string | null
          canEdit?: boolean
          created_at?: string
          email?: string | null
          firstname?: string | null
          id?: number
          isActive?: boolean | null
          isadmin?: boolean
          isdevelopment?: boolean | null
          isstudent?: boolean
          isteacher?: boolean
          isTest?: boolean | null
          lastname?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          audio_files: string[] | null
          author: string
          chords: string | null
          created_at: string
          id: string
          key: Database["public"]["Enums"]["music_key"]
          level: Database["public"]["Enums"]["difficulty_level"]
          short_title: string | null
          title: string
          ultimate_guitar_link: string
          updated_at: string | null
        }
        Insert: {
          audio_files?: string[] | null
          author: string
          chords?: string | null
          created_at?: string
          id?: string
          key: Database["public"]["Enums"]["music_key"]
          level: Database["public"]["Enums"]["difficulty_level"]
          short_title?: string | null
          title: string
          ultimate_guitar_link: string
          updated_at?: string | null
        }
        Update: {
          audio_files?: string[] | null
          author?: string
          chords?: string | null
          created_at?: string
          id?: string
          key?: Database["public"]["Enums"]["music_key"]
          level?: Database["public"]["Enums"]["difficulty_level"]
          short_title?: string | null
          title?: string
          ultimate_guitar_link?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_management: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_management_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_management_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced"
      learning_status:
        | "to_learn"
        | "started"
        | "remembered"
        | "with_author"
        | "mastered"
      lesson_status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED"
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
      difficulty_level: ["beginner", "intermediate", "advanced"],
      learning_status: [
        "to_learn",
        "started",
        "remembered",
        "with_author",
        "mastered",
      ],
      lesson_status: ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"],
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
    },
  },
} as const

