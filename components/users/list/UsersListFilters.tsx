'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface UsersListFiltersProps {
  search: string;
  roleFilter: '' | 'admin' | 'teacher' | 'student';
  activeFilter: '' | 'true' | 'false';
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: '' | 'admin' | 'teacher' | 'student') => void;
  onActiveFilterChange: (value: '' | 'true' | 'false') => void;
  onReset: () => void;
}

export default function UsersListFilters({
  search,
  roleFilter,
  activeFilter,
  onSearchChange,
  onRoleFilterChange,
  onActiveFilterChange,
  onReset,
}: UsersListFiltersProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            type="text"
            placeholder="Search by email, name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="search-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={roleFilter || 'all'}
            onValueChange={(value) =>
              onRoleFilterChange(value === 'all' ? '' : (value as typeof roleFilter))
            }
          >
            <SelectTrigger data-testid="role-filter">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={activeFilter || 'all'}
            onValueChange={(value) =>
              onActiveFilterChange(value === 'all' ? '' : (value as typeof activeFilter))
            }
          >
            <SelectTrigger data-testid="status-filter">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full"
            data-testid="reset-filters"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
