export interface GridCell {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  photoId?: string;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface CollageGrid {
  id: string;
  cells: GridCell[];
  shape: "square" | "rectangle";
  rows: number;
  cols: number;
}

// Helper functions for grid generation
export const createGridCell = (
  id: string, 
  row: number, 
  col: number, 
  cellWidth: number, 
  cellHeight: number,
  rowSpan = 1,
  colSpan = 1
): GridCell => ({
  id,
  x: col * cellWidth,
  y: row * cellHeight,
  width: cellWidth * colSpan,
  height: cellHeight * rowSpan,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
});

export const generateGrid = (
  rows: number, 
  cols: number, 
  shape: "square" | "rectangle",
  photoCount: number
): CollageGrid => {
  const totalCells = Math.min(rows * cols, 10); // Max 10 cells
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;
  
  const cells: GridCell[] = [];
  let cellIndex = 0;
  
  for (let row = 0; row < rows && cellIndex < photoCount; row++) {
    for (let col = 0; col < cols && cellIndex < photoCount; col++) {
      cells.push(createGridCell(
        `cell-${cellIndex}`,
        row,
        col,
        cellWidth,
        cellHeight
      ));
      cellIndex++;
    }
  }
  
  return {
    id: `grid-${rows}x${cols}`,
    cells,
    shape,
    rows,
    cols,
  };
};

// Predefined smart grid layouts
export const getSmartGridLayouts = (photoCount: number, shape: "square" | "rectangle") => {
  const layouts: CollageGrid[] = [];
  
  if (shape === "square") {
    switch (photoCount) {
      case 1:
        layouts.push(generateGrid(1, 1, shape, photoCount));
        break;
      case 2:
        layouts.push(generateGrid(1, 2, shape, photoCount));
        layouts.push(generateGrid(2, 1, shape, photoCount));
        break;
      case 3:
        layouts.push(generateGrid(1, 3, shape, photoCount));
        layouts.push(generateGrid(3, 1, shape, photoCount));
        break;
      case 4:
        layouts.push(generateGrid(2, 2, shape, photoCount));
        layouts.push(generateGrid(1, 4, shape, photoCount));
        layouts.push(generateGrid(4, 1, shape, photoCount));
        break;
      case 5:
      case 6:
        layouts.push(generateGrid(2, 3, shape, photoCount));
        layouts.push(generateGrid(3, 2, shape, photoCount));
        break;
      case 7:
      case 8:
        layouts.push(generateGrid(2, 4, shape, photoCount));
        layouts.push(generateGrid(4, 2, shape, photoCount));
        break;
      case 9:
        layouts.push(generateGrid(3, 3, shape, photoCount));
        break;
      case 10:
        layouts.push(generateGrid(2, 5, shape, photoCount));
        layouts.push(generateGrid(5, 2, shape, photoCount));
        break;
    }
  } else { // rectangle
    switch (photoCount) {
      case 1:
        layouts.push(generateGrid(1, 1, shape, photoCount));
        break;
      case 2:
        layouts.push(generateGrid(1, 2, shape, photoCount));
        layouts.push(generateGrid(2, 1, shape, photoCount));
        break;
      case 3:
        layouts.push(generateGrid(1, 3, shape, photoCount));
        layouts.push(generateGrid(3, 1, shape, photoCount));
        break;
      case 4:
        layouts.push(generateGrid(2, 2, shape, photoCount));
        layouts.push(generateGrid(1, 4, shape, photoCount));
        break;
      case 5:
      case 6:
        layouts.push(generateGrid(2, 3, shape, photoCount));
        layouts.push(generateGrid(3, 2, shape, photoCount));
        break;
      case 7:
      case 8:
        layouts.push(generateGrid(2, 4, shape, photoCount));
        layouts.push(generateGrid(4, 2, shape, photoCount));
        break;
      case 9:
        layouts.push(generateGrid(3, 3, shape, photoCount));
        break;
      case 10:
        layouts.push(generateGrid(2, 5, shape, photoCount));
        layouts.push(generateGrid(5, 2, shape, photoCount));
        break;
    }
  }
  
  return layouts;
};