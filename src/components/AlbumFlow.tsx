import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { ContactForm, ContactFormData } from "./ContactForm";
import { toast } from "sonner";

interface AlbumPage {
  id: string;
  photos: (File | null)[];
  layout: "single" | "double" | "triple" | "quad";
}

const ALBUM_SIZES = {
  "small": { name: "8\" × 8\" Square Album", price: 2500, pages: 20, photosPerPage: 1 },
  "medium": { name: "10\" × 10\" Square Album", price: 3500, pages: 30, photosPerPage: 2 },
  "large": { name: "12\" × 12\" Square Album", price: 4500, pages: 40, photosPerPage: 2 },
  "portrait": { name: "11\" × 14\" Portrait Album", price: 5000, pages: 30, photosPerPage: 3 },
};

const PAGE_LAYOUTS = {
  "single": { name: "Single Photo", slots: 1 },
  "double": { name: "Two Photos", slots: 2 },
  "triple": { name: "Three Photos", slots: 3 },
  "quad": { name: "Four Photos", slots: 4 },
};

export const AlbumFlow = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [albumSize, setAlbumSize] = useState("medium");
  const [pages, setPages] = useState<AlbumPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    setPhotos(prev => [...prev, ...imageFiles]);
    toast.success(`${imageFiles.length} photo(s) added to album!`);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const initializePages = () => {
    const maxPages = ALBUM_SIZES[albumSize as keyof typeof ALBUM_SIZES].pages;
    const defaultLayout = albumSize === "small" ? "single" : "double";
    
    const newPages: AlbumPage[] = Array.from({ length: maxPages }, (_, i) => ({
      id: `page-${i}`,
      photos: Array(PAGE_LAYOUTS[defaultLayout].slots).fill(null),
      layout: defaultLayout as "single" | "double" | "triple" | "quad"
    }));

    // Auto-fill photos
    let photoIndex = 0;
    for (let pageIdx = 0; pageIdx < newPages.length && photoIndex < photos.length; pageIdx++) {
      for (let slotIdx = 0; slotIdx < newPages[pageIdx].photos.length && photoIndex < photos.length; slotIdx++) {
        newPages[pageIdx].photos[slotIdx] = photos[photoIndex];
        photoIndex++;
      }
    }

    setPages(newPages);
    setCurrentPageIndex(0);
    toast.success("Album pages initialized!");
  };

  const updatePageLayout = (pageIndex: number, layout: "single" | "double" | "triple" | "quad") => {
    setPages(prev => {
      const newPages = [...prev];
      const currentPhotos = newPages[pageIndex].photos.filter(p => p !== null);
      const newSlots = PAGE_LAYOUTS[layout].slots;
      
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        layout,
        photos: Array(newSlots).fill(null).map((_, i) => currentPhotos[i] || null)
      };
      
      return newPages;
    });
  };

  const addPhotoToPage = (pageIndex: number, slotIndex: number, photo: File) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[pageIndex].photos[slotIndex] = photo;
      return newPages;
    });
  };

  const removePhotoFromPage = (pageIndex: number, slotIndex: number) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[pageIndex].photos[slotIndex] = null;
      return newPages;
    });
  };

  const getTotalPrice = () => {
    return ALBUM_SIZES[albumSize as keyof typeof ALBUM_SIZES].price;
  };

  const handleSubmitOrder = (contactData: ContactFormData) => {
    console.log('Album order submitted:', { 
      photos, 
      pages,
      size: albumSize,
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
            Back to Album
          </Button>
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Album</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">
                  {ALBUM_SIZES[albumSize as keyof typeof ALBUM_SIZES].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {photos.length} photos • {pages.filter(p => p.photos.some(ph => ph !== null)).length} pages
                </p>
              </div>
              <span className="text-sm font-medium">
                {ALBUM_SIZES[albumSize as keyof typeof ALBUM_SIZES].price} tk
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
        <h2 className="text-2xl font-semibold mb-4">Create Your Photo Album</h2>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Upload photos for your album</p>
          <p className="text-sm text-muted-foreground mb-4">
            Currently {photos.length} photos uploaded
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="album-upload"
          />
          <Label htmlFor="album-upload">
            <Button variant="outline" asChild>
              <span>Choose Photos</span>
            </Button>
          </Label>
        </div>
      </Card>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Photos ({photos.length})</h3>
          <div className="grid grid-cols-6 gap-2">
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

      {/* Album Configuration */}
      {photos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Album Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Album Size & Type</Label>
              <Select value={albumSize} onValueChange={setAlbumSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALBUM_SIZES).map(([key, size]) => (
                    <SelectItem key={key} value={key}>
                      {size.name} - {size.price} tk ({size.pages} pages)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={initializePages} disabled={pages.length > 0} className="w-full">
              <BookOpen className="w-4 h-4 mr-2" />
              {pages.length > 0 ? "Album Initialized" : "Initialize Album Pages"}
            </Button>
          </div>
        </Card>
      )}

      {/* Page Editor */}
      {pages.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Page {currentPageIndex + 1} of {pages.length}
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
            <Label className="mb-2 block">Page Layout</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(PAGE_LAYOUTS).map(([key, layout]) => (
                <button
                  key={key}
                  onClick={() => updatePageLayout(currentPageIndex, key as any)}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    pages[currentPageIndex].layout === key
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="text-sm font-medium">{layout.name}</p>
                  <p className="text-xs text-muted-foreground">{layout.slots} slots</p>
                </button>
              ))}
            </div>
          </div>

          {/* Page Preview */}
          <div className="bg-muted/30 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-2xl aspect-square">
              <div className={`grid gap-4 h-full ${
                pages[currentPageIndex].layout === 'single' ? 'grid-cols-1' :
                pages[currentPageIndex].layout === 'double' ? 'grid-cols-2' :
                pages[currentPageIndex].layout === 'triple' ? 'grid-cols-3' :
                'grid-cols-2 grid-rows-2'
              }`}>
                {pages[currentPageIndex].photos.map((photo, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="relative border-2 border-dashed border-border rounded-lg overflow-hidden group bg-muted/50"
                  >
                    {photo ? (
                      <>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Slot ${slotIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhotoFromPage(currentPageIndex, slotIndex)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Drop photo here or select from library
                        </p>
                        <div className="mt-2 max-h-20 overflow-y-auto flex flex-wrap gap-1 justify-center">
                          {photos.slice(0, 6).map((availPhoto, idx) => (
                            <button
                              key={idx}
                              onClick={() => addPhotoToPage(currentPageIndex, slotIndex, availPhoto)}
                              className="w-10 h-10 rounded border hover:border-primary"
                            >
                              <img
                                src={URL.createObjectURL(availPhoto)}
                                alt={`Option ${idx}`}
                                className="w-full h-full object-cover rounded"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg mt-6">
            <div>
              <p className="text-lg font-semibold">Total: {getTotalPrice()} tk</p>
              <p className="text-muted-foreground">
                {ALBUM_SIZES[albumSize as keyof typeof ALBUM_SIZES].name}
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