import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductFlowLayout } from "@/components/ProductFlowLayout";

import { Image, Frame, Grid3X3, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import CallToAction from "@/components/CallToAction";
import { BackWarningDialog } from "@/components/BackWarningDialog";

const PrintPhotoFlow = lazy(() =>
  import("@/components/PrintPhotoFlow").then((module) => ({
    default: module.PrintPhotoFlow,
  })),
);

const FrameFlow = lazy(() =>
  import("@/components/FrameFlow").then((module) => ({
    default: module.FrameFlow,
  })),
);

const CollageFlow = lazy(() =>
  import("@/components/CollageFlow").then((module) => ({
    default: module.CollageFlow,
  })),
);

const AlbumFlow = lazy(() =>
  import("@/components/AlbumFlow").then((module) => ({
    default: module.AlbumFlow,
  })),
);

const PlannerFlow = lazy(() =>
  import("@/components/PlannerFlow").then((module) => ({
    default: module.PlannerFlow,
  })),
);

const MugFlow = lazy(() => import("@/components/MugFlow"));

const TshirtFlow = lazy(() => import("@/components/TshirtFlow"));

const TotebagFlow = lazy(() => import("@/components/TotebagFlow"));

type ProductFlow =
  | "home"
  | "print"
  | "frame"
  | "collage"
  | "album"
  | "planner"
  | "mug"
  | "tshirt"
  | "totebag";

type ActiveProductFlow = Exclude<ProductFlow, "home">;

const initialUnsavedState: Record<ActiveProductFlow, boolean> = {
  print: false,
  frame: false,
  collage: false,
  album: false,
  planner: false,
  mug: false,
  tshirt: false,
  totebag: false,
};

const FlowLoadingState = () => (
  <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
    <div className="rounded-2xl border border-border bg-background/80 backdrop-blur-sm px-6 py-5 shadow-lg">
      <p className="text-sm font-medium text-foreground">
        Loading product editor...
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Preparing the selected workflow.
      </p>
    </div>
  </div>
);

const Index = () => {
  const [currentFlow, setCurrentFlow] = useState<ProductFlow>("home");
  const [unsavedByFlow, setUnsavedByFlow] = useState(initialUnsavedState);
  const [showBrowserBackWarning, setShowBrowserBackWarning] = useState(false);
  const browserFlowGuardActiveRef = useRef(false);
  const suppressNextPopStateRef = useRef(false);

  const setFlowUnsaved = (
    flow: ActiveProductFlow,
    hasUnsavedChanges: boolean,
  ) => {
    setUnsavedByFlow((prev) => {
      if (prev[flow] === hasUnsavedChanges) {
        return prev;
      }

      return {
        ...prev,
        [flow]: hasUnsavedChanges,
      };
    });
  };

  const handleProductClick = (productId: string) => {
    if (productId in initialUnsavedState) {
      if (!browserFlowGuardActiveRef.current) {
        window.history.pushState(
          { printrFlowGuard: true },
          "",
          window.location.href,
        );
        browserFlowGuardActiveRef.current = true;
      }
      setFlowUnsaved(productId as ActiveProductFlow, false);
    }
    setCurrentFlow(productId as ProductFlow);
  };

  const handleBackToHome = () => {
    if (browserFlowGuardActiveRef.current) {
      suppressNextPopStateRef.current = true;
      browserFlowGuardActiveRef.current = false;
      window.history.back();
    }
    setCurrentFlow("home");
    setUnsavedByFlow(initialUnsavedState);
  };

  const handleBrowserBackContinue = () => {
    setShowBrowserBackWarning(false);
    suppressNextPopStateRef.current = true;
    browserFlowGuardActiveRef.current = false;
    setUnsavedByFlow(initialUnsavedState);
    setCurrentFlow("home");
    window.history.back();
  };

  const handleBrowserBackCancel = () => {
    setShowBrowserBackWarning(false);
    suppressNextPopStateRef.current = true;
    window.history.forward();
  };

  useEffect(() => {
    const handlePopState = () => {
      if (suppressNextPopStateRef.current) {
        suppressNextPopStateRef.current = false;
        return;
      }

      if (currentFlow === "home") {
        return;
      }

      suppressNextPopStateRef.current = true;
      window.history.forward();
      setShowBrowserBackWarning(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentFlow]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (currentFlow === "home") {
        return;
      }

      // Browsers only allow a native confirmation dialog during unload.
      event.preventDefault();
      const warningMessage =
        "Leaving this page will discard your current progress.";
      event.returnValue = warningMessage;
      return warningMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.onbeforeunload = handleBeforeUnload;

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.onbeforeunload = null;
    };
  }, [currentFlow]);

  let flowContent: React.ReactNode = null;

  if (currentFlow === "print") {
    flowContent = (
      <ProductFlowLayout
        title="Print Photo"
        onBack={handleBackToHome}
        hasUnsavedChanges={unsavedByFlow.print}
      >
        <PrintPhotoFlow
          id={1}
          onUnsavedChangesChange={(value) => setFlowUnsaved("print", value)}
        />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "frame") {
    flowContent = (
      <ProductFlowLayout
        title="Frame"
        onBack={handleBackToHome}
        hasUnsavedChanges={unsavedByFlow.frame}
      >
        <FrameFlow
          id={2}
          onUnsavedChangesChange={(value) => setFlowUnsaved("frame", value)}
        />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "collage") {
    flowContent = (
      <ProductFlowLayout
        title="Collage"
        onBack={handleBackToHome}
        hasUnsavedChanges={unsavedByFlow.collage}
      >
        <CollageFlow
          id={3}
          onUnsavedChangesChange={(value) => setFlowUnsaved("collage", value)}
        />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "album") {
    flowContent = (
      <ProductFlowLayout
        title="Album"
        onBack={handleBackToHome}
        hasUnsavedChanges={unsavedByFlow.album}
      >
        <AlbumFlow
          id={4}
          onUnsavedChangesChange={(value) => setFlowUnsaved("album", value)}
        />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "planner") {
    flowContent = (
      <ProductFlowLayout
        title="Planner"
        onBack={handleBackToHome}
        hasUnsavedChanges={unsavedByFlow.planner}
      >
        <PlannerFlow
          id={5}
          onUnsavedChangesChange={(value) => setFlowUnsaved("planner", value)}
        />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "mug") {
    flowContent = (
      <ProductFlowLayout
        title="Mug"
        onBack={handleBackToHome}
        hasUnsavedChanges={unsavedByFlow.mug}
      >
        <MugFlow
          id={6}
          onUnsavedChangesChange={(value) => setFlowUnsaved("mug", value)}
        />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "tshirt") {
    flowContent = (
      <ProductFlowLayout
        title="T-Shirt"
        onBack={handleBackToHome}
        hasUnsavedChanges={unsavedByFlow.tshirt}
      >
        <TshirtFlow
          id={7}
          onUnsavedChangesChange={(value) => setFlowUnsaved("tshirt", value)}
        />
      </ProductFlowLayout>
    );
  }

  if (currentFlow === "totebag") {
    flowContent = (
      <ProductFlowLayout
        title="Tote Bag"
        onBack={handleBackToHome}
        hasUnsavedChanges={unsavedByFlow.totebag}
      >
        <TotebagFlow
          id={8}
          onUnsavedChangesChange={(value) => setFlowUnsaved("totebag", value)}
        />
      </ProductFlowLayout>
    );
  }

  if (currentFlow !== "home") {
    return (
      <Suspense fallback={<FlowLoadingState />}>
        <>
          {flowContent}
          <BackWarningDialog
            open={showBrowserBackWarning}
            onOpenChange={setShowBrowserBackWarning}
            onContinue={handleBrowserBackContinue}
            onCancel={handleBrowserBackCancel}
          />
        </>
      </Suspense>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      {/* Hero Section */}
      <Hero onProductSelect={handleProductClick} />
      {/* <Features /> */}
      <h1>TEST</h1>
      <Services onProductSelect={handleProductClick} />
      <HowItWorks />
      <CallToAction onProductSelect={handleProductClick} />
      <Footer />
      <BackWarningDialog
        open={showBrowserBackWarning}
        onOpenChange={setShowBrowserBackWarning}
        onContinue={handleBrowserBackContinue}
        onCancel={handleBrowserBackCancel}
      />

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
