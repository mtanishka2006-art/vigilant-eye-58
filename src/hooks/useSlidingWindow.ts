import { useState, useCallback, useRef } from "react";

interface WindowFrame {
  trust: number;
  rppg: number;
  mesh: number;
  avsync: number;
  timestamp: number;
}

interface SlidingWindowResult {
  isDeepfake: boolean;
  consecutiveFailures: number;
  windowFrames: WindowFrame[];
  pushFrame: (frame: Omit<WindowFrame, "timestamp">) => void;
  reset: () => void;
}

const WINDOW_SIZE = 5;
const FAIL_THRESHOLD = 3; // 3 of 5

// Thresholds
const RPPG_THRESHOLD = 2.0;    // SNR dB
const MESH_THRESHOLD = 3.0;    // px jitter
const AVSYNC_THRESHOLD = 0.6;  // correlation
const TRUST_THRESHOLD = 40;

export function useSlidingWindow(): SlidingWindowResult {
  const [isDeepfake, setIsDeepfake] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const framesRef = useRef<WindowFrame[]>([]);
  const failWindowRef = useRef(0);

  const pushFrame = useCallback((frame: Omit<WindowFrame, "timestamp">) => {
    const windowFrame: WindowFrame = { ...frame, timestamp: Date.now() };
    framesRef.current.push(windowFrame);
    if (framesRef.current.length > WINDOW_SIZE) {
      framesRef.current.shift();
    }

    // Check if this frame fails
    const frameFails =
      frame.rppg < RPPG_THRESHOLD ||
      frame.mesh > MESH_THRESHOLD ||
      frame.avsync < AVSYNC_THRESHOLD;

    // Count failures in window
    const window = framesRef.current;
    let failures = 0;
    for (const f of window) {
      const fails =
        f.rppg < RPPG_THRESHOLD ||
        f.mesh > MESH_THRESHOLD ||
        f.avsync < AVSYNC_THRESHOLD;
      if (fails) failures++;
    }

    // Deepfake when trust < 40 for 3 consecutive windows
    if (failures >= FAIL_THRESHOLD && frame.trust < TRUST_THRESHOLD) {
      failWindowRef.current++;
    } else {
      failWindowRef.current = Math.max(0, failWindowRef.current - 1);
    }

    const detected = failWindowRef.current >= 3;
    setIsDeepfake(detected);
    setConsecutiveFailures(failWindowRef.current);
  }, []);

  const reset = useCallback(() => {
    framesRef.current = [];
    failWindowRef.current = 0;
    setIsDeepfake(false);
    setConsecutiveFailures(0);
  }, []);

  return {
    isDeepfake,
    consecutiveFailures,
    windowFrames: framesRef.current,
    pushFrame,
    reset,
  };
}
