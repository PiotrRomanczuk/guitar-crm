interface OptionType {
  value: string;
  label: string;
}

interface Props {
  label: string;
  id: string;
  value: string;
  error?: string;
  options: OptionType[];
  required?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export default function SongFormFieldSelect({
  label,
  id,
  value,
  error,
  options,
  required,
  onChange,
  onBlur,
}: Props) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium leading-none text-foreground"
      >
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        data-testid={`song-${id}`}
        aria-invalid={!!error}
        className={`w-full h-9 rounded-md shadow-xs transition-all duration-200 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring text-sm px-3 py-1 bg-background dark:bg-input/30 border ${
          error
            ? 'border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
            : 'border-input hover:border-muted-foreground'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
