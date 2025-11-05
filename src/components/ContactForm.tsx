import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  totalPrice: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  additionalInfo: string;
  paymentMethod: "online" | "cod";
  deliveryLocation: "inside_dhaka" | "outside_dhaka";
}

export const ContactForm = ({ onSubmit, totalPrice }: ContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    additionalInfo: "",
    paymentMethod: "online",
    deliveryLocation: "inside_dhaka",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.deliveryLocation) {
      toast.error("Please select delivery location");
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

  const handlePaymentMethodChange = (value: "online" | "cod") => {
    setFormData(prev => ({ 
      ...prev, 
      paymentMethod: value
    }));
  };

  const handleDeliveryLocationChange = (value: "inside_dhaka" | "outside_dhaka") => {
    setFormData(prev => ({ ...prev, deliveryLocation: value }));
  };

  const getDeliveryCharge = () => {
    if (formData.deliveryLocation === "inside_dhaka") {
      return 80;
    } else if (formData.deliveryLocation === "outside_dhaka") {
      return 150;
    }
    return 0;
  };

  const getFinalPrice = () => {
    return totalPrice + getDeliveryCharge();
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Payment Method Section */}
        <div className="space-y-4 pt-4 border-t">
          <Label>Payment Method *</Label>
          <RadioGroup
            value={formData.paymentMethod}
            onValueChange={handlePaymentMethodChange}
            className="space-y-3"
          >
            <Label htmlFor="online" className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="online" id="online" />
              <span className="flex-1 font-normal">
                Online Payment
              </span>
            </Label>
            <Label htmlFor="cod" className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="cod" id="cod" />
              <span className="flex-1 font-normal">
                Cash on Delivery (COD)
              </span>
            </Label>
          </RadioGroup>
        </div>

        {/* Delivery Location - Show for all payment methods */}
        <div className="space-y-4 p-4 bg-accent/10 rounded-lg border border-accent">
          <Label>Delivery Location *</Label>
          <RadioGroup
            value={formData.deliveryLocation}
            onValueChange={handleDeliveryLocationChange}
            className="space-y-3"
          >
            <Label htmlFor="inside_dhaka" className="flex items-center justify-between space-x-3 p-3 bg-white border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 flex-1">
                <RadioGroupItem value="inside_dhaka" id="inside_dhaka" />
                <span className="font-normal">
                  Inside Dhaka
                </span>
              </div>
              <span className="text-sm font-medium text-primary">+80 tk</span>
            </Label>
            <Label htmlFor="outside_dhaka" className="flex items-center justify-between space-x-3 p-3 bg-white border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 flex-1">
                <RadioGroupItem value="outside_dhaka" id="outside_dhaka" />
                <span className="font-normal">
                  Outside Dhaka
                </span>
              </div>
              <span className="text-sm font-medium text-primary">+150 tk</span>
            </Label>
          </RadioGroup>
        </div>
        
        <div className="border-t pt-4 mt-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="text-sm font-medium">{totalPrice.toFixed(2)} tk</span>
            </div>
            {getDeliveryCharge() > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Delivery Charge:</span>
                <span className="text-sm font-medium text-primary">+{getDeliveryCharge().toFixed(2)} tk</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-medium">Total Price:</span>
              <span className="text-2xl font-bold text-primary">{getFinalPrice().toFixed(2)} tk</span>
            </div>
          </div>
          
          <Button type="submit" variant="hero" size="lg" className="w-full">
            Submit Order
          </Button>
        </div>
      </form>
    </Card>
  );
};