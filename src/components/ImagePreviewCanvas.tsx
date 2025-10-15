import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface ImagePreviewCanvasProps {
  imageUrl: string;
  width: number;
  height: number;
  onCropChange?: (cropData: CropData) => void;
  showControls?: boolean; // New prop to control if controls are shown
  initialCropData?: CropData; // Initial crop data from parent
  onReset?: () => void; // Reset callback
  onScaleChange?: (scale: number) => void; // Scale change callback
}

export interface CropData {
  x: number;
  y: number;
  scale: number;
}

export const ImagePreviewCanvas = ({ 
  imageUrl, 
  width, 
  height, 
  onCropChange, 
  showControls = true,
  initialCropData,
  onReset,
  onScaleChange
}: ImagePreviewCanvasProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ 
    x: initialCropData?.x || 0, 
    y: initialCropData?.y || 0 
  });
  const [scale, setScale] = useState(initialCropData?.scale || 1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync with external crop data changes
  useEffect(() => {
    if (initialCropData) {
      setImagePosition({ x: initialCropData.x, y: initialCropData.y });
      setScale(initialCropData.scale);
    }
  }, [initialCropData]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  }, [imagePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };

    setImagePosition(newPosition);
    onCropChange?.({
      x: newPosition.x,
      y: newPosition.y,
      scale,
    });
  }, [isDragging, dragStart, scale, onCropChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    onScaleChange?.(newScale);
    onCropChange?.({
      x: imagePosition.x,
      y: imagePosition.y,
      scale: newScale,
    });
  };

  const resetPosition = () => {
    setImagePosition({ x: 0, y: 0 });
    setScale(1);
    onReset?.();
    onCropChange?.({ x: 0, y: 0, scale: 1 });
  };

  return (
    <>
      {showControls && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Preview & Crop</h4>
          <Button variant="outline" size="sm" onClick={resetPosition}>
            Reset
          </Button>
        </div>
      )}
      
      {/* Canvas Container - Isolated for frame overlay */}
      <div className="flex justify-center items-center">
        <div
          ref={canvasRef}
          className="relative bg-white border-2 border-dashed border-border overflow-hidden cursor-move"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: "100%",
            aspectRatio: `${width}/${height}`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="absolute select-none pointer-events-none"
            style={{
              transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${scale})`,
              transformOrigin: "top left",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
            draggable={false}
          />
        </div>
      </div>

      {showControls && (
        <>
          {/* Scale Controls - Separate from canvas */}
          <div className="space-y-2 pt-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Zoom</span>
              <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleScaleChange(Math.max(0.1, scale - 0.1))}
              >
                -
              </Button>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleScaleChange(Math.min(3, scale + 0.1))}
              >
                +
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};