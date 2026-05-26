'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Home,
} from 'lucide-react';
import api from '@/lib/api';

/* =========================
   WRAPPER (Fix for Next.js 16)
========================= */
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInvitationPage />
    </Suspense>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phone: '',
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      return;
    }
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      const response = await api.get(`/invitation/verify/${token}`);
      if (response.data.success) {
        setInvitationData(response.data.data);
      } else {
        setError(response.data.error || 'Invalid invitation link');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to verify invitation'
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(
        '/invitation/accept',
        {
          token,
          password: formData.password,
          phone: formData.phone,
        }
      );

      if (response.data.success) {
        setSuccess(
          'Account created successfully! Redirecting...'
        );

        localStorage.setItem(
          'token',
          response.data.data.token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(response.data.data.user)
        );

        setTimeout(() => {
          router.push('/clientDashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Failed to create account'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ERROR STATE
  ========================= */
  if (error && !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Invitation
          </h2>

          <p className="text-gray-600 mb-6">
            {error}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  /* =========================
     LOADING STATE
  ========================= */
  if (!invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            Verifying invitation...
          </p>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    CLIENT: 'Property Owner',
    DATA_COLLECTOR: 'Data Collector',
    SUPERVISOR: 'Supervisor',
    ADMIN: 'Administrator',
  };

  /* =========================
     MAIN UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2C5F8A] px-6 py-5 text-center">
          <h1 className="text-xl font-bold text-white">
            Welcome to PropertyVal
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            Complete your account setup
          </p>
        </div>

        <div className="p-6">

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              You've been invited as:
            </p>
            <p className="text-lg font-semibold text-[#1B3A5C]">
              {roleLabels[invitationData.role]}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Email: {invitationData.email}
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 text-sm">
                {success}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 text-sm">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone (optional)"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#1B3A5C] text-white rounded-lg"
            >
              {loading
                ? 'Creating Account...'
                : 'Create Account'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}