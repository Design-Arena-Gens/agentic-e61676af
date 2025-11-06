"use client";

import React, { useEffect, useRef, useState } from "react";

export function ARSurface({ enabled }: { enabled: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (!enabled) return;
    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        setReady(false);
      }
    };
    run();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [enabled]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {enabled && (
        <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${ready ? 'opacity-100' : 'opacity-0'}`} />
      )}
    </div>
  );
}
