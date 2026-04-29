'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Rocket, TrendingUp } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="bg-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900">
            <span className="block text-primary-600">Property Valuation</span>
            <span className="block">Made Simple with AI</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Get accurate property valuations powered by artificial intelligence.
            Perfect for buyers, sellers, banks, and real estate professionals.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
  <Link href="/signup">
    <Button size="lg" className="w-full sm:w-auto">
      Get Started
    </Button>
  </Link>
  <Link href="/valuation">
    <Button variant="outline" size="lg" className="w-full h-13 sm:w-auto">
      Try Valuation
    </Button>
  </Link>
</div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;