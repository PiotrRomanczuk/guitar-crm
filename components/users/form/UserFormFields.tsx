import { ChangeEvent } from 'react';
import { FormData } from '../hooks/useUserFormState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface UserFormFieldsProps {
  formData: FormData;
  errors?: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (field: string) => void;
}

export default function UserFormFields({ formData, errors = {}, onChange, onBlur }: UserFormFieldsProps) {
  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    const event = {
      target: {
        name,
        type: 'checkbox',
        checked,
      },
    } as ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <>
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            onBlur={() => onBlur?.('firstName')}
            data-testid="firstName-input"
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive" role="alert">
              {errors.firstName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            onBlur={() => onBlur?.('lastName')}
            data-testid="lastName-input"
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive" role="alert">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Email & Username */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email {formData.isShadow ? '(Optional)' : '*'}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            onBlur={() => onBlur?.('email')}
            required={!formData.isShadow}
            placeholder={
              formData.isShadow ? 'No email required for shadow user' : 'user@example.com'
            }
            data-testid="email-input"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">
              {errors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={onChange}
            onBlur={() => onBlur?.('username')}
            data-testid="username-input"
            aria-invalid={!!errors.username}
          />
          {errors.username && (
            <p className="text-sm text-destructive" role="alert">
              {errors.username}
            </p>
          )}
        </div>
      </div>

      {/* Roles - Multiple roles per user are now supported (e.g., Admin + Teacher) */}
      <div className="space-y-3">
        <Label>Roles & Status</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isShadow"
              checked={formData.isShadow}
              onCheckedChange={handleCheckboxChange('isShadow')}
              data-testid="isShadow-checkbox"
            />
            <Label htmlFor="isShadow" className="font-normal cursor-pointer">
              Shadow User (No login access, email optional)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAdmin"
              checked={formData.isAdmin}
              onCheckedChange={handleCheckboxChange('isAdmin')}
              data-testid="isAdmin-checkbox"
            />
            <Label htmlFor="isAdmin" className="font-normal cursor-pointer">
              Admin
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isTeacher"
              checked={formData.isTeacher}
              onCheckedChange={handleCheckboxChange('isTeacher')}
              data-testid="isTeacher-checkbox"
            />
            <Label htmlFor="isTeacher" className="font-normal cursor-pointer">
              Teacher
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isStudent"
              checked={formData.isStudent}
              onCheckedChange={handleCheckboxChange('isStudent')}
              data-testid="isStudent-checkbox"
            />
            <Label htmlFor="isStudent" className="font-normal cursor-pointer">
              Student
            </Label>
          </div>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={handleCheckboxChange('isActive')}
          data-testid="isActive-checkbox"
        />
        <Label htmlFor="isActive" className="font-medium cursor-pointer">
          Active User
        </Label>
      </div>
    </>
  );
}
