import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductFlowLayout } from "@/components/ProductFlowLayout";
import { PrintPhotoFlow } from "@/components/PrintPhotoFlow";
import { FrameFlow } from "@/components/FrameFlow";
import { CollageFlow } from "@/components/CollageFlow";
import { AlbumFlow } from "@/components/AlbumFlow";

import { Image, Frame, Grid3X3, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import CallToAction from "@/components/CallToAction";
import { PlannerFlow } from "@/components/PlannerFlow";

type ProductFlow = "home" | "print" | "frame" | "collage" | "album" | "planner";

const Index = () => {
  const [currentFlow, setCurrentFlow] = useState<ProductFlow>("home");

  const products = [
    {
      id: "print",
      title: "Print Photo",
      description: "High-quality photo prints in various formats and sizes. Perfect for preserving your precious memories.",
      icon: Image,
    },
    {
      id: "frame",
      title: "Frame",
      description: "Beautiful framed prints with a selection of elegant frames to match any decor.",
      icon: Frame,
    },
    {
      id: "collage",
      title: "Collage",
      description: "Create stunning photo collages with multiple layout options for up to 10 photos.",
      icon: Grid3X3,
    },
    {
      id: "album",
      title: "Album",
      description: "Premium photo albums with customizable layouts and professional binding.",
      icon: BookOpen,
    },
  ];

  const handleProductClick = (productId: string) => {
    setCurrentFlow(productId as ProductFlow);
  };

  const handleBackToHome = () => {
    setCurrentFlow("home");
  };

  if (currentFlow === "print") {
    return (
      <ProductFlowLayout title="Print Photo" onBack={handleBackToHome}>
        <PrintPhotoFlow />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "frame") {
    return (
      <ProductFlowLayout title="Frame" onBack={handleBackToHome}>
        <FrameFlow />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "collage") {
    return (
      <ProductFlowLayout title="Collage" onBack={handleBackToHome}>
        <CollageFlow />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "album") {
    return (
      <ProductFlowLayout title="Album" onBack={handleBackToHome}>
        <AlbumFlow />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "planner") {
    return (
      <ProductFlowLayout title="Planner" onBack={handleBackToHome}>
        <PlannerFlow />
      </ProductFlowLayout>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      {/* Hero Section */}
      <Hero onProductSelect={handleProductClick} />
  <Features />
  <Services onProductSelect={handleProductClick} />
      <HowItWorks />
      <CallToAction onProductSelect={handleProductClick} />
      <Footer />

      {/* <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Professional photo printing workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Professional Photo
            <span className="block text-accent">Printing Services</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your digital memories into beautiful physical prints with our premium photo printing service.
          </p>
          <Button variant="accent" size="lg" className="text-lg px-8 py-4">
            Start Creating
          </Button>
        </div>
      </section> */}

      {/* Products Section */}
      {/* <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Choose Your Product</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select from our range of professional photo products, each crafted with attention to detail and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              description={product.description}
              icon={product.icon}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      </section> */}

      {/* Features Section */}
      {/* <section className="bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto">
                <Image className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Premium Quality</h3>
              <p className="text-muted-foreground">Professional-grade printing with the finest materials and attention to detail.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto">
                <Frame className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Custom Options</h3>
              <p className="text-muted-foreground">Multiple formats, sizes, and finishing options to match your vision.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-muted-foreground">Quick turnaround times with careful packaging and delivery.</p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Index;