"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AudioEngineProvider, useAudioEngine } from "@lib/audio/engine";
import { BeatCircle } from "@components/BeatCircle";
import { HUD } from "@components/HUD";
import { ARSurface } from "@components/ARSurface";
import { ParticleLayer } from "@components/ParticleLayer";
import { getInitialTheme, ThemeProvider } from "@lib/themes";
import { decodeSharedState, encodeShareState } from "@lib/sharing";
import { loadProfile, saveProfile, type Profile } from "@lib/storage";

export default function Page() {
  return (
    <ThemeProvider initialTheme={getInitialTheme()}>
      <AudioEngineProvider>
        <MainExperience />
      </AudioEngineProvider>
    </ThemeProvider>
  );
}

function MainExperience() {
  const { start, isRunning, bpm, setBpm, pattern, loadPattern, clearPattern } = useAudioEngine();
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [arEnabled, setArEnabled] = useState(false);
  const [showFeed, setShowFeed] = useState(false);

  // Load from shared URL if present
  useEffect(() => {
    const decoded = decodeSharedState(window.location.hash.slice(1));
    if (decoded) {
      loadPattern(decoded.pattern);
      if (decoded.bpm) setBpm(decoded.bpm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [shareUrl, setShareUrl] = useState<string>("");
  useEffect(() => {
    const encoded = encodeShareState({ pattern, bpm });
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}${window.location.pathname}#${encoded}`);
    }
  }, [pattern, bpm]);

  const onStart = async () => {
    await start();
    setProfile((p) => {
      const next = { ...p, points: p.points + 5 };
      saveProfile(next);
      return next;
    });
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <ARSurface enabled={arEnabled} />
      <ParticleLayer />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-4">
        <div className="pointer-events-auto flex w-full items-center justify-between">
          <button className="btn btn-ghost" onClick={() => setShowFeed((s) => !s)}>
            {showFeed ? "Close" : "Feed"}
          </button>
          <div className="text-center text-xs opacity-70">
            <div>AR Beat Collage</div>
            <div>{bpm} BPM</div>
          </div>
          <button className="btn btn-ghost" onClick={() => setArEnabled((e) => !e)}>
            {arEnabled ? "AR On" : "AR Off"}
          </button>
        </div>

        <BeatCircle onTrigger={() => {
          setProfile((p) => {
            const next = { ...p, points: p.points + 1 };
            saveProfile(next);
            return next;
          });
        }} />

        <HUD
          isRunning={isRunning}
          bpm={bpm}
          setBpm={setBpm}
          onStart={onStart}
          shareUrl={shareUrl}
          clear={() => clearPattern()}
          profile={profile}
          setProfile={(p) => { setProfile(p); saveProfile(p); }}
          showFeed={showFeed}
        />
      </div>
    </div>
  );
}
