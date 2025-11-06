"use client";

import React, { useEffect, useState } from "react";
import { useAudioEngine } from "@lib/audio/engine";
import { useTheme } from "@lib/themes";
import type { Profile } from "@lib/storage";

export function HUD({
  isRunning,
  bpm,
  setBpm,
  onStart,
  shareUrl,
  clear,
  profile,
  setProfile,
  showFeed,
}: {
  isRunning: boolean;
  bpm: number;
  setBpm: (n: number) => void;
  onStart: () => Promise<void>;
  shareUrl: string;
  clear: () => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  showFeed: boolean;
}) {
  const { theme, setTheme, themes } = useTheme();
  const { loadPattern } = useAudioEngine();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="pointer-events-auto grid w-full grid-cols-3 items-center gap-3">
      <div className="col-span-2 flex items-center gap-2">
        <button className="btn btn-primary" onClick={() => onStart()}>
          {isRunning ? 'Playing' : 'Start' }
        </button>
        <button className="btn btn-ghost" onClick={() => clear()}>Clear</button>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
          <span className="text-xs opacity-70">BPM</span>
          <input
            type="range"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          />
          <span className="w-8 text-right text-xs">{bpm}</span>
        </div>
      </div>

      <div className="col-span-1 flex items-center justify-end gap-2">
        <select
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm"
          value={theme.id}
          onChange={(e) => setTheme(themes.find(t => t.id === e.target.value) || theme)}
        >
          {themes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
        <button
          className="btn btn-primary"
          onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); }}
        >
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {showFeed && (
        <div className="col-span-3 mt-3 flex w-full flex-col gap-2">
          <Feed onLoad={(p) => loadPattern(p)} />
        </div>
      )}

      <div className="col-span-3 mt-2 flex items-center justify-between text-xs opacity-70">
        <div>@{profile.username} ? {profile.points} pts ? {profile.streak} day streak</div>
        <div>
          <button className="underline" onClick={() => {
            const name = prompt('Change display name', profile.username) ?? profile.username;
            setProfile({ ...profile, username: name });
          }}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}

function Feed({ onLoad }: { onLoad: (pattern: number[][]) => void }) {
  const [items, setItems] = useState<{ id: string; url: string; bpm: number; }[]>(() => {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem('arbeat_feed_v1') ?? '[]';
    try { return JSON.parse(raw); } catch { return []; }
  });

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('arbeat_feed_v1', JSON.stringify(items));
  }, [items]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">Community Loop</div>
        <button className="btn btn-ghost" onClick={() => setItems([])}>Clear Feed</button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-white/10 bg-black/30 p-2">
            <div className="mb-1 truncate text-[11px] opacity-70">{it.url}</div>
            <div className="flex items-center gap-2">
              <a className="btn btn-ghost" href={it.url} target="_blank">Open</a>
              <button className="btn btn-primary" onClick={() => { window.location.hash = it.url.split('#')[1]; window.location.reload(); }}>Remix</button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-3 w-full rounded-xl bg-neon-purple/20 px-3 py-2 text-sm text-neon-purple"
        onClick={() => {
          const url = window.location.href;
          setItems((prev) => [{ id: Math.random().toString(36).slice(2), url, bpm: 0 }, ...prev.slice(0, 20)]);
        }}
      >
        Post current as clip
      </button>
    </div>
  );
}
