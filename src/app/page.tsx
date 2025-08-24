
'use client';
import HeroPage from "@/components/hero/hero";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import CollapseCardFeatures from "@/components/briefAbout/briefabout";
import CTASection from "@/components/ctaSection/ctaSection";
import AppHero from "@/components/hero/hero";
export default function Page() {
  return (
    <div>
      <Navbar />
     <AppHero />
      <CollapseCardFeatures />
      <CTASection />
      <Footer />
      </div>
  );
}
