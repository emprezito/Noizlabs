'use client';

import { useState } from 'react';

export default function UploadMemePage() {
  const [wallet, setWallet] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!wallet || !title || !file) {
      alert("Please fill all fields");
      return;
    }

    // Simulate upload
    alert(`Meme titled "${title}" uploaded by ${wallet}`);
  };

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-bold">🎙️ Upload Your Meme</h1>

      <input
        className="w-full p-2 text-black"
        placeholder="Enter Wallet Address"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
      />

      <input
        className="w-full p-2 text-black"
        placeholder="Enter Meme Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleUpload}
      >
        Upload
      </button>
    </main>
  );
}// app/arena/upload/page.tsx
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UploadEntryPage() {
  const [selectedArena, setSelectedArena] = useState("");
  const [fileName, setFileName] = useState("");

  const mockArenas = [
    { id: "arena1", name: "Best Reaction Sound" },
    { id: "arena2", name: "Craziest Laugh" },
    { id: "arena3", name: "Most Savage Voice Note" },
  ];

  const handleFileChange = (e: any) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    // TODO: Integrate with Solana wallet + fee logic
    alert("Entry submitted! 🎉 You paid $0.50.");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-bold text-white">🎧 Upload Your Meme</h1>

      <div className="space-y-2">
        <Label className="text-white">Select Arena</Label>
        <Select onValueChange={setSelectedArena}>
          <SelectTrigger className="bg-gray-900 text-white">
            <SelectValue placeholder="Choose a live Arena" />
          </SelectTrigger>
          <SelectContent>
            {mockArenas.map((arena) => (
              <SelectItem key={arena.id} value={arena.id}>
                {arena.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Upload Audio Meme (.mp3)</Label>
        <Input
          type="file"
          accept="audio/mpeg"
          className="bg-gray-900 text-white"
          onChange={handleFileChange}
        />
        {fileName && (
          <p className="text-sm text-green-400 mt-1">Selected: {fileName}</p>
        )}
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!selectedArena || !fileName}
      >
        Pay $0.50 & Submit
      </Button>
    </div>
  );
}
