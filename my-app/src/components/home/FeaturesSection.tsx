'use client';

import Card from '@/components/ui/Card';
import Image from 'next/image';

// Import your images from assets
import houseIcon from '@/asset/house.png';

const features = [
  {
    image: houseIcon,
    title: 'AI Valuation',
    description: 'Advanced AI algorithms analyze property features and market data to give accurate estimates.',
    color: 'primary',
  },
  {
    image: houseIcon,
    title: 'Neighborhood Insights',
    description: 'Schools, hospitals, transport, and market proximity to help you make informed decisions.',
  },
  {
    image: houseIcon,
    title: 'For Institutions',
    description: 'Banks and lenders use our valuations to assess loan collateral with confidence.',
  },
  {
    image: houseIcon,
    title: 'For Property Owners',
    description: 'List your property and get instant AI valuation. Track your application from start to finish.',
  },
];

const FeaturesSection = () => {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose PropertyVal?</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with local market expertise
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={feature.title} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <Card className="text-center h-full">
                <div className="flex justify-center mb-4">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    width={64} 
                    height={64} 
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;