'use client';

import { useEffect, useState } from 'react';
import { Clock, Loader2, RefreshCw, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface AccessRequest {
  id: string;
  propertyId: string;
  upiNumber: string;
  ownerName: string;
  clientName: string;
  clientEmail: string;
  requestedAt: string;
  accessType: string;
  status: string;
}

export default function AccessRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AccessRequest[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/financial_institution/access-requests/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#1B3A5C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pending Access Requests</h1>
        <button
          onClick={fetchRequests}
          className="p-2 text-gray-400 hover:text-[#1B3A5C] transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">No pending access requests</p>
          <p className="text-sm text-gray-400 mt-1">All your access requests have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-orange-600 font-medium">Awaiting Approval</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{request.ownerName}</h3>
                  <p className="text-sm text-gray-500">UPI: {request.upiNumber}</p>
                  <p className="text-sm text-gray-600 mt-1">Client: {request.clientName}</p>
                  <p className="text-xs text-gray-400 mt-2">Requested: {formatDate(request.requestedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {request.accessType}
                  </span>
                  <Link
                    href={`/bank/properties/${request.propertyId}/tracking`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Waiting for client to approve your access request
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}