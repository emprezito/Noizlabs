'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const featuredTokens = [
  {
    name: 'LAFF',
    symbol: 'LAFFNOIZ',
    audio: '/sounds/laff.mp3',
    creator: '0x98c...B01',
    marketCap: '$340K',
    link: '/launch/laff',
  },
  {
    name: 'SCREAM',
    symbol: 'SCREAMNOIZ',
    audio: '/sounds/scream.mp3',
    creator: '0x2bA...9dF',
    marketCap: '$120K',
    link: '/launch/scream',
  },
];

export default function LaunchpadPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">🚀 Meme Token Launchpad</h1>

      <Button className="bg-purple-600 text-white px-4 py-2 rounded-xl">
        Launch a Token
      </Button>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {featuredTokens.map((token) => (
          <Card key={token.symbol} className="bg-gray-900 p-4 space-y-2">
            <h2 className="text-xl font-semibold">{token.name} <span className="text-gray-400">({token.symbol})</span></h2>
            <audio controls src={token.audio} className="w-full" />
            <p>Created by: <span className="text-purple-400">{token.creator}</span></p>
            <p>Market Cap: <span className="text-green-400">{token.marketCap}</span></p>
            <a
              href={token.link}
              className="inline-block mt-2 text-sm text-blue-400 underline"
            >
              View Token
            </a>
          </Card>
        ))}
      </section>
    </main>
  );
}
