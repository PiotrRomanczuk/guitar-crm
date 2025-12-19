import { getContactsAction } from './actions';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { AddContactDialog } from '@/components/contacts/AddContactDialog';
import { SyncStudentsButton } from '@/components/contacts/SyncStudentsButton';

export default async function ContactsPage() {
  const { data: contacts, error } = await getContactsAction();

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading contacts: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <p className="text-muted-foreground">
            Manage your email marketing contacts and sync with students.
          </p>
        </div>
        <div className="flex gap-4">
          <SyncStudentsButton />
          <AddContactDialog />
        </div>
      </div>

      <ContactsTable contacts={contacts || []} />
    </div>
  );
}
