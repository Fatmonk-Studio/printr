import React, { useState } from 'react';

const Review = ({ data }) => {
    const { name, email, comment, rate, image, created_at } = data;

    // State to manage modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Utility function to render stars based on the rate
    const renderStars = (rating) => {
        const validRating = typeof rating === 'number' ? rating : 0;

        const fullStars = Math.floor(validRating);
        const halfStar = validRating % 1 !== 0;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <>
                {Array.from({ length: fullStars }).map((_, i) => (
                    <img key={`full-${i}`} src="/star.svg" alt="star" />
                ))}
                {halfStar && <img src="/half-star.svg" alt="half star" />}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <img key={`empty-${i}`} src="/empty-star.svg" alt="empty star" />
                ))}
            </>
        );
    };

    return (
        <div className="mx-4 my-2 lg:m-0">
            <div className="bg-white rounded-md shadow-md p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="text-[14px] text-white font-semibold">{name}</h5>
                        <p className="text-[14px] text-[#848485] font-extralight">{email}</p>
                    </div>
                    <div>
                        {/* Clickable Image */}
                        <img
                            src={image}
                            alt="Reviewer"
                            className="w-12 h-12 rounded-full object-cover cursor-pointer"
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>
                </div>
                <div className="my-2">
                    <p className="text-[18px] font-light text-white">{comment}</p>
                </div>
                <div className="flex items-start justify-between">
                    <div className="flex items-center justify-start gap-1">{renderStars(rate)}</div>
                    <p className="text-[14px] text-[#848485] font-extralight">
                        {new Date(created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={() => setIsModalOpen(false)} // Close on outside click
                >
                    <div
                        className="relative bg-white p-4 rounded-md shadow-lg max-w-md w-full"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                    >
                        {/* Close Button */}
                        {/* <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✖
                        </button> */}
                        <img src={image} alt="Reviewer Modal" className="w-full h-auto rounded-md" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Review;
