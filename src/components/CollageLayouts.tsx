export interface CollageLayout {
  id: string;
  name: string;
  minPhotos: number;
  maxPhotos: number;
  slots: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  shape: "square" | "rectangle";
}

export const collageLayouts: CollageLayout[] = [
  {
    id: "hero-featured",
    name: "Hero Featured",
    minPhotos: 2,
    maxPhotos: 5,
    shape: "rectangle",
    slots: [
      { x: 0, y: 0, width: 65, height: 100 }, // Main large photo
      { x: 65, y: 0, width: 35, height: 33 },
      { x: 65, y: 33, width: 35, height: 33 },
      { x: 65, y: 66, width: 35, height: 34 },
    ]
  },
  {
    id: "magazine-spread",
    name: "Magazine Spread",
    minPhotos: 3,
    maxPhotos: 7,
    shape: "rectangle",
    slots: [
      { x: 0, y: 0, width: 45, height: 60 },
      { x: 45, y: 0, width: 30, height: 35 },
      { x: 75, y: 0, width: 25, height: 35 },
      { x: 45, y: 35, width: 55, height: 25 },
      { x: 0, y: 60, width: 30, height: 40 },
      { x: 30, y: 60, width: 35, height: 40 },
      { x: 65, y: 60, width: 35, height: 40 },
    ]
  },
  {
    id: "mosaic-artistic",
    name: "Artistic Mosaic",
    minPhotos: 4,
    maxPhotos: 8,
    shape: "square",
    slots: [
      { x: 0, y: 0, width: 40, height: 40 },
      { x: 40, y: 0, width: 30, height: 25 },
      { x: 70, y: 0, width: 30, height: 25 },
      { x: 40, y: 25, width: 60, height: 15 },
      { x: 0, y: 40, width: 25, height: 35 },
      { x: 25, y: 40, width: 35, height: 35 },
      { x: 60, y: 40, width: 20, height: 35 },
      { x: 80, y: 40, width: 20, height: 35 },
      { x: 0, y: 75, width: 100, height: 25 },
    ]
  },
  {
    id: "polaroid-scatter",
    name: "Polaroid Scatter",
    minPhotos: 3,
    maxPhotos: 6,
    shape: "square",
    slots: [
      { x: 5, y: 10, width: 35, height: 30 },
      { x: 45, y: 5, width: 40, height: 35 },
      { x: 15, y: 45, width: 30, height: 25 },
      { x: 55, y: 50, width: 35, height: 30 },
      { x: 10, y: 75, width: 25, height: 20 },
      { x: 65, y: 85, width: 30, height: 25 },
    ]
  },
  {
    id: "golden-ratio",
    name: "Golden Ratio",
    minPhotos: 2,
    maxPhotos: 5,
    shape: "rectangle",
    slots: [
      { x: 0, y: 0, width: 62, height: 100 }, // Golden ratio main
      { x: 62, y: 0, width: 38, height: 38 },
      { x: 62, y: 38, width: 38, height: 24 },
      { x: 62, y: 62, width: 38, height: 38 },
    ]
  },
  {
    id: "diagonal-dynamic",
    name: "Diagonal Dynamic",
    minPhotos: 4,
    maxPhotos: 7,
    shape: "square",
    slots: [
      { x: 0, y: 0, width: 50, height: 35 },
      { x: 50, y: 15, width: 50, height: 35 },
      { x: 15, y: 35, width: 40, height: 30 },
      { x: 55, y: 50, width: 35, height: 30 },
      { x: 0, y: 65, width: 30, height: 35 },
      { x: 30, y: 80, width: 40, height: 20 },
      { x: 70, y: 80, width: 30, height: 20 },
    ]
  },
  {
    id: "spotlight-feature",
    name: "Spotlight Feature",
    minPhotos: 3,
    maxPhotos: 8,
    shape: "rectangle",
    slots: [
      { x: 20, y: 20, width: 60, height: 60 }, // Center spotlight
      { x: 0, y: 0, width: 20, height: 30 },
      { x: 0, y: 30, width: 20, height: 30 },
      { x: 0, y: 60, width: 20, height: 40 },
      { x: 80, y: 0, width: 20, height: 25 },
      { x: 80, y: 25, width: 20, height: 25 },
      { x: 80, y: 50, width: 20, height: 25 },
      { x: 80, y: 75, width: 20, height: 25 },
      { x: 20, y: 80, width: 60, height: 20 },
    ]
  },
  {
    id: "pyramid-stack",
    name: "Pyramid Stack",
    minPhotos: 3,
    maxPhotos: 6,
    shape: "square",
    slots: [
      { x: 37.5, y: 0, width: 25, height: 25 }, // Top
      { x: 25, y: 25, width: 25, height: 25 }, // Middle left
      { x: 50, y: 25, width: 25, height: 25 }, // Middle right
      { x: 12.5, y: 50, width: 25, height: 25 }, // Bottom left
      { x: 37.5, y: 50, width: 25, height: 25 }, // Bottom center
      { x: 62.5, y: 50, width: 25, height: 25 }, // Bottom right
      { x: 0, y: 75, width: 100, height: 25 }, // Base
    ]
  },
  {
    id: "frame-within-frame",
    name: "Frame within Frame",
    minPhotos: 2,
    maxPhotos: 4,
    shape: "square",
    slots: [
      { x: 10, y: 10, width: 80, height: 50 }, // Main frame
      { x: 70, y: 65, width: 25, height: 30 }, // Small frame 1
      { x: 5, y: 70, width: 30, height: 25 }, // Small frame 2
      { x: 40, y: 75, width: 25, height: 20 }, // Small frame 3
    ]
  },
  {
    id: "hexagon-cluster",
    name: "Hexagon Cluster",
    minPhotos: 5,
    maxPhotos: 7,
    shape: "square",
    slots: [
      { x: 35, y: 5, width: 30, height: 25 }, // Top
      { x: 10, y: 25, width: 30, height: 25 }, // Left
      { x: 60, y: 25, width: 30, height: 25 }, // Right
      { x: 35, y: 45, width: 30, height: 25 }, // Center
      { x: 10, y: 65, width: 30, height: 25 }, // Bottom left
      { x: 60, y: 65, width: 30, height: 25 }, // Bottom right
      { x: 35, y: 85, width: 30, height: 15 }, // Bottom
    ]
  }
];

export const getLayoutsForPhotoCount = (photoCount: number, shape?: "square" | "rectangle") => {
  return collageLayouts.filter(layout => {
    const fitsPhotoCount = photoCount >= layout.minPhotos && photoCount <= layout.maxPhotos;
    const fitsShape = !shape || layout.shape === shape;
    return fitsPhotoCount && fitsShape;
  });
};

export const getBestLayoutForPhotos = (photoCount: number, shape: "square" | "rectangle" = "square") => {
  const availableLayouts = getLayoutsForPhotoCount(photoCount, shape);
  
  if (availableLayouts.length === 0) {
    // Fallback to any layout that can accommodate the photos
    const fallbackLayouts = collageLayouts.filter(layout => photoCount <= layout.maxPhotos);
    return fallbackLayouts[0] || collageLayouts[0];
  }
  
  // Prefer layouts that use exactly the number of photos available
  const exactMatch = availableLayouts.find(layout => layout.minPhotos === photoCount);
  return exactMatch || availableLayouts[0];
};