import { FeaturesBentoSection } from "../../components/guest/landing/FeaturesBentoSection";
import { FloatingCardField } from "../../components/guest/landing/FloatingCardField";
import { HowItWorksStepsSection } from "../../components/guest/landing/HowItWorksStepsSection";
import { LandingCtaSection } from "../../components/guest/landing/LandingCtaSection";
import { LandingHeroSection } from "../../components/guest/landing/LandingHeroSection";
import { LiveTablePreviewSection } from "../../components/guest/landing/LiveTablePreviewSection";


export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <FloatingCardField />

      <div className="relative z-10">
        <LandingHeroSection />
        <LiveTablePreviewSection />
        <FeaturesBentoSection />
        <HowItWorksStepsSection />
        <LandingCtaSection />
      </div>
    </div>
  );
}