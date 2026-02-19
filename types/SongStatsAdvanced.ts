export interface SongStatsAdvancedOverview {
  totalSongs: number;
  uniqueAuthors: number;
  uniqueCategories: number;
  metadataCompleteness: number;
  recentSongs30d: number;
  avgSongsPerAuthor: number;
}

export interface SongStatsTempoStats {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  songsWithTempo: number;
  histogram: Array<{ bucket: string; count: number }>;
}

export interface SongStatsKeyDistribution {
  key: string;
  count: number;
  isMajor: boolean;
}

export interface SongStatsGrowthMonth {
  month: string;
  newSongs: number;
  cumulative: number;
}

export interface SongStatsSunburstNode {
  name: string;
  value?: number;
  children?: SongStatsSunburstNode[];
}

export interface SongStatsReleaseYear {
  decades: Array<{ decade: string; count: number }>;
  earliest: number | null;
  latest: number | null;
  median: number | null;
}

export interface SongStatsAdvanced {
  overview: SongStatsAdvancedOverview;
  tempo: SongStatsTempoStats;
  keyDistribution: SongStatsKeyDistribution[];
  levelDistribution: Array<{ level: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  libraryGrowth: SongStatsGrowthMonth[];
  sunburst: SongStatsSunburstNode;
  releaseYear: SongStatsReleaseYear;
}
