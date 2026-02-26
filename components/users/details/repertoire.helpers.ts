import type { StudentRepertoireWithSong } from '@/types/StudentRepertoire';

export const PRIORITY_ORDER: Record<string, number> = { high: 0, normal: 1, low: 2, archived: 3 };

export function groupRepertoireItems(
  items: StudentRepertoireWithSong[],
  groupBy: string
): { label: string; items: StudentRepertoireWithSong[] }[] {
  if (groupBy === 'none') {
    return [{ label: 'ungrouped', items }];
  }

  const groups = new Map<string, StudentRepertoireWithSong[]>();

  for (const item of items) {
    const key = groupBy === 'priority' ? item.priority : item.current_status;
    const label = key.replace('_', ' ');
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    if (!groups.has(capitalizedLabel)) {
      groups.set(capitalizedLabel, []);
    }
    groups.get(capitalizedLabel)!.push(item);
  }

  const entries = Array.from(groups.entries());
  if (groupBy === 'priority') {
    entries.sort((a, b) => {
      const aOrder = PRIORITY_ORDER[a[1][0]?.priority] ?? 99;
      const bOrder = PRIORITY_ORDER[b[1][0]?.priority] ?? 99;
      return aOrder - bOrder;
    });
  }

  return entries.map(([label, groupItems]) => ({ label, items: groupItems }));
}
