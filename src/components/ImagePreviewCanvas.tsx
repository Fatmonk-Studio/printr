import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ImagePreviewCanvasProps {
  imageUrl: string;
  width: number;
  height: number;
  onCropChange?: (cropData: CropData) => void;
}

export interface CropData {
  x: number;
  y: number;
  scale: number;
}

export const ImagePreviewCanvas = ({ imageUrl, width, height, onCropChange }: ImagePreviewCanvasProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

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
    onCropChange?.({
      x: imagePosition.x,
      y: imagePosition.y,
      scale: newScale,
    });
  };

  const resetPosition = () => {
    setImagePosition({ x: 0, y: 0 });
    setScale(1);
    onCropChange?.({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Preview & Crop</h4>
        <Button variant="outline" size="sm" onClick={resetPosition}>
          Reset
        </Button>
      </div>
      
      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className="relative bg-white border-2 border-dashed border-border rounded-lg mx-auto overflow-hidden cursor-move"
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
        
        {/* Overlay Instructions */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-black/50 text-white px-3 py-1 rounded text-sm opacity-75">
            Drag to position • Scroll to zoom
          </div>
        </div>
      </div>

      {/* Scale Controls */}
      <div className="space-y-2">
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

      <p className="text-xs text-muted-foreground text-center">
        Drag the image to position it within the print area. Use zoom controls to scale.
      </p>
    </div>
  );
};