import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { ImagePreviewCanvas, CropData } from "./ImagePreviewCanvas";
import { toast } from "sonner";

type Format = "HD matte sticker paper" | "3mm Board HD matte pasted frame" | "5mm Board HD matte pasted frame" | "Premium Framed Print with Glass" | "Premium Framed Print without Glass";

type Size = "8.5x4" | "12x18" | "16x24" | "24x36";

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

interface PhotoItem {
  id: string;
  file: File;
  format: Format;
  size: Size;
  preview: string;
  cropData?: CropData;
}

// Size dimensions for preview (scaled down for display)
const sizePreviewDimensions: Record<Size, { width: number; height: number }> = {
  "8.5x4": { width: 212, height: 100 },   // 8.5:4 ratio
  "12x18": { width: 200, height: 300 },   // 12:18 ratio  
  "16x24": { width: 200, height: 300 },   // 16:24 ratio
  "24x36": { width: 200, height: 300 },   // 24:36 ratio
};

export const PrintPhotoFlow = () => {
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
            preview: e.target?.result as string,
            cropData: { x: 0, y: 0, scale: 1 },
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

  const getTotalPrice = () => {
    return photos.reduce((total, photo) => total + sizes[photo.size].price, 0);
  };

  const handleSubmitOrder = (contactData: ContactFormData) => {
    console.log('Order submitted:', { photos, contactData, totalPrice: getTotalPrice() });
    // Here you would typically send the order to your backend
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
          <h3 className="text-lg font-semibold mb-4">Your Photos ({photos.length})</h3>
          <div className="space-y-2">
            {photos.map((photo) => (
              <div key={photo.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">{photo.file.name}</span>
                <span className="text-sm font-medium">{sizes[photo.size].name} - {sizes[photo.size].price} tk</span>
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
        <h2 className="text-2xl font-semibold mb-4">Upload Photos</h2>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Click to upload photos or drag and drop</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="photo-upload"
          />
          <Label htmlFor="photo-upload">
            <Button variant="outline" asChild>
              <span>Choose Photos</span>
            </Button>
          </Label>
        </div>
      </Card>

      {/* Photos List */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Configure Your Photos</h2>
          
          {photos.map((photo) => (
            <Card key={photo.id} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview Canvas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Interactive Preview</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  
                  <ImagePreviewCanvas
                    imageUrl={photo.preview}
                    width={sizePreviewDimensions[photo.size].width}
                    height={sizePreviewDimensions[photo.size].height}
                    onCropChange={(cropData) => updatePhotoCrop(photo.id, cropData)}
                  />
                  
                  <p className="text-sm text-muted-foreground truncate">
                    📁 {photo.file.name}
                  </p>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Print Options</h3>
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
                      <span className="font-medium">Price for this photo:</span>
                      <p className="text-sm text-muted-foreground">{sizes[photo.size].name}</p>
                    </div>
                    <span className="text-xl font-bold text-primary">{sizes[photo.size].price} tk</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Continue Button */}
          <div className="flex justify-between items-center p-6 bg-card rounded-lg border">
            <div>
              <p className="text-lg font-semibold">Total: {getTotalPrice()} tk</p>
              <p className="text-muted-foreground">{photos.length} photo(s)</p>
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