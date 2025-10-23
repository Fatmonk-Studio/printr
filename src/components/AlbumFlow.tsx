import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { AlbumCoverSelector } from "./AlbumCoverSelector";
import { ALBUM_LAYOUTS, LayoutTemplate } from "./AlbumLayoutTemplates";
import { ImageSlotEditor } from "./ImageSlotEditor";
import { toast } from "sonner";

interface ImageData {
  file: File;
  zoom: number;
  position: { x: number; y: number };
}

interface AlbumPage {
  id: string;
  layoutId: string;
  images: (ImageData | null)[];
}

const PAGE_OPTIONS = [4, 8, 12, 16, 20, 24, 28];
const PRICE_PER_PAGE = 100; // tk per page
const BASE_PRICE = 1000; // tk base price

export const AlbumFlow = () => {
  const [step, setStep] = useState(1);
  const [shape, setShape] = useState<"square" | "rectangle">("square");
  const [coverImage, setCoverImage] = useState<string | File | null>(null);
  const [pageCount, setPageCount] = useState(8);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [pages, setPages] = useState<AlbumPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [draggedImage, setDraggedImage] = useState<File | null>(null);

  const initializePages = () => {
    const newPages: AlbumPage[] = Array.from({ length: pageCount }, (_, i) => ({
      id: `page-${i}`,
      layoutId: ALBUM_LAYOUTS[0].id,
      images: Array(ALBUM_LAYOUTS[0].imageCount).fill(null),
    }));
    setPages(newPages);
    setStep(4);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setUploadedPhotos(prev => [...prev, ...imageFiles]);
    toast.success(`${imageFiles.length} photo(s) uploaded!`);
  };

  const updatePageLayout = (pageIndex: number, layoutId: string) => {
    const layout = ALBUM_LAYOUTS.find(l => l.id === layoutId);
    if (!layout) return;

    setPages(prev => {
      const newPages = [...prev];
      const currentImages = newPages[pageIndex].images.filter(img => img !== null);
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        layoutId,
        images: Array(layout.imageCount).fill(null).map((_, i) => currentImages[i] || null),
      };
      return newPages;
    });
  };

  const addImageToSlot = (pageIndex: number, slotIndex: number, file: File) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[pageIndex].images[slotIndex] = {
        file,
        zoom: 1,
        position: { x: 0, y: 0 },
      };
      return newPages;
    });
  };

  const removeImageFromSlot = (pageIndex: number, slotIndex: number) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[pageIndex].images[slotIndex] = null;
      return newPages;
    });
  };

  const updateImageZoom = (pageIndex: number, slotIndex: number, zoom: number) => {
    setPages(prev => {
      const newPages = [...prev];
      const img = newPages[pageIndex].images[slotIndex];
      if (img) {
        newPages[pageIndex].images[slotIndex] = { ...img, zoom };
      }
      return newPages;
    });
  };

  const updateImagePosition = (pageIndex: number, slotIndex: number, position: { x: number; y: number }) => {
    setPages(prev => {
      const newPages = [...prev];
      const img = newPages[pageIndex].images[slotIndex];
      if (img) {
        newPages[pageIndex].images[slotIndex] = { ...img, position };
      }
      return newPages;
    });
  };

  const handleDragStart = (e: React.DragEvent, slotIndex: number) => {
    const img = pages[currentPageIndex].images[slotIndex];
    if (img) {
      setDraggedImage(img.file);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSlotIndex: number) => {
    e.preventDefault();
    if (!draggedImage) return;

    const sourceSlotIndex = pages[currentPageIndex].images.findIndex(
      img => img?.file === draggedImage
    );

    if (sourceSlotIndex === -1) return;

    setPages(prev => {
      const newPages = [...prev];
      const temp = newPages[currentPageIndex].images[targetSlotIndex];
      newPages[currentPageIndex].images[targetSlotIndex] = newPages[currentPageIndex].images[sourceSlotIndex];
      newPages[currentPageIndex].images[sourceSlotIndex] = temp;
      return newPages;
    });

    setDraggedImage(null);
  };

  const getTotalPrice = () => {
    return BASE_PRICE + (pageCount * PRICE_PER_PAGE);
  };

  const getDeliveryCharge = (contactData: ContactFormData) => {
    if (contactData.paymentMethod === 'cod' && contactData.deliveryLocation === 'inside-dhaka') {
      return 50;
    }
    return 0;
  };

  // Function to create edited version of image with zoom and position
  const createEditedImage = async (imageData: ImageData, width: number, height: number): Promise<Blob | null> => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;

      const img = new Image();
      const imageUrl = URL.createObjectURL(imageData.file);
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Fill background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          // Apply zoom and position transformations
          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.scale(imageData.zoom, imageData.zoom);
          ctx.translate(imageData.position.x / imageData.zoom, imageData.position.y / imageData.zoom);
          
          // Calculate image dimensions to cover the canvas
          const scale = Math.max(width / img.width, height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          
          ctx.drawImage(
            img,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );
          ctx.restore();

          URL.revokeObjectURL(imageUrl);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.95);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          resolve(null);
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error("Error creating edited image:", error);
      return null;
    }
  };

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    const deliveryCharge = getDeliveryCharge(contactData);
    const subtotal = getTotalPrice();
    const total = subtotal + deliveryCharge;

    // Count pages with photos
    const pagesWithPhotos = pages.filter(p => p.images.some(img => img !== null)).length;
    const totalImagesInAlbum = pages.reduce((sum, page) => 
      sum + page.images.filter(img => img !== null).length, 0
    );

    // Build complete order structure
    const orderData = {
      customer: {
        name: contactData.name,
        phone: contactData.phone,
        location: contactData.location,
        additionalInfo: contactData.additionalInfo || ""
      },
      payment: {
        method: contactData.paymentMethod,
        ...(contactData.paymentMethod === 'cod' && {
          deliveryLocation: contactData.deliveryLocation
        }),
        deliveryCharge
      },
      album: {
        shape,
        coverImage: coverImage instanceof File ? coverImage.name : (typeof coverImage === 'string' ? coverImage : 'None'),
        pageCount,
        pagesWithPhotos,
        totalImages: totalImagesInAlbum,
        basePrice: BASE_PRICE,
        pricePerPage: PRICE_PER_PAGE
      },
      pricing: {
        basePrice: BASE_PRICE,
        pagesPrice: pageCount * PRICE_PER_PAGE,
        subtotal,
        deliveryCharge,
        total
      },
      pages: await Promise.all(pages.map(async (page, pageIndex) => {
        const layout = ALBUM_LAYOUTS.find(l => l.id === page.layoutId);
        const imagesWithPhotos = page.images.map((img, slotIndex) => {
          if (!img) return null;
          
          const hasEdits = img.zoom !== 1 || img.position.x !== 0 || img.position.y !== 0;
          
          return {
            slotIndex,
            originalFileName: img.file.name,
            fileSize: img.file.size,
            fileType: img.file.type,
            hasEdits,
            ...(hasEdits && {
              transformData: {
                zoom: img.zoom,
                positionX: img.position.x,
                positionY: img.position.y
              }
            })
          };
        }).filter(img => img !== null);

        return {
          pageNumber: pageIndex + 1,
          layoutId: page.layoutId,
          layoutName: layout?.name || 'Unknown',
          imageCount: page.images.filter(img => img !== null).length,
          totalSlots: page.images.length,
          images: imagesWithPhotos
        };
      })),
      metadata: {
        orderDate: new Date().toISOString(),
        serviceType: "album"
      }
    };

    // Log complete order structure
    console.log('\n' + '═'.repeat(70));
    console.log('          ALBUM ORDER SUBMISSION - COMPLETE DATA');
    console.log('═'.repeat(70) + '\n');

    console.log('📦 COMPLETE ORDER OBJECT:');
    console.log(JSON.stringify(orderData, null, 2));

    console.log('\n' + '═'.repeat(70));
    console.log('              RAW & EDITED IMAGES');
    console.log('═'.repeat(70) + '\n');

    // Log cover image
    if (coverImage instanceof File) {
      console.log('📕 ALBUM COVER IMAGE:');
      console.log(`   File: ${coverImage.name}`);
      console.log(`   Size: ${(coverImage.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Type: ${coverImage.type}`);
      console.log(`   Cover Image File:`, coverImage);
      console.log('');
    }

    // Log raw images and create edited versions
    console.log('📸 RAW & EDITED IMAGES BY PAGE:');
    
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      const imagesInPage = page.images.filter(img => img !== null);
      
      if (imagesInPage.length === 0) continue;

      const layout = ALBUM_LAYOUTS.find(l => l.id === page.layoutId);
      console.log(`\n   📄 Page ${pageIndex + 1} (Layout: ${layout?.name || 'Unknown'})`);
      console.log(`   ─────────────────────────────────────────`);

      for (let slotIndex = 0; slotIndex < page.images.length; slotIndex++) {
        const imageData = page.images[slotIndex];
        if (!imageData) continue;

        const hasEdits = imageData.zoom !== 1 || imageData.position.x !== 0 || imageData.position.y !== 0;

        console.log(`\n      🖼️  Slot ${slotIndex + 1}:`);
        console.log(`      Original File: ${imageData.file.name}`);
        console.log(`      Size: ${(imageData.file.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`      Type: ${imageData.file.type}`);
        console.log(`      Has Edits: ${hasEdits ? 'Yes' : 'No'}`);
        
        if (hasEdits) {
          console.log(`      Transform Data:`);
          console.log(`        - Zoom: ${imageData.zoom.toFixed(2)}x`);
          console.log(`        - Position X: ${imageData.position.x}px`);
          console.log(`        - Position Y: ${imageData.position.y}px`);
        }
        
        console.log(`      Raw File Object:`, imageData.file);

        // Create and log edited version if there are edits
        if (hasEdits) {
          const editedBlob = await createEditedImage(imageData, 800, 800);
          if (editedBlob) {
            console.log(`      ✨ Edited Version:`);
            console.log(`         Size: ${(editedBlob.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`         Type: image/jpeg`);
            console.log(`         Edited Blob:`, editedBlob);
          }
        }
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('              PRICING SUMMARY');
    console.log('═'.repeat(70) + '\n');

    console.log('💰 PRICING BREAKDOWN:');
    console.log(`   Album Shape: ${shape === 'square' ? 'Square' : 'Rectangle'}`);
    console.log(`   Base Price: ${BASE_PRICE} tk`);
    console.log(`   Pages: ${pageCount} × ${PRICE_PER_PAGE} tk = ${pageCount * PRICE_PER_PAGE} tk`);
    console.log(`   Subtotal: ${subtotal} tk`);
    console.log(`   Delivery: ${deliveryCharge} tk`);
    console.log(`   Total: ${total} tk`);

    console.log('\n' + '═'.repeat(70));
    console.log('              ALBUM STATISTICS');
    console.log('═'.repeat(70) + '\n');

    console.log('📊 STATISTICS:');
    console.log(`   Total Pages: ${pageCount}`);
    console.log(`   Pages with Photos: ${pagesWithPhotos}`);
    console.log(`   Total Images: ${totalImagesInAlbum}`);
    console.log(`   Has Cover Image: ${coverImage ? 'Yes' : 'No'}`);

    console.log('\n' + '═'.repeat(70) + '\n');

    toast.success("Order submitted! Check console for complete data.");
  };

  if (showContactForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Order Summary</h2>
          <Button variant="outline" onClick={() => setShowContactForm(false)}>
            Back to Album
          </Button>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Album</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">
                  {shape === "square" ? "Square" : "Rectangle"} Album • {pageCount} Pages
                </p>
                <p className="text-xs text-muted-foreground">
                  {pages.filter(p => p.images.some(img => img !== null)).length} pages with photos
                </p>
              </div>
              <span className="text-sm font-medium">{getTotalPrice()} tk</span>
            </div>
          </div>
        </Card>

        <ContactForm onSubmit={handleSubmitOrder} totalPrice={getTotalPrice()} />
      </div>
    );
  }

  const currentLayout = ALBUM_LAYOUTS.find(l => l.id === pages[currentPageIndex]?.layoutId);
  const layoutPositions = currentLayout ? currentLayout[shape] : [];

  return (
    <div className="space-y-6">
      {/* Step 1: Shape Selection */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Step 1: Choose Album Shape</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => {
                setShape("square");
                setStep(2);
              }}
              className="p-6 border-2 rounded-lg hover:border-primary transition-all hover:shadow-lg"
            >
              <div className="aspect-square bg-muted rounded mb-3"></div>
              <p className="font-semibold">Square Album</p>
            </button>
            <button
              onClick={() => {
                setShape("rectangle");
                setStep(2);
              }}
              className="p-6 border-2 rounded-lg hover:border-primary transition-all hover:shadow-lg"
            >
              <div className="aspect-[4/3] bg-muted rounded mb-3"></div>
              <p className="font-semibold">Rectangle Album</p>
            </button>
          </div>
        </Card>
      )}

      {/* Step 2: Cover Selection */}
      {step === 2 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Step 2: Select Cover Image</h2>
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          </div>
          <AlbumCoverSelector
            shape={shape}
            onCoverSelected={setCoverImage}
            selectedCover={coverImage}
          />
          <Button
            className="w-full mt-6"
            onClick={() => setStep(3)}
            disabled={!coverImage}
          >
            Continue
          </Button>
        </Card>
      )}

      {/* Step 3: Page Count Selection */}
      {step === 3 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Step 3: Select Number of Pages</h2>
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-6">
            {PAGE_OPTIONS.map(count => (
              <button
                key={count}
                onClick={() => setPageCount(count)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  pageCount === count
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">pages</p>
              </button>
            ))}
          </div>
          <div className="p-4 bg-muted rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Estimated Price:</span>
              <span className="text-lg font-bold">{BASE_PRICE + (pageCount * PRICE_PER_PAGE)} tk</span>
            </div>
          </div>
          <Button className="w-full" onClick={initializePages}>
            Continue to Page Layout
          </Button>
        </Card>
      )}

      {/* Step 4: Page Layout & Image Upload */}
      {step === 4 && pages.length > 0 && (
        <>
          {/* Photo Upload Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Photos</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                {uploadedPhotos.length} photos uploaded
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="album-photo-upload"
              />
              <Label htmlFor="album-photo-upload">
                <Button variant="outline" asChild>
                  <span>Choose Photos</span>
                </Button>
              </Label>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-6 gap-2">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="aspect-square">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded border"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Page Editor */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Page {currentPageIndex + 1} of {pageCount}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                  disabled={currentPageIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                  disabled={currentPageIndex === pages.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Layout Selection */}
            <div className="mb-4">
              <Label className="mb-2 block">Select Page Layout</Label>
              <div className="grid grid-cols-5 gap-2">
                {ALBUM_LAYOUTS.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => updatePageLayout(currentPageIndex, layout.id)}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      pages[currentPageIndex].layoutId === layout.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="text-xs font-medium">{layout.imageCount} {layout.imageCount === 1 ? 'Image' : 'Images'}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Preview */}
            <div className="bg-muted/30 rounded-lg p-8 min-h-[500px] flex items-center justify-center">
              <div
                className={`bg-white shadow-xl rounded-lg p-6 w-full max-w-2xl relative ${
                  shape === "square" ? "aspect-square" : "aspect-[4/3]"
                }`}
              >
                {layoutPositions.map((pos, slotIndex) => {
                  const imageData = pages[currentPageIndex].images[slotIndex];
                  return (
                    <div
                      key={slotIndex}
                      className="absolute border-2 border-dashed border-border rounded overflow-hidden bg-muted/50"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: `${pos.width}%`,
                        height: `${pos.height}%`,
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, slotIndex)}
                    >
                      {imageData ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, slotIndex)}
                        >
                          <ImageSlotEditor
                            image={imageData.file}
                            onRemove={() => removeImageFromSlot(currentPageIndex, slotIndex)}
                            zoom={imageData.zoom}
                            position={imageData.position}
                            onZoomChange={(zoom) => updateImageZoom(currentPageIndex, slotIndex, zoom)}
                            onPositionChange={(position) => updateImagePosition(currentPageIndex, slotIndex, position)}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground text-center mb-2">
                            Click to add
                          </p>
                          <div className="flex flex-wrap gap-1 justify-center max-h-16 overflow-y-auto">
                            {uploadedPhotos.slice(0, 4).map((photo, idx) => (
                              <button
                                key={idx}
                                onClick={() => addImageToSlot(currentPageIndex, slotIndex, photo)}
                                className="w-8 h-8 rounded border hover:border-primary"
                              >
                                <img
                                  src={URL.createObjectURL(photo)}
                                  alt={`Option ${idx}`}
                                  className="w-full h-full object-cover rounded"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg mt-6">
              <div>
                <p className="text-lg font-semibold">Total: {getTotalPrice()} tk</p>
                <p className="text-sm text-muted-foreground">
                  {shape === "square" ? "Square" : "Rectangle"} • {pageCount} pages
                </p>
              </div>
              <Button variant="hero" size="lg" onClick={() => setShowContactForm(true)}>
                Continue to Contact Info
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};