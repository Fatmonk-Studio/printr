import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BackWarningDialog } from "@/components/BackWarningDialog";

interface ProductFlowLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  hasUnsavedChanges?: boolean;
}

export const ProductFlowLayout = ({
  title,
  onBack,
  children,
}: ProductFlowLayoutProps) => {
  const [showBackWarning, setShowBackWarning] = useState(false);

  const handleBackClick = () => {
    setShowBackWarning(true);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>

        <div className="max-w-4xl mx-auto">{children}</div>
      </div>

      <BackWarningDialog
        open={showBackWarning}
        onOpenChange={setShowBackWarning}
        onContinue={() => {
          setShowBackWarning(false);
          onBack();
        }}
      />
    </div>
  );
};
