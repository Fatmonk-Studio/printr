import Footer from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import Review from '@/components/Review';
import React, { useState, useEffect } from 'react';

const ReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReviews = async () => {
        try {
            const response = await fetch('https://admin.printr.store/api/review-rating/list');
            const data = await response.json();
            if (data.success) {
                setReviews(data.data);
            } else {
                throw new Error(data.message || 'Failed to load reviews');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    return (
        <div>
            <Navigation />
            <div className="bg-white dark:bg-black py-10 pt-32 min-h-screen">
                <h1 className="text-3xl lg:text-[50px] font-medium text-[#222D39] dark:text-white text-center pb-3 lg:pb-7">
                    See What Others Have to Say About Us
                </h1>
                <div className="lg:w-[1180px] lg:mx-auto px-4">
                    {loading ? (
                        <p className="text-center text-white dark:text-white">Loading reviews...</p>
                    ) : error ? (
                        <p className="text-center text-monkdeepred">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {reviews.map((review) => (
                                <Review key={review.id} data={review} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ReviewPage;
