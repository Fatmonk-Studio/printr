import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Check,
  X,
  ImageIcon,
  Loader2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
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
const MAX_CONCURRENT_DOWNLOADS = 3;

const runWithConcurrencyLimit = async <T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = [];
  let nextIndex = 0;

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(items[currentIndex]);
      }
    },
  );

  await Promise.all(runners);
  return results;
};

// Define types for virtual items
type VirtualItem =
  | { type: "image-row"; items: GalleryImage[] }
  | { type: "empty" }
  | { type: "loading" };

interface GalleryImageCardProps {
  image: GalleryImage;
  isSelected: boolean;
  onToggleSelect: (imageId: string) => void;
  onDownload: (image: GalleryImage) => void;
}

const GalleryImageCard = memo(
  ({
    image,
    isSelected,
    onToggleSelect,
    onDownload,
  }: GalleryImageCardProps) => (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-xl ${
        isSelected ? "ring-2 ring-primary shadow-lg" : ""
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
              onClick={() => onDownload(image)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="absolute top-2 left-2 z-10">
          <div
            onClick={() => onToggleSelect(image.id)}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
              isSelected
                ? "bg-primary border-primary"
                : "bg-white/90 border-white/90 hover:bg-white"
            }`}
          >
            {isSelected && (
              <Check className="w-4 h-4 text-primary-foreground" />
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-1.5">
            <Download className="w-3 h-3 text-primary dark:text-black" />
          </div>
        </div>
      </div>
    </Card>
  ),
);

const EventGalleryPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const hasAutoLoaded = useRef(false);

  const [eventInfo, setEventInfo] = useState<{
    title: string;
    description: string | null;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<GalleryImage | null>(
    null,
  );
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
        const response = await fetch(
          "https://admin.printr.store/api/event/list",
        );
        const result: EventListResponse = await response.json();

        if (result.success && result.data.length > 0) {
          const event = result.data.find((e) => e.id.toString() === eventId);

          if (!event) {
            toast.error("Event not found");
            navigate("/events");
            return;
          }

          setEventInfo({
            title: event.title,
            description: event.description,
          });

          const transformedCategories: Category[] = event.categories.map(
            (cat) => ({
              id: cat.id,
              title: cat.title,
              description: cat.description,
              images: [],
              isLoading: false,
              currentPage: 0,
              totalPages: 1,
              totalImages: 0,
              nextPageUrl: `https://admin.printr.store/api/category/${cat.id}/galleries?page=1&per_page=20`,
            }),
          );

          setCategories(transformedCategories);
          if (transformedCategories.length > 0 && !activeTabId) {
            setActiveTabId(transformedCategories[0].id.toString());
          }
        } else {
          toast.error("Failed to load event");
          navigate("/events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event");
        navigate("/events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  const handleTabChange = useCallback(
    (newTabId: string) => {
      setActiveTabId(newTabId);

      const categoryId = parseInt(newTabId);

      // Clear images for other categories to save memory
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId && cat.images.length > 0) {
            return {
              ...cat,
              images: [],
              currentPage: 0,
              nextPageUrl: `https://admin.printr.store/api/category/${cat.id}/galleries?page=1&per_page=20`,
            };
          }
          return cat;
        }),
      );

      // Trigger load for the new tab if needed
      // We use a timeout to let the state update settle, or we can just check the current state ref
      // Actually relying on the 'categories' state here might be stale if we just called setCategories.
      // However, the *load* check depends on if we *already* have images.
      // Since we just switched tabs, we can check the *existing* category data in 'categories' (before the clear update)
      // because the current tab's data wouldn't be touched by the clear logic anyway.

      const category = categories.find((c) => c.id === categoryId);
      if (
        category &&
        category.images.length === 0 &&
        !category.isLoading &&
        category.nextPageUrl
      ) {
        loadCategoryImages(categoryId);
      }
    },
    [categories],
  );

  // Initial load effect
  useEffect(() => {
    if (activeTabId && categories.length > 0) {
      const categoryId = parseInt(activeTabId);
      const category = categories.find((c) => c.id === categoryId);
      if (
        category &&
        category.images.length === 0 &&
        !category.isLoading &&
        category.nextPageUrl
      ) {
        loadCategoryImages(categoryId);
      }
    }
  }, [activeTabId]); // Keep this simple, strictly for initial mount or external ID changes

  // Load images for a category
  const loadCategoryImages = async (categoryId: number) => {
    const loadKey = `cat-${categoryId}`;

    const category = categories.find((c) => c.id === categoryId);
    if (!category?.nextPageUrl || category.isLoading) {
      return;
    }

    try {
      setActiveLoads((prev) => new Set(prev).add(loadKey));

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, isLoading: true } : cat,
        ),
      );

      const response = await fetch(category.nextPageUrl);
      const result: GalleriesResponse = await response.json();

      if (result.success && result.data) {
        const data = result.data;

        const newImages: GalleryImage[] = data.data.map((img) => ({
          id: `img-${categoryId}-${img.id}`,
          url: `https://admin.printr.store/${img.image_url}`,
          title: `${category.title} - Image ${img.id}`,
        }));

        setCategories((prev) =>
          prev.map((cat) => {
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
          }),
        );

        toast.success(`Loaded ${newImages.length} images`);
      }
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Failed to load images");

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, isLoading: false } : cat,
        ),
      );
    } finally {
      setActiveLoads((prev) => {
        const newSet = new Set(prev);
        newSet.delete(loadKey);
        return newSet;
      });
    }
  };

  const toggleImageSelection = useCallback((imageId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  }, []);

  const selectAllInCategory = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedImages((prev) => {
        const newSet = new Set(prev);
        category.images.forEach((img) => newSet.add(img.id));
        return newSet;
      });
      toast.success(`Selected ${category.images.length} images`);
    }
  };

  const deselectAllInCategory = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedImages((prev) => {
        const newSet = new Set(prev);
        category.images.forEach((img) => newSet.delete(img.id));
        return newSet;
      });
      toast.success("Selection cleared");
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

  const performSingleDownload = useCallback(async (image: GalleryImage) => {
    try {
      try {
        const response = await fetch(image.url, { mode: "cors" });

        if (!response.ok) {
          throw new Error("Failed to fetch image");
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
  }, []);

  const downloadSingleImage = useCallback((image: GalleryImage) => {
    setPendingDownload(image);
    setShowUserInfoDialog(true);
  }, []);

  const performBatchDownload = async () => {
    if (selectedImages.size === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsDownloading(true);
    toast.loading(`Preparing ${selectedImages.size} image(s) for download...`);

    try {
      const zip = new JSZip();
      const allImages = categories.flatMap((cat) => cat.images);
      const imagesToDownload = allImages.filter((img) =>
        selectedImages.has(img.id),
      );

      const downloadResults = await runWithConcurrencyLimit(
        imagesToDownload,
        MAX_CONCURRENT_DOWNLOADS,
        async (image) => {
          try {
            const response = await fetch(image.url, { mode: "cors" });
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const fileName = `${image.title
              .replace(/[^a-z0-9]/gi, "_")
              .toLowerCase()}.jpg`;
            zip.file(fileName, blob);
            return true;
          } catch (error) {
            console.error(`Failed to download ${image.title}`, error);
            return false;
          }
        },
      );

      const downloadedCount = downloadResults.filter(Boolean).length;

      if (downloadedCount === 0) {
        throw new Error("No images could be downloaded");
      }

      toast.loading("Generating zip file...");
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${eventInfo?.title || "event-gallery"}.zip`);

      toast.dismiss();
      toast.success("Download started!");
      setSelectedImages(new Set());
    } catch (error) {
      console.error("Batch download error:", error);
      toast.dismiss();
      toast.error("Failed to generate zip file");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSelectedImages = useCallback(() => {
    if (selectedImages.size === 0) {
      toast.error("Please select at least one image");
      return;
    }
    setPendingDownload(null);
    setShowUserInfoDialog(true);
  }, [selectedImages.size]);

  const clearSelection = useCallback(() => {
    setSelectedImages(new Set());
    toast.success("Selection cleared");
  }, []);

  const totalImages = categories.reduce((sum, cat) => sum + cat.totalImages, 0);

  // Calculate dynamic columns based on screen width
  const columns = useMemo(() => {
    if (width >= 1280) return 5; // xl
    if (width >= 1024) return 4; // lg
    if (width >= 640) return 3; // sm
    return 2; // default/mobile
  }, [width]);

  // Flatten data for virtualization
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];
    const categoryId = activeTabId ? parseInt(activeTabId) : null;
    const category = categories.find((c) => c.id === categoryId);

    if (!category) return items;

    // 1. Add Image Rows
    if (category.images.length > 0) {
      for (let i = 0; i < category.images.length; i += columns) {
        items.push({
          type: "image-row",
          items: category.images.slice(i, i + columns),
        });
      }
    }

    // 2. Add Empty State or Loading
    if (
      category.images.length === 0 &&
      !category.isLoading &&
      !category.nextPageUrl
    ) {
      items.push({ type: "empty" });
    } else if (category.isLoading) {
      items.push({ type: "loading" });
    }

    return items;
  }, [categories, columns, activeTabId]);

  // Render a specific item
  const renderItem = (_: number, item: VirtualItem) => {
    switch (item.type) {
      case "image-row":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {item.items.map((image) => {
              const isSelected = selectedImages.has(image.id);
              return (
                <GalleryImageCard
                  key={image.id}
                  image={image}
                  isSelected={isSelected}
                  onToggleSelect={toggleImageSelection}
                  onDownload={downloadSingleImage}
                />
              );
            })}
          </div>
        );

      case "empty":
        return (
          <div className="flex flex-col items-center justify-center py-20">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No images in this category</p>
          </div>
        );

      case "loading":
        return (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        );

      default:
        return null;
    }
  };

  const handleEndReached = () => {
    if (!activeTabId) return;
    const categoryId = parseInt(activeTabId);
    const category = categories.find((c) => c.id === categoryId);
    if (category && category.nextPageUrl && !category.isLoading) {
      loadCategoryImages(categoryId);
    }
  };

  const activeCategory = categories.find(
    (c) => c.id.toString() === activeTabId,
  );
  const selectedInCategory = activeCategory
    ? activeCategory.images.filter((img) => selectedImages.has(img.id)).length
    : 0;
  const allSelected =
    activeCategory &&
    activeCategory.images.length > 0 &&
    selectedInCategory === activeCategory.images.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/events")}
              className="mb-6 -ml-2 mt-5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>

            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {eventInfo?.title || "Event Gallery"}
              </h1>
              {eventInfo?.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {eventInfo.description}
                </p>
              )}
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
                <span className="font-semibold">
                  {selectedImages.size} image(s) selected
                </span>
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
                <Button
                  variant="outline"
                  onClick={clearSelection}
                  className="flex items-center gap-2 text-black dark:text-white"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Content Section */}
      <section className="pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No galleries available
              </p>
            </div>
          ) : (
            <Tabs
              value={activeTabId || undefined}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b pb-4">
                <TabsList className="flex flex-wrap h-auto bg-transparent p-0 gap-2 justify-start">
                  {categories.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id.toString()}
                      className="px-4 py-2 rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                    >
                      {cat.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeTabId!} className="mt-0 outline-none">
                <div className="flex justify-end items-center gap-3 mb-5">
                  {activeCategory && (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-medium">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      {activeCategory.totalImages} Photos
                    </div>
                  )}
                  {activeCategory && activeCategory.images.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        allSelected
                          ? deselectAllInCategory(activeCategory.id)
                          : selectAllInCategory(activeCategory.id)
                      }
                      className="rounded-full h-9"
                    >
                      {allSelected ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Select All
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {activeCategory?.description && (
                  <p className="text-muted-foreground mb-6 bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                    {activeCategory.description}
                  </p>
                )}
                <Virtuoso
                  useWindowScroll
                  data={virtualItems}
                  itemContent={renderItem}
                  endReached={handleEndReached}
                  className="min-h-[500px]"
                  overscan={200}
                />
              </TabsContent>
            </Tabs>
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
              Please provide your information to download{" "}
              {pendingDownload
                ? "this image"
                : `${selectedImages.size} image(s)`}
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
