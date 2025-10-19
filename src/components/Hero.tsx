import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import heroGrid from "@/assets/hero.png";
import { ProductSelectionModal } from "@/components/ProductSelectionModal";

interface HeroProps {
  onProductSelect?: (productId: string) => void;
}

export const Hero = ({ onProductSelect }: HeroProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductSelect = (productId: string) => {
    if (onProductSelect) {
      onProductSelect(productId);
    }
  };

  return (
    <section id="home" className="pt-32 pb-20 px-6 bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
             <h1 className='font-poppins font-bold dark:text-white text-5xl lg:text-8xl my-1 lg:my-3 text-black'>
                            You Create,<br />
                            We Print
                        </h1>
                        <h2 className='font-poppins text-lg lg:text-2xl font-bold text-black dark:text-white'>
                            Upload your photos to get started
                        </h2>
            <Button size="lg" className="gap-2" onClick={() => setIsModalOpen(true)}>
              <Upload className="h-5 w-5" />
              Upload Photos
            </Button>
          </div>

          <div className="relative animate-fade-in">
            <div className="rounded-3xl overflow-hidden">
              <img 
                src={heroGrid} 
                alt="Photo printing examples showing camera, framed prints, flower, and photo arrangement" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <ProductSelectionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onProductSelect={handleProductSelect}
      />
    </section>
  );
};
