# Collage Order - API Data Structure

## Endpoint
```
POST /api/orders/collage
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

  collage: {
    size: "square-small" | "square-large" | "rectangle-medium" | "rectangle-large",
    sizeDetails: {
      name: string,
      price: number,
      width: number,
      height: number
    },
    shape: "square" | "rectangle",
    layout: string,
    totalPhotos: number
  },

  pricing: {
    subtotal: number,
    deliveryCharge: number,
    total: number
  },

  photos: [
    {
      index: number,
      originalFileName: string,
      fileSize: number,
      fileType: string,
      hasEdits: boolean,
      transformData: {          // Only present if hasEdits = true
        scale: number,
        positionX: number,
        positionY: number
      }
    }
  ],

  metadata: {
    orderDate: string,
    serviceType: "collage"
  }
}
```

## Image Files

### Raw Images
```
photo_0: Original image file
photo_1: Original image file
photo_2: Original image file
...
```

### Edited Collage (Final Rendered Version)
```
edited_collage: JPEG File (complete rendered collage with all edits applied)
```

## Collage Sizes & Prices

### Square Collages
```
"square-small"  → 12" × 12"  | 800 tk  | 400×400 px
"square-large"  → 16" × 16"  | 1200 tk | 500×500 px
```

### Rectangle Collages
```
"rectangle-medium" → 16" × 12" | 900 tk  | 500×375 px
"rectangle-large"  → 20" × 16" | 1500 tk | 600×480 px
```

## Layout Names (Auto-generated based on photo count)
```
1 photo   → "Single spotlight"
2 photos  → "Side-by-side"
3 photos  → "Hero with thumbnails"
4 photos  → "Classic grid"
5 photos  → "Focal with accents"
6 photos  → "Magazine style"
7 photos  → "Gallery mix"
8 photos  → "Creative blend"
9 photos  → "Story grid"
10 photos → "Showcase spread"
```

## Transform Data (for edited photos)
```
scale: 0.5 to 3.0      (zoom level, 1.0 = no zoom)
positionX: number      (horizontal pan in pixels)
positionY: number      (vertical pan in pixels)
```

## Delivery Charges
```
online: 0 tk
cod + inside-dhaka: 50 tk
cod + outside-dhaka: 0 tk
```

## Price Calculation
```
Total Price = Collage Size Price + Delivery Charge

Example:
Collage: 16" × 16" Square = 1200 tk
Delivery (COD inside Dhaka): 50 tk
Total: 1250 tk
```

## Notes
- Each collage has ONE price (not per photo)
- Raw images are original uploads
- Edited collage is the final rendered version
- Transform data only included if user zoomed/panned
