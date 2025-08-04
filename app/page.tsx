// app/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">🔊 Welcome to Noizlabs</h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Create & battle viral audio memes. Stake, earn, and launch your own meme tokens.
        </p>
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700">Enter Meme Arena</Button>
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">⚡ How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Upload Meme", desc: "Record or upload an audio clip for the battle." },
            { step: "2", title: "Vote to Win", desc: "Listen and vote on the funniest meme." },
            { step: "3", title: "Earn $NOIZ", desc: "Win battles and farm points to claim $NOIZ." }
          ].map((item) => (
            <Card key={item.step} className="p-4 bg-gray-900 text-white rounded-2xl">
              <h3 className="text-xl font-bold mb-1">Step {item.step}</h3>
              <p className="text-lg">{item.title}</p>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">📊 Platform Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-400">$15M</p>
            <p className="text-sm text-gray-400">Market Cap</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">$1.5M</p>
            <p className="text-sm text-gray-400">Liquidity</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">18,240</p>
            <p className="text-sm text-gray-400">Audio Tokens</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">19.2M</p>
            <p className="text-sm text-gray-400">$NOIZ Burned</p>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Launch Token", action: "/launch" },
          { label: "Stake $NOIZ", action: "/stake" },
          { label: "Join Battle", action: "/arena" }
        ].map((cta) => (
          <a href={cta.action} key={cta.label}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6">
              {cta.label}
            </Button>
          </a>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-gray-800 pt-4 text-center text-sm text-gray-500">
        Noizlabs © 2025. Built for the Audio Degenverse 🎧
      </footer>
    </div>
  );
}
