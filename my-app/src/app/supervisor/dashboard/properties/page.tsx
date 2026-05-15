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
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Menu,
  X,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Clock,
  Activity,
  CheckCircle,
  Star,
  Filter,
  Grid3x3,
  List,
  ArrowUpDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '@/lib/api';

// Helper function to get full image URL - FIXED
const getFullImageUrl = (url: string) => {
  if (!url) return null;
  
  // If it's already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030';
  
  // Remove leading slashes or relative paths
  let cleanUrl = url;
  cleanUrl = cleanUrl.replace(/^\.\.\/\.\.\//, '');
  cleanUrl = cleanUrl.replace(/^\.\//, '');
  cleanUrl = cleanUrl.replace(/^\//, '');
  
  // Don't add 'uploads/' if it's already there or if it's just 'uploads'
  if (cleanUrl === 'uploads' || cleanUrl === 'uploads/') {
    return null; // Invalid URL, just 'uploads' folder without filename
  }
  
  if (!cleanUrl.startsWith('uploads') && !cleanUrl.startsWith('/uploads')) {
    cleanUrl = `uploads/${cleanUrl}`;
  }
  
  // Ensure no double slashes
  const fullUrl = `${backendUrl}/${cleanUrl}`.replace(/([^:]\/)\/+/g, "$1");
  
  return fullUrl;
};

// Image component with built-in error handling
const PropertyImage = ({ src, alt, className }: { src: string | null; alt: string; className?: string }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}>
        <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
        <span className="text-xs text-gray-500">Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        console.warn('Image failed to load, hiding:', src);
        setImgError(true);
      }}
    />
  );
};

interface Property {
  id: string;
  upiNumber: string;
  idOrTin: string;
  phoneNumber: string;
  ownerName: string;
  country: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  propertyType?: string;
  status: string;
  aiValuation: number;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignment?: {
    id: string;
    assignedAt: string;
    collector: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  images?: Array<{
    id: string;
    url: string;
    isFeatured: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function SupervisorProperties() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'valuation' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedImageCard, setExpandedImageCard] = useState<string | null>(null);
  
  const itemsPerPage = 9;

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/supervisor/dashboard', current: false },
    { name: 'Properties', icon: Building2, href: '/supervisor/dashboard/properties', current: true },
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
    
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/supervisor/dashboard/properties/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const allProperties = response.data.data?.properties || response.data.data || [];
        
        // Debug: Log image URLs to see what's coming from API
        console.log('Sample property images:', allProperties.slice(0, 3).map((p: Property) => ({
          id: p.id,
          ownerName: p.ownerName,
          images: p.images?.map(img => img.url)
        })));
        
        setProperties(Array.isArray(allProperties) ? allProperties : []);
        setFilteredProperties(Array.isArray(allProperties) ? allProperties : []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ASSIGNED': 'bg-blue-100 text-blue-800',
      'IN_FIELDWORK': 'bg-indigo-100 text-indigo-800',
      'UNDER_REVIEW': 'bg-orange-100 text-orange-800',
      'NEEDS_REVISION': 'bg-red-100 text-red-800',
      'APPROVED': 'bg-teal-100 text-teal-800',
      'PUBLISHED': 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_FIELDWORK': return <Activity className="w-4 h-4" />;
      case 'UNDER_REVIEW': return <Eye className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'PUBLISHED': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...properties];
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.upiNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phoneNumber?.includes(searchTerm)
      );
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.propertyType === selectedType);
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'valuation') {
        comparison = (a.aiValuation || 0) - (b.aiValuation || 0);
      } else if (sortBy === 'name') {
        comparison = (a.ownerName || '').localeCompare(b.ownerName || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedType, sortBy, sortOrder, properties]);

  const propertyTypes = ['all', ...new Set(properties.map(p => p.propertyType).filter(Boolean))];
  const statuses = ['all', 'PENDING', 'IN_FIELDWORK', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED'];

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/supervisor/dashboard/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedProperty(response.data.data);
        setShowDetailsModal(true);
        setCurrentImageIndex(0);
      }
    } catch (err) {
      console.error('Error fetching property details:', err);
    }
  };

  // Image gallery component for card - FIXED with proper error handling
  const ImageGalleryCard = ({ property }: { property: Property }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
    const images = property.images || [];
    
    // Filter out images with invalid URLs and those that have errored
    const validImages = images.filter((img, idx) => {
      if (!img || !img.url) return false;
      if (imageErrors[idx]) return false;
      // Skip if URL is just 'uploads' or 'uploads/'
      if (img.url === 'uploads' || img.url === 'uploads/') return false;
      return true;
    });
    
    const hasImages = validImages.length > 0;
    const isExpanded = expandedImageCard === property.id;
    
    if (!hasImages) {
      return (
        <div className="h-48 bg-gray-100 flex flex-col items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500">No images available</span>
        </div>
      );
    }
    
    const currentImageUrl = getFullImageUrl(validImages[currentImgIndex]?.url);
    
    return (
      <div className="relative">
        {/* Main Image */}
        <div className="relative h-48 bg-gray-100">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={`${property.ownerName} - Image ${currentImgIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn('Image failed to load:', currentImageUrl);
                setImageErrors(prev => ({ ...prev, [currentImgIndex]: true }));
                e.currentTarget.style.display = 'none';
                // Show fallback
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const existingFallback = parent.querySelector('.image-fallback');
                  if (!existingFallback) {
                    const fallback = document.createElement('div');
                    fallback.className = 'image-fallback w-full h-full flex flex-col items-center justify-center bg-gray-100';
                    fallback.innerHTML = '<svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4-4 4 4 4-4 4 4" /></svg><span class="text-xs text-gray-500">Image failed to load</span>';
                    parent.appendChild(fallback);
                  }
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Invalid image URL</span>
            </div>
          )}
          
          {/* Navigation Arrows - Only show if more than 1 valid image */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        
        {/* Dots indicator for multiple images */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1.5 z-10">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIndex(idx);
                }}
                className={`transition-all rounded-full ${
                  idx === currentImgIndex 
                    ? 'bg-white w-2 h-2' 
                    : 'bg-white/50 w-1.5 h-1.5'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Expand/Collapse Button for more images */}
        {validImages.length > 3 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImageCard(isExpanded ? null : property.id);
            }}
            className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 hover:bg-black/80 transition-colors z-10"
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isExpanded ? 'Show less' : `Show all ${validImages.length} images`}
          </button>
        )}
        
        {/* Expanded Thumbnail Grid */}
        {isExpanded && validImages.length > 3 && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-20 max-h-48 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-4 gap-1">
              {validImages.map((img, idx) => {
                const thumbUrl = getFullImageUrl(img.url);
                return thumbUrl ? (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImgIndex(idx);
                      setExpandedImageCard(null);
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      idx === currentImgIndex ? 'border-[#1B3A5C]' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
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
              All Properties
            </h2>
            
            <div className="flex items-center gap-4 ml-auto">
              <button onClick={fetchProperties} className="p-2 text-gray-400 hover:text-[#1B3A5C] transition-colors" title="Refresh">
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
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-yellow-600">{properties.filter(p => p.status === 'PENDING').length}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-blue-600">{properties.filter(p => p.status === 'IN_FIELDWORK').length}</p>
              <p className="text-xs text-gray-500">Fieldwork</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-orange-600">{properties.filter(p => p.status === 'UNDER_REVIEW').length}</p>
              <p className="text-xs text-gray-500">Review</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-green-600">{properties.filter(p => p.status === 'APPROVED' || p.status === 'PUBLISHED').length}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
              <p className="text-2xl font-bold text-purple-600">{properties.filter(p => p.aiValuation > 0).length}</p>
              <p className="text-xs text-gray-500">Valued</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by owner name, UPI, district, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="valuation">Sort by Valuation</option>
                <option value="name">Sort by Name</option>
              </select>
              
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-[#1B3A5C] text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-[#1B3A5C] text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {paginatedProperties.length} of {filteredProperties.length} properties
            </p>
          </div>

          {/* Grid View with Image Gallery */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <ImageGalleryCard property={property} />
                  
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">UPI: {property.upiNumber}</p>
                    <h3 className="font-semibold text-gray-900 mb-2">{property.ownerName}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{property.district}, {property.province}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{property.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Created: {formatDate(property.createdAt)}</span>
                      </div>
                      {property.aiValuation > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-indigo-600 font-semibold">{formatCurrency(property.aiValuation)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                 <Link
  href={`/supervisor/dashboard/properties/${property.id}`}
  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors text-sm font-medium"
>
  <Eye className="w-4 h-4" />
  View Details
</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valuation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{property.ownerName}</p>
                          <p className="text-xs text-gray-500">UPI: {property.upiNumber}</p>
                          <p className="text-xs text-gray-500">{property.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{property.district}</p>
                        <p className="text-xs text-gray-500">{property.province}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(property.status)}`}>
                          {getStatusIcon(property.status)}
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-indigo-600">{formatCurrency(property.aiValuation)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{property.images?.length || 0} images</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => fetchPropertyDetails(property.id)}
                          className="text-[#1B3A5C] hover:text-[#2C5F8A] font-medium text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No Results */}
          {filteredProperties.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#1B3A5C] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Property Details Modal with Full Image Gallery */}
      {showDetailsModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
                <p className="text-sm text-gray-500">UPI: {selectedProperty.upiNumber}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Full Image Gallery */}
              {selectedProperty.images && selectedProperty.images.filter(img => img.url && img.url !== 'uploads' && img.url !== 'uploads/').length > 0 && (
                <div className="mb-6">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64 md:h-96">
                    {(() => {
                      const validImages = selectedProperty.images.filter(img => img.url && img.url !== 'uploads' && img.url !== 'uploads/');
                      if (validImages.length === 0) {
                        return (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-gray-400 mb-2" />
                            <span className="text-gray-500">No valid images</span>
                          </div>
                        );
                      }
                      const currentImageUrl = getFullImageUrl(validImages[currentImageIndex]?.url);
                      return currentImageUrl ? (
                        <img
                          src={currentImageUrl}
                          alt={`Property ${selectedProperty.upiNumber}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-400 mb-2" />
                          <span className="text-gray-500">Failed to load image</span>
                        </div>
                      );
                    })()}
                    
                    {selectedProperty.images.filter(img => img.url && img.url !== 'uploads' && img.url !== 'uploads/').length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            const validImages = selectedProperty.images!.filter(img => img.url && img.url !== 'uploads' && img.url !== 'uploads/');
                            setCurrentImageIndex(prev => prev === 0 ? validImages.length - 1 : prev - 1);
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const validImages = selectedProperty.images!.filter(img => img.url && img.url !== 'uploads' && img.url !== 'uploads/');
                            setCurrentImageIndex(prev => prev === validImages.length - 1 ? 0 : prev + 1);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Grid */}
                  {selectedProperty.images.filter(img => img.url && img.url !== 'uploads' && img.url !== 'uploads/').length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-3">
                      {selectedProperty.images.filter(img => img.url && img.url !== 'uploads' && img.url !== 'uploads/').map((img, idx) => {
                        const thumbUrl = getFullImageUrl(img.url);
                        return thumbUrl ? (
                          <button
                            key={img.id}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 ${
                              idx === currentImageIndex ? 'border-[#1B3A5C] ring-2 ring-[#1B3A5C]/20' : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <img
                              src={thumbUrl}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Owner Name:</span><span className="font-medium">{selectedProperty.ownerName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">ID/TIN:</span><span>{selectedProperty.idOrTin}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span>{selectedProperty.phoneNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(selectedProperty.status)}`}>{selectedProperty.status}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Property Type:</span><span>{selectedProperty.propertyType || 'Not specified'}</span></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Province:</span><span>{selectedProperty.province}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">District:</span><span>{selectedProperty.district}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Sector:</span><span>{selectedProperty.sector}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cell:</span><span>{selectedProperty.cell}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Village:</span><span>{selectedProperty.village}</span></div>
                  </div>
                </div>
                {selectedProperty.assignment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Assignment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Data Collector:</span><span className="font-medium">{selectedProperty.assignment.collector.name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Collector Email:</span><span>{selectedProperty.assignment.collector.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Assigned At:</span><span>{formatDate(selectedProperty.assignment.assignedAt)}</span></div>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Valuation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">AI Valuation:</span><span className="font-semibold text-indigo-600">{formatCurrency(selectedProperty.aiValuation || 0)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}