interface Props {
  label: string;
  id: string;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function SongFormFieldText({
  label,
  id,
  value,
  error,
  type = 'text',
  placeholder,
  required,
  onChange,
}: Props) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-medium mb-1 text-xs sm:text-sm text-foreground"
      >
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`song-${id}`}
        className={`w-full rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 bg-background border ${
          error
            ? 'border-destructive focus:ring-destructive focus:border-destructive'
            : 'border-border hover:border-muted-foreground'
        }`}
      />
      {error && <p className="text-destructive text-xs sm:text-sm mt-1">{error}</p>}
    </div>
  );
}
