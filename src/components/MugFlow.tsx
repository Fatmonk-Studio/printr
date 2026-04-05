import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, RotateCw } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { ImagePreviewCanvas, CropData } from "./ImagePreviewCanvas";
import { toast } from "sonner";

// Assets
import mugWhite from "@/assets/service products/mug white.png";
import mugBlack from "@/assets/service products/mug black.png";

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
  orientation: "horizontal" | "vertical";
}

interface MugFlowProps {
  id: number;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

const MugFlow = ({ id, onUnsavedChangesChange }: MugFlowProps) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [printTypes, setPrintTypes] = useState<PrintType[]>([]);
  const [loadingPrintTypes, setLoadingPrintTypes] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hasUnsavedChanges = photos.length > 0 || showContactForm;

  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  // Fetch print types and sizes from API
  useEffect(() => {
    const fetchPrintTypes = async () => {
      try {
        const response = await fetch(
          `https://admin.printr.store/api/print-type/list/${id}`,
        );
        const result = await response.json();

        if (result.success && result.data) {
          setPrintTypes(result.data);
        } else {
          toast.error("Failed to load mug types");
        }
      } catch (error) {
        console.error("Error fetching print types:", error);
        toast.error("Failed to load mug types");
      } finally {
        setLoadingPrintTypes(false);
      }
    };

    fetchPrintTypes();
  }, [id]);

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
          const defaultPrintType = printTypes.length > 0 ? printTypes[0] : null;
          const defaultSize = defaultPrintType?.size?.[0];

          const newPhoto: PhotoItem = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            printTypeId: defaultPrintType?.id || 1,
            sizeId: defaultSize?.id || 1,
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
      prev.map((photo) => (photo.id === id ? { ...photo, ...updates } : photo)),
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

  const getPrintTypeById = (printTypeId: number): PrintType | undefined => {
    return printTypes.find((pt) => pt.id === printTypeId);
  };

  const getMugMockupImage = (printType?: PrintType) => {
    if (!printType) return mugWhite;
    const name = printType.name.toLowerCase();
    if (name.includes("black")) return mugBlack;
    return mugWhite;
  };

  const getSizeById = (sizeId: number): PrintSize | undefined => {
    for (const printType of printTypes) {
      const size = printType.size.find((s) => s.id === sizeId);
      if (size) return size;
    }
    return undefined;
  };

  const getAvailableSizes = (printTypeId: number): PrintSize[] => {
    const printType = getPrintTypeById(printTypeId);
    return printType?.size || [];
  };

  const getTotalPrice = () => {
    return photos.reduce((total, photo) => {
      const size = getSizeById(photo.sizeId);
      return total + (size ? parseFloat(size.price) : 0);
    }, 0);
  };

  const createCroppedImage = async (photo: PhotoItem): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const targetWidth = 140;
        const targetHeight = 150;

        const designWidth = photo.orientation === "horizontal" ? 180 : 150;
        const designHeight = photo.orientation === "horizontal" ? 150 : 180;

        canvas.width = targetWidth * 2;
        canvas.height = targetHeight * 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(2, 2);

        const centerXOffset = (designWidth - targetWidth) / 2;
        const centerYOffset = (designHeight - targetHeight) / 2;

        const cropData = photo.cropData || { x: 0, y: 0, scale: 1 };

        ctx.translate(-centerXOffset, -centerYOffset);
        ctx.translate(cropData.x, cropData.y);
        ctx.scale(cropData.scale, cropData.scale);

        ctx.drawImage(
          img,
          0,
          0,
          designWidth,
          designWidth * (img.height / img.width),
        );

        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not create blob"));
            }
          },
          "image/png",
          0.95,
        );
      };

      img.onerror = () => reject(new Error("Could not load image"));
      img.src = photo.preview;
    });
  };

  const createMockupImage = async (photo: PhotoItem): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        const croppedBlob = await createCroppedImage(photo);
        const croppedUrl = URL.createObjectURL(croppedBlob);

        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        const printType = getPrintTypeById(photo.printTypeId);
        bgImg.src = getMugMockupImage(printType);

        bgImg.onload = () => {
          const fgImg = new Image();
          fgImg.src = croppedUrl;

          fgImg.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              URL.revokeObjectURL(croppedUrl);
              reject(new Error("Could not get canvas context"));
              return;
            }

            // Use the natural size of the mug image for high quality
            canvas.width = bgImg.naturalWidth || 800;
            canvas.height = bgImg.naturalHeight || 800;

            // Draw Background (Mug)
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            // Calculate Overlay Position based on Desktop CSS proportions
            // CSS Container Height: 450px
            // CSS Overlay: w=140px, h=150px
            // CSS Margins from center: marginLeft=-30px, marginTop=15px
            const scaleFactor = canvas.height / 450;

            const drawWidth = 140 * scaleFactor;
            const drawHeight = 150 * scaleFactor;

            // Centered position calculation
            // Base center X/Y
            const centerX = (canvas.width - drawWidth) / 2;
            const centerY = (canvas.height - drawHeight) / 2;

            // Adjusted based on user feedback: vertical offset -50
            const drawX = centerX - 0 * scaleFactor;
            const drawY = centerY - 30 * scaleFactor;

            ctx.drawImage(fgImg, drawX, drawY, drawWidth, drawHeight);

            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(croppedUrl);
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Could not create mockup blob"));
                }
              },
              "image/jpeg", // Mockup can be JPEG as background is opaque usually, but mug might have transparency?
              // Wait, Mug images are likely PNGs with transparency if they are cutouts.
              // If the mug images provided (mug white.png) are actual cutouts, we should probably output PNG to keep transparency if the user wants to place it on another background later (though here it's for print).
              // Reviewing Totebag: used JPEG 0.9.
              // I'll stick to JPEG 0.9 for consistency with Totebag unless I see a reason not to.
              // Actually, print service might want high quality.
              0.9,
            );
          };

          fgImg.onerror = () => {
            URL.revokeObjectURL(croppedUrl);
            reject(new Error("Could not load cropped image"));
          };
        };

        bgImg.onerror = () => {
          URL.revokeObjectURL(croppedUrl);
          reject(new Error("Could not load mug background"));
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    try {
      toast.loading("Submitting your order...");

      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const croppedImageBlob = await createCroppedImage(photo);
          const mockupBlob = await createMockupImage(photo);
          return {
            croppedImageBlob,
            mockupBlob,
            rawFile: photo.file,
            printTypeId: photo.printTypeId,
            sizeId: photo.sizeId,
            orientation: photo.orientation,
          };
        }),
      );

      const formData = new FormData();
      formData.append("name", contactData.name);
      formData.append("email", contactData.email);
      formData.append("phone", contactData.phone);
      formData.append("service_id", id.toString());
      formData.append("location", contactData.location);
      formData.append(
        "delivery_type",
        contactData.deliveryLocation || "inside_dhaka",
      );
      formData.append("payment_method", contactData.paymentMethod);

      const subtotal = getTotalPrice();
      const deliveryCharge =
        contactData.deliveryLocation === "outside_dhaka" ? 150 : 80;
      const finalPrice = subtotal + deliveryCharge;
      formData.append("price", finalPrice.toString());

      if (contactData.additionalInfo) {
        formData.append("additional_info", contactData.additionalInfo);
      }

      processedPhotos.forEach((processed, index) => {
        formData.append(
          `documents[${index}][print_type_id]`,
          processed.printTypeId.toString(),
        );
        formData.append(
          `documents[${index}][size_id]`,
          processed.sizeId.toString(),
        );
        formData.append(`documents[${index}][frame_id]`, "");
        formData.append(
          `documents[${index}][orientation]`,
          processed.orientation,
        );
        formData.append(`documents[${index}][bleed_type]`, "none");
        formData.append(`documents[${index}][custom_size]`, "");

        // 1. custom_file (Mug Mockup)
        formData.append(
          `documents[${index}][custom_file]`,
          processed.mockupBlob,
          `mug_mockup_${index + 1}.jpg`,
        );

        // 2. raw_file (User's Raw Upload)
        formData.append(
          `documents[${index}][raw_file]`,
          processed.rawFile,
          processed.rawFile.name,
        );
      });

      const response = await fetch(
        "https://admin.printr.store/api/service/submit",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();
      toast.dismiss();

      if (response.ok && result.success) {
        toast.success("Order submitted successfully!");
        setPhotos([]);
        setShowContactForm(false);
      } else {
        toast.error(
          result.message || "Failed to submit order. Please try again.",
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
            Your Mugs ({photos.length})
          </h3>
          <div className="space-y-2">
            {photos.map((photo) => {
              const size = getSizeById(photo.sizeId);
              const printType = getPrintTypeById(photo.printTypeId);

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
                      {printType?.name || "Mug"} - {size?.dimention}
                    </p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {size ? parseFloat(size.price).toFixed(0) : 0} tk
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
          Upload Design for Mug
        </h2>
        <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center">
          <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            Upload your images to preview on a mug
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="mug-upload"
          />
          <Label htmlFor="mug-upload">
            <Button variant="outline" asChild className="cursor-pointer">
              <span>Choose Photos</span>
            </Button>
          </Label>
        </div>
      </Card>

      {/* Photos List */}
      {!loadingPrintTypes && photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Customize Your Mugs
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

                  {/* Mug Mockup Container */}
                  <div
                    className="relative flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden border"
                    style={{
                      height: isMobile ? "300px" : "450px",
                    }}
                  >
                    {/* The Mug Image (Background) */}
                    <img
                      src={getMugMockupImage(
                        getPrintTypeById(photo.printTypeId),
                      )}
                      alt="Mug Mockup"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />

                    {/* The User Image (Overlay) */}
                    <div
                      className="relative z-10"
                      style={{
                        width: isMobile ? "90px" : "140px",
                        height: isMobile ? "100px" : "150px",
                        marginLeft: isMobile ? "-20px" : "-30px", // Offset for mug curvature/handle
                        marginTop: isMobile ? "10px" : "15px",
                      }}
                    >
                      <div className="w-full h-full overflow-hidden flex justify-center items-center">
                        <ImagePreviewCanvas
                          imageUrl={photo.preview}
                          width={
                            photo.orientation === "horizontal"
                              ? isMobile
                                ? 120
                                : 180
                              : isMobile
                                ? 100
                                : 150
                          }
                          height={
                            photo.orientation === "horizontal"
                              ? isMobile
                                ? 100
                                : 150
                              : isMobile
                                ? 120
                                : 180
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
                            (photo.cropData?.scale || 1) - 0.1,
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
                            (photo.cropData?.scale || 1) + 0.1,
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
                  {/* Mug Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Mug Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {printTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            const firstSize = type.size?.[0];
                            updatePhoto(photo.id, {
                              printTypeId: type.id,
                              sizeId: firstSize?.id || photo.sizeId,
                            });
                          }}
                          className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                            photo.printTypeId === type.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {type.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Print Size</Label>
                    <div className="space-y-2">
                      {getAvailableSizes(photo.printTypeId).map((size) => (
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
                            {parseFloat(size.price).toFixed(0)} tk
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
                        {(getSizeById(photo.sizeId)
                          ? parseFloat(getSizeById(photo.sizeId)!.price)
                          : 0
                        ).toFixed(0)}{" "}
                        tk
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      * Final price includes printing and the mug itself.
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

export default MugFlow;
