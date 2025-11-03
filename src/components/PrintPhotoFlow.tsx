import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { ImagePreviewCanvas, CropData } from "./ImagePreviewCanvas";
import { toast } from "sonner";

interface PrintSize {
  id: number;
  name: string;
  print_type_id: number;
  status: number;
  price: string;
  dimention: string;
  created_at: string;
  updated_at: string;
}

interface PrintType {
  id: number;
  name: string;
  slug: string;
  status: number;
  created_at: string;
  updated_at: string;
  size: PrintSize[];
}

interface PhotoItem {
  id: string;
  file: File;
  printTypeId: number;
  sizeId: number;
  preview: string;
  cropData?: CropData;
  customSize?: {
    width: string;
    height: string;
  };
  useCustomSize?: boolean;
}

// Helper function to calculate preview dimensions based on actual size
const getPreviewDimensions = (dimention: string): { width: number; height: number } => {
  const parts = dimention.split('x').map(p => parseFloat(p.trim()));
  const [width, height] = parts;
  
  // Scale to fit preview (max 300px for larger dimension)
  const scale = 300 / Math.max(width, height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

export const PrintPhotoFlow = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [printTypes, setPrintTypes] = useState<PrintType[]>([]);
  const [loadingPrintTypes, setLoadingPrintTypes] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);

  // Fetch print types and sizes from API
  useEffect(() => {
    const fetchPrintTypes = async () => {
      try {
        const response = await fetch('https://admin.printr.store/api/print-type/list');
        const result = await response.json();
        
        if (result.success && result.data) {
          setPrintTypes(result.data);
        } else {
          toast.error('Failed to load print types');
        }
      } catch (error) {
        console.error('Error fetching print types:', error);
        toast.error('Failed to load print types');
      } finally {
        setLoadingPrintTypes(false);
      }
    };

    fetchPrintTypes();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const defaultPrintType = printTypes.length > 0 ? printTypes[0] : null;
          const defaultSize = defaultPrintType?.size?.[0];
          
          const newPhoto: PhotoItem = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            printTypeId: defaultPrintType?.id || 1,
            sizeId: defaultSize?.id || 1,
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

  const getPrintTypeById = (printTypeId: number): PrintType | undefined => {
    return printTypes.find(pt => pt.id === printTypeId);
  };

  const getSizeById = (sizeId: number): PrintSize | undefined => {
    for (const printType of printTypes) {
      const size = printType.size.find(s => s.id === sizeId);
      if (size) return size;
    }
    return undefined;
  };

  const getAvailableSizes = (printTypeId: number): PrintSize[] => {
    const printType = getPrintTypeById(printTypeId);
    return printType?.size || [];
  };

  const getExtraLargePrice = (): number => {
    // Find Extra Large size across all print types
    for (const printType of printTypes) {
      const extraLargeSize = printType.size.find(s => s.name === "Extra Large");
      if (extraLargeSize) {
        return parseFloat(extraLargeSize.price);
      }
    }
    return 0;
  };

  const getCustomSizePrice = (): number => {
    const extraLargePrice = getExtraLargePrice();
    return extraLargePrice + 200;
  };

  const getTotalPrice = () => {
    return photos.reduce((total, photo) => {
      if (photo.useCustomSize) {
        return total + getCustomSizePrice();
      }
      const size = getSizeById(photo.sizeId);
      return total + (size ? parseFloat(size.price) : 0);
    }, 0);
  };

  const getDeliveryCharge = (contactData: ContactFormData) => {
    if (contactData.paymentMethod === "cod" && contactData.deliveryLocation === "inside-dhaka") {
      return 50;
    }
    return 0;
  };

  const getOrientation = (dimention: string): "landscape" | "portrait" => {
    const parts = dimention.split('x').map(p => parseFloat(p.trim()));
    const [width, height] = parts;
    return width > height ? "landscape" : "portrait";
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

        let widthInches: number, heightInches: number;

        if (photo.useCustomSize && photo.customSize) {
          // Use custom size
          widthInches = parseFloat(photo.customSize.width);
          heightInches = parseFloat(photo.customSize.height);
        } else {
          // Use standard size from API
          const size = getSizeById(photo.sizeId);
          if (!size) {
            reject(new Error('Invalid size'));
            return;
          }
          // Parse dimensions from dimention string (e.g., "12\" x 18\"")
          const parts = size.dimention.split('x').map(p => parseFloat(p.trim()));
          [widthInches, heightInches] = parts;
        }
        
        // Calculate actual print dimensions at 300 DPI
        const targetWidth = widthInches * 300;
        const targetHeight = heightInches * 300;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const cropData = photo.cropData || { x: 0, y: 0, scale: 1 };
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scaling factor from preview to full resolution
        const dimensionString = photo.useCustomSize && photo.customSize 
          ? `${photo.customSize.width}" x ${photo.customSize.height}"`
          : getSizeById(photo.sizeId)?.dimention || "12\" x 18\"";
        const previewDimensions = getPreviewDimensions(dimensionString);
        
        // Calculate scale factor from preview to print resolution
        const outputScaleX = targetWidth / previewDimensions.width;
        const outputScaleY = targetHeight / previewDimensions.height;
        
        // The preview CSS does: transform: translate(x, y) scale(s) with transformOrigin: "top left"
        // The image renders to fit the preview width while maintaining aspect ratio
        const previewImageWidth = previewDimensions.width;
        const previewImageHeight = (img.height / img.width) * previewImageWidth;
        
        // Apply the transformations matching the preview
        ctx.save();
        
        // Scale the entire canvas coordinate system for high-res output
        ctx.scale(outputScaleX, outputScaleY);
        
        // Apply user's pan (translate) and zoom (scale) - same as preview
        ctx.translate(cropData.x, cropData.y);
        ctx.scale(cropData.scale, cropData.scale);
        
        // Draw the image at its preview size
        ctx.drawImage(img, 0, 0, previewImageWidth, previewImageHeight);
        
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
        let orientation = 'landscape';
        
        if (photo.useCustomSize && photo.customSize) {
          const customDimension = `${photo.customSize.width}" x ${photo.customSize.height}"`;
          orientation = getOrientation(customDimension);
          formData.append(`documents[${index}][size_id]`, ''); // Empty for custom size
          formData.append(`documents[${index}][custom_size]`, `${photo.customSize.width}x${photo.customSize.height}`);
        } else {
          const size = getSizeById(photo.sizeId);
          orientation = size ? getOrientation(size.dimention) : 'landscape';
          formData.append(`documents[${index}][size_id]`, photo.sizeId.toString());
        }
        
        formData.append(`documents[${index}][frame_id]`, '');
        formData.append(`documents[${index}][orientation]`, orientation);
        formData.append(`documents[${index}][bleed_type]`, 'none');
        formData.append(`documents[${index}][print_type_id]`, photo.printTypeId.toString());
        
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
            {photos.map((photo) => {
              if (photo.useCustomSize && photo.customSize) {
                const customPrice = getCustomSizePrice();
                return (
                  <div key={photo.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">{photo.file.name}</span>
                    <span className="text-sm font-medium">
                      Custom Size ({photo.customSize.width}" x {photo.customSize.height}") - {customPrice.toFixed(0)} tk
                    </span>
                  </div>
                );
              }
              const size = getSizeById(photo.sizeId);
              const printType = getPrintTypeById(photo.printTypeId);
              return (
                <div key={photo.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">{photo.file.name}</span>
                  <span className="text-sm font-medium">
                    {size?.name} ({size?.dimention}) - {size ? parseFloat(size.price).toFixed(0) : 0} tk
                  </span>
                </div>
              );
            })}
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
                  
                  {(() => {
                    let dimensions = { width: 400, height: 600 };
                    if (photo.useCustomSize && photo.customSize) {
                      const customDimension = `${photo.customSize.width}" x ${photo.customSize.height}"`;
                      dimensions = getPreviewDimensions(customDimension);
                    } else {
                      const size = getSizeById(photo.sizeId);
                      dimensions = size ? getPreviewDimensions(size.dimention) : { width: 400, height: 600 };
                    }
                    return (
                      <ImagePreviewCanvas
                        imageUrl={photo.preview}
                        width={dimensions.width}
                        height={dimensions.height}
                        onCropChange={(cropData) => updatePhotoCrop(photo.id, cropData)}
                      />
                    );
                  })()}
                  
                  <p className="text-sm text-muted-foreground truncate">
                    📁 {photo.file.name}
                  </p>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Print Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Print Type</Label>
                      <Select
                        value={photo.printTypeId.toString()}
                        onValueChange={(value) => {
                          const newPrintTypeId = parseInt(value);
                          const printType = getPrintTypeById(newPrintTypeId);
                          const firstSize = printType?.size?.[0];
                          updatePhoto(photo.id, { 
                            printTypeId: newPrintTypeId,
                            sizeId: firstSize?.id || photo.sizeId
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {printTypes.map((printType) => (
                            <SelectItem key={printType.id} value={printType.id.toString()}>
                              {printType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select
                        value={photo.sizeId.toString()}
                        onValueChange={(value) => updatePhoto(photo.id, { sizeId: parseInt(value), useCustomSize: false })}
                        disabled={photo.useCustomSize}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSizes(photo.printTypeId).map((size) => (
                            <SelectItem key={size.id} value={size.id.toString()}>
                              {size.name} ({size.dimention}) - {parseFloat(size.price).toFixed(0)} tk
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Custom Size Option */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`custom-size-${photo.id}`}
                        checked={photo.useCustomSize || false}
                        onCheckedChange={(checked) => {
                          updatePhoto(photo.id, { 
                            useCustomSize: checked as boolean,
                            customSize: checked ? { width: '12', height: '18' } : undefined
                          });
                        }}
                      />
                      <Label htmlFor={`custom-size-${photo.id}`} className="font-medium cursor-pointer">
                        Use Custom Size
                      </Label>
                    </div>
                    
                    {photo.useCustomSize && (
                      <div className="grid grid-cols-2 gap-3 pl-6">
                        <div className="space-y-2">
                          <Label htmlFor={`width-${photo.id}`}>Width (inches)</Label>
                          <Input
                            id={`width-${photo.id}`}
                            type="number"
                            step="0.1"
                            min="1"
                            placeholder="12"
                            value={photo.customSize?.width || ''}
                            onChange={(e) => updatePhoto(photo.id, {
                              customSize: {
                                width: e.target.value,
                                height: photo.customSize?.height || ''
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`height-${photo.id}`}>Height (inches)</Label>
                          <Input
                            id={`height-${photo.id}`}
                            type="number"
                            step="0.1"
                            min="1"
                            placeholder="18"
                            value={photo.customSize?.height || ''}
                            onChange={(e) => updatePhoto(photo.id, {
                              customSize: {
                                width: photo.customSize?.width || '',
                                height: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {(() => {
                    if (photo.useCustomSize && photo.customSize) {
                      const customPrice = getCustomSizePrice();
                      const extraLargePrice = getExtraLargePrice();
                      return (
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                          <div>
                            <span className="font-medium">Price for this photo:</span>
                            <p className="text-sm text-muted-foreground">
                              Custom Size ({photo.customSize.width}" x {photo.customSize.height}") - Extra Large: {extraLargePrice.toFixed(0)} + 200
                            </p>
                          </div>
                          <span className="text-xl font-bold text-primary">
                            {customPrice.toFixed(0)} tk
                          </span>
                        </div>
                      );
                    }
                    const size = getSizeById(photo.sizeId);
                    return (
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div>
                          <span className="font-medium">Price for this photo:</span>
                          <p className="text-sm text-muted-foreground">{size?.name} ({size?.dimention})</p>
                        </div>
                        <span className="text-xl font-bold text-primary">
                          {size ? parseFloat(size.price).toFixed(0) : 0} tk
                        </span>
                      </div>
                    );
                  })()}
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