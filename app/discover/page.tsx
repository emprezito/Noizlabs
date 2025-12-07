'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AudioClip {
  id: string;
  title: string;
  creator: string;
  audioUrl: string;
  category: string;
  likes: number;
  shares: number;
  plays: number;
  createdAt: number;
  hasLiked?: boolean;
}

const CATEGORIES = ['All', 'Memes', 'Music', 'Voice', 'Sound Effects', 'AI Generated', 'Other'];

export default function DiscoverPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const router = useRouter();

  const [clips, setClips] = useState<AudioClip[]>([]);
  const [filteredClips, setFilteredClips] = useState<AudioClip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingClip, setPlayingClip] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Memes');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    loadClips();
  }, []);

  useEffect(() => {
    filterClips();
  }, [selectedCategory, clips]);

  const loadClips = () => {
    // Load from localStorage (in production, this would be from your backend/blockchain)
    const stored = localStorage.getItem('noizlabs_clips');
    if (stored) {
      const parsed = JSON.parse(stored);
      setClips(parsed);
    } else {
      // Demo clips
      const demoClips: AudioClip[] = [
        {
          id: '1',
          title: 'Bruh Sound Effect #2',
          creator: wallet.publicKey?.toString().slice(0, 8) || 'Anonymous',
          audioUrl: '',
          category: 'Memes',
          likes: 42,
          shares: 15,
          plays: 230,
          createdAt: Date.now() - 86400000,
        },
      ];
      setClips(demoClips);
    }
  };

  const filterClips = () => {
    if (selectedCategory === 'All') {
      setFilteredClips(clips);
    } else {
      setFilteredClips(clips.filter(clip => clip.category === selectedCategory));
    }
  };

  const handleUpload = async () => {
    if (!wallet.publicKey || !uploadFile || !uploadTitle) {
      alert('Please connect wallet and fill all fields!');
      return;
    }

    setLoading(true);

    try {
      // In production, upload to IPFS here
      const audioUrl = URL.createObjectURL(uploadFile);

      const newClip: AudioClip = {
        id: Date.now().toString(),
        title: uploadTitle,
        creator: wallet.publicKey.toString(),
        audioUrl: audioUrl,
        category: uploadCategory,
        likes: 0,
        shares: 0,
        plays: 0,
        createdAt: Date.now(),
      };

      const updatedClips = [newClip, ...clips];
      setClips(updatedClips);
      localStorage.setItem('noizlabs_clips', JSON.stringify(updatedClips));

      alert('Audio clip uploaded successfully!');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading clip');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (clipId: string) => {
    setClips(clips.map(clip => {
      if (clip.id === clipId) {
        return {
          ...clip,
          likes: clip.hasLiked ? clip.likes - 1 : clip.likes + 1,
          hasLiked: !clip.hasLiked,
        };
      }
      return clip;
    }));
  };

  const handleShare = (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (clip) {
      navigator.clipboard.writeText(`${window.location.origin}/discover?clip=${clipId}`);
      alert('Link copied to clipboard!');
      
      setClips(clips.map(c => c.id === clipId ? { ...c, shares: c.shares + 1 } : c));
    }
  };

  const handlePlay = (clipId: string) => {
    setPlayingClip(clipId);
    setClips(clips.map(c => c.id === clipId ? { ...c, plays: c.plays + 1 } : c));
  };

  const handleMintClick = (clip: AudioClip) => {
    // Store clip data for minting page
    localStorage.setItem('noizlabs_mint_audio', JSON.stringify({
      title: clip.title,
      audioUrl: clip.audioUrl,
      category: clip.category,
    }));
    router.push('/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/" className="text-purple-600 hover:text-purple-700 text-sm mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-purple-600">
              🎧 Discover Audio Clips
            </h1>
            <p className="text-gray-600 mt-2">Upload, listen, and mint audio as tokens</p>
          </div>
          
          {wallet.connected && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              ➕ Upload Audio
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Feed */}
      <div className="container mx-auto px-4 pb-12">
        {!wallet.connected ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-lg">
            <p className="text-gray-600 text-xl mb-4">Connect your wallet to discover audio!</p>
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-lg">
            <p className="text-gray-600 text-xl mb-4">No audio clips yet in this category!</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Upload First Clip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip) => (
              <div key={clip.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                  <h3 className="font-bold text-lg mb-1">{clip.title}</h3>
                  <p className="text-sm text-purple-100">
                    by {clip.creator.slice(0, 4)}...{clip.creator.slice(-4)}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                    {clip.category}
                  </span>
                </div>

                {/* Audio Player */}
                <div className="p-4 bg-gray-50">
                  {playingClip === clip.id && clip.audioUrl ? (
                    <audio
                      controls
                      autoPlay
                      className="w-full"
                      onEnded={() => setPlayingClip(null)}
                      src={clip.audioUrl}
                    />
                  ) : (
                    <button
                      onClick={() => handlePlay(clip.id)}
                      disabled={!clip.audioUrl}
                      className={`w-full py-3 rounded-lg font-semibold text-white ${
                        clip.audioUrl
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      ▶️ Play Audio
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex justify-around text-sm text-gray-600">
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{clip.plays}</p>
                      <p className="text-xs">Plays</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{clip.likes}</p>
                      <p className="text-xs">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{clip.shares}</p>
                      <p className="text-xs">Shares</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLike(clip.id)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                        clip.hasLiked
                          ? 'bg-red-100 text-red-600 border-2 border-red-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {clip.hasLiked ? '❤️' : '🤍'} Like
                    </button>
                    <button
                      onClick={() => handleShare(clip.id)}
                      className="flex-1 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      🔗 Share
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleMintClick(clip)}
                    className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  >
                    🪙 Mint as Token
                  </button>
                </div>

                {/* Timestamp */}
                <div className="px-4 pb-3 text-xs text-gray-500">
                  {new Date(clip.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Upload Audio Clip</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="My Awesome Audio"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {uploadFile && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <audio controls className="w-full">
                    <source src={URL.createObjectURL(uploadFile)} type={uploadFile.type} />
                  </audio>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={loading || !uploadTitle || !uploadFile}
                className={`w-full py-3 rounded-lg font-semibold text-white ${
                  loading || !uploadTitle || !uploadFile
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                {loading ? '⏳ Uploading...' : '📤 Upload Clip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
