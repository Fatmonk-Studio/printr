import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Download, Check, X, ImageIcon, Loader2, ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { LazyImage } from "@/components/LazyImage";
import { Badge } from "@/components/ui/badge";

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
}

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
  description: string | null;
  categories: ApiCategory[];
}

interface EventListResponse {
  success: boolean;
  data: ApiEvent[];
  message: string;
  code: number;
}

interface ApiGalleryImage {
  id: number;
  event_id: string;
  event_category_id: string;
  image_url: string;
  status: string;
}

interface PaginatedGalleriesData {
  current_page: number;
  data: ApiGalleryImage[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
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

interface Category {
  id: number;
  title: string;
  description: string | null;
  images: GalleryImage[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalImages: number;
  nextPageUrl: string | null;
}

import { Virtuoso } from "react-virtuoso";
import { useWindowSize } from "@/hooks/useWindowSize";

const MAX_CONCURRENT_LOADS = 3;

// Define types for virtual items
type VirtualItem =
  | { type: 'header'; category: Category }
  | { type: 'image-row'; categoryId: number; items: GalleryImage[] }
  | { type: 'empty'; categoryId: number }
  | { type: 'load-more'; category: Category };

const EventGalleryPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const hasAutoLoaded = useRef(false);

  const [eventInfo, setEventInfo] = useState<{ title: string; description: string | null } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [activeLoads, setActiveLoads] = useState<Set<string>>(new Set());

  // Fetch event and categories
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://admin.printr.store/api/event/list');
        const result: EventListResponse = await response.json();

        if (result.success && result.data.length > 0) {
          const event = result.data.find(e => e.id.toString() === eventId);

          if (!event) {
            toast.error('Event not found');
            navigate('/events');
            return;
          }

          setEventInfo({
            title: event.title,
            description: event.description,
          });

          const transformedCategories: Category[] = event.categories
            .map((cat) => ({
              id: cat.id,
              title: cat.title,
              description: cat.description,
              images: [],
              isLoading: false,
              currentPage: 0,
              totalPages: 1,
              totalImages: 0,
              nextPageUrl: `https://admin.printr.store/api/category/${cat.id}/galleries?page=1&per_page=5`,
            }));

          setCategories(transformedCategories);
        } else {
          toast.error('Failed to load event');
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event');
        navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  // Auto-load all categories sequentially (waterfall)
  useEffect(() => {
    // If we maximize concurrent loads, stop and wait for one to finish
    if (activeLoads.size >= MAX_CONCURRENT_LOADS) return;

    // Find the next category that needs initial loading
    const candidate = categories.find(c =>
      c.images.length === 0 &&
      !c.isLoading &&
      c.nextPageUrl
    );

    if (candidate) {
      loadCategoryImages(candidate.id);
    }
  }, [categories, activeLoads]);

  // Load images for a category
  const loadCategoryImages = async (categoryId: number) => {
    const loadKey = `cat-${categoryId}`;

    if (activeLoads.size >= MAX_CONCURRENT_LOADS) {
      toast.info('Loading in progress, please wait...');
      return;
    }

    const category = categories.find(c => c.id === categoryId);
    if (!category?.nextPageUrl) {
      return;
    }

    try {
      setActiveLoads(prev => new Set(prev).add(loadKey));

      setCategories(prev => prev.map(cat =>
        cat.id === categoryId ? { ...cat, isLoading: true } : cat
      ));

      const response = await fetch(category.nextPageUrl);
      const result: GalleriesResponse = await response.json();

      if (result.success && result.data) {
        const data = result.data;

        const newImages: GalleryImage[] = data.data.map((img) => ({
          id: `img-${categoryId}-${img.id}`,
          url: `https://admin.printr.store/${img.image_url}`,
          title: `${category.title} - Image ${img.id}`,
        }));

        setCategories(prev => prev.map(cat => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              images: [...cat.images, ...newImages],
              isLoading: false,
              currentPage: data.current_page,
              totalPages: data.last_page,
              totalImages: data.total,
              nextPageUrl: data.next_page_url,
            };
          }
          return cat;
        }));

        toast.success(`Loaded ${newImages.length} images`);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');

      setCategories(prev => prev.map(cat =>
        cat.id === categoryId ? { ...cat, isLoading: false } : cat
      ));
    } finally {
      setActiveLoads(prev => {
        const newSet = new Set(prev);
        newSet.delete(loadKey);
        return newSet;
      });
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllInCategory = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        category.images.forEach(img => newSet.add(img.id));
        return newSet;
      });
      toast.success(`Selected ${category.images.length} images`);
    }
  };

  const deselectAllInCategory = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        category.images.forEach(img => newSet.delete(img.id));
        return newSet;
      });
      toast.success('Selection cleared');
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<UserInfo> = {};

    if (!userInfo.name.trim()) {
      errors.name = "Name is required";
    }

    if (!userInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!userInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(userInfo.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserInfoSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setShowUserInfoDialog(false);

    if (pendingDownload) {
      performSingleDownload(pendingDownload);
      setPendingDownload(null);
    } else {
      performBatchDownload();
    }
  };

  const performSingleDownload = async (image: GalleryImage) => {
    try {
      try {
        const response = await fetch(image.url, { mode: 'cors' });

        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${image.title.replace(/\s+/g, "_")}.jpg`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

        toast.success(`Downloading: ${image.title}`);
      } catch (fetchError) {
        const link = document.createElement("a");
        link.href = image.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Opening: ${image.title}`);
      }
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
      toast.error("Please select at least one image");
      return;
    }

    setIsDownloading(true);
    toast.loading(`Downloading ${selectedImages.size} image(s)...`);

    try {
      const allImages = categories.flatMap(cat => cat.images);
      const imagesToDownload = allImages.filter(img => selectedImages.has(img.id));

      for (const image of imagesToDownload) {
        await performSingleDownload(image);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.dismiss();
      toast.success(`Downloaded ${selectedImages.size} image(s)`);
      setSelectedImages(new Set());
    } catch (error) {
      toast.dismiss();
      toast.error("Some downloads failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSelectedImages = () => {
    if (selectedImages.size === 0) {
      toast.error("Please select at least one image");
      return;
    }
    setPendingDownload(null);
    setShowUserInfoDialog(true);
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
    toast.success("Selection cleared");
  };

  const totalImages = categories.reduce((sum, cat) => sum + cat.totalImages, 0);

  // Calculate dynamic columns based on screen width
  const columns = useMemo(() => {
    if (width >= 1280) return 5; // xl
    if (width >= 1024) return 4; // lg
    if (width >= 640) return 3;  // sm
    return 2;                    // default/mobile
  }, [width]);

  // Flatten data for virtualization
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];

    categories.forEach(category => {
      // 1. Add Header
      items.push({ type: 'header', category });

      // 2. Add Image Rows
      if (category.images.length > 0) {
        for (let i = 0; i < category.images.length; i += columns) {
          items.push({
            type: 'image-row',
            categoryId: category.id,
            items: category.images.slice(i, i + columns)
          });
        }
      }

      // 3. Add Empty State or Load More
      if (category.images.length === 0 && !category.isLoading && !category.nextPageUrl) {
        items.push({ type: 'empty', categoryId: category.id });
      } else if (category.nextPageUrl || category.isLoading) {
        items.push({ type: 'load-more', category });
      }
    });

    return items;
  }, [categories, columns]);

  // Render a specific item
  const renderItem = (_: number, item: VirtualItem) => {
    switch (item.type) {
      case 'header':
        const { category } = item;
        const selectedInCategory = category.images.filter(img => selectedImages.has(img.id)).length;
        const allSelected = category.images.length > 0 && selectedInCategory === category.images.length;

        return (
          <div className="pt-8 pb-4 bg-background">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{category.title}</h2>
                {category.description && (
                  <p className="text-muted-foreground mb-2">{category.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {category.totalImages > 0 && (
                    <Badge variant="outline">
                      {category.images.length} / {category.totalImages} loaded
                    </Badge>
                  )}
                  {selectedInCategory > 0 && (
                    <Badge variant="default">
                      {selectedInCategory} selected
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {category.images.length > 0 && (
                  allSelected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deselectAllInCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Deselect All
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllInCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Select All ({category.images.length})
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case 'image-row':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {item.items.map((image) => {
              const isSelected = selectedImages.has(image.id);
              return (
                <Card
                  key={image.id}
                  className={`group relative overflow-hidden transition-all hover:shadow-xl ${isSelected ? "ring-2 ring-primary shadow-lg" : ""
                    }`}
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <LazyImage
                      src={image.url}
                      alt={image.title}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          onClick={() => downloadSingleImage(image)}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <div className="absolute top-2 left-2 z-10">
                      <div
                        onClick={() => toggleImageSelection(image.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected
                          ? "bg-primary border-primary"
                          : "bg-white/90 border-white/90 hover:bg-white"
                          }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-1.5">
                        <Download className="w-3 h-3 text-primary dark:text-black" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        );

      case 'empty':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No images in this category</p>
          </div>
        );

      case 'load-more':
        const cat = item.category;
        return (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => loadCategoryImages(cat.id)}
              disabled={cat.isLoading}
              className="min-w-[200px]"
            >
              {cat.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {cat.images.length === 0 ? "Load Gallery" : "Load More Images"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/events')}
              className="mb-6 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>

            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {eventInfo?.title || 'Event Gallery'}
              </h1>
              {eventInfo?.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {eventInfo.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">
                    {totalImages} Total Photos
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{selectedImages.size} Selected</span>
                </div>
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

      {/* Categories Section with Virtualization */}
      <section className="min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No galleries available</p>
            </div>
          ) : (
            <Virtuoso
              useWindowScroll
              data={virtualItems}
              itemContent={renderItem}
              className="min-h-screen"
            />
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

export default EventGalleryPage;
