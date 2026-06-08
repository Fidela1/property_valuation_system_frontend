'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  TrendingUp,
  Home,
  MapPin,
  Building2,
  Calendar,
  User,
  Phone,
  Mail,
  Eye,
  Loader2,
  AlertCircle,
  Printer,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import api from '@/lib/api';

interface Image {
  id: string;
  url: string;
  isFeatured: boolean;
  order: number;
}

interface TrackingData {
  property: {
    id: string;
    upiNumber: string;
    ownerName: string;
    status: string;
    aiValuation?: number;
    fieldValuation?: number;
  };
  client: {
    name: string;
    email: string;
    phone: string;
  };
  progress: {
    percentage: number;
    currentStep: string;
    currentStepIndex: number;
    completedSteps: number;
    totalSteps: number;
    estimatedHoursLeft: number;
    estimatedDaysLeft: number;
    estimatedCompletionDate: string;
  };
  steps: Array<{
    name: string;
    status: 'completed' | 'current' | 'pending';
    order: number;
  }>;
  timeline: Array<{
    stage: string;
    status: string;
    date: string;
    details: string;
    icon: string;
  }>;
  preliminaryInfo: {
    landSize: number;
    buildingSize: number;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    condition: string;
    hasSwimmingPool: boolean;
    hasGym: boolean;
    hasSmartHome: boolean;
    viewType: string;
    parkingSpaces: number;
    nearestSchoolKm: number;
    nearestHospitalKm: number;
    roadAccessType: string;
  } | null;
  images?: Image[];
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

export default function PropertyTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (propertyId) {
      fetchTracking();
    } else {
      console.error('No property ID found in params');
      setError('Property ID not found');
      setLoading(false);
    }
  }, [propertyId]);

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/financial_institution/properties/${propertyId}/tracking`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTracking(response.data.data);
      } else {
        setError(response.data.error || 'Failed to load tracking data');
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      setError(err.response?.data?.error || 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const generatePrintReport = () => {
    if (!tracking) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the report');
      return;
    }

    const { property, client, progress, timeline, preliminaryInfo, images } = tracking;
    
    const premiumFeatures = [];
    if (preliminaryInfo?.hasSwimmingPool) premiumFeatures.push('Swimming Pool');
    if (preliminaryInfo?.hasGym) premiumFeatures.push('Home Gym');
    if (preliminaryInfo?.hasSmartHome) premiumFeatures.push('Smart Home');
    if (preliminaryInfo?.viewType && preliminaryInfo.viewType !== 'None') {
      premiumFeatures.push(`${preliminaryInfo.viewType} View`);
    }

    const formatCurrencyLocal = (amount: number) => {
      return new Intl.NumberFormat('rw-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0
      }).format(amount || 0);
    };

    const formatDateLocal = (date: string) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    // Generate image HTML
    const imagesHtml = images && images.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Property Images</h2>
        <div class="image-grid">
          ${images.map(img => `
            <img src="${getFullImageUrl(img.url)}" alt="Property image" class="report-image" />
          `).join('')}
        </div>
      </div>
      <style>
        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .report-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
      </style>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Property Valuation Report - ${property.upiNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #1B3A5C 0%, #2C5F8A 100%);
            color: white;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.8;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            color: #1B3A5C;
            border-bottom: 2px solid #1B3A5C;
            padding-bottom: 8px;
            margin-bottom: 20px;
            font-size: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-item {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 8px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            margin-bottom: 5px;
            font-size: 12px;
          }
          .info-value {
            font-size: 16px;
            font-weight: 500;
          }
          .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .report-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #ddd;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background: #1B3A5C;
            color: white;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .valuation-box {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
          }
          .valuation-box .amount {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #999;
          }
          .badge-approved {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            background: #22c55e;
            color: white;
          }
          .badge-review {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            background: #f59e0b;
            color: white;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Property Valuation Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2 class="section-title">Property Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">UPI Number</div>
              <div class="info-value">${property.upiNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Owner Name</div>
              <div class="info-value">${property.ownerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="${property.status === 'APPROVED' ? 'badge-approved' : 'badge-review'}">
                  ${property.status}
                </span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Progress</div>
              <div class="info-value">${progress.percentage}% Complete</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Client Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Client Name</div>
              <div class="info-value">${client.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${client.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div class="info-value">${client.phone || 'N/A'}</div>
            </div>
          </div>
        </div>

        ${imagesHtml}

        ${property.status === 'APPROVED' ? `
        <div class="valuation-box">
          <h3>Final Valuation Amount</h3>
          <div class="amount">${formatCurrencyLocal(property.aiValuation || 0)}</div>
          <p>AI Estimated Value • Approved by Supervisor</p>
        </div>
        ` : `
        <div class="valuation-box" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
          <h3>Valuation in Progress</h3>
          <div class="amount">Est. Completion: ${formatDateLocal(progress.estimatedCompletionDate)}</div>
          <p>The final valuation will be available once approved</p>
        </div>
        `}

        ${preliminaryInfo ? `
        <div class="section">
          <h2 class="section-title">Property Details</h2>
          <table>
            <thead>
              <tr><th>Feature</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr><td>Property Type</td><td>${preliminaryInfo.propertyType || 'N/A'}</td></tr>
              <tr><td>Land Size</td><td>${preliminaryInfo.landSize || 0} m²</td></tr>
              <tr><td>Building Size</td><td>${preliminaryInfo.buildingSize || 0} m²</td></tr>
              <tr><td>Bedrooms</td><td>${preliminaryInfo.bedrooms || 0}</td></tr>
              <tr><td>Bathrooms</td><td>${preliminaryInfo.bathrooms || 0}</td></tr>
              <tr><td>Condition</td><td>${preliminaryInfo.condition || 'N/A'}</td></tr>
              <tr><td>Parking Spaces</td><td>${preliminaryInfo.parkingSpaces || 0}</td></tr>
              <tr><td>Road Access</td><td>${preliminaryInfo.roadAccessType || 'N/A'}</td></tr>
            </tbody>
          </table>
        </div>
        ` : ''}

        ${premiumFeatures.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Premium Features</h2>
          <div class="info-grid">
            ${premiumFeatures.map(feature => `
            <div class="info-item">
              <div class="info-value">✓ ${feature}</div>
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <h2 class="section-title">Valuation Timeline</h2>
          <table>
            <thead>
              <tr><th>Stage</th><th>Date</th><th>Details</th></tr>
            </thead>
            <tbody>
              ${timeline.map(event => `
              <tr>
                <td>${event.stage}</td>
                <td>${formatDateLocal(event.date)}</td>
                <td>${event.details}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This report is computer-generated and does not require a signature.</p>
          <p>Property Valuation System © ${new Date().getFullYear()}</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #1B3A5C; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
            🖨️ Print / Save as PDF
          </button>
          <button onclick="window.close();" style="padding: 10px 20px; background: #6B7280; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Close
          </button>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      if (tracking && tracking.property.status === 'APPROVED') {
        generatePrintReport();
      } else {
        const token = localStorage.getItem('token');
        const response = await api.get(`/financial_institution/properties/${propertyId}/tracking`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setTracking(response.data.data);
          setTimeout(() => generatePrintReport(), 500);
        } else {
          alert(response.data.error || 'Failed to generate report');
        }
      }
    } catch (err: any) {
      console.error('Download error:', err);
      alert(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setDownloading(false);
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
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'current':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#1B3A5C] animate-spin" />
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Tracking data not found'}</p>
        <Link href="/financial_institution/dashboard" className="mt-4 inline-block text-[#1B3A5C] hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { property, client, progress, steps, timeline, preliminaryInfo, images = [] } = tracking;
  const isValuationAvailable = property.status === 'APPROVED';

  const openImageModal = (image: Image, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (images && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setSelectedImage(images[currentImageIndex + 1]);
    }
  };

  const prevImage = () => {
    if (images && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setSelectedImage(images[currentImageIndex - 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link href="/financial_institution/properties" className="inline-flex items-center gap-2 text-[#1B3A5C] hover:text-[#2C5F8A] font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>
        {isValuationAvailable && (
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            {downloading ? 'Generating...' : 'Print / PDF Report'}
          </button>
        )}
      </div>

      {/* Property Header */}
      <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5F8A] rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{property.ownerName}</h1>
              <p className="text-indigo-100">UPI: {property.upiNumber}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{property.status}</span>
            </div>
          </div>
          {client && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-indigo-100">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{client.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Valuation Progress</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{progress.estimatedHoursLeft}</p>
            <p className="text-sm opacity-80">Estimated Hours Left</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{progress.percentage}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-green-400 rounded-full h-3 transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm opacity-80">Estimated Completion</p>
            <p className="font-semibold">{formatDate(progress.estimatedCompletionDate)}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative mt-8">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/20"></div>
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4 mb-6 last:mb-0">
              <div className="relative z-10 bg-transparent rounded-full p-1">
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className={`font-semibold ${
                    step.status === 'completed' ? 'text-green-300' :
                    step.status === 'current' ? 'text-yellow-300' : 'text-white/50'
                  }`}>
                    {step.name}
                  </h3>
                  {step.status === 'current' && (
                    <span className="text-xs bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  )}
                  {step.status === 'completed' && (
                    <span className="text-xs bg-green-500/30 text-green-200 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                {step.status === 'current' && progress.estimatedDaysLeft > 0 && (
                  <p className="text-sm text-white/70 mt-1">
                    Estimated: {progress.estimatedDaysLeft} days remaining
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Images Section */}
      {images && images.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#1B3A5C]" />
            Property Images ({images.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, idx) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => openImageModal(image, idx)}
              >
                <img
                  src={getFullImageUrl(image.url) || ''}
                  alt={`Property ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#1B3A5C]" />
          Activity Timeline
        </h2>
        <div className="space-y-4">
          {timeline.map((event, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="text-2xl">{event.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <p className="font-medium text-gray-900">{event.stage}</p>
                  <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Valuation Section - Only when APPROVED */}
      {isValuationAvailable && property.aiValuation && (
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Valuation Complete ✓</h2>
          </div>
          <p className="text-green-100 mb-4">This property has been successfully valued and approved.</p>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm opacity-80 mb-1">Final Valuation Amount</p>
            <p className="text-4xl font-bold">{formatCurrency(property.aiValuation)}</p>
            <p className="text-xs opacity-70 mt-2">AI Estimated Value • Approved by Supervisor</p>
          </div>
        </div>
      )}

      {/* Property Information */}
      {preliminaryInfo && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1B3A5C]" />
            Property Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Home className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-medium">{preliminaryInfo.propertyType || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Land/Building Size</p>
                <p className="font-medium">{preliminaryInfo.landSize || 0} m² / {preliminaryInfo.buildingSize || 0} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Bedrooms/Bathrooms</p>
                <p className="font-medium">{preliminaryInfo.bedrooms || 0} / {preliminaryInfo.bathrooms || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-medium">{preliminaryInfo.condition || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Road Access</p>
                <p className="font-medium">{preliminaryInfo.roadAccessType || 'N/A'}</p>
              </div>
            </div>
            {preliminaryInfo.parkingSpaces > 0 && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">🚗</span>
                <div>
                  <p className="text-sm text-gray-500">Parking</p>
                  <p className="font-medium">{preliminaryInfo.parkingSpaces} spaces</p>
                </div>
              </div>
            )}
            {preliminaryInfo.hasSwimmingPool && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-lg">🏊</span>
                <div>
                  <p className="text-sm text-blue-600">Premium Feature</p>
                  <p className="font-medium">Swimming Pool</p>
                </div>
              </div>
            )}
            {preliminaryInfo.hasGym && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-lg">💪</span>
                <div>
                  <p className="text-sm text-blue-600">Premium Feature</p>
                  <p className="font-medium">Home Gym</p>
                </div>
              </div>
            )}
            {preliminaryInfo.viewType && preliminaryInfo.viewType !== 'None' && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Eye className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-blue-600">View</p>
                  <p className="font-medium">{preliminaryInfo.viewType} View</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeModal}>
          <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            {images && images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            <img
              src={getFullImageUrl(selectedImage.url) || ''}
              alt="Property"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            
            {images && images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}