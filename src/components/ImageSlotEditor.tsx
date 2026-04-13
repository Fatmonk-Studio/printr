import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X } from "lucide-react";

interface ImageSlotEditorProps {
  image: File | null;
  onRemove: () => void;
  zoom: number;
  position: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPositionChange: (
    position: { x: number; y: number },
    viewportSize?: { width: number; height: number },
  ) => void;
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
  const [imageUrl, setImageUrl] = useState<string>("");
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(zoom);
  const isPinchingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!image) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !image) return;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    const viewportSize = containerRef.current
      ? {
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        }
      : undefined;

    onPositionChange(
      {
        x: dragStartRef.current.startX + deltaX,
        y: dragStartRef.current.startY + deltaY,
      },
      viewportSize,
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.hypot(dx, dy);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragMove(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const [touch1, touch2] = [e.touches[0], e.touches[1]];
      pinchStartDistanceRef.current = getTouchDistance(touch1, touch2);
      pinchStartZoomRef.current = zoom;
      isPinchingRef.current = true;
      handleDragEnd();
      return;
    }

    if (e.touches.length === 1 && !isPinchingRef.current) {
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinchingRef.current) {
      e.preventDefault();
      const [touch1, touch2] = [e.touches[0], e.touches[1]];
      const currentDistance = getTouchDistance(touch1, touch2);
      const startDistance = pinchStartDistanceRef.current;

      if (!startDistance || startDistance === 0) return;

      const scaleFactor = currentDistance / startDistance;
      const newZoom = Math.max(
        0.5,
        Math.min(3, pinchStartZoomRef.current * scaleFactor),
      );
      onZoomChange(newZoom);
      return;
    }

    if (e.touches.length === 1 && !isPinchingRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinchingRef.current && e.touches.length < 2) {
      isPinchingRef.current = false;
      pinchStartDistanceRef.current = null;
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
        return;
      }
    }

    if (e.touches.length === 0) {
      handleDragEnd();
    }
  };

  const handleTouchCancel = () => {
    isPinchingRef.current = false;
    pinchStartDistanceRef.current = null;
    handleDragEnd();
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    onZoomChange(newZoom);
  };

  if (!image) return null;

  return (
    <div className="absolute inset-0 group" ref={containerRef}>
      <div
        className="w-full h-full overflow-hidden cursor-move touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onWheel={handleWheel}
      >
        <img
          src={imageUrl}
          alt="Album photo"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        />
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pointer-events-auto">
        <Button
          variant="secondary"
          size="sm"
          className="w-6 h-6 sm:w-8 sm:h-8 p-0 touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
            onZoomChange(Math.min(zoom + 0.2, 3));
          }}
        >
          <ZoomIn className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-6 h-6 sm:w-8 sm:h-8 p-0 touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
            onZoomChange(Math.max(zoom - 0.2, 0.5));
          }}
        >
          <ZoomOut className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-6 h-6 sm:w-8 sm:h-8 p-0 touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};
