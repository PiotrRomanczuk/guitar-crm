'use client';

import { useState } from 'react';
import { fetchGoogleEvents, importLessonsFromGoogle, ImportEvent, EnrichedCalendarEvent } from '@/app/actions/import-lessons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, HelpCircle } from 'lucide-react';

export function GoogleEventImporter() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [events, setEvents] = useState<EnrichedCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleFetch = async () => {
    setLoading(true);
    try {
      const result = await fetchGoogleEvents(startDate, endDate);
      if (result.success && result.events) {
        setEvents(result.events);
        setSelected(new Set()); // Reset selection
      } else {
        toast.error(result.error || 'Failed to fetch events');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    const toImport: ImportEvent[] = events
      .filter(e => selected.has(e.id))
      .map(e => ({
        googleEventId: e.id,
        title: e.summary,
        notes: e.description,
        startTime: e.start.dateTime || e.start.date || '', // Handle all-day events if necessary
        attendeeEmail: e.studentAttendee?.email || '',
        attendeeName: e.studentAttendee?.displayName || '',
        manualStudentId: e.matchedStudent?.id, // Use matched student ID if available
      }))
      .filter(e => e.attendeeEmail); // Only import if email exists

    if (toImport.length === 0) {
      toast.error('No valid events selected');
      setImporting(false);
      return;
    }

    try {
      const result = await importLessonsFromGoogle(toImport);
      if (result.success) {
        const successCount = result.results?.filter(r => r.success).length || 0;
        toast.success(`Imported ${successCount} lessons`);
        // Refresh events or remove imported ones?
        handleFetch();
      } else {
        toast.error(result.error || 'Import failed');
      }
    } catch {
      toast.error('An error occurred during import');
    } finally {
      setImporting(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Start Date</label>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">End Date</label>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>
        <Button onClick={handleFetch} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Fetch Events
        </Button>
      </div>

      {events.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selected.size === events.length && events.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) setSelected(new Set(events.map(e => e.id)));
                      else setSelected(new Set());
                    }}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const attendee = event.studentAttendee;
                const hasAttendee = !!attendee?.email;
                const organizer = event.organizer;
                
                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selected.has(event.id)}
                        onCheckedChange={() => toggleSelection(event.id)}
                        disabled={!hasAttendee}
                      />
                    </TableCell>
                    <TableCell>
                      {event.start.dateTime 
                        ? new Date(event.start.dateTime).toLocaleString() 
                        : event.start.date}
                    </TableCell>
                    <TableCell>{event.summary}</TableCell>
                    <TableCell>
                      {event.matchedStudent ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <div className="flex flex-col">
                            <span className="font-medium">{event.matchedStudent.full_name}</span>
                            <span className="text-xs text-muted-foreground">{event.matchedStudent.email}</span>
                          </div>
                        </div>
                      ) : attendee ? (
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-yellow-500" />
                          <div className="flex flex-col">
                            <span>{attendee.displayName || 'Unknown Name'}</span>
                            <span className="text-xs text-muted-foreground">{attendee.email}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">No attendee</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {organizer ? (
                        <div className="flex flex-col">
                          <span>{organizer.displayName || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{organizer.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.matchStatus === 'MATCHED' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Matched
                        </Badge>
                      ) : event.matchStatus === 'AMBIGUOUS' ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Ambiguous
                        </Badge>
                      ) : hasAttendee ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          New Student
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Invalid
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {events.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleImport} disabled={importing || selected.size === 0}>
            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Import Selected ({selected.size})
          </Button>
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-8 p-4 border rounded-md bg-slate-50 overflow-auto">
          <h3 className="text-sm font-medium mb-2">Debug: Event Data (Piotr Zabuski)</h3>
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(
              events.find(e => e.summary.includes('Piotr Zabuski')) || events[0], 
              null, 
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
