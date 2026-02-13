import { groupSongsByLetter, flattenGroupsForVirtualizer } from '@/components/songs/list/groupSongs';
import type { Song } from '@/components/songs/types';

describe('groupSongs', () => {
  const createMockSong = (id: string, title: string): Song => ({
    id,
    title,
    author: 'Test Author',
    level: 'beginner',
    key: 'C',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
  });

  describe('groupSongsByLetter', () => {
    it('should group songs alphabetically by first letter', () => {
      const songs = [
        createMockSong('1', 'Blackbird'),
        createMockSong('2', 'Amazing Grace'),
        createMockSong('3', 'Blowin in the Wind'),
      ];

      const result = groupSongsByLetter(songs);

      expect(result).toHaveLength(2);
      expect(result[0].letter).toBe('A');
      expect(result[0].songs).toHaveLength(1);
      expect(result[1].letter).toBe('B');
      expect(result[1].songs).toHaveLength(2);
    });

    it('should sort songs within each group alphabetically', () => {
      const songs = [
        createMockSong('1', 'Blowin in the Wind'),
        createMockSong('2', 'Blackbird'),
      ];

      const result = groupSongsByLetter(songs);

      expect(result[0].songs[0].title).toBe('Blackbird');
      expect(result[0].songs[1].title).toBe('Blowin in the Wind');
    });

    it('should group songs starting with numbers into "#" group', () => {
      const songs = [
        createMockSong('1', '500 Miles'),
        createMockSong('2', 'Amazing Grace'),
      ];

      const result = groupSongsByLetter(songs);

      expect(result).toHaveLength(2);
      expect(result[0].letter).toBe('A');
      expect(result[1].letter).toBe('#');
      expect(result[1].songs[0].title).toBe('500 Miles');
    });

    it('should place "#" group last', () => {
      const songs = [
        createMockSong('1', '500 Miles'),
        createMockSong('2', 'Amazing Grace'),
        createMockSong('3', 'Zion'),
      ];

      const result = groupSongsByLetter(songs);

      expect(result[0].letter).toBe('A');
      expect(result[1].letter).toBe('Z');
      expect(result[2].letter).toBe('#');
    });

    it('should handle empty array', () => {
      const result = groupSongsByLetter([]);
      expect(result).toHaveLength(0);
    });

    it('should handle songs with missing titles', () => {
      const songs = [
        { ...createMockSong('1', ''), title: '' },
        createMockSong('2', 'Amazing Grace'),
      ];

      const result = groupSongsByLetter(songs);

      expect(result).toHaveLength(2);
      expect(result[0].letter).toBe('A');
      expect(result[1].letter).toBe('#');
    });
  });

  describe('flattenGroupsForVirtualizer', () => {
    it('should flatten groups into alternating header and song items', () => {
      const songs = [
        createMockSong('1', 'Amazing Grace'),
        createMockSong('2', 'Blackbird'),
      ];

      const groups = groupSongsByLetter(songs);
      const result = flattenGroupsForVirtualizer(groups);

      expect(result).toHaveLength(4); // 2 headers + 2 songs
      expect(result[0].type).toBe('header');
      expect(result[0].type === 'header' && result[0].letter).toBe('A');
      expect(result[1].type).toBe('song');
      expect(result[2].type).toBe('header');
      expect(result[2].type === 'header' && result[2].letter).toBe('B');
      expect(result[3].type).toBe('song');
    });

    it('should include song count in headers', () => {
      const songs = [
        createMockSong('1', 'Amazing Grace'),
        createMockSong('2', 'All Along the Watchtower'),
      ];

      const groups = groupSongsByLetter(songs);
      const result = flattenGroupsForVirtualizer(groups);

      expect(result[0].type).toBe('header');
      expect(result[0].type === 'header' && result[0].count).toBe(2);
    });

    it('should handle empty groups', () => {
      const result = flattenGroupsForVirtualizer([]);
      expect(result).toHaveLength(0);
    });
  });
});
