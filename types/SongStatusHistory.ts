export interface SongStatusHistory {
  id: string;
  student_id: string;
  song_id: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  notes: string | null;
  created_at: string;
}

export interface SongProgressSummary {
  student_id: string;
  song_id: string;
  song_title: string;
  song_artist: string;
  song_level: 'beginner' | 'intermediate' | 'advanced';
  current_status: string;
  last_updated: string;
  total_status_changes: number;
  first_change_date: string | null;
  last_change_date: string | null;
}
