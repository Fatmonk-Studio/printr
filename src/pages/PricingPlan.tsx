import Footer from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import Plans from '@/components/Plans';
import React from 'react';


const PricingPlan = () => {
  return (
    <div>
      <Navigation />
      <div className="bg-monkwhite dark:bg-monkblack py-10 pt-32 min-h-screen">
        <div className="lg:w-[1180px] lg:mx-auto m-3">
          <Plans></Plans>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPlan;