/**
 * Empty state for assignment list
 */
export function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 
                    text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm 
                    border border-gray-200 dark:border-gray-700">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full 
                      bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-2xl sm:text-3xl">📋</span>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
        No assignments yet
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-sm">
        Assignments will appear here once they are created. Teachers can create new assignments
        for their students.
      </p>
    </div>
  );
}
