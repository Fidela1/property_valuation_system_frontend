'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { 
  TrendingUp, Home, Wallet, Award, BarChart3, MapPin,
  School, Hospital, Bus, ShoppingBag, CheckCircle, Users,
  Building2, Shield, ArrowRight, Eye, Star, Phone, Mail,
  Clock, Menu, X
} from 'lucide-react';
import loginImage from '@/asset/landig.jpg';
import api from '@/lib/api';

// ========== NAVBAR COMPONENT ==========
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isWhiteBg, setIsWhiteBg] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
      setIsWhiteBg(scrollPosition > 550);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Valuation', href: '/valuation' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const getNavbarStyles = () => {
    if (scrolled && isWhiteBg) return 'bg-white shadow-lg text-gray-900';
    else if (scrolled && !isWhiteBg) return 'bg-navy-900/95 backdrop-blur-md shadow-lg text-white';
    else return 'bg-transparent text-white';
  };

  const getLinkStyles = () => {
    if (scrolled && isWhiteBg) return 'text-gray-600 hover:text-blue-600';
    return 'text-white/80 hover:text-white';
  };

  const getButtonStyles = (type: 'outline' | 'solid') => {
    if (scrolled && isWhiteBg) {
      if (type === 'outline') return 'border border-gray-300 text-gray-700 hover:bg-gray-100';
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
    if (type === 'outline') return 'border border-white/30 text-white hover:bg-white/10';
    return 'bg-blue-600 text-white hover:bg-blue-700';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavbarStyles()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${scrolled && isWhiteBg ? 'text-gray-900' : 'text-white'}`}>
              PropertyVal
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={`transition-colors font-medium ${getLinkStyles()}`}>
                {link.name}
              </Link>
            ))}
            <Link href="/login">
              <button className={`px-4 py-2 rounded-lg transition-all duration-300 ${getButtonStyles('outline')}`}>
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className={`px-4 py-2 rounded-lg transition-all duration-300 ${getButtonStyles('solid')}`}>
                Get Started
              </button>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className={`transition-colors py-2 ${getLinkStyles()}`}>
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-3">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className={`w-full px-4 py-2 rounded-lg ${getButtonStyles('outline')}`}>Sign In</button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <button className={`w-full px-4 py-2 rounded-lg ${getButtonStyles('solid')}`}>Get Started</button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

// ========== HERO SECTION ==========
const HeroSection = () => {
  return (
    <div className="relative h-screen min-h-[600px] flex items-center">
      <div className="absolute inset-0 z-0">
        <Image src={loginImage} alt="Hero background" fill className="object-cover" priority quality={100} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-navy-900/70 to-black/90" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm">Trusted by 5,000+ clients</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white">
              <span className="block">Smart Property Valuation</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Made Simple & Accurate</span>
            </h1>
            <p className="mt-6 text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-lg">
              Get accurate property valuations powered by advanced data analytics. Perfect for buyers, sellers, banks, and real estate professionals across Rwanda.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto">
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/valuation">
                <button className="px-8 py-3 border-2 border-white/80 text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  Try Free Valuation
                </button>
              </Link>
            </div>
          </motion.div>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {['Verified Properties', 'Expert Agents', '24/7 Support', 'Secure Platform'].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="flex items-center gap-2 text-gray-200">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== FEATURES SECTION ==========
const FeaturesSection = () => {
  const features = [
    { icon: <TrendingUp className="w-8 h-8" />, title: 'Smart Valuation', description: 'Advanced algorithms analyze property features and market data to give accurate estimates.' },
    { icon: <MapPin className="w-8 h-8" />, title: 'Neighborhood Insights', description: 'Schools, hospitals, transport, and market proximity to help you make informed decisions.' },
    { icon: <Building2 className="w-8 h-8" />, title: 'For Institutions', description: 'Banks and lenders use our valuations to assess loan collateral with confidence.' },
    { icon: <Home className="w-8 h-8" />, title: 'For Property Owners', description: 'List your property and get instant valuation. Track your application from start to finish.' },
  ];

  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Why Choose Us</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Smart Features for Smart Decisions</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Our platform combines advanced data analytics with local market expertise</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
// ========== NEIGHBORHOOD SECTION ==========
const NeighborhoodSection = () => {
  const indicators = [
    { icon: <School className="w-8 h-8" />, title: 'Schools Nearby', desc: 'Quality education access', color: 'blue' },
    { icon: <Hospital className="w-8 h-8" />, title: 'Healthcare Access', desc: 'Proximity to hospitals', color: 'green' },
    { icon: <Bus className="w-8 h-8" />, title: 'Public Transport', desc: 'Easy commuting options', color: 'orange' },
    { icon: <ShoppingBag className="w-8 h-8" />, title: 'Markets & Shops', desc: 'Shopping convenience', color: 'purple' },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Location Intelligence</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Neighborhood Insights That Matter</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Our platform analyzes key location factors that affect property value</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {indicators.map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 bg-gray-50">
              <div className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <div className={`text-${item.color}-600`}>{item.icon}</div>
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========== PUBLISHED PROPERTIES SECTION ==========
const PublishedPropertiesSection = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchPublishedProperties();
  }, [selectedLocation, selectedType]);

  const fetchPublishedProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get('/properties/published', {
        params: {
          district: selectedLocation !== 'all' ? selectedLocation : undefined,
          propertyType: selectedType !== 'all' ? selectedType : undefined,
          limit: 9
        }
      });
      
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const locations = ['all', 'Gasabo', 'Kicukiro', 'Nyarugenge'];
  const propertyTypes = ['all', 'House', 'Apartment', 'Villa', 'Land', 'Commercial'];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Featured Properties</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Published Properties</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Discover verified properties available for sale or rent</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Locations</option>
            {locations.filter(l => l !== 'all').map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            {propertyTypes.filter(t => t !== 'all').map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No published properties yet</p>
            <p className="text-sm text-gray-400 mt-2">Check back soon for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property: any) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030'}${property.images[0].url}`}
                      alt={property.ownerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Home className="w-16 h-16 text-white/30" />
                  )}
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                    {property.fieldData?.propertyType || 'Property'}
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{property.ownerName}</h3>
                      <p className="text-sm text-gray-500">UPI: {property.upiNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(property.aiValuation)}</p>
                      <p className="text-xs text-gray-500">Estimated Value</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{property.district}, {property.province}</span>
                  </div>

                  {/* Property Features */}
                  {property.fieldData && (
                    <div className="flex flex-wrap gap-2 mb-4 text-xs">
                      {property.fieldData.landSize && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">📐 {property.fieldData.landSize} m²</span>
                      )}
                      {property.fieldData.bedrooms && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">🛏️ {property.fieldData.bedrooms}</span>
                      )}
                      {property.fieldData.bathrooms && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">🚿 {property.fieldData.bathrooms}</span>
                      )}
                    </div>
                  )}

                  <Link href={`/properties/published/${property.id}`}>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// ========== MAIN HOMEPAGE ==========
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <NeighborhoodSection />
      <PublishedPropertiesSection />
    </main>
  );
}