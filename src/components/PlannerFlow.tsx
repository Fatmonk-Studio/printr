import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContactForm, ContactFormData } from "./ContactForm";
import { toast } from "sonner";
import { Download, FileText, Eye, X } from "lucide-react";

interface PlannerOption {
  id: string;
  name: string;
  description: string;
  price: number;
  pdfUrl: string;
  downloadUrl: string;
  features: string[];
}

// Replace YOUR_FILE_ID with your actual Google Drive file IDs
const PLANNER_OPTIONS: PlannerOption[] = [
  {
    id: "planner-2026",
    name: "2026 Planner",
    description: "Complete year planner with premium design and features",
    price: 1200,
    pdfUrl:
      "https://drive.google.com/file/d/1NetkdL2uUSv7tmqpcTtXsa52v3P_ZKo3/preview",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1NetkdL2uUSv7tmqpcTtXsa52v3P_ZKo3",
    features: [
      "Monthly and weekly planning pages",
      "Goal setting and tracking sections",
      "Habit trackers and notes pages",
      "Premium quality paper",
      "Elegant cover design",
    ],
  },
  {
    id: "travel-book",
    name: "Travel Book",
    description: "Essential planner with all the key features you need",
    price: 1000,
    pdfUrl:
      "https://drive.google.com/file/d/1Mktv7tjKYcG3CThZWpT27eurC8G4YnOw/preview",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=1Mktv7tjKYcG3CThZWpT27eurC8G4YnOw",
    features: [
      "Monthly planning pages",
      "Weekly overview sections",
      "Note pages included",
      "Clean and simple design",
    ],
  },
];

interface PlannerFlowProps {
  id: number;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

export const PlannerFlow = ({
  id,
  onUnsavedChangesChange,
}: PlannerFlowProps) => {
  const [selectedPlanner, setSelectedPlanner] = useState<PlannerOption | null>(
    null,
  );
  const [showContactForm, setShowContactForm] = useState(false);
  const [previewPlannerId, setPreviewPlannerId] = useState<string | null>(null);
  const hasUnsavedChanges = selectedPlanner !== null || showContactForm;

  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  const handlePreviewPDF = (planner: PlannerOption) => {
    setPreviewPlannerId(planner.id);
  };

  const handleClosePreview = () => {
    setPreviewPlannerId(null);
  };

  const handleDownloadPreview = (planner: PlannerOption) => {
    window.open(planner.downloadUrl, "_blank");
    toast.success("PDF download started!");
  };

  const handleOrderNow = (planner: PlannerOption) => {
    setSelectedPlanner(planner);
    setShowContactForm(true);
  };

  const handleSubmitOrder = async (contactData: ContactFormData) => {
    if (!selectedPlanner) return;

    try {
      toast.loading("Submitting your planner order...");

      const formData = new FormData();
      formData.append("name", contactData.name);
      formData.append("email", contactData.email);
      formData.append("phone", contactData.phone);
      formData.append("service_id", "5"); // Service ID for Planner
      formData.append("location", contactData.location);
      formData.append(
        "delivery_type",
        contactData.deliveryLocation || "inside_dhaka",
      );
      formData.append("payment_method", contactData.paymentMethod);

      if (contactData.additionalInfo) {
        formData.append("additional_info", contactData.additionalInfo);
      }

      // Add planner details
      formData.append("product_type", "planner");
      formData.append("planner_name", selectedPlanner.name);
      formData.append("planner_price", selectedPlanner.price.toString());
      formData.append("planner_pdf_url", selectedPlanner.pdfUrl);

      const response = await fetch(
        "https://admin.printr.store/api/service/submit",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      toast.dismiss();

      if (response.ok && result.success) {
        toast.success("Planner order submitted successfully!");
        setShowContactForm(false);
        setSelectedPlanner(null);
      } else {
        toast.error(
          result.message || "Failed to submit order. Please try again.",
        );
      }
    } catch (error) {
      toast.dismiss();
      console.error("Order submission error:", error);
      toast.error("Failed to submit order. Please try again.");
    }
  };

  if (showContactForm && selectedPlanner) {
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
                <p className="text-sm font-medium">{selectedPlanner.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedPlanner.description}
                </p>
              </div>
              <span className="text-sm font-medium">
                {selectedPlanner.price} tk
              </span>
            </div>
          </div>
        </Card>

        <ContactForm
          onSubmit={handleSubmitOrder}
          totalPrice={selectedPlanner.price}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Choose Your Planner</h2>
        <p className="text-lg text-muted-foreground">
          Preview and order your personalized planner
        </p>
      </div>

      {/* Planner Options */}
      <div className="grid md:grid-cols-1 gap-6">
        {PLANNER_OPTIONS.map((planner) => {
          const isPreviewing = previewPlannerId === planner.id;

          return (
            <Card key={planner.id} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{planner.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {planner.description}
                      </p>
                    </div>
                  </div>
                  {/* Price */}
                  <div className="py-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {planner.price}
                      </span>
                      <span className="text-lg text-muted-foreground">BDT</span>
                    </div>
                  </div>
                </div>

                {/* Features
                <ul className="space-y-2 text-sm">
                  {planner.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul> */}

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePreviewPDF(planner)}
                      className="flex-1 flex items-center justify-center gap-2"
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => handleDownloadPreview(planner)}
                      className="flex-1 flex items-center justify-center gap-2"
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleOrderNow(planner)}
                    className="w-full"
                    variant="default"
                  >
                    Order Now
                  </Button>
                </div>

                {/* Embedded PDF Viewer */}
                {isPreviewing && (
                  <div className="mt-4">
                    <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-gray-50">
                      <Button
                        onClick={handleClosePreview}
                        className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                        variant="destructive"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <iframe
                        src={planner.pdfUrl}
                        className="w-full h-[400px]"
                        title={`${planner.name} Preview`}
                        allow="autoplay"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      If the preview doesn't load, please click "Download" to
                      view the PDF
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Product Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Format</span>
            <span className="font-medium">Digital PDF</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Pages</span>
            <span className="font-medium">More than 10</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium">
              Instant Download + Physical Option
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Customization</span>
            <span className="font-medium">Professional Design</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
