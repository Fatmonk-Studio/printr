import React from 'react';
import { FaWhatsapp, FaRegCopy } from "react-icons/fa";
import { IoIosCall } from "react-icons/io";
import { Link } from 'react-router-dom';
import whiteLogo from "@/assets/printr-white.png";

const Footer = () => {
    return (
        <div className="bg-[#292929]">
            <footer className="footer lg:w-[1180px] lg:mx-auto shadow-sm px-8 py-16 flex flex-col items-center justify-center text-center">
                <img src={whiteLogo} alt="Logo" className="mb-0 w-52" />
                <div className="flex space-x-4">
                    <Link className='cursor-pointer' to="/https://www.facebook.com/PrintDenBD">
                        <img src="/social/fb.png" alt="" />
                    </Link>

                    <Link className='cursor-pointer' to="https://www.instagram.com/printdenbd?igsh=MXM0ZmY5MDE0NGs5MA==
">
                        <img src="/social/ig.png" alt="" />
                    </Link>
                </div>

                {/* 1px Line */}
                <div className="w-full h-[1px] bg-white my-4"></div>

                <p className="text-white">Copyright by Printr</p>
            </footer>
        </div>
    );
};

export default Footer;
