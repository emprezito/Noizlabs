'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import idl from '../../lib/idl/audio_token_platform.json';
import Link from 'next/link';

const PROGRAM_ID = new PublicKey('8m6HBVw1n2q6E3YWTkqTE5KyNLhALdfGY7vcXQGMG6Uz');

interface AudioTokenData {
  mint: string;
  name: string;
  symbol: string;
  audioUri: string;
  authority: string;
  totalSupply: string;
  createdAt: number;
  bondingCurveData?: {
    solReserves: string;
    tokenReserves: string;
    tokensSold: string;
    price: number;
  };
}

export default function AllTokensPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [tokens, setTokens] = useState<AudioTokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllTokens();
  }, [connection]);

  const getProvider = () => {
    if (!wallet.publicKey) {
      return new AnchorProvider(connection, {} as any, { commitment: 'confirmed' });
    }
    return new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
  };

  const fetchAllTokens = async () => {
    setLoading(true);
    try {
      const provider = getProvider();
      const program = new Program(idl as any, provider);

      const audioTokenAccounts = await program.account.audioToken.all();
      
      console.log(`Found ${audioTokenAccounts.length} tokens`);

      const tokensWithData = await Promise.all(
        audioTokenAccounts.map(async (account) => {
          const audioToken = account.account;
          const mint = audioToken.mint.toString();

          try {
            const [bondingCurvePda] = PublicKey.findProgramAddressSync(
              [Buffer.from('bonding_curve'), audioToken.mint.toBuffer()],
              program.programId
            );

            const bondingCurve = await program.account.bondingCurve.fetch(bondingCurvePda);
            
            const solReserves = bondingCurve.solReserves.toNumber();
            const tokensSold = bondingCurve.tokensSold.toNumber();
            const price = tokensSold > 0 ? solReserves / tokensSold : 0;

            return {
              mint: mint,
              name: audioToken.name,
              symbol: audioToken.symbol,
              audioUri: audioToken.audioUri,
              authority: audioToken.authority.toString(),
              totalSupply: audioToken.totalSupply.toString(),
              createdAt: audioToken.createdAt.toNumber(),
              bondingCurveData: {
                solReserves: bondingCurve.solReserves.toString(),
                tokenReserves: bondingCurve.tokenReserves.toString(),
                tokensSold: bondingCurve.tokensSold.toString(),
                price: price,
              },
            };
          } catch (error) {
            console.error(`Error fetching bonding curve for ${mint}:`, error);
            return {
              mint: mint,
              name: audioToken.name,
              symbol: audioToken.symbol,
              audioUri: audioToken.audioUri,
              authority: audioToken.authority.toString(),
              totalSupply: audioToken.totalSupply.toString(),
              createdAt: audioToken.createdAt.toNumber(),
            };
          }
        })
      );

      setTokens(tokensWithData);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens
    .filter((token) => {
      if (searchQuery) {
        return (
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (filter === 'new') {
        return b.createdAt - a.createdAt;
      }
      if (filter === 'trending') {
        return (b.bondingCurveData?.price || 0) - (a.bondingCurveData?.price || 0);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🎵 Audio Tokens</h1>
          <p className="text-gray-400">Discover and trade audio meme tokens</p>
        </div>

        {/* Search & Filters Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center bg-gray-900 rounded-lg p-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 focus:outline-none"
          />

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('trending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'trending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'new'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ✨ New
            </button>
            <button
              onClick={fetchAllTokens}
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 font-medium"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Tokens</p>
            <p className="text-2xl font-bold">{tokens.length}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Showing</p>
            <p className="text-2xl font-bold text-purple-400">{filteredTokens.length}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Volume</p>
            <p className="text-2xl font-bold text-green-400">
              {(tokens.reduce((sum, t) => sum + parseFloat(t.bondingCurveData?.solReserves || '0'), 0) / 1e9).toFixed(2)} SOL
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-400">Loading tokens...</p>
          </div>
        )}

        {/* Tokens Table Header */}
        {!loading && filteredTokens.length > 0 && (
          <div className="bg-gray-900 rounded-t-lg">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm text-gray-400 font-semibold border-b border-gray-800">
              <div className="col-span-3">Token</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">24h %</div>
              <div className="col-span-2 text-right">Market Cap</div>
              <div className="col-span-2 text-right">Volume</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
          </div>
        )}

        {/* Tokens List - DexScreener Style */}
        {!loading && (
          <div className="bg-gray-900 rounded-b-lg">
            {filteredTokens.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No tokens found</p>
                <p className="text-gray-500 text-sm mt-2">Try a different search or filter</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredTokens.map((token) => (
                  <TokenRow key={token.mint} token={token} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// DexScreener-style Token Row Component
function TokenRow({ token }: { token: AudioTokenData }) {
  const [playing, setPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);

  useEffect(() => {
    if (token.bondingCurveData) {
      const sold = parseFloat(token.bondingCurveData.tokensSold) / 1e9;
      const totalSupply = parseFloat(token.bondingCurveData.tokenReserves) / 1e9 + sold;
      const sellRatio = sold / totalSupply;
      const priceChange = (sellRatio * 100).toFixed(1);
      setPriceChange24h(parseFloat(priceChange));
    }
  }, [token]);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioElement) {
      const audio = new Audio(token.audioUri);
      audio.onended = () => setPlaying(false);
      setAudioElement(audio);
      audio.play();
      setPlaying(true);
    } else {
      if (playing) {
        audioElement.pause();
        setPlaying(false);
      } else {
        audioElement.play();
        setPlaying(true);
      }
    }
  };

  const getCurrentPrice = () => {
    if (!token.bondingCurveData) return 0;
    const solReserves = parseFloat(token.bondingCurveData.solReserves) / 1e9;
    const tokenReserves = parseFloat(token.bondingCurveData.tokenReserves) / 1e9;
    if (tokenReserves === 0) return 0;
    return solReserves / tokenReserves;
  };

  const price = getCurrentPrice();
  const marketCap = token.bondingCurveData
    ? parseFloat(token.bondingCurveData.solReserves) / 1e9
    : 0;
  const volume = marketCap * 0.3; // Simulated volume
  const priceInUSD = price * 200;

  return (
    <Link 
      href={`/token/${token.mint}`}
      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer group"
    >
      {/* Token Info */}
      <div className="col-span-3 flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors flex-shrink-0"
        >
          <span className="text-sm">{playing ? '⏸️' : '▶️'}</span>
        </button>
        <div className="min-w-0">
          <p className="font-bold text-white truncate group-hover:text-purple-400 transition-colors">
            {token.name}
          </p>
          <p className="text-sm text-gray-400 truncate">${token.symbol}</p>
        </div>
      </div>

      {/* Price */}
      <div className="col-span-2 flex flex-col items-end justify-center">
        <p className="font-semibold text-white">{price.toFixed(8)} SOL</p>
        <p className="text-xs text-gray-500">${priceInUSD.toFixed(6)}</p>
      </div>

      {/* 24h Change */}
      <div className="col-span-2 flex items-center justify-end">
        <div className={`px-3 py-1 rounded-lg font-semibold ${
          priceChange24h >= 0 
            ? 'bg-green-500/10 text-green-400' 
            : 'bg-red-500/10 text-red-400'
        }`}>
          {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
        </div>
      </div>

      {/* Market Cap */}
      <div className="col-span-2 flex flex-col items-end justify-center">
        <p className="font-semibold text-white">{marketCap.toFixed(2)} SOL</p>
        <p className="text-xs text-gray-500">${(marketCap * 200).toFixed(0)}</p>
      </div>

      {/* Volume */}
      <div className="col-span-2 flex flex-col items-end justify-center">
        <p className="font-semibold text-white">{volume.toFixed(2)} SOL</p>
        <p className="text-xs text-gray-500">${(volume * 200).toFixed(0)}</p>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end gap-2">
        <Link
          href={`/trade?mint=${token.mint}`}
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Trade
        </Link>
      </div>
    </Link>
  );
}