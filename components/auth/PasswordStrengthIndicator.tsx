import { Check, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

function calculatePasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  requirements: PasswordRequirement[];
  percentage: number;
} {
  const requirements: PasswordRequirement[] = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const percentage = (metCount / requirements.length) * 100;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (metCount >= 4) strength = 'strong';
  else if (metCount >= 2) strength = 'medium';

  return { strength, requirements, percentage };
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { strength, requirements, percentage } = calculatePasswordStrength(password);

  const strengthColors = {
    weak: '[&_[data-slot=progress-indicator]]:bg-destructive',
    medium: '[&_[data-slot=progress-indicator]]:bg-warning',
    strong: '[&_[data-slot=progress-indicator]]:bg-success',
  };

  const strengthText = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  const strengthTextColors = {
    weak: 'text-destructive',
    medium: 'text-warning',
    strong: 'text-success',
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength:</span>
          <span className={`text-xs font-medium ${strengthTextColors[strength]}`}>
            {strengthText[strength]}
          </span>
        </div>
        <Progress
          value={percentage}
          className={`h-1.5 bg-muted ${strengthColors[strength]}`}
        />
      </div>

      {/* Requirements Checklist */}
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={req.met ? 'text-success' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
