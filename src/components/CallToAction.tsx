import React, { useState } from 'react';
import { CreateIcon } from '@/assets/Icons/CreateIcon';
import { HappinessIcon } from '@/assets/Icons/HappinessIcon';
import { QualityIcon } from '@/assets/Icons/QualityIcon';
import { ProductSelectionModal } from '@/components/ProductSelectionModal';

interface CallToActionProps {
  onProductSelect?: (productId: string) => void;
}

const CallToAction = ({ onProductSelect }: CallToActionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProductSelect = (productId: string) => {
        if (onProductSelect) {
            onProductSelect(productId);
        }
    };

    return (
        <div className="bg-[#f8f6f6] dark:bg-[#1a1a1a] py-10">
            <div className="lg:w-[1180px] lg:mx-auto">
                {/* Header Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 p-4 lg:p-0">
                    <div className="bg-black px-10 lg:pt-7 pt-8 pb-16 rounded-2xl lg:col-span-2">
                        <img src="/horn.png" className="-ml-5" alt="Shutterfly Promotion" />
                        <h2 className="font-bold text-2xl lg:text-5xl text-white lg:leading-[65px] -mt-3">
                            Experience the Shutterfly Difference
                        </h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 mt-4 text-sm text-black bg-white px-5 py-2 rounded-full hover:shadow-md"
                        >
                            <p>Upload Photos</p>
                            <img src="/camb.png" alt="Upload Icon" />
                        </button>
                    </div>
                    {/* <div className="p-10 shadow-sm rounded-2xl bg-white dark:bg-[#292929]">
                        <img className="w-16" src="/crt.png" alt="Create Icon" />
                        <h2 className="text-2xl font-bold text-black dark:text-white">Create your way</h2>
                        <p className="text-lg text-black dark:text-[#ccc] font-normal">
                            Make something special in just minutes or dive deep into all the details. It’s up to you.
                        </p>
                    </div> */}
                    <div className="p-10 shadow-sm rounded-2xl bg-white dark:bg-[#292929]">
                        <CreateIcon className="w-14 text-black dark:text-white" />
                        <h2 className="text-2xl font-bold text-black dark:text-white">Create your wayx</h2>
                        <p className="text-lg text-black dark:text-[#ccc]">Make something special in just minutes or dive deep into all the details. It’s up to you.</p>
                    </div>

                </div>

                {/* Features Section */}
                <div className="grid lg:grid-cols-2 gap-7 p-7 lg:p-0 mt-7">
                    <div className="px-10 py-16 shadow-sm rounded-2xl bg-white dark:bg-[#292929]">
                    <HappinessIcon className="w-16 text-black dark:text-white" />
                        <h2 className="text-2xl font-bold text-black dark:text-white my-4">
                            100% happiness guaranteed
                        </h2>
                        <p className="text-lg text-black dark:text-[#ccc] font-normal">
                            We ensure you’re happy with your creation, no matter what.
                        </p>
                    </div>
                    <div className="px-10 py-16 shadow-sm rounded-2xl bg-white dark:bg-[#292929]">
                    <QualityIcon className="w-16 text-black dark:text-white" />
                        <h2 className="text-2xl font-bold text-black dark:text-white my-4">
                            Quality you can see
                        </h2>
                        <p className="text-lg text-black dark:text-[#ccc] font-normal">
                            Experience professional-grade prints and craftsmanship.
                        </p>
                    </div>
                </div>
            </div>

            {/* Product Selection Modal */}
            <ProductSelectionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onProductSelect={handleProductSelect}
            />
        </div>
    );
};

export default CallToAction;
