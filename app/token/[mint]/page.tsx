'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import Link from 'next/link';
import { useSolPrice, formatUSD, formatSOL } from '../../../hooks/useSolPrice';
import idl from '../../../lib/idl/audio_token_platform.json';

const PROGRAM_ID = new PublicKey('8m6HBVw1n2q6E3YWTkqTE5KyNLhALdfGY7vcXQGMG6Uz');

export default function TokenDetailPage({ params }: { params: { mint: string } }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { price: solPrice } = useSolPrice();
  
  const [tokenData, setTokenData] = useState<any>(null);
  const [bondingCurve, setBondingCurve] = useState<any>(null);
  const [holders, setHolders] = useState<any[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchTokenData();
  }, [params.mint]);

  const getProvider = () => {
    if (!wallet.publicKey) {
      return new AnchorProvider(connection, {} as any, { commitment: 'confirmed' });
    }
    return new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
  };

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      const provider = getProvider();
      const program = new Program(idl as any, provider);
      const mintPubkey = new PublicKey(params.mint);

      // Fetch audio token metadata
      const [audioTokenPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('audio_token'), mintPubkey.toBuffer()],
        program.programId
      );

      const audioToken = await program.account.audioToken.fetch(audioTokenPda);

      // Fetch bonding curve data
      const [bondingCurvePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding_curve'), mintPubkey.toBuffer()],
        program.programId
      );

      const curve = await program.account.bondingCurve.fetch(bondingCurvePda);

      setTokenData({
        mint: params.mint,
        name: audioToken.name,
        symbol: audioToken.symbol,
        audioUri: audioToken.audioUri,
        authority: audioToken.authority.toString(),
        totalSupply: audioToken.totalSupply.toString(),
        createdAt: audioToken.createdAt.toNumber(),
      });

      setBondingCurve({
        solReserves: curve.solReserves.toNumber(),
        tokenReserves: curve.tokenReserves.toNumber(),
        tokensSold: curve.tokensSold.toNumber(),
        initialPrice: curve.initialPrice.toNumber(),
      });

      // Fetch holders (top 10)
      await fetchHolders(mintPubkey);

      // Fetch recent transactions
      await fetchRecentTransactions(mintPubkey);

    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolders = async (mint: PublicKey) => {
    try {
      const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
        filters: [
          { dataSize: 165 },
          { memcmp: { offset: 0, bytes: mint.toBase58() } },
        ],
      });

      const holderData = accounts
        .map((account) => {
          const data = account.account.data;
          const amount = data.readBigUInt64LE(64);
          return {
            address: account.pubkey.toString(),
            balance: Number(amount),
          };
        })
        .filter((holder) => holder.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);

      setHolders(holderData);
    } catch (error) {
      console.error('Error fetching holders:', error);
    }
  };

  const fetchRecentTransactions = async (mint: PublicKey) => {
    try {
      const signatures = await connection.getSignaturesForAddress(mint, { limit: 10 });
      
      const txs = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          
          return {
            signature: sig.signature,
            timestamp: sig.blockTime,
            type: 'Trade', // You can parse logs to determine buy/sell
          };
        })
      );

      setRecentTxs(txs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const togglePlay = () => {
    if (!audioElement && tokenData) {
      const audio = new Audio(tokenData.audioUri);
      audio.onended = () => setPlaying(false);
      setAudioElement(audio);
      audio.play();
      setPlaying(true);
    } else {
      if (playing) {
        audioElement?.pause();
        setPlaying(false);
      } else {
        audioElement?.play();
        setPlaying(true);
      }
    }
  };

  const calculatePrice = () => {
    if (!bondingCurve) return 0;
    const { solReserves, tokenReserves } = bondingCurve;
    if (tokenReserves === 0) return 0;
    return (solReserves / 1e9) / (tokenReserves / 1e9);
  };

  const calculateMarketCap = () => {
    const price = calculatePrice();
    if (!bondingCurve) return 0;
    return price * (bondingCurve.tokensSold / 1e9);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading token data...</p>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-600 text-lg">Token not found</p>
          <Link href="/tokens" className="mt-4 inline-block text-purple-600 hover:underline">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const price = calculatePrice();
  const marketCap = calculateMarketCap();
  const priceUSD = price * solPrice;
  const marketCapUSD = marketCap * solPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/tokens"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2">{tokenData.name}</h1>
                    <p className="text-xl text-purple-100 font-semibold">${tokenData.symbol}</p>
                    <div className="mt-4 flex items-center space-x-2">
                      <span className="text-sm text-purple-100">CA:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tokenData.mint);
                          alert('Copied!');
                        }}
                        className="text-sm text-white hover:text-purple-100 font-mono bg-white/20 px-3 py-1 rounded"
                      >
                        {tokenData.mint.slice(0, 4)}...{tokenData.mint.slice(-4)} 📋
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all shadow-lg"
                  >
                    <span className="text-4xl">{playing ? '⏸️' : '▶️'}</span>
                  </button>
                </div>
              </div>

              {/* Price Stats */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price (SOL)</p>
                  <p className="text-xl font-bold text-gray-900">{price.toFixed(8)}</p>
                  <p className="text-sm text-gray-500">{formatUSD(priceUSD)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Market Cap</p>
                  <p className="text-xl font-bold text-gray-900">{formatSOL(bondingCurve?.solReserves || 0)} SOL</p>
                  <p className="text-sm text-gray-500">{formatUSD(marketCapUSD)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tokens Sold</p>
                  <p className="text-xl font-bold text-gray-900">
                    {((bondingCurve?.tokensSold || 0) / 1e9).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available</p>
                  <p className="text-xl font-bold text-gray-900">
                    {((bondingCurve?.tokenReserves || 0) / 1e9).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Bonding Curve Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Bonding Curve Progress</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress to Graduation</span>
                  <span>
                    {bondingCurve
                      ? ((bondingCurve.tokensSold / (bondingCurve.tokensSold + bondingCurve.tokenReserves)) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all"
                    style={{
                      width: `${bondingCurve ? (bondingCurve.tokensSold / (bondingCurve.tokensSold + bondingCurve.tokenReserves)) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  When bonding curve completes, liquidity will migrate to Raydium
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              <div className="space-y-2">
                {recentTxs.length > 0 ? (
                  recentTxs.map((tx) => (
                    <div key={tx.signature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-green-600 font-semibold">{tx.type}</span>
                        <a
                          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-gray-700 font-mono"
                        >
                          {tx.signature.slice(0, 8)}...
                        </a>
                      </div>
                      <span className="text-xs text-gray-500">
                        {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Trade & Holders */}
          <div className="space-y-6">
            {/* Trade Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Trade</h2>
              <Link
                href={`/trade?mint=${tokenData.mint}`}
                className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Open Trading Interface
              </Link>
            </div>

            {/* Top Holders */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Top Holders</h2>
              <div className="space-y-2">
                {holders.length > 0 ? (
                  holders.map((holder, index) => (
                    <div key={holder.address} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-mono text-gray-700">
                          {holder.address.slice(0, 4)}...{holder.address.slice(-4)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {(holder.balance / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No holders yet</p>
                )}
              </div>
            </div>

            {/* Token Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Token Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Creator</span>
                  <span className="font-mono text-gray-900">
                    {tokenData.authority.slice(0, 4)}...{tokenData.authority.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(tokenData.createdAt * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Supply</span>
                  <span className="text-gray-900">
                    {(parseInt(tokenData.totalSupply) / 1e9).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
