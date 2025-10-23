# Album Order - API Data Structure

## Endpoint
```
POST /api/orders/album
Content-Type: multipart/form-data
```

## orderData (JSON String)

```javascript
{
  customer: {
    name: string,
    phone: string,
    location: string,
    additionalInfo: string
  },

  payment: {
    method: "online" | "cod",
    deliveryLocation: "inside-dhaka" | "outside-dhaka",
    deliveryCharge: number
  },

  album: {
    shape: "square" | "rectangle",
    coverImage: string,              // Cover image filename or "None"
    pageCount: number,                // 4, 8, 12, 16, 20, 24, or 28
    pagesWithPhotos: number,          // Pages containing at least one photo
    totalImages: number,              // Total photos across all pages
    basePrice: 1000,                  // Fixed base price
    pricePerPage: 100                 // Fixed price per page
  },

  pricing: {
    basePrice: 1000,                  // Fixed
    pagesPrice: number,               // pageCount × 100
    subtotal: number,                 // basePrice + pagesPrice
    deliveryCharge: number,
    total: number                     // subtotal + deliveryCharge
  },

  pages: [
    {
      pageNumber: number,             // 1, 2, 3, etc.
      layoutId: string,               // "single-spotlight", "side-by-side", etc.
      layoutName: string,             // Human-readable name
      imageCount: number,             // Photos placed on this page
      totalSlots: number,             // Available slots in layout
      images: [
        {
          slotIndex: number,          // Position in layout (0-based)
          originalFileName: string,
          fileSize: number,
          fileType: string,
          hasEdits: boolean,
          transformData: {            // Only present if hasEdits = true
            zoom: number,
            positionX: number,
            positionY: number
          }
        }
      ]
    }
  ],

  metadata: {
    orderDate: string,
    serviceType: "album"
  }
}
```

## Image Files

### Cover Image
```
cover_image: Image file (optional)
```

### Page Images (per page, per slot)
```
page_1_slot_0: Original image file
page_1_slot_1: Original image file
page_2_slot_0: Original image file
page_2_slot_1: Original image file
page_2_slot_2: Original image file
...
```

### Edited Images (only if hasEdits = true)
```
edited_page_1_slot_0: JPEG File (rendered with zoom/position applied)
edited_page_1_slot_1: JPEG File
edited_page_2_slot_0: JPEG File
...
```

## Album Shapes
```
"square"    → Square format album
"rectangle" → Rectangle format album
```

## Page Count Options
```
4, 8, 12, 16, 20, 24, or 28 pages
```

## Available Layouts (per page)

### Layout IDs & Slot Counts
```
"single-spotlight"          → 1 image slot
"side-by-side"             → 2 image slots
"hero-with-thumbnails"     → 3 image slots
"classic-grid"             → 4 image slots
"focal-with-accents"       → 5 image slots
"magazine-style"           → 6 image slots
"gallery-mix"              → 7 image slots
"creative-blend"           → 8 image slots
"story-grid"               → 9 image slots
```

### Layout Names
```
"single-spotlight"          → "Single Spotlight"
"side-by-side"             → "Side by Side"
"hero-with-thumbnails"     → "Hero with Thumbnails"
"classic-grid"             → "Classic Grid"
"focal-with-accents"       → "Focal with Accents"
"magazine-style"           → "Magazine Style"
"gallery-mix"              → "Gallery Mix"
"creative-blend"           → "Creative Blend"
"story-grid"               → "Story Grid"
```

## Transform Data (for edited images)
```
zoom: 0.5 to 3.0           (zoom level, 1.0 = no zoom)
positionX: number          (horizontal pan in pixels)
positionY: number          (vertical pan in pixels)
```

## Pricing

### Base Structure
```
Base Price: 1000 tk (fixed)
Price per Page: 100 tk (fixed)
```

### Price Calculation
```
Subtotal = 1000 + (pageCount × 100)

Examples:
  4 pages  → 1000 + 400  = 1400 tk
  8 pages  → 1000 + 800  = 1800 tk
  12 pages → 1000 + 1200 = 2200 tk
  16 pages → 1000 + 1600 = 2600 tk
  20 pages → 1000 + 2000 = 3000 tk
  24 pages → 1000 + 2400 = 3400 tk
  28 pages → 1000 + 2800 = 3800 tk
```

## Delivery Charges
```
online: 0 tk
cod + inside-dhaka: 50 tk
cod + outside-dhaka: 0 tk
```

## Total Price Calculation
```
Total = Subtotal + Delivery Charge

Example:
Album: 12 pages = 2200 tk
Delivery (COD inside Dhaka): 50 tk
Total: 2250 tk
```

## Notes
- Each page can have a different layout
- Cover image is optional (string "None" if not provided)
- Not all pages need to have photos
- Each page tracks used slots vs. available slots
- Raw images are original uploads per slot
- Edited images only created if user zoomed/panned
- Transform data only included if zoom ≠ 1 or position ≠ (0,0)
- Pages are numbered starting from 1
- Slot indices are 0-based within each page
