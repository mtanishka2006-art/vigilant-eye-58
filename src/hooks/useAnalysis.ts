import { useState, useEffect, useRef, useCallback } from "react";
import { VigilantEyeSocket, type BackendResponse, type BackendScores, type BackendFrameResult, type ConnectionStatus } from "@/lib/api";

export interface DetectionLog {
  id: string;
  timestamp: string;
  type: "safe" | "threat" | "warning";
  source: string;
  message: string;
  confidence: number;
}

export interface TelemetryData {
  latency: number;
  fps: number;
  buffer: number;
  inference: number;
}

export interface AnalysisState {
  trust: number;
  rppg: number;       // SNR dB
  mesh: number;        // px σ
  avsync: number;      // correlation
  bpm: number;
  redAlert: boolean;
  logs: DetectionLog[];
  telemetry: TelemetryData;
  landmarks: Array<{ x: number; y: number }>;
  faceDetected: boolean;
  frameCount: number;
  connectionStatus: ConnectionStatus;
  isCalibrating: boolean;
}

const CALIBRATION_DURATION = 5000; // 5 seconds

function nowTimestamp(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
}

let logCounter = 0;

function scoresToSignals(scores: BackendScores) {
  // Convert backend 0-100 scores to UI signal values
  // rPPG: pulse_score 0-100 → SNR dB (higher is better, ~8 nominal, <2 critical)
  const rppg = (scores.pulse_score / 100) * 12;
  // mesh: lip_score inversely maps to jitter (lower score = higher jitter)
  const mesh = Math.max(0, (100 - scores.audio_score) / 100 * 8);
  // avsync: lip_score 0-100 → correlation 0-1
  const avsync = scores.lip_score / 100;
  return { rppg, mesh, avsync };
}

export function useAnalysis() {
  const socketRef = useRef<VigilantEyeSocket | null>(null);
  const calibrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [state, setState] = useState<AnalysisState>({
    trust: 87,
    rppg: 8.2,
    mesh: 1.2,
    avsync: 0.91,
    bpm: 72,
    redAlert: false,
    logs: [],
    telemetry: { latency: 0, fps: 0, buffer: 0, inference: 0 },
    landmarks: [],
    faceDetected: false,
    frameCount: 0,
    connectionStatus: "disconnected",
    isCalibrating: false,
  });

  const addLog = useCallback((type: "safe" | "threat" | "warning", source: string, message: string, confidence: number) => {
    const log: DetectionLog = {
      id: `log-${++logCounter}`,
      timestamp: nowTimestamp(),
      type,
      source,
      message,
      confidence,
    };
    setState((prev) => ({
      ...prev,
      logs: [log, ...prev.logs].slice(0, 50), // Keep last 50
    }));
  }, []);

  const connect = useCallback(() => {
    const socket = new VigilantEyeSocket();
    socketRef.current = socket;
    startTimeRef.current = Date.now();

    socket.onStatusChange = (status) => {
      setState((prev) => ({ ...prev, connectionStatus: status }));
      if (status === "connected") {
        // Start calibration timer
        setState((prev) => ({ ...prev, isCalibrating: true }));
        calibrationTimerRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, isCalibrating: false }));
          addLog("safe", "SYS", "Calibration complete — baseline established", 100);
        }, CALIBRATION_DURATION);
      }
    };

    socket.onMessage = (data: BackendResponse) => {
      if (data.type === "result") {
        const frameResult = data.frame_result;
        const scores = data.scores;

        setState((prev) => {
          const next = { ...prev };

          if (frameResult) {
            next.faceDetected = frameResult.face_detected;
            next.landmarks = frameResult.landmarks || [];
            next.frameCount = frameResult.frame_count;
            next.telemetry = {
              ...next.telemetry,
              fps: frameResult.fps,
            };
          }

          if (data.latency_ms) {
            next.telemetry = {
              ...next.telemetry,
              latency: Math.round(data.latency_ms),
              inference: Math.round(data.latency_ms * 0.7), // approx
              buffer: next.frameCount,
            };
          }

          if (scores && Object.keys(scores).length > 0) {
            const signals = scoresToSignals(scores);
            next.trust = scores.trust_score;
            next.rppg = parseFloat(signals.rppg.toFixed(1));
            next.mesh = parseFloat(signals.mesh.toFixed(1));
            next.avsync = parseFloat(signals.avsync.toFixed(2));
            next.bpm = scores.bpm || next.bpm;
            next.redAlert = scores.red_alert;
          }

          return next;
        });

        // Generate logs from scores
        if (scores && Object.keys(scores).length > 0) {
          const signals = scoresToSignals(scores);
          if (signals.rppg >= RPPG_NOMINAL) {
            addLog("safe", "rPPG", `Periodic BVP detected — SNR ${signals.rppg.toFixed(1)} dB`, Math.round(scores.bpm_confidence ? scores.bpm_confidence * 100 : 90));
          } else if (signals.rppg < 2.0) {
            addLog("threat", "rPPG", `Non-periodic signal — SNR ${signals.rppg.toFixed(1)} dB`, 87);
          } else {
            addLog("warning", "rPPG", `Low SNR region — ${signals.rppg.toFixed(1)} dB`, 62);
          }

          if (signals.avsync >= 0.8) {
            addLog("safe", "AV-SYNC", `Lip closure corr ${signals.avsync.toFixed(2)}`, 91);
          } else if (signals.avsync < 0.6) {
            addLog("threat", "AV-SYNC", `Lip-audio desync: corr ${signals.avsync.toFixed(2)}`, 79);
          }
        }
      }
    };

    socket.connect();
  }, [addLog]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    if (calibrationTimerRef.current) {
      clearTimeout(calibrationTimerRef.current);
    }
    setState((prev) => ({ ...prev, connectionStatus: "disconnected", isCalibrating: false }));
  }, []);

  const sendFrame = useCallback((base64: string, forceScore = false) => {
    socketRef.current?.sendFrame(base64, undefined, forceScore);
  }, []);

  // Simulate threat — inject anomaly values
  const simulateThreat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      trust: 23,
      rppg: 0.8,
      mesh: 6.4,
      avsync: 0.41,
      bpm: 0,
      redAlert: true,
    }));
    addLog("threat", "rPPG", "Non-periodic signal — synthetic source likely", 92);
    addLog("threat", "MESH", "Temporal warp anomaly on landmarks 33-41 — σ 6.4px", 87);
    addLog("warning", "AV-SYNC", "Bilabial desync — 180ms lag, corr 0.41", 79);

    // Play alert sound
    playAlertSound();
  }, [addLog]);

  // Clear alert
  const clearAlert = useCallback(() => {
    setState((prev) => ({
      ...prev,
      trust: 87,
      rppg: 8.2,
      mesh: 1.2,
      avsync: 0.91,
      bpm: 72,
      redAlert: false,
      logs: [],
    }));
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      if (calibrationTimerRef.current) clearTimeout(calibrationTimerRef.current);
    };
  }, []);

  return {
    state,
    connect,
    disconnect,
    sendFrame,
    simulateThreat,
    clearAlert,
  };
}

const RPPG_NOMINAL = 5.0;

function playAlertSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not supported
  }
}
