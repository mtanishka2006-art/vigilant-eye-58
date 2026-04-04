import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "@/components/dashboard/Header";
import TrustGauge from "@/components/dashboard/TrustGauge";
import BioSignalCard from "@/components/dashboard/BioSignalCard";
import VideoPreview from "@/components/dashboard/VideoPreview";
import DetectionFeed from "@/components/dashboard/DetectionFeed";
import SystemStatus from "@/components/dashboard/SystemStatus";
import AlertOverlay from "@/components/dashboard/AlertOverlay";

const Dashboard = () => {
  const [isAlert, setIsAlert] = useState(false);

  const triggerAlert = useCallback(() => setIsAlert(true), []);
  const clearAlert = useCallback(() => setIsAlert(false), []);

  const trustScore = isAlert ? 23 : 87;

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

      <Header isAlert={isAlert} onTriggerAlert={triggerAlert} onClearAlert={clearAlert} />

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
            <VideoPreview isAlert={isAlert} />
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
              value={isAlert ? 0.8 : 8.2}
              status={isAlert ? "critical" : "nominal"}
              detail={isAlert ? "Non-periodic signal — synthetic source likely" : "Stable BVP — 72 BPM detected"}
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
              value={isAlert ? 6.4 : 1.2}
              status={isAlert ? "critical" : "nominal"}
              detail={isAlert ? "Landmark ghosting on chin region" : "478 landmarks temporally coherent"}
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
              value={isAlert ? 0.41 : 0.91}
              status={isAlert ? "warning" : "nominal"}
              detail={isAlert ? "Bilabial desync — 180ms lag" : "Phoneme-lip correlation nominal"}
            />
          </motion.div>

          {/* Detection Feed — 8 cols */}
          <motion.div
            className="col-span-12 lg:col-span-8 min-h-[300px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <DetectionFeed />
          </motion.div>

          {/* System Status — 4 cols */}
          <motion.div
            className="col-span-12 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <SystemStatus />
          </motion.div>
        </div>
      </main>

      {/* Full-screen alert overlay */}
      <AlertOverlay isActive={isAlert} onDismiss={clearAlert} />
    </div>
  );
};

export default Dashboard;
