
'use client';
import HeroPage from "@/components/hero/hero";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import CollapseCardFeatures from "@/components/briefAbout/briefabout";
import CTASection from "@/components/ctaSection/ctaSection";
export default function Page() {
  return (
    <div>
      <Navbar />
      <HeroPage />
      <CollapseCardFeatures />
      <CTASection />
      <Footer />
      </div>
  );
}
