import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreadImageGalleryProps {
  images: string[];
}

export function ThreadImageGallery({ images }: ThreadImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={cn(
        "grid gap-2 mb-4",
        images.length === 1 && "grid-cols-1",
        images.length === 2 && "grid-cols-2",
        images.length >= 3 && "grid-cols-2 sm:grid-cols-3"
      )}>
        {images.map((url, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-opacity",
              images.length === 1 ? "aspect-video" : "aspect-square"
            )}
          >
            <img 
              src={url} 
              alt={`Thread image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-0">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedIndex(null)}
              className="absolute top-2 right-2 z-10 bg-background/50 hover:bg-background/80"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-2 z-10 bg-background/50 hover:bg-background/80"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-2 z-10 bg-background/50 hover:bg-background/80"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Image */}
            {selectedIndex !== null && (
              <img 
                src={images[selectedIndex]} 
                alt={`Thread image ${selectedIndex + 1}`} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}

            {/* Image Counter */}
            {images.length > 1 && selectedIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/70 text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
