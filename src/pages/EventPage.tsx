import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Check, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

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

// Sample data - replace with your actual data or API call
const GALLERIES: Gallery[] = [
  {
    id: "gallery-1",
    title: "Summer Wedding 2024",
    description: "A beautiful celebration of love at the Grand Hall",
    date: "June 15, 2024",
    images: [
      {
        id: "img-1-1",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
        title: "Wedding Ceremony",
      },
      {
        id: "img-1-2",
        url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800",
        title: "Bride and Groom",
      },
      {
        id: "img-1-3",
        url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800",
        title: "Reception",
      },
      {
        id: "img-1-4",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
        title: "First Dance",
      },
      {
        id: "img-1-5",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
        title: "Wedding Party",
      },
      {
        id: "img-1-6",
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
        title: "Venue Decoration",
      },
    ],
  },
  {
    id: "gallery-2",
    title: "Corporate Gala 2024",
    description: "Annual company celebration and awards night",
    date: "August 22, 2024",
    images: [
      {
        id: "img-2-1",
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        title: "Event Opening",
      },
      {
        id: "img-2-2",
        url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
        title: "Keynote Speech",
      },
      {
        id: "img-2-3",
        url: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
        title: "Networking",
      },
      {
        id: "img-2-4",
        url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
        title: "Award Ceremony",
      },
      {
        id: "img-2-5",
        url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
        title: "Team Photo",
      },
      {
        id: "img-2-6",
        url: "https://images.unsplash.com/photo-1665072464126-b53f4bd0e465?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1738",
        title: "Dinner Reception",
      },
    ],
  },
  {
    id: "gallery-3",
    title: "Birthday Bash 2024",
    description: "An unforgettable celebration with friends and family",
    date: "September 10, 2024",
    images: [
      {
        id: "img-3-1",
        url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
        title: "Birthday Cake",
      },
      {
        id: "img-3-2",
        url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
        title: "Party Decorations",
      },
      {
        id: "img-3-3",
        url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800",
        title: "Guests Arrival",
      },
      {
        id: "img-3-4",
        url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800",
        title: "Group Celebration",
      },
      {
        id: "img-3-5",
        url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
        title: "Gift Opening",
      },
      {
        id: "img-3-6",
        url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
        title: "Party Time",
      },
    ],
  },
];

const EventPage = () => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

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
    const gallery = GALLERIES.find((g) => g.id === galleryId);
    if (!gallery) return;

    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      gallery.images.forEach((img) => newSet.add(img.id));
      return newSet;
    });
    toast.success(`Selected all ${gallery.images.length} images from ${gallery.title}`);
  };

  const deselectAllInGallery = (galleryId: string) => {
    const gallery = GALLERIES.find((g) => g.id === galleryId);
    if (!gallery) return;

    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      gallery.images.forEach((img) => newSet.delete(img.id));
      return newSet;
    });
    toast.success(`Deselected all images from ${gallery.title}`);
  };

  const downloadSingleImage = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${image.title.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded: ${image.title}`);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const downloadSelectedImages = async () => {
    if (selectedImages.size === 0) {
      toast.error("Please select at least one image to download");
      return;
    }

    setIsDownloading(true);
    toast.loading(`Downloading ${selectedImages.size} image(s)...`);

    try {
      const allImages = GALLERIES.flatMap((g) => g.images);
      const imagesToDownload = allImages.filter((img) => selectedImages.has(img.id));

      for (const image of imagesToDownload) {
        await downloadSingleImage(image);
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
                  {GALLERIES.reduce((sum, g) => sum + g.images.length, 0)} Total Photos
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
                <Button variant="outline" onClick={clearSelection} className="flex items-center gap-2 text-black">
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
          <div className="space-y-16">
            {GALLERIES.map((gallery) => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <Download className="w-4 h-4 text-primary" />
                              </div>
                            </div>
                          </div>

                          {/* Image Title */}
                          <div className="p-4">
                            <h3 className="font-medium text-sm truncate">{image.title}</h3>
                          </div>
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventPage;
