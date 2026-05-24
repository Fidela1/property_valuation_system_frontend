'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Navigation, Loader2, AlertCircle, TrendingUp, 
  DollarSign, Home, Trees, Fence, Shield, School, Hospital, 
  Bus, ShoppingBag, Camera, Upload, X, Save 
} from 'lucide-react';
import api from '@/lib/api';

export default function EditFieldDataPage() {
  const params = useParams();
  const router = useRouter();
  const fieldDataId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  const [liveValuation, setLiveValuation] = useState<any>(null);
  const [valuationLoading, setValuationLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    gpsAccuracy: '',
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

  const propertyTypes = ['HOUSE', 'APARTMENT', 'VILLA', 'LAND', 'COMMERCIAL'];
  const conditions = ['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_RENOVATION'];
  const roadAccessTypes = ['PAVED', 'UNPAVED', 'DIRT', 'UNDER_CONSTRUCTION'];
  const gateTypes = ['AUTOMATIC', 'SLIDING', 'SWING', 'MANUAL'];
  const fenceTypes = ['CHAIN_LINK', 'WOOD', 'BRICK', 'WALL', 'ELECTRIC'];

  useEffect(() => {
    fetchFieldData();
  }, [fieldDataId]);

  const fetchFieldData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/collector/dashboard/field-data/${fieldDataId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('Fetched field data:', data);
      
      setPropertyId(data.propertyId);
      setPropertyInfo(data.property);
      setExistingImages(data.property?.images || []);  // ✅ Fixed: images from property
      
      // Populate form with existing data
      setFormData({
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        gpsAccuracy: data.gpsAccuracy || '',
        propertyType: data.propertyType || 'HOUSE',
        condition: data.condition || 'GOOD',
        bedrooms: data.bedrooms?.toString() || '',
        bathrooms: data.bathrooms?.toString() || '',
        landSize: data.landSize?.toString() || '',
        buildingSize: data.buildingSize?.toString() || '',
        yearBuilt: data.yearBuilt?.toString() || '',
        parkingSpaces: data.parkingSpaces?.toString() || '',
        hasGarden: data.hasGarden || false,
        gardenSize: data.gardenSize?.toString() || '',
        gardenType: data.gardenType || '',
        hasAnnex: data.hasAnnex || false,
        annexType: data.annexType || '',
        annexSize: data.annexSize?.toString() || '',
        annexBedrooms: data.annexBedrooms?.toString() || '',
        annexBathrooms: data.annexBathrooms?.toString() || '',
        hasGate: data.hasGate || false,
        gateType: data.gateType || '',
        gateMaterial: data.gateMaterial || '',
        hasFence: data.hasFence || false,
        fenceType: data.fenceType || '',
        fenceHeight: data.fenceHeight?.toString() || '',
        nearestSchoolKm: data.nearestSchoolKm?.toString() || '',
        nearestHospitalKm: data.nearestHospitalKm?.toString() || '',
        nearestTransportKm: data.nearestTransportKm?.toString() || '',
        nearestMarketKm: data.nearestMarketKm?.toString() || '',
        roadAccessType: data.roadAccessType || 'PAVED',
        valuationAmount: data.valuationAmount?.toString() || '',
        notes: data.notes || ''
      });
    }
  } catch (error) {
    console.error('Error fetching field data:', error);
    alert('Failed to load field data');
    router.push('/collector/dashboard');
  } finally {
    setLoading(false);
  }
};
const compressImage = (file: File, maxSizeMB = 2): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions (max 1200px width)
        const maxWidth = 1200;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          0.7 // Quality (0.7 = 70%)
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  
  // Compress each file
  const compressedFiles = await Promise.all(
    files.map(async (file) => {
      if (file.size > 2 * 1024 * 1024) { // If file > 2MB, compress
        return await compressImage(file);
      }
      return file;
    })
  );
  
  setUploadedImages([...uploadedImages, ...compressedFiles]);
  
  compressedFiles.forEach(file => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews(prev => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  });
};

  const removeExistingImage = (imageId: string, imageUrl: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    setDeletedImages(prev => [...prev, imageId]);
  };

  const removeNewImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const calculateLiveValuation = async () => {
    if (!formData.landSize || !formData.buildingSize) return;
    
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
        district: propertyInfo?.district || "Gasabo",
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
          setFormData(prev => ({ ...prev, valuationAmount: response.data.data.estimatedValue.toString() }));
        }
      }
    } catch (err) {
      console.error('Live valuation error:', err);
    } finally {
      setValuationLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.landSize && formData.buildingSize) {
        calculateLiveValuation();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    formData.landSize, formData.buildingSize, formData.bedrooms, formData.bathrooms,
    formData.yearBuilt, formData.propertyType, formData.condition,
    formData.hasGarden, formData.gardenSize, formData.hasAnnex, formData.annexSize,
    formData.hasGate, formData.gateType, formData.hasFence, formData.fenceHeight,
    formData.parkingSpaces, formData.nearestSchoolKm, formData.nearestHospitalKm,
    formData.nearestTransportKm, formData.nearestMarketKm, formData.roadAccessType
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyId) {
      alert('Property ID not found');
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      alert('Please enter GPS coordinates');
      return;
    }
    
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Upload new images
      const newImageUrls = [];
      for (let i = 0; i < uploadedImages.length; i++) {
        const image = uploadedImages[i];
        const imageFormData = new FormData();
        imageFormData.append('images', image);
        
        const uploadUrl = `/upload/properties/${propertyId}/images`;
        const uploadResponse = await api.post(uploadUrl, imageFormData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadResponse.data.success && uploadResponse.data.data?.url) {
          newImageUrls.push({
            url: uploadResponse.data.data.url,
            publicId: uploadResponse.data.data.publicId
          });
        }
      }
      
      // Delete removed images
      for (const imageId of deletedImages) {
        await api.delete(`/upload/images/${imageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Submit updated field data
      const payload = {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        gpsAccuracy: formData.gpsAccuracy ? parseFloat(formData.gpsAccuracy) : null,
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
        images: [...existingImages.map(img => ({ url: img.url, publicId: img.publicId })), ...newImageUrls]
      };
      
      const response = await api.put(`/collector/dashboard/field-data/${fieldDataId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert('Field data updated successfully!');
        router.push('/collector/dashboard');
      } else {
        alert(response.data.error || 'Failed to update field data');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err.response?.data?.error || 'Failed to update field data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#1B3A5C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/collector/dashboard" className="inline-flex items-center gap-2 text-[#1B3A5C] hover:text-[#2C5F8A] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
            <h1 className="text-xl font-bold text-white">Edit Field Data</h1>
            <p className="text-amber-100 text-sm">
              Property: {propertyInfo?.ownerName} - {propertyInfo?.upiNumber}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* GPS Coordinates */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" /> GPS Coordinates
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <input name="latitude" type="text" placeholder="Latitude" value={formData.latitude} onChange={handleChange} className="px-3 py-2 border rounded-lg" required />
                <input name="longitude" type="text" placeholder="Longitude" value={formData.longitude} onChange={handleChange} className="px-3 py-2 border rounded-lg" required />
                <input name="gpsAccuracy" type="text" placeholder="GPS Accuracy (m)" value={formData.gpsAccuracy} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
              </div>
            </div>

            {/* Property Features */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-600" /> Property Features
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="px-3 py-2 border rounded-lg">
                  {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select name="condition" value={formData.condition} onChange={handleChange} className="px-3 py-2 border rounded-lg">
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input name="bedrooms" type="number" placeholder="Bedrooms" value={formData.bedrooms} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                <input name="bathrooms" type="number" step="0.5" placeholder="Bathrooms" value={formData.bathrooms} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                <input name="landSize" type="number" placeholder="Land Size (m²)" value={formData.landSize} onChange={handleChange} className="px-3 py-2 border rounded-lg" required />
                <input name="buildingSize" type="number" placeholder="Building Size (m²)" value={formData.buildingSize} onChange={handleChange} className="px-3 py-2 border rounded-lg" required />
                <input name="yearBuilt" type="number" placeholder="Year Built" value={formData.yearBuilt} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                <input name="parkingSpaces" type="number" placeholder="Parking Spaces" value={formData.parkingSpaces} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
              </div>
            </div>

            {/* Garden & Annex */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Trees className="w-5 h-5 text-amber-600" /> Garden & Annex
              </h2>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" name="hasGarden" checked={formData.hasGarden} onChange={handleChange} /> Has Garden
              </label>
              {formData.hasGarden && (
                <div className="grid grid-cols-2 gap-4 ml-6">
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
              
              <label className="flex items-center gap-2 mt-3">
                <input type="checkbox" name="hasAnnex" checked={formData.hasAnnex} onChange={handleChange} /> Has Annex
              </label>
              {formData.hasAnnex && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <input name="annexType" type="text" placeholder="Annex Type" value={formData.annexType} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input name="annexSize" type="number" placeholder="Annex Size (m²)" value={formData.annexSize} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input name="annexBedrooms" type="number" placeholder="Annex Bedrooms" value={formData.annexBedrooms} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input name="annexBathrooms" type="number" step="0.5" placeholder="Annex Bathrooms" value={formData.annexBathrooms} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                </div>
              )}
            </div>

            {/* Gate & Fence */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" /> Gate & Fence
              </h2>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="hasGate" checked={formData.hasGate} onChange={handleChange} /> Has Gate
              </label>
              {formData.hasGate && (
                <div className="grid grid-cols-2 gap-4 ml-6 mt-2">
                  <select name="gateType" value={formData.gateType} onChange={handleChange} className="px-3 py-2 border rounded-lg">
                    <option value="">Gate Type</option>
                    {gateTypes.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input name="gateMaterial" type="text" placeholder="Gate Material" value={formData.gateMaterial} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                </div>
              )}
              
              <label className="flex items-center gap-2 mt-3">
                <input type="checkbox" name="hasFence" checked={formData.hasFence} onChange={handleChange} /> Has Fence/Wall
              </label>
              {formData.hasFence && (
                <div className="grid grid-cols-2 gap-4 ml-6 mt-2">
                  <select name="fenceType" value={formData.fenceType} onChange={handleChange} className="px-3 py-2 border rounded-lg">
                    <option value="">Fence Type</option>
                    {fenceTypes.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <input name="fenceHeight" type="number" step="0.5" placeholder="Fence Height (m)" value={formData.fenceHeight} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                </div>
              )}
            </div>

            {/* Neighborhood */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <School className="w-5 h-5 text-amber-600" /> Nearby Amenities
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input name="nearestSchoolKm" type="number" step="0.1" placeholder="Nearest School (km)" value={formData.nearestSchoolKm} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                <input name="nearestHospitalKm" type="number" step="0.1" placeholder="Nearest Hospital (km)" value={formData.nearestHospitalKm} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                <input name="nearestTransportKm" type="number" step="0.1" placeholder="Public Transport (km)" value={formData.nearestTransportKm} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                <input name="nearestMarketKm" type="number" step="0.1" placeholder="Nearest Market (km)" value={formData.nearestMarketKm} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                <div className="col-span-2">
                  <select name="roadAccessType" value={formData.roadAccessType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                    {roadAccessTypes.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Valuation */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" /> Valuation
              </h2>
              <input name="valuationAmount" type="number" placeholder="Estimated Value (RWF)" value={formData.valuationAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              <textarea name="notes" rows={3} placeholder="Additional Notes" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-3" />
            </div>

            {/* Live Valuation Card */}
            {liveValuation && (
              <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm">Live Valuation (Updated)</p>
                  {valuationLoading && <Loader2 className="w-4 h-4 text-white animate-spin" />}
                </div>
                <p className="text-2xl font-bold text-white">{liveValuation.estimatedValue?.toLocaleString()} RWF</p>
                {liveValuation.priceRange && (
                  <p className="text-xs text-white/70 mt-1">
                    Range: {liveValuation.priceRange.min?.toLocaleString()} - {liveValuation.priceRange.max?.toLocaleString()} RWF
                  </p>
                )}
              </div>
            )}

            {/* Images */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" /> Property Images
              </h2>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((img, idx) => (
                      <div key={img.id} className="relative group">
                        <img src={getFullImageUrl(img.url)} alt={`Property ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id, img.url)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Images Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-amber-500 transition-colors">
                <input type="file" id="imageUpload" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to add more images</p>
                  <p className="text-xs text-gray-400">Supports JPG, PNG (Max 5MB each)</p>
                </label>
              </div>
              
              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">New Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative group">
                        <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
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
              <button type="button" onClick={() => router.push('/collector/dashboard')} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Update Field Data'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper function
const getFullImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030';
  if (url.startsWith('/uploads')) return `${backendUrl}${url}`;
  return `${backendUrl}/${url}`;
};