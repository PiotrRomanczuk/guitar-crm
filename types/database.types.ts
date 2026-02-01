export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: number;
          user_id: string | null;
          username: string | null;
          bio: string | null;
          created_at: string | null;
          updated_at: string | null;
          email: string | null;
          isStudent: boolean | null;
          isTeacher: boolean | null;
          isAdmin: boolean;
          firstName: string | null;
          lastName: string | null;
          canEdit: boolean;
          isTest: boolean | null;
          isActive: boolean;
          role?: 'admin' | 'teacher' | 'student' | null;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          username?: string | null;
          bio?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          email?: string | null;
          isStudent?: boolean | null;
          isTeacher?: boolean | null;
          isAdmin?: boolean;
          firstName?: string | null;
          lastName?: string | null;
          canEdit?: boolean;
          isTest?: boolean | null;
          isActive?: boolean;
          role?: 'admin' | 'teacher' | 'student' | null;
        };
        Update: {
          id?: never;
          user_id?: string | null;
          username?: string | null;
          bio?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          email?: string | null;
          isStudent?: boolean | null;
          isTeacher?: boolean | null;
          isAdmin?: boolean;
          firstName?: string | null;
          lastName?: string | null;
          canEdit?: boolean;
          isTest?: boolean | null;
          isActive?: boolean;
          role?: 'admin' | 'teacher' | 'student' | null;
        };
      };

      lessons: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          created_at: string;
          updated_at: string;
          date: string | null;
          time: string | null;
          start_time: string | null;
          creator_user_id: string | null;
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | null;
          lesson_number: number | null;
          notes: string | null;
          title: string | null;
          lesson_teacher_number: number | null;
          google_event_id: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          created_at?: string;
          updated_at?: string;
          date?: string | null;
          time?: string | null;
          start_time?: string | null;
          creator_user_id?: string | null;
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | null;
          lesson_number?: number | null;
          notes?: string | null;
          title?: string | null;
          lesson_teacher_number?: number | null;
          google_event_id?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          created_at?: string;
          updated_at?: string;
          date?: string | null;
          time?: string | null;
          start_time?: string | null;
          creator_user_id?: string | null;
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | null;
          lesson_number?: number | null;
          notes?: string | null;
          title?: string | null;
          lesson_teacher_number?: number | null;
          google_event_id?: string | null;
        };
      };

      songs: {
        Row: {
          id: string;
          title: string | null;
          level: string | null;
          key: string | null;
          chords: string | null;
          audio_files: Record<string, unknown> | null;
          created_at: string;
          author: string | null;
          ultimate_guitar_link: string | null;
          youtube_url: string | null;
          gallery_images: string[] | null;
          spotify_link_url: string | null;
          capo_fret: number | null;
          strumming_pattern: string | null;
          category: string | null;
          tempo: number | null;
          time_signature: number | null;
          duration_ms: number | null;
          release_year: number | null;
          cover_image_url: string | null;
          short_title: string | null;
          tiktok_short_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          level?: string | null;
          key?: string | null;
          chords?: string | null;
          audio_files?: Record<string, unknown> | null;
          created_at?: string;
          author?: string | null;
          ultimate_guitar_link?: string | null;
          youtube_url?: string | null;
          gallery_images?: string[] | null;
          spotify_link_url?: string | null;
          capo_fret?: number | null;
          strumming_pattern?: string | null;
          category?: string | null;
          tempo?: number | null;
          time_signature?: number | null;
          duration_ms?: number | null;
          release_year?: number | null;
          cover_image_url?: string | null;
          short_title?: string | null;
          tiktok_short_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          level?: string | null;
          key?: string | null;
          chords?: string | null;
          audio_files?: Record<string, unknown> | null;
          created_at?: string;
          author?: string | null;
          ultimate_guitar_link?: string | null;
          youtube_url?: string | null;
          gallery_images?: string[] | null;
          spotify_link_url?: string | null;
          capo_fret?: number | null;
          strumming_pattern?: string | null;
          category?: string | null;
          tempo?: number | null;
          time_signature?: number | null;
          duration_ms?: number | null;
          release_year?: number | null;
          cover_image_url?: string | null;
          short_title?: string | null;
          tiktok_short_url?: string | null;
          updated_at?: string | null;
        };
      };

      lesson_songs: {
        Row: {
          id: string;
          lesson_id: string;
          song_id: string;
          song_status: 'to_learn' | 'started' | 'remembered' | 'with_author' | 'mastered' | null;
          student_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          song_id: string;
          song_status?: 'to_learn' | 'started' | 'remembered' | 'with_author' | 'mastered' | null;
          student_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          song_id?: string;
          song_status?: 'to_learn' | 'started' | 'remembered' | 'with_author' | 'mastered' | null;
          student_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          song_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          song_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          song_id?: string;
          created_at?: string;
        };
      };

      task_management: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          priority: string | null;
          status: string | null;
          estimated_effort: string | null;
          assignee_id: string | null;
          due_date: string | null;
          tags: string[] | null;
          external_link: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          priority?: string | null;
          status?: string | null;
          estimated_effort?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          tags?: string[] | null;
          external_link?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          priority?: string | null;
          status?: string | null;
          estimated_effort?: string | null;
          assignee_id?: string | null;
          due_date?: string | null;
          tags?: string[] | null;
          external_link?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      lesson_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          duration: number | null;
          structure?: Record<string, unknown> | null;
          teacher_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          duration?: number | null;
          structure?: Record<string, unknown> | null;
          teacher_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          duration?: number | null;
          structure?: Record<string, unknown> | null;
          teacher_id?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      teacher_availability: {
        Row: {
          id: string;
          teacher_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      user_integrations: {
        Row: {
          user_id: string;
          provider: string;
          access_token: string | null;
          refresh_token: string | null;
          expires_at: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          provider: string;
          access_token?: string | null;
          refresh_token?: string | null;
          expires_at?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          provider?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          expires_at?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      webhook_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          channel_id: string;
          resource_id: string;
          expiration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          channel_id: string;
          resource_id: string;
          expiration: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          channel_id?: string;
          resource_id?: string;
          expiration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_songs_by_user: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          song_id: string;
          song_status: string;
        }[];
      };
    };
    Enums: {
      LessonStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
