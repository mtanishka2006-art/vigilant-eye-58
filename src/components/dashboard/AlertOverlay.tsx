import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";

interface AlertOverlayProps {
  isActive: boolean;
  onDismiss: () => void;
  rppg: number;
  mesh: number;
  avsync: number;
}

const AlertOverlay = ({ isActive, onDismiss, rppg, mesh, avsync }: AlertOverlayProps) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Red flash overlay */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0.05, 0.12, 0.08] }}
            transition={{ duration: 0.8, times: [0, 0.15, 0.3, 0.5, 1] }}
            style={{ backgroundColor: "hsl(0, 100%, 50%)" }}
          />

          {/* Glitch scanlines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0 h-px"
                style={{
                  top: `${10 + i * 12}%`,
                  backgroundColor: "hsl(0, 100%, 60%)",
                  opacity: 0.3,
                }}
                animate={{
                  translateX: [0, -20, 10, -5, 0],
                  scaleX: [1, 1.05, 0.95, 1],
                  opacity: [0.3, 0.6, 0.2, 0.4, 0.3],
                }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.03,
                  repeat: 2,
                }}
              />
            ))}
          </div>

          {/* Alert card */}
          <motion.div
            className="relative glass-strong rounded-xl p-8 max-w-md mx-4 border border-destructive/30 glow-red"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 p-1 rounded hover:bg-secondary/50 transition"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <motion.div
                className="p-4 rounded-full bg-destructive/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ShieldAlert className="w-10 h-10 text-destructive" />
              </motion.div>

              <div>
                <motion.h2
                  className="font-mono text-2xl font-bold text-destructive text-glow-red tracking-wider"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  DEEPFAKE DETECTED
                </motion.h2>
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  Synthetic media signatures found in active stream
                </p>
              </div>

              <div className="w-full space-y-2 text-left">
                <div className="flex justify-between items-center p-2 rounded bg-destructive/10">
                  <span className="font-mono text-[10px] text-muted-foreground">rPPG SNR</span>
                  <span className="font-mono text-xs text-destructive font-semibold">{rppg.toFixed(1)} dB — {rppg < 2.0 ? "NON-PERIODIC" : "LOW"}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-destructive/10">
                  <span className="font-mono text-[10px] text-muted-foreground">Mesh Warp</span>
                  <span className="font-mono text-xs text-destructive font-semibold">σ {mesh.toFixed(1)}px — {mesh > 3.0 ? "GHOSTING" : "ANOMALY"}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-warning/10">
                  <span className="font-mono text-[10px] text-muted-foreground">AV Sync</span>
                  <span className="font-mono text-xs text-warning font-semibold">{avsync.toFixed(2)} corr — {avsync < 0.6 ? "DESYNC" : "LOW"}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2 w-full">
                <button
                  onClick={onDismiss}
                  className="flex-1 font-mono text-xs py-2.5 rounded bg-secondary hover:bg-secondary/80 text-foreground transition tracking-wider"
                >
                  DISMISS
                </button>
                <button className="flex-1 font-mono text-xs py-2.5 rounded bg-destructive/20 hover:bg-destructive/30 text-destructive transition tracking-wider border border-destructive/30">
                  QUARANTINE
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertOverlay;
