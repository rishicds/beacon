import { motion } from "framer-motion";
import { useState } from "react";
import { IconType } from "react-icons";
import {
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiLock,
  FiActivity,
  FiZap,
  FiUsers,
} from "react-icons/fi";

const CollapseCardFeatures = () => {
  const [position, setPosition] = useState(0);

  const shiftLeft = () => {
    if (position > 0) {
      setPosition((pv) => pv - 1);
    }
  };

  const shiftRight = () => {
    if (position < features.length - 1) {
      setPosition((pv) => pv + 1);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-white px-6 py-20 lg:py-28">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-white to-indigo-600/3" />
      <div className="absolute top-0 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-600/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-tl from-indigo-600/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.04),transparent_60%)]" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Modern Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center rounded-full border border-blue-200/50 bg-white/70 backdrop-blur-sm px-5 py-2 mb-6">
            <FiShield className="mr-2 h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 tracking-wide">Platform Overview</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight mb-5 leading-[1.1]">
            <span className="block text-gray-900 mb-1">Secure Communication</span>
            <span className="block bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-700 bg-clip-text text-transparent font-bold">
              Made Simple
            </span>
          </h2>
          
          <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Enterprise-grade security meets intuitive design. Protect sensitive communications 
            with advanced encryption, real-time tracking, and intelligent threat detection.
          </p>
        </motion.div>

        {/* Modern Navigation Controls */}
        <div className="flex justify-center mb-14">
          <div className="flex items-center gap-4 p-3 rounded-3xl bg-white/80 backdrop-blur-md border border-blue-200/40 shadow-lg shadow-blue-600/5">
            <button
              className="group relative h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all duration-300 rounded-full shadow-md hover:shadow-lg transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
              onClick={shiftLeft}
              disabled={position === 0}
            >
              <FiChevronLeft className="text-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
            
            {/* Modern Progress Indicators */}
            <div className="flex items-center gap-2 px-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPosition(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === position 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 w-8 shadow-sm" 
                      : "bg-blue-200/60 w-2 hover:bg-blue-300/70"
                  }`}
                />
              ))}
            </div>
            
            <button
              className="group relative h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all duration-300 rounded-full shadow-md hover:shadow-lg transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
              onClick={shiftRight}
              disabled={position === features.length - 1}
            >
              <FiChevronRight className="text-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
          </div>
        </div>
        {/* Enhanced Feature Cards */}
        <div className="relative">
          <div className="flex gap-8 overflow-hidden">
            {features.map((feat, index) => (
              <Feature {...feat} key={index} position={position} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureProps {
  position: number;
  index: number;
  title: string;
  description: string;
  Icon: IconType;
  metric?: string;
}

const Feature = ({
  position,
  index,
  title,
  description,
  Icon,
  metric,
}: FeatureProps) => {
  const translateAmt =
    position >= index ? index * 100 : index * 100 - 100 * (index - position);

  return (
    <motion.div
      animate={{ x: `-${translateAmt}%` }}
      transition={{
        ease: "easeInOut",
        duration: 0.4,
      }}
      className="relative flex min-h-[380px] w-full max-w-md shrink-0 flex-col justify-between overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm border border-blue-200/50 bg-gradient-to-br from-white/95 to-blue-50/90 group hover:border-blue-300/60 hover:shadow-2xl transition-all duration-500"
    >
      {/* Modern Card Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.08),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Modern Icon Section */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-white/90 to-blue-100/80 border border-blue-300/40 group-hover:border-blue-400/60 transition-all duration-300 shadow-sm">
            <Icon className="text-lg text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
          </div>
        </div>
        
        {/* Modern Title and Metric */}
        <div className="mb-5">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 leading-tight">
            {title}
          </h3>
          {metric && (
            <div className="inline-flex items-center rounded-lg bg-white/90 border border-blue-300/40 px-3 py-1 shadow-sm">
              <span className="text-xs font-medium text-blue-700 tracking-wide">{metric}</span>
            </div>
          )}
        </div>
        
        {/* Modern Description */}
        <p className="text-gray-600 text-sm leading-relaxed flex-grow font-light">
          {description}
        </p>
        
        {/* Modern Bottom Accent */}
        <div className="mt-6 pt-4 border-t border-blue-200/40">
          <div className="flex items-center text-xs text-blue-600/80 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
            Active & Secured
          </div>
        </div>
      </div>
      
      {/* Modern Decorative Elements */}
      <div className="absolute top-3 right-3 w-24 h-24 bg-gradient-to-br from-blue-600/15 to-transparent rounded-full blur-xl group-hover:from-blue-600/20 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
};

export default CollapseCardFeatures;

const features = [
  {
    title: "Confidential Emails, Simplified",
    Icon: FiLock,
    metric: "End-to-End",
    description:
      "Every email is encrypted and protected with secure links and PIN-based access. Sensitive data stays confidential, even after it's sent.",
  },
  {
    title: "Real-Time Beacon Tracking",
    Icon: FiActivity,
    metric: "Live Tracking",
    description:
      "Embedded beacons give instant insights into who accessed your email, at what time, from which device, and location—giving you full visibility and control.",
  },
  {
    title: "Smart Threat Detection",
    Icon: FiShield,
    metric: "AI-Powered",
    description:
      "Detect suspicious logins with device/IP mismatch alerts. Our system flags risky activity in real-time, preventing leaks and misuse.",
  },
  {
    title: "Admin Dashboard & Control",
    Icon: FiUsers,
    metric: "Centralized",
    description:
      "From revoking links instantly to monitoring failed login attempts, admins get a powerful dashboard to oversee security, compliance, and reporting with ease.",
  },
  {
    title: "AI-Powered Security Insights",
    Icon: FiZap,
    metric: "Smart Reports",
    description:
      "Daily summaries and incident reports translate complex logs into clear insights. AI highlights risks, suggests fixes, and coaches employees on safer practices.",
  },
];


