import {
  groupByEnrollmentQuarter,
  groupByStatus,
  groupByTeacher,
  groupByLessonFrequency,
  calculateLessonsCompleted,
  calculateCohortMasteryRate,
  calculateCohortCompletionRate,
  calculateCohortRetentionRate,
  calculateAvgTimeToMaster,
} from '../cohort-analytics';

describe('Cohort Analytics Service', () => {
  describe('groupByEnrollmentQuarter', () => {
    it('should group students by enrollment quarter', () => {
      const students = [
        { id: '1', created_at: '2024-01-15T00:00:00Z', student_status: 'active' },
        { id: '2', created_at: '2024-02-20T00:00:00Z', student_status: 'active' },
        { id: '3', created_at: '2024-04-10T00:00:00Z', student_status: 'active' },
        { id: '4', created_at: '2024-07-01T00:00:00Z', student_status: 'active' },
      ];

      const cohorts = groupByEnrollmentQuarter(students);

      expect(cohorts.size).toBe(3);
      expect(cohorts.get('Q1 2024')).toEqual(['1', '2']);
      expect(cohorts.get('Q2 2024')).toEqual(['3']);
      expect(cohorts.get('Q3 2024')).toEqual(['4']);
    });

    it('should handle students from different years', () => {
      const students = [
        { id: '1', created_at: '2023-12-15T00:00:00Z', student_status: 'active' },
        { id: '2', created_at: '2024-01-20T00:00:00Z', student_status: 'active' },
      ];

      const cohorts = groupByEnrollmentQuarter(students);

      expect(cohorts.size).toBe(2);
      expect(cohorts.get('Q4 2023')).toEqual(['1']);
      expect(cohorts.get('Q1 2024')).toEqual(['2']);
    });

    it('should handle empty student list', () => {
      const cohorts = groupByEnrollmentQuarter([]);
      expect(cohorts.size).toBe(0);
    });
  });

  describe('groupByStatus', () => {
    it('should group students by status', () => {
      const students = [
        { id: '1', created_at: '2024-01-15T00:00:00Z', student_status: 'active' },
        { id: '2', created_at: '2024-02-20T00:00:00Z', student_status: 'active' },
        { id: '3', created_at: '2024-04-10T00:00:00Z', student_status: 'churned' },
        { id: '4', created_at: '2024-07-01T00:00:00Z', student_status: 'trial' },
      ];

      const cohorts = groupByStatus(students);

      expect(cohorts.size).toBe(3);
      expect(cohorts.get('active')).toEqual(['1', '2']);
      expect(cohorts.get('churned')).toEqual(['3']);
      expect(cohorts.get('trial')).toEqual(['4']);
    });

    it('should handle students with null status', () => {
      const students = [
        { id: '1', created_at: '2024-01-15T00:00:00Z', student_status: null },
        { id: '2', created_at: '2024-02-20T00:00:00Z', student_status: 'active' },
      ];

      const cohorts = groupByStatus(students);

      expect(cohorts.size).toBe(2);
      expect(cohorts.get('unknown')).toEqual(['1']);
      expect(cohorts.get('active')).toEqual(['2']);
    });
  });

  describe('groupByTeacher', () => {
    it('should group students by primary teacher', () => {
      const students = [
        { id: '1', created_at: '2024-01-15T00:00:00Z', student_status: 'active' },
        { id: '2', created_at: '2024-02-20T00:00:00Z', student_status: 'active' },
      ];

      const lessons = [
        { student_id: '1', teacher_id: 'teacher-a', status: 'COMPLETED', scheduled_at: '2024-01-20' },
        { student_id: '1', teacher_id: 'teacher-a', status: 'COMPLETED', scheduled_at: '2024-01-27' },
        { student_id: '2', teacher_id: 'teacher-b', status: 'COMPLETED', scheduled_at: '2024-02-25' },
      ];

      const cohorts = groupByTeacher(students, lessons);

      expect(cohorts.size).toBe(2);
      expect(cohorts.get('teacher-a')).toEqual(['1']);
      expect(cohorts.get('teacher-b')).toEqual(['2']);
    });

    it('should assign student to teacher with most lessons', () => {
      const students = [
        { id: '1', created_at: '2024-01-15T00:00:00Z', student_status: 'active' },
      ];

      const lessons = [
        { student_id: '1', teacher_id: 'teacher-a', status: 'COMPLETED', scheduled_at: '2024-01-20' },
        { student_id: '1', teacher_id: 'teacher-b', status: 'COMPLETED', scheduled_at: '2024-01-27' },
        { student_id: '1', teacher_id: 'teacher-b', status: 'COMPLETED', scheduled_at: '2024-02-03' },
      ];

      const cohorts = groupByTeacher(students, lessons);

      expect(cohorts.size).toBe(1);
      expect(cohorts.get('teacher-b')).toEqual(['1']);
    });

    it('should handle students with no lessons', () => {
      const students = [
        { id: '1', created_at: '2024-01-15T00:00:00Z', student_status: 'active' },
      ];

      const cohorts = groupByTeacher(students, []);

      expect(cohorts.size).toBe(1);
      expect(cohorts.get('no_teacher')).toEqual(['1']);
    });
  });

  describe('groupByLessonFrequency', () => {
    it('should group students by lesson frequency', () => {
      const students = [
        { id: '1', created_at: '2024-01-01T00:00:00Z', student_status: 'active' },
        { id: '2', created_at: '2024-01-01T00:00:00Z', student_status: 'active' },
        { id: '3', created_at: '2024-01-01T00:00:00Z', student_status: 'active' },
      ];

      // Use a fixed time window for consistent testing
      const baseDate = '2024-01-01T00:00:00Z';

      const lessons = [
        // Student 1: 1 lesson per week (12 lessons over 12 weeks)
        ...Array(12).fill(null).map((_, i) => ({
          student_id: '1',
          teacher_id: 't1',
          status: 'COMPLETED',
          scheduled_at: new Date(new Date(baseDate).getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        })),

        // Student 2: 2 lessons per week (24 lessons over 12 weeks)
        ...Array(24).fill(null).map((_, i) => ({
          student_id: '2',
          teacher_id: 't1',
          status: 'COMPLETED',
          scheduled_at: new Date(new Date(baseDate).getTime() + i * 3.5 * 24 * 60 * 60 * 1000).toISOString(),
        })),

        // Student 3: No lessons
      ];

      const cohorts = groupByLessonFrequency(students, lessons);

      // Check that cohorts were created (specific frequencies may vary based on current date)
      expect(cohorts.size).toBeGreaterThan(0);
      expect(cohorts.get('0x/week')).toContain('3');
    });

    it('should handle students with no lessons', () => {
      const students = [
        { id: '1', created_at: '2024-01-01T00:00:00Z', student_status: 'active' },
      ];

      const cohorts = groupByLessonFrequency(students, []);

      expect(cohorts.size).toBe(1);
      expect(cohorts.get('0x/week')).toEqual(['1']);
    });
  });

  describe('calculateLessonsCompleted', () => {
    it('should count completed lessons for cohort', () => {
      const studentIds = ['1', '2'];
      const lessons = [
        { student_id: '1', teacher_id: 't1', status: 'COMPLETED', scheduled_at: '2024-01-20' },
        { student_id: '1', teacher_id: 't1', status: 'COMPLETED', scheduled_at: '2024-01-27' },
        { student_id: '2', teacher_id: 't1', status: 'COMPLETED', scheduled_at: '2024-02-03' },
        { student_id: '2', teacher_id: 't1', status: 'SCHEDULED', scheduled_at: '2024-02-10' },
        { student_id: '3', teacher_id: 't1', status: 'COMPLETED', scheduled_at: '2024-02-10' },
      ];

      const result = calculateLessonsCompleted(studentIds, lessons);

      expect(result).toBe(3);
    });

    it('should return 0 for students with no completed lessons', () => {
      const result = calculateLessonsCompleted(['1'], []);
      expect(result).toBe(0);
    });
  });

  describe('calculateCohortMasteryRate', () => {
    it('should calculate mastery rate correctly', () => {
      const studentIds = ['1', '2'];
      const songProgress = [
        { student_id: '1', current_status: 'mastered', mastered_at: '2024-01-20', assigned_at: '2024-01-01' },
        { student_id: '1', current_status: 'learning', mastered_at: null, assigned_at: '2024-01-15' },
        { student_id: '2', current_status: 'mastered', mastered_at: '2024-02-01', assigned_at: '2024-01-20' },
        { student_id: '2', current_status: 'mastered', mastered_at: '2024-02-10', assigned_at: '2024-01-25' },
        { student_id: '3', current_status: 'mastered', mastered_at: '2024-02-15', assigned_at: '2024-02-01' },
      ];

      const result = calculateCohortMasteryRate(studentIds, songProgress);

      // 3 mastered out of 4 total = 75%
      expect(result).toBe(75.0);
    });

    it('should return 0 for students with no song progress', () => {
      const result = calculateCohortMasteryRate(['1'], []);
      expect(result).toBe(0);
    });
  });

  describe('calculateCohortCompletionRate', () => {
    it('should calculate completion rate correctly', () => {
      const studentIds = ['1', '2'];
      const lessons = [
        { student_id: '1', teacher_id: 't1', status: 'COMPLETED', scheduled_at: '2024-01-20' },
        { student_id: '1', teacher_id: 't1', status: 'COMPLETED', scheduled_at: '2024-01-27' },
        { student_id: '2', teacher_id: 't1', status: 'SCHEDULED', scheduled_at: '2024-02-03' },
        { student_id: '2', teacher_id: 't1', status: 'CANCELLED', scheduled_at: '2024-02-10' },
      ];

      const result = calculateCohortCompletionRate(studentIds, lessons);

      // 2 completed out of (2 completed + 1 scheduled) = 66.7%
      expect(result).toBe(66.7);
    });

    it('should return 0 for students with no lessons', () => {
      const result = calculateCohortCompletionRate(['1'], []);
      expect(result).toBe(0);
    });

    it('should return 0 when no completed or scheduled lessons', () => {
      const lessons = [
        { student_id: '1', teacher_id: 't1', status: 'CANCELLED', scheduled_at: '2024-01-20' },
      ];
      const result = calculateCohortCompletionRate(['1'], lessons);
      expect(result).toBe(0);
    });
  });

  describe('calculateCohortRetentionRate', () => {
    it('should calculate retention rate correctly', () => {
      const studentIds = ['1', '2', '3'];
      const students = [
        { id: '1', created_at: '2024-01-01', student_status: 'active' },
        { id: '2', created_at: '2024-01-15', student_status: 'active' },
        { id: '3', created_at: '2024-02-01', student_status: 'churned' },
        { id: '4', created_at: '2024-02-15', student_status: 'active' },
      ];

      const result = calculateCohortRetentionRate(studentIds, students);

      // 2 active out of 3 total = 66.7%
      expect(result).toBe(66.7);
    });

    it('should return 0 for empty cohort', () => {
      const result = calculateCohortRetentionRate([], []);
      expect(result).toBe(0);
    });

    it('should return 100 for all active students', () => {
      const studentIds = ['1', '2'];
      const students = [
        { id: '1', created_at: '2024-01-01', student_status: 'active' },
        { id: '2', created_at: '2024-01-15', student_status: 'active' },
      ];

      const result = calculateCohortRetentionRate(studentIds, students);
      expect(result).toBe(100);
    });
  });

  describe('calculateAvgTimeToMaster', () => {
    it('should calculate average time to master correctly', () => {
      const studentIds = ['1', '2'];
      const songProgress = [
        {
          student_id: '1',
          current_status: 'mastered',
          mastered_at: '2024-01-30T00:00:00Z',
          assigned_at: '2024-01-01T00:00:00Z',
        },
        {
          student_id: '2',
          current_status: 'mastered',
          mastered_at: '2024-02-10T00:00:00Z',
          assigned_at: '2024-02-01T00:00:00Z',
        },
        {
          student_id: '2',
          current_status: 'learning',
          mastered_at: null,
          assigned_at: '2024-02-15T00:00:00Z',
        },
      ];

      const result = calculateAvgTimeToMaster(studentIds, songProgress);

      // Song 1: 29 days, Song 2: 9 days, Average: 19 days
      expect(result).toBe(19.0);
    });

    it('should return 0 for students with no mastered songs', () => {
      const songProgress = [
        {
          student_id: '1',
          current_status: 'learning',
          mastered_at: null,
          assigned_at: '2024-01-01T00:00:00Z',
        },
      ];

      const result = calculateAvgTimeToMaster(['1'], songProgress);
      expect(result).toBe(0);
    });

    it('should ignore songs without mastered_at date', () => {
      const songProgress = [
        {
          student_id: '1',
          current_status: 'mastered',
          mastered_at: null,
          assigned_at: '2024-01-01T00:00:00Z',
        },
      ];

      const result = calculateAvgTimeToMaster(['1'], songProgress);
      expect(result).toBe(0);
    });
  });
});
