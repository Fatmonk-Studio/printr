import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, RotateCw } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { ImagePreviewCanvas, CropData } from "./ImagePreviewCanvas";
import { toast } from "sonner";

// Import frame assets
import classicWoodFrame from "@/assets/frames/classic-wood.png";
import modernBlackFrame from "@/assets/frames/modern-black.png";
import elegantWhiteFrame from "@/assets/frames/elegant-white.png";

type Format = "HD matte sticker paper" | "3mm Board HD matte pasted frame" | "5mm Board HD matte pasted frame" | "Premium Framed Print with Glass" | "Premium Framed Print without Glass";
type Size = "8.5x4" | "12x18" | "16x24" | "24x36";
type FrameType = "classic-wood" | "modern-black" | "elegant-white";

const sizes: Record<Size, { name: string; price: number }> = {
  "8.5x4": { name: "8.5\" x 4\" - Small", price: 250 },
  "12x18": { name: "12\" x 18\" - Medium", price: 350 },
  "16x24": { name: "16\" x 24\" - Large", price: 500 },
  "24x36": { name: "24\" x 36\" - Extra Large", price: 1000 },
};

const formats: Format[] = [
  "HD matte sticker paper",
  "3mm Board HD matte pasted frame",
  "5mm Board HD matte pasted frame",
  "Premium Framed Print with Glass",
  "Premium Framed Print without Glass",
];

const frames: Record<FrameType, { name: string; image: string; price: number }> = {
  "classic-wood": { name: "Classic Wood", image: classicWoodFrame, price: 150 },
  "modern-black": { name: "Modern Black", image: modernBlackFrame, price: 200 },
  "elegant-white": { name: "Elegant White", image: elegantWhiteFrame, price: 175 },
};

interface PhotoItem {
  id: string;
  file: File;
  format: Format;
  size: Size;
  frameType: FrameType;
  preview: string;
  cropData?: CropData;
  orientation: "horizontal" | "vertical";
}

const sizePreviewDimensions: Record<Size, { width: number; height: number }> = {
  "8.5x4": { width: 235, height: 100 },
  "12x18": { width: 235, height: 315 },
  "16x24": { width: 235, height: 315 },
  "24x36": { width: 235, height: 315 },
};

export const FrameFlow = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: PhotoItem = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            format: "HD matte sticker paper",
            size: "12x18",
            frameType: "classic-wood",
            preview: e.target?.result as string,
            cropData: { x: 0, y: 0, scale: 1 },
            orientation: "horizontal",
          };
          setPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    toast.success(`${files.length} photo(s) uploaded successfully!`);
  };

  const updatePhoto = (id: string, updates: Partial<PhotoItem>) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === id ? { ...photo, ...updates } : photo
    ));
  };

  const updatePhotoCrop = (id: string, cropData: CropData) => {
    updatePhoto(id, { cropData });
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const rotateOrientation = (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      updatePhoto(id, { 
        orientation: photo.orientation === "horizontal" ? "vertical" : "horizontal" 
      });
    }
  };

  const getTotalPrice = () => {
    return photos.reduce((total, photo) => 
      total + sizes[photo.size].price + frames[photo.frameType].price, 0
    );
  };

  const handleSubmitOrder = (contactData: ContactFormData) => {
    console.log('Frame order submitted:', { photos, contactData, totalPrice: getTotalPrice() });
  };

  if (showContactForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Order Summary</h2>
          <Button variant="outline" onClick={() => setShowContactForm(false)}>
            Back to Photos
          </Button>
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Framed Photos ({photos.length})</h3>
          <div className="space-y-2">
            {photos.map((photo) => (
              <div key={photo.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">{photo.file.name}</p>
                  <p className="text-xs text-muted-foreground">{frames[photo.frameType].name} Frame</p>
                </div>
                <span className="text-sm font-medium">
                  {sizes[photo.size].price + frames[photo.frameType].price} tk
                </span>
              </div>
            ))}
          </div>
        </Card>
        
        <ContactForm onSubmit={handleSubmitOrder} totalPrice={getTotalPrice()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Upload Photos to Frame</h2>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Upload photos to create beautiful framed prints</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="frame-upload"
          />
          <Label htmlFor="frame-upload">
            <Button variant="outline" asChild>
              <span>Choose Photos</span>
            </Button>
          </Label>
        </div>
      </Card>

      {/* Photos List */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Configure Your Framed Photos</h2>
          
          {photos.map((photo) => (
            <Card key={photo.id} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Frame Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Frame Preview</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateOrientation(photo.id)}
                      >
                        <RotateCw className="w-4 h-4 mr-1" />
                        Rotate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  {/* Frame Preview Container with fixed size */}
                  <div className="space-y-4">
                    {/* Fixed position controls - above frame */}
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Preview & Crop</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          updatePhotoCrop(photo.id, { x: 0, y: 0, scale: 1 });
                        }}
                      >
                        Reset
                      </Button>
                    </div>

                    {/* Fixed Frame Container */}
                    <div className="relative flex justify-center items-center" style={{ 
                      minHeight: `${sizePreviewDimensions["12x18"].height * 1.3}px` 
                    }}>
                      {/* Image Canvas - Dynamic size based on selected size */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                      }}>
                        <ImagePreviewCanvas
                          imageUrl={photo.preview}
                          width={photo.orientation === "horizontal" 
                            ? sizePreviewDimensions[photo.size].width 
                            : sizePreviewDimensions[photo.size].height}
                          height={photo.orientation === "horizontal" 
                            ? sizePreviewDimensions[photo.size].height 
                            : sizePreviewDimensions[photo.size].width}
                          onCropChange={(cropData) => updatePhotoCrop(photo.id, cropData)}
                          showControls={false}
                          initialCropData={photo.cropData}
                        />
                      </div>
                      
                      {/* Frame overlay - Fixed at 12x18 size */}
                      <img
                        src={frames[photo.frameType].image}
                        alt="Frame overlay"
                        className={`absolute pointer-events-none transition-transform duration-300`}
                        style={{ 
                          mixBlendMode: 'multiply',
                          top: '50%',
                          left: '50%',
                          width: `${(photo.orientation === "horizontal" 
                            ? sizePreviewDimensions["12x18"].width 
                            : sizePreviewDimensions["12x18"].height) * 1.9}px`,
                          height: `${(photo.orientation === "horizontal" 
                            ? sizePreviewDimensions["12x18"].height 
                            : sizePreviewDimensions["12x18"].width) * 1.9}px`,
                          objectFit: 'contain',
                          transform: `translate(-50%, -50%) ${photo.orientation === "horizontal" ? "rotate(90deg)" : ""}`,
                          zIndex: 2
                        }}
                      />
                    </div>

                    {/* Fixed position zoom controls - below frame */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Zoom</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((photo.cropData?.scale || 1) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newScale = Math.max(0.1, (photo.cropData?.scale || 1) - 0.1);
                            updatePhotoCrop(photo.id, { 
                              x: photo.cropData?.x || 0, 
                              y: photo.cropData?.y || 0, 
                              scale: newScale 
                            });
                          }}
                        >
                          -
                        </Button>
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.1"
                          value={photo.cropData?.scale || 1}
                          onChange={(e) => {
                            updatePhotoCrop(photo.id, {
                              x: photo.cropData?.x || 0,
                              y: photo.cropData?.y || 0,
                              scale: parseFloat(e.target.value)
                            });
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newScale = Math.min(3, (photo.cropData?.scale || 1) + 0.1);
                            updatePhotoCrop(photo.id, { 
                              x: photo.cropData?.x || 0, 
                              y: photo.cropData?.y || 0, 
                              scale: newScale 
                            });
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* <p className="text-sm text-muted-foreground truncate">
                    📁 {photo.file.name} ({photo.orientation})
                  </p> */}
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Frame Options</h3>
                  
                  <div className="space-y-2">
                    <Label>Frame Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(frames).map(([key, frame]) => (
                        <button
                          key={key}
                          onClick={() => updatePhoto(photo.id, { frameType: key as FrameType })}
                          className={`p-2 border rounded-lg text-sm transition-colors ${
                            photo.frameType === key 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img src={frame.image} alt={frame.name} className="w-full h-12 object-contain mb-1 rounded bg-gray-50" />
                          <p className="font-medium">{frame.name}</p>
                          <p className="text-xs text-muted-foreground">+{frame.price} tk</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select
                        value={photo.format}
                        onValueChange={(value: Format) => updatePhoto(photo.id, { format: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formats.map((format) => (
                            <SelectItem key={format} value={format}>
                              {format}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select
                        value={photo.size}
                        onValueChange={(value: Size) => updatePhoto(photo.id, { size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(sizes).map(([key, size]) => (
                            <SelectItem key={key} value={key}>
                              {size.name} - {size.price} tk
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">Price for this framed photo:</span>
                      <p className="text-sm text-muted-foreground">
                        Print: {sizes[photo.size].price} tk + Frame: {frames[photo.frameType].price} tk
                      </p>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {sizes[photo.size].price + frames[photo.frameType].price} tk
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Continue Button */}
          <div className="flex justify-between items-center p-6 bg-card rounded-lg border">
            <div>
              <p className="text-lg font-semibold">Total: {getTotalPrice()} tk</p>
              <p className="text-muted-foreground">{photos.length} framed photo(s)</p>
            </div>
            <Button variant="hero" size="lg" onClick={() => setShowContactForm(true)}>
              Continue to Contact Info
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};