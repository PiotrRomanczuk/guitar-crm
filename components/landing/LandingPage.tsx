import { LandingHeader } from './Landing.Header';
import { LandingHero } from './Landing.Hero';
import { LandingFeatures } from './Landing.Features';
import { LandingPricing } from './Landing.Pricing';
import { LandingTestimonials } from './Landing.Testimonials';
import { LandingCTA } from './Landing.CTA';
import { LandingFooter } from './Landing.Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-x-hidden">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
