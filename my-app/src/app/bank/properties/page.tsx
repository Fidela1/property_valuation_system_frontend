'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  Loader2,
  RefreshCw,
  Building2,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '@/lib/api';

interface Property {
  id: string;
  upiNumber: string;
  ownerName: string;
  district: string;
  province: string;
  status: string;
  aiValuation: number;
  createdAt: string;
  client?: {
    name: string;
    email: string;
  };
  fieldData?: {
    landSize: number;
    buildingSize: number;
  };
  accessType: string;
  grantedAt: string;
}

export default function BankPropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchProperties();
  }, [pagination.page, statusFilter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/financial_institution/properties?page=${pagination.page}&limit=${pagination.limit}&status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProperties(response.data.data.properties);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total,
          totalPages: response.data.data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
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
      'APPROVED': 'bg-teal-100 text-teal-800',
      'PUBLISHED': 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredProperties = properties.filter(property =>
    property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.upiNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#1B3A5C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Properties I Can Access</h1>
        <button
          onClick={fetchProperties}
          className="p-2 text-gray-400 hover:text-[#1B3A5C] transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by owner name or UPI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No properties found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                  <p className="text-xs text-gray-500">UPI: {property.upiNumber}</p>
                  <h3 className="font-semibold text-gray-900">{property.ownerName}</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{property.district}, {property.province}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Granted: {formatDate(property.grantedAt)}</span>
                  </div>
                  {property.aiValuation > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-indigo-600 font-semibold">{formatCurrency(property.aiValuation)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(property.status)}`}>
                      {property.status}
                    </span>
                    <Link
                      href={`/bank/properties/${property.id}/tracking`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Track
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}