import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Users, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200/60">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Secure Email + Beacon</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Confidential communication. Real-time intelligence. Total control.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-gray-900 font-semibold text-base">Quick Links</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <Link href="/" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                About
              </Link>
              <Link href="/features" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact Us */}
          <div className="space-y-6">
            <h3 className="text-gray-900 font-semibold text-base">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-600 text-sm">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Beacon</div>
                  <div>Behala, Kolkata, West Bengal</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>support@securebeacon.com</span>
              </div>
            </div>
            
            {/* Follow Us */}
            <div className="pt-2">
              <h4 className="text-gray-900 font-medium text-sm mb-3">Follow Us</h4>
              <div className="flex flex-wrap gap-4">
                <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">
                  LinkedIn
                </Link>
                <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">
                  Twitter (X)
                </Link>
                <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">
                  GitHub
                </Link>
                <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm">
                  Email
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center space-y-2">
            <div className="text-gray-500 text-sm">
              © 2025 Secure Email + Beacon Platform. All rights reserved.
            </div>
            <div className="text-gray-400 text-xs">
              Built with advanced encryption & AI to safeguard your communication.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};