import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  totalPrice: number;
}

export interface ContactFormData {
  name: string;
  phone: string;
  location: string;
  additionalInfo: string;
}

export const ContactForm = ({ onSubmit, totalPrice }: ContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phone: "",
    location: "",
    additionalInfo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    onSubmit(formData);
    toast.success("Order submitted successfully!");
  };

  const handleInputChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange("name")}
              placeholder="Your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              placeholder="Your phone number"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={handleInputChange("location")}
            placeholder="Your address or pickup location"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange("additionalInfo")}
            placeholder="Any special requests or notes..."
            className="min-h-[100px]"
          />
        </div>
        
        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total Price:</span>
            <span className="text-2xl font-bold text-primary">{totalPrice.toFixed(2)} tk</span>
          </div>
          
          <Button type="submit" variant="hero" size="lg" className="w-full">
            Submit Order
          </Button>
        </div>
      </form>
    </Card>
  );
};