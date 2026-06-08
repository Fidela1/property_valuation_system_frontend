'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  Eye,
  Loader2,
  AlertCircle,
  ArrowRight,
  FileText,
  Calendar,
  MapPin,
  Bell,
  ChevronRight,
  Activity
} from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  counts: {
    totalProperties: number;
    pendingApproval: number;
    completed: number;
    averageValue: number;
  };
  recentProperties: Array<{
    id: string;
    upiNumber: string;
    ownerName: string;
    status: string;
    aiValuation: number;
    createdAt: string;
    client?: { name: string };
  }>;
  pendingAccessRequests: Array<{
    id: string;
    propertyId: string;
    upiNumber: string;
    ownerName: string;
    clientName: string;
    requestedAt: string;
    accessType: string;
  }>;
}

export default function BankDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchUpi, setSearchUpi] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [requestingAccess, setRequestingAccess] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/financial_institution/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchUpi.trim()) {
      setSearchError('Please enter a UPI number');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/financial_institution/search?upiNumber=${encodeURIComponent(searchUpi)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSearchResult(response.data.data);
      } else {
        setSearchError(response.data.error || 'Property not found');
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.error || 'Failed to search property');
    } finally {
      setSearching(false);
    }
  };

  const handleRequestAccess = async (propertyId: string) => {
    setRequestingAccess(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/financial_institution/properties/${propertyId}/request-access`,
        { accessType: 'TRACK_PROGRESS' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Access request sent! The client will be notified.');
        setSearchResult(null);
        setSearchUpi('');
        fetchDashboardData();
      } else {
        alert(response.data.error || 'Failed to request access');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to request access');
    } finally {
      setRequestingAccess(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'PENDING': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      'ASSIGNED': { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
      'IN_FIELDWORK': { label: 'Fieldwork', color: 'bg-indigo-100 text-indigo-800' },
      'UNDER_REVIEW': { label: 'Review', color: 'bg-orange-100 text-orange-800' },
      'APPROVED': { label: 'Approved', color: 'bg-teal-100 text-teal-800' },
      'PUBLISHED': { label: 'Published', color: 'bg-green-100 text-green-800' }
    };
    return badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#1B3A5C] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Safely access counts with default values
  const totalProperties = stats?.counts?.totalProperties ?? 0;
  const pendingApproval = stats?.counts?.pendingApproval ?? 0;
  const completed = stats?.counts?.completed ?? 0;
  const averageValue = stats?.counts?.averageValue ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5F8A] rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-indigo-100">Monitor and track property valuations in real-time.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Live Dashboard</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Properties */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{totalProperties}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Total Properties</h3>
            <p className="text-sm text-gray-400 mt-1">Properties you can access</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Accessible properties</span>
                <span className="text-blue-600 font-medium">+{totalProperties} total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{pendingApproval}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Pending Approval</h3>
            <p className="text-sm text-gray-400 mt-1">Awaiting supervisor review</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Under review</span>
                {pendingApproval > 0 && (
                  <Link href="/financial_institution/properties?status=UNDER_REVIEW" className="text-orange-600 hover:underline">
                    View all →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{completed}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Completed</h3>
            <p className="text-sm text-gray-400 mt-1">Approved & published</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Successfully valued</span>
                <span className="text-green-600 font-medium">+{completed} total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Property Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#1B3A5C]" />
            <h2 className="text-lg font-semibold text-gray-900">Request Property Access</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Search by UPI number to request access to a property</p>
        </div>
        
        <div className="p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Property UPI Number..."
                value={searchUpi}
                onChange={(e) => setSearchUpi(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-2.5 bg-[#1B3A5C] text-white rounded-xl hover:bg-[#2C5F8A] disabled:opacity-50 flex items-center gap-2 transition-colors font-medium"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {searchError}
            </div>
          )}

          {searchResult && (
            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-mono text-gray-500">{searchResult.property?.upiNumber}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{searchResult.property?.ownerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-sm text-gray-600">{searchResult.property?.district}, {searchResult.property?.province}</p>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(searchResult.property?.status).color}`}>
                      {getStatusBadge(searchResult.property?.status).label}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {searchResult.bankAccess?.hasAccess ? (
                    <Link
                      href={`/financial_institution/properties/${searchResult.property?.id}/tracking`}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Track Progress
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : searchResult.bankAccess?.accessRequested ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl">
                      <Clock className="w-4 h-4" />
                      Awaiting Approval
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestAccess(searchResult.property.id)}
                      disabled={requestingAccess}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors font-medium"
                    >
                      {requestingAccess ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      Request Access
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Access Requests */}
      {stats?.pendingAccessRequests && stats.pendingAccessRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Pending Access Requests</h3>
              <span className="ml-auto px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {stats.pendingAccessRequests.length} New
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.pendingAccessRequests.map((request) => (
              <div key={request.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <h4 className="font-medium text-gray-900">{request.ownerName}</h4>
                    </div>
                    <p className="text-sm text-gray-500">UPI: {request.upiNumber}</p>
                    <p className="text-sm text-gray-500">Client: {request.clientName}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        {request.accessType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-orange-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Awaiting Approval
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Properties Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1B3A5C]" />
              <h3 className="font-semibold text-gray-900">Recent Properties</h3>
            </div>
            <Link 
              href="/financial_institution/properties" 
              className="text-sm text-[#1B3A5C] hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valuation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentProperties?.slice(0, 5).map((property) => {
                const status = getStatusBadge(property.status);
                return (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-900">{property.upiNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{property.ownerName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{property.client?.name || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-indigo-600">
                        {formatCurrency(property.aiValuation || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/financial_institution/properties/${property.id}/tracking`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#1B3A5C] hover:text-[#2C5F8A] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Track
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!stats?.recentProperties || stats.recentProperties.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No properties found</p>
                    <p className="text-sm text-gray-400 mt-1">Search for a property to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}