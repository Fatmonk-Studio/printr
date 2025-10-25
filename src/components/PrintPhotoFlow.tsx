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

  const getDeliveryCharge = (contactData: ContactFormData) => {
    if (contactData.paymentMethod === "cod" && contactData.deliveryLocation === "inside-dhaka") {
      return 50;
    }
    return 0;
  };

  // Function to create print-ready cropped image from the original file
  const createPrintReadyImage = async (photo: PhotoItem): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate actual print dimensions at 300 DPI
        const printDimensions = {
          "8.5x4": { width: 2550, height: 1200 },   // 8.5" × 300 DPI, 4" × 300 DPI
          "12x18": { width: 3600, height: 5400 },   // 12" × 300 DPI, 18" × 300 DPI
          "16x24": { width: 4800, height: 7200 },   // 16" × 300 DPI, 24" × 300 DPI
          "24x36": { width: 7200, height: 10800 },  // 24" × 300 DPI, 36" × 300 DPI
        };

        const targetSize = printDimensions[photo.size];
        canvas.width = targetSize.width;
        canvas.height = targetSize.height;

        const cropData = photo.cropData || { x: 0, y: 0, scale: 1 };
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scaling factor from preview to full resolution
        const previewDimensions = sizePreviewDimensions[photo.size];
        const scaleX = targetSize.width / previewDimensions.width;
        const scaleY = targetSize.height / previewDimensions.height;
        
        // Apply transformations at full resolution
        ctx.save();
        ctx.translate(cropData.x * scaleX, cropData.y * scaleY);
        ctx.scale(cropData.scale, cropData.scale);
        
        // Calculate dimensions to fill the canvas
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight;
        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height / cropData.scale;
          drawWidth = drawHeight * imgAspect;
        } else {
          drawWidth = canvas.width / cropData.scale;
          drawHeight = drawWidth / imgAspect;
        }
        
        // Center the image
        const offsetX = (canvas.width / cropData.scale - drawWidth) / 2;
        const offsetY = (canvas.height / cropData.scale - drawHeight) / 2;
        
        // Draw the image at full resolution
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();

        // Convert to high-quality blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create blob'));
          }
        }, 'image/jpeg', 0.95); // 95% quality for print
      };
      
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = photo.preview;
    });
  };

  // Map sizes to size_id
  const getSizeId = (size: Size): number => {
    const sizeMap: Record<Size, number> = {
      "8.5x4": 1,
      "12x18": 2,
      "16x24": 3,
      "24x36": 4,
    };
    return sizeMap[size];
  };

  // Map formats to print_type_id
  const getPrintTypeId = (format: Format): number => {
    const formatMap: Record<Format, number> = {
      "HD matte sticker paper": 1,
      "3mm Board HD matte pasted frame": 2,
      "5mm Board HD matte pasted frame": 3,
      "Premium Framed Print with Glass": 4,
      "Premium Framed Print without Glass": 5,
    };
    return formatMap[format];
  };

  // Determine orientation based on size ratio
  const getOrientation = (size: Size): "landscape" | "portrait" => {
    const [width, height] = size.split('x').map(Number);
    return width > height ? "landscape" : "portrait";
  };

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    try {
      toast.loading("Processing images for print...");
      
      // Process all images to create print-ready files
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const printReadyBlob = await createPrintReadyImage(photo);
          return {
            photo,
            printReadyBlob,
          };
        })
      );

      toast.dismiss();
      toast.success("Images processed! Submitting order...");
      
      // Build API payload exactly as specified
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('phone', contactData.phone);
      formData.append('service_id', '1'); // Print photo service
      formData.append('location', contactData.location);
      formData.append('delivery_type', contactData.deliveryLocation || 'inside_dhaka');
      formData.append('payment_method', contactData.paymentMethod);
      
      // Add documents as separate form fields (not as JSON string)
      processedPhotos.forEach(({ photo, printReadyBlob }, index) => {
        formData.append(`documents[${index}][size_id]`, getSizeId(photo.size).toString());
        formData.append(`documents[${index}][frame_id]`, '');
        formData.append(`documents[${index}][orientation]`, getOrientation(photo.size));
        formData.append(`documents[${index}][bleed_type]`, 'none');
        formData.append(`documents[${index}][print_type_id]`, getPrintTypeId(photo.format).toString());
        
        const fileName = `photo_${index + 1}_${photo.file.name}`;
        formData.append(`documents[${index}][file]`, printReadyBlob, fileName);
      });
      
      // Send to API
      try {
        const response = await fetch(
          "https://admin.printr.store/api/service/submit",
          {
            method: "POST",
            body: formData,
          }
        );
      
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      
        const result = await response.json();
        
        toast.dismiss();
        toast.success(`Order confirmed! Order ID: ${result.orderId || result.id || 'Success'}`);
        
        // Reset form
        setPhotos([]);
        setShowContactForm(false);
        
      } catch (error) {
        toast.dismiss();
        toast.error('Failed to submit order. Please try again.');
        throw error;
      }
      
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to submit order. Please try again.');
    }
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