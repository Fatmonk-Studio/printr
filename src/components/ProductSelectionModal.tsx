import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Image,
  Frame,
  Grid3X3,
  BookOpen,
  Coffee,
  Shirt,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect: (productId: string) => void;
}

const products = [
  {
    id: "print",
    title: "Print Photo",
    description: "High-quality photo prints in various formats and sizes",
    icon: Image,
    gradient: "from-blue-500 to-cyan-500",
    comingSoon: false,
  },
  {
    id: "frame",
    title: "Frame",
    description: "Beautiful framed prints with elegant frame options",
    icon: Frame,
    gradient: "from-purple-500 to-pink-500",
    comingSoon: false,
  },
  {
    id: "collage",
    title: "Collage",
    description: "Create stunning photo collages with multiple layouts",
    icon: Grid3X3,
    gradient: "from-orange-500 to-red-500",
    comingSoon: false,
  },
  {
    id: "album",
    title: "Album",
    description: "Premium photo albums with customizable layouts",
    icon: BookOpen,
    gradient: "from-green-500 to-emerald-500",
    comingSoon: false,
  },
  {
    id: "planner",
    title: "Planner",
    description: "Personalized planners with custom photo covers",
    icon: Calendar,
    gradient: "from-teal-500 to-cyan-500",
    comingSoon: false,
  },
  {
    id: "mug",
    title: "Print Mug",
    description: "Custom printed mugs with your favorite photos",
    icon: Coffee,
    gradient: "from-yellow-500 to-orange-500",
    comingSoon: false,
  },
  {
    id: "tshirt",
    title: "T-shirt Print",
    description: "Personalized t-shirts with custom photo prints",
    icon: Shirt,
    gradient: "from-indigo-500 to-blue-500",
    comingSoon: true,
  },
  {
    id: "totebag",
    title: "Tote Bag",
    description: "Stylish tote bags with your custom designs",
    icon: ShoppingBag,
    gradient: "from-pink-500 to-rose-500",
    comingSoon: false,
  },
];

export const ProductSelectionModal = ({
  open,
  onOpenChange,
  onProductSelect,
}: ProductSelectionModalProps) => {
  const handleProductClick = (productId: string, comingSoon: boolean) => {
    if (comingSoon) {
      toast.info("Coming Soon!", {
        description: "This product will be available soon. Stay tuned!",
      });
      return;
    }
    onProductSelect(productId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Product
          </DialogTitle>
          <DialogDescription className="text-center">
            Select a product to get started with your creation
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <button
                key={product.id}
                onClick={() =>
                  handleProductClick(product.id, product.comingSoon)
                }
                className={cn(
                  "group relative overflow-hidden rounded-xl p-5",
                  "border-2 border-gray-200 hover:border-transparent",
                  "bg-white hover:shadow-2xl",
                  "transition-all duration-300 ease-out",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "text-left",
                  product.comingSoon && "opacity-90",
                )}
              >
                {/* Coming Soon Badge */}
                {product.comingSoon && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Gradient background on hover */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0",
                    "group-hover:opacity-10 transition-opacity duration-300",
                    product.gradient,
                  )}
                />

                {/* Icon container */}
                <div className="relative mb-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      "bg-gradient-to-br shadow-lg",
                      "group-hover:scale-110 transition-transform duration-300",
                      product.gradient,
                    )}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative space-y-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-snug">
                    {product.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="relative mt-3 flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
                  <span className="text-xs font-medium">
                    {product.comingSoon ? "Notify Me" : "Get Started"}
                  </span>
                  <svg
                    className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
