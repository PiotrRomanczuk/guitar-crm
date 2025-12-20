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
}

export default function SongFormFieldSelect({
  label,
  id,
  value,
  error,
  options,
  required,
  onChange,
}: Props) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-medium mb-1 text-xs sm:text-sm text-gray-800 dark:text-gray-200"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`song-${id}`}
        className={`w-full rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-700 border ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1">{error}</p>}
    </div>
  );
}
