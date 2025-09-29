import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Shuffle, RefreshCw } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { CollageLayoutPreview } from "./CollageLayoutPreview";
import { collageLayouts, getBestLayoutForPhotos, getLayoutsForPhotoCount, CollageLayout } from "./CollageLayouts";
import { toast } from "sonner";

type Shape = "square" | "rectangle";

interface PhotoSlot {
  id: string;
  photo?: File;
  preview?: string;
  cropData: { x: number; y: number; scale: number; rotation: number };
}

const COLLAGE_SIZES = {
  "square-small": { name: "12\" × 12\" Square", price: 800, width: 300, height: 300 },
  "square-large": { name: "16\" × 16\" Square", price: 1200, width: 400, height: 400 },
  "rectangle-medium": { name: "16\" × 12\" Rectangle", price: 900, width: 400, height: 300 },
  "rectangle-large": { name: "20\" × 16\" Rectangle", price: 1500, width: 500, height: 400 },
};

export const CollageFlow = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout | null>(null);
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([]);
  const [shape, setShape] = useState<Shape>("square");
  const [collageSize, setCollageSize] = useState("square-small");
  const [showContactForm, setShowContactForm] = useState(false);

  // Auto-select best layout when photos change
  useEffect(() => {
    if (photos.length > 0) {
      const bestLayout = getBestLayoutForPhotos(photos.length, shape);
      if (bestLayout && bestLayout.id !== selectedLayout?.id) {
        handleLayoutSelect(bestLayout);
      }
    }
  }, [photos.length, shape]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 10) {
      toast.error("Maximum 10 photos allowed for collages");
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setPhotos(prev => [...prev, ...imageFiles]);
    toast.success(`${imageFiles.length} photo(s) added to collage!`);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getAvailableLayouts = () => {
    return getLayoutsForPhotoCount(photos.length, shape);
  };

  const shufflePhotos = () => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    setPhotos(shuffled);
    toast.success("Photos shuffled!");
  };

  const handleLayoutSelect = (layout: CollageLayout) => {
    setSelectedLayout(layout);
    // Initialize photo slots
    const slots: PhotoSlot[] = layout.slots.map((_, index) => ({
      id: `slot-${index}`,
      photo: photos[index],
      preview: photos[index] ? URL.createObjectURL(photos[index]) : undefined,
      cropData: { x: 0, y: 0, scale: 1, rotation: 0 }
    }));
    setPhotoSlots(slots);
  };

  const autoFillSlots = () => {
    if (!selectedLayout) return;
    
    const newSlots: PhotoSlot[] = selectedLayout.slots.map((_, index) => ({
      id: `slot-${index}`,
      photo: photos[index],
      preview: photos[index] ? URL.createObjectURL(photos[index]) : undefined,
      cropData: { x: 0, y: 0, scale: 1, rotation: 0 }
    }));
    setPhotoSlots(newSlots);
    toast.success("Photos automatically arranged!");
  };

  const getTotalPrice = () => {
    return COLLAGE_SIZES[collageSize as keyof typeof COLLAGE_SIZES].price;
  };

  const handleSubmitOrder = (contactData: ContactFormData) => {
    console.log('Collage order submitted:', { 
      photos, 
      layout: selectedLayout,
      shape,
      size: collageSize,
      contactData, 
      totalPrice: getTotalPrice() 
    });
  };

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
                  {photos.length} photos • {selectedLayout?.name} layout
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
      {/* Upload Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Create Your Collage</h2>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Upload up to 10 photos for your collage</p>
          <p className="text-sm text-muted-foreground mb-4">
            Currently {photos.length}/10 photos uploaded
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="collage-upload"
          />
          <Label htmlFor="collage-upload">
            <Button variant="outline" asChild disabled={photos.length >= 10}>
              <span>Choose Photos</span>
            </Button>
          </Label>
        </div>
      </Card>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Photos ({photos.length})</h3>
            <Button variant="outline" onClick={shufflePhotos}>
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Collage Configuration */}
      {photos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Collage Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Shape</Label>
              <Select value={shape} onValueChange={(value: Shape) => setShape(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <Select value={collageSize} onValueChange={setCollageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLLAGE_SIZES)
                    .filter(([key]) => 
                      shape === "square" ? key.includes("square") : key.includes("rectangle")
                    )
                    .map(([key, size]) => (
                      <SelectItem key={key} value={key}>
                        {size.name} - {size.price} tk
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Layout Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Layout: {selectedLayout?.name || "Auto-selected"}</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={autoFillSlots}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto Fill
                </Button>
                <span className="text-sm text-muted-foreground">
                  {getAvailableLayouts().length} available
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {getAvailableLayouts().map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutSelect(layout)}
                  className={`p-3 border rounded-lg text-center transition-all hover:scale-105 ${
                    selectedLayout?.id === layout.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="w-8 h-8 mx-auto mb-2 bg-muted rounded border flex items-center justify-center">
                    <div className="text-xs font-mono">{layout.name.substring(0, 2)}</div>
                  </div>
                  <p className="text-sm font-medium">{layout.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {layout.minPhotos}-{layout.maxPhotos} photos
                  </p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Layout Preview */}
      {selectedLayout && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Interactive Collage Preview</h3>
          
          <CollageLayoutPreview
            layout={selectedLayout}
            photoSlots={photoSlots}
            onPhotoSlotUpdate={setPhotoSlots}
            width={COLLAGE_SIZES[collageSize as keyof typeof COLLAGE_SIZES].width}
            height={COLLAGE_SIZES[collageSize as keyof typeof COLLAGE_SIZES].height}
            availablePhotos={photos}
          />

          {/* Continue Button */}
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg mt-6">
            <div>
              <p className="text-lg font-semibold">Total: {getTotalPrice()} tk</p>
              <p className="text-muted-foreground">
                {COLLAGE_SIZES[collageSize as keyof typeof COLLAGE_SIZES].name} Collage
              </p>
            </div>
            <Button variant="hero" size="lg" onClick={() => setShowContactForm(true)}>
              Continue to Contact Info
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};