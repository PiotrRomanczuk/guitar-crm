import Link from 'next/link';

interface HeaderProps {
  canCreate: boolean;
}

/**
 * Assignment list header with title and create button
 */
export function Header({ canCreate }: HeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        Assignments
      </h1>
      {canCreate && (
        <div className="flex gap-3">
          <Link
            href="/dashboard/assignments/templates"
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 
                       text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg 
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       transition-all duration-200 shadow-sm hover:shadow-md
                       dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Templates
          </Link>
          <Link
            href="/dashboard/assignments/new"
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 
                       text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       transition-all duration-200 shadow-sm hover:shadow-md
                       dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <span className="text-base sm:text-lg mr-1.5 sm:mr-2">+</span>
            <span>New Assignment</span>
          </Link>
        </div>
      )}
    </div>
  );
}
