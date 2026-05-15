'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LayoutDashboard,
  ClipboardList,
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
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Star,
  Activity,
  DollarSign,
  User,
  Briefcase,
  Image as ImageIcon,
  Camera,
  Save,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Building2,
  Edit
} from 'lucide-react';
import api from '@/lib/api';

interface Assignment {
  id: string;
  upiNumber: string;
  ownerName: string;
  phoneNumber: string;
  district: string;
  province: string;
  sector: string;
  cell: string;
  village: string;
  status: string;
  aiValuation?: number;
  assignedAt: string;
  notes: string;
  propertyId?: string;
}

interface Submission {
  id: string;
  fieldDataId?: string;
  propertyId: string;
  property: {
    upiNumber: string;
    ownerName: string;
    district: string;
    status: string;
  };
  submittedAt: string;
  status: string;
  valuationAmount?: number;
}

interface RevisionRequest {
  id: string;
  propertyId: string;
  property: {
    upiNumber: string;
    ownerName: string;
  };
  comment: string;
  requestedAt: string;
  status: string;
}

const getFullImageUrl = (url: string) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030';
  let cleanUrl = url.replace(/^\.\.\/\.\.\//, '').replace(/^\.\//, '').replace(/^\//, '');
  if (!cleanUrl.startsWith('uploads') && !cleanUrl.startsWith('/uploads')) {
    cleanUrl = `uploads/${cleanUrl}`;
  }
  return `${backendUrl}/${cleanUrl}`;
};

export default function CollectorDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [revisions, setRevisions] = useState<RevisionRequest[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showFieldDataModal, setShowFieldDataModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Field data form state
  const [fieldData, setFieldData] = useState({
    latitude: '',
    longitude: '',
    gpsAccuracy: '',
    propertyType: '',
    condition: '',
    bedrooms: '',
    bathrooms: '',
    landSize: '',
    buildingSize: '',
    yearBuilt: '',
    parkingSpaces: '',
    hasGarden: false,
    gardenSize: '',
    gardenType: '',
    hasAnnex: false,
    annexType: '',
    annexSize: '',
    annexBedrooms: '',
    annexBathrooms: '',
    hasGate: false,
    gateType: '',
    gateMaterial: '',
    hasFence: false,
    fenceType: '',
    fenceHeight: '',
    nearestSchoolKm: '',
    nearestHospitalKm: '',
    nearestTransportKm: '',
    nearestMarketKm: '',
    roadAccessType: '',
    valuationAmount: '',
    notes: '',
  });

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/collector/dashboard', current: true },
    { name: 'Assignments', icon: ClipboardList, href: '/collector/dashboard/assignments', current: false },
    { name: 'Settings', icon: Settings, href: '/collector/settings', current: false },
  ];

  const propertyTypes = ['HOUSE', 'APARTMENT', 'VILLA', 'LAND', 'COMMERCIAL'];
  const conditions = ['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_RENOVATION'];
  const roadAccessTypes = ['PAVED', 'UNPAVED', 'DIRT', 'UNDER_CONSTRUCTION'];
  const gateTypes = ['AUTOMATIC', 'SLIDING', 'SWING', 'MANUAL'];
  const fenceTypes = ['CHAIN_LINK', 'WOOD', 'BRICK', 'WALL', 'ELECTRIC'];

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
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, assignmentsRes, submissionsRes, revisionsRes] = await Promise.all([
        api.get('/collector/dashboard', { headers }),
        api.get('/collector/dashboard/assignments', { headers }),
        api.get('/collector/dashboard/submissions', { headers }),
        api.get('/collector/dashboard/revisions', { headers })
      ]);
      
      if (statsRes.data.success) {
        const counts = statsRes.data.data?.counts || statsRes.data.data;
        setStats({
          totalAssignments: counts?.total || 0,
          pendingAcceptance: counts?.assigned || 0,
          inProgress: counts?.inFieldwork || 0,
          completed: counts?.completed || 0,
          underReview: counts?.underReview || 0,
          needsRevision: counts?.needsRevision || 0
        });
      }
      
      if (assignmentsRes.data.success) {
        const assignmentsData = assignmentsRes.data.data?.properties || assignmentsRes.data.data || [];
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      } else {
        setAssignments([]);
      }
      
      if (submissionsRes.data.success) {
        let submissionsData = submissionsRes.data.data?.submissions || submissionsRes.data.data?.properties || submissionsRes.data.data || [];
        
        const mappedSubmissions = submissionsData.map((item: any) => ({
          id: item.id,
          fieldDataId: item.id,
          propertyId: item.propertyId,
          property: {
            upiNumber: item.property?.upiNumber,
            ownerName: item.property?.ownerName,
            district: item.property?.district,
            status: item.property?.status
          },
          submittedAt: item.submittedAt,
          status: item.property?.status,
          valuationAmount: item.valuationAmount
        }));
        
        setSubmissions(Array.isArray(mappedSubmissions) ? mappedSubmissions : []);
      } else {
        setSubmissions([]);
      }
      
      if (revisionsRes.data.success) {
        const revisionsData = revisionsRes.data.data?.revisions || revisionsRes.data.data || [];
        setRevisions(Array.isArray(revisionsData) ? revisionsData : []);
      } else {
        setRevisions([]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setAssignments([]);
      setSubmissions([]);
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (assignmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/collector/dashboard/assignments/${assignmentId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('Assignment accepted! You can now collect field data.');
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to accept assignment');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages([...uploadedImages, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitFieldData = async () => {
    if (!selectedAssignment) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      
      formData.append('propertyId', selectedAssignment.id);
      formData.append('latitude', fieldData.latitude);
      formData.append('longitude', fieldData.longitude);
      formData.append('gpsAccuracy', fieldData.gpsAccuracy || '10');
      formData.append('propertyType', fieldData.propertyType);
      formData.append('condition', fieldData.condition);
      formData.append('bedrooms', fieldData.bedrooms || '0');
      formData.append('bathrooms', fieldData.bathrooms || '0');
      formData.append('landSize', fieldData.landSize || '0');
      formData.append('buildingSize', fieldData.buildingSize || '0');
      formData.append('yearBuilt', fieldData.yearBuilt || new Date().getFullYear().toString());
      formData.append('parkingSpaces', fieldData.parkingSpaces || '0');
      formData.append('hasGarden', String(fieldData.hasGarden));
      formData.append('gardenSize', fieldData.gardenSize || '0');
      formData.append('gardenType', fieldData.gardenType || '');
      formData.append('hasAnnex', String(fieldData.hasAnnex));
      formData.append('annexType', fieldData.annexType || '');
      formData.append('annexSize', fieldData.annexSize || '0');
      formData.append('annexBedrooms', fieldData.annexBedrooms || '0');
      formData.append('annexBathrooms', fieldData.annexBathrooms || '0');
      formData.append('hasGate', String(fieldData.hasGate));
      formData.append('gateType', fieldData.gateType || '');
      formData.append('gateMaterial', fieldData.gateMaterial || '');
      formData.append('hasFence', String(fieldData.hasFence));
      formData.append('fenceType', fieldData.fenceType || '');
      formData.append('fenceHeight', fieldData.fenceHeight || '0');
      formData.append('nearestSchoolKm', fieldData.nearestSchoolKm || '0');
      formData.append('nearestHospitalKm', fieldData.nearestHospitalKm || '0');
      formData.append('nearestTransportKm', fieldData.nearestTransportKm || '0');
      formData.append('nearestMarketKm', fieldData.nearestMarketKm || '0');
      formData.append('roadAccessType', fieldData.roadAccessType);
      formData.append('valuationAmount', fieldData.valuationAmount || '0');
      formData.append('notes', fieldData.notes || '');
      
      uploadedImages.forEach((image) => {
        formData.append('images', image);
      });
      
      const response = await api.post('/collector/dashboard/field-data', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        alert('Field data submitted successfully!');
        setShowFieldDataModal(false);
        setFieldData({
          latitude: '', longitude: '', gpsAccuracy: '', propertyType: '', condition: '',
          bedrooms: '', bathrooms: '', landSize: '', buildingSize: '', yearBuilt: '',
          parkingSpaces: '', hasGarden: false, gardenSize: '', gardenType: '',
          hasAnnex: false, annexType: '', annexSize: '', annexBedrooms: '', annexBathrooms: '',
          hasGate: false, gateType: '', gateMaterial: '', hasFence: false, fenceType: '',
          fenceHeight: '', nearestSchoolKm: '', nearestHospitalKm: '', nearestTransportKm: '',
          nearestMarketKm: '', roadAccessType: '', valuationAmount: '', notes: ''
        });
        setUploadedImages([]);
        setImagePreviews([]);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit field data');
    } finally {
      setSubmitting(false);
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
              Data Collector Dashboard
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
          {/* Stats Cards with Colored Left Borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-indigo-500 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Assignments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalAssignments || 0}</p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-indigo-500 opacity-50" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-yellow-500 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Acceptance</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats?.pendingAcceptance || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.inProgress || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-green-500 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.completed || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'assignments'
                      ? 'border-b-2 border-[#1B3A5C] text-[#1B3A5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Assignments ({assignments.length})
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'submissions'
                      ? 'border-b-2 border-[#1B3A5C] text-[#1B3A5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Submissions ({submissions.length})
                </button>
                <button
                  onClick={() => setActiveTab('revisions')}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'revisions'
                      ? 'border-b-2 border-[#1B3A5C] text-[#1B3A5C]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Revision Requests ({revisions.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Assignments Tab */}
              {activeTab === 'assignments' && assignments.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No assignments yet</p>
                </div>
              )}

              {activeTab === 'assignments' && assignments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500">UPI: {assignment.upiNumber}</p>
                        <p className="text-sm font-semibold text-gray-900">{assignment.ownerName}</p>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{assignment.district}, {assignment.province}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{assignment.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">Assigned: {formatDate(assignment.assignedAt)}</span>
                          </div>
                          {assignment.notes && (
                            <div className="mt-2 text-sm text-gray-500">
                              <p className="font-medium">Notes:</p>
                              <p>{assignment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        {assignment.status === 'ASSIGNED' || assignment.status === 'PENDING' ? (
                          <button
                            onClick={() => handleAcceptAssignment(assignment.id)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept Assignment
                          </button>
                        ) : (assignment.status === 'ACCEPTED' || assignment.status === 'IN_PROGRESS') ? (
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowFieldDataModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Camera className="w-4 h-4" />
                            Start Field Data Collection
                          </button>
                        ) : assignment.status === 'COMPLETED' ? (
                          <div className="text-center text-green-600 text-sm font-medium">
                            ✓ Submitted for Review
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Submissions Tab with Edit Button */}
              {activeTab === 'submissions' && submissions.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No submissions yet</p>
                </div>
              )}

              {activeTab === 'submissions' && submissions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valuation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.map((submission) => {
                        const submissionStatus = submission.status || submission.property?.status;
                        const isEditable = submissionStatus === 'UNDER_REVIEW' || submissionStatus === 'NEEDS_REVISION';
                        
                        return (
                          <tr key={submission.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{submission.property?.ownerName}</p>
                                <p className="text-xs text-gray-500">UPI: {submission.property?.upiNumber}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{submission.property?.district}</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-indigo-600">{formatCurrency(submission.valuationAmount || 0)}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(submission.submittedAt)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                submissionStatus === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                submissionStatus === 'NEEDS_REVISION' ? 'bg-red-100 text-red-800' :
                                submissionStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {submissionStatus || 'PENDING'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isEditable && (
                                <Link
                                  href={`/collector/dashboard/field-data/${submission.fieldDataId || submission.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                              )}
                              {submissionStatus === 'APPROVED' && (
                                <span className="text-green-600 text-sm flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" /> Approved
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Revisions Tab */}
              {activeTab === 'revisions' && revisions.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No revision requests</p>
                </div>
              )}

              {activeTab === 'revisions' && revisions.length > 0 && (
                <div className="space-y-4">
                  {revisions.map((revision) => (
                    <div key={revision.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{revision.property?.ownerName}</p>
                          <p className="text-sm text-gray-500">UPI: {revision.property?.upiNumber}</p>
                          <p className="text-sm text-gray-700 mt-2">{revision.comment}</p>
                        </div>
                        <button
                          onClick={() => {
                            const assignment = assignments.find(a => a.id === revision.propertyId);
                            if (assignment) {
                              setSelectedAssignment(assignment);
                              setShowFieldDataModal(true);
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Revise & Resubmit
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Requested: {formatDate(revision.requestedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Field Data Collection Modal */}
      {showFieldDataModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Field Data Collection</h2>
                <p className="text-sm text-gray-500">Property: {selectedAssignment.ownerName} - {selectedAssignment.upiNumber}</p>
              </div>
              <button onClick={() => setShowFieldDataModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitFieldData(); }} className="space-y-6">
                {/* GPS Coordinates */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> GPS Coordinates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Latitude" value={fieldData.latitude} onChange={(e) => setFieldData({...fieldData, latitude: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="text" placeholder="Longitude" value={fieldData.longitude} onChange={(e) => setFieldData({...fieldData, longitude: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="text" placeholder="GPS Accuracy (m)" value={fieldData.gpsAccuracy} onChange={(e) => setFieldData({...fieldData, gpsAccuracy: e.target.value})} className="px-3 py-2 border rounded-lg" />
                  </div>
                </div>

                {/* Property Features */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Property Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={fieldData.propertyType} onChange={(e) => setFieldData({...fieldData, propertyType: e.target.value})} className="px-3 py-2 border rounded-lg">
                      <option value="">Property Type</option>
                      {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={fieldData.condition} onChange={(e) => setFieldData({...fieldData, condition: e.target.value})} className="px-3 py-2 border rounded-lg">
                      <option value="">Condition</option>
                      {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" placeholder="Bedrooms" value={fieldData.bedrooms} onChange={(e) => setFieldData({...fieldData, bedrooms: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="number" placeholder="Bathrooms" value={fieldData.bathrooms} onChange={(e) => setFieldData({...fieldData, bathrooms: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="number" placeholder="Land Size (m²)" value={fieldData.landSize} onChange={(e) => setFieldData({...fieldData, landSize: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="number" placeholder="Building Size (m²)" value={fieldData.buildingSize} onChange={(e) => setFieldData({...fieldData, buildingSize: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="number" placeholder="Year Built" value={fieldData.yearBuilt} onChange={(e) => setFieldData({...fieldData, yearBuilt: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="number" placeholder="Parking Spaces" value={fieldData.parkingSpaces} onChange={(e) => setFieldData({...fieldData, parkingSpaces: e.target.value})} className="px-3 py-2 border rounded-lg" />
                  </div>
                </div>

                {/* Garden & Annex */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Garden & Annex</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={fieldData.hasGarden} onChange={(e) => setFieldData({...fieldData, hasGarden: e.target.checked})} />
                      Has Garden
                    </label>
                    {fieldData.hasGarden && (
                      <>
                        <input type="number" placeholder="Garden Size (m²)" value={fieldData.gardenSize} onChange={(e) => setFieldData({...fieldData, gardenSize: e.target.value})} className="px-3 py-2 border rounded-lg" />
                        <input type="text" placeholder="Garden Type" value={fieldData.gardenType} onChange={(e) => setFieldData({...fieldData, gardenType: e.target.value})} className="px-3 py-2 border rounded-lg" />
                      </>
                    )}
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={fieldData.hasAnnex} onChange={(e) => setFieldData({...fieldData, hasAnnex: e.target.checked})} />
                      Has Annex
                    </label>
                    {fieldData.hasAnnex && (
                      <>
                        <input type="text" placeholder="Annex Type" value={fieldData.annexType} onChange={(e) => setFieldData({...fieldData, annexType: e.target.value})} className="px-3 py-2 border rounded-lg" />
                        <input type="number" placeholder="Annex Size (m²)" value={fieldData.annexSize} onChange={(e) => setFieldData({...fieldData, annexSize: e.target.value})} className="px-3 py-2 border rounded-lg" />
                        <input type="number" placeholder="Annex Bedrooms" value={fieldData.annexBedrooms} onChange={(e) => setFieldData({...fieldData, annexBedrooms: e.target.value})} className="px-3 py-2 border rounded-lg" />
                        <input type="number" placeholder="Annex Bathrooms" value={fieldData.annexBathrooms} onChange={(e) => setFieldData({...fieldData, annexBathrooms: e.target.value})} className="px-3 py-2 border rounded-lg" />
                      </>
                    )}
                  </div>
                </div>

                {/* Gate & Fence */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Gate & Fence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={fieldData.hasGate} onChange={(e) => setFieldData({...fieldData, hasGate: e.target.checked})} />
                      Has Gate
                    </label>
                    {fieldData.hasGate && (
                      <>
                        <select value={fieldData.gateType} onChange={(e) => setFieldData({...fieldData, gateType: e.target.value})} className="px-3 py-2 border rounded-lg">
                          <option value="">Gate Type</option>
                          {gateTypes.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <input type="text" placeholder="Gate Material" value={fieldData.gateMaterial} onChange={(e) => setFieldData({...fieldData, gateMaterial: e.target.value})} className="px-3 py-2 border rounded-lg" />
                      </>
                    )}
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={fieldData.hasFence} onChange={(e) => setFieldData({...fieldData, hasFence: e.target.checked})} />
                      Has Fence
                    </label>
                    {fieldData.hasFence && (
                      <>
                        <select value={fieldData.fenceType} onChange={(e) => setFieldData({...fieldData, fenceType: e.target.value})} className="px-3 py-2 border rounded-lg">
                          <option value="">Fence Type</option>
                          {fenceTypes.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <input type="number" placeholder="Fence Height (m)" value={fieldData.fenceHeight} onChange={(e) => setFieldData({...fieldData, fenceHeight: e.target.value})} className="px-3 py-2 border rounded-lg" />
                      </>
                    )}
                  </div>
                </div>

                {/* Neighborhood */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Nearby Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" step="0.1" placeholder="Nearest School (km)" value={fieldData.nearestSchoolKm} onChange={(e) => setFieldData({...fieldData, nearestSchoolKm: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="number" step="0.1" placeholder="Nearest Hospital (km)" value={fieldData.nearestHospitalKm} onChange={(e) => setFieldData({...fieldData, nearestHospitalKm: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="number" step="0.1" placeholder="Nearest Transport (km)" value={fieldData.nearestTransportKm} onChange={(e) => setFieldData({...fieldData, nearestTransportKm: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="number" step="0.1" placeholder="Nearest Market (km)" value={fieldData.nearestMarketKm} onChange={(e) => setFieldData({...fieldData, nearestMarketKm: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <select value={fieldData.roadAccessType} onChange={(e) => setFieldData({...fieldData, roadAccessType: e.target.value})} className="px-3 py-2 border rounded-lg">
                      <option value="">Road Access Type</option>
                      {roadAccessTypes.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {/* Valuation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Valuation
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <input type="number" placeholder="Estimated Valuation Amount (RWF)" value={fieldData.valuationAmount} onChange={(e) => setFieldData({...fieldData, valuationAmount: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <textarea placeholder="Additional Notes" value={fieldData.notes} onChange={(e) => setFieldData({...fieldData, notes: e.target.value})} rows={3} className="px-3 py-2 border rounded-lg" />
                  </div>
                </div>

                {/* Images */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Property Images
                  </h3>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="mb-3" />
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative">
                          <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowFieldDataModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Field Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}