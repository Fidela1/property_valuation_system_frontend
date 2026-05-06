'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Building2,
  Clock,
  CheckCircle,
  TrendingUp,
  UserPlus,
  Home,
  Eye,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Menu,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
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

// Types
interface AdminDashboardStats {
  totalUsers: number;
  totalProperties: number;
  pendingApplications: number;
  activeAssignments: number;
  underReview: number;
  publishedProperties: number;
  totalEmployees: number;
}

interface UserByRole {
  data: Array<{
    name: string;
    value: number;
    percentage: string;
    color: string;
    icon: string;
    description: string;
  }>;
  total: number;
}

interface MonthlyRegistration {
  data: Array<{
    month: string;
    total: number;
    clients: number;
    dataCollectors: number;
    supervisors: number;
    admins: number;
  }>;
  totalForYear: number;
  averagePerMonth: number;
  year: number;
}

interface GrowthTrend {
  data: Array<{
    month: string;
    newUsers: number;
    cumulativeTotal: number;
  }>;
  growthRate: number;
  totalUsers: number;
}

interface UserEngagement {
  totalUsers: number;
  usersWithProperties: number;
  clientEngagementRate: string;
  activeDataCollectors: number;
  activeSupervisors: number;
  newUsersLast30Days: number;
  newUsersRate: string;
}

interface UserStatus {
  activity: {
    active: number;
    inactive: number;
    activePercentage: string;
  };
  verification: {
    verified: number;
    unverified: number;
    verifiedPercentage: string;
  };
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  joinedDate: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminDashboardStats | null>(null);
  const [usersByRole, setUsersByRole] = useState<UserByRole | null>(null);
  const [monthlyRegistrations, setMonthlyRegistrations] = useState<MonthlyRegistration | null>(null);
  const [growthTrend, setGrowthTrend] = useState<GrowthTrend | null>(null);
  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Menu items for sidebar
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard', current: true },
    { name: 'Manage Users', icon: Users, href: '/admin/dashboard/manage-users', current: false },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics', current: false },
    { name: 'Settings', icon: Settings, href: '/admin/settings', current: false },
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
    
    if (parsedUser.role !== 'ADMIN') {
      router.push('/clientDashboard');
      return;
    }
    
    fetchDashboardData();
  }, [selectedYear]);

 const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    // Fetch admin dashboard stats
    const adminStatsRes = await api.get('/admin/dashboard', { headers });
    
    console.log('Full admin stats response:', JSON.stringify(adminStatsRes.data, null, 2));
    
    // Extract stats from the correct nested structure: data.counts
    let statsData = null;
    if (adminStatsRes.data?.data?.counts) {
      statsData = adminStatsRes.data.data.counts;
    } else if (adminStatsRes.data?.data) {
      statsData = adminStatsRes.data.data;
    } else if (adminStatsRes.data?.counts) {
      statsData = adminStatsRes.data.counts;
    } else {
      statsData = adminStatsRes.data;
    }
    
    console.log('Extracted stats data:', statsData);
    setAdminStats(statsData);
    
    // Fetch other analytics data
    const usersByRoleRes = await api.get('/user-analytics/by-role', { headers });
    const monthlyRes = await api.get(`/user-analytics/monthly-registrations?year=${selectedYear}`, { headers });
    const growthRes = await api.get('/user-analytics/growth-trend', { headers });
    const engagementRes = await api.get('/user-analytics/engagement', { headers });
    const statusRes = await api.get('/user-analytics/status-distribution', { headers });
    const recentUsersRes = await api.get('/user-analytics/recent-joined?limit=5', { headers });
    
    if (usersByRoleRes.data?.success) setUsersByRole(usersByRoleRes.data.data);
    if (monthlyRes.data?.success) setMonthlyRegistrations(monthlyRes.data.data);
    if (growthRes.data?.success) setGrowthTrend(growthRes.data.data);
    if (engagementRes.data?.success) setEngagement(engagementRes.data.data);
    if (statusRes.data?.success) setUserStatus(statusRes.data.data);
    if (recentUsersRes.data?.success) setRecentUsers(recentUsersRes.data.data);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

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
          <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PropertyVal</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
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

      <main className="lg:ml-72 min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 hidden lg:block">
              Dashboard Overview
            </h2>
            
            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={() => fetchDashboardData()}
                className="p-2 text-gray-400 hover:text-[#1B3A5C] transition-colors"
                title="Refresh"
              >
                <TrendingUp className="w-5 h-5" />
              </button>

              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            
              {/* User Profile */}
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
        
         {/* Stats Cards Row - Only 3 cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Total Users Card */}
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Total Users</p>
        <p className="text-3xl font-bold text-gray-900">{adminStats?.totalUsers || 0}</p>
        <p className="text-xs text-gray-500 mt-1">All registered users</p>
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Users className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
  
  {/* Active Users Card */}
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Active Users</p>
        <p className="text-3xl font-bold text-green-600">{userStatus?.activity.active || 0}</p>
        <p className="text-xs text-gray-500 mt-1">Currently active accounts</p>
      </div>
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </div>
  
  {/* Inactive Users Card */}
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Inactive Users</p>
        <p className="text-3xl font-bold text-red-600">{userStatus?.activity.inactive || 0}</p>
        <p className="text-xs text-gray-500 mt-1">Disabled or suspended accounts</p>
      </div>
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <Clock className="w-6 h-6 text-red-600" />
      </div>
    </div>
  </div>
</div>

          {/* Second Row of Stats Cards - Additional metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            
           
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Users by Role - Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80 min-h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={usersByRole?.data || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={false}
                    >
                      {(usersByRole?.data || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} users (${props.payload.percentage}%)`, name]} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(usersByRole?.data || []).map((role, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-lg">{role.icon}</span>
                      <span className="text-gray-600">{role.name}:</span>
                      <span className="font-semibold">{role.value} ({role.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
 {/* User Growth Trend - Area Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Growth Trend</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80 min-h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthTrend?.data || []}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="cumulativeTotal" name="Total Users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
                    <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#10B981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Total Users:</span>
                  <span className="font-semibold ml-2">{growthTrend?.totalUsers || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Growth Rate:</span>
                  <span className="font-semibold ml-2 text-green-600">↑ {growthTrend?.growthRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           

            {/* User Status Distribution - Donut Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Status</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Active/Inactive Donut */}
                <div className="text-center">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={[
                            { name: 'Active', value: userStatus?.activity.active || 0, color: '#10B981' },
                            { name: 'Inactive', value: userStatus?.activity.inactive || 0, color: '#EF4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          dataKey="value"
                          label={false}
                        >
                          <Cell fill="#10B981" />
                          <Cell fill="#EF4444" />
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm font-medium mt-2">Active: {userStatus?.activity.activePercentage || 0}%</p>
                  <p className="text-xs text-gray-500">Active vs Inactive</p>
                </div>
                
                {/* Verified/Unverified Donut */}
                <div className="text-center">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={[
                            { name: 'Verified', value: userStatus?.verification.verified || 0, color: '#8B5CF6' },
                            { name: 'Unverified', value: userStatus?.verification.unverified || 0, color: '#F59E0B' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          dataKey="value"
                          label={false}
                        >
                          <Cell fill="#8B5CF6" />
                          <Cell fill="#F59E0B" />
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm font-medium mt-2">Verified: {userStatus?.verification.verifiedPercentage || 0}%</p>
                  <p className="text-xs text-gray-500">Email Verified</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Active:</span>
                    <span className="font-semibold">{userStatus?.activity.active || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-semibold">{userStatus?.verification.verified || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Inactive:</span>
                    <span className="font-semibold">{userStatus?.activity.inactive || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Unverified:</span>
                    <span className="font-semibold">{userStatus?.verification.unverified || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Recently Joined Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'SUPERVISOR' ? 'bg-yellow-100 text-yellow-800' :
                          user.role === 'DATA_COLLECTOR' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.joinedDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs ${user.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {user.isEmailVerified ? '✓ Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}