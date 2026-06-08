'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Building2,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  AlertCircle,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home
} from 'lucide-react';
import api from '@/lib/api';

interface AccessRequest {
  id: string;
  propertyId: string;
  property: {
    id: string;
    upiNumber: string;
    ownerName: string;
    district: string;
    province: string;
    status: string;
    aiValuation?: number;
  };
  institutionId: string;
  institution: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  accessType: string;
  accessRequestedAt: string;
  clientConsent: boolean | null;
  status: 'pending' | 'approved' | 'rejected';
}

export default function ClientAccessRequestsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/client/dashboard', current: false },
    { name: 'My Properties', icon: Building2, href: '/client/myProperties', current: false },
    { name: 'Access Requests', icon: Bell, href: '/client/access-requests', current: true },
    { name: 'Submit Property', icon: FileText, href: '/client/createProperty', current: false },
    { name: 'Settings', icon: Settings, href: '/client/settings', current: false },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'CLIENT') {
      router.push('/login');
      return;
    }

    fetchAccessRequests();
  }, []);

  const fetchAccessRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching access requests...');
      const response = await api.get('/client/access-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Access requests response:', response.data);

      if (response.data.success) {
        setRequests(response.data.data || []);
      } else {
        console.error('Failed to fetch:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, propertyId: string, institutionId: string, accessType: string) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `/client/access-requests/${requestId}/approve`,
        { propertyId, institutionId, accessType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Access granted successfully! The institution can now track your property.');
        await fetchAccessRequests();
      } else {
        alert(response.data.error || 'Failed to approve access');
      }
    } catch (err: any) {
      console.error('Approve error:', err);
      alert(err.response?.data?.error || 'Failed to approve access');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/client/access-requests/${requestId}/reject`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Access request rejected.');
        await fetchAccessRequests();
      } else {
        alert(response.data.error || 'Failed to reject access');
      }
    } catch (err: any) {
      console.error('Reject error:', err);
      alert(err.response?.data?.error || 'Failed to reject access');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getAccessTypeLabel = (accessType: string) => {
    const types: Record<string, { label: string; description: string }> = {
      'VIEW_ONLY': { label: 'View Only', description: 'Can view final valuation only' },
      'TRACK_PROGRESS': { label: 'Track Progress', description: 'Can track valuation progress in real-time' },
      'FULL_ACCESS': { label: 'Full Access', description: 'Can view all details and download reports' }
    };
    return types[accessType] || { label: accessType, description: '' };
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'UNDER_REVIEW': 'bg-orange-100 text-orange-800',
      'APPROVED': 'bg-teal-100 text-teal-800',
      'PUBLISHED': 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const pendingRequests = requests.filter(r => r.clientConsent === null);
  const hasPendingRequests = pendingRequests.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#1B3A5C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1B3A5C] text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-72 h-screen bg-white shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PropertyVal</h1>
            <p className="text-xs text-gray-500">Client Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                item.current ? 'bg-[#1B3A5C]/10 text-[#1B3A5C]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#1B3A5C]'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.current ? 'text-[#1B3A5C]' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${item.current ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 hidden lg:block">Access Requests</h2>

            <div className="flex items-center gap-4 ml-auto">
              <button onClick={fetchAccessRequests} className="p-2 text-gray-400 hover:text-[#1B3A5C] transition-colors" title="Refresh">
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Client'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Requests</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingRequests.length}</p>
                </div>
                <Bell className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {requests.filter(r => r.clientConsent === true).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {requests.filter(r => r.clientConsent === false).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Debug Info - Remove after testing */}
          {requests.length === 0 && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700">
                No access requests found. Total requests in state: {requests.length}
              </p>
            </div>
          )}

          {/* Pending Requests Section */}
          {hasPendingRequests && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Pending Requests ({pendingRequests.length})
              </h2>
              
              {pendingRequests.map((request) => {
                const accessTypeInfo = getAccessTypeLabel(request.accessType);
                return (
                  <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-4 border-b border-orange-100">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-orange-600" />
                            <h3 className="text-lg font-semibold text-gray-900">{request.property.ownerName}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">UPI: {request.property.upiNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs rounded-full ${getStatusBadge(request.property.status)}`}>
                            {request.property.status}
                          </span>
                          <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                            Pending Your Approval
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Institution Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            Requesting Institution
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{request.institution.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{request.institution.email}</span>
                            </div>
                            {request.institution.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{request.institution.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">Requested: {formatDate(request.accessRequestedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Property Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            Property Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{request.property.district}, {request.property.province}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">Status: {request.property.status}</span>
                            </div>
                            {request.property.aiValuation && (
                              <div className="flex items-center gap-2 text-sm mt-2 pt-2 border-t border-gray-200">
                                <span className="font-semibold text-indigo-600">{formatCurrency(request.property.aiValuation)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Access Level Info */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Requested Access Level:</strong> {accessTypeInfo.label}
                          <span className="text-blue-600 text-xs ml-2">({accessTypeInfo.description})</span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleApprove(
                            request.id,
                            request.propertyId,
                            request.institutionId,
                            request.accessType
                          )}
                          disabled={processingId === request.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approve Access
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                        <Link
                          href={`/client/myProperties/${request.propertyId}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Property
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Pending Requests */}
          {!hasPendingRequests && requests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Access Requests</h3>
              <p className="text-gray-500">
                You don't have any pending access requests from financial institutions.
              </p>
              <Link
                href="/client/myProperties"
                className="inline-block mt-4 px-4 py-2 text-[#1B3A5C] hover:underline"
              >
                View Your Properties
              </Link>
            </div>
          )}

          {/* No Pending but have other requests */}
          {!hasPendingRequests && requests.length > 0 && (
            <div className="text-center py-8 bg-white rounded-xl">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-500">
                You have no pending access requests. All requests have been processed.
              </p>
            </div>
          )}

          {/* Approved Requests Section (Collapsible) */}
          {requests.filter(r => r.clientConsent === true).length > 0 && (
            <div className="mt-8">
              <details className="bg-white rounded-xl shadow-sm border border-gray-200">
                <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900 flex items-center gap-2 hover:bg-gray-50">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Approved Access ({requests.filter(r => r.clientConsent === true).length})
                </summary>
                <div className="px-6 pb-4 space-y-3">
                  {requests.filter(r => r.clientConsent === true).map((request) => (
                    <div key={request.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{request.institution.name}</p>
                          <p className="text-sm text-gray-600">Property: {request.property.upiNumber}</p>
                          <p className="text-xs text-gray-500">Approved: {formatDate(request.accessRequestedAt)}</p>
                        </div>
                        <Link
                          href={`/client/myProperties/${request.propertyId}`}
                          className="text-sm text-[#1B3A5C] hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Property
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}