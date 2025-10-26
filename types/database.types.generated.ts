export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      deleted_songs_audit: {
        Row: {
          deleted_at: string
          id: string
          song_id: string
          title: string | null
        }
        Insert: {
          deleted_at?: string
          id?: string
          song_id: string
          title?: string | null
        }
        Update: {
          deleted_at?: string
          id?: string
          song_id?: string
          title?: string | null
        }
        Relationships: []
      }
      development_tasks: {
        Row: {
          assignee_id: string | null
          category: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          estimated_effort: string | null
          external_link: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["TaskPriority"]
          status: Database["public"]["Enums"]["TaskStatus"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          estimated_effort?: string | null
          external_link?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          status?: Database["public"]["Enums"]["TaskStatus"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          estimated_effort?: string | null
          external_link?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          status?: Database["public"]["Enums"]["TaskStatus"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_management_assignee_id_fkey"
            columns: ["assignee_id"]
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
      lesson_songs: {
        Row: {
          created_at: string
          lesson_id: string
          song_id: string
          song_status: Database["public"]["Enums"]["LearningSongStatus"] | null
          student_id: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          lesson_id: string
          song_id: string
          song_status?: Database["public"]["Enums"]["LearningSongStatus"] | null
          student_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          lesson_id?: string
          song_id?: string
          song_status?: Database["public"]["Enums"]["LearningSongStatus"] | null
          student_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lesson"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_song"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_teacher"
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
          creator_user_id: string | null
          date: string | null
          id: string
          lesson_number: number | null
          lesson_teacher_number: number | null
          notes: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["LessonStatus"] | null
          student_id: string
          teacher_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_user_id?: string | null
          date?: string | null
          id?: string
          lesson_number?: number | null
          lesson_teacher_number?: number | null
          notes?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["LessonStatus"] | null
          student_id: string
          teacher_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_user_id?: string | null
          date?: string | null
          id?: string
          lesson_number?: number | null
          lesson_teacher_number?: number | null
          notes?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["LessonStatus"] | null
          student_id?: string
          teacher_id?: string
          title?: string | null
          updated_at?: string
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
          created_at: string | null
          email: string | null
          firstName: string | null
          id: number
          isActive: boolean | null
          isAdmin: boolean
          isStudent: boolean | null
          isTeacher: boolean | null
          isTest: boolean | null
          lastName: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          canEdit?: boolean
          created_at?: string | null
          email?: string | null
          firstName?: string | null
          id?: never
          isActive?: boolean | null
          isAdmin?: boolean
          isStudent?: boolean | null
          isTeacher?: boolean | null
          isTest?: boolean | null
          lastName?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          canEdit?: boolean
          created_at?: string | null
          email?: string | null
          firstName?: string | null
          id?: never
          isActive?: boolean | null
          isAdmin?: boolean
          isStudent?: boolean | null
          isTeacher?: boolean | null
          isTest?: boolean | null
          lastName?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          audio_files: Json | null
          author: string | null
          chords: string | null
          created_at: string
          id: string
          key: string | null
          level: string | null
          short_title: string | null
          title: string | null
          ultimate_guitar_link: string | null
          updated_at: string | null
        }
        Insert: {
          audio_files?: Json | null
          author?: string | null
          chords?: string | null
          created_at?: string
          id?: string
          key?: string | null
          level?: string | null
          short_title?: string | null
          title?: string | null
          ultimate_guitar_link?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_files?: Json | null
          author?: string | null
          chords?: string | null
          created_at?: string
          id?: string
          key?: string | null
          level?: string | null
          short_title?: string | null
          title?: string | null
          ultimate_guitar_link?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      task_management: {
        Row: {
          assignee_id: string | null
          category: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          estimated_effort: string | null
          external_link: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["TaskPriority"]
          status: Database["public"]["Enums"]["TaskStatus"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          estimated_effort?: string | null
          external_link?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          status?: Database["public"]["Enums"]["TaskStatus"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          estimated_effort?: string | null
          external_link?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          status?: Database["public"]["Enums"]["TaskStatus"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_management_assignee_id_fkey1"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_management_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_song"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_fill_username: { Args: { email: string }; Returns: undefined }
      auto_fill_usernames: { Args: never; Returns: undefined }
      get_lesson_stats: {
        Args: { p_user_id: string }
        Returns: {
          cancelled_lessons: number
          completed_lessons: number
          total_lessons: number
          upcoming_lessons: number
        }[]
      }
      get_lessons_with_profiles: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_status?: string
          p_user_id?: string
        }
        Returns: {
          lesson_data: Json
          student_profile: Json
          teacher_profile: Json
        }[]
      }
      get_songs_by_student: {
        Args: { p_student_id: string }
        Returns: {
          song_id: string
          song_status: string
        }[]
      }
      increment_lesson_number: {
        Args: { p_student_id: string; p_teacher_id: string }
        Returns: number
      }
      update_past_lessons_status: { Args: never; Returns: undefined }
    }
    Enums: {
      LearningSongStatus:
        | "TO_LEARN"
        | "STARTED"
        | "REMEMBERED"
        | "WITH_AUTHOR"
        | "MASTERED"
      lessonstatus: "SCHEDULED" | "COMPLETED" | "CANCELLED"
      LessonStatus: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
      TaskPriority: "Critical" | "High" | "Medium" | "Low"
      TaskStatus: "Not Started" | "In Progress" | "Completed" | "Blocked"
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
  public: {
    Enums: {
      LearningSongStatus: [
        "TO_LEARN",
        "STARTED",
        "REMEMBERED",
        "WITH_AUTHOR",
        "MASTERED",
      ],
      lessonstatus: ["SCHEDULED", "COMPLETED", "CANCELLED"],
      LessonStatus: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      TaskPriority: ["Critical", "High", "Medium", "Low"],
      TaskStatus: ["Not Started", "In Progress", "Completed", "Blocked"],
    },
  },
} as const
