import React, { useState, useEffect, useCallback, useMemo } from 'react';

const Plans = () => {
    const [plansData, setPlansData] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('HD matte sticker paper');

    // Fetch plans data from the API
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('https://admin.printr.store/api/print-type/list');
                const result = await response.json();
                if (result.success) {
                    setPlansData(result.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchPlans();
    }, []);

    // Memoize selected plan data
    const selectedPlanData = useMemo(() => {
        const plan = plansData.find((plan) => plan.name === selectedPlan);
        return plan ? plan.size : [];
    }, [selectedPlan, plansData]);

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
                </div>
            </div>
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
        </div>
    );
};

export default Plans;
