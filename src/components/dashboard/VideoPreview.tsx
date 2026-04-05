import { motion } from "framer-motion";
import { Video, Scan, AlertTriangle } from "lucide-react";
import { RefObject } from "react";

interface VideoPreviewProps {
  isAlert: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  webcamActive: boolean;
  webcamError: string | null;
  landmarks: Array<{ x: number; y: number }>;
  faceDetected: boolean;
  frameCount: number;
  isCalibrating: boolean;
}

const VideoPreview = ({
  isAlert,
  videoRef,
  webcamActive,
  webcamError,
  landmarks = [],
  faceDetected = false,
  frameCount = 0,
  isCalibrating = false,
}: VideoPreviewProps) => {
  // Fallback simulated mesh points when no backend landmarks
  const meshPoints = landmarks.length > 0
    ? landmarks
    : Array.from({ length: 30 }, (_, i) => ({
        x: (80 + Math.cos(i * 0.7) * (25 + Math.sin(i * 1.3) * 15)) / 160,
        y: (70 + Math.sin(i * 0.5) * (20 + Math.cos(i * 0.9) * 12)) / 120,
      }));

  const accentColor = isAlert ? "hsl(0,100%,60%)" : "hsl(174,100%,50%)";

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
          {isCalibrating ? (
            <>
              <motion.div
                className="w-2 h-2 rounded-full bg-warning"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] text-warning">CALIBRATING</span>
            </>
          ) : (
            <>
              <Scan className="w-3 h-3 text-primary" />
              <span className="font-mono text-[10px] text-primary">SCANNING</span>
            </>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="relative w-full aspect-video bg-secondary/20 rounded overflow-hidden">
        {/* Live webcam feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Webcam error state */}
        {webcamError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground">CAMERA UNAVAILABLE</p>
              <p className="font-mono text-[9px] text-muted-foreground mt-1">{webcamError}</p>
            </div>
          </div>
        )}

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-30" />
        
        {/* Scan line */}
        <div className="absolute inset-0 scan-line pointer-events-none" />

        {/* SVG overlay with landmarks & brackets */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 120" preserveAspectRatio="none">
          {/* Face oval */}
          <ellipse
            cx="80" cy="65" rx="28" ry="35"
            fill="none"
            stroke={accentColor}
            strokeWidth="0.5"
            opacity={faceDetected ? 0.6 : 0.2}
            strokeDasharray="3 2"
          />
          
          {/* Targeting brackets */}
          <path d="M 48 28 L 48 22 L 56 22" fill="none" stroke={accentColor} strokeWidth="1" />
          <path d="M 112 28 L 112 22 L 104 22" fill="none" stroke={accentColor} strokeWidth="1" />
          <path d="M 48 102 L 48 108 L 56 108" fill="none" stroke={accentColor} strokeWidth="1" />
          <path d="M 112 102 L 112 108 L 104 108" fill="none" stroke={accentColor} strokeWidth="1" />

          {/* Mesh landmarks */}
          {meshPoints.map((p, i) => {
            // Normalize: backend sends 0-1, fallback is already 0-1
            const cx = p.x * 160;
            const cy = p.y * 120;
            return (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="0.8"
                fill={accentColor}
                opacity="0.5"
                animate={isAlert ? {
                  cx: cx + (Math.random() - 0.5) * 4,
                  cy: cy + (Math.random() - 0.5) * 4,
                } : { cx, cy }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
              />
            );
          })}

          {/* Mesh connections */}
          {meshPoints.slice(0, -1).map((p, i) => (
            <line
              key={`l-${i}`}
              x1={p.x * 160} y1={p.y * 120}
              x2={meshPoints[i + 1].x * 160} y2={meshPoints[i + 1].y * 120}
              stroke={accentColor}
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
              borderColor: accentColor,
              opacity: 0.3,
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Bottom HUD bar */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 flex justify-between items-center bg-background/60">
          <span className="font-mono text-[8px] text-muted-foreground">
            FRAME: {frameCount.toLocaleString()} | RES: 640×480 | CODEC: VP9
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
