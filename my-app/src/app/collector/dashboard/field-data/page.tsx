'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Navigation, Loader2, AlertCircle, TrendingUp, 
  DollarSign, Home, Car, Trees, Fence, Shield, School, Hospital, 
  Bus, ShoppingBag, Camera, Upload, X 
} from 'lucide-react';
import api from '@/lib/api';

export default function FieldDataPage() {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [liveValuation, setLiveValuation] = useState<any>(null);
  const [valuationLoading, setValuationLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [gpsLocation, setGpsLocation] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    accuracy: null as number | null
  });
  
  const [formData, setFormData] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    gpsAccuracy: null as number | null,
    propertyType: 'HOUSE',
    condition: 'GOOD',
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
    roadAccessType: 'PAVED',
    valuationAmount: '',
    notes: ''
  });

  // Get propertyId from localStorage when page loads
  useEffect(() => {
    const storedPropertyId = localStorage.getItem('currentPropertyId');
    
    if (storedPropertyId) {
      setPropertyId(storedPropertyId);
      localStorage.removeItem('currentPropertyId');
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    if (propertyId) {
      getCurrentLocation();
    }
  }, [propertyId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (propertyId && formData.landSize && formData.buildingSize) {
        calculateLiveValuation();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    formData.landSize,
    formData.buildingSize,
    formData.bedrooms,
    formData.bathrooms,
    formData.yearBuilt,
    formData.propertyType,
    formData.condition,
    formData.hasGarden,
    formData.gardenSize,
    formData.hasAnnex,
    formData.annexSize,
    formData.hasGate,
    formData.gateType,
    formData.hasFence,
    formData.fenceHeight,
    formData.parkingSpaces,
    formData.nearestSchoolKm,
    formData.nearestHospitalKm,
    formData.nearestTransportKm,
    formData.nearestMarketKm,
    formData.roadAccessType,
    propertyId
  ]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          gpsAccuracy: position.coords.accuracy
        }));
        
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Please allow location access to capture GPS coordinates';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Failed to get location. Please check your GPS.';
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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

  const calculateLiveValuation = async () => {
    setValuationLoading(true);
    
    try {
      let propertyType = 'STANDARD';
      const buildingSizeNum = parseFloat(formData.buildingSize) || 0;
      const bedroomsNum = parseInt(formData.bedrooms) || 0;
      
      if (buildingSizeNum > 500 || bedroomsNum > 5 || formData.propertyType === 'VILLA') {
        propertyType = 'LUXURY';
      } else if (buildingSizeNum < 100 || bedroomsNum <= 2) {
        propertyType = 'BASIC';
      }
      
      let propertyCategory = 'RESIDENTIAL';
      if (formData.propertyType === 'COMMERCIAL') propertyCategory = 'COMMERCIAL';
      else if (formData.propertyType === 'LAND') propertyCategory = 'LAND';
      
      let floorMaterial = 'Cement';
      if (formData.gardenType === 'Luxury') floorMaterial = 'Marble';
      else if (formData.gardenType === 'Medium') floorMaterial = 'Tiles';
      else if (formData.gardenType === 'Large') floorMaterial = 'Wood';
      
      let roofType = 'Iron sheets';
      if (propertyType === 'LUXURY') roofType = 'Concrete';
      else if (propertyType === 'STANDARD') roofType = 'Tiles';
      
      const payload = {
        landSize: parseFloat(formData.landSize) || 0,
        buildingSize: parseFloat(formData.buildingSize) || 0,
        yearBuilt: parseInt(formData.yearBuilt) || 2000,
        propertyType: propertyType,
        propertyCategory: propertyCategory,
        bedrooms: parseInt(formData.bedrooms) || 2,
        bathrooms: parseFloat(formData.bathrooms) || 1,
        gardenSize: parseFloat(formData.gardenSize) || 0,
        fenceHeight: parseFloat(formData.fenceHeight) || 0,
        gateType: formData.gateType ? formData.gateType.toUpperCase() : null,
        parkingSpaces: parseInt(formData.parkingSpaces) || 0,
        hasElectricity: true,
        hasWaterSupply: true,
        hasWaterTank: false,
        floodRisk: false,
        landSlope: "Flat",
        floorMaterial: floorMaterial,
        roofType: roofType,
        district: "Gasabo",
        nearestSchoolKm: parseFloat(formData.nearestSchoolKm) || 2,
        nearestHospitalKm: parseFloat(formData.nearestHospitalKm) || 3,
        nearestTransportKm: parseFloat(formData.nearestTransportKm) || 1,
        nearestMarketKm: parseFloat(formData.nearestMarketKm) || 1.5,
        roadAccessType: formData.roadAccessType || "PAVED"
      };
      
      const response = await api.post('/valuation/live', payload);
      
      if (response.data.success) {
        setLiveValuation(response.data.data);
        
        if (!formData.valuationAmount && response.data.data.estimatedValue) {
          setFormData(prev => ({
            ...prev,
            valuationAmount: response.data.data.estimatedValue.toString()
          }));
        }
      }
    } catch (err) {
      console.error('Live valuation error:', err);
    } finally {
      setValuationLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!propertyId) {
    alert('Property ID not found. Please go back and try again.');
    return;
  }
  
  if (!formData.latitude || !formData.longitude) {
    alert('Please capture GPS location before submitting');
    return;
  }
  
  if (uploadedImages.length === 0) {
    alert('Please upload at least one property image');
    return;
  }
  
  setSubmitting(true);
  setUploadingImages(true);
  
  try {
    const token = localStorage.getItem('token');
    
    // STEP 1: Upload images
    const uploadedImageUrls = [];
    
    for (let i = 0; i < uploadedImages.length; i++) {
  const image = uploadedImages[i];

  const imageFormData = new FormData();
  imageFormData.append('images', image);
  
  const uploadUrl = `/upload/properties/${propertyId}/images`;
  
  try {
    const uploadResponse = await api.post(uploadUrl, imageFormData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000
    });

    if (uploadResponse.status === 200 || uploadResponse.status === 201) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}_${i}_${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imageUrl = `/uploads/properties/${uniqueId}`;
      
      uploadedImageUrls.push({
        url: imageUrl,
        publicId: uniqueId
      });
      
      console.log(`Image ${i + 1} URL (constructed):`, imageUrl);
    } else {
      console.error('Upload failed with status:', uploadResponse.status);
    }
  } catch (uploadError: any) {
    throw uploadError;
  }
}

    const fieldDataPayload = {
      propertyId: propertyId,
      latitude: parseFloat(String(formData.latitude)),
      longitude: parseFloat(String(formData.longitude)),
      gpsAccuracy: formData.gpsAccuracy ? parseFloat(String(formData.gpsAccuracy)) : null,
      propertyType: formData.propertyType,
      condition: formData.condition,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
      landSize: formData.landSize ? parseFloat(formData.landSize) : null,
      buildingSize: formData.buildingSize ? parseFloat(formData.buildingSize) : null,
      yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
      parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : null,
      hasGarden: formData.hasGarden,
      gardenSize: formData.gardenSize ? parseFloat(formData.gardenSize) : null,
      gardenType: formData.gardenType,
      hasAnnex: formData.hasAnnex,
      annexType: formData.annexType,
      annexSize: formData.annexSize ? parseFloat(formData.annexSize) : null,
      annexBedrooms: formData.annexBedrooms ? parseInt(formData.annexBedrooms) : null,
      annexBathrooms: formData.annexBathrooms ? parseFloat(formData.annexBathrooms) : null,
      hasGate: formData.hasGate,
      gateType: formData.gateType,
      gateMaterial: formData.gateMaterial,
      hasFence: formData.hasFence,
      fenceType: formData.fenceType,
      fenceHeight: formData.fenceHeight ? parseFloat(formData.fenceHeight) : null,
      nearestSchoolKm: formData.nearestSchoolKm ? parseFloat(formData.nearestSchoolKm) : null,
      nearestHospitalKm: formData.nearestHospitalKm ? parseFloat(formData.nearestHospitalKm) : null,
      nearestTransportKm: formData.nearestTransportKm ? parseFloat(formData.nearestTransportKm) : null,
      nearestMarketKm: formData.nearestMarketKm ? parseFloat(formData.nearestMarketKm) : null,
      roadAccessType: formData.roadAccessType,
      valuationAmount: formData.valuationAmount ? parseFloat(formData.valuationAmount) : null,
      notes: formData.notes,
      images: uploadedImageUrls
    };
    
    const response = await api.post('/collector/dashboard/field-data', fieldDataPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      alert('Field data submitted successfully!');
      router.push('/collector/dashboard');
    } else {
      alert(response.data.error || 'Failed to submit field data');
    }
  } catch (err: any) {
    alert(err.response?.data?.error || err.message || 'Failed to submit field data');
  } finally {
    setSubmitting(false);
    setUploadingImages(false);
  }
};
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#1B3A5C] animate-spin" />
      </div>
    );
  }

  if (!propertyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No Property Selected</h1>
          <p className="text-gray-600 mb-6">Please go back and select a property to collect field data.</p>
          <button
            onClick={() => router.push('/collector/dashboard/assignments')}
            className="px-4 py-2 bg-[#1B3A5C] text-white rounded-lg"
          >
            Go to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/collector/dashboard/assignments" className="inline-flex items-center gap-2 text-[#1B3A5C] hover:text-[#2C5F8A] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </Link>

        <div className="flex gap-6">
          {/* Left Column - Form */}
          <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5F8A] px-6 py-4">
              <h1 className="text-xl font-bold text-white">Field Data Collection</h1>
              <p className="text-indigo-100 text-sm">Enter property details - valuation updates live</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* GPS Location Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#1B3A5C]" />
                    <h2 className="font-semibold text-gray-900">GPS Location (Auto-captured)</h2>
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] disabled:opacity-50"
                  >
                    {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    {locationLoading ? 'Getting Location...' : 'Refresh Location'}
                  </button>
                </div>
                
                {locationError && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700">{locationError}</p>
                  </div>
                )}
                
                {gpsLocation.latitude && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location captured successfully!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Lat: {gpsLocation.latitude}, Lng: {gpsLocation.longitude}
                      {gpsLocation.accuracy && ` (Accuracy: ±${Math.round(gpsLocation.accuracy)}m)`}
                    </p>
                  </div>
                )}
              </div>

              {/* Property Features Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Property Features</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                      <option value="HOUSE">House</option>
                      <option value="APARTMENT">Apartment</option>
                      <option value="VILLA">Villa</option>
                      <option value="LAND">Land</option>
                      <option value="COMMERCIAL">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="NEEDS_RENOVATION">Needs Renovation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Number of bedrooms" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input name="bathrooms" type="number" step="0.5" value={formData.bathrooms} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Number of bathrooms" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (m²)</label>
                    <input name="landSize" type="number" value={formData.landSize} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Land size" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Building Size (m²)</label>
                    <input name="buildingSize" type="number" value={formData.buildingSize} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Building size" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                    <input name="yearBuilt" type="number" value={formData.yearBuilt} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Year of construction" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parking Spaces</label>
                    <input name="parkingSpaces" type="number" value={formData.parkingSpaces} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Parking spaces" />
                  </div>
                </div>
              </div>

              {/* Garden Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trees className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Garden</h2>
                  <label className="ml-4 flex items-center gap-2">
                    <input type="checkbox" name="hasGarden" checked={formData.hasGarden} onChange={handleChange} />
                    <span className="text-sm text-gray-600">Has Garden</span>
                  </label>
                </div>
                {formData.hasGarden && (
                  <div className="grid grid-cols-2 gap-4">
                    <input name="gardenSize" type="number" placeholder="Garden Size (m²)" value={formData.gardenSize} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                    <select name="gardenType" value={formData.gardenType} onChange={handleChange} className="px-3 py-2 border rounded-lg">
                      <option value="">Select Type</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Annex Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Annex / Guest House</h2>
                  <label className="ml-4 flex items-center gap-2">
                    <input type="checkbox" name="hasAnnex" checked={formData.hasAnnex} onChange={handleChange} />
                    <span className="text-sm text-gray-600">Has Annex</span>
                  </label>
                </div>
                {formData.hasAnnex && (
                  <div className="grid grid-cols-2 gap-4">
                    <input name="annexType" type="text" placeholder="Annex Type" value={formData.annexType} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                    <input name="annexSize" type="number" placeholder="Annex Size (m²)" value={formData.annexSize} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                    <input name="annexBedrooms" type="number" placeholder="Annex Bedrooms" value={formData.annexBedrooms} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                    <input name="annexBathrooms" type="number" step="0.5" placeholder="Annex Bathrooms" value={formData.annexBathrooms} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  </div>
                )}
              </div>

              {/* Gate & Fence Sections */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Gate & Fence</h2>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="hasGate" checked={formData.hasGate} onChange={handleChange} />
                    <span className="text-sm text-gray-600">Has Gate</span>
                  </label>
                  {formData.hasGate && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <select name="gateType" value={formData.gateType} onChange={handleChange} className="px-3 py-2 border rounded-lg">
                        <option value="">Gate Type</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Sliding">Sliding</option>
                        <option value="Swing">Swing</option>
                        <option value="Manual">Manual</option>
                      </select>
                      <input name="gateMaterial" type="text" placeholder="Gate Material" value={formData.gateMaterial} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                    </div>
                  )}
                  
                  <label className="flex items-center gap-2 mt-3">
                    <input type="checkbox" name="hasFence" checked={formData.hasFence} onChange={handleChange} />
                    <span className="text-sm text-gray-600">Has Fence/Wall</span>
                  </label>
                  {formData.hasFence && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <select name="fenceType" value={formData.fenceType} onChange={handleChange} className="px-3 py-2 border rounded-lg">
                        <option value="">Fence Type</option>
                        <option value="Wall">Wall</option>
                        <option value="Chain-link">Chain-link</option>
                        <option value="Barbed wire">Barbed wire</option>
                        <option value="Hedge">Hedge</option>
                      </select>
                      <input name="fenceHeight" type="number" step="0.5" placeholder="Fence Height (m)" value={formData.fenceHeight} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                    </div>
                  )}
                </div>
              </div>

              {/* Neighborhood Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <School className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Nearby Amenities</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="nearestSchoolKm" type="number" step="0.1" placeholder="Nearest School (km)" value={formData.nearestSchoolKm} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input name="nearestHospitalKm" type="number" step="0.1" placeholder="Nearest Hospital (km)" value={formData.nearestHospitalKm} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input name="nearestTransportKm" type="number" step="0.1" placeholder="Public Transport (km)" value={formData.nearestTransportKm} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input name="nearestMarketKm" type="number" step="0.1" placeholder="Nearest Market (km)" value={formData.nearestMarketKm} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <div className="col-span-2">
                    <select name="roadAccessType" value={formData.roadAccessType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                      <option value="PAVED">Paved Road</option>
                      <option value="UNPAVED">Unpaved Road</option>
                      <option value="DIRT">Dirt Road</option>
                      <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Valuation Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Your Valuation</h2>
                </div>
                <input name="valuationAmount" type="number" placeholder="Estimated Value (RWF)" value={formData.valuationAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>

              {/* Notes Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter any additional observations or comments..." />
              </div>

              {/* Image Upload Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-[#1B3A5C]" />
                  <h2 className="font-semibold text-gray-900">Property Images</h2>
                  <span className="text-xs text-red-500 ml-2">* Required (at least one image)</span>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B3A5C] transition-colors">
                  <input type="file" id="imageUpload" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-400">Supports JPG, PNG (Max 5MB each)</p>
                  </label>
                </div>
                
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">{imagePreviews.length} image(s) selected</p>
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => router.push('/collector/dashboard/assignments')} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.latitude || uploadedImages.length === 0}
                  className="px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {submitting ? (uploadingImages ? 'Uploading Images...' : 'Submitting...') : 'Submit Field Data'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Live Valuation */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-gradient-to-br from-[#1B3A5C] to-[#2C5F8A] rounded-xl shadow-lg overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-white/80" />
                    <h3 className="text-white/80 text-sm uppercase tracking-wide">Live Valuation</h3>
                    {valuationLoading && <Loader2 className="w-4 h-4 text-white/80 animate-spin ml-auto" />}
                  </div>
                  
                  {liveValuation ? (
                    <>
                      <div className="text-center mb-4">
                        <p className="text-3xl font-bold text-white">{liveValuation.estimatedValue?.toLocaleString()} RWF</p>
                        <p className="text-xs text-white/70 mt-1">AI Estimated Value</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-white/80 mb-1">
                            <span>Confidence Score</span>
                            <span>{liveValuation.confidenceScore || 85}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${liveValuation.confidenceScore || 85}%` }} />
                          </div>
                        </div>
                        
                        <div className="border-t border-white/20 pt-3 mt-2">
                          <p className="text-white/70 text-xs mb-2">Breakdown</p>
                          <div className="space-y-1 text-white/80 text-xs">
                            <div className="flex justify-between">
                              <span>Land Value:</span>
                              <span>{liveValuation.breakdown?.landValue?.toLocaleString() || 0} RWF</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Building Value:</span>
                              <span>{liveValuation.breakdown?.buildingValue?.toLocaleString() || 0} RWF</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-white/20 mt-1">
                              <span className="font-semibold">Total:</span>
                              <span className="font-semibold">{liveValuation.estimatedValue?.toLocaleString()} RWF</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">Enter property details to see live valuation</p>
                      <p className="text-white/40 text-xs mt-2">Land size and building size required</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-800">💡 Tip: The valuation updates automatically as you enter data. Add land size and building size to start the calculation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}