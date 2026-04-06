# 🛡️ VigilantEye — Real-Time Deepfake Detection Dashboard

**VigilantEye** is a real-time deepfake detection system that analyzes live webcam feeds using bio-signal analysis, facial landmark tracking, and audio-visual synchronization to determine whether a video subject is a real human or a synthetic/deepfake source.

> Built with a cyberpunk-inspired dark UI, VigilantEye provides security operators and researchers with an intuitive command-center experience for identifying manipulated media in real time.

---

## ✨ Features

- **Live Webcam Analysis** — Captures frames from the user's webcam at configurable intervals and streams them for analysis
- **Trust Score Gauge** — Animated radial gauge displaying a 0–100 composite trust score with VERIFIED HUMAN / UNCERTAIN / SYNTHETIC SUSPECTED classifications
- **Bio-Signal Cards** — Three dedicated signal monitors:
  - **rPPG / BVP** — Remote photoplethysmography detecting blood volume pulse via skin reflectance (SNR dB)
  - **3D Mesh Warp** — Temporal coherence analysis across 478 facial landmarks (pixel σ jitter)
  - **AV Sync** — Audio-visual lip correlation measurement (phoneme-lip correlation coefficient)
- **Sliding Window Detector** — Client-side 5-frame sliding window with configurable thresholds; triggers deepfake alert when 3+ of 5 frames fail across multiple consecutive windows
- **Real-Time Detection Feed** — Timestamped log stream of safe/warning/threat events with source attribution and confidence scores
- **Full-Screen Alert Overlay** — Red alert with anomaly breakdown when a deepfake is detected, including audible 800Hz square-wave alarm
- **System Telemetry** — Live latency, FPS, buffer depth, and inference time metrics
- **Standalone Mode** — Fully functional UI without a backend; includes a "Simulate Threat" button for demo/testing
- **WebSocket Backend Support** — Optional connection to a FastAPI backend for server-side AI inference via `VITE_BACKEND_WS_URL`
- **Responsive Bento Grid Layout** — 12-column adaptive grid with motion-animated card entrance

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript 5** | Type safety |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **shadcn/ui + Radix UI** | Accessible component primitives |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Data visualization |
| **Lucide React** | Icon system |
| **React Router 6** | Client-side routing |
| **TanStack React Query** | Async state management |

### Backend (External — Not in This Repo)

| Technology | Purpose |
|---|---|
| **FastAPI (Python)** | AI inference server |
| **WebSocket** | Real-time frame streaming protocol |

### Testing

| Technology | Purpose |
|---|---|
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **Testing Library** | Component testing |

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
│                                                        │
│  ┌──────────┐   ┌────────────┐   ┌──────────────────┐ │
│  │ useWebcam│──▶│useAnalysis  │──▶│  Dashboard UI    │ │
│  │ (frames) │   │(WS + state)│   │  (React + Motion)│ │
│  └──────────┘   └─────┬──────┘   └──────────────────┘ │
│                       │                                │
│              ┌────────▼────────┐                       │
│              │useSlidingWindow │                       │
│              │(client detector)│                       │
│              └─────────────────┘                       │
└───────────────────────┬────────────────────────────────┘
                        │ WebSocket (optional)
                        ▼
              ┌─────────────────┐
              │  FastAPI Backend │
              │  /ws/analyze     │
              └─────────────────┘
```

### Data Flow

1. **`useWebcam`** captures 640×480 JPEG frames from the user's camera every 500ms
2. Frames are sent as base64 via WebSocket to the backend (if connected)
3. **`useAnalysis`** processes backend responses containing trust scores, BPM, facial landmarks, and signal metrics
4. Scores are converted to UI-friendly signals (SNR dB, pixel jitter, correlation)
5. **`useSlidingWindow`** independently evaluates the last 5 frames client-side — if 3+ frames breach thresholds across 3 consecutive evaluations, a deepfake alert fires
6. The dashboard re-renders with updated gauges, signal cards, detection logs, and alert state

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── AlertOverlay.tsx      # Full-screen red alert with anomaly details
│   │   ├── BioSignalCard.tsx     # rPPG / Mesh / AV-Sync signal cards
│   │   ├── DetectionFeed.tsx     # Scrollable timestamped event log
│   │   ├── Header.tsx            # Top bar with status, controls, branding
│   │   ├── SystemStatus.tsx      # Telemetry panel (latency, FPS, buffer)
│   │   ├── TrustGauge.tsx        # SVG radial trust score gauge
│   │   └── VideoPreview.tsx      # Webcam feed with landmark overlay
│   └── ui/                       # shadcn/ui component library
├── hooks/
│   ├── useAnalysis.ts            # WebSocket connection + score state management
│   ├── useSlidingWindow.ts       # Client-side deepfake voting logic
│   ├── useWebcam.ts              # Camera access + frame capture
│   └── use-mobile.tsx            # Responsive breakpoint hook
├── lib/
│   ├── api.ts                    # WebSocket client (VigilantEyeSocket class)
│   └── utils.ts                  # Tailwind merge utility
├── pages/
│   ├── Index.tsx                 # Main dashboard page
│   └── NotFound.tsx              # 404 page
├── index.css                     # Design tokens, cyber theme, glass effects
├── App.tsx                       # Router + providers
└── main.tsx                      # Entry point
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **bun**, or **pnpm**

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/vigilanteye.git
cd vigilanteye

# Install dependencies
npm install
```

---

## ▶️ How to Run

### Frontend (Dashboard)

```bash
# Development server (port 8080)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Backend (FastAPI — Separate Repository)

The frontend connects to an external FastAPI WebSocket server for AI inference. If no backend URL is configured, the dashboard runs in **Standalone Mode** with simulated data.

To connect a backend:

```bash
# Set the WebSocket URL in your environment
export VITE_BACKEND_WS_URL=ws://your-server:8000/ws/analyze

# Then start the frontend
npm run dev
```

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_WS_URL` | No | _(none — standalone mode)_ | WebSocket URL of the FastAPI analysis backend |

Create a `.env` file in the project root:

```env
VITE_BACKEND_WS_URL=ws://localhost:8000/ws/analyze
```

---

## 🔌 WebSocket API

The frontend communicates with the backend over a single WebSocket endpoint.

### Endpoint

```
ws://<host>:<port>/ws/analyze
```

### Client → Server

```json
{
  "type": "frame",
  "data": "<base64 JPEG>",
  "audio": [0.1, -0.2, ...],
  "force_score": false
}
```

### Server → Client

```json
{
  "type": "result",
  "frame_result": {
    "face_detected": true,
    "landmarks": [{"x": 0.5, "y": 0.3}, ...],
    "mouth_aperture": 12.5,
    "frame_count": 142,
    "fps": 15.2
  },
  "scores": {
    "trust_score": 87,
    "pulse_score": 72,
    "audio_score": 85,
    "lip_score": 91,
    "red_alert": false,
    "channel_failures": 0,
    "bpm": 72,
    "bpm_confidence": 0.92,
    "signal_samples": 300
  },
  "latency_ms": 45.2,
  "timestamp": 1700000000
}
```

---

## 🖥️ Usage

1. **Open the dashboard** — Navigate to `http://localhost:8080`
2. **Grant camera access** — The webcam starts automatically on load
3. **Monitor signals** — Watch the Trust Gauge, bio-signal cards, and detection feed in real time
4. **Simulate a threat** — Click the **Simulate Threat** button in the header to trigger a demo red alert
5. **Clear alerts** — Click **Clear** or dismiss the overlay to reset all signals to nominal

---

## 📸 Screenshots

> _Add screenshots of the dashboard in different states:_

| State | Screenshot |
|---|---|
| Normal / Verified Human | `![Normal State](docs/screenshots/normal.png)` |
| Alert / Deepfake Detected | `![Alert State](docs/screenshots/alert.png)` |
| Standalone Mode | `![Standalone](docs/screenshots/standalone.png)` |

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests (Playwright)
npx playwright test
```

---

## 🔮 Future Improvements

- [ ] **Audio channel analysis** — Capture microphone input and stream audio features alongside video frames
- [ ] **Session recording & playback** — Save analysis sessions for forensic review
- [ ] **Multi-face tracking** — Support simultaneous analysis of multiple subjects in frame
- [ ] **Historical analytics dashboard** — Trend charts for trust scores over time using Recharts
- [ ] **Chrome Extension integration** — Inject VigilantEye analysis into Google Meet / Zoom calls via Manifest V3 extension
- [ ] **Configurable thresholds** — Settings panel for adjusting rPPG, mesh, and AV-sync detection sensitivity
- [ ] **Export detection reports** — PDF/CSV export of detection logs with timestamps and signal data
- [ ] **Dark/light theme toggle** — Extend the existing design token system to support light mode
- [ ] **Mobile-responsive layout** — Optimize the bento grid for tablet and phone viewports
- [ ] **On-device ML inference** — Run lightweight deepfake detection models directly in the browser via TensorFlow.js or ONNX Runtime Web

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <strong>VigilantEye</strong> — Because seeing is no longer believing.
</p>
