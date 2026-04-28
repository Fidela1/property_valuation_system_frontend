'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaHome, FaBuilding, FaInfoCircle, FaEnvelope, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from 'react-icons/fa';
import houseIcon from '@/asset/house.png';
import Image from 'next/image';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-primary-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
  
          <Link href="/" className="flex items-center space-x-2">
            <Image src={houseIcon} alt="Home" width={26} height={26} />
            <span className="text-xl font-bold text-primary-200 text-white">PropertyVal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-white hover:text-primary-600 transition-colors">
              Properties
            </Link>
            <Link href="/about" className="text-white hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-white hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </div>

        
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-white border border-gray-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="border-2 border-white text-white px-6 py-2 rounded-lg font-medium transition duration-300"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link href="/properties" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                Properties
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                Contact
              </Link>
              <div className="pt-3 flex flex-col space-y-2">
                <Link
                  href="/login"
                  className="text-center px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;