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

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    try {
      toast.loading("Processing images for print...");
      
      // Process all images to create print-ready files
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const printReadyBlob = await createPrintReadyImage(photo);
          
          const printDimensions = {
            "8.5x4": { widthInches: 8.5, heightInches: 4, dpi: 300 },
            "12x18": { widthInches: 12, heightInches: 18, dpi: 300 },
            "16x24": { widthInches: 16, heightInches: 24, dpi: 300 },
            "24x36": { widthInches: 24, heightInches: 36, dpi: 300 },
          };
          
          const printSize = printDimensions[photo.size];
          const targetWidth = Math.round(printSize.widthInches * printSize.dpi);
          const targetHeight = Math.round(printSize.heightInches * printSize.dpi);

          return {
            id: photo.id,
            originalFileName: photo.file.name,
            printReadyBlob: printReadyBlob,
            format: photo.format,
            size: photo.size,
            sizeDetails: sizes[photo.size],
            price: sizes[photo.size].price,
            printSpecifications: {
              widthInches: printSize.widthInches,
              heightInches: printSize.heightInches,
              dpi: printSize.dpi,
              widthPixels: targetWidth,
              heightPixels: targetHeight,
            },
          };
        })
      );

      // Prepare the order data structure
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
        photos: processedPhotos.map(({ printReadyBlob, ...photoMeta }) => photoMeta),
        metadata: {
          orderDate: new Date().toISOString(),
          totalPhotos: photos.length,
        }
      };

      // Log the complete order structure for backend developer
      console.log('╔═══════════════════════════════════════════════════════════════╗');
      console.log('║          PRINT ORDER SUBMISSION - COMPLETE DATA               ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      console.log('📦 COMPLETE ORDER OBJECT (Single Unified Structure):');
      const logData = {
        ...orderData,
        photos: orderData.photos.map(p => {
          const processed = processedPhotos.find(pp => pp.id === p.id);
          const blobSize = processed ? (processed.printReadyBlob.size / 1024 / 1024).toFixed(2) : '0';
          return {
            ...p,
            printReadyFile: `Processed JPEG Blob (${blobSize} MB)`,
          };
        })
      };
      console.log(JSON.stringify(logData, null, 2));

      console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║         API STRUCTURE FOR BACKEND DEVELOPER                   ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      const backendStructure = {
        endpoint: 'POST /api/orders/print-photos',
        contentType: 'multipart/form-data',
        description: '✅ Receives PRINT-READY images (already processed) - NO IMAGE PROCESSING NEEDED',
        
        requestPayload: {
          // Single JSON field containing all order data
          orderData: {
            type: 'JSON string',
            description: 'Complete order information including customer, payment, pricing, and photo metadata',
            structure: {
              customer: {
                name: 'string (required)',
                phone: 'string (required)',
                location: 'string (required)',
                additionalInfo: 'string (optional)',
              },
              payment: {
                method: '"online" | "cod" (required)',
                deliveryLocation: '"inside-dhaka" | "outside-dhaka" | undefined',
                deliveryCharge: 'number (0 or 50)',
              },
              pricing: {
                subtotal: 'number',
                deliveryCharge: 'number',
                total: 'number',
              },
              photos: [{
                id: 'string (unique identifier)',
                originalFileName: 'string',
                format: 'string (print format)',
                size: 'string (print size)',
                sizeDetails: {
                  name: 'string',
                  price: 'number',
                },
                price: 'number',
                printSpecifications: {
                  widthInches: 'number',
                  heightInches: 'number',
                  dpi: 'number (always 300)',
                  widthPixels: 'number (exact pixel dimensions)',
                  heightPixels: 'number (exact pixel dimensions)',
                },
              }],
              metadata: {
                orderDate: 'ISO 8601 datetime string',
                totalPhotos: 'number',
              },
            },
          },
          
          // Print-ready JPEG files (already cropped, scaled, and sized)
          files: {
            type: 'File[]',
            description: 'Print-ready JPEG images at 300 DPI',
            naming: 'photo_0, photo_1, photo_2, etc.',
            note: '✅ Files are READY TO PRINT - just save them!',
            details: 'Images are already cropped, scaled, and sized to exact print dimensions',
          },
        },
        
        responseExpected: {
          success: 'boolean',
          orderId: 'string (unique order ID)',
          message: 'string',
          totalPhotos: 'number',
          totalAmount: 'number',
        },
        
        backendRequirements: [
          '✅ SIMPLE: Just save the received files',
          '1. Parse orderData JSON from request',
          '2. For each photo file (photo_0, photo_1, etc.):',
          '   a) Save the file to storage (S3, local disk, etc.)',
          '   b) Files are ALREADY at correct dimensions and DPI',
          '   c) No image processing or transformation needed',
          '3. Store order details in database',
          '4. Send order confirmation to customer',
          '5. Return success response with order ID',
        ],
        
        exampleFormDataStructure: {
          orderData: JSON.stringify(orderData),
          photo_0: 'Print-ready JPEG file (3600×5400px @ 300 DPI)',
          photo_1: 'Print-ready JPEG file (4800×7200px @ 300 DPI)',
          photo_n: 'Print-ready JPEG file',
        },
      };
      
      console.log(JSON.stringify(backendStructure, null, 2));
      
      console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║       SIMPLE BACKEND IMPLEMENTATION (Node.js/Express)        ║');
      console.log('║       ✅ NO IMAGE PROCESSING NEEDED - JUST SAVE FILES!        ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      console.log(`
// Using Express.js with multer for file uploads
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;

const upload = multer({ dest: 'temp_uploads/' });
const app = express();

app.post('/api/orders/print-photos', 
  upload.any(), // Accept all files
  async (req, res) => {
    try {
      // 1. Parse the complete order data
      const orderData = JSON.parse(req.body.orderData);
      
      console.log('📦 Order received:', {
        customer: orderData.customer.name,
        totalPhotos: orderData.metadata.totalPhotos,
        totalAmount: orderData.pricing.total + ' tk',
      });
      
      // 2. Simply save the print-ready files (NO PROCESSING NEEDED!)
      const savedPhotos = [];
      const orderId = 'ORD-' + Date.now();
      
      for (let i = 0; i < orderData.photos.length; i++) {
        const photoMeta = orderData.photos[i];
        const photoFile = req.files.find(f => f.fieldname === \`photo_\${i}\`);
        
        if (!photoFile) {
          throw new Error(\`Missing file for photo \${i}\`);
        }
        
        // ✅ Files are already print-ready - just save them!
        const fileName = \`\${orderId}_photo_\${i + 1}.jpg\`;
        const destPath = \`prints/\${fileName}\`;
        
        // Move file to permanent storage
        await fs.rename(photoFile.path, destPath);
        
        savedPhotos.push({
          photoId: photoMeta.id,
          originalName: photoMeta.originalFileName,
          savedPath: destPath,
          printSize: photoMeta.size,
          format: photoMeta.format,
          price: photoMeta.price,
          resolution: \`\${photoMeta.printSpecifications.widthPixels}×\${photoMeta.printSpecifications.heightPixels}px\`,
          readyForPrint: true,
        });
      }
      
      // 3. Save order to database (pseudo-code)
      // const order = await db.orders.create({
      //   orderId,
      //   customer: orderData.customer,
      //   payment: orderData.payment,
      //   pricing: orderData.pricing,
      //   photos: savedPhotos,
      //   status: 'pending',
      //   createdAt: new Date(),
      // });
      
      // 4. Send confirmation email/SMS to customer
      // await sendOrderConfirmation(orderData.customer, orderId);
      
      // 5. Send success response
      res.json({
        success: true,
        orderId: orderId,
        message: 'Order received successfully',
        totalPhotos: savedPhotos.length,
        totalAmount: orderData.pricing.total,
        photos: savedPhotos,
      });
      
    } catch (error) {
      console.error('❌ Order processing error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
);

app.listen(3000, () => {
  console.log('✅ Print API server running on port 3000');
});
      `);
      
      console.log('\n╔═══════════════════════════════════════════════════════════════╗');
      console.log('║              PRINT-READY FILES TO BE SENT                     ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝\n');
      
      processedPhotos.forEach((photo, index) => {
        console.log(`📸 Photo ${index + 1}:`);
        console.log(`   Original: ${photo.originalFileName}`);
        console.log(`   Processed Size: ${(photo.printReadyBlob.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Format: ${photo.format}`);
        console.log(`   Print Size: ${photo.printSpecifications.widthInches}" × ${photo.printSpecifications.heightInches}"`);
        console.log(`   Resolution: ${photo.printSpecifications.widthPixels} × ${photo.printSpecifications.heightPixels}px @ ${photo.printSpecifications.dpi} DPI`);
        console.log(`   Price: ${photo.price} tk`);
        console.log(`   Status: ✅ Ready for print (no backend processing needed)`);
        console.log('');
      });

      toast.dismiss();
      toast.success("Images processed! Submitting order...");
      
      // ============================================================
      // API SUBMISSION - Using actual backend endpoint
      // ============================================================
      const formData = new FormData();
      
      // 1. Add the complete order data as a single JSON string
      formData.append('orderData', JSON.stringify({
        customer: orderData.customer,
        payment: orderData.payment,
        pricing: orderData.pricing,
        photos: orderData.photos, // All metadata
        metadata: orderData.metadata,
      }));
      
      // 2. Add print-ready image files (already cropped and sized)
      processedPhotos.forEach((photo, index) => {
        const fileName = `print_${index + 1}_${photo.originalFileName.replace(/\.[^/.]+$/, '')}.jpg`;
        formData.append(`photo_${index}`, photo.printReadyBlob, fileName);
      });
      
      // 3. Send to API
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
        console.log('✅ Order submitted successfully:', result);
        
        toast.dismiss();
        toast.success(`Order confirmed! Order ID: ${result.orderId || result.id || 'Success'}`);
        
        // Reset form or redirect to success page
        // setPhotos([]);
        // setShowContactForm(false);
        // window.location.href = `/order-confirmation/${result.orderId}`;
        
      } catch (error) {
        console.error('❌ API Error:', error);
        toast.dismiss();
        toast.error('Failed to submit order. Please try again.');
        throw error;
      }
      
    } catch (error) {
      console.error('Order submission error:', error);
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