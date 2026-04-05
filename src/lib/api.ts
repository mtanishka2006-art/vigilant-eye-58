/**
 * VigilantEye API — WebSocket connection to FastAPI backend
 */

const DEFAULT_BACKEND_URL = "ws://localhost:8000/ws/analyze";

export function getBackendUrl(): string {
  // Check for env override
  const envUrl = import.meta.env.VITE_BACKEND_WS_URL;
  return envUrl || DEFAULT_BACKEND_URL;
}

export interface FrameMessage {
  type: "frame";
  data: string; // base64 JPEG
  audio?: number[];
  force_score?: boolean;
}

export interface BackendScores {
  trust_score: number;
  pulse_score: number;
  audio_score: number;
  lip_score: number;
  red_alert: boolean;
  channel_failures: number;
  bpm?: number;
  bpm_confidence?: number;
  signal_samples?: number;
}

export interface BackendFrameResult {
  face_detected: boolean;
  landmarks: Array<{ x: number; y: number }>;
  mouth_aperture: number;
  frame_count: number;
  fps: number;
}

export interface BackendResponse {
  type: "result" | "connected" | "hello_ack" | "error" | "audio_result";
  frame_result?: BackendFrameResult;
  scores?: BackendScores;
  latency_ms?: number;
  timestamp?: number;
  message?: string;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export class VigilantEyeSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private maxReconnects = 3;
  
  onMessage: ((data: BackendResponse) => void) | null = null;
  onStatusChange: ((status: ConnectionStatus) => void) | null = null;

  constructor(url?: string) {
    this.url = url || getBackendUrl();
  }

  connect() {
    this.onStatusChange?.("connecting");
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.onStatusChange?.("connected");
        this.ws?.send(JSON.stringify({ type: "hello" }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data: BackendResponse = JSON.parse(event.data);
          this.onMessage?.(data);
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.onStatusChange?.("disconnected");
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.onStatusChange?.("error");
      };
    } catch {
      this.onStatusChange?.("error");
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.maxReconnects <= 0) return;
    this.maxReconnects--;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  sendFrame(base64Data: string, audio?: number[], forceScore = false) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const msg: FrameMessage = {
      type: "frame",
      data: base64Data,
      force_score: forceScore,
    };
    if (audio) msg.audio = audio;
    this.ws.send(JSON.stringify(msg));
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
