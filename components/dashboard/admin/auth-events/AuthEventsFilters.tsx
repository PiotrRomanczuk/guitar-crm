'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { EVENT_TYPE_GROUPS } from './auth-events.helpers';
import type { AuthEventType } from './auth-events.helpers';

interface AuthEventsFiltersProps {
  email: string;
  onEmailChange: (value: string) => void;
  eventTypeGroup: string;
  onEventTypeGroupChange: (value: string) => void;
  eventType: string;
  onEventTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function AuthEventsFilters({
  email,
  onEmailChange,
  eventTypeGroup,
  onEventTypeGroupChange,
  eventType,
  onEventTypeChange,
  statusFilter,
  onStatusChange,
}: AuthEventsFiltersProps) {
  const groupTypes: AuthEventType[] = eventTypeGroup !== 'all'
    ? (EVENT_TYPE_GROUPS[eventTypeGroup] ?? [])
    : [];

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by email..."
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="sm:max-w-[240px]"
          />
          <Select value={eventTypeGroup} onValueChange={(val) => {
            onEventTypeGroupChange(val);
            onEventTypeChange('all');
          }}>
            <SelectTrigger className="sm:max-w-[160px]">
              <SelectValue placeholder="Event group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {Object.keys(EVENT_TYPE_GROUPS).map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {groupTypes.length > 0 && (
            <Select value={eventType} onValueChange={onEventTypeChange}>
              <SelectTrigger className="sm:max-w-[200px]">
                <SelectValue placeholder="Event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {groupTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="sm:max-w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
