'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function CreateTokenPage() {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [audio, setAudio] = useState<File | null>(null);

  const handleLaunch = () => {
    if (!name || !ticker || !audio) {
      alert('Please fill in all fields.');
      return;
    }

    alert(`Token "${name}" ($${ticker}NOIZ) launched!`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">🎤 Launch Your Meme Token</h1>

      <Card className="bg-gray-900 p-6 space-y-4">
        <div>
          <label className="block mb-1 text-sm">Token Name</label>
          <Input
            placeholder="e.g. Laugh Token"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-black"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Ticker (only prefix, NOIZ will be added)</label>
          <Input
            placeholder="e.g. LAFF"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="text-black"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Upload Audio Clip</label>
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files?.[0] || null)}
            className="text-white"
          />
        </div>

        <Button
          className="bg-purple-600 text-white px-4 py-2 rounded-xl"
          onClick={handleLaunch}
        >
          Pay $20 in $NOIZ & Launch
        </Button>
      </Card>
    </main>
  );
}
