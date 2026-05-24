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
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/supervisor/dashboard', current: true },
    { name: 'Properties', icon: Building2, href: '/supervisor/dashboard/properties', current: false },
    { name: 'Data Collectors', icon: Users, href: '/supervisor/dashboard/data-collectors', current: false },
    { name: 'Reports', icon: FileText, href: '/supervisor/reports', current: false },
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
      
      const [statsRes, allPropertiesRes] = await Promise.all([
        api.get('/supervisor/dashboard', { headers }),
        api.get('/supervisor/dashboard/properties/all', { headers })
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
      
      let allProperties: any[] = [];
      if (allPropertiesRes.data.success) {
        allProperties = allPropertiesRes.data.data?.properties || allPropertiesRes.data.data || [];
        allProperties = Array.isArray(allProperties) ? allProperties : [];
      }
      
      calculateValuationTrends(allProperties);
      calculatePropertyTypesFromProperties(allProperties);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setPropertyTypes([]);
      setValuationTrends([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePropertyTypesFromProperties = (properties: any[]) => {
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
      let propertyType = property.propertyType;
      if (property.fieldData?.propertyType) {
        propertyType = property.fieldData.propertyType;
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

  const calculateValuationTrends = (properties: any[]) => {
    // Initialize monthly data from April to current month
    const monthlyData: { [key: string]: { count: number; totalValue: number; order: number } } = {};
    
    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // Month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Determine starting point: April of current year or last year
    let startYear = currentYear;
    let startMonth = 3; // April is month index 3
    
    // If current month is before April, start from April of last year
    if (currentMonth < 3) {
      startYear = currentYear - 1;
    }
    
    // Initialize all months from start to current month
    let year = startYear;
    let month = startMonth;
    let order = 0;
    
    while (year < currentYear || (year === currentYear && month <= currentMonth)) {
      const monthKey = `${monthNames[month]} ${year}`;
      monthlyData[monthKey] = { count: 0, totalValue: 0, order: order };
      order++;
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
    
    // Populate with actual property data
    properties.forEach(property => {
      if (property.createdAt && property.aiValuation && property.aiValuation > 0) {
        const date = new Date(property.createdAt);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthKey = `${monthName} ${year}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].count++;
          monthlyData[monthKey].totalValue += property.aiValuation;
        }
      }
    });
    
    // Convert to array for chart, sorted by order
    const trends = Object.entries(monthlyData)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([month, data]) => ({
        month,
        count: data.count,
        averageValue: data.count > 0 ? Math.round(data.totalValue / data.count) : 0
      }));
    
    console.log('Valuation trends:', trends); // Debug log to see what's being generated
    
    setValuationTrends(trends);
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
              Dashboard Overview
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
          {/* Stats Cards - 5 cards with colored left borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Card 1: Total Properties */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-indigo-500 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Properties</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalProperties}</p>
                    <p className="text-xs text-gray-400 mt-1">All properties in system</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 2: Pending */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-yellow-500 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">{counts.pending}</p>
                    <p className="text-xs text-gray-400 mt-1">Awaiting assignment</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 3: In Fieldwork */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">In Fieldwork</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{counts.inFieldwork || 0}</p>
                    <p className="text-xs text-gray-400 mt-1">Data collection in progress</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 4: Under Review */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-orange-500 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Under Review</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{counts.underReview}</p>
                    <p className="text-xs text-gray-400 mt-1">Ready for approval</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 5: Approved */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-green-500 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{counts.approved}</p>
                    <p className="text-xs text-gray-400 mt-1">Approved properties</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Property Valuations Over Time */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Property Valuations Over Time</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Monthly submission trends</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="p-6">
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
            </div>

            {/* Property Types Distribution - FIXED */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Property Types Distribution</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Breakdown by property category</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <PieChartIcon className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="p-6">
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
                          // FIXED: Added null check for percent
                          label={({ name, percent }) => {
                            if (percent && percent > 0) {
                              return `${name}: ${(percent * 100).toFixed(0)}%`;
                            }
                            return '';
                          }}
                        >
                          {propertyTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} properties`, name]} />
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
          </div>
        </div>
      </main>
    </div>
  );
}