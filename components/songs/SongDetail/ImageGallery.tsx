'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageGallery() {
  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="w-5 h-5 text-primary" />
          Gallery
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-8">
          <Plus className="w-4 h-4 mr-1" />
          Add Image
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Placeholder for empty state */}
          <div className="col-span-full py-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
            <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No images yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Upload sheet music, diagrams, or photos.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
