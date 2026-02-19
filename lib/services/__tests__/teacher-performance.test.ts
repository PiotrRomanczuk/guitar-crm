import {
  calculateCompletionRate,
  calculateCancellationRate,
  calculateRetentionRate,
  calculateMasteryRate,
  calculateAvgLessonsPerStudent,
  formatTeacherMetrics,
  generate12MonthTrends,
  type TeacherLessonTrend,
} from '../teacher-performance';

describe('Teacher Performance Service', () => {
  describe('calculateCompletionRate', () => {
    it('should calculate correct completion rate', () => {
      expect(calculateCompletionRate(80, 20)).toBe(80.0);
      expect(calculateCompletionRate(7, 3)).toBe(70.0);
      expect(calculateCompletionRate(50, 50)).toBe(50.0);
    });

    it('should handle zero completed lessons', () => {
      expect(calculateCompletionRate(0, 10)).toBe(0);
    });

    it('should handle zero total lessons', () => {
      expect(calculateCompletionRate(0, 0)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      expect(calculateCompletionRate(2, 1)).toBe(66.7);
      expect(calculateCompletionRate(1, 2)).toBe(33.3);
    });
  });

  describe('calculateCancellationRate', () => {
    it('should calculate correct cancellation rate', () => {
      expect(calculateCancellationRate(10, 100)).toBe(10.0);
      expect(calculateCancellationRate(5, 20)).toBe(25.0);
    });

    it('should handle zero cancellations', () => {
      expect(calculateCancellationRate(0, 50)).toBe(0);
    });

    it('should handle zero total lessons', () => {
      expect(calculateCancellationRate(5, 0)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      expect(calculateCancellationRate(1, 3)).toBe(33.3);
    });
  });

  describe('calculateRetentionRate', () => {
    it('should calculate correct retention rate', () => {
      expect(calculateRetentionRate(90, 10)).toBe(90.0);
      expect(calculateRetentionRate(8, 2)).toBe(80.0);
    });

    it('should handle all active students', () => {
      expect(calculateRetentionRate(20, 0)).toBe(100);
    });

    it('should handle all churned students', () => {
      expect(calculateRetentionRate(0, 20)).toBe(0);
    });

    it('should handle zero students', () => {
      expect(calculateRetentionRate(0, 0)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      expect(calculateRetentionRate(2, 1)).toBe(66.7);
    });
  });

  describe('calculateMasteryRate', () => {
    it('should calculate correct mastery rate', () => {
      expect(calculateMasteryRate(15, 20)).toBe(75.0);
      expect(calculateMasteryRate(9, 10)).toBe(90.0);
    });

    it('should handle zero mastered songs', () => {
      expect(calculateMasteryRate(0, 10)).toBe(0);
    });

    it('should handle zero assigned songs', () => {
      expect(calculateMasteryRate(5, 0)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      expect(calculateMasteryRate(1, 3)).toBe(33.3);
    });
  });

  describe('calculateAvgLessonsPerStudent', () => {
    it('should calculate correct average', () => {
      expect(calculateAvgLessonsPerStudent(100, 10)).toBe(10.0);
      expect(calculateAvgLessonsPerStudent(25, 5)).toBe(5.0);
    });

    it('should handle zero students', () => {
      expect(calculateAvgLessonsPerStudent(100, 0)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      expect(calculateAvgLessonsPerStudent(10, 3)).toBe(3.3);
    });
  });

  describe('formatTeacherMetrics', () => {
    it('should format complete metrics object', () => {
      const input = {
        teacher_id: '123',
        teacher_name: 'John Doe',
        teacher_email: 'john@example.com',
        active_students: 15,
        churned_students: 3,
        total_students: 18,
        lessons_completed: 120,
        lessons_scheduled: 30,
        lessons_cancelled: 5,
        total_lessons: 155,
        avg_lessons_per_student: 8.6,
        lesson_completion_rate: 80.0,
        lesson_cancellation_rate: 3.2,
        songs_mastered: 45,
        songs_assigned: 60,
        song_mastery_rate: 75.0,
        retention_rate: 83.3,
        refreshed_at: '2026-02-09T10:00:00Z',
      };

      const result = formatTeacherMetrics(input);
      expect(result).toEqual(input);
    });

    it('should handle partial metrics with defaults', () => {
      const input = {
        teacher_id: '123',
        teacher_name: 'John Doe',
      };

      const result = formatTeacherMetrics(input);

      expect(result.teacher_id).toBe('123');
      expect(result.teacher_name).toBe('John Doe');
      expect(result.teacher_email).toBe('');
      expect(result.active_students).toBe(0);
      expect(result.total_students).toBe(0);
      expect(result.lesson_completion_rate).toBe(0);
    });

    it('should handle empty object', () => {
      const result = formatTeacherMetrics({});

      expect(result.teacher_id).toBe('');
      expect(result.active_students).toBe(0);
      expect(result.lesson_completion_rate).toBe(0);
      expect(typeof result.refreshed_at).toBe('string');
    });
  });

  describe('generate12MonthTrends', () => {
    it('should generate 12 months of trend data', () => {
      const now = new Date();
      // Generate current month string using same logic as function (UTC)
      const currentMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
        .toISOString()
        .slice(0, 7); // YYYY-MM

      const input: TeacherLessonTrend[] = [
        { month: `${currentMonth}-01T00:00:00Z`, completed: 10, cancelled: 2, scheduled: 5, total: 17 },
      ];

      const result = generate12MonthTrends(input);

      expect(result).toHaveLength(12);
      // Last element should be current month
      expect(result[result.length - 1].month).toBe(currentMonth);
      expect(result[result.length - 1].completed).toBe(10);
    });

    it('should fill in missing months with zeros', () => {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

      const input: TeacherLessonTrend[] = [
        { month: `${currentMonth}-01T00:00:00Z`, completed: 10, cancelled: 2, scheduled: 5, total: 17 },
      ];

      const result = generate12MonthTrends(input);

      expect(result).toHaveLength(12);

      // Most months should be zero (only current month has data)
      const zeroMonths = result.filter((t) => t.completed === 0);
      expect(zeroMonths.length).toBe(11);
    });

    it('should handle empty input array', () => {
      const result = generate12MonthTrends([]);

      expect(result).toHaveLength(12);
      expect(result.every((t) => t.completed === 0)).toBe(true);
      expect(result.every((t) => t.total === 0)).toBe(true);
    });

    it('should order months correctly (oldest to newest)', () => {
      const result = generate12MonthTrends([]);

      expect(result).toHaveLength(12);

      // Verify chronological order
      for (let i = 1; i < result.length; i++) {
        const prev = new Date(result[i - 1].month);
        const curr = new Date(result[i].month);
        expect(curr.getTime()).toBeGreaterThan(prev.getTime());
      }
    });
  });
});
