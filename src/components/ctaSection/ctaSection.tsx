'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { CTAButton } from "@/components/ctaButton";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-20">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/5 to-indigo-950/5" />
      
      <div className="container mx-auto max-w-4xl px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Ready to secure your
              <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                communications?
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Join thousands of organizations protecting their sensitive data with GuardianMail.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <CTAButton>
                <Shield className="mr-2 h-4 w-4" />
                Start Free Trial
              </CTAButton>
            </Link>
            
            <Link href="/login">
              <button className="group h-12 px-8 border border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm text-slate-300 hover:text-white rounded-lg transition-all duration-300 flex items-center">
                <span className="text-base font-medium">Learn More</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </Link>
          </div>

          {/* Trust indicator */}
          <p className="text-slate-500 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
