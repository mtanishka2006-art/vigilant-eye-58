import { motion } from "framer-motion";
import { Shield, Activity, Wifi, WifiOff } from "lucide-react";
import type { ConnectionStatus } from "@/lib/api";

interface HeaderProps {
  isAlert: boolean;
  onTriggerAlert: () => void;
  onClearAlert: () => void;
  connectionStatus: ConnectionStatus;
  isCalibrating: boolean;
}

const Header = ({ isAlert, onTriggerAlert, onClearAlert, connectionStatus, isCalibrating }: HeaderProps) => {
  const statusConfig = {
    connected: { icon: Wifi, text: "BACKEND CONNECTED", color: "text-safe" },
    connecting: { icon: Wifi, text: "CONNECTING...", color: "text-warning" },
    disconnected: { icon: WifiOff, text: "OFFLINE MODE", color: "text-muted-foreground" },
    error: { icon: WifiOff, text: "CONNECTION ERROR", color: "text-destructive" },
  };
  const status = statusConfig[connectionStatus];
  const StatusIcon = status.icon;

  return (
    <header className="glass-strong border-b border-border/50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            animate={isAlert ? { rotate: [0, -5, 5, -3, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Shield className={`w-7 h-7 ${isAlert ? "text-destructive" : "text-primary"}`} />
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: isAlert ? "hsl(0,100%,60%)" : "hsl(150,100%,50%)" }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <h1 className={`font-mono text-lg font-bold tracking-[0.15em] ${isAlert ? "text-destructive text-glow-red" : "text-foreground"}`}>
              VIGILANTEYE
            </h1>
            <p className="font-mono text-[9px] text-muted-foreground tracking-[0.3em]">
              DEEPFAKE DETECTION SYSTEM v2.1.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded bg-secondary/30`}>
            <StatusIcon className={`w-3 h-3 ${status.color}`} />
            <span className={`font-mono text-[10px] ${status.color}`}>
              {status.text}
            </span>
          </div>

          {/* Calibrating indicator */}
          {isCalibrating && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-warning/10 border border-warning/20"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Activity className="w-3 h-3 text-warning" />
              <span className="font-mono text-[10px] text-warning">CALIBRATING</span>
            </motion.div>
          )}

          {/* Demo controls */}
          <div className="flex gap-2">
            <button
              onClick={onTriggerAlert}
              className="font-mono text-[10px] px-3 py-1.5 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition tracking-wider border border-destructive/30"
            >
              ⚡ SIMULATE THREAT
            </button>
            <button
              onClick={onClearAlert}
              className="font-mono text-[10px] px-3 py-1.5 rounded bg-safe/10 text-safe hover:bg-safe/20 transition tracking-wider border border-safe/20"
            >
              ✓ CLEAR
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
