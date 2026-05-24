'use client';
import '@fortawesome/fontawesome-free/css/all.min.css';

import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}