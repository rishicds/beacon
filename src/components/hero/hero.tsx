
'use client';

import { ArrowRight, Shield, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import TextGenerateEffect from '@/components/ui/typewriter';
import { BorderBeam } from '@/components/ui/border-beam';
import GuardianMailLogo from "@/components/icons/logo";
import Link from "next/link";

export default function HeroPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Enhanced Header */}
     
      <main className="flex-1 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-indigo-950/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-3xl" />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative container mx-auto max-w-7xl px-4 py-24 lg:py-32"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/80 backdrop-blur-sm px-6 py-2 shadow-lg shadow-slate-900/20">
              <Shield className="mr-2 h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">
                Enterprise-Grade Security Platform
              </span>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block text-white">
                  <TextGenerateEffect words="Secure Communication" />
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  <TextGenerateEffect words="Redefined" />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mx-auto max-w-3xl text-lg sm:text-xl text-slate-400 leading-relaxed"
              >
                Experience next-generation secure communication with military-grade encryption, 
                real-time monitoring, and enterprise-scale reliability. Protect your most sensitive 
                data with confidence.
              </motion.p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button 
                asChild 
                size="lg" 
                className="group relative h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/login" className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Start Protecting Data
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="group h-12 px-8 border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800 shadow-lg transition-all duration-300"
              >
                <Link href="/login" className="flex items-center text-slate-300">
                  Learn More 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Trusted by 10,000+ organizations</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>End-to-End Encryption</span>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="relative mx-auto mt-20 max-w-6xl"
          >
            <div className="relative overflow-hidden rounded-2xl bg-slate-800/10 backdrop-blur-sm border border-slate-700/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700/5 to-transparent" />
              
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/20">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-slate-700/50 rounded-md flex items-center px-3">
                    <Lock className="h-3 w-3 text-green-400 mr-2" />
                    <span className="text-xs text-slate-400">app.guardianmail.com</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="GuardianMail Dashboard"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>

              {/* Animated Border */}
              <BorderBeam
                duration={8}
                size={400}
                className="from-transparent via-blue-500 to-transparent opacity-60"
              />
              <BorderBeam
                duration={8}
                delay={4}
                size={400}
                className="from-transparent via-indigo-500 to-transparent opacity-40"
              />
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="absolute -left-4 top-1/4 hidden lg:block"
            >
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/20 dark:border-slate-700/20 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">Security Alert</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">2 minutes ago</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Document access verified with 2FA</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="absolute -right-4 bottom-1/4 hidden lg:block"
            >
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/20 dark:border-slate-700/20 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">Team Activity</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live updates</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">5 secure documents shared today</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}

