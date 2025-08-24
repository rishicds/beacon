'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { CTAButton } from "@/components/ctaButton";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative bg-gradient-to-b from-white via-blue-600 to-indigo-600 py-20">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30" />
      
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Ready to secure your
              <span className="block bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                communications?
              </span>
            </h2>
            
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              Join thousands of organizations protecting their sensitive data with Beacon.
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
              <button className="group h-12 px-8 border border-white/50 bg-white/90 hover:bg-white backdrop-blur-sm text-blue-700 hover:text-blue-800 rounded-lg transition-all duration-300 flex items-center shadow-lg">
                <span className="text-base font-medium">Learn More</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </Link>
          </div>

          {/* Trust indicator */}
          <p className="text-gray-700 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}



