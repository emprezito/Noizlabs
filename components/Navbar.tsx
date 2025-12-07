'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const wallet = useWallet();
  const [isClient, setIsClient] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Explore', href: '/tokens' },
    { name: 'Create', href: '/create' },
    { name: 'Trade', href: '/trade' },
    { name: ' Discover', href: '/discover' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = (href: string) => {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(href);
};

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-3xl">🎵</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              NoizLabs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-purple-100 hover:text-purple-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            {wallet.connected && (
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-green-700">
                  {wallet.publicKey?.toString().slice(0, 4)}...
                  {wallet.publicKey?.toString().slice(-4)}
                </span>
              </div>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-lg !font-semibold !transition-all" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-semibold transition-all ${
                  isActive(item.href)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-purple-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Wallet Section */}
            <div className="pt-4 border-t border-gray-200">
              {wallet.connected && (
                <div className="mb-3 flex items-center space-x-2 bg-green-50 px-4 py-3 rounded-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-green-700">
                    Connected: {wallet.publicKey?.toString().slice(0, 8)}...
                  </span>
                </div>
              )}
              <WalletMultiButton className="!w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 !rounded-lg !font-semibold" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
