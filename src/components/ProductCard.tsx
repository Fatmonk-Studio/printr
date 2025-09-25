import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProductCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const ProductCard = ({ title, description, icon: Icon, onClick }: ProductCardProps) => {
  return (
    <Card className="p-6 hover:shadow-card-hover transition-smooth cursor-pointer group" onClick={onClick}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center group-hover:scale-110 transition-spring">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <Button variant="product" className="w-full mt-4">
          Get Started
        </Button>
      </div>
    </Card>
  );
};