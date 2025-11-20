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
import { Download, Check, X, ImageIcon, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { LazyImage } from "@/components/LazyImage";

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

// API Response interfaces for /event/list
interface ApiCategory {
  id: number;
  event_id: string;
  title: string;
  status: string;
  description: string | null;
  position: string;
}

interface ApiEvent {
  id: number;
  title: string;
  status: string;
  description: string;
  categories: ApiCategory[];
}

interface EventListResponse {
  success: boolean;
  data: ApiEvent[];
  message: string;
  code: number;
}

// API Response interfaces for /category/{id}/galleries
interface ApiGalleryImage {
  id: number;
  event_id: string;
  event_category_id: string;
  image_url: string;
  status: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedGalleriesData {
  current_page: number;
  data: ApiGalleryImage[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface GalleriesResponse {
  success: boolean;
  data: PaginatedGalleriesData;
  message: string;
  code: number;
}

interface GalleryWithPagination extends Gallery {
  categoryId: number;
  isLoaded: boolean; // Track if images have been fetched
  isLoading: boolean; // Track if currently loading
  allImages: GalleryImage[]; // Store all loaded images
  visibleStartIndex: number; // Index of first visible image
  visibleEndIndex: number; // Index of last visible image
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
  };
}

// Constants for virtualization
const IMAGES_PER_LOAD = 20; // Images loaded per API call
const MAX_VISIBLE_IMAGES = 18; // Maximum images rendered in DOM
const BUFFER_IMAGES = 6; // Buffer before/after visible area

const EventPage = () => {
  const [eventInfo, setEventInfo] = useState<{ title: string; description: string } | null>(null);
  const [galleries, setGalleries] = useState<GalleryWithPagination[]>([]);
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

  // Fetch event and categories list
  useEffect(() => {
    const fetchEventList = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://admin.printr.store/api/event/list');
        const result: EventListResponse = await response.json();
        
        if (result.success && result.data.length > 0) {
          const event = result.data[0];
          
          // Store event info
          setEventInfo({
            title: event.title,
            description: event.description,
          });

          // Initialize galleries with empty images (will be loaded on demand)
          const initialGalleries: GalleryWithPagination[] = event.categories.map((category) => ({
            id: `gallery-${category.id}`,
            categoryId: category.id,
            title: category.title,
            description: category.description || 'Event Gallery',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            images: [], // Currently visible images
            allImages: [], // All loaded images stored here
            isLoaded: false,
            isLoading: false,
            visibleStartIndex: 0,
            visibleEndIndex: MAX_VISIBLE_IMAGES,
            pagination: {
              currentPage: 0,
              lastPage: 1,
              total: 0,
              nextPageUrl: `https://admin.printr.store/api/category/${category.id}/galleries?page=1`,
              prevPageUrl: null,
            }
          }));
          
          setGalleries(initialGalleries);
        } else {
          toast.error('Failed to load event information');
        }
      } catch (error) {
        console.error('Error fetching event list:', error);
        toast.error('Failed to load event information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventList();
  }, []);

  // Load images for a specific gallery (initial load or load more)
  const loadGalleryImages = async (galleryId: string, categoryId: number, pageUrl: string) => {
    try {
      // Set loading state
      setGalleries(prev => prev.map(gallery => 
        gallery.id === galleryId 
          ? { ...gallery, isLoading: true }
          : gallery
      ));
      
      const response = await fetch(pageUrl);
      const result: GalleriesResponse = await response.json();
      
      if (result.success && result.data) {
        const galleriesData = result.data;
        
        setGalleries(prev => prev.map(gallery => {
          if (gallery.id === galleryId) {
            // Transform new images
            const newImages = galleriesData.data.map((img, index) => ({
              id: `img-${categoryId}-${img.id}`,
              url: `https://admin.printr.store/${img.image_url}`,
              title: `${gallery.title} - Image ${gallery.allImages.length + index + 1}`,
            }));
            
            // Append to allImages array (keep all loaded images in memory)
            const updatedAllImages = gallery.isLoaded 
              ? [...gallery.allImages, ...newImages]
              : newImages;
            
            // Calculate visible window - show only MAX_VISIBLE_IMAGES
            const visibleStart = Math.max(0, updatedAllImages.length - MAX_VISIBLE_IMAGES);
            const visibleEnd = updatedAllImages.length;
            const visibleImages = updatedAllImages.slice(visibleStart, visibleEnd);
            
            return {
              ...gallery,
              allImages: updatedAllImages,
              images: visibleImages, // Only render these images
              visibleStartIndex: visibleStart,
              visibleEndIndex: visibleEnd,
              isLoaded: true,
              isLoading: false,
              pagination: {
                currentPage: galleriesData.current_page,
                lastPage: galleriesData.last_page,
                total: galleriesData.total,
                nextPageUrl: galleriesData.next_page_url,
                prevPageUrl: galleriesData.prev_page_url,
              }
            };
          }
          return gallery;
        }));
        
        if (galleriesData.current_page === 1) {
          toast.success('Gallery loaded successfully!');
        } else {
          toast.success(`Loaded ${galleriesData.data.length} more images! Showing latest ${MAX_VISIBLE_IMAGES}.`);
        }
      }
    } catch (error) {
      console.error('Error loading gallery images:', error);
      toast.error('Failed to load images');
      
      // Reset loading state on error
      setGalleries(prev => prev.map(gallery => 
        gallery.id === galleryId 
          ? { ...gallery, isLoading: false }
          : gallery
      ));
    }
  };

  // Use Intersection Observer to auto-load galleries when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const galleryId = entry.target.getAttribute('data-gallery-id');
            const categoryId = entry.target.getAttribute('data-category-id');
            const nextPageUrl = entry.target.getAttribute('data-next-page-url');
            
            if (galleryId && categoryId && nextPageUrl) {
              const gallery = galleries.find(g => g.id === galleryId);
              
              // Only load if not already loaded and not currently loading
              if (gallery && !gallery.isLoaded && !gallery.isLoading) {
                loadGalleryImages(galleryId, parseInt(categoryId), nextPageUrl);
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '200px', // Start loading 200px before the gallery enters viewport
        threshold: 0.1,
      }
    );

    // Observe all gallery sections
    const galleryElements = document.querySelectorAll('[data-gallery-observer]');
    galleryElements.forEach((el) => observer.observe(el));

    return () => {
      galleryElements.forEach((el) => observer.unobserve(el));
    };
  }, [galleries]);

  // Show previous images (scroll back in virtual window)
  const showPreviousImages = (galleryId: string) => {
    setGalleries(prev => prev.map(gallery => {
      if (gallery.id === galleryId && gallery.visibleStartIndex > 0) {
        const newStart = Math.max(0, gallery.visibleStartIndex - MAX_VISIBLE_IMAGES);
        const newEnd = newStart + MAX_VISIBLE_IMAGES;
        const visibleImages = gallery.allImages.slice(newStart, newEnd);
        
        return {
          ...gallery,
          images: visibleImages,
          visibleStartIndex: newStart,
          visibleEndIndex: newEnd,
        };
      }
      return gallery;
    }));
    
    toast.success('Showing previous images');
  };

  // Show next images (scroll forward in virtual window)
  const showNextImages = (galleryId: string) => {
    setGalleries(prev => prev.map(gallery => {
      if (gallery.id === galleryId && gallery.visibleEndIndex < gallery.allImages.length) {
        const newStart = gallery.visibleEndIndex;
        const newEnd = Math.min(gallery.allImages.length, newStart + MAX_VISIBLE_IMAGES);
        const visibleImages = gallery.allImages.slice(newStart, newEnd);
        
        return {
          ...gallery,
          images: visibleImages,
          visibleStartIndex: newStart,
          visibleEndIndex: newEnd,
        };
      }
      return gallery;
    }));
    
    toast.success('Showing next images');
  };

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
      // Select all loaded images, not just visible ones
      gallery.allImages.forEach((img) => newSet.add(img.id));
      return newSet;
    });
    toast.success(`Selected all ${gallery.allImages.length} loaded images from ${gallery.title}`);
  };

  const deselectAllInGallery = (galleryId: string) => {
    const gallery = galleries.find((g) => g.id === galleryId);
    if (!gallery) return;

    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      // Deselect all loaded images
      gallery.allImages.forEach((img) => newSet.delete(img.id));
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
      // Try to fetch the image as a blob first (works for CORS-enabled images)
      try {
        const response = await fetch(image.url, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }
        
        const blob = await response.blob();
        
        // Create a blob URL
        const blobUrl = URL.createObjectURL(blob);
        
        // Create a temporary link element and trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${image.title.replace(/\s+/g, "_")}.jpg`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL after a short delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 100);
        
        toast.success(`Downloading: ${image.title}`);
      } catch (fetchError) {
        // Fallback: Open image in new tab if blob fetch fails
        console.log("Blob fetch failed, using fallback:", fetchError);
        const link = document.createElement("a");
        link.href = image.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Opening: ${image.title} (Right-click to save)`);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image. Please try again.");
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
              {eventInfo?.title || 'Event Gallery'}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              {eventInfo?.description || 'Browse through our collection of memorable moments.'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  {galleries.reduce((sum, g) => sum + g.pagination.total, 0)} Total Photos
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
                // Check selections against all loaded images
                const selectedInGallery = gallery.allImages.filter((img) =>
                  selectedImages.has(img.id)
                ).length;
                const allSelected = gallery.allImages.length > 0 && selectedInGallery === gallery.allImages.length;

              return (
                <div 
                  key={gallery.id} 
                  className="space-y-6"
                  data-gallery-observer
                  data-gallery-id={gallery.id}
                  data-category-id={gallery.categoryId}
                  data-next-page-url={gallery.pagination.nextPageUrl || ''}
                >
                  {/* Gallery Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2">{gallery.title}</h2>
                      <p className="text-muted-foreground mb-1">{gallery.description}</p>
                      <p className="text-sm text-muted-foreground">{gallery.date}</p>
                    </div>
                    {gallery.allImages.length > 0 && (
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
                            disabled={gallery.allImages.length === 0}
                          >
                            <Check className="w-4 h-4" />
                            Select All Loaded ({gallery.allImages.length})
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Loading State for Initial Gallery Load */}
                  {gallery.isLoading && gallery.images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Loading images...</p>
                    </div>
                  ) : gallery.images.length === 0 && gallery.isLoaded ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No images in this gallery</p>
                    </div>
                  ) : gallery.images.length > 0 ? (
                    <>
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
                            <LazyImage
                              src={image.url}
                              alt={image.title}
                              className="transition-transform duration-300 group-hover:scale-110"
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

                      {/* Virtual Window Navigation & Pagination */}
                      <div className="flex flex-col items-center gap-4 pt-4">
                        {/* Window Info - showing current visible range */}
                        {gallery.allImages.length > 0 && (
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-sm text-muted-foreground text-center">
                              <span className="font-semibold">Viewing images {gallery.visibleStartIndex + 1}-{gallery.visibleEndIndex}</span>
                              {gallery.pagination.total > gallery.allImages.length && (
                                <span> ({gallery.pagination.total} total available)</span>
                              )}
                            </div>
                            {/* <div className="text-xs text-muted-foreground">
                              Showing {MAX_VISIBLE_IMAGES} images at a time for optimal performance
                            </div> */}
                          </div>
                        )}

                        {/* Navigation Controls - Navigate through loaded images */}
                        {gallery.allImages.length > MAX_VISIBLE_IMAGES && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showPreviousImages(gallery.id)}
                              disabled={gallery.visibleStartIndex === 0}
                              className="flex items-center gap-2"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              Previous {MAX_VISIBLE_IMAGES}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showNextImages(gallery.id)}
                              disabled={gallery.visibleEndIndex >= gallery.allImages.length}
                              className="flex items-center gap-2"
                            >
                              Next {MAX_VISIBLE_IMAGES}
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {/* Load More Button - Fetch more from API */}
                        {gallery.pagination.nextPageUrl && (
                          <Button
                            variant="default"
                            size="lg"
                            onClick={() => loadGalleryImages(gallery.id, gallery.categoryId, gallery.pagination.nextPageUrl!)}
                            disabled={gallery.isLoading}
                            className="min-w-[200px]"
                          >
                            {gallery.isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                Load {IMAGES_PER_LOAD} More
                                <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Gallery Footer */}
                      {selectedInGallery > 0 && (
                        <div className="text-sm text-muted-foreground text-center pt-4">
                          {selectedInGallery} of {gallery.allImages.length} loaded images selected from this gallery
                        </div>
                      )}
                    </>
                  ) : null}
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
