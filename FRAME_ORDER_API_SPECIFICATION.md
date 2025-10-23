# Frame Order - API Data Structure

## Endpoint
```
POST /api/orders/frame-photos
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

  pricing: {
    subtotal: number,
    deliveryCharge: number,
    total: number
  },

  photos: [
    {
      id: string,
      originalFileName: string,
      croppedImageSize: number,
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
      frameType: "classic-wood" | "modern-black" | "elegant-white",
      frameDetails: {
        name: string,
        image: string,
        price: number
      },
      orientation: "horizontal" | "vertical",
      bleedType: "no-bleed" | "small-bleed" | "medium-bleed" | "large-bleed",
      bleedDetails: {
        name: string
      },
      price: number,
      cropData: {
        x: number,
        y: number,
        scale: number
      }
    }
  ],

  metadata: {
    orderDate: string,
    totalPhotos: number,
    serviceType: "frame"
  }
}
```

## Image Files (Cropped)
```
photo_0: JPEG File (cropped based on user selection)
photo_1: JPEG File (cropped based on user selection)
photo_2: JPEG File (cropped based on user selection)
...
```

## Print Sizes & Prices
```
"8.5x4"  → 8.5" × 4"   | 250 tk
"12x18"  → 12" × 18"   | 350 tk
"16x24"  → 16" × 24"   | 500 tk
"24x36"  → 24" × 36"   | 1000 tk
```

## Frame Types & Prices
```
"classic-wood"   → Classic Wood   | 150 tk
"modern-black"   → Modern Black   | 200 tk
"elegant-white"  → Elegant White  | 175 tk
```

## Bleed Options
```
"no-bleed"      → No Bleed
"small-bleed"   → Small Bleed
"medium-bleed"  → Medium Bleed
"large-bleed"   → Large Bleed
```

## Delivery Charges
```
online: 0 tk
cod + inside-dhaka: 50 tk
cod + outside-dhaka: 0 tk
```

## Price Calculation
```
Total Price = (Print Size Price + Frame Price) × Number of Photos + Delivery Charge

Example:
Photo 1: 350 tk (12x18) + 150 tk (Classic Wood) = 500 tk
Photo 2: 500 tk (16x24) + 200 tk (Modern Black) = 700 tk
Subtotal: 1200 tk
Delivery (COD inside Dhaka): 50 tk
Total: 1250 tk
```
