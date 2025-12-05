'use client';

import { useEffect, useState } from 'react';
import { getPotentialCustomerEvents } from '@/app/dashboard/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Phone } from 'lucide-react';
import { InviteUserModal } from '../InviteUserModal';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  attendees?: { email: string; displayName?: string; self?: boolean }[];
}

interface PotentialUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  eventDate: string;
  sourceEventId: string;
  originalSummary?: string;
  rawDescription?: string;
}

export function PotentialUsersList() {
  const [users, setUsers] = useState<PotentialUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const events = await getPotentialCustomerEvents();
        if (events) {
          const parsedUsers = (events as GoogleEvent[])
            .map((event) => parseUserFromEvent(event))
            .filter((user): user is PotentialUser => user !== null);

          // Filter duplicates based on email
          const uniqueUsers = parsedUsers.filter(
            (user, index, self) =>
              !user.email || index === self.findIndex((t) => t.email === user.email)
          );

          setUsers(uniqueUsers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading)
    return <div className="p-4 text-center text-muted-foreground">Loading potential users...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Potential Users{' '}
          <span className="text-sm font-normal text-muted-foreground">({users.length} unique)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{user.name}</span>
                      {user.name === 'Unknown' && (
                        <Badge
                          variant="secondary"
                          className="w-fit text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        >
                          Check Details
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" /> {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {user.name === 'Unknown' && user.originalSummary && (
                        <div className="text-xs mb-1">Event: {user.originalSummary}</div>
                      )}
                      {!user.email && !user.phone && user.rawDescription && (
                        <div className="text-xs bg-muted p-2 rounded whitespace-pre-wrap max-w-[200px]">
                          {user.rawDescription.length > 100
                            ? user.rawDescription.substring(0, 100) + '...'
                            : user.rawDescription}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <InviteUserModal
                      trigger={<Button size="sm">Convert</Button>}
                      initialEmail={user.email}
                      initialName={user.name}
                      initialPhone={user.phone}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    No potential users found from recent &apos;First Lesson&apos; events.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function extractName(line: string): string | undefined {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('imię:') || lowerLine.includes('imie:') || lowerLine.includes('name:')) {
    return line.split(':')[1]?.trim();
  }
  return undefined;
}

function extractEmail(line: string): string | undefined {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('email:') || lowerLine.includes('e-mail:')) {
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) return emailMatch[0];
  }
  return undefined;
}

function extractPhone(line: string): string | undefined {
  const lowerLine = line.toLowerCase();
  if (
    lowerLine.includes('telefon:') ||
    lowerLine.includes('phone:') ||
    lowerLine.includes('tel:')
  ) {
    return line.split(':')[1]?.trim();
  }
  return undefined;
}

function extractInfoFromDescription(description: string) {
  let name = undefined;
  let email = undefined;
  let phone = undefined;

  const lines = description.split('\n');
  for (const line of lines) {
    name = name || extractName(line);
    email = email || extractEmail(line);
    phone = phone || extractPhone(line);
  }
  return { name, email, phone };
}

function extractNameFromSummary(summary: string): string | undefined {
  const cleanSummary = summary.trim();
  const parts = cleanSummary.split('-');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  if (cleanSummary.toLowerCase() !== 'pierwsza lekcja') {
    return cleanSummary;
  }
  return undefined;
}

function resolveName(event: GoogleEvent, extractedNameFromDesc?: string): string {
  let name = extractedNameFromDesc || 'Unknown';

  if (name === 'Unknown' && event.summary) {
    const summaryName = extractNameFromSummary(event.summary);
    if (summaryName) name = summaryName;
  }

  if (name.toLowerCase() === 'pierwsza lekcja') {
    name = 'Unknown';
  }

  return name;
}

function extractInfoFromAttendees(
  attendees?: { email: string; displayName?: string; self?: boolean }[]
) {
  if (!attendees) return { email: undefined, name: undefined };

  const attendee = attendees.find((a) => !a.self);
  if (attendee) {
    return { email: attendee.email, name: attendee.displayName };
  }
  return { email: undefined, name: undefined };
}

function parseUserFromEvent(event: GoogleEvent): PotentialUser | null {
  let email = undefined;
  let phone = undefined;
  let extractedName = undefined;

  if (event.description) {
    const info = extractInfoFromDescription(event.description);
    extractedName = info.name;
    email = info.email;
    phone = info.phone;
  }

  // Try to extract from attendees if email is missing
  if (!email) {
    const attendeeInfo = extractInfoFromAttendees(event.attendees);
    if (attendeeInfo.email) {
      email = attendeeInfo.email;
      if (!extractedName && attendeeInfo.name) {
        extractedName = attendeeInfo.name;
      }
    }
  }

  let name = resolveName(event, extractedName);

  // If name is Unknown but we have an email, use email as name
  if (name === 'Unknown' && email) {
    name = email;
  }

  // Relaxed filter: Return even if unknown, so user can see the raw data
  // We can filter strictly later if needed, but for now visibility is key

  return {
    id: event.id,
    name,
    email,
    phone,
    eventDate: event.start.dateTime || event.start.date || '',
    sourceEventId: event.id,
    originalSummary: event.summary,
    rawDescription: event.description,
  };
}
