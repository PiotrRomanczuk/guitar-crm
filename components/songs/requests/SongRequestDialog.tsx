'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SongRequestFormSchema } from '@/schemas/SongRequestSchema';
import { submitSongRequest } from '@/app/actions/song-requests';

interface SongRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SongRequestDialog({ isOpen, onClose, onSuccess }: SongRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState({
    title: '',
    artist: '',
    notes: '',
    url: '',
  });

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleBlurValidation = useCallback(
    (field: string, value: string) => {
      const partial = { ...formValues, [field]: value };
      const result = SongRequestFormSchema.safeParse(partial);
      if (!result.success) {
        const fieldError = result.error.issues.find((e) => e.path[0] === field);
        if (fieldError) {
          setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
        }
      }
    },
    [formValues]
  );

  const handleSubmit = async () => {
    const parsed = SongRequestFormSchema.safeParse(formValues);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((e) => {
        const key = String(e.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitSongRequest(parsed.data);
      if (!result.success) {
        toast.error(result.error ?? 'Failed to submit request');
        return;
      }
      toast.success('Song request submitted!');
      setFormValues({ title: '', artist: '', notes: '', url: '' });
      setErrors({});
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Request a Song</DialogTitle>
          <DialogDescription>
            Tell your teacher which song you would like to learn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="req-title">Song Title *</Label>
            <Input
              id="req-title"
              placeholder="e.g. Wonderwall"
              value={formValues.title}
              onChange={(e) => {
                setFormValues((p) => ({ ...p, title: e.target.value }));
                clearFieldError('title');
              }}
              onBlur={(e) => handleBlurValidation('title', e.target.value)}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-artist">Artist</Label>
            <Input
              id="req-artist"
              placeholder="e.g. Oasis"
              value={formValues.artist}
              onChange={(e) => {
                setFormValues((p) => ({ ...p, artist: e.target.value }));
                clearFieldError('artist');
              }}
              onBlur={(e) => handleBlurValidation('artist', e.target.value)}
              aria-invalid={!!errors.artist}
            />
            {errors.artist && (
              <p className="text-xs text-destructive">{errors.artist}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-url">Link (YouTube, Spotify, etc.)</Label>
            <Input
              id="req-url"
              type="url"
              placeholder="https://..."
              value={formValues.url}
              onChange={(e) => {
                setFormValues((p) => ({ ...p, url: e.target.value }));
                clearFieldError('url');
              }}
              onBlur={(e) => handleBlurValidation('url', e.target.value)}
              aria-invalid={!!errors.url}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="req-notes">Notes</Label>
            <Textarea
              id="req-notes"
              placeholder="Why do you want to learn this song?"
              value={formValues.notes}
              onChange={(e) => {
                setFormValues((p) => ({ ...p, notes: e.target.value }));
                clearFieldError('notes');
              }}
              rows={3}
              aria-invalid={!!errors.notes}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
