export interface Song {
  id: string;
  title: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  key: string;
  chords?: string;
  audio_files?: string;
  ultimate_guitar_link?: string;
  short_title?: string;
  comments?: string;
  created_at: Date;
  updated_at: Date;
  is_favorite?: boolean;
  status?: 'to learn' | 'started' | 'remembered' | 'with author' | 'mastered';
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
}

export type CreateSongDTO = Omit<Song, 'Id' | 'CreatedAt' | 'UpdatedAt'>;
export type UpdateSongDTO = Partial<CreateSongDTO>;
