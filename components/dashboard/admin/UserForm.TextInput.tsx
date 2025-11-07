import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
		<div className='space-y-2'>
			<Label htmlFor={id}>
				{label} {required && <span className='text-destructive'>*</span>}
			</Label>
			<Input
				type={type}
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={error ? 'border-destructive' : ''}
			/>
			{error && <p className='text-sm text-destructive'>{error}</p>}
		</div>
	);
}
