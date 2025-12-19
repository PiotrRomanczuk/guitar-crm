'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteContactAction } from '@/app/dashboard/contacts/actions';
import { toast } from 'sonner';
import { useState, useTransition } from 'react';

interface Contact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  unsubscribed?: boolean;
}

interface ContactsTableProps {
  contacts: Contact[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteContactAction(id);
      if (result.success) {
        toast.success('Contact deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete contact');
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No contacts found.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.email}</TableCell>
                <TableCell>{contact.first_name || '-'}</TableCell>
                <TableCell>{contact.last_name || '-'}</TableCell>
                <TableCell>
                  {contact.unsubscribed ? (
                    <span className="text-red-500">Unsubscribed</span>
                  ) : (
                    <span className="text-green-500">Subscribed</span>
                  )}
                </TableCell>
                <TableCell>
                  {contact.created_at
                    ? new Date(contact.created_at).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(contact.id)}
                    disabled={isPending && deletingId === contact.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
