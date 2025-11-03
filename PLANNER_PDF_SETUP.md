# Planner PDF Setup Guide

## Multiple Planner Options Available

The Planner service now supports **multiple PDF options** with different prices:
- **Premium Planner** - 1200 BDT
- **Basic Planner** - 1000 BDT

Users can select, preview, and order any planner option.

## How to Configure Your Google Drive PDF Links

### Step 1: Upload Both PDFs to Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Upload your planner PDF files (Premium and Basic)
3. For **each file**, right-click and select **"Get link"**
4. Set permissions to **"Anyone with the link can view"**
5. Copy the links - they will look like:
   ```
   Premium: https://drive.google.com/file/d/1ABcDeFgHiJkLmNoPqRsTuVwXyZ/view?usp=sharing
   Basic: https://drive.google.com/file/d/2XyZwVuTsRqPoNmLkJiHgFeDcBa/view?usp=sharing
   ```

### Step 2: Extract the File IDs

From each link, extract the FILE_ID part (the long string between `/d/` and `/view`):
```
Premium File ID: 1ABcDeFgHiJkLmNoPqRsTuVwXyZ
Basic File ID: 2XyZwVuTsRqPoNmLkJiHgFeDcBa
```

### Step 3: Update PlannerFlow.tsx

Open `/src/components/PlannerFlow.tsx` and find the `PLANNER_OPTIONS` array (lines 18-50).

Replace `YOUR_FILE_ID_1` and `YOUR_FILE_ID_2` with your actual File IDs:

```typescript
const PLANNER_OPTIONS: PlannerOption[] = [
  {
    id: "planner-premium",
    name: "Premium Planner",
    description: "Complete year planner with premium design and features",
    price: 1200,
    pdfUrl: "https://drive.google.com/file/d/1ABcDeFgHiJkLmNoPqRsTuVwXyZ/preview",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1ABcDeFgHiJkLmNoPqRsTuVwXyZ",
    features: [
      "Monthly and weekly planning pages",
      "Goal setting and tracking sections",
      "Habit trackers and notes pages",
      "Premium quality paper",
      "Elegant cover design",
    ],
  },
  {
    id: "planner-basic",
    name: "Basic Planner",
    description: "Essential planner with all the key features you need",
    price: 1000,
    pdfUrl: "https://drive.google.com/file/d/2XyZwVuTsRqPoNmLkJiHgFeDcBa/preview",
    downloadUrl: "https://drive.google.com/uc?export=download&id=2XyZwVuTsRqPoNmLkJiHgFeDcBa",
    features: [
      "Monthly planning pages",
      "Weekly overview sections",
      "Note pages included",
      "Clean and simple design",
    ],
  },
];

### Step 4: Test the Integration

1. Save the file
2. Run `npm run dev` to start the development server
3. Click on "Planner" from the services
4. You should see **both planner options** displayed side by side
5. Test for each planner:
   - **Preview** button (shows embedded PDF in the card)
   - **Download** button (downloads the PDF)
   - **Select** button (marks as selected with checkmark)
6. After selecting a planner, click "Order Now" to proceed to checkout

## User Experience Flow

1. **Browse Planners**: See both Premium (1200 BDT) and Basic (1000 BDT) options
2. **Compare Features**: Each planner lists its unique features
3. **Preview PDFs**: Click preview to see embedded PDF viewer for each option
4. **Download Samples**: Users can download the PDFs before purchasing
5. **Select & Order**: Choose preferred planner and proceed to checkout
6. **Contact Form**: Fill in details with the selected planner's price shown
7. **Submit Order**: Order sent to API with planner name, price, and PDF URL

## Important Notes

### PDF Embedding
- The PDF will be embedded using Google Drive's preview mode
- Users can view the PDF directly in the browser
- If the preview doesn't load, users can still download the PDF

### API Integration
- The planner order uses `service_id: '5'` (you may need to adjust this based on your API)
- Order submission includes:
  - `planner_name`: Name of selected planner (e.g., "Premium Planner")
  - `planner_price`: Price in BDT (e.g., "1200")
  - `planner_pdf_url`: Google Drive preview URL
  - `product_type`: 'planner'
- All standard contact form fields are collected

## Features Included

✅ Multiple planner options with different prices
✅ Side-by-side comparison layout
✅ Individual PDF preview for each option
✅ Direct download buttons
✅ Visual selection indicator (checkmark)
✅ Same contact form as other services
✅ Price display in order summary
✅ Order submission to your API
✅ Mobile responsive design
✅ Feature list for each planner
✅ Smooth integration with existing flows

## Customization Options

You can customize the following in `PlannerFlow.tsx`:

### Adding More Planner Options
Simply add more objects to the `PLANNER_OPTIONS` array:

```typescript
{
  id: "planner-deluxe",
  name: "Deluxe Planner",
  description: "Ultimate planner with all premium features",
  price: 1500,
  pdfUrl: "https://drive.google.com/file/d/YOUR_FILE_ID_3/preview",
  downloadUrl: "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID_3",
  features: [
    "Everything in Premium",
    "Extra note sections",
    "Goal worksheets",
    "Luxury binding",
  ],
},
```

### Adjusting Prices
Change the `price` value in each planner option (lines 23, 37, etc.)

### Modifying Features
Update the `features` array for each planner to list different benefits

### Changing Service ID
Line 94 - change `'5'` to match your API's service ID for planners

### PDF iframe height
Line 260 - adjust `h-[400px]` to your preference for the preview size

## Testing Checklist

- [ ] Both PDFs preview correctly
- [ ] Download buttons work for both planners
- [ ] Selection works (checkmark appears)
- [ ] Can switch between planner selections
- [ ] Order button disabled until planner selected
- [ ] Contact form shows correct planner name and price
- [ ] Order submits successfully to API
- [ ] Order appears in admin panel with planner details
- [ ] Mobile view is responsive
- [ ] Toast notifications display properly

---

**Need Help?** Check the other flow components (FrameFlow.tsx, PrintPhotoFlow.tsx) for reference on similar patterns.
