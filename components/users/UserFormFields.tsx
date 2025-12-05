import { FormData } from './useUserFormState';

interface UserFormFieldsProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UserFormFields({ formData, onChange }: UserFormFieldsProps) {
  return (
    <>
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="firstName-input"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="lastName-input"
          />
        </div>
      </div>

      {/* Email & Username */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email {formData.isShadow ? '(Optional)' : '*'}
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required={!formData.isShadow}
            placeholder={
              formData.isShadow ? 'No email required for shadow user' : 'user@example.com'
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="email-input"
          />
        </div>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="username-input"
          />
        </div>
      </div>

      {/* Roles */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Roles & Status
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isShadow"
              checked={formData.isShadow}
              onChange={onChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              data-testid="isShadow-checkbox"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Shadow User (No login access, email optional)
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={onChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              data-testid="isAdmin-checkbox"
            />
            <span className="text-gray-700 dark:text-gray-300">Admin</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isTeacher"
              checked={formData.isTeacher}
              onChange={onChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              data-testid="isTeacher-checkbox"
            />
            <span className="text-gray-700 dark:text-gray-300">Teacher</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isStudent"
              checked={formData.isStudent}
              onChange={onChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              data-testid="isStudent-checkbox"
            />
            <span className="text-gray-700 dark:text-gray-300">Student</span>
          </label>
        </div>
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={onChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            data-testid="isActive-checkbox"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active User</span>
        </label>
      </div>
    </>
  );
}
