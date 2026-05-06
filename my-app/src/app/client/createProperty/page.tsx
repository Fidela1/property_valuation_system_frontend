'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  User,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Building2
} from 'lucide-react';
import api from '@/lib/api';

// ============================================
// RWANDA LOCATION DATA
// ============================================

// Provinces
const PROVINCES = [
  'Kigali City',
  'Northern Province',
  'Eastern Province',
  'Southern Province',
  'Western Province'
];

// Districts by Province
const DISTRICTS: Record<string, string[]> = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
};

// Sectors by District
const SECTORS: Record<string, string[]> = {
  // Kigali City - Gasabo
  'Gasabo': ['Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'],
  'Kicukiro': ['Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga'],
  'Nyarugenge': ['Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Mageragere', 'Muhima', 'Nyakabanda', 'Nyamirambo', 'Nyarugenge', 'Rwezamenyo'],
  
  // Northern Province - Musanze
  'Musanze': ['Busogo', 'Cyuve','Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro'],
  'Burera': ['Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga','Gatebe', 'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 'Rugendabari', 'Ruhunde', 'Rusarabuye', 'Rwerere'],
  'Gakenke': ['Busengo', 'Coko','Cyabingo', 'Gakenke', 'Gashenyi', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Muhondo', 'Mugunga', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi'],
  'Gicumbi': ['Bukure', 'Bwisige', 'Byumba', 'Cyumba', 'Giti', 'Kaniga', 'Manyagiro', 'Miyove', 'Kageyo', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke II', 'Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Rwamiko', 'Shangasha' ],
  'Rulindo': ['Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Ntarabana', 'Rukozo', 'Rusiga', 'Shyorongi', 'Tumba'],
  
  // Eastern Province
  'Bugesera': ['Nyamata', 'Mayange', 'Ruhuha', 'Gashora', 'Ntarama', 'Mareba'],
  'Gatsibo': ['Kabarore', 'Gitoki', 'Murambi', 'Rwimbogo', 'Nyagihanga'],
  'Kayonza': ['Mukarange', 'Ruramira', 'Kabare', 'Muhazi', 'Murundi'],
  'Kirehe': ['Kigarama', 'Kigina', 'Musaza', 'Nyarubuye', 'Mahama'],
  'Ngoma': ['Kibungo', 'Remera', 'Mutenderi', 'Rukira', 'Zaza'],
  'Nyagatare': ['Nyagatare', 'Matimba', 'Tabagwe', 'Kiyombe', 'Karama'],
  'Rwamagana': ['Rwamagana', 'Kigabiro', 'Muhazi', 'Fumbwe', 'Gishari'],
  
  // Southern Province
  'Huye': ['Ngoma', 'Mbazi', 'Ruhashya', 'Simbi', 'Mukura', 'Gishamvu'],
  'Muhanga': ['Muhanga', 'Nyamabuye', 'Kinazi', 'Kabacuzi', 'Rongi'],
  'Kamonyi': ['Runda', 'Rugarika', 'Kayenzi', 'Muyira', 'Gacurabwenge'],
  'Nyanza': ['Nyanza', 'Busasamana', 'Mukingo', 'Nyagisozi', 'Kibilizi'],
  'Gisagara': ['Muganza', 'Kibirizi', 'Sovu', 'Kigembe', 'Mukindo'],
  'Nyamagabe': ['Kamegeli', 'Kibirizi', 'Buruhukiro', 'Kitabi', 'Mudasomwa'],
  'Nyaruguru': ['Kibeho', 'Kivu', 'Mata', 'Ruheru', 'Cyahinda'],
  'Ruhango': ['Ruhango', 'Mbuye', 'Kinazi', 'Byimana', 'Mwendo'],
  
  // Western Province
  'Rubavu': ['Gisenyi', 'Bugoyi', 'Kigeyo', 'Kanama', 'Rugerero'],
  'Rusizi': ['Kamembe', 'Gihundwe', 'Mururu', 'Mwezi', 'Bugarama'],
  'Karongi': ['Rubengera', 'Ruganda', 'Remera', 'Mubuga', 'Bwishyura'],
  'Nyamasheke': ['Kagano', 'Karengera', 'Shangi', 'Bushoki', 'Kirimbi'],
  'Ngororero': ['Ngororero', 'Kabaya', 'Muhanda', 'Mata', 'Ruhango'],
  'Nyabihu': ['Mukamira', 'Jenda', 'Karago', 'Bigogwe', 'Shyira'],
  'Rutsiro': ['Gihango', 'Musasa', 'Manyagiro', 'Mushonyi', 'Kivumu']
};

// Cells by Sector (sample data - in production, you'd fetch from API)
const CELLS: Record<string, string[]> = {
  'Nyarutarama': ['Kagugu', 'Rugando', 'Kibagabaga', 'Kinyarwanda', 'Rugunga'],
  'Kimihurura': ['Rugando', 'Kimihurura', 'Urugwiro', 'Nyarugenge', 'Kamuhoza'],
  'Kacyiru': ['Kacyiru', 'Urugwiro', 'Kinyarwanda', 'Kamukina', 'Kibagabaga'],
  'Remera': ['Remera', 'Rugando', 'Amahoro', 'Kisimenti', 'Gishushu'],
  'Gikondo': ['Kanserege', 'Gikondo', 'Rwezamenyo', 'Cyivugiza', 'Mpazi'],
  'Muhoza': ['Muhoza', 'Mpenge', 'Cyivugiza', 'Kabeza', 'Kagarama'],
  'Nyamata': ['Nyamata', 'Gako', 'Ntarama', 'Ruhuha', 'Mayange'],
  'Kibungo': ['Kibungo', 'Kazo', 'Gashora', 'Rukira', 'Zaza'],
  'Ngoma': ['Ngoma', 'Kigina', 'Muyebe', 'Rusagara', 'Muganza'],
  // Default for unlisted sectors
  'default': ['Central Cell', 'North Cell', 'South Cell', 'East Cell', 'West Cell']
};

// Villages by Cell (sample data)
const VILLAGES: Record<string, string[]> = {
  'Kagugu': ['Umuganda', 'Umucyo', 'Ubumwe', 'Urugwiro', 'Ubuntu'],
  'Rugando': ['Amahoro', 'Ubumwe', 'Urugwiro', 'Umucyo', 'Ubuntu'],
  'Kibagabaga': ['Kibagabaga', 'Rugunga', 'Muhaza', 'Rugando', 'Kigabiro'],
  'Kanserege': ['Kanserege', 'Gikondo', 'Mpazi', 'Cyivugiza', 'Muhabura'],
  'Muhoza': ['Muhoza', 'Mpenge', 'Kabeza', 'Kagarama', 'Cyanya'],
  // Default
  'default': ['Village A', 'Village B', 'Village C', 'Village D']
};

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    upiNumber: '',
    ownerName: '',
    idOrTin: '',
    phoneNumber: '',
    country: 'Rwanda',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
  });

  // Available options based on selections
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [availableCells, setAvailableCells] = useState<string[]>([]);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);

  const handleProvinceChange = (province: string) => {
    setFormData(prev => ({
      ...prev,
      province,
      district: '',
      sector: '',
      cell: '',
      village: ''
    }));
    setAvailableDistricts(DISTRICTS[province] || []);
    setAvailableSectors([]);
    setAvailableCells([]);
    setAvailableVillages([]);
  };

  const handleDistrictChange = (district: string) => {
    setFormData(prev => ({
      ...prev,
      district,
      sector: '',
      cell: '',
      village: ''
    }));
    setAvailableSectors(SECTORS[district] || []);
    setAvailableCells([]);
    setAvailableVillages([]);
  };

  const handleSectorChange = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sector,
      cell: '',
      village: ''
    }));
    setAvailableCells(CELLS[sector] || CELLS.default);
    setAvailableVillages([]);
  };

  const handleCellChange = (cell: string) => {
    setFormData(prev => ({
      ...prev,
      cell,
      village: ''
    }));
    setAvailableVillages(VILLAGES[cell] || VILLAGES.default);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'province':
        handleProvinceChange(value);
        break;
      case 'district':
        handleDistrictChange(value);
        break;
      case 'sector':
        handleSectorChange(value);
        break;
      case 'cell':
        handleCellChange(value);
        break;
      default:
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.upiNumber.trim()) {
      setError('UPI Number is required');
      return false;
    }
    if (!formData.ownerName.trim()) {
      setError('Owner Name is required');
      return false;
    }
    if (!formData.idOrTin.trim()) {
      setError('ID/TIN Number is required');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone Number is required');
      return false;
    }
    if (!formData.province) {
      setError('Province is required');
      return false;
    }
    if (!formData.district) {
      setError('District is required');
      return false;
    }
    if (!formData.sector) {
      setError('Sector is required');
      return false;
    }
    if (!formData.cell) {
      setError('Cell is required');
      return false;
    }
    if (!formData.village) {
      setError('Village is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const payload = {
      upiNumber: formData.upiNumber,
      ownerName: formData.ownerName,
      idOrTin: formData.idOrTin,
      phoneNumber: formData.phoneNumber,
      country: formData.country,
      province: formData.province,
      district: formData.district,
      sector: formData.sector,
      cell: formData.cell,
      village: formData.village,
    };

    // ✅ Updated to match your backend: /client/createProperty
    const response = await api.post('/client/createProperty', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      setSuccess('Property created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/client/dashboard');
      }, 1500);
    } else {
      setError(response.data.error || 'Failed to create property');
    }
  } catch (err: any) {
    console.error('Create property error:', err);
    setError(err.response?.data?.error || err.message || 'Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <Link 
          href="/client/dashboard" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B3A5C] to-[#244d79] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Add New Property</h1>
                <p className="text-indigo-100 text-sm mt-0.5">All fields are required</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Section: Property Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="upiNumber"
                    type="text"
                    required
                    value={formData.upiNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Enter UPI number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID/TIN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="idOrTin"
                    type="text"
                    required
                    value={formData.idOrTin}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Enter ID or TIN number"
                  />
                </div>
              </div>
            </div>

            {/* Section: Owner Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Owner Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="ownerName"
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Enter owner's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Section: Location */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Property Location</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="country"
                    type="text"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-all"
                    readOnly
                  />
                </div>

                {/* Province Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Select Province</option>
                    {PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.province}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Sector Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sector"
                    required
                    value={formData.sector}
                    onChange={handleChange}
                    disabled={!formData.district}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Sector</option>
                    {availableSectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                {/* Cell Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cell <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="cell"
                    required
                    value={formData.cell}
                    onChange={handleChange}
                    disabled={!formData.sector}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Cell</option>
                    {availableCells.map(cell => (
                      <option key={cell} value={cell}>{cell}</option>
                    ))}
                  </select>
                </div>

                {/* Village Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="village"
                    required
                    value={formData.village}
                    onChange={handleChange}
                    disabled={!formData.cell}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Village</option>
                    {availableVillages.map(village => (
                      <option key={village} value={village}>{village}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1B3A5C] to-[#244d79] text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Property...</span>
                  </div>
                ) : (
                  <span>Create Property</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}