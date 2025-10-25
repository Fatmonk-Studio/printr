import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AlbumCoverSelectorProps {
  shape: "square" | "rectangle";
  onCoverSelected: (cover: string | File, coverId?: number) => void;
  selectedCover: string | File | null;
}

interface AlbumCover {
  id: number;
  name: string;
  slug: string;
  type: "square" | "rectangle";
  status: number;
  image: string;
  created_at: string;
  updated_at: string;
}

export const AlbumCoverSelector = ({ shape, onCoverSelected, selectedCover }: AlbumCoverSelectorProps) => {
  const [customCover, setCustomCover] = useState<File | null>(null);
  const [albumCovers, setAlbumCovers] = useState<AlbumCover[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch album covers from API
  useEffect(() => {
    const fetchAlbumCovers = async () => {
      try {
        const response = await fetch('https://admin.printr.store/api/album/list');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Filter by shape type
          const filteredCovers = result.data.filter((cover: AlbumCover) => cover.type === shape);
          setAlbumCovers(filteredCovers);
        } else {
          toast.error('Failed to load album covers');
        }
      } catch (error) {
        console.error('Error fetching album covers:', error);
        toast.error('Failed to load album covers');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumCovers();
  }, [shape]);

  const presets = albumCovers;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCustomCover(file);
      onCoverSelected(file);
    }
  };

  const isSelected = (cover: AlbumCover | File) => {
    if (cover instanceof File && selectedCover instanceof File) {
      return cover.name === selectedCover.name;
    }
    if (typeof cover === 'object' && 'id' in cover && typeof selectedCover === 'string') {
      return cover.image === selectedCover;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Label>Select Album Cover</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className={shape === "square" ? "aspect-square" : "aspect-[4/3]"}>
                <div className="w-full h-full bg-muted animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Select Album Cover</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {presets.map((preset) => (
          <Card
            key={preset.id}
            className={`cursor-pointer overflow-hidden transition-all ${
              isSelected(preset)
                ? 'ring-2 ring-primary shadow-lg scale-105'
                : 'hover:shadow-md hover:scale-102'
            }`}
            onClick={() => onCoverSelected(preset.image, preset.id)}
          >
            <div className={shape === "square" ? "aspect-square" : "aspect-[4/3]"}>
              <img
                src={preset.image}
                alt={preset.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        ))}
        
        <Card
          className={`cursor-pointer overflow-hidden transition-all ${
            customCover && isSelected(customCover)
              ? 'ring-2 ring-primary shadow-lg scale-105'
              : 'hover:shadow-md hover:scale-102'
          }`}
        >
          <div className={`${shape === "square" ? "aspect-square" : "aspect-[4/3]"} relative`}>
            {customCover ? (
              <img
                src={URL.createObjectURL(customCover)}
                alt="Custom cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center bg-muted cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground text-center px-2">Upload Custom</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
