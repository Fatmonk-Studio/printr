# Complete Order Submission Structure

## Overview
This document shows the exact structure of data sent from the frontend to the backend API.

---

## FormData Structure

The request uses `multipart/form-data` with the following fields:

```
FormData {
  orderData: "<JSON STRING - see below>",
  photo_0: <File: print_1_vacation_photo.jpg>,
  photo_1: <File: print_2_family_portrait.jpg>,
  photo_2: <File: print_3_landscape.jpg>
}
```

---

## orderData JSON (Complete Example)

This is sent as a **single JSON string** in the `orderData` field:

```json
{
  "customer": {
    "name": "John Doe",
    "phone": "+8801712345678",
    "location": "123 Main Street, Dhaka, Bangladesh",
    "additionalInfo": "Please call before delivery. Gate code: 1234"
  },
  "payment": {
    "method": "cod",
    "deliveryLocation": "inside-dhaka",
    "deliveryCharge": 50
  },
  "pricing": {
    "subtotal": 700,
    "deliveryCharge": 50,
    "total": 750
  },
  "photos": [
    {
      "id": "abc123xyz789",
      "originalFileName": "vacation_photo.jpg",
      "format": "HD matte sticker paper",
      "size": "12x18",
      "sizeDetails": {
        "name": "12\" x 18\" - Medium",
        "price": 350
      },
      "price": 350,
      "printSpecifications": {
        "widthInches": 12,
        "heightInches": 18,
        "dpi": 300,
        "widthPixels": 3600,
        "heightPixels": 5400
      }
    },
    {
      "id": "def456uvw012",
      "originalFileName": "family_portrait.png",
      "format": "Premium Framed Print with Glass",
      "size": "16x24",
      "sizeDetails": {
        "name": "16\" x 24\" - Large",
        "price": 500
      },
      "price": 500,
      "printSpecifications": {
        "widthInches": 16,
        "heightInches": 24,
        "dpi": 300,
        "widthPixels": 4800,
        "heightPixels": 7200
      }
    },
    {
      "id": "ghi789rst345",
      "originalFileName": "landscape.jpg",
      "format": "5mm Board HD matte pasted frame",
      "size": "24x36",
      "sizeDetails": {
        "name": "24\" x 36\" - Extra Large",
        "price": 1000
      },
      "price": 1000,
      "printSpecifications": {
        "widthInches": 24,
        "heightInches": 36,
        "dpi": 300,
        "widthPixels": 7200,
        "heightPixels": 10800
      }
    }
  ],
  "metadata": {
    "orderDate": "2025-10-19T14:30:00.000Z",
    "totalPhotos": 3
  }
}
```

---

## Field Descriptions

### customer
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | Yes | Customer's full name | "John Doe" |
| `phone` | string | Yes | Contact phone number | "+8801712345678" |
| `location` | string | Yes | Delivery address | "123 Main Street, Dhaka" |
| `additionalInfo` | string | No | Special delivery instructions | "Call before delivery" |

### payment
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `method` | string | Yes | Payment method | "online" or "cod" |
| `deliveryLocation` | string | Conditional | Required if method is "cod" | "inside-dhaka" or "outside-dhaka" |
| `deliveryCharge` | number | Yes | Delivery fee in taka | 0 or 50 |

### pricing
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `subtotal` | number | Sum of all photo prices | 700 |
| `deliveryCharge` | number | Delivery fee | 50 |
| `total` | number | Final amount (subtotal + delivery) | 750 |

### photos[] (Array)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique photo identifier | "abc123xyz789" |
| `originalFileName` | string | Original uploaded file name | "vacation_photo.jpg" |
| `format` | string | Print format selected | "HD matte sticker paper" |
| `size` | string | Print size code | "12x18" |
| `sizeDetails.name` | string | Human-readable size | "12\" x 18\" - Medium" |
| `sizeDetails.price` | number | Price for this size | 350 |
| `price` | number | Total price for this photo | 350 |
| `printSpecifications.widthInches` | number | Print width in inches | 12 |
| `printSpecifications.heightInches` | number | Print height in inches | 18 |
| `printSpecifications.dpi` | number | Resolution (always 300) | 300 |
| `printSpecifications.widthPixels` | number | Exact pixel width | 3600 |
| `printSpecifications.heightPixels` | number | Exact pixel height | 5400 |

### metadata
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `orderDate` | string | ISO 8601 timestamp | "2025-10-19T14:30:00.000Z" |
| `totalPhotos` | number | Total number of photos | 3 |

---

## Photo Files

Files are sent with keys matching their array index:
- `photo_0` → corresponds to `photos[0]`
- `photo_1` → corresponds to `photos[1]`
- `photo_2` → corresponds to `photos[2]`

### File Properties
- **Format**: JPEG (image/jpeg)
- **Quality**: 95%
- **Resolution**: 300 DPI
- **Dimensions**: Exact print size (e.g., 3600×5400px for 12"×18")
- **Status**: ✅ Ready to print (no processing needed)

---

## Backend Parsing Example (Node.js)

```javascript
app.post('/api/orders/print-photos', upload.any(), async (req, res) => {
  // 1. Parse JSON
  const orderData = JSON.parse(req.body.orderData);
  
  // 2. Access customer info
  console.log(orderData.customer.name);      // "John Doe"
  console.log(orderData.payment.method);     // "cod"
  console.log(orderData.pricing.total);      // 750
  
  // 3. Loop through photos
  for (let i = 0; i < orderData.photos.length; i++) {
    const photoMeta = orderData.photos[i];
    const photoFile = req.files.find(f => f.fieldname === `photo_${i}`);
    
    console.log(`Photo ${i + 1}:`);
    console.log(`  Original: ${photoMeta.originalFileName}`);
    console.log(`  Size: ${photoMeta.size}`);
    console.log(`  Format: ${photoMeta.format}`);
    console.log(`  Price: ${photoMeta.price} tk`);
    console.log(`  Resolution: ${photoMeta.printSpecifications.widthPixels}×${photoMeta.printSpecifications.heightPixels}px`);
    
    // Save the file
    // await saveFile(photoFile, photoMeta);
  }
});
```

---

## Available Print Formats

1. **"HD matte sticker paper"**
2. **"3mm Board HD matte pasted frame"**
3. **"5mm Board HD matte pasted frame"**
4. **"Premium Framed Print with Glass"**
5. **"Premium Framed Print without Glass"**

---

## Available Print Sizes

| Size Code | Dimensions | Pixels @ 300 DPI | Price |
|-----------|------------|------------------|-------|
| "8.5x4" | 8.5" × 4" | 2550 × 1200 | 250 tk |
| "12x18" | 12" × 18" | 3600 × 5400 | 350 tk |
| "16x24" | 16" × 24" | 4800 × 7200 | 500 tk |
| "24x36" | 24" × 36" | 7200 × 10800 | 1000 tk |

---

## Payment Methods

### Online Payment
```json
{
  "payment": {
    "method": "online",
    "deliveryLocation": null,
    "deliveryCharge": 0
  }
}
```

### Cash on Delivery (Inside Dhaka)
```json
{
  "payment": {
    "method": "cod",
    "deliveryLocation": "inside-dhaka",
    "deliveryCharge": 50
  }
}
```

### Cash on Delivery (Outside Dhaka)
```json
{
  "payment": {
    "method": "cod",
    "deliveryLocation": "outside-dhaka",
    "deliveryCharge": 0
  }
}
```

---

## Complete cURL Example

```bash
curl -X POST http://localhost:3000/api/orders/print-photos \
  -F 'orderData={"customer":{"name":"John Doe","phone":"+8801712345678","location":"Dhaka"},"payment":{"method":"cod","deliveryLocation":"inside-dhaka","deliveryCharge":50},"pricing":{"subtotal":350,"deliveryCharge":50,"total":400},"photos":[{"id":"abc123","originalFileName":"photo.jpg","format":"HD matte sticker paper","size":"12x18","sizeDetails":{"name":"12\" x 18\" - Medium","price":350},"price":350,"printSpecifications":{"widthInches":12,"heightInches":18,"dpi":300,"widthPixels":3600,"heightPixels":5400}}],"metadata":{"orderDate":"2025-10-19T14:30:00.000Z","totalPhotos":1}}' \
  -F 'photo_0=@/path/to/print_ready_photo.jpg'
```

---

## Expected Response

```json
{
  "success": true,
  "orderId": "ORD-1729348200123",
  "message": "Order received successfully",
  "totalPhotos": 3,
  "totalAmount": 750,
  "photos": [
    {
      "photoId": "abc123xyz789",
      "savedPath": "prints/ORD-1729348200123/photo_1.jpg",
      "readyForPrint": true
    },
    {
      "photoId": "def456uvw012",
      "savedPath": "prints/ORD-1729348200123/photo_2.jpg",
      "readyForPrint": true
    },
    {
      "photoId": "ghi789rst345",
      "savedPath": "prints/ORD-1729348200123/photo_3.jpg",
      "readyForPrint": true
    }
  ]
}
```

---

**Last Updated:** October 19, 2025
