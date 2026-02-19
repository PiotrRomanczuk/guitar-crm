export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  release_date: string;
  url?: string;
}

export interface SpotifyApiTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
    release_date: string;
  };
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
}

export interface SpotifyApiArtist {
  id: string;
  name: string;
  images: { url: string }[];
  popularity: number;
  genres: string[];
  external_urls: {
    spotify: string;
  };
}
