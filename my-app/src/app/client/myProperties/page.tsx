'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Check,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface Property {
  id: string;
  upiNumber: string;
  ownerName: string;
  phoneNumber: string;
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
  institutions?: Array<{
    id: string;
    name: string;
    accessType: string;
    grantedAt: string;
    isPending: boolean;
  }>;
  pendingRequests?: Array<{
    id: string;
    institutionId: string;
    institution: {
      id: string;
      name: string;
      email: string;
    };
    accessType: string;
    accessRequestedAt: string;
  }>;
}

export default function MyPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'ALL', label: 'All Status', icon: <Clock className="w-3 h-3" />, color: 'bg-gray-100 text-gray-800' },
    { value: 'PENDING', label: 'Pending', icon: <Clock className="w-3 h-3" />, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ASSIGNED', label: 'Assigned', icon: <Clock className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'IN_FIELDWORK', label: 'In Fieldwork', icon: <Clock className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'UNDER_REVIEW', label: 'Under Review', icon: <AlertCircle className="w-3 h-3" />, color: 'bg-orange-100 text-orange-800' },
    { value: 'NEEDS_REVISION', label: 'Needs Revision', icon: <AlertCircle className="w-3 h-3" />, color: 'bg-red-100 text-red-800' },
    { value: 'APPROVED', label: 'Approved', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-teal-100 text-teal-800' },
    { value: 'PUBLISHED', label: 'Published', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-green-100 text-green-800' },
    { value: 'SOLD', label: 'Sold', icon: <DollarSign className="w-3 h-3" />, color: 'bg-gray-100 text-gray-800' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProperties(token);
  }, [currentPage, statusFilter, searchTerm]);

  const fetchProperties = async (token: string) => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      // Use the endpoint that returns properties with access requests
      const response = await api.get('/client/properties', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        setProperties(response.data.data || []);
        const total = response.data.total || response.data.data?.length || 0;
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAccess = async (propertyId: string, institutionId: string, accessType: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setProcessingRequest(`${propertyId}-${institutionId}`);
    try {
      const response = await api.post(
        `/client/properties/${propertyId}/access/${institutionId}/approve`,
        { accessType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Access granted! The institution can now view your property.');
        await fetchProperties(token);
      } else {
        alert(response.data.error || 'Failed to approve access');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve access');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRevokeAccess = async (propertyId: string, institutionId: string) => {
    if (!confirm('Are you sure you want to revoke access? The institution will no longer be able to view this property.')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;
    
    setProcessingRequest(`${propertyId}-${institutionId}`);
    try {
      const response = await api.delete(
        `/client/properties/${propertyId}/access/${institutionId}/revoke`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Access revoked successfully.');
        await fetchProperties(token);
      } else {
        alert(response.data.error || 'Failed to revoke access');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to revoke access');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDelete = async (propertyId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setDeleting(true);
    try {
      const response = await api.delete(`/client/myProperties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('Property deleted successfully!');
        await fetchProperties(token);
        setDeleteConfirm(null);
      } else {
        alert(response.data.error || 'Failed to delete property');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error || 'Failed to delete property');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${option.color}`}>
        {option.icon}
        {option.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if any property has pending requests
  const hasPendingRequests = properties.some(p => p.pendingRequests && p.pendingRequests.length > 0);
  const totalPendingRequests = properties.reduce((sum, p) => sum + (p.pendingRequests?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/clientDashboard" 
              className="inline-flex items-center gap-2 text-[#1B3A5C] hover:text-[#244d79] font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          </div>
          <Link
            href="/createProperty"
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#244d79] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Property
          </Link>
        </div>

        {/* Pending Access Requests Alert */}
        {hasPendingRequests && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-orange-800">
                  {totalPendingRequests} Access Request{totalPendingRequests !== 1 ? 's' : ''} Pending
                </p>
                <p className="text-sm text-orange-600">
                  Financial institutions have requested access to view your property valuations. 
                  Review and approve them below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            <p className="text-sm text-gray-500">Total Properties</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-green-600">
              {properties.filter(p => p.status === 'PUBLISHED').length}
            </p>
            <p className="text-sm text-gray-500">Published</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-yellow-600">
              {properties.filter(p => p.status === 'PENDING').length}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-blue-600">
              {properties.filter(p => p.aiValuation).length}
            </p>
            <p className="text-sm text-gray-500">With Valuation</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by UPI number, owner name, or location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                    statusFilter === option.value
                      ? 'bg-[#1B3A5C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {option.icon}
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Properties List */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'ALL' 
                ? "Try adjusting your search or filter criteria" 
                : "You haven't added any properties yet"}
            </p>
            <Link
              href="/createProperty"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#244d79]"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Property Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <p className="text-xs text-gray-500">UPI: {property.upiNumber}</p>
                      <h3 className="text-lg font-semibold text-gray-900">{property.ownerName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {property.district}, {property.province}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(property.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(property.status)}
                      {property.aiValuation && (
                        <span className="text-lg font-bold text-indigo-600">
                          {new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(property.aiValuation)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Pending Access Requests Section */}
                  {property.pendingRequests && property.pendingRequests.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Pending Access Requests
                      </h4>
                      <div className="space-y-3">
                        {property.pendingRequests.map((request) => (
                          <div key={request.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex justify-between items-start flex-wrap gap-4">
                              <div>
                                <p className="font-medium text-gray-900">{request.institution.name}</p>
                                <p className="text-sm text-gray-600">{request.institution.email}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Requested: {formatDate(request.accessRequestedAt)}
                                </p>
                                <p className="text-xs text-orange-600 mt-1">
                                  Requested Access: {request.accessType}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveAccess(property.id, request.institutionId, request.accessType)}
                                  disabled={processingRequest === `${property.id}-${request.institutionId}`}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                  {processingRequest === `${property.id}-${request.institutionId}` ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                  Approve Access
                                </button>
                                <button
                                  onClick={() => handleRevokeAccess(property.id, request.institutionId)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                  Deny
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Institutions with Access Section */}
                  {property.institutions && property.institutions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        Institutions with Access ({property.institutions.length})
                      </h4>
                      <div className="space-y-2">
                        {property.institutions.map((inst) => (
                          <div key={inst.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{inst.name}</p>
                              <p className="text-xs text-gray-500">
                                Access granted: {formatDate(inst.grantedAt)}
                              </p>
                              <p className="text-xs text-gray-500">Access Level: {inst.accessType}</p>
                            </div>
                            <button
                              onClick={() => handleRevokeAccess(property.id, inst.id)}
                              disabled={processingRequest === `${property.id}-${inst.id}`}
                              className="px-3 py-1.5 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm"
                            >
                              {processingRequest === `${property.id}-${inst.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Revoke Access'
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Link
                      href={`/client/myProperties/${property.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#244d79] transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(property.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Property
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Delete Property?</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this property?
            </p>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}