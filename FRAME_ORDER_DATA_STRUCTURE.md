# Frame Order Data Structure

## Overview
This document shows the exact structure of data submitted for frame orders, including cropped images and frame selections.

---

## Console Output Structure

When a frame order is submitted, the following data is logged to the console:

### Complete Order Object

```json
{
  "customer": {
    "name": "John Doe",
    "phone": "+8801712345678",
    "location": "123 Main Street, Dhaka, Bangladesh",
    "additionalInfo": "Please call before delivery"
  },
  "payment": {
    "method": "cod",
    "deliveryLocation": "inside-dhaka",
    "deliveryCharge": 50
  },
  "pricing": {
    "subtotal": 850,
    "deliveryCharge": 50,
    "total": 900
  },
  "photos": [
    {
      "id": "abc123xyz",
      "originalFileName": "family_photo.jpg",
      "croppedImageSize": 2456789,
      "format": "Premium Framed Print with Glass",
      "size": "12x18",
      "sizeDetails": {
        "name": "12\" x 18\" - Medium",
        "price": 350
      },
      "frameType": "classic-wood",
      "frameDetails": {
        "name": "Classic Wood",
        "image": "/src/assets/frames/classic-wood.png",
        "price": 150
      },
      "orientation": "horizontal",
      "bleedType": "no-bleed",
      "bleedDetails": {
        "name": "No Bleed"
      },
      "price": 500,
      "cropData": {
        "x": 0,
        "y": 0,
        "scale": 1
      },
      "croppedImageFile": "Cropped JPEG Blob (2.34 MB)"
    },
    {
      "id": "def456uvw",
      "originalFileName": "landscape.png",
      "croppedImageSize": 3123456,
      "format": "5mm Board HD matte pasted frame",
      "size": "16x24",
      "sizeDetails": {
        "name": "16\" x 24\" - Large",
        "price": 500
      },
      "frameType": "modern-black",
      "frameDetails": {
        "name": "Modern Black",
        "image": "/src/assets/frames/modern-black.png",
        "price": 200
      },
      "orientation": "vertical",
      "bleedType": "small-bleed",
      "bleedDetails": {
        "name": "Small Bleed"
      },
      "price": 700,
      "cropData": {
        "x": 15,
        "y": -20,
        "scale": 1.3
      },
      "croppedImageFile": "Cropped JPEG Blob (2.98 MB)"
    }
  ],
  "metadata": {
    "orderDate": "2025-10-21T10:30:00.000Z",
    "totalPhotos": 2,
    "serviceType": "frame"
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

### pricing
| Field | Type | Description |
|-------|------|-------------|
| `subtotal` | number | Sum of all photos (print + frame prices) |
| `deliveryCharge` | number | Delivery fee |
| `total` | number | Final amount |

### photos[] (Array of Framed Photos)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique photo identifier |
| `originalFileName` | string | Original uploaded file name |
| `croppedImageSize` | number | Size of cropped image blob in bytes |
| `croppedImageFile` | string | Description of the blob file |
| `format` | string | Print format (HD matte, 3mm Board, etc.) |
| `size` | string | Print size ("12x18", "16x24", etc.) |
| `sizeDetails.name` | string | Human-readable size |
| `sizeDetails.price` | number | Print price |
| `frameType` | string | Frame ID ("classic-wood", "modern-black", "elegant-white") |
| `frameDetails.name` | string | Frame display name |
| `frameDetails.image` | string | Frame preview image path |
| `frameDetails.price` | number | Frame price |
| `orientation` | string | "horizontal" or "vertical" |
| `bleedType` | string | Bleed option selected |
| `bleedDetails.name` | string | Human-readable bleed name |
| `price` | number | Total for this photo (print + frame) |
| `cropData.x` | number | Horizontal crop offset |
| `cropData.y` | number | Vertical crop offset |
| `cropData.scale` | number | Zoom level |

### metadata
| Field | Type | Description |
|-------|------|-------------|
| `orderDate` | string | ISO 8601 timestamp |
| `totalPhotos` | number | Total number of framed photos |
| `serviceType` | string | Always "frame" for frame orders |

---

## Available Options

### Print Formats
1. "HD matte sticker paper"
2. "3mm Board HD matte pasted frame"
3. "5mm Board HD matte pasted frame"
4. "Premium Framed Print with Glass"
5. "Premium Framed Print without Glass"

### Print Sizes
| Size Code | Dimensions | Print Price |
|-----------|------------|-------------|
| "8.5x4" | 8.5" × 4" | 250 tk |
| "12x18" | 12" × 18" | 350 tk |
| "16x24" | 16" × 24" | 500 tk |
| "24x36" | 24" × 36" | 1000 tk |

### Frame Types
| Frame ID | Name | Price |
|----------|------|-------|
| "classic-wood" | Classic Wood | 150 tk |
| "modern-black" | Modern Black | 200 tk |
| "elegant-white" | Elegant White | 175 tk |

### Bleed Options
| Bleed ID | Name |
|----------|------|
| "no-bleed" | No Bleed |
| "small-bleed" | Small Bleed |
| "medium-bleed" | Medium Bleed |
| "large-bleed" | Large Bleed |

### Orientations
- "horizontal" - Landscape orientation
- "vertical" - Portrait orientation

---

## Image Data

Each photo includes:
- **Raw cropped image blob** - JPEG format at 95% quality
- **Exact cropped area** - Based on user's crop/zoom settings
- **Frame selection** - Frame type and price included

The `croppedImageBlob` is available in the `processedPhotos` array (not serialized in JSON).

---

## Example Console Output

```
╔═══════════════════════════════════════════════════════════════╗
║          FRAME ORDER SUBMISSION - COMPLETE DATA               ║
╚═══════════════════════════════════════════════════════════════╝

📦 COMPLETE ORDER OBJECT:
{
  "customer": {...},
  "payment": {...},
  "pricing": {...},
  "photos": [...],
  "metadata": {...}
}

╔═══════════════════════════════════════════════════════════════╗
║              CROPPED IMAGES & FRAME DETAILS                   ║
╚═══════════════════════════════════════════════════════════════╝

🖼️  Photo 1:
   Original: family_photo.jpg
   Cropped Size: 2.34 MB
   Print Format: Premium Framed Print with Glass
   Print Size: 12" x 18" - Medium
   Frame: Classic Wood (150 tk)
   Orientation: horizontal
   Bleed: No Bleed
   Print Price: 350 tk
   Total Price: 500 tk
   Crop Data: Scale=1, X=0, Y=0

🖼️  Photo 2:
   Original: landscape.png
   Cropped Size: 2.98 MB
   Print Format: 5mm Board HD matte pasted frame
   Print Size: 16" x 24" - Large
   Frame: Modern Black (200 tk)
   Orientation: vertical
   Bleed: Small Bleed
   Print Price: 500 tk
   Total Price: 700 tk
   Crop Data: Scale=1.3, X=15, Y=-20

💰 PRICING SUMMARY:
   Subtotal: 1200 tk
   Delivery: 50 tk
   Total: 1250 tk
```

---

## Price Calculation

**Total Price** = (Print Price + Frame Price) × Number of Photos + Delivery Charge

**Example:**
- Photo 1: 350 tk (print) + 150 tk (frame) = 500 tk
- Photo 2: 500 tk (print) + 200 tk (frame) = 700 tk
- Subtotal: 1200 tk
- Delivery (COD inside Dhaka): 50 tk
- **Total: 1250 tk**

---

**Last Updated:** October 21, 2025
