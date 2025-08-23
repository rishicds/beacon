
import { Button } from "@/components/ui/button";
import GuardianMailLogo from "@/components/icons/logo";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { Components, Steps } from "@/components/landing/Components";

export default function HeroPage() {
  return (
    <div>
      <Navbar />
      
      {/* Example usage of Components - you'll need to provide the required props */}
      {/* 
      <Components 
        title="Your Card Title"
        description="Your card description"
        image={{
          step1dark1: yourImage1,
          step1dark2: yourImage2,
          step1light1: yourImage3,
          step1light2: yourImage4,
          step2dark1: yourImage5,
          step2dark2: yourImage6,
          step2light1: yourImage7,
          step2light2: yourImage8,
          step3dark: yourImage9,
          step3light: yourImage10,
          step4light: yourImage11,
          alt: "Card description"
        }}
      />
      */}
    </div>
  );
}
