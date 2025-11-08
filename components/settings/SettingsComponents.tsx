'use client';
import { Label } from '@/components/ui/label';

export function SettingsHeader() {
  return (
    <header className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">⚙️ Settings</h1>
      <p className="text-xs sm:text-base lg:text-lg text-muted-foreground">
        Manage your preferences and account settings
      </p>
    </header>
  );
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6 last:border-b-0">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-1">{title}</h2>
        {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface ToggleSettingProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSetting({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleSettingProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <Label htmlFor={id} className="text-sm sm:text-base font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
					relative inline-flex h-6 w-11 items-center rounded-full transition-colors
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
					${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
					${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
				`}
      >
        <span
          className={`
						inline-block h-4 w-4 transform rounded-full bg-white transition-transform
						${checked ? 'translate-x-6' : 'translate-x-1'}
					`}
        />
      </button>
    </div>
  );
}

interface SelectSettingProps {
  id: string;
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SelectSetting({
  id,
  label,
  description,
  value,
  options,
  onChange,
  disabled = false,
}: SelectSettingProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm sm:text-base font-medium">
        {label}
      </Label>
      {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
