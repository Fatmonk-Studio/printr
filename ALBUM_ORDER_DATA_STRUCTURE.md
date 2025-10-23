# Album Order Data Structure

## Overview
This document shows the exact structure of data submitted for album orders, including cover image, raw photos, and edited versions of images with zoom/pan transformations.

---

## Console Output Structure

When an album order is submitted, the following data is logged to the console:

### Complete Order Object

```json
{
  "customer": {
    "name": "Sarah Johnson",
    "phone": "+8801912345678",
    "location": "789 Garden Road, Chittagong, Bangladesh",
    "additionalInfo": "Please handle with care"
  },
  "payment": {
    "method": "online",
    "deliveryCharge": 0
  },
  "album": {
    "shape": "square",
    "coverImage": "wedding_cover.jpg",
    "pageCount": 12,
    "pagesWithPhotos": 10,
    "totalImages": 24,
    "basePrice": 1000,
    "pricePerPage": 100
  },
  "pricing": {
    "basePrice": 1000,
    "pagesPrice": 1200,
    "subtotal": 2200,
    "deliveryCharge": 0,
    "total": 2200
  },
  "pages": [
    {
      "pageNumber": 1,
      "layoutId": "layout-1",
      "layoutName": "Single Focus",
      "imageCount": 1,
      "totalSlots": 1,
      "images": [
        {
          "slotIndex": 0,
          "originalFileName": "ceremony.jpg",
          "fileSize": 4567890,
          "fileType": "image/jpeg",
          "hasEdits": true,
          "transformData": {
            "zoom": 1.3,
            "positionX": 15,
            "positionY": -20
          }
        }
      ]
    },
    {
      "pageNumber": 2,
      "layoutId": "layout-2",
      "layoutName": "Side by Side",
      "imageCount": 2,
      "totalSlots": 2,
      "images": [
        {
          "slotIndex": 0,
          "originalFileName": "bride.jpg",
          "fileSize": 3456789,
          "fileType": "image/jpeg",
          "hasEdits": false
        },
        {
          "slotIndex": 1,
          "originalFileName": "groom.jpg",
          "fileSize": 3234567,
          "fileType": "image/jpeg",
          "hasEdits": true,
          "transformData": {
            "zoom": 1.5,
            "positionX": 0,
            "positionY": 10
          }
        }
      ]
    }
  ],
  "metadata": {
    "orderDate": "2025-10-21T10:30:00.000Z",
    "serviceType": "album"
  }
}
```

---

## Field Descriptions

### customer
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Customer's full name |
| `phone` | string | Yes | Contact phone number |
| `location` | string | Yes | Delivery address |
| `additionalInfo` | string | No | Special instructions |

### payment
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | string | Yes | "online" or "cod" |
| `deliveryLocation` | string | Conditional | Required if COD: "inside-dhaka" or "outside-dhaka" |
| `deliveryCharge` | number | Yes | Delivery fee (0 or 50 tk) |

### album
| Field | Type | Description |
|-------|------|-------------|
| `shape` | string | "square" or "rectangle" |
| `coverImage` | string | Cover image filename or 'None' |
| `pageCount` | number | Total number of pages ordered |
| `pagesWithPhotos` | number | Number of pages containing at least one photo |
| `totalImages` | number | Total number of images in the album |
| `basePrice` | number | Base album price (1000 tk) |
| `pricePerPage` | number | Price per page (100 tk) |

### pricing
| Field | Type | Description |
|-------|------|-------------|
| `basePrice` | number | Base album price |
| `pagesPrice` | number | Total cost for pages (pageCount × pricePerPage) |
| `subtotal` | number | basePrice + pagesPrice |
| `deliveryCharge` | number | Delivery fee |
| `total` | number | Final amount |

### pages[] (Array of Album Pages)
| Field | Type | Description |
|-------|------|-------------|
| `pageNumber` | number | Page number (1-based) |
| `layoutId` | string | Layout template ID |
| `layoutName` | string | Human-readable layout name |
| `imageCount` | number | Number of images on this page |
| `totalSlots` | number | Total number of slots in layout |
| `images` | array | Array of images on this page |

### images[] (Within each page)
| Field | Type | Description |
|-------|------|-------------|
| `slotIndex` | number | Position in layout (0-based) |
| `originalFileName` | string | Original uploaded file name |
| `fileSize` | number | File size in bytes |
| `fileType` | string | MIME type |
| `hasEdits` | boolean | Whether user edited this image |
| `transformData` | object | Only present if hasEdits=true |
| `transformData.zoom` | number | Zoom level (1.0 = no zoom) |
| `transformData.positionX` | number | Horizontal pan offset |
| `transformData.positionY` | number | Vertical pan offset |

### metadata
| Field | Type | Description |
|-------|------|-------------|
| `orderDate` | string | ISO 8601 timestamp |
| `serviceType` | string | Always "album" for album orders |

---

## Available Options

### Album Shapes
- **square** - Square format album
- **rectangle** - Rectangle format album

### Page Options
Available page counts: **4, 8, 12, 16, 20, 24, 28**

### Layout Templates
| Layout ID | Name | Slots | Description |
|-----------|------|-------|-------------|
| layout-1 | Single Focus | 1 | One large image |
| layout-2 | Side by Side | 2 | Two equal images |
| layout-3 | Triple View | 3 | Three images |
| layout-4 | Grid Four | 4 | Four equal images |
| layout-6 | Six Pack | 6 | Six images |

*(Actual layouts may vary - refer to AlbumLayoutTemplates component)*

### Transform Ranges
- **Zoom**: 0.5x to 3.0x (50% to 300%)
- **Position**: Unlimited pixel offset

---

## Image Data

Each album order includes:

### 1. Cover Image
- Optional custom cover image
- Uploaded as File object
- Can be a photo from the album or separate image

### 2. Raw Images (Original Files)
- All original uploaded image files
- Unmodified, as uploaded by user
- Full resolution and original format
- Available as File objects in pages array

### 3. Edited Images (Processed Versions)
- Created only for images with edits (zoom/pan)
- 800×800px high-quality JPEG at 95% quality
- Transformations pre-applied
- Available as Blob objects

---

## Example Console Output

```
══════════════════════════════════════════════════════════════════
          ALBUM ORDER SUBMISSION - COMPLETE DATA
══════════════════════════════════════════════════════════════════

📦 COMPLETE ORDER OBJECT:
{
  "customer": {...},
  "payment": {...},
  "album": {...},
  "pricing": {...},
  "pages": [...],
  "metadata": {...}
}

══════════════════════════════════════════════════════════════════
              RAW & EDITED IMAGES
══════════════════════════════════════════════════════════════════

📕 ALBUM COVER IMAGE:
   File: wedding_cover.jpg
   Size: 4.23 MB
   Type: image/jpeg
   Cover Image File: File {...}

📸 RAW & EDITED IMAGES BY PAGE:

   📄 Page 1 (Layout: Single Focus)
   ─────────────────────────────────────────

      🖼️  Slot 1:
      Original File: ceremony.jpg
      Size: 4.35 MB
      Type: image/jpeg
      Has Edits: Yes
      Transform Data:
        - Zoom: 1.30x
        - Position X: 15px
        - Position Y: -20px
      Raw File Object: File {...}
      ✨ Edited Version:
         Size: 0.85 MB
         Type: image/jpeg
         Edited Blob: Blob {...}

   📄 Page 2 (Layout: Side by Side)
   ─────────────────────────────────────────

      🖼️  Slot 1:
      Original File: bride.jpg
      Size: 3.30 MB
      Type: image/jpeg
      Has Edits: No
      Raw File Object: File {...}

      🖼️  Slot 2:
      Original File: groom.jpg
      Size: 3.08 MB
      Type: image/jpeg
      Has Edits: Yes
      Transform Data:
        - Zoom: 1.50x
        - Position X: 0px
        - Position Y: 10px
      Raw File Object: File {...}
      ✨ Edited Version:
         Size: 0.92 MB
         Type: image/jpeg
         Edited Blob: Blob {...}

══════════════════════════════════════════════════════════════════
              PRICING SUMMARY
══════════════════════════════════════════════════════════════════

💰 PRICING BREAKDOWN:
   Album Shape: Square
   Base Price: 1000 tk
   Pages: 12 × 100 tk = 1200 tk
   Subtotal: 2200 tk
   Delivery: 0 tk
   Total: 2200 tk

══════════════════════════════════════════════════════════════════
              ALBUM STATISTICS
══════════════════════════════════════════════════════════════════

📊 STATISTICS:
   Total Pages: 12
   Pages with Photos: 10
   Total Images: 24
   Has Cover Image: Yes

══════════════════════════════════════════════════════════════════
```

---

## Edit Features

### User Editing Capabilities
1. **Zoom**
   - Zoom In/Out buttons
   - Range: 0.5x to 3.0x
   - Applied per image slot

2. **Pan (Position)**
   - Click and drag to reposition
   - Tracked as X,Y pixel offsets
   - Applied per image slot

3. **Layout Selection**
   - Choose different layouts per page
   - Automatically adjusts slot count
   - Preserves images when possible

4. **Drag & Drop**
   - Reorder images within a page
   - Swap images between slots
   - Visual feedback during drag

### Transform Data Tracking
- Tracked separately for each image slot
- Only logged if image was edited
- `hasEdits` flag indicates modifications
- Default values: zoom=1, position={x:0, y:0}

---

## Price Calculation

**Total Price** = Base Price + (Page Count × Price Per Page) + Delivery Charge

**Example:**
- Base Album Price: 1000 tk
- Pages: 12 × 100 tk = 1200 tk
- Subtotal: 2200 tk
- Delivery (Online): 0 tk
- **Total: 2200 tk**

**With COD Inside Dhaka:**
- Total would be: 2200 tk + 50 tk = **2250 tk**

---

## Backend Integration Notes

### Cover Image
- Available as File object if uploaded
- Can be string (predefined cover) or null
- Separate from page images

### Raw Images
- Available as original File objects
- Organized by pages and slots
- Preserve original format and quality
- Use for archival or reprocessing

### Edited Images
- Pre-rendered client-side using Canvas API
- Generated only for images with edits
- 800×800px JPEG at 95% quality
- Transformations already applied
- Ready for printing without processing

### Transform Data
- Provided for each edited image
- Allows backend to recreate edits if needed
- Can be ignored if using pre-rendered images

### Album Structure
- Pages array maintains order
- Each page has specific layout
- Empty slots indicated by null
- Layout IDs reference template system

---

## Special Considerations

### Page Management
- Total pages selected upfront
- Not all pages need photos
- Empty pages counted in price
- Pages can have different layouts

### Image Slots
- Each layout has specific slot count
- Slots can be empty (null)
- Images can be moved between slots
- Edits tracked per slot

### Cover Image
- Optional feature
- Can use any uploaded image
- Or select from predefined covers
- Separate from page images

---

**Last Updated:** October 21, 2025
