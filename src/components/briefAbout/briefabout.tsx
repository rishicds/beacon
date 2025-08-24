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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-24 lg:py-32">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 to-indigo-950/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-indigo-400/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center rounded-full border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm px-6 py-2 mb-8">
            <FiShield className="mr-2 h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Why BeaconMail</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
            <span className="block text-white mb-2">Enterprise Security</span>
            <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Redefined
            </span>
          </h2>
          
          <p className="text-slate-400 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover why organizations worldwide trust BeaconMail for their most sensitive communications. 
            Our platform delivers enterprise-grade security without compromising on user experience.
          </p>
        </motion.div>

        {/* Navigation Controls */}
        <div className="flex justify-center mb-12">
          <div className="flex gap-3 p-2 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <button
              className="group relative h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all duration-300 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              onClick={shiftLeft}
              disabled={position === 0}
            >
              <FiChevronLeft className="text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </button>
            
            {/* Progress Indicators */}
            <div className="flex items-center gap-2 px-4">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPosition(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === position 
                      ? "bg-blue-400 w-8" 
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>
            
            <button
              className="group relative h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all duration-300 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              onClick={shiftRight}
              disabled={position === features.length - 1}
            >
              <FiChevronRight className="text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
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
        
        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
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
        duration: 0.5,
      }}
      className="relative flex min-h-[400px] w-full max-w-md shrink-0 flex-col justify-between overflow-hidden rounded-3xl shadow-2xl backdrop-blur-sm border border-slate-700/30 bg-gradient-to-br from-slate-800/40 to-slate-900/40 group hover:border-blue-500/30 transition-all duration-500"
    >
      {/* Card Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col h-full">
        {/* Icon Section */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 group-hover:border-blue-400/50 transition-all duration-300">
            <Icon className="text-2xl text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
          </div>
        </div>
        
        {/* Title and Metric */}
        <div className="mb-6">
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
            {title}
          </h3>
          {metric && (
            <div className="inline-flex items-center rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1">
              <span className="text-sm font-semibold text-blue-400">{metric}</span>
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className="text-slate-300 text-base leading-relaxed flex-grow">
          {description}
        </p>
        
        {/* Bottom Accent */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex items-center text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
            Active & Monitored
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:from-blue-400/20 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
};

export default CollapseCardFeatures;

const features = [
  {
    title: "Military-Grade Encryption",
    Icon: FiLock,
    metric: "AES-256",
    description:
      "Enterprise-level encryption protocols ensure your sensitive documents remain completely secure during transmission and storage, meeting the highest industry security standards and compliance requirements.",
  },
  {
    title: "99.99% Uptime Guarantee",
    Icon: FiActivity,
    metric: "SLA Backed",
    description:
      "Rock-solid infrastructure with redundant systems and failover protection guarantees reliable access to your secure communications whenever you need them most.",
  },
  {
    title: "Real-Time Monitoring",
    Icon: FiZap,
    metric: "Live Alerts",
    description:
      "Comprehensive monitoring dashboard provides instant visibility into document access, user activity, and security events with real-time notifications and detailed audit trails.",
  },
  {
    title: "PIN-Protected Access",
    Icon: FiShield,
    metric: "Multi-Factor",
    description:
      "Advanced multi-factor authentication with secure PIN codes and biometric verification ensures only authorized recipients can access your sensitive communications.",
  },
  {
    title: "Enterprise Integrations",
    Icon: FiUsers,
    metric: "500+ Apps",
    description:
      "Seamlessly integrate with your existing workflow tools including Slack, Microsoft Teams, and enterprise security systems for a unified communication experience.",
  },
];

const stats = [
  { value: "10,000+", label: "Organizations" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "256-bit", label: "Encryption" },
  { value: "24/7", label: "Support" },
];