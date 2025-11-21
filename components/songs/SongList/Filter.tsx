import type { SongFilters } from '../types';

interface Props {
  filters: SongFilters;
  onChange: (filters: SongFilters) => void;
}

export default function SongListFilter({ filters, onChange }: Props) {
  const handleLevelChange = (level: string) => {
    onChange({
      ...filters,
      level: level === '' ? null : (level as SongFilters['level']),
    });
  };

  const handleSearchChange = (search: string) => {
    onChange({
      ...filters,
      search: search === '' ? undefined : search,
    });
  };

  return (
    <div className="py-4 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label htmlFor="search-filter" className="block mb-2 font-medium">
          Search
        </label>
        <input
          id="search-filter"
          type="text"
          placeholder="Search by title or author..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="w-full sm:w-48">
        <label htmlFor="level-filter" className="block mb-2 font-medium">
          Filter by level
        </label>
        <select
          id="level-filter"
          value={filters.level || ''}
          onChange={(e) => handleLevelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
    </div>
  );
}
