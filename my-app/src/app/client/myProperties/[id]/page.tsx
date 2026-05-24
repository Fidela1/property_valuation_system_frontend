'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ReactElement } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  User,
  MapPinned,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Download,
  Loader2,
  FileDown
} from 'lucide-react';
import api from '@/lib/api';

const PROVINCES = [
  'Kigali City',
  'Northern Province',
  'Eastern Province',
  'Southern Province',
  'Western Province'
];

const DISTRICTS: Record<string, string[]> = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
};

const SECTORS: Record<string, string[]> = {
  'Gasabo': ['Nyarutarama', 'Kimihurura', 'Kacyiru', 'Remera', 'Gishushu'],
  'Kicukiro': ['Gikondo', 'Kicukiro', 'Niboye', 'Kanombe'],
  'Nyarugenge': ['Nyarugenge', 'Kiyovu', 'Nyamirambo', 'Rugenge'],
  'Musanze': ['Muhoza', 'Cyuve', 'Kimonyi', 'Muko'],
  'Rubavu': ['Gisenyi', 'Bugoyi', 'Kigeyo'],
  'Huye': ['Ngoma', 'Mbazi', 'Ruhashya'],
  'default': ['Sector 1', 'Sector 2', 'Sector 3']
};

const CELLS: Record<string, string[]> = {
  'Nyarutarama': ['Kagugu', 'Rugando', 'Kibagabaga'],
  'Kimihurura': ['Rugando', 'Kimihurura', 'Urugwiro'],
  'Gikondo': ['Kanserege', 'Gikondo', 'Rwezamenyo'],
  'default': ['Cell 1', 'Cell 2', 'Cell 3']
};

interface Property {
  id: string;
  upiNumber: string;
  ownerName: string;
  phoneNumber: string;
  country: string;
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
  publishedAt?: string;
  soldAt?: string;
}

interface Report {
  id: string;
  title: string;
  reportType?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Property>>({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [upiError, setUpiError] = useState('');

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showAllReports, setShowAllReports] = useState(false);

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [availableCells, setAvailableCells] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPropertyDetail(token);
    fetchPropertyReports(token);
  }, [params.id]);

  const fetchPropertyDetail = async (token: string) => {
    try {
      const response = await api.get(`/client/myProperties/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProperty(response.data.data);
        setEditForm(response.data.data);
        updateAvailableDistricts(response.data.data.province);
        updateAvailableSectors(response.data.data.district);
        updateAvailableCells(response.data.data.sector);
      } else {
        setError(response.data.error || 'Property not found');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyReports = async (token: string) => {
    setLoadingReports(true);
    try {
      const response = await api.get(`/report/property/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setReports(response.data.data || []);
      } else {
        setReports([]);
      }
    } catch {
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const getExtensionFromMimeType = (mimeType: string): string => {
    const mimeToExt: Record<string, string> = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/vnd.ms-powerpoint': '.ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'text/plain': '.txt',
      'text/csv': '.csv',
      'application/json': '.json',
      'application/zip': '.zip',
      'application/x-zip-compressed': '.zip',
      'video/mp4': '.mp4',
      'audio/mpeg': '.mp3',
    };
    return mimeToExt[mimeType] || '.pdf';
  };

  const handleDownloadReport = async (reportId: string, reportTitle: string) => {
    setDownloading(reportId);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/report/${reportId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const contentType = (response.headers['content-type'] as string | undefined) ?? 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });

      let fileExtension = '.pdf';
      const disposition = response.headers['content-disposition'] as string | undefined;

      if (disposition && disposition.includes('.')) {
        const lastDotIndex = disposition.lastIndexOf('.');
        fileExtension = disposition.substring(lastDotIndex);
      } else {
        fileExtension = getExtensionFromMimeType(contentType);
      }

      const finalFileName = reportTitle.replace(/[^a-z0-9]/gi, '_');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${finalFileName}${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const updateAvailableDistricts = (province: string) => {
    setAvailableDistricts(DISTRICTS[province] || []);
  };

  const updateAvailableSectors = (district: string) => {
    setAvailableSectors(SECTORS[district] || SECTORS.default);
  };

  const updateAvailableCells = (sector: string) => {
    setAvailableCells(CELLS[sector] || CELLS.default);
  };

  const handleProvinceChange = (province: string) => {
    setEditForm(prev => ({ ...prev, province, district: '', sector: '', cell: '' }));
    updateAvailableDistricts(province);
    setAvailableSectors([]);
    setAvailableCells([]);
  };

  const handleDistrictChange = (district: string) => {
    setEditForm(prev => ({ ...prev, district, sector: '', cell: '' }));
    updateAvailableSectors(district);
    setAvailableCells([]);
  };

  const handleSectorChange = (sector: string) => {
    setEditForm(prev => ({ ...prev, sector, cell: '' }));
    updateAvailableCells(sector);
  };

  const handleCellChange = (cell: string) => {
    setEditForm(prev => ({ ...prev, cell }));
  };

  const validateUpiNumber = async (upiNumber: string) => {
    if (upiNumber === property?.upiNumber) return true;
    const token = localStorage.getItem('token');
    try {
      const response = await api.get(`/myProperties?upiNumber=${upiNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data.length > 0) {
        setUpiError('UPI number already exists. Please use a different one.');
        return false;
      }
      setUpiError('');
      return true;
    } catch {
      setUpiError('Error validating UPI number');
      return false;
    }
  };

  const handleUpiChange = async (upiNumber: string) => {
    setEditForm(prev => ({ ...prev, upiNumber }));
    await validateUpiNumber(upiNumber);
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(property!);
    setUpiError('');
    updateAvailableDistricts(property!.province);
    updateAvailableSectors(property!.district);
    updateAvailableCells(property!.sector);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'province': handleProvinceChange(value); break;
      case 'district': handleDistrictChange(value); break;
      case 'sector': handleSectorChange(value); break;
      case 'cell': handleCellChange(value); break;
      case 'upiNumber': handleUpiChange(value); break;
      default: setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    if (editForm.upiNumber && editForm.upiNumber !== property?.upiNumber) {
      const isValid = await validateUpiNumber(editForm.upiNumber);
      if (!isValid) return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    setUpdating(true);
    try {
      const response = await api.put(`/client/myProperties/${params.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProperty(response.data.data);
        setIsEditing(false);
        alert('Property updated successfully!');
      } else {
        alert(response.data.error || 'Failed to update property');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error || 'Failed to update property');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setDeleting(true);
    try {
      const response = await api.delete(`/client/myProperties/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        alert('Property deleted successfully!');
        router.push('/clientDashboard');
      } else {
        alert(response.data.error || 'Failed to delete property');
        setDeleteConfirm(false);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error || 'Failed to delete property');
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string): { bg: string; text: string; icon: ReactElement } => {
    const badges: Record<string, { bg: string; text: string; icon: ReactElement }> = {
      'PENDING':       { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      'ASSIGNED':      { bg: 'bg-blue-100',   text: 'text-blue-800',   icon: <User className="w-4 h-4" /> },
      'IN_FIELDWORK':  { bg: 'bg-purple-100', text: 'text-purple-800', icon: <MapPinned className="w-4 h-4" /> },
      'UNDER_REVIEW':  { bg: 'bg-orange-100', text: 'text-orange-800', icon: <AlertCircle className="w-4 h-4" /> },
      'NEEDS_REVISION':{ bg: 'bg-red-100',    text: 'text-red-800',    icon: <XCircle className="w-4 h-4" /> },
      'APPROVED':      { bg: 'bg-teal-100',   text: 'text-teal-800',   icon: <CheckCircle className="w-4 h-4" /> },
      'PUBLISHED':     { bg: 'bg-green-100',  text: 'text-green-800',  icon: <CheckCircle className="w-4 h-4" /> },
      'SOLD':          { bg: 'bg-gray-100',   text: 'text-gray-800',   icon: <DollarSign className="w-4 h-4" /> },
    };
    return badges[status] || badges['PENDING'];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The property you are looking for does not exist.'}</p>
          <Link href="/clientDashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#244d79]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(property.status);
  const isLocationChanged = editForm.province !== property.province ||
    editForm.district !== property.district ||
    editForm.sector !== property.sector;
  const hasReports = reports.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

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
                Are you sure you want to delete property <strong>{property.upiNumber}</strong>?
              </p>
              <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200" disabled={deleting}>Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Modal */}
        {showAllReports && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Property Reports</h2>
                  <p className="text-sm text-gray-500 mt-1">{property.upiNumber} - {property.ownerName}</p>
                </div>
                <button onClick={() => setShowAllReports(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {loadingReports ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1B3A5C]" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reports available for this property yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Reports will appear here once the property valuation is complete.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-[#1B3A5C]" />
                              <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500">
                              Generated: {new Date(report.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                            {report.fileName && <p className="text-xs text-gray-400 mt-1">File: {report.fileName}</p>}
                          </div>
                          <button
                            onClick={() => handleDownloadReport(report.id, report.title)}
                            disabled={downloading === report.id}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors disabled:opacity-50"
                          >
                            {downloading === report.id ? (
                              <><Loader2 className="w-4 h-4 animate-spin" />Downloading...</>
                            ) : (
                              <><Download className="w-4 h-4" />Download</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Total Reports: {reports.length}</p>
                  <button onClick={() => setShowAllReports(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/client/myProperties" className="inline-flex items-center gap-2 text-[#1B3A5C] hover:text-[#244d79] font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
          <div className="flex gap-2">
            {hasReports && (
              <button onClick={() => setShowAllReports(true)} className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                <FileDown className="w-4 h-4" />
                Download Report ({reports.length})
              </button>
            )}
            {!isEditing ? (
              <>
                <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  <Edit className="w-4 h-4" />Edit
                </button>
                <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={handleUpdate} disabled={updating || !!upiError} className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />{updating ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                  <X className="w-4 h-4" />Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {!hasReports && (property.status === 'APPROVED' || property.status === 'PUBLISHED') && !loadingReports && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">Report not available yet. Once the valuation is complete, you will be able to download your property report here.</p>
          </div>
        )}

        {isEditing && isLocationChanged && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">Changing location will reset district, sector, and cell selections.</p>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#1B3A5C] to-[#244d79] px-6 py-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isEditing ? (
                  <div className="mb-2">
                    <label className="block text-xs text-indigo-200 mb-1">UPI Number</label>
                    <input
                      name="upiNumber"
                      value={editForm.upiNumber || ''}
                      onChange={handleEditChange}
                      className={`text-2xl font-bold text-white bg-white/20 rounded-lg px-3 py-1 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-white/50 ${upiError ? 'border-2 border-red-400' : ''}`}
                    />
                    {upiError && <p className="text-xs text-red-200 mt-1">{upiError}</p>}
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white mb-2">Property {property.upiNumber}</h1>
                    <p className="text-indigo-100">UPI: {property.upiNumber}</p>
                  </>
                )}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                {statusBadge.icon}
                <span className="text-sm font-medium">{property.status}</span>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {property.status === 'PUBLISHED' ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                 property.status === 'NEEDS_REVISION' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                 <Clock className="w-5 h-5 text-yellow-500" />}
              </div>
              <p className="text-sm text-gray-700">
                {property.status === 'PENDING' ? 'Your application is pending review. An admin will assign a data collector soon.' :
                 property.status === 'ASSIGNED' ? 'A data collector has been assigned to your property.' :
                 property.status === 'IN_FIELDWORK' ? 'A data collector is currently visiting your property.' :
                 property.status === 'UNDER_REVIEW' ? 'Your property assessment is under review by a supervisor.' :
                 property.status === 'NEEDS_REVISION' ? 'The data collector needs to update some information.' :
                 property.status === 'APPROVED' ? 'Your property has been approved. A report will be available soon.' :
                 property.status === 'PUBLISHED' ? 'Your property is now live on the platform! You can download the valuation report.' :
                 property.status === 'SOLD' ? 'This property has been marked as sold.' :
                 'Status update pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Location Details</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Country</p>
                    {isEditing ? (
                      <input name="country" value={editForm.country || ''} onChange={handleEditChange} className="mt-1 w-full px-3 py-1 border rounded focus:ring-2 focus:ring-[#1B3A5C]" />
                    ) : <p className="text-sm font-medium mt-1">{property.country}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Province</p>
                    {isEditing ? (
                      <select name="province" value={editForm.province || ''} onChange={handleEditChange} className="mt-1 w-full px-3 py-1 border rounded focus:ring-2 focus:ring-[#1B3A5C]">
                        <option value="">Select Province</option>
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ) : <p className="text-sm font-medium mt-1">{property.province}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">District</p>
                    {isEditing ? (
                      <select name="district" value={editForm.district || ''} onChange={handleEditChange} disabled={!editForm.province} className="mt-1 w-full px-3 py-1 border rounded focus:ring-2 focus:ring-[#1B3A5C] disabled:bg-gray-100">
                        <option value="">Select District</option>
                        {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : <p className="text-sm font-medium mt-1">{property.district}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Sector</p>
                    {isEditing ? (
                      <select name="sector" value={editForm.sector || ''} onChange={handleEditChange} disabled={!editForm.district} className="mt-1 w-full px-3 py-1 border rounded focus:ring-2 focus:ring-[#1B3A5C] disabled:bg-gray-100">
                        <option value="">Select Sector</option>
                        {availableSectors.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : <p className="text-sm font-medium mt-1">{property.sector || 'N/A'}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Cell</p>
                    {isEditing ? (
                      <select name="cell" value={editForm.cell || ''} onChange={handleEditChange} disabled={!editForm.sector} className="mt-1 w-full px-3 py-1 border rounded focus:ring-2 focus:ring-[#1B3A5C] disabled:bg-gray-100">
                        <option value="">Select Cell</option>
                        {availableCells.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : <p className="text-sm font-medium mt-1">{property.cell || 'N/A'}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Village</p>
                    {isEditing ? (
                      <input name="village" value={editForm.village || ''} onChange={handleEditChange} className="mt-1 w-full px-3 py-1 border rounded" />
                    ) : <p className="text-sm font-medium mt-1">{property.village || 'N/A'}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Owner */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Owner Information</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Owner Name</p>
                    {isEditing ? (
                      <input name="ownerName" value={editForm.ownerName || ''} onChange={handleEditChange} className="mt-1 w-full px-3 py-1 border rounded focus:ring-2 focus:ring-[#1B3A5C]" />
                    ) : <p className="text-sm font-medium mt-1">{property.ownerName}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                    {isEditing ? (
                      <input name="phoneNumber" value={editForm.phoneNumber || ''} onChange={handleEditChange} className="mt-1 w-full px-3 py-1 border rounded" />
                    ) : <p className="text-sm font-medium mt-1">{property.phoneNumber}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Property Timeline</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-gray-500">Submitted</p><p className="text-sm font-medium">{formatDate(property.createdAt)}</p></div>
                  {property.publishedAt && <div><p className="text-xs text-gray-500">Published</p><p className="text-sm font-medium">{formatDate(property.publishedAt)}</p></div>}
                  {property.soldAt && <div><p className="text-xs text-gray-500">Sold</p><p className="text-sm font-medium">{formatDate(property.soldAt)}</p></div>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Valuation */}
            <div className="bg-gradient-to-br from-[#1B3A5C] to-[#244d79] rounded-xl shadow-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-white/80" />
                  <h3 className="text-white/80 text-sm uppercase tracking-wide">AI Valuation</h3>
                </div>
                {property.aiValuation ? (
                  <>
                    <p className="text-3xl font-bold text-white mb-2">{property.aiValuation.toLocaleString()} RWF</p>
                    {property.aiConfidence && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-white/80 mb-1"><span>Confidence Score</span><span>{property.aiConfidence}%</span></div>
                        <div className="w-full bg-white/20 rounded-full h-2"><div className="bg-white rounded-full h-2" style={{ width: `${property.aiConfidence}%` }} /></div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-white/80 text-sm">Valuation in progress. Once completed, AI estimate will appear here.</p>
                )}
              </div>
            </div>

            {/* Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Property Reports</h2>
                </div>
              </div>
              <div className="p-5">
                {loadingReports ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1B3A5C]" />
                  </div>
                ) : hasReports ? (
                  <div>
                    <div className="space-y-3">
                      {reports.slice(0, 3).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                            <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                          </div>
                          <button
                            onClick={() => handleDownloadReport(report.id, report.title)}
                            disabled={downloading === report.id}
                            className="ml-2 p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            {downloading === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                    {reports.length > 3 && (
                      <button onClick={() => setShowAllReports(true)} className="mt-3 text-sm text-[#1B3A5C] hover:text-[#244d79] font-medium">
                        View all {reports.length} reports →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No reports available yet</p>
                    {(property.status === 'APPROVED' || property.status === 'PUBLISHED') ? (
                      <p className="text-xs text-gray-400 mt-1">Report will be available soon</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">Reports appear after property is approved</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}