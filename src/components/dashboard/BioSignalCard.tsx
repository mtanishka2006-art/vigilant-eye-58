import { motion } from "framer-motion";
import { Heart, Box, AudioLines } from "lucide-react";

type SignalType = "rppg" | "mesh" | "audio";

interface BioSignalCardProps {
  type: SignalType;
  value: number;
  status: "nominal" | "warning" | "critical";
  detail: string;
}

const config = {
  rppg: {
    icon: Heart,
    label: "rPPG / BVP",
    unit: "dB SNR",
    description: "Blood Volume Pulse via skin reflectance",
  },
  mesh: {
    icon: Box,
    label: "3D Mesh Warp",
    unit: "px σ",
    description: "Temporal landmark coherence",
  },
  audio: {
    icon: AudioLines,
    label: "AV Sync",
    unit: "corr",
    description: "Audio-visual lip correlation",
  },
};

const statusColors = {
  nominal: { bg: "bg-safe/10", text: "text-safe", glow: "glow-green" },
  warning: { bg: "bg-warning/10", text: "text-warning", glow: "" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", glow: "glow-red" },
};

const BioSignalCard = ({ type, value, status, detail }: BioSignalCardProps) => {
  const { icon: Icon, label, unit, description } = config[type];
  const colors = statusColors[status];

  // Generate fake waveform
  const points = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * 200;
    const y = type === "rppg"
      ? 25 + Math.sin(i * 0.5) * 15 + Math.sin(i * 1.2) * 8
      : type === "mesh"
      ? 25 + Math.random() * (status === "critical" ? 30 : 8) + Math.sin(i * 0.3) * 10
      : 25 + Math.sin(i * 0.8) * 12 + Math.cos(i * 0.3) * 8;
    return `${x},${y}`;
  }).join(" ");

  return (
    <motion.div
      className={`glass rounded-lg p-4 relative overflow-hidden ${status === "critical" ? "glow-red" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${colors.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
          </div>
          <span className="font-mono text-xs tracking-wider uppercase text-foreground">
            {label}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${colors.bg} ${colors.text} ${status === "critical" ? "animate-pulse-glow" : ""}`}
          style={{ backgroundColor: status === "nominal" ? "hsl(150,100%,50%)" : status === "warning" ? "hsl(40,100%,55%)" : "hsl(0,100%,60%)" }}
        />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className={`font-mono text-2xl font-bold ${colors.text}`}>
          {value.toFixed(1)}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {unit}
        </span>
      </div>

      <p className="text-[10px] text-muted-foreground mb-3 font-mono">
        {description}
      </p>

      {/* Mini waveform */}
      <div className="h-12 w-full overflow-hidden rounded bg-secondary/30">
        <svg viewBox="0 0 200 50" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={status === "nominal" ? "hsl(150,100%,50%)" : status === "warning" ? "hsl(40,100%,55%)" : "hsl(0,100%,60%)"}
            strokeWidth="1.5"
            style={{
              filter: `drop-shadow(0 0 4px ${status === "nominal" ? "hsl(150,100%,50%)" : status === "warning" ? "hsl(40,100%,55%)" : "hsl(0,100%,60%)"})`,
            }}
          />
        </svg>
      </div>

      {/* Detail */}
      <p className={`font-mono text-[10px] mt-2 ${colors.text}`}>
        {detail}
      </p>
    </motion.div>
  );
};

export default BioSignalCard;
