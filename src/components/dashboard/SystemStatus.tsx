import { motion } from "framer-motion";
import { Cpu, Wifi, HardDrive, Zap } from "lucide-react";

const metrics = [
  { icon: Cpu, label: "Inference", value: "12ms", status: "nominal" as const },
  { icon: Wifi, label: "Latency", value: "48ms", status: "nominal" as const },
  { icon: HardDrive, label: "Buffer", value: "128 frames", status: "nominal" as const },
  { icon: Zap, label: "FPS", value: "30", status: "nominal" as const },
];

const SystemStatus = () => {
  return (
    <div className="glass rounded-lg p-4">
      <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
        System Telemetry
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            className="flex items-center gap-2.5 p-2.5 rounded bg-secondary/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
          >
            <m.icon className="w-3.5 h-3.5 text-primary" />
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                {m.label}
              </p>
              <p className="font-mono text-sm font-semibold text-foreground">
                {m.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SystemStatus;
