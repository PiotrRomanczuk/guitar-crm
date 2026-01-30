import {
  STATUS_VARIANTS,
  LESSON_STATUS_COLORS,
  SONG_STATUS_COLORS,
  SONG_LEVEL_COLORS,
  ASSIGNMENT_STATUS_COLORS,
  USER_STATUS_COLORS,
  getStatusColors,
  getStatusBadgeClasses,
} from './status-colors';

describe('status-colors', () => {
  describe('STATUS_VARIANTS', () => {
    it('should have all required variants', () => {
      expect(STATUS_VARIANTS).toHaveProperty('success');
      expect(STATUS_VARIANTS).toHaveProperty('warning');
      expect(STATUS_VARIANTS).toHaveProperty('error');
      expect(STATUS_VARIANTS).toHaveProperty('info');
      expect(STATUS_VARIANTS).toHaveProperty('muted');
      expect(STATUS_VARIANTS).toHaveProperty('special');
    });

    it('each variant should have required color classes', () => {
      Object.values(STATUS_VARIANTS).forEach((variant) => {
        expect(variant).toHaveProperty('text');
        expect(variant).toHaveProperty('bg');
        expect(variant).toHaveProperty('border');
        expect(variant).toHaveProperty('badge');
      });
    });
  });

  describe('LESSON_STATUS_COLORS', () => {
    it('should map lesson statuses to variants', () => {
      expect(LESSON_STATUS_COLORS.COMPLETED).toBe('success');
      expect(LESSON_STATUS_COLORS.CANCELLED).toBe('error');
      expect(LESSON_STATUS_COLORS.IN_PROGRESS).toBe('info');
      expect(LESSON_STATUS_COLORS.SCHEDULED).toBe('warning');
      expect(LESSON_STATUS_COLORS.RESCHEDULED).toBe('special');
    });
  });

  describe('SONG_STATUS_COLORS', () => {
    it('should map song statuses to variants', () => {
      expect(SONG_STATUS_COLORS.to_learn).toBe('muted');
      expect(SONG_STATUS_COLORS.started).toBe('warning');
      expect(SONG_STATUS_COLORS.remembered).toBe('info');
      expect(SONG_STATUS_COLORS.mastered).toBe('success');
    });
  });

  describe('SONG_LEVEL_COLORS', () => {
    it('should map difficulty levels to variants', () => {
      expect(SONG_LEVEL_COLORS.Beginner).toBe('info');
      expect(SONG_LEVEL_COLORS.Intermediate).toBe('warning');
      expect(SONG_LEVEL_COLORS.Advanced).toBe('error');
    });
  });

  describe('ASSIGNMENT_STATUS_COLORS', () => {
    it('should map assignment statuses to variants', () => {
      expect(ASSIGNMENT_STATUS_COLORS.not_started).toBe('muted');
      expect(ASSIGNMENT_STATUS_COLORS.in_progress).toBe('info');
      expect(ASSIGNMENT_STATUS_COLORS.completed).toBe('success');
      expect(ASSIGNMENT_STATUS_COLORS.overdue).toBe('error');
    });
  });

  describe('USER_STATUS_COLORS', () => {
    it('should map user statuses to variants', () => {
      expect(USER_STATUS_COLORS.active).toBe('success');
      expect(USER_STATUS_COLORS.inactive).toBe('error');
      expect(USER_STATUS_COLORS.pending).toBe('warning');
      expect(USER_STATUS_COLORS.registered).toBe('info');
      expect(USER_STATUS_COLORS.shadow).toBe('muted');
    });
  });

  describe('getStatusColors', () => {
    it('should return correct colors for lesson status', () => {
      const colors = getStatusColors('lesson', 'COMPLETED');
      expect(colors).toBe(STATUS_VARIANTS.success);
    });

    it('should return correct colors for song status', () => {
      const colors = getStatusColors('song', 'mastered');
      expect(colors).toBe(STATUS_VARIANTS.success);
    });

    it('should return correct colors for song level', () => {
      const colors = getStatusColors('songLevel', 'Beginner');
      expect(colors).toBe(STATUS_VARIANTS.info);
    });

    it('should return correct colors for assignment status', () => {
      const colors = getStatusColors('assignment', 'overdue');
      expect(colors).toBe(STATUS_VARIANTS.error);
    });

    it('should return correct colors for user status', () => {
      const colors = getStatusColors('user', 'active');
      expect(colors).toBe(STATUS_VARIANTS.success);
    });

    it('should return muted for unknown status', () => {
      const colors = getStatusColors('lesson', 'UNKNOWN_STATUS');
      expect(colors).toBe(STATUS_VARIANTS.muted);
    });
  });

  describe('getStatusBadgeClasses', () => {
    it('should return badge classes for valid status', () => {
      const classes = getStatusBadgeClasses('lesson', 'COMPLETED');
      expect(classes).toBe(STATUS_VARIANTS.success.badge);
      expect(classes).toContain('text-green');
      expect(classes).toContain('bg-green');
    });

    it('should return muted badge classes for unknown status', () => {
      const classes = getStatusBadgeClasses('lesson', 'UNKNOWN');
      expect(classes).toBe(STATUS_VARIANTS.muted.badge);
    });
  });
});
