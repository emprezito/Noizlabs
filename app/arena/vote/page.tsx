'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const memeEntries = [
  {
    id: 1,
    title: 'Loud Laugh',
    audio: '/sounds/laugh.mp3',
    wallet: '0xA3f...9123',
    votes: 12,
  },
  {
    id: 2,
    title: 'Weird Screech',
    audio: '/sounds/screech.mp3',
    wallet: '0xB9c...3F44',
    votes: 8,
  },
];

export default function MemeVotePage() {
  const [votedId, setVotedId] = useState<number | null>(null);

  const handleVote = (id: number) => {
    setVotedId(id);
    alert(`Voted for Meme ID: ${id}`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">🗳️ Vote in Meme Battle</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memeEntries.map((meme) => (
          <Card key={meme.id} className="bg-gray-900 p-4 space-y-2">
            <h2 className="text-xl font-semibold">{meme.title}</h2>
            <audio controls src={meme.audio} className="w-full" />
            <p className="text-sm text-purple-400">By: {meme.wallet}</p>
            <p className="text-green-400 text-sm">Votes: {meme.votes + (votedId === meme.id ? 1 : 0)}</p>

            <Button
              disabled={!!votedId}
              className="bg-blue-600 text-white mt-2"
              onClick={() => handleVote(meme.id)}
            >
              {votedId === meme.id ? '✅ Voted' : 'Vote'}
            </Button>
          </Card>
        ))}
      </section>
    </main>
  );
}
