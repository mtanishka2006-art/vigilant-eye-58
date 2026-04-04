import { motion } from "framer-motion";
import { Video, Scan } from "lucide-react";

interface VideoPreviewProps {
  isAlert: boolean;
}

const VideoPreview = ({ isAlert }: VideoPreviewProps) => {
  // Simulated face mesh landmarks (simplified)
  const meshPoints = Array.from({ length: 30 }, (_, i) => ({
    x: 80 + Math.cos(i * 0.7) * (25 + Math.sin(i * 1.3) * 15),
    y: 70 + Math.sin(i * 0.5) * (20 + Math.cos(i * 0.9) * 12),
  }));

  return (
    <div className={`glass rounded-lg p-4 relative overflow-hidden ${isAlert ? "glow-red" : ""}`}>
      {isAlert && <div className="absolute inset-0 animate-red-alert pointer-events-none z-20" />}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs tracking-wider uppercase text-foreground">
            Live Feed — Participant 1
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Scan className="w-3 h-3 text-primary" />
          <span className="font-mono text-[10px] text-primary">SCANNING</span>
        </div>
      </div>

      {/* Simulated video area */}
      <div className="relative w-full aspect-video bg-secondary/20 rounded overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-30" />
        
        {/* Scan line */}
        <div className="absolute inset-0 scan-line pointer-events-none" />

        {/* Face outline placeholder */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 120">
          {/* Face oval */}
          <ellipse
            cx="80" cy="65" rx="28" ry="35"
            fill="none"
            stroke={isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)"}
            strokeWidth="0.5"
            opacity="0.6"
            strokeDasharray="3 2"
          />
          
          {/* Targeting bracket - top left */}
          <path d="M 48 28 L 48 22 L 56 22" fill="none" stroke={isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)"} strokeWidth="1" />
          {/* Targeting bracket - top right */}
          <path d="M 112 28 L 112 22 L 104 22" fill="none" stroke={isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)"} strokeWidth="1" />
          {/* Targeting bracket - bottom left */}
          <path d="M 48 102 L 48 108 L 56 108" fill="none" stroke={isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)"} strokeWidth="1" />
          {/* Targeting bracket - bottom right */}
          <path d="M 112 102 L 112 108 L 104 108" fill="none" stroke={isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)"} strokeWidth="1" />

          {/* Mesh landmarks */}
          {meshPoints.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="0.8"
              fill={isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)"}
              opacity="0.5"
              animate={{
                cx: p.x + (isAlert ? (Math.random() - 0.5) * 4 : 0),
                cy: p.y + (isAlert ? (Math.random() - 0.5) * 4 : 0),
              }}
              transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}

          {/* Mesh connections */}
          {meshPoints.slice(0, -1).map((p, i) => (
            <line
              key={`l-${i}`}
              x1={p.x} y1={p.y}
              x2={meshPoints[i + 1].x} y2={meshPoints[i + 1].y}
              stroke={isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)"}
              strokeWidth="0.3"
              opacity="0.2"
            />
          ))}

          {/* ROI box for forehead rPPG */}
          <rect
            x="65" y="30" width="30" height="12"
            fill="none"
            stroke="hsl(150,100%,50%)"
            strokeWidth="0.5"
            strokeDasharray="2 1"
            opacity="0.5"
          />
          <text x="66" y="29" fill="hsl(150,100%,50%)" fontSize="3" fontFamily="monospace" opacity="0.7">
            ROI:FOREHEAD
          </text>
        </svg>

        {/* Center crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="w-6 h-6 border rounded-full"
            style={{
              borderColor: isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)",
              opacity: 0.3,
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Bottom HUD bar */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 flex justify-between items-center bg-background/60">
          <span className="font-mono text-[8px] text-muted-foreground">
            FRAME: 14,207 | RES: 720p | CODEC: VP9
          </span>
          <span className={`font-mono text-[8px] ${isAlert ? "text-destructive" : "text-safe"}`}>
            {isAlert ? "⚠ ANOMALY" : "● NOMINAL"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
