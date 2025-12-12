import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  filterStatus: string;
  onFilterChange: (status: string) => void;
  filterStudentId?: string;
  onStudentFilterChange?: (studentId: string) => void;
  students?: { id: string; full_name: string }[];
  showStudentFilter?: boolean;
}

export default function LessonListFilter({
  filterStatus,
  onFilterChange,
  filterStudentId = 'all',
  onStudentFilterChange,
  students = [],
  showStudentFilter = false,
}: Props) {
  return (
    <div
      data-testid="lessons-filters"
      className="bg-card rounded-xl border border-border p-4 sm:p-6 mb-6 opacity-0 animate-fade-in"
      style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-status">Filter by Status</Label>
          <Select value={filterStatus} onValueChange={onFilterChange}>
            <SelectTrigger id="filter-status" data-testid="filter-status-trigger">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lessons</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showStudentFilter && onStudentFilterChange && (
          <div className="space-y-2">
            <Label htmlFor="filter-student">Filter by Student</Label>
            <Select value={filterStudentId} onValueChange={onStudentFilterChange}>
              <SelectTrigger id="filter-student" data-testid="filter-student-trigger">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name || student.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
