'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  endpoint: string;
}

export function ExportButton({ endpoint }: ExportButtonProps) {
  const handleExport = (format: 'csv' | 'json') => {
    // Construct URL with query parameters
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('format', format);
    
    // Open in new tab to trigger download
    window.open(url.toString(), '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
