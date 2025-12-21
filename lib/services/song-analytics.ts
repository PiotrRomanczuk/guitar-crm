import { createAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/database.types';

type Song = Database['public']['Tables']['songs']['Row'];

export interface SongDatabaseStats {
  totalSongs: number;
  coverage: {
    chords: number; // Percentage 0-100
    youtube: number; // Percentage 0-100
    ultimateGuitar: number; // Percentage 0-100
    galleryImages: number; // Percentage 0-100
  };
  counts: {
    withChords: number;
    withYoutube: number;
    withUltimateGuitar: number;
    withGalleryImages: number;
  };
  missing: {
    chords: Pick<Song, 'id' | 'title' | 'author'>[];
    youtube: Pick<Song, 'id' | 'title' | 'author'>[];
    ultimateGuitar: Pick<Song, 'id' | 'title' | 'author'>[];
    galleryImages: Pick<Song, 'id' | 'title' | 'author'>[];
  };
}

export async function getSongDatabaseStatistics(): Promise<SongDatabaseStats> {
  const supabase = createAdminClient();

  // Fetch all songs that are not deleted
  const { data: songs, error } = await supabase
    .from('songs')
    .select('*')
    .is('deleted_at', null)
    .order('title');

  if (error) {
    console.error('Error fetching songs for analytics:', error);
    throw new Error(`Failed to fetch songs: ${error.message}`);
  }

  if (!songs) {
    return {
      totalSongs: 0,
      coverage: { chords: 0, youtube: 0, ultimateGuitar: 0, galleryImages: 0 },
      counts: { withChords: 0, withYoutube: 0, withUltimateGuitar: 0, withGalleryImages: 0 },
      missing: { chords: [], youtube: [], ultimateGuitar: [], galleryImages: [] },
    };
  }

  const totalSongs = songs.length;

  // Helper to check if a field is "present"
  const hasValue = (val: string | null | undefined) => val !== null && val !== undefined && val.trim() !== '';
  const hasArrayValue = (val: string[] | null | undefined) => val !== null && val !== undefined && val.length > 0;

  // Categorize songs
  const missingChords = songs.filter(s => !hasValue(s.chords));
  const missingYoutube = songs.filter(s => !hasValue(s.youtube_url));
  const missingUltimateGuitar = songs.filter(s => !hasValue(s.ultimate_guitar_link));
  const missingGalleryImages = songs.filter(s => !hasArrayValue(s.gallery_images));

  const withChordsCount = totalSongs - missingChords.length;
  const withYoutubeCount = totalSongs - missingYoutube.length;
  const withUltimateGuitarCount = totalSongs - missingUltimateGuitar.length;
  const withGalleryImagesCount = totalSongs - missingGalleryImages.length;

  // Calculate percentages
  const calculatePercentage = (count: number) => (totalSongs > 0 ? Math.round((count / totalSongs) * 100) : 0);

  // Map to simple objects for the report
  const mapToSummary = (s: Song) => ({ id: s.id, title: s.title, author: s.author });

  return {
    totalSongs,
    coverage: {
      chords: calculatePercentage(withChordsCount),
      youtube: calculatePercentage(withYoutubeCount),
      ultimateGuitar: calculatePercentage(withUltimateGuitarCount),
      galleryImages: calculatePercentage(withGalleryImagesCount),
    },
    counts: {
      withChords: withChordsCount,
      withYoutube: withYoutubeCount,
      withUltimateGuitar: withUltimateGuitarCount,
      withGalleryImages: withGalleryImagesCount,
    },
    missing: {
      chords: missingChords.map(mapToSummary),
      youtube: missingYoutube.map(mapToSummary),
      ultimateGuitar: missingUltimateGuitar.map(mapToSummary),
      galleryImages: missingGalleryImages.map(mapToSummary),
    },
  };
}
