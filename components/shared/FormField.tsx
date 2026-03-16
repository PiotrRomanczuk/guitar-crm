import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BaseFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
}

interface TextFieldProps extends BaseFieldProps {
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  rows?: number;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  children?: React.ReactNode;
}

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {error}
    </p>
  );
}

function FieldLabel({ label, id, required }: { label: string; id: string; required?: boolean }) {
  return (
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
  );
}

export function FormFieldText({
  label, id, value, error, type = 'text', placeholder, required, onChange, onBlur,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} id={id} required={required} />
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        data-testid={`field-${id}`}
        aria-invalid={!!error}
      />
      <FieldError error={error} />
    </div>
  );
}

export function FormFieldTextarea({
  label, id, value, error, rows = 4, placeholder, required, onChange, onBlur, children,
}: TextareaFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <FieldLabel label={label} id={id} required={required} />
        {children}
      </div>
      <Textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={rows}
        placeholder={placeholder}
        data-testid={`field-${id}`}
        className="resize-none"
        aria-invalid={!!error}
      />
      <FieldError error={error} />
    </div>
  );
}

export function FormFieldSelect({
  label, id, value, error, options, placeholder, required, onChange, onBlur,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} id={id} required={required} />
      <Select
        value={value}
        onValueChange={(v) => {
          onChange(v);
          onBlur?.();
        }}
      >
        <SelectTrigger
          id={id}
          data-testid={`field-${id}`}
          aria-invalid={!!error}
        >
          <SelectValue placeholder={placeholder ?? `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.description ? (
                <div className="flex flex-col">
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                </div>
              ) : (
                opt.label
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError error={error} />
    </div>
  );
}
