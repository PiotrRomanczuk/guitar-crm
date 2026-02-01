export interface SpotifyMatch {
  id: string;
  song_id: string;
  spotify_track_id: string;
  spotify_track_name: string;
  spotify_artist_name: string;
  spotify_album_name: string;
  spotify_url: string;
  spotify_preview_url?: string;
  spotify_cover_image_url?: string;
  spotify_duration_ms: number;
  spotify_release_date: string;
  spotify_popularity?: number;
  confidence_score: number;
  search_query: string;
  match_reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  songs: {
    id: string;
    title: string;
    author: string;
    spotify_link_url?: string;
    cover_image_url?: string;
  };
}

export interface SpotifySearchResult {
  id: string;
  name: string;
  artist: string;
  album: string;
  url: string;
  coverUrl?: string;
  duration_ms: number;
  release_date: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type SortField = 'original' | 'spotify' | 'confidence' | null;
export type SortOrder = 'asc' | 'desc';
