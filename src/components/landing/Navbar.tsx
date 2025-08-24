import React from "react";
import { motion } from "framer-motion";

export const Navbar = () => {
  return (
    <section >
      <SimpleFloatingNav />
    </section>
  );
};

const SimpleFloatingNav = () => {
  return (
    <nav className="fixed left-[50%] top-8 z-50 flex w-[90%] max-w-[90vw] -translate-x-[50%] items-center justify-between rounded-2xl border border-gray-200/60 bg-white/95 backdrop-blur-xl backdrop-saturate-150 px-8 py-4 text-sm shadow-lg shadow-gray-900/10">
      <Logo />

      

      <JoinButton />
    </nav>
  );
};

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="24"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-blue-700"
      >
        <path
          d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
          stopColor="#000000"
        ></path>
        <path
          d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
          stopColor="#000000"
        ></path>
      </svg>
      <span className="font-bold text-gray-800 text-lg">Beacon</span>
    </div>
  );
};

const NavLink = ({ children }: { children: string }) => {
  return (
    <a href="#" rel="nofollow" className="block overflow-hidden">
      <div
        className="h-[20px] transition-transform duration-500 ease-in-out hover:-translate-y-5"
      >
        <span className="flex h-[20px] items-center text-gray-600 font-medium">{children}</span>
        <span className="flex h-[20px] items-center text-gray-900 font-medium">
          {children}
        </span>
      </div>
    </a>
  );
};

const JoinButton = () => {
  return (
    <a href="/login">
      <button
        className={`
            relative z-0 flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-2xl border 
            border-gray-300 px-6 py-2 font-medium
           text-gray-700 transition-all duration-300
            
            before:absolute before:inset-0
            before:-z-10 before:translate-y-[200%]
            before:scale-[2.5]
            before:rounded-[100%] before:bg-gradient-to-r before:from-gray-800 before:to-gray-900
            before:transition-transform before:duration-1000
            before:content-[""]
    
            hover:scale-105 hover:border-gray-400 hover:text-white
            hover:before:translate-y-[0%]
            active:scale-100`}
      >
        Login
      </button>
    </a>
  );
};
