import { CallToActionSection } from "./_landing/CallToActionSection";
import { DiscoverSection } from "./_landing/DiscoverSection";
import { FeaturesSection } from "./_landing/FeaturesSection";
import { FooterSection } from "./_landing/FooterSection";
import { HeroSection } from "./_landing/HeroSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <DiscoverSection />
      <CallToActionSection />
      <FooterSection />
    </>
  );
}
