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
    <nav className="fixed left-[50%] top-8 flex w-[800px] max-w-[90vw] -translate-x-[50%] items-center justify-between rounded-lg border-[1px] border-neutral-700 bg-neutral-900 px-8 py-3 text-sm text-neutral-500">
      <Logo />

      <div className="flex items-center gap-8">
        <NavLink>Home</NavLink>
        <NavLink>Components</NavLink>
        <NavLink>Pricing</NavLink>
      </div>

      <JoinButton />
    </nav>
  );
};

const Logo = () => {
  // Temp logo from https://logoipsum.com/
  return (
    <svg
      width="24"
      height="auto"
      viewBox="0 0 50 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ml-2 fill-neutral-50"
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
  );
};

const NavLink = ({ children }: { children: string }) => {
  return (
    <a href="#" rel="nofollow" className="block overflow-hidden">
      <div
        className="h-[20px] transition-transform duration-500 ease-in-out hover:-translate-y-5"
      >
        <span className="flex h-[20px] items-center">{children}</span>
        <span className="flex h-[20px] items-center text-neutral-50">
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
            relative z-0 flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border-[1px] 
            border-neutral-700 px-4 py-1.5 font-medium
           text-neutral-300 transition-all duration-300
            
            before:absolute before:inset-0
            before:-z-10 before:translate-y-[200%]
            before:scale-[2.5]
            before:rounded-[100%] before:bg-neutral-50
            before:transition-transform before:duration-1000
            before:content-[""]
    
            hover:scale-105 hover:border-neutral-50 hover:text-neutral-900
            hover:before:translate-y-[0%]
            active:scale-100`}
      >
        Login
      </button>
    </a>
  );
};
