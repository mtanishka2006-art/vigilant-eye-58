import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "@/components/dashboard/Header";
import TrustGauge from "@/components/dashboard/TrustGauge";
import BioSignalCard from "@/components/dashboard/BioSignalCard";
import VideoPreview from "@/components/dashboard/VideoPreview";
import DetectionFeed from "@/components/dashboard/DetectionFeed";
import SystemStatus from "@/components/dashboard/SystemStatus";
import AlertOverlay from "@/components/dashboard/AlertOverlay";
import { useWebcam } from "@/hooks/useWebcam";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useSlidingWindow } from "@/hooks/useSlidingWindow";

const CAPTURE_INTERVAL = 500; // ms

const Dashboard = () => {
  const { videoRef, canvasRef, isActive: webcamActive, error: webcamError, startWebcam, stopWebcam, captureFrame } = useWebcam();
  const { state, connect, disconnect, sendFrame, simulateThreat, clearAlert } = useAnalysis();
  const { isDeepfake, pushFrame, reset: resetWindow } = useSlidingWindow();
  const captureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAlert = state.redAlert || isDeepfake;

  // Start webcam on mount; only connect to backend if URL is configured
  useEffect(() => {
    startWebcam();
    const backendUrl = import.meta.env.VITE_BACKEND_WS_URL;
    if (backendUrl) {
      connect();
    }
    return () => {
      stopWebcam();
      disconnect();
    };
  }, []);

  // Frame capture loop
  useEffect(() => {
    if (!webcamActive) return;

    captureTimerRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        sendFrame(frame);
      }
    }, CAPTURE_INTERVAL);

    return () => {
      if (captureTimerRef.current) clearInterval(captureTimerRef.current);
    };
  }, [webcamActive, captureFrame, sendFrame]);

  // Push frames into sliding window when scores update
  useEffect(() => {
    if (state.trust > 0) {
      pushFrame({
        trust: state.trust,
        rppg: state.rppg,
        mesh: state.mesh,
        avsync: state.avsync,
      });
    }
  }, [state.trust, state.rppg, state.mesh, state.avsync, pushFrame]);

  // Play alert sound when deepfake detected via sliding window
  useEffect(() => {
    if (isDeepfake && !state.redAlert) {
      // Sliding window triggered
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
      } catch {}
    }
  }, [isDeepfake]);

  const handleTriggerAlert = useCallback(() => {
    simulateThreat();
  }, [simulateThreat]);

  const handleClearAlert = useCallback(() => {
    clearAlert();
    resetWindow();
  }, [clearAlert, resetWindow]);

  const trustScore = state.trust;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 grid-overlay pointer-events-none" />
      
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: isAlert
            ? "radial-gradient(ellipse, hsl(0 100% 60% / 0.06) 0%, transparent 70%)"
            : "radial-gradient(ellipse, hsl(174 100% 50% / 0.04) 0%, transparent 70%)",
          transition: "background 0.5s ease",
        }}
      />

      <Header
        isAlert={isAlert}
        onTriggerAlert={handleTriggerAlert}
        onClearAlert={handleClearAlert}
        connectionStatus={state.connectionStatus}
        isCalibrating={state.isCalibrating}
      />

      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-4 auto-rows-min">
          {/* Video Preview — spans 8 cols */}
          <motion.div
            className="col-span-12 lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <VideoPreview
              isAlert={isAlert}
              videoRef={videoRef}
              canvasRef={canvasRef}
              webcamActive={webcamActive}
              webcamError={webcamError}
              landmarks={state.landmarks}
              faceDetected={state.faceDetected}
              frameCount={state.frameCount}
              isCalibrating={state.isCalibrating}
            />
          </motion.div>

          {/* Trust Gauge — spans 4 cols */}
          <motion.div
            className="col-span-12 sm:col-span-6 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TrustGauge score={trustScore} isAlert={isAlert} />
          </motion.div>

          {/* Bio Signal Cards — 3 cards across */}
          <motion.div
            className="col-span-12 sm:col-span-6 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BioSignalCard
              type="rppg"
              value={state.rppg}
              status={state.rppg < 2.0 ? "critical" : state.rppg < 5.0 ? "warning" : "nominal"}
              detail={state.rppg < 2.0 ? "Non-periodic signal — synthetic source likely" : `Stable BVP — ${state.bpm} BPM detected`}
            />
          </motion.div>

          <motion.div
            className="col-span-12 sm:col-span-6 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BioSignalCard
              type="mesh"
              value={state.mesh}
              status={state.mesh > 3.0 ? "critical" : state.mesh > 2.0 ? "warning" : "nominal"}
              detail={state.mesh > 3.0 ? `Landmark ghosting — σ ${state.mesh}px` : "478 landmarks temporally coherent"}
            />
          </motion.div>

          <motion.div
            className="col-span-12 sm:col-span-6 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BioSignalCard
              type="audio"
              value={state.avsync}
              status={state.avsync < 0.6 ? "critical" : state.avsync < 0.8 ? "warning" : "nominal"}
              detail={state.avsync < 0.6 ? `Bilabial desync — corr ${state.avsync}` : "Phoneme-lip correlation nominal"}
            />
          </motion.div>

          {/* Detection Feed — 8 cols */}
          <motion.div
            className="col-span-12 lg:col-span-8 min-h-[300px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <DetectionFeed logs={state.logs} />
          </motion.div>

          {/* System Status — 4 cols */}
          <motion.div
            className="col-span-12 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <SystemStatus telemetry={state.telemetry} connectionStatus={state.connectionStatus} />
          </motion.div>
        </div>
      </main>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Full-screen alert overlay */}
      <AlertOverlay isActive={isAlert} onDismiss={handleClearAlert} rppg={state.rppg} mesh={state.mesh} avsync={state.avsync} />
    </div>
  );
};

export default Dashboard;
