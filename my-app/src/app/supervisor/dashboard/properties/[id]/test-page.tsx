// Temporarily replace your existing [id]/page.tsx with this simple version
'use client';

import { useParams } from 'next/navigation';

export default function TestPropertyPage() {
  const params = useParams();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Dynamic Route Test</h1>
        <p className="text-gray-600 mb-2">Property ID from URL:</p>
        <p className="text-xl font-mono text-blue-600 bg-blue-50 p-3 rounded">
          {params.id}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          If you see this page, the dynamic route is working!
        </p>
      </div>
    </div>
  );
}