import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X } from "lucide-react";

interface ImageSlotEditorProps {
  image: File | null;
  onRemove: () => void;
  zoom: number;
  position: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export const ImageSlotEditor = ({
  image,
  onRemove,
  zoom,
  position,
  onZoomChange,
  onPositionChange,
}: ImageSlotEditorProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;
    onPositionChange({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!image) return null;

  return (
    <div className="absolute inset-0 group">
      <div
        className="w-full h-full overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={URL.createObjectURL(image)}
          alt="Album photo"
          className="w-full h-full object-cover pointer-events-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transformOrigin: 'center',
          }}
        />
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="secondary"
          size="sm"
          className="w-7 h-7 p-0"
          onClick={() => onZoomChange(Math.min(zoom + 0.1, 3))}
        >
          <ZoomIn className="w-3 h-3" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-7 h-7 p-0"
          onClick={() => onZoomChange(Math.max(zoom - 0.1, 0.5))}
        >
          <ZoomOut className="w-3 h-3" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-7 h-7 p-0"
          onClick={onRemove}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
