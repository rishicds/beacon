'use client';

import { useEffect, useState } from 'react';
import { easeInOut, motion, spring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

export default function AppHero() {
  // State for animated counters
  const [stats, setStats] = useState({
    secureLinks: 0,
    autoExpiry: 0,
    monitoring: 0,
  });

  // Animation to count up numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        const newSecureLinks = prev.secureLinks >= 10000 ? 10000 : prev.secureLinks + 250;
        const newAutoExpiry = prev.autoExpiry >= 7 ? 7 : prev.autoExpiry + 1;
        const newMonitoring = prev.monitoring >= 24 ? 24 : prev.monitoring + 1;

        if (
          newSecureLinks === 10000 &&
          newAutoExpiry === 7 &&
          newMonitoring === 24
        ) {
          clearInterval(interval);
        }

        return {
          secureLinks: newSecureLinks,
          autoExpiry: newAutoExpiry,
          monitoring: newMonitoring,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: spring, stiffness: 100 },
    },
  };

  // Floating animation for the cube
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: easeInOut,
    },
  };

  // Rotation animation for the orbital ring
  const rotateAnimation = {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  };

  // Glowing effect animation
  const glowAnimation = {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easeInOut,
    },
  };

  // Badge pulse animation
  const badgePulse = {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-gradient-to-br from-white via-blue-400 to-indigo-600 px-6 py-16 text-gray-900 sm:px-8 lg:px-12">
      {/* Modern Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/95 via-indigo-500/90 to-purple-700/95"></div>
      
      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full bg-[linear-gradient(30deg,#ffffff_12%,transparent_12.5%,transparent_87%,#ffffff_87.5%,#ffffff),linear-gradient(150deg,#ffffff_12%,transparent_12.5%,transparent_87%,#ffffff_87.5%,#ffffff),linear-gradient(30deg,#ffffff_12%,transparent_12.5%,transparent_87%,#ffffff_87.5%,#ffffff),linear-gradient(150deg,#ffffff_12%,transparent_12.5%,transparent_87%,#ffffff_87.5%,#ffffff)] bg-[length:60px_60px] bg-[position:0_0,0_0,30px_30px,30px_30px]"></div>
      </div>

      {/* Modern floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 h-72 w-72 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-500/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-32 right-20 h-96 w-96 rounded-full bg-gradient-to-l from-purple-400/15 to-pink-500/15 blur-3xl"
        />
        
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/40"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 mx-auto w-full max-w-7xl pt-20"
      >
        <div className="flex min-h-[70vh] flex-col items-center gap-16 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
          
          {/* Content Section - Left Side */}
          <main className="flex-1 space-y-8 text-center lg:text-left">
            
            {/* Main Headline */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Beacon
                </span>
              </h1>
              <div className="mx-auto max-w-3xl lg:mx-0">
                <p className="text-xl leading-relaxed text-white/90 sm:text-2xl font-light">
                  Encrypt messages, embed invisible beacons, and monitor every access in 
                  <span className="font-semibold text-blue-100"> real time</span>
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button
                className="group h-14 rounded-2xl border border-white/20 bg-white/10 px-8 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
                size="lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <Button
                variant="outline"
                className="h-14 rounded-2xl border-white/30 bg-transparent px-8 text-lg font-medium text-white/90 hover:bg-white/5 hover:text-white"
                size="lg"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-6 lg:justify-start"
            >
              <div className="group rounded-2xl border border-white/20 bg-white/5 px-6 py-4 backdrop-blur-md transition-all hover:bg-white/10">
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {stats.secureLinks.toLocaleString()}+
                </p>
                <p className="text-sm text-white/70">Secure Links</p>
              </div>
              <div className="group rounded-2xl border border-white/20 bg-white/5 px-6 py-4 backdrop-blur-md transition-all hover:bg-white/10">
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {stats.autoExpiry}-Day
                </p>
                <p className="text-sm text-white/70">Auto-Expiry</p>
              </div>
              <div className="group rounded-2xl border border-white/20 bg-white/5 px-6 py-4 backdrop-blur-md transition-all hover:bg-white/10">
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {stats.monitoring}/7
                </p>
                <p className="text-sm text-white/70">AI Monitoring</p>
              </div>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-4 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 backdrop-blur-md"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/50"
                  >
                    <div className="h-full w-full bg-gradient-to-br from-blue-300 to-indigo-400"></div>
                  </div>
                ))}
              </div>
              <div className="text-white/90">
                <span className="font-semibold text-white">20000+</span> Users
              </div>
            </motion.div>
          </main>

          {/* Hero Image Section - Right Side */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              {/* Modern Container with Glass Morphism */}
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl h-[400px] w-[400px] sm:h-[450px] sm:w-[450px] lg:h-[500px] lg:w-[500px]">
                
                {/* Glass effect layers */}
                <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-white/20 via-white/5 to-transparent"></div>
                
                {/* Main image container */}
                <div className="relative z-10 h-full w-full p-8">
                  <motion.div
                    className="relative h-full w-full"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <img
                      src="/image.png"
                      alt="Beacon Security Platform"
                      className="h-full w-full object-contain drop-shadow-2xl filter transition-all duration-500"
                    />
                  </motion.div>
                </div>
                
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 50%)",
                      "radial-gradient(circle at 40% 80%, #8b5cf6 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%)",
                    ],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              
              {/* Floating elements around the container */}
              <motion.div
                className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 h-6 w-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg"
                animate={{
                  y: [0, 10, 0],
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent"></div>
    </section>
  );
}



