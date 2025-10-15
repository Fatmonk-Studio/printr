import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { CollageGrid, GridCell } from "./CollageLayouts";

interface PhotoData {
  id: string;
  file: File;
  preview: string;
}

interface CollageLayoutPreviewProps {
  grid: CollageGrid;
  photos: PhotoData[];
  width: number;
  height: number;
  onGridUpdate: (grid: CollageGrid) => void;
}

export const CollageLayoutPreview = ({ 
  grid, 
  photos, 
  width, 
  height,
  onGridUpdate 
}: CollageLayoutPreviewProps) => {
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const [draggedCell, setDraggedCell] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePhotoDragStart = (photoId: string) => {
    setDraggedPhoto(photoId);
  };

  const handleCellDragStart = (cellId: string) => {
    setDraggedCell(cellId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCellDrop = (e: React.DragEvent, targetCellId: string) => {
    e.preventDefault();
    
    const newGrid = { ...grid };
    const targetCell = newGrid.cells.find(cell => cell.id === targetCellId);
    if (!targetCell) return;

    if (draggedPhoto) {
      // Dropping a new photo into a cell
      targetCell.photoId = draggedPhoto;
    } else if (draggedCell && draggedCell !== targetCellId) {
      // Swapping photos between cells
      const sourceCell = newGrid.cells.find(cell => cell.id === draggedCell);
      if (sourceCell) {
        const tempPhotoId = sourceCell.photoId;
        sourceCell.photoId = targetCell.photoId;
        targetCell.photoId = tempPhotoId;
      }
    }
    
    onGridUpdate(newGrid);
    setDraggedPhoto(null);
    setDraggedCell(null);
  };

  const updateCellTransform = (cellId: string, updates: Partial<Pick<GridCell, 'scale' | 'offsetX' | 'offsetY'>>) => {
    const newGrid = { ...grid };
    const cell = newGrid.cells.find(c => c.id === cellId);
    if (cell) {
      Object.assign(cell, updates);
      onGridUpdate(newGrid);
    }
  };

  const handleImagePan = (cellId: string, deltaX: number, deltaY: number) => {
    const cell = grid.cells.find(c => c.id === cellId);
    if (!cell || !cell.photoId) return;

    updateCellTransform(cellId, {
      offsetX: Math.max(-50, Math.min(50, cell.offsetX + deltaX)),
      offsetY: Math.max(-50, Math.min(50, cell.offsetY + deltaY))
    });
  };

  const handleZoom = (cellId: string, delta: number) => {
    const cell = grid.cells.find(c => c.id === cellId);
    if (!cell || !cell.photoId) return;

    const newScale = Math.max(0.5, Math.min(3, cell.scale + delta));
    updateCellTransform(cellId, { scale: newScale });
  };

  const resetCellTransform = (cellId: string) => {
    updateCellTransform(cellId, { scale: 1, offsetX: 0, offsetY: 0 });
  };

  const getPhotoById = (photoId: string) => {
    return photos.find(photo => photo.id === photoId);
  };

  const removePhotoFromCell = (cellId: string) => {
    const newGrid = { ...grid };
    const cell = newGrid.cells.find(c => c.id === cellId);
    if (cell) {
      cell.photoId = undefined;
      onGridUpdate(newGrid);
    }
  };

  return (
    <div className="space-y-4">
      {/* Available Photos */}
      <div className="grid grid-cols-5 gap-2 p-4 bg-muted rounded-lg">
        <h4 className="col-span-5 text-sm font-medium mb-2">Drag photos to grid cells:</h4>
        {photos.map((photo) => {
          const isUsed = grid.cells.some(cell => cell.photoId === photo.id);
          return (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handlePhotoDragStart(photo.id)}
              className={`relative cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
                isUsed ? 'opacity-50' : ''
              }`}
            >
              <img
                src={photo.preview}
                alt="Available photo"
                className="w-full h-16 object-cover rounded border-2 border-transparent hover:border-primary"
              />
              {isUsed && (
                <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                  <span className="text-xs text-white font-medium">Used</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid Preview */}
      <div className="relative">
        <div 
          ref={containerRef}
          className="relative border-2 border-dashed border-border rounded-lg mx-auto bg-white"
          style={{ width, height }}
        >
          {grid.cells.map((cell) => {
            const photo = cell.photoId ? getPhotoById(cell.photoId) : null;
            const isActive = activeCell === cell.id;
            
            return (
              <div
                key={cell.id}
                className={`absolute border border-border bg-gray-50 overflow-hidden transition-all ${
                  isActive ? 'ring-2 ring-primary border-primary z-10' : ''
                }`}
                style={{
                  left: `${cell.x}%`,
                  top: `${cell.y}%`,
                  width: `${cell.width}%`,
                  height: `${cell.height}%`,
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleCellDrop(e, cell.id)}
                onClick={() => setActiveCell(isActive ? null : cell.id)}
              >
                {photo ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={photo.preview}
                      alt={`Cell ${cell.id}`}
                      draggable
                      onDragStart={() => handleCellDragStart(cell.id)}
                      className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                      style={{
                        transform: `translate(${cell.offsetX}%, ${cell.offsetY}%) scale(${cell.scale})`,
                        transformOrigin: 'center'
                      }}
                      onMouseDown={(e) => {
                        if (!isActive) return;
                        
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const cellRect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (!cellRect) return;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = ((moveEvent.clientX - startX) / cellRect.width) * 100;
                          const deltaY = ((moveEvent.clientY - startY) / cellRect.height) * 100;
                          handleImagePan(cell.id, deltaX * 0.1, deltaY * 0.1);
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
                        handleZoom(cell.id, delta);
                      }}
                    />
                    
                    {/* Image Controls */}
                    {isActive && (
                      <div className="absolute top-2 right-2 flex gap-1 bg-background/90 rounded p-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0"
                          onClick={() => handleZoom(cell.id, 0.1)}
                        >
                          <ZoomIn className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0"
                          onClick={() => handleZoom(cell.id, -0.1)}
                        >
                          <ZoomOut className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-6 h-6 p-0"
                          onClick={() => resetCellTransform(cell.id)}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Remove Photo Button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 left-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhotoFromCell(cell.id)}
                    >
                      <Move className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-border">
                    <div className="text-center">
                      <div className="text-2xl mb-1">+</div>
                      <div>Drop photo</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {activeCell && (
          <div className="text-sm text-muted-foreground mt-2 text-center space-y-1">
            <p>📱 Click and drag to pan • 🔍 Scroll to zoom • 🎛️ Use controls to adjust</p>
            <p>🎯 Click on a cell to activate it • 🔄 Drag photos between cells to swap</p>
          </div>
        )}
      </div>

      {/* Grid Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Grid: {grid.rows}×{grid.cols} • Cells: {grid.cells.length} • Photos used: {grid.cells.filter(cell => cell.photoId).length}</p>
      </div>
    </div>
  );
};