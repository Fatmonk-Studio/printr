# Planner PDF Setup Guide

## How to Configure Your Google Drive PDF Link

To enable the Planner feature with your PDF preview, follow these steps:

### Step 1: Upload PDF to Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Upload your planner PDF file
3. Right-click on the uploaded file and select **"Get link"**
4. Set permissions to **"Anyone with the link can view"**
5. Copy the link - it will look like:
   ```
   https://drive.google.com/file/d/1ABcDeFgHiJkLmNoPqRsTuVwXyZ/view?usp=sharing
   ```

### Step 2: Extract the File ID

From the link above, extract the FILE_ID part (the long string between `/d/` and `/view`):
```
1ABcDeFgHiJkLmNoPqRsTuVwXyZ
```

### Step 3: Update PlannerFlow.tsx

Open `/src/components/PlannerFlow.tsx` and replace the placeholder links:

```typescript
// Line 8-9: Replace with your actual File ID
const PLANNER_PDF_URL = "https://drive.google.com/file/d/YOUR_FILE_ID_HERE/preview";
const PLANNER_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID_HERE";
```

**Example with real File ID:**
```typescript
const PLANNER_PDF_URL = "https://drive.google.com/file/d/1ABcDeFgHiJkLmNoPqRsTuVwXyZ/preview";
const PLANNER_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=1ABcDeFgHiJkLmNoPqRsTuVwXyZ";
```

### Step 4: Test the Integration

1. Save the file
2. Run `npm run dev` to start the development server
3. Click on "Planner" from the services
4. Test both:
   - **Preview PDF** button (should show embedded PDF)
   - **Download Preview** button (should download the PDF)

## Important Notes

### PDF Embedding
- The PDF will be embedded using Google Drive's preview mode
- Users can view the PDF directly in the browser
- If the preview doesn't load, users can still download the PDF

### API Integration
- The planner order uses `service_id: '5'` (you may need to adjust this based on your API)
- The PDF URL is sent along with the order submission
- All standard contact form fields are collected

### Fallback Option
If Google Drive embedding doesn't work well, you can also:
1. Host the PDF on your own server
2. Update both URLs to point to your server
3. Example: `const PLANNER_PDF_URL = "https://admin.printr.store/uploads/planner.pdf";`

## Features Included

✅ PDF Preview in embedded iframe
✅ Direct download button
✅ Same contact form as other services
✅ Order submission to your API
✅ Mobile responsive design
✅ Feature list and product details
✅ Smooth integration with existing flows

## Customization Options

You can customize the following in `PlannerFlow.tsx`:

- **Pricing**: Currently set to "Contact for pricing" - you can add actual price
- **Service ID**: Line 31 - change `'5'` to match your API's service ID for planners
- **Product Details**: Lines 164-181 - update format, pages, customization details
- **Features List**: Lines 187-207 - add/remove features as needed
- **PDF iframe height**: Line 157 - adjust `h-[600px]` to your preference

## Testing Checklist

- [ ] PDF preview loads correctly
- [ ] Download button works
- [ ] Contact form submits successfully
- [ ] Order appears in admin panel
- [ ] Mobile view is responsive
- [ ] Toast notifications display properly

---

**Need Help?** Check the other flow components (FrameFlow.tsx, PrintPhotoFlow.tsx) for reference on similar patterns.
