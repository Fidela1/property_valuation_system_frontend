'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  FileText,
  Loader2,
  Check,
  X,
  Navigation,
  Camera,
  Ruler,
  Building2,
  Car,
  Wifi,
  Droplet,
  Zap,
  Shield,
  Trees
} from 'lucide-react';
import api from '@/lib/api';

interface AssignmentDetail {
  id: string;
  assignedAt: string;
  verifiedAt: string | null;
  notes: string | null;
  propertyId: string;
  collectorId: string;
  assignedById: string;
  property: {
    id: string;
    upiNumber: string;
    ownerName: string;
    phoneNumber: string;
    country: string;
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
    status: string;
    aiValuation: number | null;
    aiConfidence: number | null;
    createdAt: string;
  };
  assignedBy: {
    name: string;
    email: string;
  };
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAssignmentDetail(token);
  }, [params.id]);

  const fetchAssignmentDetail = async (token: string) => {
    try {
      const response = await api.get(`/collector/dashboard/assignments/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Assignment detail response:', response.data);
      
      if (response.data.success) {
        setAssignment(response.data.data);
      } else {
        setError(response.data.error || 'Assignment not found');
      }
    } catch (err: any) {
      console.error('Error fetching assignment:', err);
      if (err.response?.status === 404) {
        setError('Assignment not found. It may have been reassigned or cancelled.');
      } else {
        setError(err.response?.data?.error || 'Failed to load assignment details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.post(
        `/collector/dashboard/assignments/${params.id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Assignment accepted successfully!');
        router.push('/collector/dashboard/field-data');
      } else {
        alert(response.data.error || 'Failed to accept assignment');
      }
    } catch (err: any) {
      console.error('Error accepting assignment:', err);
      alert(err.response?.data?.error || 'Failed to accept assignment');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // FIXED: Changed JSX.Element to React.ReactNode
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'ASSIGNED': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      'IN_FIELDWORK': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Navigation className="w-4 h-4" /> },
      'UNDER_REVIEW': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <AlertCircle className="w-4 h-4" /> },
      'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: <Clock className="w-4 h-4" /> };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#1B3A5C] animate-spin" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignment Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The assignment you are looking for does not exist.'}</p>
          <Link
            href="/collector/dashboard/assignments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const property = assignment.property;
  const statusBadge = getStatusBadge(property.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/collector/dashboard/assignments"
          className="inline-flex items-center gap-2 text-[#1B3A5C] hover:text-[#2C5F8A] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5F8A] px-6 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Property Assessment
                </h1>
                <p className="text-indigo-100">UPI: {property.upiNumber}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                {statusBadge.icon}
                <span className="text-sm font-medium">{property.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Property Information</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">UPI Number</p>
                    <p className="text-sm font-medium mt-1">{property.upiNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Owner Name</p>
                    <p className="text-sm font-medium mt-1">{property.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                    <p className="text-sm font-medium mt-1">{property.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Country</p>
                    <p className="text-sm font-medium mt-1">{property.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Location Details</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500 uppercase">Province</p><p className="text-sm font-medium mt-1">{property.province}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">District</p><p className="text-sm font-medium mt-1">{property.district}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Sector</p><p className="text-sm font-medium mt-1">{property.sector || 'N/A'}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Cell</p><p className="text-sm font-medium mt-1">{property.cell || 'N/A'}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500 uppercase">Village</p><p className="text-sm font-medium mt-1">{property.village || 'N/A'}</p></div>
                </div>
              </div>
            </div>

            {/* Assignment Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Assignment Information</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  <div><p className="text-xs text-gray-500 uppercase">Assigned Date</p><p className="text-sm font-medium mt-1">{formatDate(assignment.assignedAt)}</p></div>
                  {assignment.verifiedAt && <div><p className="text-xs text-gray-500 uppercase">Accepted Date</p><p className="text-sm font-medium mt-1">{formatDate(assignment.verifiedAt)}</p></div>}
                  {assignment.notes && <div><p className="text-xs text-gray-500 uppercase">Notes</p><p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{assignment.notes}</p></div>}
                  <div><p className="text-xs text-gray-500 uppercase">Assigned By</p><p className="text-sm font-medium mt-1">{assignment.assignedBy?.name} ({assignment.assignedBy?.email})</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                {(property.status === 'ASSIGNED' || property.status === 'PENDING') && (
                  <button
                    onClick={handleAcceptAssignment}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Accept Assignment
                  </button>
                )}
                <Link
                  href={`/collector/dashboard/field-data`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Start Field Data Collection
                </Link>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-4 h-4" />
                  Download Instructions
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-xl shadow-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-white/80" />
                  <h3 className="text-white/80 text-sm uppercase tracking-wide">Important</h3>
                </div>
                <ul className="space-y-2 text-white/90 text-sm">
                  <li className="flex items-start gap-2">• Verify property location before visiting</li>
                  <li className="flex items-start gap-2">• Take clear photos of all rooms</li>
                  <li className="flex items-start gap-2">• Record accurate measurements</li>
                  <li className="flex items-start gap-2">• Submit all required documents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}