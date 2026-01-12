import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, RotateCw } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { ImagePreviewCanvas, CropData } from "./ImagePreviewCanvas";
import { toast } from "sonner";

// Assets
import totebagWhite from "@/assets/service products/totebag.png";
import totebagBlack from "@/assets/service products/totebag black.png";

interface TotebagOption {
  id: string;
  name: string;
  image: string;
  color: string;
}

const totebagOptions: TotebagOption[] = [
  { id: "white", name: "White Totebag", image: totebagWhite, color: "White" },
  { id: "black", name: "Black Totebag", image: totebagBlack, color: "Black" },
];

interface PrintSize {
  id: number;
  name: string;
  dimention: string;
  price: number;
}

const dummySizes: PrintSize[] = [
  { id: 1, name: "Standard", dimention: '12" x 16"', price: 550 },
  { id: 2, name: "Large", dimention: '16" x 20"', price: 750 },
];

interface PhotoItem {
  id: string;
  file: File;
  totebagId: string;
  sizeId: number;
  preview: string;
  cropData?: CropData;
  orientation: "horizontal" | "vertical";
}

// Mobile scaling factor
const MOBILE_SCALE_FACTOR = 0.65;

const TotebagFlow = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: PhotoItem = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            totebagId: "white",
            sizeId: 1,
            preview: e.target?.result as string,
            cropData: { x: 0, y: 0, scale: 1 },
            orientation: "vertical",
          };
          setPhotos((prev) => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (files.length > 0) {
      toast.success(`${files.length} photo(s) uploaded successfully!`);
    }
  };

  const updatePhoto = (id: string, updates: Partial<PhotoItem>) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, ...updates } : photo))
    );
  };

  const updatePhotoCrop = (id: string, cropData: CropData) => {
    updatePhoto(id, { cropData });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const rotateOrientation = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) {
      updatePhoto(id, {
        orientation:
          photo.orientation === "horizontal" ? "vertical" : "horizontal",
      });
    }
  };

  const getTotebagById = (id: string) => {
    return totebagOptions.find((t) => t.id === id) || totebagOptions[0];
  };

  const getSizeById = (id: number) => {
    return dummySizes.find((s) => s.id === id) || dummySizes[0];
  };

  const getTotalPrice = () => {
    return photos.reduce((total, photo) => {
      const size = getSizeById(photo.sizeId);
      return total + size.price;
    }, 0);
  };

  const createCroppedImage = async (photo: PhotoItem): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Mockup area dimensions (roughly 200x200 for preview logic)
        const outputWidth = 400;
        const outputHeight = 400;

        const cropData = photo.cropData || { x: 0, y: 0, scale: 1 };

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Replicate logic from FrameFlow.tsx createCroppedImage
        const previewImageWidth = 200; // Reference width in preview
        const previewImageHeight = (img.height / img.width) * previewImageWidth;

        ctx.save();
        ctx.scale(2, 2); // 2x for better quality
        ctx.translate(cropData.x, cropData.y);
        ctx.scale(cropData.scale, cropData.scale);
        ctx.drawImage(img, 0, 0, previewImageWidth, previewImageHeight);
        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not create blob"));
            }
          },
          "image/jpeg",
          0.95
        );
      };

      img.onerror = () => reject(new Error("Could not load image"));
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
            totebagId: photo.totebagId,
            sizeId: photo.sizeId,
            orientation: photo.orientation,
          };
        })
      );

      const formData = new FormData();
      formData.append("name", contactData.name);
      formData.append("email", contactData.email);
      formData.append("phone", contactData.phone);
      formData.append("service_id", "5"); // Assuming 5 is for Totebag
      formData.append("location", contactData.location);
      formData.append(
        "delivery_type",
        contactData.deliveryLocation || "inside_dhaka"
      );
      formData.append("payment_method", contactData.paymentMethod);

      if (contactData.additionalInfo) {
        formData.append("additional_info", contactData.additionalInfo);
      }

      processedPhotos.forEach((processed, index) => {
        formData.append(
          `documents[${index}][totebag_color]`,
          processed.totebagId
        );
        formData.append(
          `documents[${index}][size_id]`,
          processed.sizeId.toString()
        );
        formData.append(
          `documents[${index}][orientation]`,
          processed.orientation
        );
        formData.append(
          `documents[${index}][file]`,
          processed.croppedImageBlob,
          `totebag_${index + 1}.jpg`
        );
      });

      // Using the same endpoint as FrameFlow
      const response = await fetch(
        "https://admin.printr.store/api/service/submit",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      toast.dismiss();

      if (response.ok && result.success) {
        toast.success("Order submitted successfully!");
        setPhotos([]);
        setShowContactForm(false);
      } else {
        toast.error(
          result.message || "Failed to submit order. Please try again."
        );
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to submit order. Please try again.");
    }
  };

  if (showContactForm) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-semibold">Order Summary</h2>
          <Button
            variant="outline"
            onClick={() => setShowContactForm(false)}
            className="w-full sm:w-auto"
          >
            Back to Photos
          </Button>
        </div>

        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3">
            Your Totebags ({photos.length})
          </h3>
          <div className="space-y-2">
            {photos.map((photo) => {
              const size = getSizeById(photo.sizeId);
              const totebag = getTotebagById(photo.totebagId);

              return (
                <div
                  key={photo.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {photo.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totebag.name} - {size.dimention}
                    </p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {size.price} tk
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <ContactForm
          onSubmit={handleSubmitOrder}
          totalPrice={getTotalPrice()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Upload Section */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
          Upload Design for Totebag
        </h2>
        <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center">
          <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            Upload your images to preview on a totebag
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="totebag-upload"
          />
          <Label htmlFor="totebag-upload">
            <Button variant="outline" asChild className="cursor-pointer">
              <span>Choose Photos</span>
            </Button>
          </Label>
        </div>
      </Card>

      {/* Photos List */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Customize Your Totebags
            </h2>
            <Button variant="hero" onClick={() => setShowContactForm(true)}>
              Proceed to Order
            </Button>
          </div>

          {photos.map((photo) => (
            <Card key={photo.id} className="p-3 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Mockup Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">
                      Mockup Preview
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateOrientation(photo.id)}
                        className="h-8 text-xs"
                      >
                        <RotateCw className="w-3 h-3 mr-1" />
                        Rotate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(photo.id)}
                        className="h-8 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Totebag Mockup Container */}
                  <div
                    className="relative flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden border"
                    style={{
                      height: isMobile ? "300px" : "450px",
                    }}
                  >
                    {/* The Totebag Image (Background) */}
                    <img
                      src={getTotebagById(photo.totebagId).image}
                      alt="Totebag Mockup"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />

                    {/* The User Image (Overlay) */}
                    <div
                      className="relative z-10"
                      style={{
                        width: isMobile ? "110px" : "170px",
                        height: isMobile ? "120px" : "180px",
                        marginTop: isMobile ? "75px" : "120px", // Increased to move top down
                      }}
                    >
                      <div className="w-full h-full overflow-hidden flex justify-center items-center">
                        <ImagePreviewCanvas
                          imageUrl={photo.preview}
                          width={
                            photo.orientation === "horizontal"
                              ? isMobile
                                ? 180
                                : 280
                              : isMobile
                              ? 130
                              : 200
                          }
                          height={
                            photo.orientation === "horizontal"
                              ? isMobile
                                ? 130
                                : 200
                              : isMobile
                              ? 180
                              : 280
                          }
                          onCropChange={(cropData) =>
                            updatePhotoCrop(photo.id, cropData)
                          }
                          showControls={false}
                          transparent={true}
                          initialCropData={photo.cropData}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Zoom Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium">
                        Adjust Image Size (Zoom)
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round((photo.cropData?.scale || 1) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => {
                          const newScale = Math.max(
                            0.1,
                            (photo.cropData?.scale || 1) - 0.1
                          );
                          updatePhotoCrop(photo.id, {
                            ...photo.cropData!,
                            scale: newScale,
                          });
                        }}
                      >
                        {" "}
                        -{" "}
                      </Button>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={photo.cropData?.scale || 1}
                        onChange={(e) => {
                          updatePhotoCrop(photo.id, {
                            ...photo.cropData!,
                            scale: parseFloat(e.target.value),
                          });
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => {
                          const newScale = Math.min(
                            3,
                            (photo.cropData?.scale || 1) + 0.1
                          );
                          updatePhotoCrop(photo.id, {
                            ...photo.cropData!,
                            scale: newScale,
                          });
                        }}
                      >
                        {" "}
                        +{" "}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Configuration Options */}
                <div className="space-y-6">
                  {/* Color Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Totebag Color
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {totebagOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() =>
                            updatePhoto(photo.id, { totebagId: option.id })
                          }
                          className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                            photo.totebagId === option.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border shadow-sm`}
                            style={{
                              backgroundColor:
                                option.id === "white" ? "#fff" : "#1a1a1a",
                            }}
                          />
                          <span className="text-sm font-medium">
                            {option.color}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Print Size</Label>
                    <div className="space-y-2">
                      {dummySizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() =>
                            updatePhoto(photo.id, { sizeId: size.id })
                          }
                          className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all ${
                            photo.sizeId === size.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-medium">{size.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {size.dimention}
                            </p>
                          </div>
                          <span className="text-sm font-semibold">
                            {size.price} tk
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Subtotal for this item
                      </span>
                      <span className="font-semibold">
                        {getSizeById(photo.sizeId).price} tk
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      * Final price includes printing and the totebag itself.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex flex-col items-end gap-3 pt-4 px-1">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total for {photos.length} item(s)
              </p>
              <p className="text-3xl font-bold text-primary">
                {getTotalPrice()} tk
              </p>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full sm:w-auto px-12"
              onClick={() => setShowContactForm(true)}
            >
              Checkout Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotebagFlow;
