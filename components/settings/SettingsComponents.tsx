'use client';
import { Label } from '@/components/ui/label';

export function SettingsHeader() {
  return (
    <header className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Settings</h1>
      <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
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
    <section>
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
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
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
					${checked ? 'bg-primary' : 'bg-muted'}
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
  error?: string;
}

export function SelectSetting({
  id,
  label,
  description,
  value,
  options,
  onChange,
  disabled = false,
  error,
}: SelectSettingProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-3 py-2 text-sm border bg-background text-foreground rounded-lg shadow-sm transition-all duration-200 hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-destructive' : 'border-border'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
