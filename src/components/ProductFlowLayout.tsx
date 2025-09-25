import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProductFlowLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const ProductFlowLayout = ({ title, onBack, children }: ProductFlowLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};