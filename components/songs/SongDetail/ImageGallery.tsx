'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Props {
  images?: string[] | null;
}

export default function ImageGallery({ images }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="w-5 h-5 text-primary" />
            Gallery
          </CardTitle>
          {/* TODO: Implement add image functionality */}
          {/* <Button variant="ghost" size="sm" className="h-8">
            <Plus className="w-4 h-4 mr-1" />
            Add Image
          </Button> */}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images && images.length > 0 ? (
              images.map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer group"
                  onClick={() => setSelectedImage(src)}
                >
                  <Image
                    src={src}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No images yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Upload sheet music, diagrams, or photos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 bg-transparent border-none shadow-none flex items-center justify-center">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {selectedImage && (
            <div className="relative w-full h-full min-h-[50vh]">
              <Image
                src={selectedImage}
                alt="Full screen preview"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
