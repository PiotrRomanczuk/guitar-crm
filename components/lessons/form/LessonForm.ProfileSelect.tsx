import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Profile[];
  label: string;
  name: string;
  error?: string;
}

export function ProfileSelect({ value, onChange, options, label, name, error }: Props) {
  const handleValueChange = (newValue: string) => {
    // Create synthetic event for compatibility
    const syntheticEvent = {
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={handleValueChange} required>
        <SelectTrigger id={name} data-testid={`lesson-${name}`} className="w-full">
          <SelectValue placeholder={`Select a ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <div className="flex flex-col">
                <span className="font-medium">{option.full_name || option.email}</span>
                {option.full_name && (
                  <span className="text-xs text-muted-foreground">{option.email}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
