'use client';

import { Card } from '@/components/ui/card';

const leaderboardData = [
  { rank: 1, name: '0x9fA3...Dd12', points: 24800, noiz: 1220 },
  { rank: 2, name: '0x2bC1...Af91', points: 19800, noiz: 940 },
  { rank: 3, name: '0x1Ac8...Bf32', points: 16700, noiz: 740 },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">🏆 Leaderboard</h1>

      <Card className="bg-gray-900 p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-3">Rank</th>
              <th className="py-2 px-3">Wallet</th>
              <th className="py-2 px-3">Points</th>
              <th className="py-2 px-3">$NOIZ Earned</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user) => (
              <tr key={user.rank} className="border-b border-gray-800">
                <td className="py-2 px-3">{user.rank}</td>
                <td className="py-2 px-3 text-purple-400">{user.name}</td>
                <td className="py-2 px-3">{user.points}</td>
                <td className="py-2 px-3">{user.noiz}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
