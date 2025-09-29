import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface CollageSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PhotoSlot {
  id: string;
  photo?: File;
  preview?: string;
  cropData: { x: number; y: number; scale: number; rotation: number };
}

interface CollageLayoutPreviewProps {
  layout: {
    slots: CollageSlot[];
  };
  photoSlots: PhotoSlot[];
  onPhotoSlotUpdate: (slots: PhotoSlot[]) => void;
  width: number;
  height: number;
  availablePhotos: File[];
}

export const CollageLayoutPreview = ({ 
  layout, 
  photoSlots, 
  onPhotoSlotUpdate, 
  width, 
  height,
  availablePhotos 
}: CollageLayoutPreviewProps) => {
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null);
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePhotoDragStart = (photoIndex: number) => {
    setDraggedPhoto(photoIndex);
  };

  const handleSlotDragStart = (slotIndex: number) => {
    setDraggedSlot(slotIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSlotDrop = (e: React.DragEvent, targetSlotIndex: number) => {
    e.preventDefault();
    
    if (draggedPhoto !== null) {
      // Dropping a new photo into a slot
      const newSlots = [...photoSlots];
      newSlots[targetSlotIndex] = {
        ...newSlots[targetSlotIndex],
        photo: availablePhotos[draggedPhoto],
        preview: URL.createObjectURL(availablePhotos[draggedPhoto]),
        cropData: { x: 0, y: 0, scale: 1, rotation: 0 }
      };
      onPhotoSlotUpdate(newSlots);
    } else if (draggedSlot !== null && draggedSlot !== targetSlotIndex) {
      // Swapping photos between slots
      const newSlots = [...photoSlots];
      const temp = newSlots[draggedSlot];
      newSlots[draggedSlot] = newSlots[targetSlotIndex];
      newSlots[targetSlotIndex] = temp;
      onPhotoSlotUpdate(newSlots);
    }
    
    setDraggedPhoto(null);
    setDraggedSlot(null);
  };

  const updateCropData = (slotIndex: number, updates: Partial<PhotoSlot['cropData']>) => {
    const newSlots = [...photoSlots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      cropData: { ...newSlots[slotIndex].cropData, ...updates }
    };
    onPhotoSlotUpdate(newSlots);
  };

  const handleImagePan = (slotIndex: number, deltaX: number, deltaY: number) => {
    const slot = photoSlots[slotIndex];
    if (!slot.photo) return;

    updateCropData(slotIndex, {
      x: Math.max(-50, Math.min(50, slot.cropData.x + deltaX)),
      y: Math.max(-50, Math.min(50, slot.cropData.y + deltaY))
    });
  };

  const handleZoom = (slotIndex: number, delta: number) => {
    const slot = photoSlots[slotIndex];
    if (!slot.photo) return;

    const newScale = Math.max(0.5, Math.min(3, slot.cropData.scale + delta));
    updateCropData(slotIndex, { scale: newScale });
  };

  const resetCrop = (slotIndex: number) => {
    updateCropData(slotIndex, { x: 0, y: 0, scale: 1, rotation: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Available Photos */}
      <div className="grid grid-cols-5 gap-2 p-4 bg-muted rounded-lg">
        <h4 className="col-span-5 text-sm font-medium mb-2">Drag photos to slots:</h4>
        {availablePhotos.map((photo, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handlePhotoDragStart(index)}
            className="relative cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
          >
            <img
              src={URL.createObjectURL(photo)}
              alt={`Photo ${index + 1}`}
              className="w-full h-16 object-cover rounded border-2 border-transparent hover:border-primary"
            />
          </div>
        ))}
      </div>

      {/* Collage Preview */}
      <div className="relative">
        <div 
          ref={containerRef}
          className="relative border-2 border-dashed border-border rounded-lg mx-auto bg-white"
          style={{ width, height }}
        >
          {layout.slots.map((slot, index) => {
            const photoSlot = photoSlots[index];
            const isActive = activeSlot === index;
            
            return (
              <div
                key={index}
                className={`absolute border border-border bg-gray-50 overflow-hidden transition-all ${
                  isActive ? 'ring-2 ring-primary border-primary' : ''
                }`}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleSlotDrop(e, index)}
                onClick={() => setActiveSlot(isActive ? null : index)}
              >
                {photoSlot?.preview ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={photoSlot.preview}
                      alt={`Slot ${index + 1}`}
                      draggable
                      onDragStart={() => handleSlotDragStart(index)}
                      className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                      style={{
                        transform: `translate(${photoSlot.cropData.x}%, ${photoSlot.cropData.y}%) scale(${photoSlot.cropData.scale}) rotate(${photoSlot.cropData.rotation}deg)`,
                        transformOrigin: 'center'
                      }}
                      onMouseDown={(e) => {
                        if (!isActive) return;
                        
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const slotRect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (!slotRect) return;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = ((moveEvent.clientX - startX) / slotRect.width) * 100;
                          const deltaY = ((moveEvent.clientY - startY) / slotRect.height) * 100;
                          handleImagePan(index, deltaX * 0.1, deltaY * 0.1);
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      onWheel={(e) => {
                        if (!isActive) return;
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? -0.1 : 0.1;
                        handleZoom(index, delta);
                      }}
                    />
                    
                    {/* Image Controls */}
                    {isActive && (
                      <div className="absolute top-2 right-2 flex gap-1 bg-background/90 rounded p-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0"
                          onClick={() => handleZoom(index, 0.1)}
                        >
                          <ZoomIn className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0"
                          onClick={() => handleZoom(index, -0.1)}
                        >
                          <ZoomOut className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0"
                          onClick={() => resetCrop(index)}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    Drop photo here
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {activeSlot !== null && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Click and drag to pan • Scroll to zoom • Use controls to adjust
          </p>
        )}
      </div>
    </div>
  );
};