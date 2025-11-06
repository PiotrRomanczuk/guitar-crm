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
			<label htmlFor={id} className='block font-medium mb-1'>
				{label}
				{required && <span className='text-red-500'> *</span>}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={`w-full px-3 py-2 border rounded ${
					error ? 'border-red-500' : 'border-gray-300'
				}`}
			/>
			{error && <p className='text-red-600 text-sm mt-1'>{error}</p>}
		</div>
	);
}
