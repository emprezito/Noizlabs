// app/arena/page.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
//import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MemeArenaPage() {
  const [activeTab, setActiveTab] = useState('live');

  const mockBattles = [
    {
      id: 1,
      theme: "Best Reaction Sound",
      entries: [
        { id: "A", audio: "/sounds/laugh1.mp3" },
        { id: "B", audio: "/sounds/angry1.mp3" }
      ],
      votesA: 120,
      votesB: 95,
      prize: "500 $NOIZ",
    },
    {
      id: 2,
      theme: "Funniest Scream",
      entries: [
        { id: "A", audio: "/sounds/scream1.mp3" },
        { id: "B", audio: "/sounds/scream2.mp3" }
      ],
      votesA: 80,
      votesB: 112,
      prize: "500 $NOIZ",
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">🎤 Meme Battle Arena</h1>
        <Button variant="default">+ Create Arena</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          <div className="space-y-4">
            {mockBattles.map((battle) => (
              <Card key={battle.id}>
                <CardContent className="p-4">
                  <h2 className="font-semibold text-white mb-2">{battle.theme}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {battle.entries.map((entry, idx) => (
                      <div key={entry.id} className="bg-gray-800 p-3 rounded-xl">
                        <p className="mb-2 text-sm text-white">Entry {entry.id}</p>
                        <audio controls className="w-full">
                          <source src={entry.audio} type="audio/mpeg" />
                        </audio>
                        <Button className="mt-2 w-full" variant="secondary">Vote</Button>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-400 mt-3">
                    🎁 Prize Pool: {battle.prize}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <p className="text-gray-400 text-sm mt-4">No upcoming battles yet.</p>
        </TabsContent>

        <TabsContent value="closed">
          <p className="text-gray-400 text-sm mt-4">Closed battles will appear here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
