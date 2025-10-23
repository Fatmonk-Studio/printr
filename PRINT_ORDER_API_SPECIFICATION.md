# Print Order API Specification

## Overview
This document describes the API endpoint structure for receiving print photo orders from the frontend application.

**✅ IMPORTANT: Images are PRINT-READY - No processing needed!**

The frontend application processes all images (cropping, scaling, sizing) and sends them at the exact dimensions and resolution needed for printing. The backend simply needs to save the files.

---

## Endpoint

```
POST /api/orders/print-photos
```

**Content-Type:** `multipart/form-data`

---

## Request Structure

### Single Unified Object Approach
All order metadata is sent as **one JSON string** in the `orderData` field, with raw image files sent separately but indexed to match the order data.

### FormData Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `orderData` | JSON String | Complete order information (see structure below) |
| `photo_0` | File | First raw image file |
| `photo_1` | File | Second raw image file |
| `photo_n` | File | nth raw image file |

---

## orderData JSON Structure

```json
{
  "customer": {
    "name": "John Doe",
    "phone": "+8801712345678",
    "location": "123 Main St, Dhaka",
    "additionalInfo": "Please call before delivery"
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
      "id": "abc123xyz",
      "fileName": "vacation.jpg",
      "fileSize": 8845632,
      "fileType": "image/jpeg",
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
        "targetWidthPixels": 3600,
        "targetHeightPixels": 5400
      },
      "transformations": {
        "offsetX": 20,
        "offsetY": -15,
        "scale": 1.5
      }
    },
    {
      "id": "def456uvw",
      "fileName": "family.png",
      "fileSize": 12456789,
      "fileType": "image/png",
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
        "targetWidthPixels": 4800,
        "targetHeightPixels": 7200
      },
      "transformations": {
        "offsetX": 0,
        "offsetY": 10,
        "scale": 1.0
      }
    }
  ],
  "metadata": {
    "orderDate": "2025-10-19T14:30:00.000Z",
    "totalPhotos": 2
  }
}
```

---

## Field Definitions

### customer
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Customer's full name |
| `phone` | string | Yes | Contact phone number |
| `location` | string | Yes | Delivery address |
| `additionalInfo` | string | No | Special instructions or notes |

### payment
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | string | Yes | `"online"` or `"cod"` |
| `deliveryLocation` | string | Conditional | `"inside-dhaka"` or `"outside-dhaka"` (required if method is "cod") |
| `deliveryCharge` | number | Yes | Delivery charge in taka (0 or 50) |

### pricing
| Field | Type | Description |
|-------|------|-------------|
| `subtotal` | number | Sum of all photo prices |
| `deliveryCharge` | number | Delivery fee (0 or 50 tk) |
| `total` | number | Final amount to be paid |

### photos[] (Array)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for this photo |
| `fileName` | string | Original file name |
| `fileSize` | number | File size in bytes |
| `fileType` | string | MIME type (e.g., "image/jpeg") |
| `format` | string | Print format selected by customer |
| `size` | string | Print size (e.g., "12x18") |
| `sizeDetails.name` | string | Human-readable size name |
| `sizeDetails.price` | number | Price for this size |
| `price` | number | Price for this photo |
| `printSpecifications.widthInches` | number | Target print width in inches |
| `printSpecifications.heightInches` | number | Target print height in inches |
| `printSpecifications.dpi` | number | Resolution (always 300) |
| `printSpecifications.targetWidthPixels` | number | Target width in pixels (width × DPI) |
| `printSpecifications.targetHeightPixels` | number | Target height in pixels (height × DPI) |
| `transformations.offsetX` | number | Horizontal pan/crop offset |
| `transformations.offsetY` | number | Vertical pan/crop offset |
| `transformations.scale` | number | Zoom level (1.0 = 100%) |

### metadata
| Field | Type | Description |
|-------|------|-------------|
| `orderDate` | string | ISO 8601 timestamp |
| `totalPhotos` | number | Total number of photos in order |

---

## Image Files

Raw high-resolution image files are sent with keys `photo_0`, `photo_1`, etc., corresponding to the index in the `photos` array.

**Example:**
- `orderData.photos[0]` metadata → `photo_0` file
- `orderData.photos[1]` metadata → `photo_1` file

---

## Backend Processing Steps (SIMPLIFIED!)

✅ **No image processing required!** Files are already print-ready.

1. **Parse `orderData` JSON** from the request
2. **For each photo file** (`photo_0`, `photo_1`, etc.):
   - **Save the file** to your storage system (local disk, S3, etc.)
   - Files are already at the correct dimensions and DPI for printing
   - No cropping, scaling, or resizing needed
3. **Store order information** in your database
4. **(Optional) Send confirmation** email/SMS to customer
5. **Return** success response with order ID

**That's it!** The files you receive are ready to send directly to the printer.

---

## Expected Response

```json
{
  "success": true,
  "orderId": "ORD-1729348200123",
  "message": "Order processed successfully",
  "processedPhotos": 2,
  "totalAmount": 750
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Detailed error information"
}
```

---

## Example Implementation (Node.js + Express + Multer)

**✅ SIMPLE VERSION - No image processing libraries needed!**

```javascript
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const upload = multer({ dest: 'temp_uploads/' });
const app = express();

app.post('/api/orders/print-photos', 
  upload.any(), // Accept all files
  async (req, res) => {
    try {
      // 1. Parse the complete order data
      const orderData = JSON.parse(req.body.orderData);
      
      console.log('📦 Order received:', {
        customer: orderData.customer.name,
        totalPhotos: orderData.metadata.totalPhotos,
        totalAmount: orderData.pricing.total + ' tk',
      });
      
      // 2. Simply save the print-ready files (NO PROCESSING NEEDED!)
      const savedPhotos = [];
      const orderId = 'ORD-' + Date.now();
      const printDir = path.join(__dirname, 'prints', orderId);
      
      // Create directory for this order
      await fs.mkdir(printDir, { recursive: true });
      
      for (let i = 0; i < orderData.photos.length; i++) {
        const photoMeta = orderData.photos[i];
        const photoFile = req.files.find(f => f.fieldname === `photo_${i}`);
        
        if (!photoFile) {
          throw new Error(`Missing file for photo ${i}`);
        }
        
        // ✅ Files are already print-ready - just save them!
        const fileName = `photo_${i + 1}_${photoMeta.size}_${photoMeta.format.replace(/\s+/g, '_')}.jpg`;
        const destPath = path.join(printDir, fileName);
        
        // Move file to permanent storage
        await fs.rename(photoFile.path, destPath);
        
        savedPhotos.push({
          photoId: photoMeta.id,
          originalName: photoMeta.originalFileName,
          savedPath: destPath,
          printSize: photoMeta.size,
          format: photoMeta.format,
          price: photoMeta.price,
          resolution: `${photoMeta.printSpecifications.widthPixels}×${photoMeta.printSpecifications.heightPixels}px @ ${photoMeta.printSpecifications.dpi} DPI`,
          readyForPrint: true,
        });
        
        console.log(`✅ Saved: ${fileName} (Ready for print)`);
      }
      
      // 3. Save order to database (pseudo-code)
      // const order = await db.orders.create({
      //   orderId,
      //   customer: orderData.customer,
      //   payment: orderData.payment,
      //   pricing: orderData.pricing,
      //   photos: savedPhotos,
      //   status: 'pending',
      //   createdAt: new Date(),
      // });
      
      // 4. (Optional) Send confirmation email/SMS
      // await sendOrderConfirmation(orderData.customer, orderId);
      
      // 5. Send success response
      res.json({
        success: true,
        orderId: orderId,
        message: 'Order received successfully',
        totalPhotos: savedPhotos.length,
        totalAmount: orderData.pricing.total,
        photos: savedPhotos,
      });
      
      console.log(`✅ Order ${orderId} processed successfully`);
      
    } catch (error) {
      console.error('❌ Order processing error:', error);
      
      // Cleanup temp files on error
      if (req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process order',
        error: error.message 
      });
    }
  }
);

app.listen(3000, () => {
  console.log('✅ Print API server running on port 3000');
});
```

---

## Example cURL Request

```bash
curl -X POST http://localhost:3000/api/orders/print-photos \
  -F "orderData={\"customer\":{\"name\":\"John Doe\",\"phone\":\"+8801712345678\",\"location\":\"Dhaka\"},\"payment\":{\"method\":\"cod\",\"deliveryCharge\":50},\"pricing\":{\"total\":750},\"photos\":[{\"id\":\"abc123\",\"fileName\":\"photo.jpg\",\"format\":\"HD matte sticker paper\",\"size\":\"12x18\",\"printSpecifications\":{\"targetWidthPixels\":3600,\"targetHeightPixels\":5400,\"dpi\":300},\"transformations\":{\"scale\":1.5,\"offsetX\":0,\"offsetY\":0}}],\"metadata\":{\"orderDate\":\"2025-10-19T14:30:00.000Z\",\"totalPhotos\":1}}" \
  -F "photo_0=@/path/to/photo.jpg"
```

---

## Notes for Backend Developer

### ✅ What You Receive
- **Print-ready JPEG files** at exact dimensions for printing
- **300 DPI** resolution already set
- **High quality** (95% JPEG quality)
- **Correct aspect ratio** and cropping applied

### 🔧 What You Need To Do
1. **Save the files** to your storage system
2. **Store order metadata** in database
3. **Generate order confirmation**
4. **Send files to printer** when ready

### 🚫 What You DON'T Need To Do
- ❌ Image resizing
- ❌ Cropping or transformations
- ❌ DPI conversion
- ❌ Quality adjustments
- ❌ Format conversion

### 💡 Implementation Tips

1. **File Storage**: 
   - Organize by order ID: `prints/{orderId}/photo_1.jpg`
   - Consider cloud storage (S3, Google Cloud Storage) for scalability

2. **File Validation**: 
   - Validate MIME type is `image/jpeg`
   - Check file size is reasonable (< 50MB per file)
   - Verify file count matches `orderData.metadata.totalPhotos`

3. **Security**: 
   - Sanitize file names
   - Use unique order IDs to prevent collisions
   - Implement rate limiting on the endpoint

4. **Database Schema Example**:
```sql
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_location TEXT,
  payment_method VARCHAR(20),
  delivery_location VARCHAR(50),
  total_amount DECIMAL(10,2),
  status VARCHAR(20),
  created_at TIMESTAMP,
  ...
);

CREATE TABLE order_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50),
  photo_id VARCHAR(50),
  file_path VARCHAR(500),
  print_format VARCHAR(100),
  print_size VARCHAR(20),
  price DECIMAL(10,2),
  ready_for_print BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

5. **Error Handling**: 
   - Return clear error messages
   - Clean up temp files on errors
   - Log all processing steps

6. **Order Tracking**: 
   - Send order confirmation with tracking ID
   - Provide status updates (received, printing, shipped, delivered)

---

## Support

For questions or clarifications, please contact the frontend development team.

**Last Updated:** October 19, 2025
