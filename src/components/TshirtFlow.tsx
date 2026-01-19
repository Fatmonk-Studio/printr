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
import { Upload, X, RotateCw, Image as ImageIcon } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { ImagePreviewCanvas, CropData } from "./ImagePreviewCanvas";
import { toast } from "sonner";

// Assets
import tshirtWhite from "@/assets/service products/tshirt_white.png";
import tshirtBlack from "@/assets/service products/tshirt _black.png";

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

interface ImageSlot {
  file: File | null;
  preview: string | null;
  cropData: CropData;
}

interface TshirtItem {
  id: string;
  printTypeId: number;
  sizeId: number;
  logo: ImageSlot;
  front: ImageSlot;
  back: ImageSlot;
}

// Mobile scaling factor
const MOBILE_SCALE_FACTOR = 0.65;

const TshirtFlow = ({ id }: { id: number }) => {
  const [items, setItems] = useState<TshirtItem[]>([]);
  const [printTypes, setPrintTypes] = useState<PrintType[]>([]);
  const [loadingPrintTypes, setLoadingPrintTypes] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSlot, setActiveSlot] = useState<
    Record<string, "logo" | "front" | "back" | null>
  >({});

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
          toast.error("Failed to load T-shirt types");
        }
      } catch (error) {
        console.error("Error fetching print types:", error);
        toast.error("Failed to load T-shirt types");
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

  const addNewItem = () => {
    const defaultPrintType = printTypes.length > 0 ? printTypes[0] : null;
    const defaultSize = defaultPrintType?.size?.[0];

    const newItem: TshirtItem = {
      id: Math.random().toString(36).substr(2, 9),
      printTypeId: defaultPrintType?.id || 1,
      sizeId: defaultSize?.id || 1,
      logo: { file: null, preview: null, cropData: { x: 0, y: 0, scale: 0.5 } },
      front: {
        file: null,
        preview: null,
        cropData: { x: 0, y: 0, scale: 0.8 },
      },
      back: { file: null, preview: null, cropData: { x: 0, y: 0, scale: 0.8 } },
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleFileUpload = (
    itemId: string,
    slot: "logo" | "front" | "back",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateItem(itemId, {
          [slot]: {
            file,
            preview: event.target?.result as string,
            cropData:
              slot === "logo"
                ? { x: 30, y: 30, scale: 0.3 }
                : { x: 0, y: 0, scale: 0.7 },
          },
        });
      };
      reader.readAsDataURL(file);
      toast.success(
        `${slot.charAt(0).toUpperCase() + slot.slice(1)} image uploaded!`,
      );
    }
  };

  const updateItem = (id: string, updates: Partial<TshirtItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const updateCrop = (
    itemId: string,
    slot: "logo" | "front" | "back",
    cropData: CropData,
  ) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      updateItem(itemId, {
        [slot]: { ...item[slot], cropData },
      });
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const removeImage = (itemId: string, slot: "logo" | "front" | "back") => {
    updateItem(itemId, {
      [slot]: { file: null, preview: null, cropData: { x: 0, y: 0, scale: 1 } },
    });
  };

  const getPrintTypeById = (printTypeId: number): PrintType | undefined => {
    return printTypes.find((pt) => pt.id === printTypeId);
  };

  const getTshirtMockupImage = (printType?: PrintType) => {
    if (!printType) return tshirtWhite;
    const name = printType.name.toLowerCase();
    if (name.includes("black")) return tshirtBlack;
    return tshirtWhite;
  };

  const getSizeById = (sizeId: number): PrintSize | undefined => {
    for (const printType of printTypes) {
      const size = printType.size.find((s) => s.id === sizeId);
      if (size) return size;
    }
    return undefined;
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const size = getSizeById(item.sizeId);
      return total + (size ? parseFloat(size.price) : 0);
    }, 0);
  };

  const createCroppedImage = async (
    preview: string,
    cropData: CropData,
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context error"));

        const outputSize = 600;
        canvas.width = outputSize;
        canvas.height = outputSize;

        const referenceWidth = 200;
        const imgAspect = img.height / img.width;

        ctx.save();
        ctx.scale(3, 3); // 3x for high quality output (600px from 200px ref)
        ctx.translate(cropData.x, cropData.y);
        ctx.scale(cropData.scale, cropData.scale);
        ctx.drawImage(img, 0, 0, referenceWidth, referenceWidth * imgAspect);
        ctx.restore();

        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Blob error"))),
          "image/png",
        );
      };
      img.onerror = () => reject(new Error("Image load error"));
      img.src = preview;
    });
  };

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    if (items.length === 0) {
      toast.error("Please add at least one T-shirt");
      return;
    }

    const hasAnyImage = items.every(
      (item) => item.logo.file || item.front.file || item.back.file,
    );
    if (!hasAnyImage) {
      toast.error(
        "Please upload at least one image (Logo, Front, or Back) for each T-shirt",
      );
      return;
    }

    try {
      toast.loading("Submitting your order...");
      const formData = new FormData();
      formData.append("name", contactData.name);
      formData.append("email", contactData.email);
      formData.append("phone", contactData.phone);
      formData.append("service_id", "6"); // Assuming 6 for T-shirt
      formData.append("location", contactData.location);
      formData.append(
        "delivery_type",
        contactData.deliveryLocation || "inside_dhaka",
      );
      formData.append("payment_method", contactData.paymentMethod);
      if (contactData.additionalInfo)
        formData.append("additional_info", contactData.additionalInfo);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        formData.append(
          `documents[${i}][print_type_id]`,
          item.printTypeId.toString(),
        );
        formData.append(`documents[${i}][size_id]`, item.sizeId.toString());

        if (item.logo.preview && item.logo.file) {
          const blob = await createCroppedImage(
            item.logo.preview,
            item.logo.cropData,
          );
          formData.append(`documents[${i}][logo_file]`, blob, `logo_${i}.png`);
        }
        if (item.front.preview && item.front.file) {
          const blob = await createCroppedImage(
            item.front.preview,
            item.front.cropData,
          );
          formData.append(
            `documents[${i}][front_file]`,
            blob,
            `front_${i}.png`,
          );
        }
        if (item.back.preview && item.back.file) {
          const blob = await createCroppedImage(
            item.back.preview,
            item.back.cropData,
          );
          formData.append(`documents[${i}][back_file]`, blob, `back_${i}.png`);
        }
      }

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
        setItems([]);
        setShowContactForm(false);
      } else {
        toast.error(result.message || "Failed to submit order.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred during submission.");
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
            Back to Design
          </Button>
        </div>

        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3">
            Your T-Shirts ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item) => {
              const size = getSizeById(item.sizeId);
              const printType = getPrintTypeById(item.printTypeId);
              const activeSlots = [
                item.logo.file && "Logo",
                item.front.file && "Front",
                item.back.file && "Back",
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium">
                      Custom T-Shirt - {printType?.name || "T-Shirt"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {size?.name} ({size?.dimention}) -{" "}
                      {activeSlots || "No images"}
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
      {/* Introduction Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Design Your Custom T-Shirt
            </h2>
            <p className="text-sm text-muted-foreground">
              Add multiple images (Logo, Front, Back) and customize your look.
            </p>
          </div>
          <Button onClick={addNewItem} className="w-full sm:w-auto">
            Add New T-Shirt
          </Button>
        </div>
      </Card>

      {/* T-Shirt List */}
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-3 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Visual Preview Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">
                      Mockup Preview
                    </h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" /> Remove T-Shirt
                    </Button>
                  </div>

                  {/* Multiple Image Mockup Canvas */}
                  <div
                    className="relative flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden border"
                    style={{ height: isMobile ? "500px" : "600px" }}
                  >
                    <div className="w-full h-full relative flex justify-center items-center scale-[1.35] origin-center">
                      {/* T-Shirt Background */}
                      <img
                        src={getTshirtMockupImage(
                          getPrintTypeById(item.printTypeId),
                        )}
                        alt="T-Shirt Mockup"
                        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
                      />

                      {/* Logo Overlay */}
                      {item.logo.preview && (
                        <div
                          className={`absolute z-30 transition-opacity duration-200 ${
                            activeSlot[item.id] === "logo"
                              ? "opacity-100 z-50 pointer-events-auto"
                              : "opacity-90 z-20 pointer-events-none"
                          }`}
                          style={{
                            width: "100%",
                            height: "100%",
                            top: "0",
                            left: "0",
                          }}
                        >
                          <div className="w-full h-full overflow-hidden">
                            <ImagePreviewCanvas
                              imageUrl={item.logo.preview}
                              width={isMobile ? 500 : 800}
                              height={isMobile ? 500 : 800}
                              onCropChange={(crop) =>
                                updateCrop(item.id, "logo", crop)
                              }
                              showControls={false}
                              transparent={true}
                              initialCropData={item.logo.cropData}
                            />
                          </div>
                        </div>
                      )}

                      {/* Front Overlay */}
                      {item.front.preview && (
                        <div
                          className={`absolute z-20 transition-opacity duration-200 ${
                            activeSlot[item.id] === "front"
                              ? "opacity-100 z-50 pointer-events-auto"
                              : "opacity-90 z-20 pointer-events-none"
                          }`}
                          style={{
                            width: "100%",
                            height: "100%",
                            top: "0",
                            left: "0",
                          }}
                        >
                          <div className="w-full h-full overflow-hidden">
                            <ImagePreviewCanvas
                              imageUrl={item.front.preview}
                              width={isMobile ? 500 : 800}
                              height={isMobile ? 500 : 800}
                              onCropChange={(crop) =>
                                updateCrop(item.id, "front", crop)
                              }
                              showControls={false}
                              transparent={true}
                              initialCropData={item.front.cropData}
                            />
                          </div>
                        </div>
                      )}

                      {/* Back Overlay */}
                      {item.back.preview && (
                        <div
                          className={`absolute z-10 transition-opacity duration-200 ${
                            activeSlot[item.id] === "back"
                              ? "opacity-100 z-50 pointer-events-auto"
                              : "opacity-70 z-20 pointer-events-none"
                          }`}
                          style={{
                            width: "100%",
                            height: "100%",
                            top: "0",
                            left: "0",
                          }}
                        >
                          <div className="w-full h-full overflow-hidden">
                            <ImagePreviewCanvas
                              imageUrl={item.back.preview}
                              width={isMobile ? 500 : 800}
                              height={isMobile ? 500 : 800}
                              onCropChange={(crop) =>
                                updateCrop(item.id, "back", crop)
                              }
                              showControls={false}
                              transparent={true}
                              initialCropData={item.back.cropData}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Configuration Section */}
                <div className="space-y-6">
                  {/* Image Upload Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        Upload Images
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Click an image to move it freely on the mockup
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {(["logo", "front", "back"] as const).map((slot) => (
                        <div
                          key={slot}
                          className="flex flex-col gap-2"
                          onMouseDown={() =>
                            setActiveSlot((prev) => ({
                              ...prev,
                              [item.id]: slot,
                            }))
                          }
                        >
                          <div
                            className={`relative flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                              item[slot].preview
                                ? activeSlot[item.id] === slot
                                  ? "bg-primary/10 border-primary ring-1 ring-primary"
                                  : "bg-primary/5 border-primary/50"
                                : "border-dashed"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                                {item[slot].preview ? (
                                  <img
                                    src={item[slot].preview!}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium capitalize">
                                  {slot} Image
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {item[slot].preview
                                    ? "Image added"
                                    : `Add ${slot} placement`}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {item[slot].preview ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeImage(item.id, slot)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              ) : (
                                <>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleFileUpload(item.id, slot, e)
                                    }
                                    className="hidden"
                                    id={`upload-${item.id}-${slot}`}
                                  />
                                  <Label htmlFor={`upload-${item.id}-${slot}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      asChild
                                      className="h-8 cursor-pointer"
                                    >
                                      <span>Upload</span>
                                    </Button>
                                  </Label>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Slot Zoom Control (Only if image exists) */}
                          {item[slot].preview && (
                            <div className="px-1 flex items-center gap-3">
                              <span className="text-[10px] font-medium min-w-[30px]">
                                {Math.round(item[slot].cropData.scale * 100)}%
                              </span>
                              <input
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.05"
                                value={item[slot].cropData.scale}
                                onChange={(e) =>
                                  updateCrop(item.id, slot, {
                                    ...item[slot].cropData,
                                    scale: parseFloat(e.target.value),
                                  })
                                }
                                className="flex-1 h-1.5 accent-primary"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* T-Shirt Type & Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">
                        T-Shirt Type
                      </Label>
                      <Select
                        value={item.printTypeId.toString()}
                        onValueChange={(val) => {
                          const newPrintTypeId = parseInt(val);
                          const printType = getPrintTypeById(newPrintTypeId);
                          const firstSize = printType?.size?.[0];
                          updateItem(item.id, {
                            printTypeId: newPrintTypeId,
                            sizeId: firstSize?.id || item.sizeId,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {printTypes.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                            >
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">
                        Select Size
                      </Label>
                      <Select
                        value={item.sizeId.toString()}
                        onValueChange={(val) =>
                          updateItem(item.id, { sizeId: parseInt(val) })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPrintTypeById(item.printTypeId)?.size.map(
                            (size) => (
                              <SelectItem
                                key={size.id}
                                value={size.id.toString()}
                              >
                                {size.name} ({parseFloat(size.price).toFixed(0)}{" "}
                                tk)
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Individual Price Box */}
                  <div className="p-4 rounded-lg flex justify-between items-center bg-primary/5 border border-primary/20">
                    <span className="text-sm font-medium">Item Subtotal</span>
                    <span className="text-xl font-bold text-primary">
                      {(getSizeById(item.sizeId)
                        ? parseFloat(getSizeById(item.sizeId)!.price)
                        : 0
                      ).toFixed(0)}{" "}
                      tk
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Checkout Section */}
          <div className="flex flex-col items-end gap-3 pt-6 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Grand Total for {items.length} item(s)
              </p>
              <p className="text-4xl font-bold text-primary">
                {getTotalPrice()} tk
              </p>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full sm:w-auto px-16 h-14 text-lg"
              onClick={() => setShowContactForm(true)}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-2">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No designs yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Click "Add New T-Shirt" to start customizing your apparel.
          </p>
          <Button onClick={addNewItem} variant="outline">
            Get Started
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TshirtFlow;
