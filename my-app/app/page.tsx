import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            <span className="block text-indigo-600">Property Valuation</span>
            <span className="block">Made Simple with AI</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            Get accurate property valuations powered by artificial intelligence.
            Perfect for buyers, sellers, banks, and real estate professionals.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 text-lg font-medium text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}