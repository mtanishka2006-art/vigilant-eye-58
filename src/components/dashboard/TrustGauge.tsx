import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TrustGaugeProps {
  score: number;
  isAlert: boolean;
}

const TrustGauge = ({ score, isAlert }: TrustGaugeProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 90;
  const progress = (displayScore / 100) * circumference;
  const getColor = () => {
    if (isAlert) return "hsl(0, 100%, 60%)";
    if (score >= 70) return "hsl(150, 100%, 50%)";
    if (score >= 40) return "hsl(40, 100%, 55%)";
    return "hsl(0, 100%, 60%)";
  };

  const getLabel = () => {
    if (isAlert) return "THREAT DETECTED";
    if (score >= 70) return "VERIFIED HUMAN";
    if (score >= 40) return "UNCERTAIN";
    return "SYNTHETIC SUSPECTED";
  };

  return (
    <div className="glass rounded-lg p-6 flex flex-col items-center gap-4 relative overflow-hidden">
      {isAlert && <div className="absolute inset-0 animate-red-alert pointer-events-none z-10" />}
      
      <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
        Trust Index
      </h3>

      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="hsl(220, 15%, 15%)"
            strokeWidth="4"
          />
          {/* Tick marks */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * 360;
            const rad = (angle * Math.PI) / 180;
            const inner = 82;
            const outer = i % 5 === 0 ? 78 : 80;
            return (
              <line
                key={i}
                x1={100 + inner * Math.cos(rad)}
                y1={100 + inner * Math.sin(rad)}
                x2={100 + outer * Math.cos(rad)}
                y2={100 + outer * Math.sin(rad)}
                stroke="hsl(220, 10%, 25%)"
                strokeWidth="1"
              />
            );
          })}
          {/* Progress arc */}
          <motion.circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={getColor()}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${getColor()})`,
            }}
          />
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`font-mono text-5xl font-bold ${isAlert ? "text-glow-red" : score >= 70 ? "text-glow-green" : ""}`}
            style={{ color: getColor() }}
            key={displayScore}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayScore}
          </motion.span>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground mt-1">
            / 100
          </span>
        </div>
      </div>

      <motion.div
        className={`font-mono text-xs tracking-[0.2em] px-3 py-1.5 rounded-full ${
          isAlert
            ? "bg-destructive/20 text-destructive"
            : score >= 70
            ? "bg-safe/10 text-safe"
            : score >= 40
            ? "bg-warning/10 text-warning"
            : "bg-destructive/10 text-destructive"
        }`}
        animate={isAlert ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: isAlert ? Infinity : 0 }}
      >
        {getLabel()}
      </motion.div>
    </div>
  );
};

export default TrustGauge;
