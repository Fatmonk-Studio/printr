import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Check, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
}

interface Gallery {
  id: string;
  title: string;
  description: string;
  date: string;
  images: GalleryImage[];
}

// API Response interfaces
interface ApiGalleryImage {
  id: number;
  event_id: string;
  event_category_id: string;
  image_url: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiCategory {
  id: number;
  event_id: string;
  title: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
  galleries: ApiGalleryImage[];
}

interface ApiEvent {
  id: number;
  title: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
  categories: ApiCategory[];
}

interface ApiResponse {
  success: boolean;
  data: ApiEvent[];
  message: string;
  code: number;
}

const EventPage = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<GalleryImage | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<UserInfo>>({});

  // Fetch galleries from API
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://admin.printr.store/api/event/list');
        const result: ApiResponse = await response.json();
        
        if (result.success && result.data.length > 0) {
          // Transform API data to our Gallery format
          const transformedGalleries: Gallery[] = result.data[0].categories.map((category) => {
            const description = category.description || '';
            const descriptionParts = description.split('\r\n');
            const dateParts = description.split('\r\n\r\n');
            
            return {
              id: `gallery-${category.id}`,
              title: category.title,
              description: descriptionParts[0] || description || 'Event Gallery',
              date: dateParts[1] || new Date(category.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              images: category.galleries.map((img, index) => ({
                id: `img-${category.id}-${img.id}`,
                url: `https://admin.printr.store/${img.image_url}`,
                title: `${category.title} - Image ${index + 1}`,
              })),
            };
          });
          
          setGalleries(transformedGalleries);
        } else {
          toast.error('Failed to load galleries');
        }
      } catch (error) {
        console.error('Error fetching galleries:', error);
        toast.error('Failed to load galleries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllInGallery = (galleryId: string) => {
    const gallery = galleries.find((g) => g.id === galleryId);
    if (!gallery) return;

    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      gallery.images.forEach((img) => newSet.add(img.id));
      return newSet;
    });
    toast.success(`Selected all ${gallery.images.length} images from ${gallery.title}`);
  };

  const deselectAllInGallery = (galleryId: string) => {
    const gallery = galleries.find((g) => g.id === galleryId);
    if (!gallery) return;

    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      gallery.images.forEach((img) => newSet.delete(img.id));
      return newSet;
    });
    toast.success(`Deselected all images from ${gallery.title}`);
  };

  const validateUserInfo = (): boolean => {
    const errors: Partial<UserInfo> = {};
    
    if (!userInfo.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!userInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!userInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9]{10,15}$/.test(userInfo.phone.replace(/[\s-]/g, ""))) {
      errors.phone = "Invalid phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserInfoSubmit = async () => {
    if (!validateUserInfo()) {
      return;
    }

    try {
      // Submit user information to API
      toast.loading("Submitting your information...");
      
      const response = await fetch('https://admin.printr.store/api/customer/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
        }),
      });

      const result = await response.json();

      toast.dismiss();

      if (response.ok && result.success) {
        toast.success("Information submitted successfully!");
        setShowUserInfoDialog(false);
        
        if (pendingDownload) {
          // Single image download
          performSingleDownload(pendingDownload);
          setPendingDownload(null);
        } else {
          // Multiple images download
          performBatchDownload();
        }
      } else {
        toast.error(result.message || 'Failed to submit information. Please try again.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to submit information. Please try again.');
    }
  };

  const performSingleDownload = async (image: GalleryImage) => {
    try {
      // Create a temporary link element and trigger download directly
      const link = document.createElement("a");
      link.href = image.url;
      link.download = `${image.title.replace(/\s+/g, "_")}.jpg`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      // For same-origin or CORS-enabled resources
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading: ${image.title}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const downloadSingleImage = (image: GalleryImage) => {
    setPendingDownload(image);
    setShowUserInfoDialog(true);
  };

  const performBatchDownload = async () => {
    if (selectedImages.size === 0) {
      toast.error("Please select at least one image to download");
      return;
    }

    setIsDownloading(true);
    toast.loading(`Downloading ${selectedImages.size} image(s)...`);

    try {
      const allImages = galleries.flatMap((g) => g.images);
      const imagesToDownload = allImages.filter((img) => selectedImages.has(img.id));

      for (const image of imagesToDownload) {
        await performSingleDownload(image);
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.dismiss();
      toast.success(`Successfully downloaded ${selectedImages.size} image(s)`);
      setSelectedImages(new Set());
    } catch (error) {
      toast.dismiss();
      toast.error("Some downloads failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSelectedImages = () => {
    if (selectedImages.size === 0) {
      toast.error("Please select at least one image to download");
      return;
    }
    setPendingDownload(null);
    setShowUserInfoDialog(true);
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
    toast.success("Selection cleared");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Event Gallery
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Browse through our collection of memorable moments. Download individual photos or select
              multiple images to save your favorites.
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  {galleries.reduce((sum, g) => sum + g.images.length, 0)} Total Photos
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{selectedImages.size} Selected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selection Actions Bar */}
      {selectedImages.size > 0 && (
        <div className="sticky top-16 z-40 bg-primary text-primary-foreground shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">{selectedImages.size} image(s) selected</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={downloadSelectedImages}
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Selected
                </Button>
                <Button variant="outline" onClick={clearSelection} className="flex items-center gap-2 text-black dark:text-white">
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Galleries Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading galleries...</p>
            </div>
          ) : galleries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No galleries available</p>
            </div>
          ) : (
            <div className="space-y-16">
              {galleries.map((gallery) => {
                const selectedInGallery = gallery.images.filter((img) =>
                  selectedImages.has(img.id)
                ).length;
                const allSelected = selectedInGallery === gallery.images.length;

              return (
                <div key={gallery.id} className="space-y-6">
                  {/* Gallery Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2">{gallery.title}</h2>
                      <p className="text-muted-foreground mb-1">{gallery.description}</p>
                      <p className="text-sm text-muted-foreground">{gallery.date}</p>
                    </div>
                    <div className="flex gap-2">
                      {allSelected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deselectAllInGallery(gallery.id)}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Deselect All
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllInGallery(gallery.id)}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Select All ({gallery.images.length})
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.images.map((image) => {
                      const isSelected = selectedImages.has(image.id);

                      return (
                        <Card
                          key={image.id}
                          className={`group relative overflow-hidden transition-all hover:shadow-xl ${
                            isSelected ? "ring-2 ring-primary shadow-lg" : ""
                          }`}
                        >
                          <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                            <img
                              src={image.url}
                              alt={image.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              loading="lazy"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                  size="sm"
                                  onClick={() => downloadSingleImage(image)}
                                  className="flex items-center gap-2 mb-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </Button>
                              </div>
                            </div>

                            {/* Selection Checkbox */}
                            <div className="absolute top-3 left-3 z-10">
                              <div
                                onClick={() => toggleImageSelection(image.id)}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-primary border-primary"
                                    : "bg-white/90 border-white/90 hover:bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                              </div>
                            </div>

                            {/* Download Icon */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 rounded-full p-2">
                                <Download className="w-4 h-4 text-primary dark:text-black" />
                              </div>
                            </div>
                          </div>

                          {/* Image Title */}
                          {/* <div className="p-4">
                            <h3 className="font-medium text-sm truncate">{image.title}</h3>
                          </div> */}
                        </Card>
                      );
                    })}
                  </div>

                  {/* Gallery Footer */}
                  {selectedInGallery > 0 && (
                    <div className="text-sm text-muted-foreground text-center">
                      {selectedInGallery} of {gallery.images.length} images selected from this gallery
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* User Info Dialog */}
      <Dialog open={showUserInfoDialog} onOpenChange={setShowUserInfoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Images</DialogTitle>
            <DialogDescription>
              Please provide your information to download {pendingDownload ? "this image" : `${selectedImages.size} image(s)`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={userInfo.name}
                onChange={(e) => {
                  setUserInfo({ ...userInfo, name: e.target.value });
                  setFormErrors({ ...formErrors, name: "" });
                }}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={userInfo.email}
                onChange={(e) => {
                  setUserInfo({ ...userInfo, email: e.target.value });
                  setFormErrors({ ...formErrors, email: "" });
                }}
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={userInfo.phone}
                onChange={(e) => {
                  setUserInfo({ ...userInfo, phone: e.target.value });
                  setFormErrors({ ...formErrors, phone: "" });
                }}
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUserInfoDialog(false);
                setPendingDownload(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUserInfoSubmit}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventPage;
