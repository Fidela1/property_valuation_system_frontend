import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token;
  const resetSuccess = params?.reset;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordClient token={token} resetSuccess={resetSuccess} />
    </Suspense>
  );
}