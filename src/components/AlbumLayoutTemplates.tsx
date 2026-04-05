export interface LayoutTemplate {
  id: string;
  name: string;
  imageCount: number;
  square: { x: number; y: number; width: number; height: number }[];
  rectangle: { x: number; y: number; width: number; height: number }[];
}

export const ALBUM_LAYOUTS: LayoutTemplate[] = [
  // 1 Image Layouts
  {
    id: "single-1",
    name: "Single Photo",
    imageCount: 1,
    square: [{ x: 10, y: 10, width: 80, height: 80 }],
    rectangle: [{ x: 10, y: 15, width: 80, height: 70 }],
  },
  // 2 Image Layouts
  {
    id: "double-1",
    name: "Two Vertical",
    imageCount: 2,
    square: [
      { x: 5, y: 10, width: 42.5, height: 80 },
      { x: 52.5, y: 10, width: 42.5, height: 80 },
    ],
    rectangle: [
      { x: 5, y: 15, width: 42.5, height: 70 },
      { x: 52.5, y: 15, width: 42.5, height: 70 },
    ],
  },
  {
    id: "double-2",
    name: "Two Horizontal",
    imageCount: 2,
    square: [
      { x: 10, y: 5, width: 80, height: 42.5 },
      { x: 10, y: 52.5, width: 80, height: 42.5 },
    ],
    rectangle: [
      { x: 10, y: 7.5, width: 80, height: 40 },
      { x: 10, y: 52.5, width: 80, height: 40 },
    ],
  },
  // 3 Image Layouts
  {
    id: "triple-1",
    name: "Three Columns",
    imageCount: 3,
    square: [
      { x: 3, y: 10, width: 28, height: 80 },
      { x: 36, y: 10, width: 28, height: 80 },
      { x: 69, y: 10, width: 28, height: 80 },
    ],
    rectangle: [
      { x: 3, y: 15, width: 28, height: 70 },
      { x: 36, y: 15, width: 28, height: 70 },
      { x: 69, y: 15, width: 28, height: 70 },
    ],
  },
  {
    id: "triple-2",
    name: "One Large + Two Small",
    imageCount: 3,
    square: [
      { x: 5, y: 10, width: 50, height: 80 },
      { x: 60, y: 10, width: 35, height: 37.5 },
      { x: 60, y: 52.5, width: 35, height: 37.5 },
    ],
    rectangle: [
      { x: 5, y: 15, width: 50, height: 70 },
      { x: 60, y: 15, width: 35, height: 32.5 },
      { x: 60, y: 52.5, width: 35, height: 32.5 },
    ],
  },
  // 4 Image Layouts
  {
    id: "quad-1",
    name: "Four Grid",
    imageCount: 4,
    square: [
      { x: 5, y: 5, width: 42.5, height: 42.5 },
      { x: 52.5, y: 5, width: 42.5, height: 42.5 },
      { x: 5, y: 52.5, width: 42.5, height: 42.5 },
      { x: 52.5, y: 52.5, width: 42.5, height: 42.5 },
    ],
    rectangle: [
      { x: 5, y: 10, width: 42.5, height: 37.5 },
      { x: 52.5, y: 10, width: 42.5, height: 37.5 },
      { x: 5, y: 52.5, width: 42.5, height: 37.5 },
      { x: 52.5, y: 52.5, width: 42.5, height: 37.5 },
    ],
  },
  {
    id: "quad-2",
    name: "Four Rows",
    imageCount: 4,
    square: [
      { x: 10, y: 3, width: 80, height: 21 },
      { x: 10, y: 27, width: 80, height: 21 },
      { x: 10, y: 51, width: 80, height: 21 },
      { x: 10, y: 75, width: 80, height: 21 },
    ],
    rectangle: [
      { x: 10, y: 7, width: 80, height: 18.5 },
      { x: 10, y: 28.5, width: 80, height: 18.5 },
      { x: 10, y: 50, width: 80, height: 18.5 },
      { x: 10, y: 71.5, width: 80, height: 18.5 },
    ],
  },
  // 5 Image Layouts
  {
    id: "five-1",
    name: "One Large + Four Small",
    imageCount: 5,
    square: [
      { x: 5, y: 5, width: 55, height: 55 },
      { x: 65, y: 5, width: 30, height: 26.25 },
      { x: 65, y: 33.75, width: 30, height: 26.25 },
      { x: 5, y: 65, width: 55, height: 30 },
      { x: 65, y: 65, width: 30, height: 30 },
    ],
    rectangle: [
      { x: 5, y: 10, width: 55, height: 50 },
      { x: 65, y: 10, width: 30, height: 23.75 },
      { x: 65, y: 36.25, width: 30, height: 23.75 },
      { x: 5, y: 65, width: 55, height: 25 },
      { x: 65, y: 65, width: 30, height: 25 },
    ],
  },
  {
    id: "five-2",
    name: "Five Mixed",
    imageCount: 5,
    square: [
      { x: 5, y: 5, width: 42.5, height: 42.5 },
      { x: 52.5, y: 5, width: 42.5, height: 42.5 },
      { x: 5, y: 52.5, width: 28, height: 42.5 },
      { x: 36, y: 52.5, width: 28, height: 42.5 },
      { x: 67, y: 52.5, width: 28, height: 42.5 },
    ],
    rectangle: [
      { x: 5, y: 10, width: 42.5, height: 37.5 },
      { x: 52.5, y: 10, width: 42.5, height: 37.5 },
      { x: 5, y: 52.5, width: 28, height: 37.5 },
      { x: 36, y: 52.5, width: 28, height: 37.5 },
      { x: 67, y: 52.5, width: 28, height: 37.5 },
    ],
  },
];
