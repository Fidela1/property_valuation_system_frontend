'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Menu,
  X,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  Eye,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '@/lib/api';

interface Property {
  id: string;
  upiNumber: string;
  ownerName: string;
  district: string;
  province: string;
  aiValuation: number;
  status: string;
}

interface Report {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  property: {
    upiNumber: string;
    ownerName: string;
    district: string;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/supervisor/dashboard', current: false },
    { name: 'Properties', icon: Building2, href: '/supervisor/dashboard/properties', current: false },
    { name: 'Data Collectors', icon: Users, href: '/supervisor/dashboard/data-collectors', current: false },
    { name: 'Reports', icon: FileText, href: '/supervisor/reports', current: true },
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
    
    fetchProperties();
    fetchReports();
  }, []);

const fetchProperties = async () => {
  try {
    const token = localStorage.getItem('token');
    // Use the existing endpoint that you know works
    const response = await api.get('/supervisor/dashboard/properties/all', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 100 } // Get all properties
    });
    
    console.log('Properties response:', response.data);
    
    if (response.data.success) {
      // Extract properties from the response structure
      // Your backend returns { data: { properties: [...], pagination: {...} } }
      const propertiesData = response.data.data?.properties || response.data.data || [];
      
      // Filter only APPROVED and PUBLISHED properties for reports
      const filteredProperties = propertiesData.filter(
        (p: any) => p.status === 'APPROVED' || p.status === 'PUBLISHED'
      );
      
      setProperties(filteredProperties);
      console.log('Properties loaded:', filteredProperties.length);
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    // Fallback sample data for testing
    setProperties([
      { id: '1', upiNumber: '01/01/01/01/1001', ownerName: 'Jean Claude', district: 'Gasabo', province: 'Kigali City', aiValuation: 85000000, status: 'PUBLISHED' },
      { id: '2', upiNumber: '01/01/01/02/1002', ownerName: 'Marie Claire', district: 'Kicukiro', province: 'Kigali City', aiValuation: 120000000, status: 'APPROVED' },
    ]);
  }
};


  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedProperty) {
      setError('Please select a property');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('propertyId', selectedProperty);
      formData.append('title', reportTitle || `Report - ${new Date().toLocaleDateString()}`);
      formData.append('report', selectedFile);
      
      const response = await api.post('/report/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setShowUploadModal(false);
        setSelectedProperty('');
        setReportTitle('');
        setSelectedFile(null);
        fetchReports();
        alert('Report uploaded successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/report/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        fetchReports();
        alert('Report deleted successfully');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredReports = reports.filter(report =>
    report.property.upiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Report Management
            </h2>
            
            <div className="flex items-center gap-4 ml-auto">
              <button onClick={fetchReports} className="p-2 text-gray-400 hover:text-[#1B3A5C] transition-colors" title="Refresh">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Report
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
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports by UPI, owner, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
              />
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Uploaded Reports</h3>
              <p className="text-sm text-gray-500 mt-1">Manage and download property valuation reports</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#1B3A5C] animate-spin" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports uploaded yet</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A]"
                >
                  Upload Your First Report
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{report.title}</span>
                          </div>
                         </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{report.property.ownerName}</p>
                            <p className="text-xs text-gray-500">UPI: {report.property.upiNumber}</p>
                            <p className="text-xs text-gray-500">{report.property.district}</p>
                          </div>
                         </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{report.fileName}</span>
                            <span className="text-xs text-gray-400">({formatFileSize(report.fileSize)})</span>
                          </div>
                         </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(report.createdAt)}
                         </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <a
  href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${report.fileUrl}`}
  target="_blank"
  rel="noopener noreferrer"
  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
  title="Download Report"
>
  <Download className="w-4 h-4" />
</a>
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Report Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload Report</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Property <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
                  required
                >
                  <option value="">Select a property...</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.upiNumber} - {property.ownerName} ({property.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g., Valuation Report - Property X"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1B3A5C] transition-colors">
                  <input
                    type="file"
                    id="reportFile"
                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="reportFile" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading || !selectedProperty || !selectedFile}
                  className="flex-1 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : 'Upload Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}