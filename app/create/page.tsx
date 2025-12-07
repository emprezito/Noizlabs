'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import idl from '../../lib/idl/audio_token_platform.json';

const PROGRAM_ID = new PublicKey('8m6HBVw1n2q6E3YWTkqTE5KyNLhALdfGY7vcXQGMG6Uz');
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YjdlYzEzNi02Y2M0LTQyMzEtOWI3ZS05NmFhMTQ5MWIzMzQiLCJlbWFpbCI6ImVtcGVyb3Jha3BvcmhpdW51QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NDA1ZTdmZTRhMjUxMDFmMzlmMCIsInNjb3BlZEtleVNlY3JldCI6IjBjMjE4YTY0MDJlZjFiYWUwMDY5Y2UyNDM4OTU1NGYyNWE5OWNkNTY5NDFhOTk4ZDNkNTVkYjMyNzNmZDEyZmIiLCJleHAiOjE3OTY1NDEzMDh9.ddj-5srqwBMle_GGMfbovoMabzLGlRJEjZSEZCDmklw'; // Get from https://app.pinata.cloud/developers/api-keys

type TokenCreationRoute = 'bonding-curve' | 'manual-lp';

export default function CreateTokenPage() {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Form state
  const [route, setRoute] = useState<TokenCreationRoute>('bonding-curve');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Manual LP options
  const [disableMinting, setDisableMinting] = useState(false);
  const [disableFreezing, setDisableFreezing] = useState(false);
  const [makeImmutable, setMakeImmutable] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState('');
  const [mintAddress, setMintAddress] = useState('');

  // Auto-load audio from discover page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('noizlabs_mint_audio');
      if (stored) {
        const data = JSON.parse(stored);
        setName(data.title);
        localStorage.removeItem('noizlabs_mint_audio');
      }
    }
  }, []);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Upload to Pinata (IPFS)
  const uploadToPinata = async (): Promise<string> => {
    if (!audioFile) throw new Error('No audio file selected');

    try {
      // 1. Upload audio file
      setUploadStatus('📤 Uploading audio to IPFS...');
      const audioFormData = new FormData();
      audioFormData.append('file', audioFile);

      const audioUpload = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: audioFormData,
      });

      if (!audioUpload.ok) {
        throw new Error('Failed to upload audio');
      }

      const audioData = await audioUpload.json();
      const audioUrl = `https://gateway.pinata.cloud/ipfs/${audioData.IpfsHash}`;
      console.log('✅ Audio uploaded:', audioUrl);

      // 2. Upload image if provided
      let imageUrl = '';
      if (imageFile) {
        setUploadStatus('📤 Uploading image to IPFS...');
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        const imageUpload = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: imageFormData,
        });

        if (!imageUpload.ok) {
          throw new Error('Failed to upload image');
        }

        const imageData = await imageUpload.json();
        imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;
        console.log('✅ Image uploaded:', imageUrl);
      }

      // 3. Create metadata JSON
      setUploadStatus('📤 Uploading metadata to IPFS...');
      const metadata = {
        name,
        symbol,
        description: description || `${name} - Audio token on Solana`,
        image: imageUrl || audioUrl,
        animation_url: audioUrl,
        external_url: `https://noizlabs.io/token/${symbol}`,
        attributes: [
          {
            trait_type: 'Category',
            value: 'Audio Token',
          },
          {
            trait_type: 'Creation Method',
            value: route === 'bonding-curve' ? 'Bonding Curve' : 'Manual LP',
          },
        ],
        properties: {
          files: [
            {
              uri: audioUrl,
              type: audioFile.type || 'audio/mpeg',
            },
          ],
          category: 'audio',
        },
      };

      // 4. Upload metadata JSON
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      });
      const metadataFormData = new FormData();
      metadataFormData.append('file', metadataBlob, 'metadata.json');

      const metadataUpload = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: metadataFormData,
      });

      if (!metadataUpload.ok) {
        throw new Error('Failed to upload metadata');
      }

      const metadataData = await metadataUpload.json();
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`;

      console.log('✅ Metadata uploaded:', metadataUrl);
      setUploadStatus('✅ Upload complete!');
      return metadataUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload to Pinata IPFS');
    }
  };

  // Calculate cost based on selections
  const calculateCost = () => {
    if (route === 'bonding-curve') {
      return 0.02; // SOL
    } else {
      let cost = 0.5; // Base cost for manual LP
      if (disableMinting) cost += 0.1;
      if (disableFreezing) cost += 0.1;
      if (makeImmutable) cost += 0.1;
      return cost;
    }
  };

  const mintWithBondingCurve = async (metadataUri: string) => {
    if (!wallet.publicKey) return;

    setUploadStatus('🔨 Creating token on Solana...');
    const provider = new AnchorProvider(
      connection, 
      wallet as any, 
      { 
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      }
    );
    const program = new Program(idl as any, provider);
    const mint = Keypair.generate();

    const [audioTokenPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('audio_token'), mint.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const [bondingCurvePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding_curve'), mint.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    const curveTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      bondingCurvePda,
      true
    );

    const totalSupply = new BN(1_000_000_000).mul(new BN(10).pow(new BN(9)));
    const initialPrice = new BN(1_000_000); // 0.001 SOL

    // Get fresh blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    
    console.log('Creating token with fresh blockhash...');
    
    const tx = await program.methods
      .createAudioTokenWithCurve(name, symbol, metadataUri, totalSupply, initialPrice)
      .accounts({
        audioToken: audioTokenPda,
        bondingCurve: bondingCurvePda,
        mint: mint.publicKey,
        curveTokenAccount: curveTokenAccount,
        metadataAccount: metadataPda,
        creator: wallet.publicKey,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc({
        skipPreflight: false,
        commitment: 'confirmed',
        maxRetries: 3,
      });

    // Wait for confirmation
    await connection.confirmTransaction({
      signature: tx,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed');

    return { tx, mint: mint.publicKey.toString() };
  };

  const mintWithManualLP = async () => {
    // This would call a different program function
    // For now, placeholder
    alert('Manual LP creation coming soon! This will mint tokens to your wallet and let you add liquidity on Raydium/Orca yourself.');
    throw new Error('Not implemented yet');
  };

  const handleMint = async () => {
    if (!wallet.publicKey) {
      alert('Please connect your wallet!');
      return;
    }

    if (!name || !symbol || !audioFile) {
      alert('Please fill all required fields!');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setUploadStatus('');

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        // 1. Upload to Pinata IPFS first
        const metadataUri = await uploadToPinata();

        // 2. Create token
        let result;
        if (route === 'bonding-curve') {
          result = await mintWithBondingCurve(metadataUri);
        } else {
          result = await mintWithManualLP();
        }

        setTxSignature(result.tx);
        setMintAddress(result.mint);
        setSuccess(true);
        setUploadStatus('✅ Token created successfully!');
        
        // Reset form
        setName('');
        setSymbol('');
        setDescription('');
        setAudioFile(null);
        setImageFile(null);
        
        // Success - break out of retry loop
        break;
      } catch (error: any) {
        console.error('Error:', error);
        
        // Check if it's a blockhash error
        if (error.message?.includes('Blockhash not found') && retries < maxRetries - 1) {
          retries++;
          setUploadStatus(`⚠️ Blockhash expired, retrying (${retries}/${maxRetries})...`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // Not a blockhash error or max retries reached
        setUploadStatus('❌ Error: ' + (error.message || error));
        alert(`Error: ${error.message || error}`);
        break;
      } finally {
        if (retries >= maxRetries - 1 || success) {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Create Your Audio Token
      </h1>

      {!wallet.connected ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Route Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Choose Creation Method</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bonding Curve Option */}
              <button
                onClick={() => setRoute('bonding-curve')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  route === 'bonding-curve'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">📈</div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    route === 'bonding-curve' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                  }`}>
                    {route === 'bonding-curve' && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Bonding Curve</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Automatic price discovery. Instant liquidity. Users trade on your platform.
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>No liquidity needed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Fair launch (no rug)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Earn platform fees</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xl font-bold text-purple-600">0.02 SOL</span>
                  <span className="text-sm text-gray-500 ml-2">($4)</span>
                </div>
              </button>

              {/* Manual LP Option */}
              <button
                onClick={() => setRoute('manual-lp')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  route === 'manual-lp'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">🔧</div>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    route === 'manual-lp' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {route === 'manual-lp' && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Manual Liquidity</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Full control. Add liquidity on Raydium/Orca yourself. More expensive.
                </p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Mint to your wallet</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Full control over LP</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">✅</span>
                    <span>Optional immutability</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xl font-bold text-blue-600">0.5 SOL+</span>
                  <span className="text-sm text-gray-500 ml-2">($100+)</span>
                </div>
              </button>
            </div>

            {/* Manual LP Options */}
            {route === 'manual-lp' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold mb-3 text-gray-800">Additional Options (+0.1 SOL each)</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disableMinting}
                      onChange={(e) => setDisableMinting(e.target.checked)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-700">
                      Disable Minting (+0.1 SOL) - No more tokens can be created
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disableFreezing}
                      onChange={(e) => setDisableFreezing(e.target.checked)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-700">
                      Disable Freezing (+0.1 SOL) - Tokens can't be frozen
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={makeImmutable}
                      onChange={(e) => setMakeImmutable(e.target.checked)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-700">
                      Make Immutable (+0.1 SOL) - Metadata can't be changed
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Token Details Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Token Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Bruh Sound Effect"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="BRUH"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="The legendary bruh moment sound that went viral..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {audioFile && <p className="text-sm text-green-600 mt-2">✅ {audioFile.name}</p>}
              </div>

              {audioFile && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <audio controls className="w-full">
                    <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
                  </audio>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {imageFile && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 mb-2">✅ {imageFile.name}</p>
                    <img 
                      src={URL.createObjectURL(imageFile)} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`p-4 rounded-lg ${
              uploadStatus.includes('❌') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {uploadStatus}
            </div>
          )}

          {/* Cost Summary */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">Total Cost:</span>
              <span className="text-3xl font-bold">{calculateCost()} SOL</span>
            </div>
            <p className="text-sm text-purple-100">
              ≈ ${(calculateCost() * 200).toFixed(2)} USD
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={handleMint}
            disabled={loading || !name || !symbol || !audioFile}
            className={`w-full py-4 px-6 rounded-xl font-bold text-xl shadow-lg transition-all ${
              loading || !name || !symbol || !audioFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105'
            }`}
          >
            {loading ? '⏳ Creating Token...' : '🚀 Create Token'}
          </button>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                ✅ Token Created Successfully!
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-green-700 font-semibold mb-1">Mint Address:</p>
                  <input
                    type="text"
                    value={mintAddress}
                    readOnly
                    onClick={(e) => {
                      e.currentTarget.select();
                      navigator.clipboard.writeText(mintAddress);
                      alert('Copied!');
                    }}
                    className="w-full px-3 py-2 bg-white border border-green-300 rounded text-green-900 font-mono text-xs cursor-pointer"
                  />
                </div>
                <p className="text-center font-bold text-green-800">
                  👉 Copy this and paste in &quot;Trade Token&quot; tab!
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  View on Solana Explorer
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}