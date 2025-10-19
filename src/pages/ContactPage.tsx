import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import React from 'react';
const ContactPage = () => {
    return (
        <div>
        <Navigation />
        <div className="bg-monkwhite dark:bg-monkblack py-10 pt-24 lg:pt-36 min-h-screen">
          <div className="lg:w-[1180px] lg:mx-auto m-3">
            <Contact></Contact>
          </div>
        </div>
        <Footer />
      </div>
    );
};

export default ContactPage;