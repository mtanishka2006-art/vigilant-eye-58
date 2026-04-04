import { motion } from "framer-motion";
import { Shield, Activity } from "lucide-react";

interface HeaderProps {
  isAlert: boolean;
  onTriggerAlert: () => void;
  onClearAlert: () => void;
}

const Header = ({ isAlert, onTriggerAlert, onClearAlert }: HeaderProps) => {
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary/30">
            <Activity className="w-3 h-3 text-safe" />
            <span className="font-mono text-[10px] text-muted-foreground">
              SESSION: 00:14:32
            </span>
          </div>

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
