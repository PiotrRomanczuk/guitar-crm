// Deprecated: AuthProvider-based debug page. TODO: Replace with SSR debug using getUserWithRolesSSR
export default function DebugAuthPage() {
  return (
    <div className="p-3 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
        🐛 Authentication Debug (deprecated)
      </h1>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        This page relied on the removed AuthProvider. Please use server-side helpers instead.
      </p>
    </div>
  );
}
