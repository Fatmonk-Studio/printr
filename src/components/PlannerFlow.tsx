import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContactForm, ContactFormData } from "./ContactForm";
import { toast } from "sonner";
import { Download, FileText, Eye } from "lucide-react";

// Replace this with your actual Google Drive PDF link
const PLANNER_PDF_URL = "https://drive.google.com/file/d/1NetkdL2uUSv7tmqpcTtXsa52v3P_ZKo3/preview";
const PLANNER_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=1NetkdL2uUSv7tmqpcTtXsa52v3P_ZKo3";

export const PlannerFlow = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreviewPDF = () => {
    setIsPreviewOpen(true);
  };

  const handleDownloadPreview = () => {
    window.open(PLANNER_DOWNLOAD_URL, '_blank');
    toast.success("PDF download started!");
  };

  const handleOrderNow = () => {
    setShowContactForm(true);
  };

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    try {
      toast.loading("Submitting your planner order...");

      const formData = new FormData();
      formData.append('name', contactData.name);
      formData.append('email', contactData.email);
      formData.append('phone', contactData.phone);
      formData.append('service_id', '5'); // Service ID for Planner
      formData.append('location', contactData.location);
      formData.append('delivery_type', contactData.deliveryLocation || 'inside_dhaka');
      formData.append('payment_method', contactData.paymentMethod);

      if (contactData.additionalInfo) {
        formData.append('additional_info', contactData.additionalInfo);
      }

      // Add planner details
      formData.append('product_type', 'planner');
      formData.append('planner_pdf_url', PLANNER_PDF_URL);

      const response = await fetch('https://admin.printr.store/api/service/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      toast.dismiss();

      if (response.ok && result.success) {
        toast.success("Planner order submitted successfully!");
        setShowContactForm(false);
      } else {
        toast.error(result.message || 'Failed to submit order. Please try again.');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Order submission error:', error);
      toast.error('Failed to submit order. Please try again.');
    }
  };

  if (showContactForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Order Summary</h2>
          <Button variant="outline" onClick={() => setShowContactForm(false)}>
            Back to Planner
          </Button>
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Order</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Custom Planner (PDF)</p>
                <p className="text-xs text-muted-foreground">
                  Personalized planner with premium design
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <ContactForm 
          onSubmit={handleSubmitOrder} 
          totalPrice={0}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Custom Planner</h2>
        <p className="text-lg text-muted-foreground">
          Preview and order your personalized planner
        </p>
      </div>

      {/* PDF Preview Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Planner Preview</h3>
                <p className="text-sm text-muted-foreground">
                  View the complete planner design
                </p>
              </div>
            </div>
          </div>

          {/* Preview Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handlePreviewPDF}
              className="flex-1 flex items-center justify-center gap-2"
              variant="outline"
            >
              <Eye className="w-4 h-4" />
              Preview PDF
            </Button>
            <Button
              onClick={handleDownloadPreview}
              className="flex-1 flex items-center justify-center gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download Preview
            </Button>
          </div>

          {/* Embedded PDF Viewer */}
          {isPreviewOpen && (
            <div className="mt-4">
              <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={PLANNER_PDF_URL}
                  className="w-full h-[600px]"
                  title="Planner Preview"
                  allow="autoplay"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                If the preview doesn't load, please click "Download Preview" to view the PDF
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Product Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Product Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Format</span>
            <span className="font-medium">Digital PDF</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Pages</span>
            <span className="font-medium">Full Year Planner</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Customization</span>
            <span className="font-medium">Premium Design</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium">Instant Download + Physical Option</span>
          </div>
        </div>
      </Card>

      {/* Features */}
      {/* <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Features</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Monthly and weekly planning pages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Goal setting and tracking sections</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Note pages and habit trackers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>High-quality printable PDF format</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Optional physical printing service available</span>
          </li>
        </ul>
      </Card> */}

      {/* Order Button */}
      <div className="flex justify-center">
        <Button 
          variant="hero" 
          size="lg" 
          onClick={handleOrderNow}
          className="w-full sm:w-auto"
        >
          Order Now
        </Button>
      </div>
    </div>
  );
};
