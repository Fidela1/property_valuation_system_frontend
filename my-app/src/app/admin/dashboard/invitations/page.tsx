'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Briefcase, Send, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function CreateInvitationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CLIENT',
    phone: '',
  });

  const roles = [
    { value: 'CLIENT', label: 'Property Owner', description: 'Can submit properties for valuation' },
    { value: 'DATA_COLLECTOR', label: 'Data Collector', description: 'Visits properties and collects data' },
    { value: 'SUPERVISOR', label: 'Supervisor', description: 'Reviews and approves valuations' },
    { value: 'ADMIN', label: 'Administrator', description: 'Full system access' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/admin/dashboard/invitations', formData);
      
      if (response.data.success) {
        setSuccess('Invitation sent successfully! The user will receive an email with instructions to complete their registration.');
        setInvitationLink(response.data.data.invitationLink);
        setFormData({ name: '', email: '', role: 'CLIENT', phone: '' });
        
        // Don't navigate away - let admin see the success message
        // After 3 seconds, clear the invitation link display but keep success
        setTimeout(() => {
          setInvitationLink('');
        }, 10000);
      }
    } catch (err: any) {
      console.error('Invitation error:', err);
      setError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    alert('Invitation link copied to clipboard! You can share this link with the user.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-[#1B3A5C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5F8A] px-6 py-5">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white">Send Invitation</h1>
                <p className="text-indigo-100 text-sm">Invite users to join the platform</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-700 text-sm">{success}</p>
                    {invitationLink && (
                      <div className="mt-3">
                        <p className="text-xs text-green-600 mb-2 font-medium">Invitation Link (for manual sharing):</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={invitationLink}
                            readOnly
                            className="flex-1 text-xs bg-green-50 border border-green-200 rounded px-2 py-1.5 text-gray-700"
                          />
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Copy Link
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          The user will also receive this link via email. They need to click it to complete registration.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Phone Field (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none"
                placeholder="Enter phone number"
              />
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3A5C] focus:border-[#1B3A5C] outline-none appearance-none"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {roles.find(r => r.value === formData.role)?.description}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2C5F8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </button>

            {/* Note about email */}
            <div className="text-center text-xs text-gray-400 pt-2">
              <p>The invited user will receive an email with a link to complete their registration.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}