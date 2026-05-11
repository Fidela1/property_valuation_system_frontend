'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LayoutDashboard,
  Building2,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  TrendingUp,
  Clock,
  Menu,
  X,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Send,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  DollarSign,
  User,
  Briefcase,
  Image as ImageIcon,
  Info,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ExternalLink,
  Printer,
  Download,
  Flag,
  Award,
  Building,
  Landmark,
  Ruler,
  Car,
  TreePine,
  Fence,
  Zap,
  Droplets,
  Maximize,
  Minimize
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import api from '@/lib/api';

const getFullImageUrl = (url: string) => {
  if (!url) return null;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030';
  
  let cleanUrl = url;
  cleanUrl = cleanUrl.replace(/^\.\.\/\.\.\//, '');
  cleanUrl = cleanUrl.replace(/^\.\//, '');
  cleanUrl = cleanUrl.replace(/^\//, '');
  
  if (!cleanUrl.startsWith('uploads') && !cleanUrl.startsWith('/uploads')) {
    cleanUrl = `uploads/${cleanUrl}`;
  }
  
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
  title?: string;
  description?: string;
  propertyType?: string;
  status: string;
  aiValuation: number;
  aiConfidence?: number;
  clientId: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignment?: {
    id: string;
    assignedAt: string;
    notes: string;
    collector: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    assignedBy: {
      name: string;
      email: string;
    };
  };
  fieldData?: {
    propertyType: string;
    landSize?: number;
    buildingSize?: number;
    bedrooms?: number;
    bathrooms?: number;
    condition?: string;
    yearBuilt?: number;
    latitude?: number;
    longitude?: number;
    valuationAmount?: number;
    notes?: string;
  };
  images?: Array<{
    id: string;
    url: string;
    publicId: string;
    isFeatured: boolean;
    order: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface DataCollector {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  currentAssignments?: number;
}

interface DashboardCounts {
  pending: number;
  underReview: number;
  approved: number;
  published: number;
  rejected: number;
  inFieldwork?: number;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function SupervisorDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<DashboardCounts>({
    pending: 0,
    underReview: 0,
    approved: 0,
    published: 0,
    rejected: 0,
    inFieldwork: 0
  });
  const [totalProperties, setTotalProperties] = useState(0);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [valuationTrends, setValuationTrends] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [underReviewProperties, setUnderReviewProperties] = useState<Property[]>([]);
  const [inFieldworkProperties, setInFieldworkProperties] = useState<Property[]>([]);
  const [dataCollectors, setDataCollectors] = useState<DataCollector[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDataCollector, setSelectedDataCollector] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const itemsPerPage = 6;

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/supervisor/dashboard', current: true },
    { name: 'Properties', icon: Building2, href: '/supervisor/properties', current: false },
    { name: 'Data Collectors', icon: Users, href: '/supervisor/data-collectors', current: false },
    { name: 'Settings', icon: Settings, href: '/supervisor/settings', current: false },
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
    
    if (parsedUser.role !== 'SUPERVISOR') {
      router.push('/clientDashboard');
      return;
    }
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, allPropertiesRes, pendingRes, underReviewRes, inFieldworkRes, collectorsRes] = await Promise.all([
        api.get('/supervisor/dashboard', { headers }),
        api.get('/supervisor/dashboard/properties/all', { headers }),
        api.get('/supervisor/dashboard/properties/pending', { headers }),
        api.get('/supervisor/dashboard/properties/under-review', { headers }),
        api.get('/supervisor/dashboard/properties/in-fieldwork', { headers }),
        api.get('/supervisor/dashboard/data-collectors', { headers })
      ]);
      
      if (statsRes.data.success) {
        const countsData = statsRes.data.data?.counts || statsRes.data.data;
        setCounts({
          ...countsData,
          inFieldwork: countsData.inFieldwork || 0
        });
        
        const total = (countsData.pending || 0) + 
                     (countsData.underReview || 0) + 
                     (countsData.approved || 0) + 
                     (countsData.published || 0) + 
                     (countsData.rejected || 0) +
                     (countsData.inFieldwork || 0);
        setTotalProperties(total);
      }
      
      if (allPropertiesRes.data.success) {
        const allData = allPropertiesRes.data.data?.properties || allPropertiesRes.data.data || [];
        setAllProperties(Array.isArray(allData) ? allData : []);
      }
      
      let pendingList: Property[] = [];
      if (pendingRes.data.success) {
        const pendingData = pendingRes.data.data?.properties || pendingRes.data.data || [];
        pendingList = Array.isArray(pendingData) ? pendingData : [];
        setPendingProperties(pendingList);
      }
      
      let underReviewList: Property[] = [];
      if (underReviewRes.data.success) {
        const underReviewData = underReviewRes.data.data?.properties || underReviewRes.data.data || [];
        underReviewList = Array.isArray(underReviewData) ? underReviewData : [];
        setUnderReviewProperties(underReviewList);
      }
      
      let inFieldworkList: Property[] = [];
      if (inFieldworkRes.data.success) {
        const inFieldworkData = inFieldworkRes.data.data?.properties || inFieldworkRes.data.data || [];
        inFieldworkList = Array.isArray(inFieldworkData) ? inFieldworkData : [];
        setInFieldworkProperties(inFieldworkList);
      }
      
      const allPropsForCharts = [...pendingList, ...underReviewList, ...inFieldworkList];
      calculateValuationTrends(allPropsForCharts);
      calculatePropertyTypesFromProperties(allPropsForCharts);
      
      if (collectorsRes.data.success) {
        const collectorsData = collectorsRes.data.data?.collectors || collectorsRes.data.data || [];
        setDataCollectors(Array.isArray(collectorsData) ? collectorsData : []);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAllProperties([]);
      setPendingProperties([]);
      setUnderReviewProperties([]);
      setInFieldworkProperties([]);
      setDataCollectors([]);
      setPropertyTypes([]);
      setValuationTrends([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDetails = async (propertyId: string) => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/supervisor/dashboard/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPropertyDetails(response.data.data);
        setShowDetailsModal(true);
        setCurrentImageIndex(0);
      } else {
        alert('Failed to load property details');
      }
    } catch (err: any) {
      console.error('Error fetching property details:', err);
      alert(err.response?.data?.error || 'Error loading property details');
    } finally {
      setLoadingAction(false);
    }
  };

  const calculatePropertyTypesFromProperties = (properties: Property[]) => {
    const typeColors: Record<string, string> = {
      'HOUSE': '#6366F1',
      'APARTMENT': '#10B981',
      'VILLA': '#F59E0B',
      'LAND': '#EF4444',
      'COMMERCIAL': '#8B5CF6'
    };
    
    const typeNames: Record<string, string> = {
      'HOUSE': 'House',
      'APARTMENT': 'Apartment',
      'VILLA': 'Villa',
      'LAND': 'Land',
      'COMMERCIAL': 'Commercial'
    };
    
    const typeCount = new Map<string, number>();
    
    properties.forEach(property => {
      let propertyType = (property as any).propertyType;
      if ((property as any).fieldData?.propertyType) {
        propertyType = (property as any).fieldData.propertyType;
      }
      
      if (propertyType && typeNames[propertyType]) {
        typeCount.set(propertyType, (typeCount.get(propertyType) || 0) + 1);
      }
    });
    
    if (typeCount.size === 0) {
      setPropertyTypes([]);
      return;
    }
    
    const total = properties.length;
    const data = Array.from(typeCount.entries()).map(([name, value]) => ({
      name: typeNames[name] || name,
      value,
      percentage: Number(((value / total) * 100).toFixed(1)),
      color: typeColors[name] || '#6B7280'
    }));
    
    data.sort((a, b) => b.value - a.value);
    setPropertyTypes(data);
  };

  const calculateValuationTrends = (properties: Property[]) => {
    const monthlyMap = new Map<string, { count: number; totalValue: number }>();
    
    properties.forEach(property => {
      if (property.createdAt && property.aiValuation && property.aiValuation > 0) {
        const date = new Date(property.createdAt);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthKey = `${monthName} ${year}`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { count: 0, totalValue: 0 });
        }
        
        const data = monthlyMap.get(monthKey)!;
        data.count++;
        data.totalValue += property.aiValuation;
      }
    });
    
    if (monthlyMap.size === 0) {
      setValuationTrends([]);
      return;
    }
    
    const trends = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        count: data.count,
        averageValue: Math.round(data.totalValue / data.count)
      }))
      .slice(-6);
    
    setValuationTrends(trends);
  };

  const handleAssignCollector = async () => {
  if (!selectedProperty || !selectedDataCollector) {
    alert('Please select a data collector');
    return;
  }
  
  setLoadingAction(true);
  try {
    const token = localStorage.getItem('token');
    
    // Make sure you're sending 'collectorId' - exactly as your backend expects
    const response = await api.post(
      `/supervisor/dashboard/properties/${selectedProperty.id}/assign`,
      {
        collectorId: selectedDataCollector,  // ← This must match backend field name
        notes: "Review this property"
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.data.success) {
      alert('Data collector assigned successfully!');
      setShowAssignModal(false);
      setShowDetailsModal(false);
      setSelectedProperty(null);
      setSelectedDataCollector('');
      fetchDashboardData();
    } else {
      alert(response.data.error || 'Failed to assign collector');
    }
  } catch (err: any) {
    console.error('Assignment error:', err);
    console.error('Error response:', err.response?.data);
    alert(err.response?.data?.error || 'Error assigning collector');
  } finally {
    setLoadingAction(false);
  }
};
  const handleApproveProperty = async (propertyId: string) => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/supervisor/dashboard/properties/${propertyId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('Property approved successfully!');
        setShowDetailsModal(false);
        fetchDashboardData();
      } else {
        alert(response.data.error || 'Failed to approve property');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error approving property');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejectProperty = async () => {
    if (!selectedProperty) return;
    
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/supervisor/dashboard/properties/${selectedProperty.id}/reject`, {
        reason: rejectionReason
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (response.data.success) {
        alert('Property rejected successfully!');
        setShowRejectModal(false);
        setShowDetailsModal(false);
        setSelectedProperty(null);
        setRejectionReason('');
        fetchDashboardData();
      } else {
        alert(response.data.error || 'Failed to reject property');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error rejecting property');
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePublishProperty = async (propertyId: string) => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/supervisor/dashboard/properties/${propertyId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('Property published successfully!');
        setShowDetailsModal(false);
        fetchDashboardData();
      } else {
        alert(response.data.error || 'Failed to publish property');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error publishing property');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
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
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ASSIGNED': 'bg-blue-100 text-blue-800',
      'IN_FIELDWORK': 'bg-indigo-100 text-indigo-800',
      'UNDER_REVIEW': 'bg-orange-100 text-orange-800',
      'NEEDS_REVISION': 'bg-red-100 text-red-800',
      'APPROVED': 'bg-teal-100 text-teal-800',
      'PUBLISHED': 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_FIELDWORK': return <Activity className="w-4 h-4" />;
      case 'UNDER_REVIEW': return <Eye className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'PUBLISHED': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Filter and paginate properties
  const getFilteredProperties = (properties: Property[]) => {
    let filtered = properties;
    if (searchTerm) {
      filtered = properties.filter(p => 
        p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.upiNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const getPaginatedProperties = (properties: Property[]) => {
    const start = (currentPage - 1) * itemsPerPage;
    return properties.slice(start, start + itemsPerPage);
  };

  const allFiltered = getFilteredProperties(allProperties);
  const allPaginated = getPaginatedProperties(allFiltered);
  const allTotalPages = Math.ceil(allFiltered.length / itemsPerPage);
  
  const pendingFiltered = getFilteredProperties(pendingProperties);
  const pendingPaginated = getPaginatedProperties(pendingFiltered);
  const pendingTotalPages = Math.ceil(pendingFiltered.length / itemsPerPage);
  
  const underReviewFiltered = getFilteredProperties(underReviewProperties);
  const underReviewPaginated = getPaginatedProperties(underReviewFiltered);
  const underReviewTotalPages = Math.ceil(underReviewFiltered.length / itemsPerPage);
  
  const inFieldworkFiltered = getFilteredProperties(inFieldworkProperties);
  const inFieldworkPaginated = getPaginatedProperties(inFieldworkFiltered);
  const inFieldworkTotalPages = Math.ceil(inFieldworkFiltered.length / itemsPerPage);

  const pendingPercentage = totalProperties > 0 ? ((counts.pending / totalProperties) * 100).toFixed(0) : 0;
  const inProgress = (counts.pending || 0) + (counts.underReview || 0) + (counts.inFieldwork || 0);
  const inProgressPercentage = totalProperties > 0 ? ((inProgress / totalProperties) * 100).toFixed(0) : 0;
  const completed = (counts.approved || 0) + (counts.published || 0);
  const completedPercentage = totalProperties > 0 ? ((completed / totalProperties) * 100).toFixed(0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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
      <aside className={`
        fixed top-0 left-0 z-40 w-72 h-screen bg-white shadow-xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PropertyVal</h1>
            <p className="text-xs text-gray-500">Supervisor Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                ${item.current 
                  ? 'bg-[#1B3A5C]/10 text-[#1B3A5C]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#1B3A5C]'
                }
              `}
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
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 hidden lg:block">
              Supervisor Dashboard
            </h2>
            
            <div className="flex items-center gap-4 ml-auto">
              <button onClick={fetchDashboardData} className="p-2 text-gray-400 hover:text-[#1B3A5C] transition-colors" title="Refresh">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Supervisor'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards - 5 cards: Total Properties, Pending, In Fieldwork, Under Review, Published */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
  {/* Card 1: Total Properties */}
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Total Properties</p>
        <p className="text-3xl font-bold text-gray-900">{totalProperties}</p>
        <p className="text-xs text-gray-500 mt-1">All properties in system</p>
      </div>
      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
        <Building2 className="w-6 h-6 text-indigo-600" />
      </div>
    </div>
  </div>
  
  {/* Card 2: Pending */}
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Pending</p>
        <p className="text-3xl font-bold text-yellow-600">{counts.pending}</p>
        <p className="text-xs text-gray-500 mt-1">Awaiting assignment</p>
      </div>
      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
        <Clock className="w-6 h-6 text-yellow-600" />
      </div>
    </div>
  </div>
  
  {/* Card 3: In Fieldwork */}
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">In Fieldwork</p>
        <p className="text-3xl font-bold text-blue-600">{counts.inFieldwork || 0}</p>
        <p className="text-xs text-gray-500 mt-1">Data collection in progress</p>
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Activity className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
  
  {/* Card 4: Under Review */}
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Under Review</p>
        <p className="text-3xl font-bold text-orange-600">{counts.underReview}</p>
        <p className="text-xs text-gray-500 mt-1">Ready for approval</p>
      </div>
      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
        <Eye className="w-6 h-6 text-orange-600" />
      </div>
    </div>
  </div>
  
  {/* Card 5: Published */}
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Published</p>
        <p className="text-3xl font-bold text-green-600">{counts.published}</p>
        <p className="text-xs text-gray-500 mt-1">Live on platform</p>
      </div>
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <Star className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </div>
</div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Property Valuations Over Time</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80 min-h-[320px] w-full">
                {valuationTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={valuationTrends}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="count" name="Number of Properties" stroke="#6366F1" fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                    <p>No valuation data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Property Types Distribution</h3>
                <PieChartIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80 min-h-[320px] w-full">
                {propertyTypes.length > 0 && propertyTypes.some(t => t.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      >
                        {propertyTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <PieChartIcon className="w-12 h-12 mb-2 opacity-50" />
                    <p>No property type data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties by owner, UPI, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                <button
                  onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'border-b-2 border-[#1B3A5C] text-[#1B3A5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Properties ({allProperties.length})
                </button>
                <button
                  onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'pending'
                      ? 'border-b-2 border-[#1B3A5C] text-[#1B3A5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pending ({pendingProperties.length})
                </button>
                <button
                  onClick={() => { setActiveTab('in-fieldwork'); setCurrentPage(1); }}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'in-fieldwork'
                      ? 'border-b-2 border-[#1B3A5C] text-[#1B3A5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  In Fieldwork ({inFieldworkProperties.length})
                </button>
                <button
                  onClick={() => { setActiveTab('under-review'); setCurrentPage(1); }}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'under-review'
                      ? 'border-b-2 border-[#1B3A5C] text-[#1B3A5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Under Review ({underReviewProperties.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'all' && allFiltered.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No properties found</p>
                </div>
              )}
              
              {activeTab === 'pending' && pendingFiltered.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No pending properties to assign</p>
                </div>
              )}
              
              {activeTab === 'in-fieldwork' && inFieldworkFiltered.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No properties in fieldwork</p>
                </div>
              )}
              
              {activeTab === 'under-review' && underReviewFiltered.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No properties under review</p>
                </div>
              )}

              {/* All Properties Cards */}
              {activeTab === 'all' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allPaginated.map((property) => (
                    <div key={property.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gray-100">
  {property.images && property.images.length > 0 ? (
    <img
      src={getFullImageUrl(property.images[0]?.url)}
      alt={property.ownerName}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <ImageIcon className="w-12 h-12 text-gray-400" />
    </div>
  )}
  {property.images && property.images.length > 0 && (
    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
      <ImageIcon className="w-3 h-3" />
      {property.images.length}
    </div>
  )}
  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadge(property.status)}`}>
    {getStatusIcon(property.status)}
    {property.status}
  </span>
</div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">UPI: {property.upiNumber}</p>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{property.ownerName}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{property.district}, {property.province}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{property.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">Created: {formatDate(property.createdAt)}</span>
                          </div>
                          {property.aiValuation > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-indigo-600 font-semibold">{formatCurrency(property.aiValuation)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                       <Link
  href={`/supervisor/dashboard/properties/${property.id}`}
  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors text-sm font-medium"
>
  <Eye className="w-4 h-4" />
  View Details
</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Properties Cards */}
              {activeTab === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingPaginated.map((property) => (
                    <div key={property.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-gray-100">
  {property.images && property.images.length > 0 ? (
    <img
      src={getFullImageUrl(property.images[0]?.url)}
      alt={property.ownerName}
      className="w-full h-full object-cover"
      onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <ImageIcon className="w-12 h-12 text-gray-400" />
    </div>
  )}
  {/* Add this line for image count */}
  {property.images && property.images.length > 0 && (
    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
      <ImageIcon className="w-3 h-3" />
      {property.images.length}
    </div>
  )}
  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadge(property.status)}`}>
    {getStatusIcon(property.status)}
    {property.status}
  </span>
</div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">UPI: {property.upiNumber}</p>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{property.ownerName}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{property.district}, {property.province}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{property.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">Created: {formatDate(property.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                        <Link
  href={`/supervisor/dashboard/properties/${property.id}`}
  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors text-sm font-medium"
>
  <Eye className="w-4 h-4" />
  View Details
</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* In Fieldwork Properties Cards */}
              {activeTab === 'in-fieldwork' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inFieldworkPaginated.map((property) => (
                    <div key={property.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-gray-100">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={getFullImageUrl(property.images[0]?.url)}
                            alt={property.ownerName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadge(property.status)}`}>
                          {getStatusIcon(property.status)}
                          {property.status}
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">UPI: {property.upiNumber}</p>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{property.ownerName}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{property.district}, {property.province}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{property.phoneNumber}</span>
                          </div>
                          {property.assignment?.collector && (
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Collector: {property.assignment.collector.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">Assigned: {formatDate(property.assignment?.assignedAt || property.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                       <Link
  href={`/supervisor/dashboard/properties/${property.id}`}
  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors text-sm font-medium"
>
  <Eye className="w-4 h-4" />
  View Details
</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Under Review Properties Cards */}
              {activeTab === 'under-review' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {underReviewPaginated.map((property) => (
                    <div key={property.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-gray-100">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={getFullImageUrl(property.images[0]?.url)}
                            alt={property.ownerName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadge(property.status)}`}>
                          {getStatusIcon(property.status)}
                          {property.status}
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">UPI: {property.upiNumber}</p>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{property.ownerName}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{property.district}, {property.province}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{property.phoneNumber}</span>
                          </div>
                          {property.assignment?.collector && (
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Collector: {property.assignment.collector.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <Link
  href={`/supervisor/dashboard/properties/${property.id}`}
  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors text-sm font-medium"
>
  <Eye className="w-4 h-4" />
  View Details
</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {activeTab === 'all' && allTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
                  <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of {allTotalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(allTotalPages, p + 1))} disabled={currentPage === allTotalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
                </div>
              )}
              
              {activeTab === 'pending' && pendingTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
                  <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of {pendingTotalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(pendingTotalPages, p + 1))} disabled={currentPage === pendingTotalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
                </div>
              )}
              
              {activeTab === 'in-fieldwork' && inFieldworkTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
                  <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of {inFieldworkTotalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(inFieldworkTotalPages, p + 1))} disabled={currentPage === inFieldworkTotalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
                </div>
              )}
              
              {activeTab === 'under-review' && underReviewTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
                  <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of {underReviewTotalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(underReviewTotalPages, p + 1))} disabled={currentPage === underReviewTotalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
                </div>
              )}
            </div>
          </div>

          {/* Data Collectors Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Available Data Collectors</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataCollectors.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No data collectors available</td></tr>
                  ) : (
                    dataCollectors.map((collector) => (
                      <tr key={collector.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{collector.name}</p>
                              <p className="text-xs text-gray-500">{collector.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{collector.phone || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${collector.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {collector.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{collector.currentAssignments || 0} active</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Property Details Modal - Same as before */}
      {showDetailsModal && propertyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
                <p className="text-sm text-gray-500">UPI: {propertyDetails.upiNumber}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Image Gallery */}
              {propertyDetails.images && propertyDetails.images.length > 0 && (
                <div className="mb-6">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64 md:h-96">
                    <img src={getFullImageUrl(propertyDetails.images[currentImageIndex]?.url)} alt={`Property ${propertyDetails.upiNumber}`} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }} />
                    {propertyDetails.images.length > 1 && (
                      <>
                        <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? propertyDetails.images!.length - 1 : prev - 1)} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => setCurrentImageIndex(prev => prev === propertyDetails.images!.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><ChevronRightIcon className="w-5 h-5" /></button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {propertyDetails.images.map((img, idx) => (
                      <button key={img.id} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${idx === currentImageIndex ? 'border-[#1B3A5C] ring-2 ring-[#1B3A5C]/20' : 'border-gray-200 hover:border-gray-400'}`}>
                        <img src={getFullImageUrl(img.url)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Info className="w-4 h-4" /> Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Owner Name:</span><span className="font-medium">{propertyDetails.ownerName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">ID/TIN:</span><span>{propertyDetails.idOrTin}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span>{propertyDetails.phoneNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(propertyDetails.status)}`}>{propertyDetails.status}</span></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Province:</span><span>{propertyDetails.province}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">District:</span><span>{propertyDetails.district}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Sector:</span><span>{propertyDetails.sector}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cell:</span><span>{propertyDetails.cell}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Village:</span><span>{propertyDetails.village}</span></div>
                  </div>
                </div>
                {propertyDetails.assignment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Assignment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Data Collector:</span><span className="font-medium">{propertyDetails.assignment.collector.name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Collector Email:</span><span>{propertyDetails.assignment.collector.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Assigned By:</span><span>{propertyDetails.assignment.assignedBy.name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Assigned At:</span><span>{formatDate(propertyDetails.assignment.assignedAt)}</span></div>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Valuation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">AI Valuation:</span><span className="font-semibold text-indigo-600">{formatCurrency(propertyDetails.aiValuation || 0)}</span></div>
                    {propertyDetails.fieldData?.valuationAmount && <div className="flex justify-between"><span className="text-gray-500">Field Valuation:</span><span className="font-semibold text-green-600">{formatCurrency(propertyDetails.fieldData.valuationAmount)}</span></div>}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  {propertyDetails.status === 'PENDING' && (
                    <button onClick={() => { setSelectedProperty(propertyDetails); setShowAssignModal(true); setShowDetailsModal(false); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><UserCheck className="w-4 h-4" /> Assign Collector</button>
                  )}
                  {propertyDetails.status === 'UNDER_REVIEW' && (
                    <>
                      <button onClick={() => handleApproveProperty(propertyDetails.id)} disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"><CheckCircle className="w-4 h-4" /> Approve Valuation</button>
                      <button onClick={() => { setSelectedProperty(propertyDetails); setShowRejectModal(true); setShowDetailsModal(false); }} disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"><XCircle className="w-4 h-4" /> Reject</button>
                      <button onClick={() => handlePublishProperty(propertyDetails.id)} disabled={loadingAction} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"><Star className="w-4 h-4" /> Publish</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Collector Modal */}
      {showAssignModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Assign Data Collector</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="mb-4"><p className="text-sm text-gray-600 mb-1">Property:</p><p className="font-medium text-gray-900">{selectedProperty.ownerName} - {selectedProperty.upiNumber}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Select Data Collector</label>
                <select 
  value={selectedDataCollector} 
  onChange={(e) => {
    console.log('Selected collector ID:', e.target.value); // Debug log
    setSelectedDataCollector(e.target.value);
  }} 
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
>
  <option value="">Choose a collector...</option>
  {dataCollectors
    .filter(c => c.isActive === true)
    .map((collector) => (
      <option key={collector.id} value={collector.id}>
        {collector.name} - {collector.email}
      </option>
    ))}
</select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleAssignCollector} disabled={loadingAction} className="flex-1 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] disabled:opacity-50">{loadingAction ? 'Assigning...' : 'Assign'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Property Modal */}
      {showRejectModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Reject Property</h2>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="mb-4"><p className="text-sm text-gray-600 mb-1">Property:</p><p className="font-medium text-gray-900">{selectedProperty.ownerName} - {selectedProperty.upiNumber}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none" placeholder="Please provide a reason for rejection..." />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleRejectProperty} disabled={loadingAction || !rejectionReason} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">{loadingAction ? 'Rejecting...' : 'Reject Property'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}