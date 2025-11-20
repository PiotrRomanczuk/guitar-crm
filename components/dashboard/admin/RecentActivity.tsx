import React from 'react';

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export function RecentActivity({ recentUsers }: { recentUsers: RecentUser[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        📋 Recent Users
      </h2>

      {recentUsers && recentUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">
                    {user.full_name}
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No recent users yet.</p>
      )}
    </div>
  );
}
