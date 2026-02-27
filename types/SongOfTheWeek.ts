export interface SongOfTheWeek {
  id: string;
  song_id: string;
  selected_by: string;
  teacher_message: string | null;
  active_from: string;
  active_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SongOfTheWeekWithSong extends SongOfTheWeek {
  song: {
    id: string;
    title: string;
    author: string;
    level: string;
    key: string;
    chords: string | null;
    youtube_url: string | null;
    spotify_link_url: string | null;
    ultimate_guitar_link: string | null;
    cover_image_url: string | null;
    strumming_pattern: string | null;
    tempo: number | null;
    capo_fret: number | null;
  };
}
