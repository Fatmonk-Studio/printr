import React, { useState } from 'react';
import { XMarkIcon, ArrowLongRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { CreateIcon } from '@/assets/Icons/CreateIcon';
import { HappinessIcon } from '@/assets/Icons/HappinessIcon';
import { QualityIcon } from '@/assets/Icons/QualityIcon';

const CallToAction = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
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
                            onClick={toggleModal}
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]">
                    <div className="relative bg-white dark:bg-[#1a1a1a] rounded-lg p-5 w-[95%] max-w-xl shadow-lg">
                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-3 text-black dark:text-white text-lg font-bold hover:text-red-500"
                            onClick={toggleModal}
                        >
                            <XMarkIcon className="size-7 bg-[#DDDDDD] dark:bg-[#444444] p-1 rounded-full text-black dark:text-white" />
                        </button>

                        {/* Modal Content */}
                        <h2 className="text-center text-3xl font-bold text-black dark:text-white mb-6 mt-6">
                            Our Services
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:mx-10 mx-3 pb-7">
                            {[
                                { to: "/print", img: "/popup/print2.png", text: "Print Photos" },
                                { to: "/frame", img: "/popup/frame2.png", text: "Frame Photos" },
                                { to: "/photo-collage", img: "/popup/collages2.png", text: "Custom Photo Collages" },
                                { to: "/photo-album", img: "/popup/albums2.png", text: "Custom Photo Albums" },
                            ].map((service, idx) => (
                                <Link
                                    key={idx}
                                    to={service.to}
                                    className="cursor-pointer flex items-center gap-2 bg-[#CACEFF] bg-opacity-20 px-4 py-3 rounded-full hover:shadow-md"
                                >
                                    <img src={service.img} alt={service.text} />
                                    <p className="text-sm lg:text-lg text-black dark:text-white font-normal">
                                        {service.text}
                                    </p>
                                    <ArrowLongRightIcon className="size-5 text-black dark:text-white" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallToAction;
