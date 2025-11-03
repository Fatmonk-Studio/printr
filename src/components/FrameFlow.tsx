import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, RotateCw } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { ImagePreviewCanvas, CropData } from "./ImagePreviewCanvas";
import { toast } from "sonner";

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

const bleeds: Record<BleedType, { name: string }> = {
  "no-bleed": { name: "No Bleed" },
  "small-bleed": { name: "Small Bleed" },
  "medium-bleed": { name: "Medium Bleed" },
  "large-bleed": { name: "Large Bleed" },
};

interface PhotoItem {
  id: string;
  file: File;
  printTypeId: number;
  sizeId: number;
  frameId: number;
  preview: string;
  cropData?: CropData;
  orientation: "horizontal" | "vertical";
  bleedType: BleedType;
  customSize?: {
    width: string;
    height: string;
  };
  useCustomSize?: boolean;
}

// Fixed frame dimensions (always uses 12x18 as reference)
const FIXED_FRAME_DIMENSIONS = {
  width: 235,
  height: 315
};

// Mobile scaling factor
const MOBILE_SCALE_FACTOR = 0.640; // 64% size on mobile

// Get responsive frame dimensions based on screen size
const getResponsiveFrameDimensions = (isMobile: boolean) => {
  return {
    width: FIXED_FRAME_DIMENSIONS.width * (isMobile ? MOBILE_SCALE_FACTOR : 1),
    height: FIXED_FRAME_DIMENSIONS.height * (isMobile ? MOBILE_SCALE_FACTOR : 1)
  };
};

// Image preview dimensions with bleed options (scaled for preview)
// Custom sizes are always constrained to fit within 12" x 16" ratio for frame simulation
const getPreviewDimensions = (dimention: string, bleedType: BleedType, isMobile: boolean = false): { width: number; height: number } => {
  // Parse dimension string like "12\" x 18\""
  const parts = dimention.split('x').map(p => parseFloat(p.trim()));
  let [width, height] = parts;
  
  // Constrain custom sizes to fit within 12" x 16" frame dimensions
  const MAX_WIDTH = 12;
  const MAX_HEIGHT = 16;
  
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    // Scale down to fit within frame bounds while maintaining aspect ratio
    const widthScale = MAX_WIDTH / width;
    const heightScale = MAX_HEIGHT / height;
    const scale = Math.min(widthScale, heightScale);
    width = width * scale;
    height = height * scale;
  }
  
  // Base dimensions scaled for preview (max 315px for larger dimension on desktop)
  const baseScale = (isMobile ? 315 * MOBILE_SCALE_FACTOR : 315) / Math.max(width, height);
  let baseWidth = width * baseScale;
  let baseHeight = height * baseScale;
  
  // Special adjustment for 10" x 12" to prevent frame overlap
  if (dimention === '10" x 12"') {
    baseWidth = baseWidth * 0.85; // Reduce width by 15%
  }
  
  // Adjust for bleed
  const bleedReduction: Record<BleedType, number> = {
    "no-bleed": 1.0,
    "small-bleed": 0.93,
    "medium-bleed": 0.85,
    "large-bleed": 0.76,
  };
  
  const reduction = bleedReduction[bleedType];
  return {
    width: Math.round(baseWidth * reduction),
    height: Math.round(baseHeight * reduction),
  };
};

export const FrameFlow = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [printTypes, setPrintTypes] = useState<PrintType[]>([]);
  const [loadingFrames, setLoadingFrames] = useState(true);
  const [loadingPrintTypes, setLoadingPrintTypes] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          
          // Find the default size with dimension "12" x 16""
          let defaultSize = defaultPrintType?.size?.find(s => s.dimention === '12" x 16"');
          // If not found, use the first size as fallback
          if (!defaultSize && defaultPrintType?.size) {
            defaultSize = defaultPrintType.size[0];
          }
          
          const newPhoto: PhotoItem = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            printTypeId: defaultPrintType?.id || 1,
            sizeId: defaultSize?.id || 1,
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
      const frame = getFrameById(photo.frameId);
      const framePrice = frame ? 150 : 0;
      
      let sizePrice = 0;
      if (photo.useCustomSize) {
        sizePrice = getCustomSizePrice();
      } else {
        const size = getSizeById(photo.sizeId);
        sizePrice = size ? parseFloat(size.price) : 0;
      }
      
      return total + sizePrice + framePrice;
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
        let dimensionString = '';
        if (photo.useCustomSize && photo.customSize) {
          dimensionString = `${photo.customSize.width}" x ${photo.customSize.height}"`;
        } else {
          const size = getSizeById(photo.sizeId);
          dimensionString = size?.dimention || '12" x 16"';
        }
        const previewDim = getPreviewDimensions(dimensionString, photo.bleedType);
        
        // Get crop data (position and scale from user's editing)
        const cropData = photo.cropData || { x: 0, y: 0, scale: 1 };
        
        // Set canvas to preview dimensions (2x for better quality)
        const outputScale = 2;
        canvas.width = previewDim.width * outputScale;
        canvas.height = previewDim.height * outputScale;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // The preview CSS does: transform: translate(x, y) scale(s) with transformOrigin: "top left"
        // The image renders at its natural size in the preview, then transform is applied
        // We need to replicate this exactly:
        
        // Calculate what size the image appears at in the preview container
        // The image is rendered to fit the preview area while maintaining aspect ratio
        const previewImageWidth = previewDim.width;
        const previewImageHeight = (img.height / img.width) * previewImageWidth;
        
        ctx.save();
        
        // Apply output scaling
        ctx.scale(outputScale, outputScale);
        
        // Apply the CSS transform in the same order: translate then scale
        ctx.translate(cropData.x, cropData.y);
        ctx.scale(cropData.scale, cropData.scale);
        
        // Draw the image at its preview size (what it would be without transform)
        ctx.drawImage(img, 0, 0, previewImageWidth, previewImageHeight);
        
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
      toast.loading("Submitting your order...");
      
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const croppedImageBlob = await createCroppedImage(photo);
          
          return {
            croppedImageBlob,
            printTypeId: photo.printTypeId,
            sizeId: photo.sizeId,
            frameId: photo.frameId,
            orientation: photo.orientation,
            bleedType: photo.bleedType,
            customSize: photo.customSize,
            useCustomSize: photo.useCustomSize
          };
        })
      );

      const formData = new FormData();
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('phone', contactData.phone);
      formData.append('service_id', '1');
      formData.append('location', contactData.location);
      formData.append('delivery_type', contactData.deliveryLocation || 'inside_dhaka');
      formData.append('payment_method', contactData.paymentMethod);

      if (contactData.additionalInfo) {
        formData.append('additional_info', contactData.additionalInfo);
      }

      processedPhotos.forEach((processed, index) => {
        const photo = photos[index];
        
        if (photo.useCustomSize && photo.customSize) {
          formData.append(`documents[${index}][custom_size]`, `${photo.customSize.width}x${photo.customSize.height}`);
        } else {
          formData.append(`documents[${index}][size_id]`, photo.sizeId.toString());
        }
        
        formData.append(`documents[${index}][frame_id]`, photo.frameId.toString());
        formData.append(`documents[${index}][orientation]`, photo.orientation);
        
        const bleedType = photo.bleedType === 'no-bleed' ? 'none' : photo.bleedType;
        formData.append(`documents[${index}][bleed_type]`, bleedType);
        
        formData.append(`documents[${index}][print_type_id]`, photo.printTypeId.toString());
        formData.append(`documents[${index}][file]`, processed.croppedImageBlob, `photo_${index + 1}.jpg`);
      });

      const response = await fetch('https://admin.printr.store/api/service/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      toast.dismiss();

      if (response.ok && result.success) {
        toast.success("Order submitted successfully!");
        setPhotos([]);
        setShowContactForm(false);
      } else {
        toast.error(result.message || 'Failed to submit order. Please try again.');
      }
      
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to submit order. Please try again.');
    }
  };

  if (showContactForm) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-semibold">Order Summary</h2>
          <Button variant="outline" onClick={() => setShowContactForm(false)} className="w-full sm:w-auto text-sm sm:text-base">
            Back to Photos
          </Button>
        </div>
        
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your Framed Photos ({photos.length})</h3>
          <div className="space-y-2">
            {photos.map((photo) => {
              const frame = getFrameById(photo.frameId);
              const framePrice = frame ? 150 : 0;
              
              let sizePrice = 0;
              let sizeDisplay = '';
              
              if (photo.useCustomSize && photo.customSize) {
                sizePrice = getCustomSizePrice();
                sizeDisplay = `Custom Size (${photo.customSize.width}" x ${photo.customSize.height}")`;
              } else {
                const size = getSizeById(photo.sizeId);
                sizePrice = size ? parseFloat(size.price) : 0;
                sizeDisplay = size?.dimention || 'Unknown';
              }
              
              return (
                <div key={photo.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate">{photo.file.name}</p>
                    <p className="text-xs text-muted-foreground">{frame?.name || 'Unknown'} Frame - {sizeDisplay}</p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {(sizePrice + framePrice).toFixed(0)} tk
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
    <div className="space-y-4 sm:space-y-6">
      {/* Upload Section */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Upload Photos to Frame</h2>
        <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center">
          <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Upload photos to create beautiful framed prints</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="frame-upload"
          />
          <Label htmlFor="frame-upload">
            <Button variant="outline" asChild className="text-sm sm:text-base">
              <span>Choose Photos</span>
            </Button>
          </Label>
        </div>
      </Card>

      {/* Photos List */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold px-1">Configure Your Framed Photos</h2>
          
          {photos.map((photo) => (
            <Card key={photo.id} className="p-3 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Frame Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">Frame Preview</h3>
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateOrientation(photo.id)}
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Rotate</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(photo.id)}
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Frame Preview Container with fixed size */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* Fixed position controls - above frame */}
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Preview & Crop</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          updatePhotoCrop(photo.id, { x: 0, y: 0, scale: 1 });
                        }}
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      >
                        Reset
                      </Button>
                    </div>

                    {/* Fixed Frame Container */}
                    <div className="relative flex justify-center items-center" style={{ 
                      minHeight: `${getResponsiveFrameDimensions(isMobile).height * 1.3}px` 
                    }}>
                      {/* Image Canvas - Dynamic size based on selected size */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                      }}>
                        {(() => {
                          let dimensionString = '';
                          if (photo.useCustomSize && photo.customSize) {
                            dimensionString = `${photo.customSize.width}" x ${photo.customSize.height}"`;
                          } else {
                            const size = getSizeById(photo.sizeId);
                            dimensionString = size?.dimention || '12" x 16"';
                          }
                          const dims = getPreviewDimensions(dimensionString, photo.bleedType, isMobile);
                          return (
                            <ImagePreviewCanvas
                              imageUrl={photo.preview}
                              width={photo.orientation === "horizontal" ? dims.width : dims.height}
                              height={photo.orientation === "horizontal" ? dims.height : dims.width}
                              onCropChange={(cropData) => updatePhotoCrop(photo.id, cropData)}
                              showControls={false}
                              initialCropData={photo.cropData}
                            />
                          );
                        })()}
                      </div>
                      
                      {/* Frame overlay - Fixed size using responsive dimensions */}
                      <img
                        src={getFrameById(photo.frameId)?.image || ''}
                        alt="Frame overlay"
                        className={`absolute pointer-events-none transition-transform duration-300`}
                        style={{ 
                          mixBlendMode: 'multiply',
                          top: '50%',
                          left: '50%',
                          width: `${(photo.orientation === "horizontal" 
                            ? getResponsiveFrameDimensions(isMobile).width 
                            : getResponsiveFrameDimensions(isMobile).height) * 1.9}px`,
                          height: `${(photo.orientation === "horizontal" 
                            ? getResponsiveFrameDimensions(isMobile).height 
                            : getResponsiveFrameDimensions(isMobile).width) * 1.9}px`,
                          objectFit: 'contain',
                          transform: `translate(-50%, -50%) ${photo.orientation === "horizontal" ? "rotate(90deg)" : ""}`,
                          zIndex: 2
                        }}
                      />
                    </div>

                    {/* Fixed position zoom controls - below frame */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium">Zoom</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
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
                          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
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
                          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
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
                  <h3 className="font-semibold text-sm sm:text-base">Frame Options</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Frame Style</Label>
                    {loadingFrames ? (
                      <p className="text-sm text-muted-foreground">Loading frames...</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {frames.map((frame) => (
                          <button
                            key={frame.id}
                            onClick={() => updatePhoto(photo.id, { frameId: frame.id })}
                            className={`p-2 border rounded-lg text-xs sm:text-sm transition-colors ${
                              photo.frameId === frame.id 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <img src={frame.image} alt={frame.name} className="w-full h-8 sm:h-12 object-contain mb-1 rounded bg-gray-50" />
                            <p className="font-medium truncate">{frame.name}</p>
                            <p className="text-xs text-muted-foreground">+150 tk</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Print Type</Label>
                      {loadingPrintTypes ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      ) : (
                        <Select
                          value={photo.printTypeId.toString()}
                          onValueChange={(value) => {
                            const printTypeId = parseInt(value);
                            const sizes = getAvailableSizes(printTypeId);
                            updatePhoto(photo.id, { 
                              printTypeId,
                              sizeId: sizes.length > 0 ? sizes[0].id : photo.sizeId
                            });
                          }}
                        >
                          <SelectTrigger className="text-xs sm:text-sm">
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
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Size</Label>
                      {loadingPrintTypes ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      ) : (
                        <Select
                          value={photo.sizeId.toString()}
                          onValueChange={(value) => updatePhoto(photo.id, { sizeId: parseInt(value), useCustomSize: false })}
                          disabled={photo.useCustomSize}
                        >
                          <SelectTrigger className="text-xs sm:text-sm">
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
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Bleed</Label>
                      <Select
                        value={photo.bleedType}
                        onValueChange={(value: BleedType) => updatePhoto(photo.id, { bleedType: value })}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
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

                  {/* Custom Size Option */}
                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id={`custom-size-${photo.id}`}
                        checked={photo.useCustomSize || false}
                        onCheckedChange={(checked) => {
                          updatePhoto(photo.id, { 
                            useCustomSize: checked as boolean,
                            customSize: checked ? { width: '10', height: '12' } : undefined
                          });
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`custom-size-${photo.id}`} className="font-medium cursor-pointer text-xs sm:text-sm">
                          Use Custom Size (simulated in 12" x 16" frame)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Custom sizes will be constrained to fit within the frame dimensions while maintaining aspect ratio
                        </p>
                      </div>
                    </div>
                    
                    {photo.useCustomSize && (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 pl-6">
                        <div className="space-y-2">
                          <Label htmlFor={`width-${photo.id}`} className="text-xs sm:text-sm">Width (inches)</Label>
                          <Input
                            id={`width-${photo.id}`}
                            type="number"
                            step="0.1"
                            min="1"
                            max="12"
                            placeholder="10"
                            value={photo.customSize?.width || ''}
                            onChange={(e) => updatePhoto(photo.id, {
                              customSize: {
                                width: e.target.value,
                                height: photo.customSize?.height || ''
                              }
                            })}
                            className="text-xs sm:text-sm h-8 sm:h-10"
                          />
                          <p className="text-xs text-muted-foreground">Max: 12"</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`height-${photo.id}`} className="text-xs sm:text-sm">Height (inches)</Label>
                          <Input
                            id={`height-${photo.id}`}
                            type="number"
                            step="0.1"
                            min="1"
                            max="16"
                            placeholder="12"
                            value={photo.customSize?.height || ''}
                            onChange={(e) => updatePhoto(photo.id, {
                              customSize: {
                                width: photo.customSize?.width || '',
                                height: e.target.value
                              }
                            })}
                            className="text-xs sm:text-sm h-8 sm:h-10"
                          />
                          <p className="text-xs text-muted-foreground">Max: 16"</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 sm:p-4 bg-muted rounded-lg">
                    {(() => {
                      let sizePrice = 0;
                      let sizeInfo = '';
                      
                      if (photo.useCustomSize && photo.customSize) {
                        sizePrice = getCustomSizePrice();
                        const extraLargePrice = getExtraLargePrice();
                        sizeInfo = `Custom: ${photo.customSize.width}" x ${photo.customSize.height}" (Extra Large: ${extraLargePrice.toFixed(0)} + 200)`;
                      } else {
                        const size = getSizeById(photo.sizeId);
                        sizePrice = size ? parseFloat(size.price) : 0;
                        sizeInfo = `Print: ${sizePrice.toFixed(0)} tk`;
                      }
                      
                      return (
                        <>
                          <div>
                            <span className="font-medium text-sm sm:text-base">Price for this framed photo:</span>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {sizeInfo} + Frame: 150 tk
                            </p>
                          </div>
                          <span className="text-lg sm:text-xl font-bold text-primary">
                            {(sizePrice + 150).toFixed(0)} tk
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Continue Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 p-4 sm:p-6 bg-card rounded-lg border">
            <div>
              <p className="text-base sm:text-lg font-semibold">Total: {getTotalPrice()} tk</p>
              <p className="text-sm text-muted-foreground">{photos.length} framed photo(s)</p>
            </div>
            <Button variant="hero" size="lg" onClick={() => setShowContactForm(true)} className="w-full sm:w-auto">
              Continue to Contact Info
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};