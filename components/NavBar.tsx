'use client';

import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center shadow-md border-b border-purple-600">
      <div className="text-2xl font-bold text-purple-400">🎧 NoizLabs</div>
      
      <div className="space-x-4 text-sm md:text-base font-medium">
        <Link href="/" className="hover:text-purple-400 transition">Home</Link>
        <Link href="/arena" className="hover:text-purple-400 transition">Arena</Link>
        <Link href="/launch" className="hover:text-purple-400 transition">Launch</Link>
        <Link href="/stake" className="hover:text-purple-400 transition">Stake</Link>
        <Link href="/leaderboard" className="hover:text-purple-400 transition">Leaderboard</Link>
        <Link href="/profile/0xUser" className="hover:text-purple-400 transition">Profile</Link>
      </div>
    </nav>
  );
}
