import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import type { DetectionLog } from "@/hooks/useAnalysis";

interface DetectionFeedProps {
  logs: DetectionLog[];
}

const typeConfig = {
  safe: { icon: ShieldCheck, color: "text-safe", bg: "bg-safe/10", border: "border-safe/20" },
  threat: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  warning: { icon: Clock, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
};

// Default mock events when no logs yet
const defaultEvents: DetectionLog[] = [
  { id: "d1", timestamp: "14:32:07.291", type: "safe", source: "rPPG", message: "Periodic BVP detected — SNR 8.2 dB", confidence: 94 },
  { id: "d2", timestamp: "14:32:06.844", type: "safe", source: "MESH", message: "478 landmarks stable — σ 1.2px", confidence: 96 },
  { id: "d3", timestamp: "14:32:05.112", type: "safe", source: "AV-SYNC", message: "Lip closure corr 0.91 on bilabial phoneme", confidence: 91 },
];

const DetectionFeed = ({ logs = [] }: DetectionFeedProps) => {
  const events = logs.length > 0 ? logs : defaultEvents;

  return (
    <div className="glass rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
          Detection Feed
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        <AnimatePresence>
          {events.map((event, i) => {
            const { icon: Icon, color, bg, border } = typeConfig[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-2.5 p-2.5 rounded border ${border} ${bg}`}
              >
                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-mono text-[10px] font-semibold ${color}`}>
                      {event.source}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {event.timestamp}
                    </span>
                    <span className={`font-mono text-[9px] ml-auto ${color}`}>
                      {event.confidence}%
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-secondary-foreground leading-relaxed truncate">
                    {event.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DetectionFeed;
