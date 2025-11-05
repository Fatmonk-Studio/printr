import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

const Plans = () => {
    const [plansData, setPlansData] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Hardcoded premium paper options
    const premiumPapers = [
        { id: 'canvas', name: 'Canvas Paper' },
        { id: 'fine-art', name: 'Fine Art Paper' },
        { id: 'luster', name: 'Luster Paper' }
    ];

    // Fetch plans data from the API
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://admin.printr.store/api/print-type/list');
                const result = await response.json();
                if (result.success) {
                    setPlansData(result.data);
                    // Set the first API plan as default
                    if (result.data.length > 0) {
                        setSelectedPlan(result.data[0].name);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // Memoize selected plan data
    const selectedPlanData = useMemo(() => {
        const plan = plansData.find((plan) => plan.name === selectedPlan);
        return plan ? plan.size : [];
    }, [selectedPlan, plansData]);

    // Check if selected plan is a premium paper
    const isPremiumPaper = useMemo(() => {
        return premiumPapers.some((paper) => paper.name === selectedPlan);
    }, [selectedPlan]);

    // Handle button click
    const handlePlanClick = useCallback((plan) => {
        setSelectedPlan(plan);
    }, []);

    return (
        <div>
            <h2 className="text-4xl font-poppins font-bold bg-gradient-to-r from-[#000000] to-[#625E5E] bg-clip-text text-transparent text-center dark:text-white">
                Our Pricing Plan
            </h2>
            <div className="flex flex-col justify-center items-center mt-5">
                <div className="lg:w-[1000px] flex flex-wrap items-center justify-center gap-3 mt-5 mx-1 lg:mx-0">
                    {/* Show loading skeleton for API Plans */}
                    {isLoading ? (
                        <>
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-12 w-40 bg-[#DDDDDD] rounded-full animate-pulse"
                                />
                            ))}
                        </>
                    ) : (
                        <>
                            {/* API Plans First */}
                            {plansData.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => handlePlanClick(plan.name)}
                                    className={`text-sm font-semibold py-3 px-6 rounded-full ${
                                        selectedPlan === plan.name
                                            ? 'text-white dark:text-black bg-[#000000] dark:bg-white'
                                            : 'text-black bg-[#DDDDDD] hover:bg-[#CCCCCC]'
                                    }`}
                                    aria-pressed={selectedPlan === plan.name}
                                >
                                    {plan.name}
                                </button>
                            ))}
                            
                            {/* Premium Paper Options After */}
                            {premiumPapers.map((paper) => (
                                <button
                                    key={paper.id}
                                    onClick={() => handlePlanClick(paper.name)}
                                    className={`text-sm font-semibold py-3 px-6 rounded-full ${
                                        selectedPlan === paper.name
                                            ? 'text-white dark:text-black bg-[#000000] dark:bg-white'
                                            : 'text-black bg-[#DDDDDD] hover:bg-[#CCCCCC]'
                                    }`}
                                    aria-pressed={selectedPlan === paper.name}
                                >
                                    {paper.name}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>
            
            {/* Show loading state or content */}
            {isLoading ? (
                <div className="mt-12 flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading pricing information...</p>
                </div>
            ) : (
                <>
                    {/* Show contact message for premium papers */}
                    {isPremiumPaper ? (
                        <Card className="mt-12 p-8 text-center max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <h3 className="text-2xl font-bold mb-4 text-primary">Premium {selectedPlan}</h3>
                            <p className="text-lg mb-6 text-muted-foreground">
                                Thank you for your interest in our premium {selectedPlan}! 
                                For custom pricing and detailed information, please contact us.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                                <a href="tel:+8801234567890" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                                    <Phone className="w-4 h-4" />
                                    <span>+8801901355877</span>
                                </a>
                                <a href="mailto:printr.bd@gmail.com" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                                    <Mail className="w-4 h-4" />
                                    <span>printr.bd@gmail.com</span>
                                </a>
                            </div>
                            <Link to="/contact">
                                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                                    Contact Us for Pricing
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table mt-12 w-full">
                                <thead className="bg-[#DDDDDD] dark:bg-black text-[#252430] dark:text-white">
                                    <tr className="border-[1px] border-[#E6E9F5] dark:border-white font-normal">
                                        <th>Size</th>
                                        <th className="text-center">Dimension</th>
                                        <th className="text-center">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="text-black">
                                    {selectedPlanData.map((row, index) => (
                                        <tr key={index}>
                                            <th className="border-[1px] border-[#E6E9F5] dark:border-white text-black dark:text-white ">{row.name}</th>
                                            <td className="border-[1px] border-[#E6E9F5] dark:border-white text-black dark:text-white text-center">{row.dimention}</td>
                                            <td className="border-[1px] border-[#E6E9F5] dark:border-white text-black dark:text-white text-center">{row.price}tk</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Plans;
