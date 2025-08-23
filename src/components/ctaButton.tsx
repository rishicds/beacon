import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { ReactNode } from "react";

interface CTAButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CTAButton({ children, className = "", onClick }: CTAButtonProps) {
  return (
    <ShimmerButton 
      className={`h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 rounded-lg ${className}`}
      shimmerColor="#ffffff"
      shimmerSize="0.05em"
      shimmerDuration="2.5s"
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center text-base font-semibold">
        {children}
      </span>
    </ShimmerButton>
  );
}

export function ShimmerButtonDemo() {
  return (
    <ShimmerButton className="shadow-2xl">
      <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
        Shimmer Button
      </span>
    </ShimmerButton>
  );
}
