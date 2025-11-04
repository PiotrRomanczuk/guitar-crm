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
			<label htmlFor={id} className='block font-medium mb-1'>
				{label}
				{required && <span className='text-red-500'> *</span>}
			</label>
			<select
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={`w-full px-3 py-2 border rounded ${
					error ? 'border-red-500' : 'border-gray-300'
				}`}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && <p className='text-red-600 text-sm mt-1'>{error}</p>}
		</div>
	);
}
