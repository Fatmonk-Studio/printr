# Print Photo Order - API Specification

## Endpoint
```
POST /api/orders/print-photos
Content-Type: multipart/form-data
```

## Request Fields

### 1. orderData (JSON String)

### 1. orderData (JSON String)

```javascript
{
  // Customer Information
  customer: {
    name: string,                    // Required
    phone: string,                   // Required
    location: string,                // Required
    additionalInfo: string           // Optional (can be empty)
  },

  // Payment Information
  payment: {
    method: "online" | "cod",                              // Required
    deliveryLocation: "inside-dhaka" | "outside-dhaka",    // Required if method="cod"
    deliveryCharge: number                                 // 0 or 50
  },

  // Pricing
  pricing: {
    subtotal: number,
    deliveryCharge: number,
    total: number
  },

  // Photos Array
  photos: [
    {
      id: string,
      originalFileName: string,
      format: "HD matte sticker paper" | 
              "3mm Board HD matte pasted frame" | 
              "5mm Board HD matte pasted frame" | 
              "Premium Framed Print with Glass" | 
              "Premium Framed Print without Glass",
      size: "8.5x4" | "12x18" | "16x24" | "24x36",
      sizeDetails: {
        name: string,
        price: number
      },
      price: number,
      printSpecifications: {
        widthInches: number,
        heightInches: number,
        dpi: number,              // Always 300
        widthPixels: number,
        heightPixels: number
      }
    }
  ],

  // Metadata
  metadata: {
    orderDate: string,             // ISO 8601 format
    totalPhotos: number
  }
}
```

### 2. Image Files

**Field Names:** `photo_0`, `photo_1`, `photo_2`, etc.  
**Format:** JPEG (300 DPI, 95% quality)  
**Processing:** Print-ready, no processing needed

---

## Enums & Constants

### Payment Methods
```javascript
"online"
"cod"
```

### Delivery Locations (for COD)
```javascript
"inside-dhaka"
"outside-dhaka"
```

### Print Formats
```javascript
"HD matte sticker paper"
"3mm Board HD matte pasted frame"
"5mm Board HD matte pasted frame"
"Premium Framed Print with Glass"
"Premium Framed Print without Glass"
```

### Print Sizes
```javascript
"8.5x4"   // 8.5" × 4"   | 250 tk | 2550 × 1200 px
"12x18"   // 12" × 18"   | 350 tk | 3600 × 5400 px
"16x24"   // 16" × 24"   | 500 tk | 4800 × 7200 px
"24x36"   // 24" × 36"   | 1000 tk | 7200 × 10800 px
```

### Delivery Charges
```javascript
Online: 0 tk
COD + inside-dhaka: 50 tk
COD + outside-dhaka: 0 tk
```

---

## Example Request

### FormData
```
orderData: '{"customer":{"name":"John","phone":"+8801712345678"...}}'
photo_0: [JPEG File]
photo_1: [JPEG File]
photo_2: [JPEG File]
```

### Response
```javascript
{
  success: boolean,
  orderId: string,
  message: string,
  totalPhotos: number,
  totalAmount: number
}
```

---

## Notes
- Images are **print-ready** (300 DPI, exact dimensions)
- **No image processing needed** on backend
- Just save files and store metadata
