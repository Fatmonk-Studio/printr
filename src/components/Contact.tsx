import { ArrowLongRightIcon, EnvelopeOpenIcon } from '@heroicons/react/24/solid';
import { PhoneArrowUpRightIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [responseType, setResponseType] = useState(''); // 'success' or 'error'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://admin.printr.store/api/contact-us/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();
            console.log('API Response:', responseData); // Log the API response

            if (response.ok) {
                setResponseMessage(responseData.message);
                setResponseType('success');
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                setResponseMessage(responseData?.message || 'Failed to send the message. Please try again.');
                setResponseType('error');
            }
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage('An error occurred. Please try again later.');
            setResponseType('error');
        }
    };



    return (
        <div className="flex flex-row justify-center">
            <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl lg:flex lg:justify-between w-full lg:w-[1050px] shadow-lg">
                <form className="p-4 lg:p-10" onSubmit={handleSubmit}>
                    <h2 className="text-3xl lg:text-5xl font-semibold font-poppins text-black dark:text-white">Contact Us</h2>
                    <div className="mt-5">
                        <label className="form-control w-full max-w-xl">
                            <div className="label">
                                <span className="label-text text-xs text-gray-600 dark:text-gray-400">Name<span className='text-red-600'>*</span></span>
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Rachel Joe"
                                className="input input-bordered rounded-full w-full max-w-xl h-10 lg:h-12 pl-4 bg-white dark:bg-[#2a2a2a] text-black dark:text-white border-gray-300 dark:border-gray-600"
                                required
                            />
                        </label>
                        <label className="form-control w-full max-w-xl">
                            <div className="label">
                                <span className="label-text text-xs text-gray-600 dark:text-gray-400">Phone<span className='text-red-600'>*</span></span>
                            </div>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+8801***********"
                                className="input input-bordered rounded-full w-full max-w-xl h-10 lg:h-12 pl-4 bg-white dark:bg-[#2a2a2a] text-black dark:text-white border-gray-300 dark:border-gray-600"
                                required
                            />
                        </label>
                        <label className="form-control w-full max-w-xl">
                            <div className="label">
                                <span className="label-text text-xs text-gray-600 dark:text-gray-400">Email<span className='text-red-600'>*</span></span>
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Rachel@domain.com"
                                className="input input-bordered rounded-full w-full max-w-xl h-10 lg:h-12 pl-4 bg-white dark:bg-[#2a2a2a] text-black dark:text-white border-gray-300 dark:border-gray-600"
                                required
                            />
                        </label>
                        <label className="form-control w-full max-w-xl">
                            <div className="label">
                                <span className="label-text text-xs text-gray-600 dark:text-gray-400">Message<span className='text-red-600'>*</span></span>
                            </div>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Type your query here....."
                                className="input input-bordered rounded-full w-full max-w-xl h-16 pt-4 lg:h-20 pl-4 bg-white dark:bg-[#2a2a2a] text-black dark:text-white border-gray-300 dark:border-gray-600"
                                required
                            ></textarea>
                        </label>
                    </div>
                    {/* Response Message */}
                    {responseMessage && (
                        <p
                            className={`mt-4 text-sm font-semibold ${responseType === 'success' ? 'text-[#40e031]' : 'text-[#ea4040]'
                                }`}
                        >
                            {responseMessage}
                        </p>
                    )}
                    <button type="submit">
                        <div className="bg-black dark:bg-white inline-block px-7 py-3 rounded-full mt-5 hover:opacity-90 transition-opacity">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm text-white dark:text-black font-semibold font-poppins">Submit</p>
                                <ArrowLongRightIcon className="size-5 text-white dark:text-black" />
                            </div>
                        </div>
                    </button>
                    <div className="flex flex-col lg:flex-row gap-3 mt-8">
                        <div className="flex items-center gap-2">
                            <PhoneArrowUpRightIcon className="size-6 text-black dark:text-white" />
                            <div>
                                <h5 className="text-xs text-black dark:text-white font-semibold">PHONE</h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-light">+8801878006118</p>
                            </div>
                        </div>
                        {/* <div className="flex items-center gap-2">
                            <img src="/fax.svg" alt="" />
                            <div>
                                <h5 className="text-xs text-monkwhite font-semibold">FAX</h5>
                                <p className="text-xs text-monkwhite font-light">03 5432 1234</p>
                            </div>
                        </div> */}
                        <div className="flex items-center gap-2">
                            <EnvelopeOpenIcon className="size-6 text-black dark:text-white" />
                            <div>
                                <h5 className="text-xs text-black dark:text-white font-semibold">EMAIL</h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-light"> printdenbd@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="mt-8 lg:mt-0">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1995.4565392934628!2d90.40956252919996!3d23.80403686292511!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7aa0021171d%3A0x7bdcac344f66fd32!2s4D%20Rd%20No%2073%2C%20Dhaka%201212!5e1!3m2!1sen!2sbd!4v1735724080595!5m2!1sen!2sbd"
                        className="border-0 rounded-lg shadow-lg lg:h-full lg:w-[500px] h-[400px] w-full"
                
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Map"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;
