# Collage Order Data Structure

## Overview
This document shows the exact structure of data submitted for collage orders, including both raw original images and the final edited/rendered collage version.

---

## Console Output Structure

When a collage order is submitted, the following data is logged to the console:

### Complete Order Object

```json
{
  "customer": {
    "name": "Jane Smith",
    "phone": "+8801812345678",
    "location": "456 Park Avenue, Dhaka, Bangladesh",
    "additionalInfo": "Please deliver between 2-4 PM"
  },
  "payment": {
    "method": "cod",
    "deliveryLocation": "inside-dhaka",
    "deliveryCharge": 50
  },
  "collage": {
    "size": "square-large",
    "sizeDetails": {
      "name": "16\" × 16\" Square",
      "price": 1200,
      "width": 500,
      "height": 500
    },
    "shape": "square",
    "layout": "Classic grid",
    "totalPhotos": 4
  },
  "pricing": {
    "subtotal": 1200,
    "deliveryCharge": 50,
    "total": 1250
  },
  "photos": [
    {
      "index": 1,
      "originalFileName": "family_photo.jpg",
      "fileSize": 3456789,
      "fileType": "image/jpeg",
      "hasEdits": true,
      "transformData": {
        "scale": 1.5,
        "positionX": 20,
        "positionY": -15
      }
    },
    {
      "index": 2,
      "originalFileName": "vacation.png",
      "fileSize": 2987654,
      "fileType": "image/png",
      "hasEdits": false
    },
    {
      "index": 3,
      "originalFileName": "birthday.jpg",
      "fileSize": 4123456,
      "fileType": "image/jpeg",
      "hasEdits": true,
      "transformData": {
        "scale": 1.2,
        "positionX": -10,
        "positionY": 5
      }
    },
    {
      "index": 4,
      "originalFileName": "graduation.jpg",
      "fileSize": 3876543,
      "fileType": "image/jpeg",
      "hasEdits": false
    }
  ],
  "metadata": {
    "orderDate": "2025-10-21T10:30:00.000Z",
    "serviceType": "collage"
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

### collage
| Field | Type | Description |
|-------|------|-------------|
| `size` | string | Size ID ("square-small", "square-large", "rectangle-medium", "rectangle-large") |
| `sizeDetails` | object | Detailed size information |
| `sizeDetails.name` | string | Human-readable size |
| `sizeDetails.price` | number | Collage price |
| `sizeDetails.width` | number | Canvas width in pixels |
| `sizeDetails.height` | number | Canvas height in pixels |
| `shape` | string | "square" or "rectangle" |
| `layout` | string | Layout description based on photo count |
| `totalPhotos` | number | Number of photos in collage |

### pricing
| Field | Type | Description |
|-------|------|-------------|
| `subtotal` | number | Collage price |
| `deliveryCharge` | number | Delivery fee |
| `total` | number | Final amount |

### photos[] (Array of Photos)
| Field | Type | Description |
|-------|------|-------------|
| `index` | number | Photo position (1-based) |
| `originalFileName` | string | Original uploaded file name |
| `fileSize` | number | File size in bytes |
| `fileType` | string | MIME type (image/jpeg, image/png, etc.) |
| `hasEdits` | boolean | Whether user edited this photo (zoom/pan) |
| `transformData` | object | Only present if hasEdits=true |
| `transformData.scale` | number | Zoom level (1.0 = no zoom) |
| `transformData.positionX` | number | Horizontal pan offset in pixels |
| `transformData.positionY` | number | Vertical pan offset in pixels |

### metadata
| Field | Type | Description |
|-------|------|-------------|
| `orderDate` | string | ISO 8601 timestamp |
| `serviceType` | string | Always "collage" for collage orders |

---

## Available Options

### Collage Sizes

#### Square Layouts
| Size Code | Dimensions | Price | Canvas Size |
|-----------|------------|-------|-------------|
| "square-small" | 12" × 12" | 800 tk | 400×400px |
| "square-large" | 16" × 16" | 1200 tk | 500×500px |

#### Rectangle Layouts
| Size Code | Dimensions | Price | Canvas Size |
|-----------|------------|-------|-------------|
| "rectangle-medium" | 16" × 12" | 900 tk | 500×375px |
| "rectangle-large" | 20" × 16" | 1500 tk | 600×480px |

### Layout Descriptions by Photo Count
| Photos | Layout Name | Description |
|--------|-------------|-------------|
| 1 | Single spotlight | One large photo |
| 2 | Side-by-side | Two photos side by side |
| 3 | Hero with thumbnails | One large + two small |
| 4 | Classic grid | 2×2 grid |
| 5 | Focal with accents | One large + four small |
| 6 | Magazine style | Dynamic magazine layout |
| 7 | Gallery mix | Mixed sizes gallery |
| 8 | Creative blend | Creative mix of sizes |
| 9 | Story grid | 3×3 perfect grid |
| 10 | Showcase spread | Complex showcase layout |

### Transform Ranges
- **Scale**: 0.5x to 3.0x (50% to 300% zoom)
- **Position**: Unlimited pixel offset (constrained by image bounds)

---

## Image Data

Each collage order includes:

### 1. Raw Images (Original Files)
- All original uploaded image files
- Unmodified, as uploaded by the user
- Full resolution and original format
- Available as File objects in selectedImg array

### 2. Edited Collage (Final Rendered Version)
- Complete rendered collage with all edits applied
- High quality JPEG at 2x scale (double resolution)
- Includes all zoom/pan transformations
- Background color: white (#ffffff)
- Available as Blob object from html2canvas

---

## Example Console Output

```
══════════════════════════════════════════════════════════════════
          COLLAGE ORDER SUBMISSION - COMPLETE DATA
══════════════════════════════════════════════════════════════════

📦 COMPLETE ORDER OBJECT:
{
  "customer": {...},
  "payment": {...},
  "collage": {...},
  "pricing": {...},
  "photos": [...],
  "metadata": {...}
}

══════════════════════════════════════════════════════════════════
              RAW & EDITED IMAGES
══════════════════════════════════════════════════════════════════

📸 RAW IMAGES (Original Files):

   Photo 1:
   Original File: family_photo.jpg
   Size: 3.30 MB
   Type: image/jpeg
   Has Edits: Yes
   Transform Data:
     - Scale: 1.50x
     - Position X: 20px
     - Position Y: -15px
   Raw File Object: File {...}

   Photo 2:
   Original File: vacation.png
   Size: 2.85 MB
   Type: image/png
   Has Edits: No
   Raw File Object: File {...}

   Photo 3:
   Original File: birthday.jpg
   Size: 3.93 MB
   Type: image/jpeg
   Has Edits: Yes
   Transform Data:
     - Scale: 1.20x
     - Position X: -10px
     - Position Y: 5px
   Raw File Object: File {...}

   Photo 4:
   Original File: graduation.jpg
   Size: 3.70 MB
   Type: image/jpeg
   Has Edits: No
   Raw File Object: File {...}

🎨 EDITED COLLAGE (Final Rendered Version):
   Size: 1.85 MB
   Type: image/jpeg
   Resolution: High quality (2x scale)
   Edited Collage Blob: Blob {...}

══════════════════════════════════════════════════════════════════
              PRICING SUMMARY
══════════════════════════════════════════════════════════════════

💰 PRICING BREAKDOWN:
   Collage: 16" × 16" Square
   Subtotal: 1200 tk
   Delivery: 50 tk
   Total: 1250 tk

══════════════════════════════════════════════════════════════════
```

---

## Edit Features

### User Editing Capabilities
1. **Zoom (Scale)**
   - Mouse wheel to zoom in/out
   - Zoom In/Out buttons
   - Range: 0.5x to 3.0x

2. **Pan (Position)**
   - Click and drag to reposition image
   - Unrestricted movement within bounds
   - Tracked as X,Y pixel offsets

3. **Reset**
   - Reset button returns to original state
   - Scale=1.0, Position=(0,0)

4. **Reorder**
   - Drag photos to different positions in layout
   - Maintained in original order in photos array

### Transform Data Tracking
- Automatically tracked for each photo
- Only included in output if photo was edited
- `hasEdits` flag indicates if any transforms applied
- Default values: scale=1, position={x:0, y:0}

---

## Price Calculation

**Total Price** = Collage Size Price + Delivery Charge

**Example:**
- Collage: 16" × 16" Square = 1200 tk
- Delivery (COD inside Dhaka): 50 tk
- **Total: 1250 tk**

---

## Backend Integration Notes

### Raw Images
- Available as original File objects
- Can be sent to backend via FormData
- Preserve original format and quality
- Use for archival or reprocessing

### Edited Collage
- Pre-rendered client-side using html2canvas
- High quality JPEG at 2x resolution
- Ready for printing without further processing
- Includes all user edits and layout

### Transform Data
- Provided for each photo if edited
- Allows backend to recreate edits if needed
- Can be ignored if using pre-rendered collage

---

**Last Updated:** October 21, 2025
