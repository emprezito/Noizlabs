'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { NFTStorage, File as NFTFile } from 'nft.storage';
import idl from '../lib/idl/audio_token_platform.json';

const PROGRAM_ID = new PublicKey('8m6HBVw1n2q6E3YWTkqTE5KyNLhALdfGY7vcXQGMG6Uz');
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const NFT_STORAGE_KEY = 'df8dcf09.0621773fa0ed4d3ea40ecf8abd5f39f9'; // Replace with your actual API key

export default function MintAudioToken() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState('');
  const [mintAddress, setMintAddress] = useState('');

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

  const uploadToNFTStorage = async (): Promise<string> => {
    if (!audioFile) throw new Error('No audio file selected');

    const client = new NFTStorage({ token: NFT_STORAGE_KEY });

    try {
      // 1. Upload audio file
      setUploadStatus('📤 Uploading audio to IPFS...');
      const audioBuffer = await audioFile.arrayBuffer();
      const audioNFTFile = new NFTFile([audioBuffer], audioFile.name, {
        type: audioFile.type,
      });
      const audioCid = await client.storeBlob(audioNFTFile);
      const audioUrl = `https://nftstorage.link/ipfs/${audioCid}`;
      console.log('✅ Audio uploaded:', audioUrl);

      // 2. Upload image if provided
      let imageUrl = '';
      if (imageFile) {
        setUploadStatus('📤 Uploading image to IPFS...');
        const imageBuffer = await imageFile.arrayBuffer();
        const imageNFTFile = new NFTFile([imageBuffer], imageFile.name, {
          type: imageFile.type,
        });
        const imageCid = await client.storeBlob(imageNFTFile);
        imageUrl = `https://nftstorage.link/ipfs/${imageCid}`;
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
            trait_type: 'Creator',
            value: 'NoizLabs',
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
      const metadataNFTFile = new NFTFile([metadataBlob], 'metadata.json', {
        type: 'application/json',
      });
      const metadataCid = await client.storeBlob(metadataNFTFile);
      const metadataUrl = `https://nftstorage.link/ipfs/${metadataCid}`;

      console.log('✅ Metadata uploaded:', metadataUrl);
      setUploadStatus('✅ Upload complete!');
      return metadataUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload to NFT.Storage');
    }
  };

  const mintToken = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert('Please connect your wallet!');
      return;
    }

    if (!name || !symbol || !audioFile) {
      alert('Please fill all required fields and upload audio!');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setUploadStatus('');

    try {
      // 1. Upload to NFT.Storage first
      const metadataUri = await uploadToNFTStorage();

      // 2. Setup Anchor provider and program
      setUploadStatus('🔨 Creating token on Solana...');
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new Program(idl as any, provider);
      const mint = Keypair.generate();

      // 3. Derive PDAs
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
      const initialPrice = new BN(1_000_000);

      console.log('Creating audio token with bonding curve...');

      // 4. Create token with metadata
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
        .rpc();

      console.log('✅ Token created!', tx);
      console.log('Metadata URI:', metadataUri);

      setTxSignature(tx);
      setMintAddress(mint.publicKey.toString());
      setSuccess(true);
      setUploadStatus('✅ Token created successfully!');
      
      // Reset form
      setName('');
      setSymbol('');
      setDescription('');
      setAudioFile(null);
      setImageFile(null);
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('❌ Error: ' + (error as Error).message);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-600">
        🎵 Mint Audio Token
      </h2>

      {!wallet.connected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Connect your wallet to get started!</p>
        </div>
      ) : (
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
              placeholder="The legendary bruh moment sound..."
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
            {audioFile && (
              <p className="text-sm text-green-600 mt-2">✅ {audioFile.name}</p>
            )}
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
              <p className="text-sm text-green-600 mt-2">✅ {imageFile.name}</p>
            )}
          </div>

          {uploadStatus && (
            <div className={`p-4 rounded-lg ${
              uploadStatus.includes('❌') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {uploadStatus}
            </div>
          )}

          <button
            onClick={mintToken}
            disabled={loading || !name || !symbol || !audioFile}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              loading || !name || !symbol || !audioFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? '⏳ Minting...' : '🚀 Mint Audio Token'}
          </button>

          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Token Minted Successfully!
              </h3>

              <div className="space-y-2 text-sm text-green-700">
                <p><strong>Mint Address:</strong></p>
                <input
                  type="text"
                  value={mintAddress}
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-green-300 rounded text-green-900 font-mono text-xs"
                  onClick={(e) => {
                    e.currentTarget.select();
                    navigator.clipboard.writeText(mintAddress);
                    alert('Copied!');
                  }}
                />

                <p className="text-center font-bold mt-4">
                  👉 Copy this and paste in &quot;Trade Token&quot; tab!
                </p>
                <p>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-900"
                  >
                    View on Solana Explorer
                  </a>
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Note:</strong> Files will be uploaded to IPFS via NFT.Storage. Creates 1B tokens with bonding curve. Costs ~0.02 SOL.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}