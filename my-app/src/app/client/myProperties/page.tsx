'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '@/lib/api';

interface Property {
  id: string;
  upiNumber: string;
  ownerName: string;
  phoneNumber: string;
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
}

export default function MyPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'PENDING', label: 'Pending', icon: <Clock className="w-3 h-3" />, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ASSIGNED', label: 'Assigned', icon: <Clock className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'IN_FIELDWORK', label: 'In Fieldwork', icon: <Clock className="w-3 h-3" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'UNDER_REVIEW', label: 'Under Review', icon: <AlertCircle className="w-3 h-3" />, color: 'bg-orange-100 text-orange-800' },
    { value: 'NEEDS_REVISION', label: 'Needs Revision', icon: <AlertCircle className="w-3 h-3" />, color: 'bg-red-100 text-red-800' },
    { value: 'APPROVED', label: 'Approved', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-teal-100 text-teal-800' },
    { value: 'PUBLISHED', label: 'Published', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-green-100 text-green-800' },
    { value: 'SOLD', label: 'Sold', icon: <DollarSign className="w-3 h-3" />, color: 'bg-gray-100 text-gray-800' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProperties(token);
  }, [currentPage, statusFilter, searchTerm]);

  const fetchProperties = async (token: string) => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const response = await api.get('/client/myProperties', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        setProperties(response.data.data.properties || []);
        const total = response.data.data.total || response.data.data.length || 0;
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${option.color}`}>
        {option.icon}
        {option.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/clientDashboard" 
              className="inline-flex items-center gap-2 text-[#1B3A5C] hover:text-[#244d79] font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          </div>
          <Link
            href="/createProperty"
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#244d79] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Property
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            <p className="text-sm text-gray-500">Total Properties</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-green-600">
              {properties.filter(p => p.status === 'PUBLISHED').length}
            </p>
            <p className="text-sm text-gray-500">Published</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-yellow-600">
              {properties.filter(p => p.status === 'PENDING').length}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-blue-600">
              {properties.filter(p => p.aiValuation).length}
            </p>
            <p className="text-sm text-gray-500">With Valuation</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by UPI number, owner name, or location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C]"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                    statusFilter === option.value
                      ? 'bg-[#1B3A5C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {option.icon}
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Properties Table */}
        
      </div>

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
              Are you sure you want to delete this property?
            </p>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}