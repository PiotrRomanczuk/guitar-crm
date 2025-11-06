import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
		<div className='flex items-top space-x-2'>
			<Checkbox
				id={id}
				checked={checked}
				onCheckedChange={(checked) => onChange(checked === true)}
			/>
			<div className='grid gap-1.5 leading-none'>
				<Label
					htmlFor={id}
					className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
				>
					{label}
				</Label>
				{description && (
					<p className='text-xs text-muted-foreground'>{description}</p>
				)}
			</div>
		</div>
	);
}
