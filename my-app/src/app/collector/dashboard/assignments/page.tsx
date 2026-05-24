'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LayoutDashboard,
  ClipboardList,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Menu,
  X,
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  Eye,
  AlertCircle,
  Loader2,
  Camera,
  ArrowRight,
  PenTool,
  ExternalLink
} from 'lucide-react';
import api from '@/lib/api';

interface Assignment {
  id: string;
  propertyId: string;
  upiNumber: string;
  ownerName: string;
  phoneNumber: string;
  district: string;
  province: string;
  status: string;
  assignedAt: string;
  notes: string;
}

export default function CollectorAssignmentsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/collector/dashboard', current: false },
    { name: 'Assignments', icon: ClipboardList, href: '/collector/dashboard/assignments', current: true },
    { name: 'Settings', icon: Settings, href: '/collector/settings', current: false },
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
    
    if (parsedUser.role !== 'DATA_COLLECTOR') {
      router.push('/clientDashboard');
      return;
    }
    
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/collector/dashboard/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const properties = response.data.data?.properties || [];
        
        const formattedData: Assignment[] = properties.map((item: any) => {
          const assignmentId = item.assignment?.id;
          const propertyId = item.id;
          
          return {
            id: assignmentId || propertyId,
            propertyId: propertyId,
            upiNumber: item.upiNumber,
            ownerName: item.ownerName,
            phoneNumber: item.phoneNumber,
            district: item.district,
            province: item.province,
            status: item.status,
            assignedAt: item.assignment?.assignedAt,
            notes: item.assignment?.notes
          };
        });
        
        setAssignments(formattedData);
        
        console.log('Assignments with correct IDs:', formattedData.map(a => ({
          navigationId: a.id,
          propertyId: a.propertyId,
          owner: a.ownerName
        })));
      }
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError(err.response?.data?.error || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.upiNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNavigationId = (assignment: Assignment) => {
    if (assignment.id && assignment.id !== assignment.propertyId) {
      return assignment.id;
    }
    return assignment.propertyId;
  };

  const handleAddFieldData = (assignment: any) => {
    const propertyId = assignment.property?.id || assignment.propertyId || assignment.id;
    localStorage.setItem('currentPropertyId', propertyId);
    router.push('/collector/dashboard/field-data');
  };

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
            <p className="text-xs text-gray-500">Data Collector Portal</p>
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
              My Assignments
            </h2>
            
            <div className="flex items-center gap-4 ml-auto">
              <button onClick={fetchAssignments} className="p-2 text-gray-400 hover:text-[#1B3A5C] transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Data Collector'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'D'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={fetchAssignments}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Try Again →
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by owner name, UPI number, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
            />
          </div>

          {/* Assignments Grid */}
          {filteredAssignments.length === 0 && !error ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assignments found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5F8A] px-4 py-3">
                    <p className="text-xs text-blue-100">UPI: {assignment.upiNumber}</p>
                    <p className="text-sm font-semibold text-white mt-1">{assignment.ownerName}</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#1B3A5C]" />
                        <span className="text-gray-600">{assignment.district}, {assignment.province}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-[#1B3A5C]" />
                        <span className="text-gray-600">{assignment.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-[#1B3A5C]" />
                        <span className="text-gray-500">Assigned: {formatDate(assignment.assignedAt)}</span>
                      </div>
                      {assignment.notes && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-gray-600 border border-blue-100">
                          <p className="font-medium text-[#1B3A5C] text-xs mb-1">Notes:</p>
                          <p className="line-clamp-2 text-gray-600">{assignment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Side-by-Side Buttons */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-2">
                      {/* View Details Button */}
                      <Link
                        href={`/collector/dashboard/assignments/${getNavigationId(assignment)}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      
                      {/* Add Field Data Button */}
                      <button
                        onClick={() => handleAddFieldData(assignment)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-all duration-200 text-sm font-medium shadow-sm"
                      >
                        <PenTool className="w-4 h-4" />
                        Add Data
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}