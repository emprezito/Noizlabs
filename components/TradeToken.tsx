'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import idl from '../lib/idl/audio_token_platform.json';

const PROGRAM_ID = new PublicKey('8m6HBVw1n2q6E3YWTkqTE5KyNLhALdfGY7vcXQGMG6Uz');

interface TradeTokenProps {
  mintAddress?: string;
}

interface TokenSearchResult {
  mint: string;
  name: string;
  symbol: string;
}

// app/components/trade/TradeToken.tsx

interface TradeTokenProps {
  initialMint?: string | null;
}


export default function TradeToken({ mintAddress: propMintAddress }: TradeTokenProps) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [mintInput, setMintInput] = useState(propMintAddress || '');
  const [activeMint, setActiveMint] = useState(propMintAddress || '');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [bondingCurveInfo, setBondingCurveInfo] = useState<any>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<string>('0');
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  // Update when prop changes (from token gallery)
  // Update this useEffect at the top of your component
useEffect(() => {
  console.log('TradeToken received initialMint:', initialMint); // Debug log
  if (initialMint) {
    setMintInput(initialMint);
    setActiveMint(initialMint);
    setShowSearch(false);
  }
}, [initialMint]);

  // Search tokens by name/symbol
  const searchTokens = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new Program(idl as any, provider);

      const allTokens = await program.account.audioToken.all();
      
      const filtered = allTokens
        .filter((token) => {
          const name = token.account.name.toLowerCase();
          const symbol = token.account.symbol.toLowerCase();
          const searchLower = query.toLowerCase();
          return name.includes(searchLower) || symbol.includes(searchLower);
        })
        .map((token) => ({
          mint: token.account.mint.toString(),
          name: token.account.name,
          symbol: token.account.symbol,
        }))
        .slice(0, 5); // Show max 5 results

      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setMintInput(value);
    
    // Check if it's a valid mint address (44 chars, base58)
    if (value.length === 43 || value.length === 44) {
      try {
        new PublicKey(value);
        // Valid mint address
        setShowSearch(false);
      } catch {
        // Invalid, show search
        setShowSearch(true);
        searchTokens(value);
      }
    } else {
      // Too short, show search
      setShowSearch(true);
      searchTokens(value);
    }
  };

  // Select token from search
  const selectToken = (mint: string) => {
    setMintInput(mint);
    setActiveMint(mint);
    setShowSearch(false);
    setSearchResults([]);
  };

  // Load token when mint address is set

  useEffect(() => {
  console.log('Attempting to load token, activeMint:', activeMint, 'wallet connected:', !!wallet.publicKey);
  if (activeMint && wallet.publicKey) {
    loadToken();
  }
}, [activeMint, wallet.publicKey]);

  const loadToken = async () => {
    if (!mintInput) return;

    try {
      setActiveMint(mintInput);
      const mintPubkey = new PublicKey(mintInput);
      
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new Program(idl as any, provider);

      // Get token info
      const [audioTokenPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('audio_token'), mintPubkey.toBuffer()],
        PROGRAM_ID
      );

      const tokenData = await program.account.audioToken.fetch(audioTokenPda);
      setTokenInfo(tokenData);

      // Get bonding curve
      const [bondingCurvePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding_curve'), mintPubkey.toBuffer()],
        PROGRAM_ID
      );

      const curve = await program.account.bondingCurve.fetch(bondingCurvePda);
      
      setBondingCurveInfo({
        solReserves: curve.solReserves.toString(),
        tokenReserves: curve.tokenReserves.toString(),
        tokensSold: curve.tokensSold.toString(),
        initialPrice: curve.initialPrice.toString(),
      });

      // Get user balance
      if (wallet.publicKey) {
        try {
          const userTokenAccount = await getAssociatedTokenAddress(mintPubkey, wallet.publicKey);
          const balance = await connection.getTokenAccountBalance(userTokenAccount);
          setUserBalance(balance.value.uiAmount?.toString() || '0');
        } catch {
          setUserBalance('0');
        }
      }
    } catch (error) {
      console.error('Error loading token:', error);
      alert('Token not found or invalid mint address');
      setBondingCurveInfo(null);
      setTokenInfo(null);
    }
  };

  // Auto-load when activeMint changes
  useEffect(() => {
    if (activeMint && wallet.publicKey) {
      loadToken();
    }
  }, [activeMint, wallet.publicKey]);

  // Buy tokens
  const handleBuy = async () => {
    if (!wallet.publicKey || !activeMint || !buyAmount) {
      alert('Please connect wallet and fill all fields!');
      return;
    }

    setLoading(true);

    try {
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new Program(idl as any, provider);
      const mintPubkey = new PublicKey(activeMint);

      const [bondingCurvePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding_curve'), mintPubkey.toBuffer()],
        PROGRAM_ID
      );

      const curveTokenAccount = await getAssociatedTokenAddress(mintPubkey, bondingCurvePda, true);
      const buyerTokenAccount = await getAssociatedTokenAddress(mintPubkey, wallet.publicKey);

      const amount = new BN(parseFloat(buyAmount) * 1_000_000_000);

      const tx = await program.methods
        .buyTokens(amount)
        .accounts({
          bondingCurve: bondingCurvePda,
          mint: mintPubkey,
          curveTokenAccount: curveTokenAccount,
          buyerTokenAccount: buyerTokenAccount,
          buyer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      alert(`Successfully bought ${buyAmount} tokens!`);
      await loadToken();
      setBuyAmount('');
    } catch (error: any) {
      console.error('Buy error:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Sell tokens
  const handleSell = async () => {
    if (!wallet.publicKey || !activeMint || !sellAmount) {
      alert('Please connect wallet and fill all fields!');
      return;
    }

    setLoading(true);

    try {
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new Program(idl as any, provider);
      const mintPubkey = new PublicKey(activeMint);

      const [bondingCurvePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding_curve'), mintPubkey.toBuffer()],
        PROGRAM_ID
      );

      const curveTokenAccount = await getAssociatedTokenAddress(mintPubkey, bondingCurvePda, true);
      const sellerTokenAccount = await getAssociatedTokenAddress(mintPubkey, wallet.publicKey);

      const amount = new BN(parseFloat(sellAmount) * 1_000_000_000);

      const tx = await program.methods
        .sellTokens(amount)
        .accounts({
          bondingCurve: bondingCurvePda,
          mint: mintPubkey,
          curveTokenAccount: curveTokenAccount,
          sellerTokenAccount: sellerTokenAccount,
          seller: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert(`Successfully sold ${sellAmount} tokens!`);
      await loadToken();
      setSellAmount('');
    } catch (error: any) {
      console.error('Sell error:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
        💱 Trade Tokens
      </h2>

      {!wallet.connected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Connect your wallet to trade!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search/Input Section */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by name or paste mint address
            </label>
            <input
              type="text"
              placeholder="Enter token name (e.g., 'Dank') or mint address"
              value={mintInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            
            {/* Search Results Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.mint}
                    onClick={() => selectToken(result.mint)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="font-semibold text-gray-900">{result.name}</p>
                    <p className="text-sm text-gray-600">${result.symbol}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{result.mint}</p>
                  </button>
                ))}
              </div>
            )}

            {mintInput && mintInput !== activeMint && (
              <button
                onClick={loadToken}
                className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                🔍 Load Token
              </button>
            )}
          </div>

          {/* Token Info */}
          {tokenInfo && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-xl font-bold text-purple-900">{tokenInfo.name}</h3>
              <p className="text-purple-700 font-mono">${tokenInfo.symbol}</p>
              <p className="text-xs text-purple-600 mt-2 break-all">{activeMint}</p>
            </div>
          )}

          {/* Bonding Curve Info */}
          {bondingCurveInfo && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Bonding Curve Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                <div>
                  <p className="text-xs text-blue-600">SOL Reserves</p>
                  <p className="font-bold">{(parseInt(bondingCurveInfo.solReserves) / 1e9).toFixed(4)} SOL</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Tokens Available</p>
                  <p className="font-bold">{(parseInt(bondingCurveInfo.tokenReserves) / 1e9).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Tokens Sold</p>
                  <p className="font-bold">{(parseInt(bondingCurveInfo.tokensSold) / 1e9).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Your Balance</p>
                  <p className="font-bold text-green-600">{userBalance}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trading Interface */}
          {bondingCurveInfo && (
            <>
              {/* Buy Section */}
              <div className="border-2 border-green-300 p-4 rounded-lg bg-green-50">
                <h3 className="text-xl font-semibold text-green-800 mb-3">💰 Buy Tokens</h3>
                <input
                  type="number"
                  placeholder="Amount (e.g., 100)"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 mb-3"
                />
                <button
                  onClick={handleBuy}
                  disabled={loading || !buyAmount}
                  className={`w-full py-3 rounded-lg font-semibold text-white ${
                    loading || !buyAmount ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? '⏳ Processing...' : '🚀 Buy Tokens'}
                </button>
              </div>

              {/* Sell Section */}
              <div className="border-2 border-red-300 p-4 rounded-lg bg-red-50">
                <h3 className="text-xl font-semibold text-red-800 mb-3">💸 Sell Tokens</h3>
                <input
                  type="number"
                  placeholder="Amount (e.g., 50)"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 mb-3"
                />
                <button
                  onClick={handleSell}
                  disabled={loading || !sellAmount}
                  className={`w-full py-3 rounded-lg font-semibold text-white ${
                    loading || !sellAmount ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? '⏳ Processing...' : '📉 Sell Tokens'}
                </button>
                <p className="text-xs text-red-700 mt-2">2% fee on sells</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}