'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inviteUser } from '@/app/dashboard/actions';
import { QuickActionButton } from './QuickActionButton';
import { InviteUserSchema } from '@/schemas/InviteUserSchema';
import FormAlert from '@/components/shared/FormAlert';
import { toast } from 'sonner';

interface InviteUserModalProps {
  trigger?: React.ReactNode;
  initialEmail?: string;
  initialName?: string;
  initialPhone?: string;
}

interface FieldErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  role?: string;
}

export function InviteUserModal({ trigger, initialEmail = '', initialName = '', initialPhone = '' }: InviteUserModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    fullName: false,
    phone: false,
    role: false,
  });
  const fullNameInputRef = useRef<HTMLInputElement>(null);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const result = InviteUserSchema.safeParse({ email, fullName, phone, role });

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (touched[field] && !errors[field]) {
          errors[field] = issue.message;
        }
      }
    }

    return errors;
  };

  // Update field errors when touched fields or values change
  useEffect(() => {
    if (Object.values(touched).some(Boolean)) {
      setFieldErrors(validate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, fullName, phone, role, touched.email, touched.fullName, touched.phone, touched.role]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setEmail(initialEmail);
      setFullName(initialName);
      setPhone(initialPhone);
      setRole('student');
      setError(null);
      setFieldErrors({});
      setTouched({
        email: false,
        fullName: false,
        phone: false,
        role: false,
      });
      // Auto-focus on name input when modal opens
      setTimeout(() => {
        fullNameInputRef.current?.focus();
      }, 0);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      fullName: true,
      phone: true,
      role: true,
    });

    // Validate all fields
    const result = InviteUserSchema.safeParse({ email, fullName, phone, role });
    if (!result.success) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await inviteUser(email, fullName, role, phone || undefined);
        if (result.success) {
          toast.success('User invited successfully!');
          setOpen(false);
          setEmail('');
          setFullName('');
          setPhone('');
          setRole('student');
          setTouched({
            email: false,
            fullName: false,
            phone: false,
            role: false,
          });
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="w-full">
            <QuickActionButton
              emoji="✉️"
              title="Invite User"
              description="Send an invitation to a new user"
            />
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              ref={fullNameInputRef}
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
                if (touched.fullName) {
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }
              }}
              onBlur={() => setTouched({ ...touched, fullName: true })}
              placeholder="John Doe"
              required
              aria-invalid={!!fieldErrors.fullName}
              className={fieldErrors.fullName ? 'border-destructive' : ''}
            />
            {fieldErrors.fullName && (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
                if (touched.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              onBlur={() => setTouched({ ...touched, email: true })}
              placeholder="user@example.com"
              required
              aria-invalid={!!fieldErrors.email}
              className={fieldErrors.email ? 'border-destructive' : ''}
            />
            {fieldErrors.email && (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+48 123 456 789"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError(null);
                if (touched.phone) {
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              onBlur={() => setTouched({ ...touched, phone: true })}
              aria-invalid={!!fieldErrors.phone}
              className={fieldErrors.phone ? 'border-destructive' : ''}
            />
            {fieldErrors.phone && (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(val: 'student' | 'teacher' | 'admin') => {
                setRole(val);
                setError(null);
              }}
            >
              <SelectTrigger
                id="role"
                aria-invalid={!!fieldErrors.role}
                className={fieldErrors.role ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.role && (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.role}
              </p>
            )}
          </div>

          {error && <FormAlert type="error" message={error} />}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
