interface TextInputProps {
	id: string;
	label: string;
	value: string;
	error?: string;
	placeholder: string;
	required?: boolean;
	type?: 'text' | 'email';
	onChange: (value: string) => void;
}

export function TextInput({
	id,
	label,
	value,
	error,
	placeholder,
	required = false,
	type = 'text',
	onChange,
}: TextInputProps) {
	return (
		<div>
			<label
				htmlFor={id}
				className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
			>
				{label} {required && '*'}
			</label>
			<input
				type={type}
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
					error
						? 'border-red-300 dark:border-red-600'
						: 'border-gray-300 dark:border-gray-600'
				}`}
				placeholder={placeholder}
			/>
			{error && (
				<p className='text-red-600 dark:text-red-400 text-sm mt-1'>{error}</p>
			)}
		</div>
	);
}
