'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

export default function LandingPage() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-2 shadow-lg mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-700">
              🎉 Now Live on Testnet
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Turn Audio Memes
            </span>
            <br />
            <span className="text-gray-800">Into Tradeable Assets</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            The first audio meme launchpad on Solana. Create, trade, and earn from viral sounds with bonding curve mechanics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/create"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              🚀 Create Your Token
            </Link>
            <Link
              href="/tokens"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              🔍 Explore Tokens
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-4xl font-black text-purple-600 mb-2">0.02 SOL</div>
              <div className="text-gray-600 font-semibold">Creation Fee</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-4xl font-black text-pink-600 mb-2">1%</div>
              <div className="text-gray-600 font-semibold">Trading Fee</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-4xl font-black text-blue-600 mb-2">Instant</div>
              <div className="text-gray-600 font-semibold">Liquidity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-800">
              Why NoizLabs?
            </h2>
            <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
              The pump.fun for audio. Fair launch, instant liquidity, zero rug pulls.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-200">
                <div className="text-5xl mb-4">🎵</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Audio First</h3>
                <p className="text-gray-600">
                  Upload any audio meme, AI-generated voice, or sound effect. Make it tradeable in seconds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-200">
                <div className="text-5xl mb-4">📈</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Bonding Curve</h3>
                <p className="text-gray-600">
                  Automatic price discovery. No liquidity pools needed. Price increases as more tokens are bought.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-200">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Solana Speed</h3>
                <p className="text-gray-600">
                  Lightning-fast trades with minimal fees. Built on Solana for the best DeFi experience.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-200">
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Earn Points</h3>
                <p className="text-gray-600">
                  Every action earns points. Get rewarded with $NOIZ tokens at mainnet launch.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-200">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Fair Launch</h3>
                <p className="text-gray-600">
                  No presales, no VCs dumping on you. Everyone starts at the same bonding curve price.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-200">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Go Viral</h3>
                <p className="text-gray-600">
                  Share your audio tokens everywhere. The more viral it gets, the higher the price.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-gray-800">
              How It Works
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-2xl p-8 shadow-xl">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">Upload Your Audio</h3>
                  <p className="text-gray-600">
                    Record a voice memo, upload a sound effect, or generate AI voices. Any audio works.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-2xl p-8 shadow-xl">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-pink-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">Create Token</h3>
                  <p className="text-gray-600">
                    Set name and symbol. Pay 0.02 SOL. Your token launches with a bonding curve instantly.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-2xl p-8 shadow-xl">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">Share & Profit</h3>
                  <p className="text-gray-600">
                    Share on Twitter, Discord, TikTok. As people buy, price goes up. Early holders win big.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Launch Your Audio Token?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join the first wave of audio meme creators. Get rewarded with points for the $NOIZ airdrop.
          </p>
          <Link
            href="/create"
            className="inline-block px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
          >
            🎵 Create Your First Token
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-3xl">🎵</span>
                <span className="text-xl font-bold">NoizLabs</span>
              </div>
              <p className="text-gray-400">
                The first audio meme launchpad on Solana.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/create" className="hover:text-white transition-colors">Create</Link></li>
                <li><Link href="/tokens" className="hover:text-white transition-colors">Explore</Link></li>
                <li><Link href="/trade" className="hover:text-white transition-colors">Trade</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 NoizLabs. Built on Solana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}