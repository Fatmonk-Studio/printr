import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Upload, X, Download, Square, RectangleHorizontal } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import CollageItem from "./CollageItem";
import { toast } from "sonner";
import html2canvas from "html2canvas";

type Shape = "square" | "rectangle";

const COLLAGE_SIZES = {
  "square-small": { name: "12\" × 12\" Square", price: 800, width: 400, height: 400 },
  "square-large": { name: "16\" × 16\" Square", price: 1200, width: 500, height: 500 },
  "rectangle-medium": { name: "16\" × 12\" Rectangle", price: 900, width: 500, height: 375 },
  "rectangle-large": { name: "20\" × 16\" Rectangle", price: 1500, width: 600, height: 480 },
};

interface ImageTransformData {
  id: string;
  scale: number;
  position: { x: number; y: number };
}

export const CollageFlow = () => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImg, setSelectedImg] = useState<File[]>([]);
  const [selectedShape, setSelectedShape] = useState<Shape>("square");
  const [showCollage, setShowCollage] = useState(false);
  const [collageSize, setCollageSize] = useState("square-small");
  const [showContactForm, setShowContactForm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageTransforms, setImageTransforms] = useState<Map<string, ImageTransformData>>(new Map());
  const [capturedCollageBlob, setCapturedCollageBlob] = useState<Blob | null>(null);
  const collageRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to get layout description
  const getLayoutDescription = (count: number) => {
    const descriptions = {
      1: "Single spotlight",
      2: "Side-by-side",
      3: "Hero with thumbnails",
      4: "Classic grid",
      5: "Focal with accents",
      6: "Magazine style",
      7: "Gallery mix",
      8: "Creative blend",
      9: "Story grid",
      10: "Showcase spread"
    };
    return descriptions[count as keyof typeof descriptions] || "Custom layout";
  };

  // Enhanced function to determine collage layout based on number of images and shape
  const getCollageLayout = (count: number, shape: Shape = selectedShape) => {
    if (shape === "square") {
      // Square layouts - optimized for 1:1 aspect ratio
      const squareLayouts = {
        1: {
          containerClass: "w-full max-w-md mx-auto",
          gridClass: "grid grid-cols-1",
          itemClasses: ["col-span-1 aspect-square"],
          aspectRatio: "1/1"
        },
        2: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-4 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-4 aspect-[1/2]",  // item1: Left side (spans 2 cols, 4 rows)
            "col-span-2 row-span-4 aspect-[1/2]"   // item2: Right side (spans 2 cols, 4 rows)
          ],
          aspectRatio: "1/1"
        },
        3: {
          containerClass: "w-full max-w-2xl mx-auto",
          gridClass: "grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-1 aspect-[2/1]", // Wide top image
            "col-span-1 row-span-1 aspect-square", // Bottom left
            "col-span-1 row-span-1 aspect-square"  // Bottom right
          ],
          aspectRatio: "1/1"
        },
        4: {
          containerClass: "w-full max-w-2xl mx-auto",
          gridClass: "grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-1 row-span-1 aspect-square",
            "col-span-1 row-span-1 aspect-square", 
            "col-span-1 row-span-1 aspect-square",
            "col-span-1 row-span-1 aspect-square"
          ],
          aspectRatio: "1/1"
        },
        5: {
          containerClass: "w-full max-w-2xl mx-auto",
          gridClass: "grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-2 aspect-square", // Large center piece
            "col-span-1 row-span-1 aspect-square",   // Top right
            "col-span-1 row-span-1 aspect-square",   // Middle right
            "col-span-1 row-span-1 aspect-square",  // Bottom left
            "col-span-2 row-span-1 aspect-[2/1]"    // Bottom center-right
          ],
          aspectRatio: "1/1"
        },
        6: {
          containerClass: "w-full max-w-2xl mx-auto",
          gridClass: "grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-2 aspect-square", // Large main image
            "col-span-1 row-span-1 aspect-square", // Top right
            "col-span-1 row-span-1 aspect-square", // Middle right
            "col-span-1 row-span-1 aspect-square", // Bottom left
            "col-span-1 row-span-1 aspect-square", // Bottom center
            "col-span-1 row-span-1 aspect-square"  // Bottom right
          ],
          aspectRatio: "1/1"
        },
        7: {
          containerClass: "w-full max-w-2xl mx-auto",
          gridClass: "grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-1 row-span-1 aspect-square", // Top left
            "col-span-1 row-span-1 aspect-square", // Top center  
            "col-span-1 row-span-1 aspect-square", // Top right
            "col-span-1 row-span-1 aspect-square", // Middle left
            "col-span-1 row-span-1 aspect-square", // Middle center
            "col-span-1 row-span-1 aspect-square", // Middle right
            "col-span-3 row-span-1 aspect-[3/1]"   // Bottom wide (spans full width)
          ],
          aspectRatio: "1/1"
        },
        8: {
          containerClass: "w-full max-w-2xl mx-auto",
          gridClass: "grid grid-cols-4 grid-rows-4 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-2 aspect-square", // Center piece
            "col-span-1 row-span-1 aspect-square", // Top right 1
            "col-span-1 row-span-1 aspect-square", // Top right 2
            "col-span-1 row-span-1 aspect-square", // Middle right 1
            "col-span-1 row-span-1 aspect-square", // Middle right 2
            "col-span-1 row-span-1 aspect-square", // Bottom left 1
            "col-span-1 row-span-1 aspect-square", // Bottom left 2
            "col-span-2 row-span-1 aspect-[2/1]"   // Bottom right wide
          ],
          aspectRatio: "1/1"
        },
        9: {
          containerClass: "w-full max-w-2xl mx-auto",
          gridClass: "grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-1 row-span-1 aspect-square", // Top left
            "col-span-1 row-span-1 aspect-square", // Top center
            "col-span-1 row-span-1 aspect-square", // Top right
            "col-span-1 row-span-1 aspect-square", // Middle left
            "col-span-1 row-span-1 aspect-square", // Middle center
            "col-span-1 row-span-1 aspect-square", // Middle right
            "col-span-1 row-span-1 aspect-square", // Bottom left
            "col-span-1 row-span-1 aspect-square", // Bottom center
            "col-span-1 row-span-1 aspect-square"  // Bottom right
          ],
          aspectRatio: "1/1"
        },
        10: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-4 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-2 aspect-square",     // item1: Large left (spans 2 cols, 2 rows)
            "col-span-2 row-span-1 aspect-[2/1]",      // item2: Top right wide (spans 2 cols)
            "col-span-1 row-span-1 aspect-square",     // item3: Mid right 1
            "col-span-1 row-span-1 aspect-square",     // item4: Mid right 2
            "col-span-1 row-span-1 aspect-square",     // item5: Row 3, Col 1
            "col-span-1 row-span-1 aspect-square",     // item6: Row 3, Col 2
            "col-span-2 row-span-1 aspect-[2/1]",      // item7: Row 3, wide right (spans 2 cols)
            "col-span-2 row-span-1 aspect-[2/1]",      // item8: Row 4, left wide (spans 2 cols)
            "col-span-1 row-span-1 aspect-square",     // item9: Row 4, Col 3
            "col-span-1 row-span-1 aspect-square"      // item10: Row 4, Col 4
          ],
          aspectRatio: "1/1"
        }
      };
      return squareLayouts[count as keyof typeof squareLayouts] || squareLayouts[1];
    } else {
      // Rectangle layouts - same structure as square, with wider aspect ratios (reduced height)
      const rectangleLayouts = {
        1: {
          containerClass: "w-full max-w-md mx-auto",
          gridClass: "grid grid-cols-1",
          itemClasses: ["col-span-1 aspect-[4/3]"],
          aspectRatio: "4/3"
        },
        2: {
          containerClass: "w-full max-w-5xl mx-auto",
          gridClass: "grid grid-cols-4 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-4 aspect-[2/3]",  // item1: Left side (wider than square's 1/2)
            "col-span-2 row-span-4 aspect-[2/3]"   // item2: Right side (wider than square's 1/2)
          ],
          aspectRatio: "4/3"
        },
        3: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-1 aspect-[3/1]", // Wide top image (wider than square's 2/1)
            "col-span-1 row-span-1 aspect-[4/3]", // Bottom left (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]"  // Bottom right (wider than square)
          ],
          aspectRatio: "4/3"
        },
        4: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-1 row-span-1 aspect-[4/3]",
            "col-span-1 row-span-1 aspect-[4/3]", 
            "col-span-1 row-span-1 aspect-[4/3]",
            "col-span-1 row-span-1 aspect-[4/3]"
          ],
          aspectRatio: "4/3"
        },
        5: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-2 aspect-[4/3]", // Large center piece (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]",   // Top right (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]",   // Middle right (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]",  // Bottom left (wider than square)
            "col-span-2 row-span-1 aspect-[3/1]"    // Bottom center-right (wider than square's 2/1)
          ],
          aspectRatio: "4/3"
        },
        6: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-2 aspect-[4/3]", // Large main image (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Top right (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle right (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Bottom left (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Bottom center (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]"  // Bottom right (wider than square)
          ],
          aspectRatio: "4/3"
        },
        7: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-1 row-span-1 aspect-[4/3]", // Top left (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Top center (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Top right (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle left (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle center (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle right (wider than square)
            "col-span-3 row-span-1 aspect-[4/1]"   // Bottom wide (wider than square's 3/1)
          ],
          aspectRatio: "4/3"
        },
        8: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-4 grid-rows-4 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-2 aspect-[4/3]", // Center piece (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Top right 1 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Top right 2 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle right 1 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle right 2 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Bottom left 1 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Bottom left 2 (wider than square)
            "col-span-2 row-span-1 aspect-[3/1]"   // Bottom right wide (wider than square's 2/1)
          ],
          aspectRatio: "4/3"
        },
        9: {
          containerClass: "w-full max-w-4xl mx-auto",
          gridClass: "grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-1 row-span-1 aspect-[4/3]", // Top left (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Top center (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Top right (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle left (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle center (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Middle right (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Bottom left (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]", // Bottom center (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]"  // Bottom right (wider than square)
          ],
          aspectRatio: "4/3"
        },
        10: {
          containerClass: "w-full max-w-5xl mx-auto",
          gridClass: "grid grid-cols-4 gap-1 sm:gap-2",
          itemClasses: [
            "col-span-2 row-span-2 aspect-[4/3]",     // item1: Large left (wider than square)
            "col-span-2 row-span-1 aspect-[3/1]",      // item2: Top right wide (wider than square's 2/1)
            "col-span-1 row-span-1 aspect-[4/3]",     // item3: Mid right 1 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]",     // item4: Mid right 2 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]",     // item5: Row 3, Col 1 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]",     // item6: Row 3, Col 2 (wider than square)
            "col-span-2 row-span-1 aspect-[3/1]",      // item7: Row 3, wide right (wider than square's 2/1)
            "col-span-2 row-span-1 aspect-[3/1]",      // item8: Row 4, left wide (wider than square's 2/1)
            "col-span-1 row-span-1 aspect-[4/3]",     // item9: Row 4, Col 3 (wider than square)
            "col-span-1 row-span-1 aspect-[4/3]"      // item10: Row 4, Col 4 (wider than square)
          ],
          aspectRatio: "4/3"
        }
      };
      return rectangleLayouts[count as keyof typeof rectangleLayouts] || rectangleLayouts[1];
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length <= 10) {
      setSelectedImg((prevImages) => [...prevImages, ...files]);

      // Convert files to base64 data URLs for better compatibility with html2canvas
      const processFiles = async () => {
        const base64Promises = files.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(file);
          });
        });
        
        const base64Images = await Promise.all(base64Promises);
        setImages((prevImages) => [...prevImages, ...base64Images]);
      };
      
      processFiles();
      
      // Show collage view if images are uploaded
      if (images.length + files.length > 0) {
        setShowCollage(true);
      }
      
      toast.success(`${files.length} photo(s) added to collage!`);
    } else {
      toast.error("You can only upload a maximum of 10 images.");
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedSelectedImg = selectedImg.filter((_, i) => i !== index);

    setImages(updatedImages);
    setSelectedImg(updatedSelectedImg);
    
    // Hide collage view if no images left
    if (updatedImages.length === 0) {
      setShowCollage(false);
    }

    toast.success("Photo removed from collage");
  };

  const handleTransformChange = (id: string, scale: number, position: { x: number; y: number }) => {
    setImageTransforms(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { id, scale, position });
      return newMap;
    });
  };

  const handleShapeChange = (newShape: Shape) => {
    setSelectedShape(newShape);
    // Update collage size to match the new shape
    if (newShape === "square") {
      setCollageSize("square-small");
    } else {
      setCollageSize("rectangle-medium");
    }
    toast.success(`Collage shape changed to ${newShape}`);
  };

  const handleDownloadCollage = async () => {
    if (images.length === 0) {
      toast.error("No images to download. Please add images first.");
      return;
    }

    setIsDownloading(true);
    
    try {
      if (collageRef.current) {
        const canvas = await html2canvas(collageRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
        });

        const link = document.createElement("a");
        link.download = `collage-${images.length}-photos-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Collage downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading collage:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
  
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img === active.id);
      const newIndex = images.findIndex((img) => img === over.id);
  
      const updatedImages = arrayMove(images, oldIndex, newIndex);
      setImages(updatedImages);
  
      const updatedSelectedImg = arrayMove(selectedImg, oldIndex, newIndex);
      setSelectedImg(updatedSelectedImg);
      
      toast.success("Photos reordered!");
    }
  };

  const getTotalPrice = () => {
    return COLLAGE_SIZES[collageSize as keyof typeof COLLAGE_SIZES].price;
  };

  const getDeliveryCharge = (contactData: ContactFormData) => {
    if (contactData.paymentMethod === 'cod' && contactData.deliveryLocation === 'inside-dhaka') {
      return 50;
    }
    return 0;
  };

  // Function to capture edited collage as image
  const captureEditedCollage = async (): Promise<Blob | null> => {
    try {
      if (collageRef.current) {
        const canvas = await html2canvas(collageRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
        });

        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.95);
        });
      }
      return null;
    } catch (error) {
      console.error("Error capturing edited collage:", error);
      return null;
    }
  };

  // Function to handle continuing to contact form
  const handleContinueToContact = async () => {
    toast.loading("Preparing your collage...");
    
    const collageBlob = await captureEditedCollage();
    
    if (!collageBlob) {
      toast.dismiss();
      toast.error('Failed to capture collage. Please try again.');
      return;
    }
    
    setCapturedCollageBlob(collageBlob);
    toast.dismiss();
    toast.success("Collage ready!");
    setShowContactForm(true);
  };

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    try {
      toast.loading("Submitting your collage order...");

      // Use the previously captured collage blob
      const editedCollageBlob = capturedCollageBlob;

      if (!editedCollageBlob) {
        toast.dismiss();
        toast.error('Failed to capture collage. Please try again.');
        return;
      }

      const formData = new FormData();
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('phone', contactData.phone);
      formData.append('service_id', '3');
      formData.append('location', contactData.location);
      formData.append('delivery_type', contactData.deliveryLocation || 'inside_dhaka');
      formData.append('payment_method', contactData.paymentMethod);

      if (contactData.additionalInfo) {
        formData.append('additional_info', contactData.additionalInfo);
      }

      // Determine size_id based on collageSize
      // Map collage size to size_id (you may need to adjust these IDs based on your API)
      const sizeIdMap: { [key: string]: number } = {
        'square-small': 1,    // 12" × 12" Square
        'square-large': 2,    // 16" × 16" Square
        'rectangle-medium': 3, // 16" × 12" Rectangle
        'rectangle-large': 4   // 20" × 16" Rectangle
      };

      const sizeId = sizeIdMap[collageSize] || 1;
      const orientation = selectedShape === 'square' ? 'square' : 'landscape';

      // Add single collage document
      formData.append('documents[0][size_id]', sizeId.toString());
      formData.append('documents[0][orientation]', orientation);
      formData.append('documents[0][bleed_type]', 'none');
      formData.append('documents[0][print_type_id]', '1');
      formData.append('documents[0][file]', editedCollageBlob, 'collage.jpg');

      const response = await fetch('https://admin.printr.store/api/service/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      toast.dismiss();

      if (response.ok && result.success) {
        toast.success("Collage order submitted successfully!");
        setImages([]);
        setSelectedImg([]);
        setShowCollage(false);
        setShowContactForm(false);
        setImageTransforms(new Map());
        setCapturedCollageBlob(null);
      } else {
        toast.error(result.message || 'Failed to submit order. Please try again.');
      }
      
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to submit order. Please try again.');
    }
  };

  const layout = getCollageLayout(images.length, selectedShape);

  if (showContactForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Order Summary</h2>
          <Button variant="outline" onClick={() => setShowContactForm(false)}>
            Back to Collage
          </Button>
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Collage</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">
                  {COLLAGE_SIZES[collageSize as keyof typeof COLLAGE_SIZES].name} Collage
                </p>
                <p className="text-xs text-muted-foreground">
                  {images.length} photos • {getLayoutDescription(images.length)}
                </p>
              </div>
              <span className="text-sm font-medium">
                {COLLAGE_SIZES[collageSize as keyof typeof COLLAGE_SIZES].price} tk
              </span>
            </div>
          </div>
        </Card>
        
        <ContactForm onSubmit={handleSubmitOrder} totalPrice={getTotalPrice()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Photo Collage</h2>
        <p className="text-lg text-muted-foreground">
          Upload multiple photos to make a collage (Max 10 photos)
        </p>
      </div>

      {!showCollage ? (
        // Upload Section
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-12 text-center h-80">
            <Upload className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Drag and drop to upload your files
            </p>
            <p className="text-base mb-4">Or</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button asChild className="cursor-pointer">
                <span>Choose Images</span>
              </Button>
            </Label>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Upload 1-10 images to create your professional collage<br/>
              <span className="font-medium">Dynamic layouts automatically adjust for each photo count!</span>
            </p>
          </div>
        </Card>
      ) : (
        // Collage View
        <div className="space-y-6">
          {/* Collage Preview */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-xl font-semibold">
                {getLayoutDescription(images.length)} ({images.length} photo{images.length !== 1 ? 's' : ''})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCollage(false)}
                >
                  Add More
                </Button>
                <Button
                  onClick={handleDownloadCollage}
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            </div>

            {/* Shape Selection */}
            <div className="mb-6">
              <Label className="text-base font-medium mb-3 block">Canvas Shape</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShapeChange("square")}
                  className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    selectedShape === "square"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Square className="w-5 h-5" />
                  <span className="font-medium">Square</span>
                </button>
                <button
                  onClick={() => handleShapeChange("rectangle")}
                  className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    selectedShape === "rectangle"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RectangleHorizontal className="w-5 h-5" />
                  <span className="font-medium">Rectangle</span>
                </button>
              </div>
            </div>
            
            <div
              ref={collageRef}
              className={`${layout.containerClass} bg-white p-2 sm:p-4 rounded-lg shadow-inner relative overflow-hidden`}
              style={{ 
                aspectRatio: layout.aspectRatio,
                minHeight: '400px',
                position: 'relative'
              }}
            >
              <div className={`${layout.gridClass} h-fit w-full`}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={images} strategy={rectSortingStrategy}>
                    {images.map((image, index) => (
                      <CollageItem
                        key={image}
                        id={image}
                        image={image}
                        index={index}
                        onRemove={handleRemoveImage}
                        onTransformChange={handleTransformChange}
                        totalImages={images.length}
                        layoutClass={layout.itemClasses[index] || "col-span-1 aspect-square"}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">How to edit your collage:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>🔄 <strong>Reorder:</strong> Drag the move icon (top-left) to change photo positions</p>
                <p>🎯 <strong>Edit:</strong> Click on any photo to activate edit mode</p>
                <p>🖱️ <strong>Pan:</strong> Drag the photo to reposition it within its frame</p>
                <p>🔍 <strong>Zoom:</strong> Scroll over the photo or use zoom buttons</p>
                <p>❌ <strong>Remove:</strong> Click the X button to remove a photo</p>
              </div>
            </div>
          </Card>

          {/* Upload More Section */}
          {images.length < 10 && (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6">
                <p className="text-muted-foreground mb-3 text-center">
                  Add more images to your collage
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-more"
                />
                <Label htmlFor="file-upload-more">
                  <Button variant="outline" asChild className="cursor-pointer">
                    <span>
                      Add More Images ({10 - images.length} remaining)
                    </span>
                  </Button>
                </Label>
              </div>
            </Card>
          )}

          {/* Size Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Choose Size</h3>
            <div className="space-y-2">
              <Label>Collage Size</Label>
              <Select value={collageSize} onValueChange={setCollageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLLAGE_SIZES)
                    .filter(([key]) => 
                      selectedShape === "square" ? key.includes("square") : key.includes("rectangle")
                    )
                    .map(([key, size]) => (
                      <SelectItem key={key} value={key}>
                        {size.name} - {size.price} tk
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <p className="text-lg font-semibold">Total: {getTotalPrice()} tk</p>
              <p className="text-muted-foreground">
                {COLLAGE_SIZES[collageSize as keyof typeof COLLAGE_SIZES].name} Collage
              </p>
            </div>
            <Button variant="hero" size="lg" onClick={handleContinueToContact}>
              Continue to Contact Info
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};