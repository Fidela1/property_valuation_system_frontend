'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  User,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Printer,
  Download,
  UserCheck,
  Star,
  Building2,
  Briefcase,
  Info,
  ChevronLeft,
  ChevronRight,
  Mail,
  Map,
  Ruler,
  Bed,
  Bath,
  Car,
  TreePine,
  Zap,
  Droplets
} from 'lucide-react';
import api from '@/lib/api';

const getFullImageUrl = (url: string) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030';
  let cleanUrl = url.replace(/^\.\.\/\.\.\//, '').replace(/^\.\//, '').replace(/^\//, '');
  if (!cleanUrl.startsWith('uploads') && !cleanUrl.startsWith('/uploads')) cleanUrl = `uploads/${cleanUrl}`;
  return `${backendUrl}/${cleanUrl}`;
};

interface Property {
  id: string;
  upiNumber: string;
  idOrTin: string;
  phoneNumber: string;
  ownerName: string;
  country: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  status: string;
  aiValuation?: number;
  aiConfidence?: number;
  createdAt: string;
  updatedAt: string;
  assignment?: { collector: { id: string; name: string; email: string; phone: string }; assignedBy: { name: string }; assignedAt: string; notes?: string };
  fieldData?: {
    propertyType?: string; landSize?: number; buildingSize?: number; bedrooms?: number; bathrooms?: number;
    condition?: string; yearBuilt?: number; latitude?: number; longitude?: number; valuationAmount?: number; notes?: string;
    parkingSpaces?: number; gpsAccuracy?: number;
    hasGarden?: boolean; gardenSize?: number; gardenType?: string;
    hasAnnex?: boolean; annexType?: string; annexSize?: number; annexBedrooms?: number; annexBathrooms?: number;
    hasGate?: boolean; gateType?: string; gateMaterial?: string;
    hasFence?: boolean; fenceType?: string; fenceHeight?: number;
    nearestSchoolKm?: number; nearestHospitalKm?: number; nearestTransportKm?: number; nearestMarketKm?: number; roadAccessType?: string;
    hasElectricity?: boolean; hasWaterSupply?: boolean; hasWaterTank?: boolean;
  };
  images?: Array<{ id: string; url: string; isFeatured: boolean; order: number }>;
}

export default function PropertyReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [dataCollectors, setDataCollectors] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchProperty();
    fetchDataCollectors();
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/supervisor/dashboard/properties/${params.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) setProperty(response.data.data);
      else setError(response.data.error || 'Property not found');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load property');
    } finally { setLoading(false); }
  };

  const fetchDataCollectors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/supervisor/dashboard/data-collectors', { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) setDataCollectors(response.data.data?.collectors || response.data.data || []);
    } catch (err) { console.error('Error fetching collectors:', err); }
  };

  const handleAssign = async () => {
    if (!selectedCollector) { alert('Please select a data collector'); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/supervisor/dashboard/properties/${params.id}/assign`, { dataCollectorId: selectedCollector }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        alert('Data collector assigned successfully!');
        setShowAssignModal(false);
        fetchProperty();
      } else alert(response.data.error || 'Failed to assign');
    } catch (err: any) { alert(err.response?.data?.error || 'Error assigning collector'); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/supervisor/dashboard/properties/${params.id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { alert('Property approved successfully!'); fetchProperty(); }
      else alert(response.data.error || 'Failed to approve');
    } catch (err: any) { alert(err.response?.data?.error || 'Error approving property'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectionReason) { alert('Please provide a reason for rejection'); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/supervisor/dashboard/properties/${params.id}/reject`, { reason: rejectionReason }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { alert('Property rejected successfully!'); setShowRejectModal(false); fetchProperty(); }
      else alert(response.data.error || 'Failed to reject');
    } catch (err: any) { alert(err.response?.data?.error || 'Error rejecting property'); }
    finally { setActionLoading(false); }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/supervisor/dashboard/properties/${params.id}/publish`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { alert('Property published successfully!'); fetchProperty(); }
      else alert(response.data.error || 'Failed to publish');
    } catch (err: any) { alert(err.response?.data?.error || 'Error publishing property'); }
    finally { setActionLoading(false); }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800', 'UNDER_REVIEW': 'bg-orange-100 text-orange-800',
      'APPROVED': 'bg-teal-100 text-teal-800', 'PUBLISHED': 'bg-green-100 text-green-800', 'REJECTED': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p>Loading property details...</p></div></div>;
  if (error || !property) return <div className="min-h-screen flex items-center justify-center"><div className="text-center text-red-600">{error || 'Property not found'}</div></div>;

  const isUnderReview = property.status === 'UNDER_REVIEW';
  const isPending = property.status === 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/supervisor/dashboard" className="inline-flex items-center gap-2 text-[#1B3A5C] hover:text-[#2C5F8A] font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700"><Printer className="w-5 h-5" /></button>
            <button className="p-2 text-gray-500 hover:text-gray-700"><Download className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5F8A] px-6 py-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div><h1 className="text-2xl font-bold text-white mb-2">Property Review</h1><p className="text-indigo-100">UPI: {property.upiNumber}</p></div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusBadge(property.status)}`}>
                <Clock className="w-4 h-4" /><span className="text-sm font-medium">{property.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {property.images && property.images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="relative bg-gray-100 h-96">
              <img src={getFullImageUrl(property.images[currentImageIndex]?.url) || ''} alt="Property" className="w-full h-full object-contain" />
              {property.images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images!.length - 1 : prev - 1)} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setCurrentImageIndex(prev => prev === property.images!.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto">
              {property.images.map((img, idx) => (
                <button key={img.id} onClick={() => setCurrentImageIndex(idx)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${idx === currentImageIndex ? 'border-[#1B3A5C] ring-2 ring-[#1B3A5C]/20' : 'border-gray-200'}`}>
                  <img src={getFullImageUrl(img.url) || ''} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50"><div className="flex items-center gap-2"><Info className="w-5 h-5 text-[#1B3A5C]" /><h2 className="font-semibold text-gray-900">Property Information</h2></div></div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500 uppercase">Owner Name</p><p className="font-medium mt-1">{property.ownerName}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">ID/TIN Number</p><p className="font-medium mt-1">{property.idOrTin}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Phone Number</p><p className="font-medium mt-1">{property.phoneNumber}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Submitted</p><p className="font-medium mt-1">{formatDate(property.createdAt)}</p></div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50"><div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-[#1B3A5C]" /><h2 className="font-semibold text-gray-900">Location Details</h2></div></div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-500">Country</p><p className="font-medium mt-1">{property.country}</p></div>
                  <div><p className="text-xs text-gray-500">Province</p><p className="font-medium mt-1">{property.province}</p></div>
                  <div><p className="text-xs text-gray-500">District</p><p className="font-medium mt-1">{property.district}</p></div>
                  <div><p className="text-xs text-gray-500">Sector</p><p className="font-medium mt-1">{property.sector}</p></div>
                  <div><p className="text-xs text-gray-500">Cell</p><p className="font-medium mt-1">{property.cell}</p></div>
                  <div><p className="text-xs text-gray-500">Village</p><p className="font-medium mt-1">{property.village}</p></div>
                </div>
              </div>
            </div>

            {/* Property Features */}
            {/* Property Features */}
{property.fieldData && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#1B3A5C]" />
        <h2 className="font-semibold text-gray-900">Property Features</h2>
      </div>
    </div>
    <div className="p-5">
      {/* Basic Property Details */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Basic Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {property.fieldData.propertyType && (
            <div><p className="text-xs text-gray-500">Property Type</p><p className="font-medium">{property.fieldData.propertyType}</p></div>
          )}
          {property.fieldData.condition && (
            <div><p className="text-xs text-gray-500">Condition</p><p className="font-medium">{property.fieldData.condition}</p></div>
          )}
          {property.fieldData.landSize && (
            <div><p className="text-xs text-gray-500">Land Size</p><p className="font-medium">{property.fieldData.landSize} m²</p></div>
          )}
          {property.fieldData.buildingSize && (
            <div><p className="text-xs text-gray-500">Building Size</p><p className="font-medium">{property.fieldData.buildingSize} m²</p></div>
          )}
          {property.fieldData.bedrooms !== undefined && (
            <div><p className="text-xs text-gray-500">Bedrooms</p><p className="font-medium">{property.fieldData.bedrooms}</p></div>
          )}
          {property.fieldData.bathrooms !== undefined && (
            <div><p className="text-xs text-gray-500">Bathrooms</p><p className="font-medium">{property.fieldData.bathrooms}</p></div>
          )}
          {property.fieldData.yearBuilt && (
            <div><p className="text-xs text-gray-500">Year Built</p><p className="font-medium">{property.fieldData.yearBuilt}</p></div>
          )}
          {property.fieldData.parkingSpaces !== undefined && (
            <div><p className="text-xs text-gray-500">Parking Spaces</p><p className="font-medium">{property.fieldData.parkingSpaces}</p></div>
          )}
        </div>
      </div>

      {/* Garden Details */}
      {(property.fieldData.hasGarden !== undefined || property.fieldData.gardenSize || property.fieldData.gardenType) && (
        <div className="mb-4 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <TreePine className="w-4 h-4" /> Garden Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.fieldData.hasGarden !== undefined && (
              <div><p className="text-xs text-gray-500">Has Garden</p><p className="font-medium">{property.fieldData.hasGarden ? 'Yes' : 'No'}</p></div>
            )}
            {property.fieldData.gardenSize && (
              <div><p className="text-xs text-gray-500">Garden Size</p><p className="font-medium">{property.fieldData.gardenSize} m²</p></div>
            )}
            {property.fieldData.gardenType && (
              <div><p className="text-xs text-gray-500">Garden Type</p><p className="font-medium">{property.fieldData.gardenType}</p></div>
            )}
          </div>
        </div>
      )}

      {/* Annex Details */}
      {(property.fieldData.hasAnnex !== undefined || property.fieldData.annexType || property.fieldData.annexSize) && (
        <div className="mb-4 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Annex Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.fieldData.hasAnnex !== undefined && (
              <div><p className="text-xs text-gray-500">Has Annex</p><p className="font-medium">{property.fieldData.hasAnnex ? 'Yes' : 'No'}</p></div>
            )}
            {property.fieldData.annexType && (
              <div><p className="text-xs text-gray-500">Annex Type</p><p className="font-medium">{property.fieldData.annexType}</p></div>
            )}
            {property.fieldData.annexSize && (
              <div><p className="text-xs text-gray-500">Annex Size</p><p className="font-medium">{property.fieldData.annexSize} m²</p></div>
            )}
            {property.fieldData.annexBedrooms !== undefined && (
              <div><p className="text-xs text-gray-500">Annex Bedrooms</p><p className="font-medium">{property.fieldData.annexBedrooms}</p></div>
            )}
            {property.fieldData.annexBathrooms !== undefined && (
              <div><p className="text-xs text-gray-500">Annex Bathrooms</p><p className="font-medium">{property.fieldData.annexBathrooms}</p></div>
            )}
          </div>
        </div>
      )}

      {/* Gate & Fence Details */}
      {(property.fieldData.hasGate !== undefined || property.fieldData.hasFence !== undefined) && (
        <div className="mb-4 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Boundary & Security
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.fieldData.hasGate !== undefined && (
              <div><p className="text-xs text-gray-500">Has Gate</p><p className="font-medium">{property.fieldData.hasGate ? 'Yes' : 'No'}</p></div>
            )}
            {property.fieldData.gateType && (
              <div><p className="text-xs text-gray-500">Gate Type</p><p className="font-medium">{property.fieldData.gateType}</p></div>
            )}
            {property.fieldData.gateMaterial && (
              <div><p className="text-xs text-gray-500">Gate Material</p><p className="font-medium">{property.fieldData.gateMaterial}</p></div>
            )}
            {property.fieldData.hasFence !== undefined && (
              <div><p className="text-xs text-gray-500">Has Fence</p><p className="font-medium">{property.fieldData.hasFence ? 'Yes' : 'No'}</p></div>
            )}
            {property.fieldData.fenceType && (
              <div><p className="text-xs text-gray-500">Fence Type</p><p className="font-medium">{property.fieldData.fenceType}</p></div>
            )}
            {property.fieldData.fenceHeight && (
              <div><p className="text-xs text-gray-500">Fence Height</p><p className="font-medium">{property.fieldData.fenceHeight} m</p></div>
            )}
          </div>
        </div>
      )}

      {/* Nearby Amenities */}
      {(property.fieldData.nearestSchoolKm || property.fieldData.nearestHospitalKm || property.fieldData.nearestTransportKm || property.fieldData.nearestMarketKm || property.fieldData.roadAccessType) && (
        <div className="mb-4 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Nearby Amenities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.fieldData.nearestSchoolKm && (
              <div><p className="text-xs text-gray-500">Nearest School</p><p className="font-medium">{property.fieldData.nearestSchoolKm} km</p></div>
            )}
            {property.fieldData.nearestHospitalKm && (
              <div><p className="text-xs text-gray-500">Nearest Hospital</p><p className="font-medium">{property.fieldData.nearestHospitalKm} km</p></div>
            )}
            {property.fieldData.nearestTransportKm && (
              <div><p className="text-xs text-gray-500">Nearest Transport</p><p className="font-medium">{property.fieldData.nearestTransportKm} km</p></div>
            )}
            {property.fieldData.nearestMarketKm && (
              <div><p className="text-xs text-gray-500">Nearest Market</p><p className="font-medium">{property.fieldData.nearestMarketKm} km</p></div>
            )}
            {property.fieldData.roadAccessType && (
              <div><p className="text-xs text-gray-500">Road Access</p><p className="font-medium">{property.fieldData.roadAccessType}</p></div>
            )}
          </div>
        </div>
      )}

      {/* GPS Coordinates */}
      {(property.fieldData.latitude || property.fieldData.longitude) && (
        <div className="mb-4 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Map className="w-4 h-4" /> GPS Coordinates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.fieldData.latitude && (
              <div><p className="text-xs text-gray-500">Latitude</p><p className="font-medium">{property.fieldData.latitude}</p></div>
            )}
            {property.fieldData.longitude && (
              <div><p className="text-xs text-gray-500">Longitude</p><p className="font-medium">{property.fieldData.longitude}</p></div>
            )}
            {property.fieldData.gpsAccuracy && (
              <div><p className="text-xs text-gray-500">GPS Accuracy</p><p className="font-medium">{property.fieldData.gpsAccuracy} m</p></div>
            )}
          </div>
        </div>
      )}

      {/* Utilities */}
      {(property.fieldData.hasElectricity !== undefined || property.fieldData.hasWaterSupply !== undefined || property.fieldData.hasWaterTank !== undefined) && (
        <div className="mb-4 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Utilities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.fieldData.hasElectricity !== undefined && (
              <div><p className="text-xs text-gray-500">Electricity</p><p className="font-medium">{property.fieldData.hasElectricity ? 'Connected' : 'Not Connected'}</p></div>
            )}
            {property.fieldData.hasWaterSupply !== undefined && (
              <div><p className="text-xs text-gray-500">Water Supply</p><p className="font-medium">{property.fieldData.hasWaterSupply ? 'Available' : 'Not Available'}</p></div>
            )}
            {property.fieldData.hasWaterTank !== undefined && (
              <div><p className="text-xs text-gray-500">Water Tank</p><p className="font-medium">{property.fieldData.hasWaterTank ? 'Yes' : 'No'}</p></div>
            )}
          </div>
        </div>
      )}

      {/* Collector Notes */}
      {property.fieldData.notes && (
        <div className="pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Collector Notes
          </h3>
          <p className="text-sm text-gray-700">{property.fieldData.notes}</p>
        </div>
      )}
    </div>
  </div>
)}
          </div>

          {/* Right Column - Valuation & Actions */}
          <div className="space-y-6">
            {/* Valuation Card */}
            <div className="bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-xl shadow-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-white/80" /><h3 className="text-white/80 text-sm uppercase tracking-wide">AI Valuation</h3></div>
                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(property.aiValuation || 0)}</p>
                {property.aiConfidence && (
                  <div className="mt-3"><div className="flex justify-between text-xs text-white/80 mb-1"><span>Confidence Score</span><span>{property.aiConfidence}%</span></div><div className="w-full bg-white/20 rounded-full h-2"><div className="bg-white rounded-full h-2" style={{ width: `${property.aiConfidence}%` }} /></div></div>
                )}
                {property.fieldData?.valuationAmount && (
                  <div className="mt-4 pt-3 border-t border-white/20"><p className="text-xs text-white/80 mb-1">Field Valuation</p><p className="text-xl font-semibold text-white">{formatCurrency(property.fieldData.valuationAmount)}</p></div>
                )}
              </div>
            </div>

            {/* Assignment Info */}
            {property.assignment && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50"><div className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#1B3A5C]" /><h3 className="font-semibold text-gray-900">Assignment</h3></div></div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-green-600" /></div><div><p className="font-medium">{property.assignment.collector.name}</p><p className="text-xs text-gray-500">{property.assignment.collector.email}</p></div></div>
                  <div className="text-sm"><span className="text-gray-500">Assigned by:</span> {property.assignment.assignedBy.name}</div>
                  <div className="text-sm"><span className="text-gray-500">Assigned on:</span> {formatDate(property.assignment.assignedAt)}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50"><h3 className="font-semibold text-gray-900">Actions</h3></div>
              <div className="p-4 space-y-3">
                {isPending && (
                  <button onClick={() => setShowAssignModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <UserCheck className="w-4 h-4" /> Assign Data Collector
                  </button>
                )}
                {isUnderReview && (
                  <>
                    <button onClick={handleApprove} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" /> Approve & Publish
                    </button>
                    <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Printer className="w-4 h-4" /> Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center"><h2 className="text-xl font-semibold">Assign Data Collector</h2><button onClick={() => setShowAssignModal(false)}><XCircle className="w-5 h-5" /></button></div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Property: <strong>{property.ownerName} - {property.upiNumber}</strong></p>
              <select value={selectedCollector} onChange={(e) => setSelectedCollector(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4">
                <option value="">Select a collector...</option>
                {dataCollectors.filter((c: any) => c.isActive !== false).map((collector: any) => (<option key={collector.id} value={collector.id}>{collector.name} - {collector.email}</option>))}
              </select>
              <div className="flex gap-3"><button onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleAssign} disabled={actionLoading} className="flex-1 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg">Assign</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center"><h2 className="text-xl font-semibold">Reject Property</h2><button onClick={() => setShowRejectModal(false)}><XCircle className="w-5 h-5" /></button></div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Property: <strong>{property.ownerName} - {property.upiNumber}</strong></p>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg mb-4" placeholder="Please provide a reason for rejection..."></textarea>
              <div className="flex gap-3"><button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleReject} disabled={actionLoading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Reject</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}