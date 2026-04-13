import React, { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCcw, GripVertical } from "lucide-react";

interface CollageItemProps {
  id: string;
  image: string;
  index: number;
  onRemove: (index: number) => void;
  totalImages: number;
  layoutClass: string;
  onTransformChange?: (
    id: string,
    scale: number,
    position: { x: number; y: number },
  ) => void;
}

const CollageItem: React.FC<CollageItemProps> = ({
  id,
  image,
  index,
  onRemove,
  layoutClass,
  onTransformChange,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id,
    disabled: isActive, // Disable sortable when in edit mode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isSortableDragging ? 1000 : "auto",
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive || isSortableDragging) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const newPosition = {
        x: initialPos.current.x + deltaX,
        y: initialPos.current.y + deltaY,
      };

      setPosition(newPosition);
      onTransformChange?.(id, scale, newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive || isSortableDragging) return;

    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    initialPos.current = { ...position };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartPos.current.x;
        const deltaY = touch.clientY - dragStartPos.current.y;

        const newPosition = {
          x: initialPos.current.x + deltaX,
          y: initialPos.current.y + deltaY,
        };

        setPosition(newPosition);
        onTransformChange?.(id, scale, newPosition);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    setScale(newScale);
    onTransformChange?.(id, newScale, position);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newScale = Math.min(3, scale + 0.1);
    setScale(newScale);
    onTransformChange?.(id, newScale, position);
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newScale = Math.max(0.5, scale - 0.1);
    setScale(newScale);
    onTransformChange?.(id, newScale, position);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onTransformChange?.(id, 1, { x: 0, y: 0 });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSortableDragging) return;
    e.stopPropagation();
    setIsActive(!isActive);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(index);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${layoutClass} relative overflow-hidden rounded-lg border-2 transition-all group ${
        isActive
          ? "border-primary ring-2 ring-primary/20 z-10"
          : "border-gray-200"
      } ${isSortableDragging ? "opacity-50" : ""}`}
      onClick={handleClick}
    >
      {/* Sortable Handle - Only visible when not in edit mode */}
      {!isActive && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 cursor-move bg-black/70 hover:bg-black/90 p-2 sm:p-1.5 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          onClick={(e) => e.stopPropagation()}
          style={{ touchAction: "none" }}
        >
          <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
      )}

      {/* Remove Button */}
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 z-20 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleRemove}
      >
        <X className="w-3 h-3" />
      </Button>

      {/* Image Controls - Only visible when active */}
      {isActive && (
        <div className="absolute bottom-2 right-2 z-20 flex gap-0.5 sm:gap-1 bg-black/80 rounded p-0.5 sm:p-1">
          <Button
            variant="outline"
            size="sm"
            className="w-5 h-5 sm:w-7 sm:h-7 p-0 bg-white/90 hover:bg-white"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-5 h-5 sm:w-7 sm:h-7 p-0 bg-white/90 hover:bg-white"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-5 h-5 sm:w-7 sm:h-7 p-0 bg-white/90 hover:bg-white"
            onClick={handleReset}
          >
            <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
        </div>
      )}

      {/* Image */}
      <div
        className="w-full h-full relative overflow-hidden touch-none"
        onMouseDown={isActive ? handleMouseDown : undefined}
        onTouchStart={isActive ? handleTouchStart : undefined}
        onWheel={isActive ? handleWheel : undefined}
      >
        <img
          src={image}
          alt={`Collage item ${index + 1}`}
          className={`w-full h-full object-contain transition-transform select-none ${
            isActive ? "cursor-grab" : "cursor-pointer"
          } ${isDragging ? "cursor-grabbing" : ""}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center",
          }}
          draggable={false}
        />

        {/* Active State Overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-primary opacity-50"></div>
          </div>
        )}
      </div>

      {/* Instructions - Only visible when active on desktop */}
      {isActive && (
        <div className="hidden sm:block absolute bottom-2 left-2 z-20 bg-black/80 text-white text-xs p-2 rounded max-w-32">
          <p className="leading-tight">
            Drag to pan
            <br />
            Scroll to zoom
          </p>
        </div>
      )}

      {/* Edit Mode Indicator - Only visible on desktop */}
      {isActive && (
        <div className="hidden sm:block absolute top-2 left-2 z-20 bg-primary text-white text-xs px-2 py-1 rounded">
          Edit Mode
        </div>
      )}
    </div>
  );
};

export default CollageItem;
