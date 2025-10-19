import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import howItWorksImage from "@/assets/link.jpg";

const steps = [
  {
    title: "Step 1: Choose a Service",
    content: "Browse through our services and select the one that suits your needs.",
  },
  {
    title: "Step 2: Upload Your Photos",
    content: "Upload your favorite photos directly from your device or cloud storage.",
  },
  {
    title: "Step 3: Edit and Select Sizes",
    content: "Customize your photos with our easy-to-use editing tools and choose your preferred sizes.",
  },
  {
    title: "Step 4: Pay using Cards or Cash on Delivery",
    content: "Complete your order with secure payment options including cards or cash on delivery.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-6 bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          How It Works
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img
              src={howItWorksImage}
              alt="Hands holding vintage camera with coffee and flowers"
              className="w-full h-auto object-cover"
            />
          </div>

          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
            {steps.map((step, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-lg transition-all"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {step.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {step.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
