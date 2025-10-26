interface CheckboxInputProps {
	id: string;
	label: string;
	description?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export function CheckboxInput({
	id,
	label,
	description,
	checked,
	onChange,
}: CheckboxInputProps) {
	return (
		<label className='flex items-center'>
			<input
				type='checkbox'
				id={id}
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className='rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500'
			/>
			<span className='ml-2 text-sm text-gray-700 dark:text-gray-300'>
				{label}
				{description && ` - ${description}`}
			</span>
		</label>
	);
}
