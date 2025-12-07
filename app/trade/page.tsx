'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TradeToken from '@/components/TradeToken';

function TradeContent() {
  const searchParams = useSearchParams();
  const mint = searchParams.get('mint');

console.log('trade page - mint from URl:', mint);
  return <TradeToken initialMint={mint} />;
}

export default function TradePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 py-12">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <TradeContent />
        </Suspense>
      </div>
    </main>
  );
}