import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlbumCoverSelectorProps {
  shape: "square" | "rectangle";
  onCoverSelected: (cover: string | File) => void;
  selectedCover: string | File | null;
}

const PRESET_COVERS = {
  square: [
    "https://images.unsplash.com/photo-1542281286-9e0a16bb7366",
    "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f",
    "https://images.unsplash.com/photo-1557683316-973673baf926",
  ],
  rectangle: [
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  ],
};

export const AlbumCoverSelector = ({ shape, onCoverSelected, selectedCover }: AlbumCoverSelectorProps) => {
  const [customCover, setCustomCover] = useState<File | null>(null);
  const presets = PRESET_COVERS[shape];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCustomCover(file);
      onCoverSelected(file);
    }
  };

  const isSelected = (cover: string | File) => {
    if (typeof cover === 'string' && typeof selectedCover === 'string') {
      return cover === selectedCover;
    }
    if (cover instanceof File && selectedCover instanceof File) {
      return cover.name === selectedCover.name;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <Label>Select Album Cover</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {presets.map((preset, index) => (
          <Card
            key={preset}
            className={`cursor-pointer overflow-hidden transition-all ${
              isSelected(preset)
                ? 'ring-2 ring-primary shadow-lg scale-105'
                : 'hover:shadow-md hover:scale-102'
            }`}
            onClick={() => onCoverSelected(preset)}
          >
            <div className={shape === "square" ? "aspect-square" : "aspect-[4/3]"}>
              <img
                src={preset}
                alt={`Cover ${index + 1}`}
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
