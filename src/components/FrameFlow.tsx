import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, RotateCw } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { ImagePreviewCanvas, CropData } from "./ImagePreviewCanvas";
import { toast } from "sonner";

type Format = "HD matte sticker paper" | "3mm Board HD matte pasted frame" | "5mm Board HD matte pasted frame" | "Premium Framed Print with Glass" | "Premium Framed Print without Glass";
type Size = "8.5x4" | "12x18" | "16x24" | "24x36";
type BleedType = "no-bleed" | "small-bleed" | "medium-bleed" | "large-bleed";

interface Frame {
  id: number;
  name: string;
  slug: string;
  status: number;
  image: string;
  created_at: string;
  updated_at: string;
}

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

const bleeds: Record<BleedType, { name: string }> = {
  "no-bleed": { name: "No Bleed" },
  "small-bleed": { name: "Small Bleed" },
  "medium-bleed": { name: "Medium Bleed" },
  "large-bleed": { name: "Large Bleed" },
};

interface PhotoItem {
  id: string;
  file: File;
  format: Format;
  size: Size;
  frameId: number;
  preview: string;
  cropData?: CropData;
  orientation: "horizontal" | "vertical";
  bleedType: BleedType;
}

// Fixed frame dimensions (always uses 12x18 as reference)
const FIXED_FRAME_DIMENSIONS = {
  width: 235,
  height: 315
};

// Image preview dimensions with bleed options (changes based on selected size and bleed)
const sizePreviewDimensions: Record<Size, Record<BleedType, { width: number; height: number }>> = {
  "8.5x4": {
    "no-bleed": { width: 235, height: 100 },
    "small-bleed": { width: 220, height: 70 },
    "medium-bleed": { width: 200, height: 50 },
    "large-bleed": { width: 180, height: 40 },
  },
  "12x18": {
    "no-bleed": { width: 235, height: 315 },
    "small-bleed": { width: 220, height: 300 },
    "medium-bleed": { width: 200, height: 280 },
    "large-bleed": { width: 180, height: 260 },
  },
  "16x24": {
    "no-bleed": { width: 235, height: 315 },
    "small-bleed": { width: 220, height: 300 },
    "medium-bleed": { width: 200, height: 280 },
    "large-bleed": { width: 180, height: 260 },
  },
  "24x36": {
    "no-bleed": { width: 235, height: 315 },
    "small-bleed": { width: 220, height: 300 },
    "medium-bleed": { width: 200, height: 280 },
    "large-bleed": { width: 180, height: 260 },
  },
};

export const FrameFlow = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loadingFrames, setLoadingFrames] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);

  // Fetch frames from API
  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await fetch('https://admin.printr.store/api/frame/list');
        const result = await response.json();
        
        if (result.success && result.data) {
          setFrames(result.data);
        } else {
          toast.error('Failed to load frames');
        }
      } catch (error) {
        console.error('Error fetching frames:', error);
        toast.error('Failed to load frames');
      } finally {
        setLoadingFrames(false);
      }
    };

    fetchFrames();
  }, []);

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
            frameId: frames.length > 0 ? frames[0].id : 1,
            preview: e.target?.result as string,
            cropData: { x: 0, y: 0, scale: 1 },
            orientation: "horizontal",
            bleedType: "no-bleed",
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

  const getFrameById = (frameId: number): Frame | undefined => {
    return frames.find(f => f.id === frameId);
  };

  const getTotalPrice = () => {
    return photos.reduce((total, photo) => {
      const frame = getFrameById(photo.frameId);
      const framePrice = frame ? 150 : 0; // Default frame price since API doesn't provide it
      return total + sizes[photo.size].price + framePrice;
    }, 0);
  };

  const getDeliveryCharge = (contactData: ContactFormData) => {
    if (contactData.paymentMethod === "cod" && contactData.deliveryLocation === "inside-dhaka") {
      return 50;
    }
    return 0;
  };

  // Function to create cropped image from the raw file
  const createCroppedImage = async (photo: PhotoItem): Promise<Blob> => {
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

        // Get the preview dimensions for this photo
        const previewDim = sizePreviewDimensions[photo.size][photo.bleedType];
        
        // Calculate scale factor to maintain aspect ratio
        const scaleX = img.width / previewDim.width;
        const scaleY = img.height / previewDim.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate actual crop dimensions in original image coordinates
        const cropData = photo.cropData || { x: 0, y: 0, scale: 1 };
        
        // Set canvas to preview dimensions (we'll scale it up later if needed)
        canvas.width = previewDim.width * 2; // 2x for better quality
        canvas.height = previewDim.height * 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply transformations
        ctx.save();
        ctx.translate(cropData.x * 2, cropData.y * 2);
        ctx.scale(cropData.scale, cropData.scale);
        
        // Calculate dimensions to fill canvas
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
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create blob'));
          }
        }, 'image/jpeg', 0.95);
      };
      
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = photo.preview;
    });
  };

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    try {
      toast.loading("Processing your framed photos...");
      
      // Process all images to create cropped versions
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const croppedImageBlob = await createCroppedImage(photo);
          const frame = getFrameById(photo.frameId);
          const framePrice = frame ? 150 : 0;
          
          return {
            id: photo.id,
            originalFileName: photo.file.name,
            croppedImageBlob: croppedImageBlob,
            croppedImageSize: croppedImageBlob.size,
            format: photo.format,
            size: photo.size,
            sizeDetails: sizes[photo.size],
            frameId: photo.frameId,
            frameDetails: frame,
            orientation: photo.orientation,
            bleedType: photo.bleedType,
            bleedDetails: bleeds[photo.bleedType],
            price: sizes[photo.size].price + framePrice,
            cropData: photo.cropData,
          };
        })
      );

      // Prepare the complete order data
      const orderData = {
        customer: {
          name: contactData.name,
          phone: contactData.phone,
          location: contactData.location,
          additionalInfo: contactData.additionalInfo,
        },
        payment: {
          method: contactData.paymentMethod,
          deliveryLocation: contactData.deliveryLocation,
          deliveryCharge: getDeliveryCharge(contactData),
        },
        pricing: {
          subtotal: getTotalPrice(),
          deliveryCharge: getDeliveryCharge(contactData),
          total: getTotalPrice() + getDeliveryCharge(contactData),
        },
        photos: processedPhotos.map(({ croppedImageBlob, ...photoMeta }) => photoMeta),
        metadata: {
          orderDate: new Date().toISOString(),
          totalPhotos: photos.length,
          serviceType: "frame",
        }
      };

      // Log the complete order structure
      console.log('╔═══════════════════════════════════════════════════════════════╗');
      console.log('║          FRAME ORDER SUBMISSION - COMPLETE DATA               ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      console.log('📦 COMPLETE ORDER OBJECT:');
      const logData = {
        ...orderData,
        photos: orderData.photos.map((p, index) => {
          const processed = processedPhotos[index];
          const blobSize = (processed.croppedImageBlob.size / 1024 / 1024).toFixed(2);
          return {
            ...p,
            croppedImageFile: `Cropped JPEG Blob (${blobSize} MB)`,
          };
        })
      };
      console.log(JSON.stringify(logData, null, 2));

      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              CROPPED IMAGES & FRAME DETAILS                   ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      processedPhotos.forEach((photo, index) => {
        const framePrice = photo.frameDetails ? 150 : 0;
        console.log(`🖼️  Photo ${index + 1}:`);
        console.log(`   Original: ${photo.originalFileName}`);
        console.log(`   Cropped Size: ${(photo.croppedImageBlob.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Print Format: ${photo.format}`);
        console.log(`   Print Size: ${photo.sizeDetails.name}`);
        console.log(`   Frame: ${photo.frameDetails?.name || 'Unknown'} (${framePrice} tk)`);
        console.log(`   Orientation: ${photo.orientation}`);
        console.log(`   Bleed: ${photo.bleedDetails.name}`);
        console.log(`   Print Price: ${photo.sizeDetails.price} tk`);
        console.log(`   Total Price: ${photo.price} tk`);
        console.log(`   Crop Data: Scale=${photo.cropData?.scale}, X=${photo.cropData?.x}, Y=${photo.cropData?.y}`);
        console.log('');
      });

      console.log('\n💰 PRICING SUMMARY:');
      console.log(`   Subtotal: ${orderData.pricing.subtotal} tk`);
      console.log(`   Delivery: ${orderData.pricing.deliveryCharge} tk`);
      console.log(`   Total: ${orderData.pricing.total} tk`);

      toast.dismiss();
      toast.success("Frame order data logged to console!");
      
    } catch (error) {
      console.error('Order processing error:', error);
      toast.dismiss();
      toast.error('Failed to process order. Please try again.');
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
          <h3 className="text-lg font-semibold mb-4">Your Framed Photos ({photos.length})</h3>
          <div className="space-y-2">
            {photos.map((photo) => {
              const frame = getFrameById(photo.frameId);
              const framePrice = frame ? 150 : 0;
              return (
                <div key={photo.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{photo.file.name}</p>
                    <p className="text-xs text-muted-foreground">{frame?.name || 'Unknown'} Frame</p>
                  </div>
                  <span className="text-sm font-medium">
                    {sizes[photo.size].price + framePrice} tk
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
                      minHeight: `${FIXED_FRAME_DIMENSIONS.height * 1.3}px` 
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
                            ? sizePreviewDimensions[photo.size][photo.bleedType].width 
                            : sizePreviewDimensions[photo.size][photo.bleedType].height}
                          height={photo.orientation === "horizontal" 
                            ? sizePreviewDimensions[photo.size][photo.bleedType].height 
                            : sizePreviewDimensions[photo.size][photo.bleedType].width}
                          onCropChange={(cropData) => updatePhotoCrop(photo.id, cropData)}
                          showControls={false}
                          initialCropData={photo.cropData}
                        />
                      </div>
                      
                      {/* Frame overlay - Fixed size using FIXED_FRAME_DIMENSIONS */}
                      <img
                        src={getFrameById(photo.frameId)?.image || ''}
                        alt="Frame overlay"
                        className={`absolute pointer-events-none transition-transform duration-300`}
                        style={{ 
                          mixBlendMode: 'multiply',
                          top: '50%',
                          left: '50%',
                          width: `${(photo.orientation === "horizontal" 
                            ? FIXED_FRAME_DIMENSIONS.width 
                            : FIXED_FRAME_DIMENSIONS.height) * 1.9}px`,
                          height: `${(photo.orientation === "horizontal" 
                            ? FIXED_FRAME_DIMENSIONS.height 
                            : FIXED_FRAME_DIMENSIONS.width) * 1.9}px`,
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
                    {loadingFrames ? (
                      <p className="text-sm text-muted-foreground">Loading frames...</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {frames.map((frame) => (
                          <button
                            key={frame.id}
                            onClick={() => updatePhoto(photo.id, { frameId: frame.id })}
                            className={`p-2 border rounded-lg text-sm transition-colors ${
                              photo.frameId === frame.id 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <img src={frame.image} alt={frame.name} className="w-full h-12 object-contain mb-1 rounded bg-gray-50" />
                            <p className="font-medium">{frame.name}</p>
                            <p className="text-xs text-muted-foreground">+150 tk</p>
                          </button>
                        ))}
                      </div>
                    )}
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

                    <div className="space-y-2">
                      <Label>Bleed</Label>
                      <Select
                        value={photo.bleedType}
                        onValueChange={(value: BleedType) => updatePhoto(photo.id, { bleedType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(bleeds).map(([key, bleed]) => (
                            <SelectItem key={key} value={key}>
                              {bleed.name}
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
                        Print: {sizes[photo.size].price} tk + Frame: 150 tk
                      </p>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {sizes[photo.size].price + 150} tk
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