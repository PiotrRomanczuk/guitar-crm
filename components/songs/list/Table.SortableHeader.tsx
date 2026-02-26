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
    <button
      type="button"
      className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors text-sm font-medium"
      onClick={() => onSort?.(field)}
    >
      {children}
      <Icon className={`h-4 w-4 ${isActive ? 'text-foreground' : 'text-muted-foreground/40'}`} />
    </button>
  );
}
