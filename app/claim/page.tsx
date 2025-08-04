'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ClaimPage() {
  const [claimed, setClaimed] = useState(false);
  const earnedNoiz = 425.33;

  const handleClaim = () => {
    // Logic for claiming (connect wallet + tx)
    setClaimed(true);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎁 Claim Your Rewards</h1>

      <Card className="bg-gray-900 p-6 text-center space-y-4">
        <p className="text-lg">Available $NOIZ: <span className="text-green-400 font-mono">{earnedNoiz.toFixed(2)}</span></p>
        
        {!claimed ? (
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl"
            onClick={handleClaim}
          >
            Claim Now
          </Button>
        ) : (
          <p className="text-green-500">✅ Claimed! Check your wallet.</p>
        )}
      </Card>
    </main>
  );
}
