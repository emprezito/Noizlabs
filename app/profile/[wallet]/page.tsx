'use client';

import { useParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserProfilePage() {
  const { wallet } = useParams();

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">👤 User Profile</h1>

      {/* Wallet Info */}
      <Card className="bg-gray-900 p-4 rounded-xl space-y-2">
        <p className="text-gray-400 text-sm">Wallet Address:</p>
        <p className="text-purple-400 font-mono text-sm break-all">{wallet}</p>
      </Card>

      {/* Stats Overview */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Points Earned', value: '12,480' },
          { label: 'Memes Uploaded', value: '38' },
          { label: 'Battles Created', value: '5' },
          { label: 'NFT Badges', value: '3' },
          { label: '$NOIZ Earned', value: '2,940' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 bg-gray-900 text-center">
            <p className="text-xl font-bold text-purple-400">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </Card>
        ))}
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">Claim $NOIZ</Button>
        <Button variant="outline" className="w-full sm:w-auto">View NFT Badges</Button>
      </div>

      {/* Optional: Launched Tokens */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Launched Tokens</h2>
        <Card className="p-4 bg-gray-900 text-white">
          <p className="text-sm text-gray-400">No tokens launched yet.</p>
        </Card>
      </div>
    </div>
  );
}
