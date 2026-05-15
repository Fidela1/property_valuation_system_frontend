'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Building2,
  Bed,
  Bath,
  Car,
  Ruler,
  TreePine,
  Fence,
  Shield,
  School,
  Hospital,
  Bus,
  ShoppingBag,
  Phone,
  Mail,
  Share2,
  Printer,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface Property {
  id: string;
  upiNumber: string;
  ownerName: string;
  phoneNumber: string;
  district: string;
  province: string;
  sector: string;
  cell: string;
  village: string;
  status: string;
  aiValuation: number;
  aiConfidence: number;
  createdAt: string;
  images: Array<{
    id: string;
    url: string;
    isFeatured: boolean;
    order: number;
  }>;
  fieldData: {
    propertyType: string;
    landSize: number;
    buildingSize: number;
    bedrooms: number;
    bathrooms: number;
    condition: string;
    yearBuilt: number;
    parkingSpaces: number;
    hasGarden: boolean;
    gardenSize: number;
    gardenType: string;
    hasAnnex: boolean;
    annexType: string;
    annexSize: number;
    hasGate: boolean;
    gateType: string;
    hasFence: boolean;
    fenceType: string;
    fenceHeight: number;
    nearestSchoolKm: number;
    nearestHospitalKm: number;
    nearestTransportKm: number;
    nearestMarketKm: number;
    roadAccessType: string;
    valuationAmount: number;
    notes: string;
  };
}

const getFullImageUrl = (url: string) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030';
  let cleanUrl = url.replace(/^\.\.\/\.\.\//, '').replace(/^\.\//, '').replace(/^\//, '');
  if (!cleanUrl.startsWith('uploads') && !cleanUrl.startsWith('/uploads')) {
    cleanUrl = `uploads/${cleanUrl}`;
  }
  return `${backendUrl}/${cleanUrl}`;
};

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/published/${propertyId}`);
      if (response.data.success) {
        setProperty(response.data.data);
      } else {
        setError('Property not found');
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const fd = property.fieldData;
  const isHighConfidence = property.aiConfidence && property.aiConfidence >= 85;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={() => window.print()} className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{property.ownerName}</h1>
                <p className="text-blue-100">UPI: {property.upiNumber}</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm">Verified Property</span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {property.images && property.images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="relative bg-gray-100 h-96">
              <img
                src={getFullImageUrl(property.images[currentImageIndex]?.url) || ''}
                alt={`Property ${property.upiNumber}`}
                className="w-full h-full object-contain"
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images!.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    ❮
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === property.images!.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    ❯
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto">
              {property.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    idx === currentImageIndex ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-gray-200'
                  }`}
                >
                  <img src={getFullImageUrl(img.url) || ''} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Valuation Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-white/80" />
                    <h3 className="text-white font-semibold">Estimated Value</h3>
                  </div>
                  {property.aiConfidence && (
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">{property.aiConfidence}% confidence</span>
                    </div>
                  )}
                </div>
                <p className="text-4xl font-bold text-white mb-4">{formatCurrency(property.aiValuation)}</p>
                
                {isHighConfidence ? (
                  <div className="flex items-center gap-2 text-green-300 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>High confidence valuation based on complete data</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Moderate confidence - some data points are estimated</span>
                  </div>
                )}
              </div>
            </div>

            {/* Property Features */}
            {fd && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold text-gray-900">Property Features</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {fd.propertyType && (
                      <div>
                        <p className="text-xs text-gray-500">Property Type</p>
                        <p className="font-medium text-gray-900">{fd.propertyType}</p>
                      </div>
                    )}
                    {fd.condition && (
                      <div>
                        <p className="text-xs text-gray-500">Condition</p>
                        <p className="font-medium text-gray-900">{fd.condition}</p>
                      </div>
                    )}
                    {fd.yearBuilt && (
                      <div>
                        <p className="text-xs text-gray-500">Year Built</p>
                        <p className="font-medium text-gray-900">{fd.yearBuilt}</p>
                      </div>
                    )}
                    {fd.parkingSpaces !== undefined && (
                      <div>
                        <p className="text-xs text-gray-500">Parking</p>
                        <p className="font-medium text-gray-900">{fd.parkingSpaces} spaces</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    {fd.landSize && (
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Land Size</p>
                          <p className="font-medium">{fd.landSize} m²</p>
                        </div>
                      </div>
                    )}
                    {fd.buildingSize && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Building Size</p>
                          <p className="font-medium">{fd.buildingSize} m²</p>
                        </div>
                      </div>
                    )}
                    {fd.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Bedrooms</p>
                          <p className="font-medium">{fd.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {fd.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Bathrooms</p>
                          <p className="font-medium">{fd.bathrooms}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Garden & Annex */}
                  {(fd.hasGarden || fd.hasAnnex) && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fd.hasGarden && (
                          <div className="flex items-center gap-2">
                            <TreePine className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Garden</p>
                              <p className="font-medium">
                                {fd.gardenSize ? `${fd.gardenSize} m²` : 'Yes'}
                                {fd.gardenType && ` - ${fd.gardenType}`}
                              </p>
                            </div>
                          </div>
                        )}
                        {fd.hasAnnex && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Annex/Guest House</p>
                              <p className="font-medium">{fd.annexType || 'Yes'}{fd.annexSize && ` (${fd.annexSize} m²)`}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Gate & Fence */}
                  {(fd.hasGate || fd.hasFence) && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-4">
                        {fd.hasGate && (
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Gate: {fd.gateType || 'Yes'}</span>
                          </div>
                        )}
                        {fd.hasFence && (
                          <div className="flex items-center gap-2">
                            <Fence className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Fence: {fd.fenceType || 'Yes'} {fd.fenceHeight && `(${fd.fenceHeight}m)`}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {fd.notes && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{fd.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Neighborhood Indicators */}
            {fd && (fd.nearestSchoolKm || fd.nearestHospitalKm || fd.nearestTransportKm || fd.nearestMarketKm) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold text-gray-900">Nearby Amenities</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {fd.nearestSchoolKm && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <School className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold">{fd.nearestSchoolKm} km</p>
                        <p className="text-xs text-gray-500">Nearest School</p>
                      </div>
                    )}
                    {fd.nearestHospitalKm && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Hospital className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold">{fd.nearestHospitalKm} km</p>
                        <p className="text-xs text-gray-500">Nearest Hospital</p>
                      </div>
                    )}
                    {fd.nearestTransportKm && (
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Bus className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold">{fd.nearestTransportKm} km</p>
                        <p className="text-xs text-gray-500">Public Transport</p>
                      </div>
                    )}
                    {fd.nearestMarketKm && (
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <ShoppingBag className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold">{fd.nearestMarketKm} km</p>
                        <p className="text-xs text-gray-500">Nearest Market</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Location */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{property.phoneNumber}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Owner
                </button>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Location Details</h3>
                </div>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Province:</span>
                  <span className="font-medium">{property.province}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">District:</span>
                  <span className="font-medium">{property.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sector:</span>
                  <span className="font-medium">{property.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cell:</span>
                  <span className="font-medium">{property.cell}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Village:</span>
                  <span className="font-medium">{property.village}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Listed on:</span>
                  <span className="font-medium">{formatDate(property.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Contact Owner</h2>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Property:</p>
                <p className="font-medium text-gray-900">{property.ownerName} - {property.upiNumber}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Phone Number:</p>
                <a href={`tel:${property.phoneNumber}`} className="text-xl font-bold text-blue-600">
                  {property.phoneNumber}
                </a>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  💡 Tip: Mention that you found this property on PropertyVal for the best experience.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <a
                  href={`tel:${property.phoneNumber}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}