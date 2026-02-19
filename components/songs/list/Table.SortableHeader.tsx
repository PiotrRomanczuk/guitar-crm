import { TableHead } from '@/components/ui/table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

type SortField = 'title' | 'author' | 'level' | 'key' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  sortBy?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

export default function SortableHeader({
  field,
  children,
  sortBy,
  sortDirection,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortBy === field;
  const Icon = isActive ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead
      className="text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort?.(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <Icon className={`h-4 w-4 ${isActive ? 'text-foreground' : 'text-muted-foreground/40'}`} />
      </div>
    </TableHead>
  );
}
