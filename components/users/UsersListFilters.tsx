'use client';

interface UsersListFiltersProps {
  search: string;
  roleFilter: '' | 'admin' | 'teacher' | 'student';
  activeFilter: '' | 'true' | 'false';
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: '' | 'admin' | 'teacher' | 'student') => void;
  onActiveFilterChange: (value: '' | 'true' | 'false') => void;
  onReset: () => void;
}

export function UsersListFilters({
  search,
  roleFilter,
  activeFilter,
  onSearchChange,
  onRoleFilterChange,
  onActiveFilterChange,
  onReset,
}: UsersListFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by email, name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            data-testid="search-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as typeof roleFilter)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            data-testid="role-filter"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={activeFilter}
            onChange={(e) => onActiveFilterChange(e.target.value as typeof activeFilter)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            data-testid="status-filter"
          >
            <option value="">All Users</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            data-testid="reset-filters"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
