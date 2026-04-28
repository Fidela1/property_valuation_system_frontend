'use client';

import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BarChart3, Home, Wallet, Star } from 'lucide-react';

interface Stat {
  icon: string;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}

const stats: Stat[] = [
  { icon: '📊', value: 10000, label: 'Properties Valued', suffix: '+', color: 'from-blue-500 to-cyan-500' },
  { icon: '🏠', value: 5000, label: 'Happy Clients', suffix: '+', color: 'from-green-500 to-emerald-500' },
  { icon: '💰', value: 200, label: 'Total Value', suffix: 'B+ RWF', color: 'from-purple-500 to-pink-500' },
  { icon: '⭐', value: 98, label: 'Accuracy Rate', suffix: '%', color: 'from-orange-500 to-red-500' },
];

const StatsSection = () => {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const stepTime = 20;
      
      stats.forEach((stat, index) => {
        const target = stat.value;
        const steps = duration / stepTime;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCounts(prev => {
              const newCounts = [...prev];
              newCounts[index] = target;
              return newCounts;
            });
            clearInterval(timer);
          } else {
            setCounts(prev => {
              const newCounts = [...prev];
              newCounts[index] = Math.floor(current);
              return newCounts;
            });
          }
        }, stepTime);
      });
    }
  }, [isInView]);

  return (
    <div className="bg-white py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {counts[index].toLocaleString()}{stat.suffix}
              </div>
              <div className="text-gray-600 mt-2 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;