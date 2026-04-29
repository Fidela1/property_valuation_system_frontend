'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LayoutDashboard,
  Building2,
  PlusCircle,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  User,
  TrendingUp,
  Clock,
  CheckCircle,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';
import api from '@/lib/api';

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inFieldwork: 0,
    underReview: 0,
    needsRevision: 0,
    approved: 0,
    published: 0,
    sold: 0,
    archived: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchClientData(token);
  }, [router]);

  const fetchClientData = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ Using your correct backend route: GET /myProperties
      console.log('🔍 Fetching properties from: /myProperties');
      const response = await api.get('/client/myProperties', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📦 Backend response:', response.data);
      
      if (response.data.success) {
        let propertiesData = [];
        
        // Extract properties based on response structure
        if (response.data.data?.properties) {
          propertiesData = response.data.data.properties;
          setCounts(response.data.data.counts || {
            total: propertiesData.length,
            pending: propertiesData.filter((p: any) => p.status === 'PENDING').length,
            assigned: propertiesData.filter((p: any) => p.status === 'ASSIGNED').length,
            inFieldwork: propertiesData.filter((p: any) => p.status === 'IN_FIELDWORK').length,
            underReview: propertiesData.filter((p: any) => p.status === 'UNDER_REVIEW').length,
            needsRevision: propertiesData.filter((p: any) => p.status === 'NEEDS_REVISION').length,
            approved: propertiesData.filter((p: any) => p.status === 'APPROVED').length,
            published: propertiesData.filter((p: any) => p.status === 'PUBLISHED').length,
            sold: propertiesData.filter((p: any) => p.status === 'SOLD').length,
            archived: propertiesData.filter((p: any) => p.status === 'ARCHIVED').length,
          });
        } else if (Array.isArray(response.data.data)) {
          propertiesData = response.data.data;
          // Calculate counts from properties
          setCounts({
            total: propertiesData.length,
            pending: propertiesData.filter((p: any) => p.status === 'PENDING').length,
            assigned: propertiesData.filter((p: any) => p.status === 'ASSIGNED').length,
            inFieldwork: propertiesData.filter((p: any) => p.status === 'IN_FIELDWORK').length,
            underReview: propertiesData.filter((p: any) => p.status === 'UNDER_REVIEW').length,
            needsRevision: propertiesData.filter((p: any) => p.status === 'NEEDS_REVISION').length,
            approved: propertiesData.filter((p: any) => p.status === 'APPROVED').length,
            published: propertiesData.filter((p: any) => p.status === 'PUBLISHED').length,
            sold: propertiesData.filter((p: any) => p.status === 'SOLD').length,
            archived: propertiesData.filter((p: any) => p.status === 'ARCHIVED').length,
          });
        } else {
          propertiesData = response.data.data || [];
        }
        
        setProperties(propertiesData);
        console.log(`✅ Loaded ${propertiesData.length} properties`);
      } else {
        setError(response.data.error || 'Failed to load properties');
      }
    } catch (err: any) {
      console.error('❌ Error fetching properties:', err);
      setError(err.response?.data?.error || err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ASSIGNED': 'bg-blue-100 text-blue-800',
      'IN_FIELDWORK': 'bg-purple-100 text-purple-800',
      'UNDER_REVIEW': 'bg-orange-100 text-orange-800',
      'NEEDS_REVISION': 'bg-red-100 text-red-800',
      'APPROVED': 'bg-teal-100 text-teal-800',
      'PUBLISHED': 'bg-green-100 text-green-800',
      'SOLD': 'bg-gray-100 text-gray-800',
      'ARCHIVED': 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/createProperty', current: true },
    { name: 'My Properties', icon: Building2, href: '/clientDashboard/myProperties', current: false },
    { name: 'Add Property', icon: PlusCircle, href: '/client/properties/create', current: false },
    { name: 'Settings', icon: Settings, href: '/clientDashboard/settings', current: false },
    { name: 'Help & Support', icon: HelpCircle, href: '/clientDashboard/support', current: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 w-72 h-screen bg-white shadow-xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PropertyVal</h1>
            <p className="text-xs text-gray-500">Client Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                ${item.current 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.current ? 'text-indigo-600' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${item.current ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 hidden lg:block">
              My Properties
            </h2>
            
            <div className="flex items-center gap-4 ml-auto">
              {/* Refresh Button */}
              <button
                onClick={() => fetchClientData(localStorage.getItem('token')!)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            
              <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
           
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => fetchClientData(localStorage.getItem('token')!)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try Again →
              </button>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{counts.total}</span>
              </div>
              <p className="text-sm text-gray-600">Total Properties</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-yellow-600">{counts.pending}</span>
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{counts.assigned + counts.inFieldwork}</span>
              </div>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-orange-600">{counts.underReview}</span>
              </div>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">{counts.published}</span>
              </div>
              <p className="text-sm text-gray-600">Published</p>
            </div>
          </div>

          {/* Properties List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">All Properties</h3>
            </div>

            {properties.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h4>
                <p className="text-gray-500 mb-4">Get started by adding your first property</p>
                <Link
                  href="/client/properties/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add New Property
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {properties.map((property: any) => (
                  <div key={property.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">
                            {property.title || `Property ${property.upiNumber}`}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(property.status)}`}>
                            {property.status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">UPI: {property.upiNumber}</p>
                        <p className="text-gray-500 text-sm">
                          {property.district}, {property.province}
                        </p>
                        {property.aiValuation && (
                          <p className="text-indigo-600 font-semibold text-sm mt-2">
                            Valuation: {property.aiValuation.toLocaleString()} RWF
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/client/properties/${property.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}