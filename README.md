<div align="center">

<img src="https://raw.githubusercontent.com/A-Law-Pproject/A-Law-Frontend/main/src/assets/icons/chatbot.png" width="120" alt="A-Law Logo" />

# A-Law Frontend

> AI-powered lease contract analysis — mobile web application

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white&labelColor=20232A)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React Router](https://img.shields.io/badge/React_Router-7.10.1-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Axios](https://img.shields.io/badge/Axios-1.13.5-5A29E4?logo=axios&logoColor=white)](https://axios-http.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.26.2-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion)

**🔗 [https://www.a-law.site](https://www.a-law.site)**

</div>

---

**A-Law** helps everyday users understand complex lease contracts by scanning and automatically analyzing them with AI. Users can photograph a contract, receive a plain-language summary and risk analysis in real time, ask follow-up questions via chatbot, and save voice recordings linked to their contracts.

---

## Features

- **Contract Scan & OCR** — Capture with camera or upload from album
- **Real-time AI Analysis** — Summary and risk clause detection streamed via SSE
- **Plain Language Explanation** — Drag to select any clause for an AI-simplified explanation
- **Chatbot Consultation** — Ask questions about contract contents in natural language
- **Voice Recording** — Record conversations and link them to specific contracts
- **Contract Management** — Browse, filter, sort, and bookmark saved contracts
- **Kakao OAuth2 Login** — Social login with persistent cookie-based session

---

## Screenshots

| Home | Contract Analysis | Chatbot |
|------|------------------|---------|
| ![Home](docs/screenshots/home.png) | ![Analysis](docs/screenshots/analysis.png) | ![Chatbot](docs/screenshots/chatbot.png) |

> 📖 Full screenshots available in the [Demo Wiki](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki/Demo)

---

## Getting Started

### Requirements

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/A-Law-Pproject/A-Law-Frontend.git
cd A-Law-Frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://api.a-law.site/api/v1
VITE_KAKAO_APP_KEY=your_kakao_app_key
```

### Run

```bash
npm run dev      # development server (http://localhost:5173)
npm run build    # production build
```

---

## Project Structure

```
src/
├── api/            # API call functions (contract, voice, chat)
├── components/     # Shared components (BottomNav, ContractOverlay)
├── contexts/       # Global state (RecordingContext)
├── pages/          # Screen components by route
│   ├── scan/       # Camera, OCR loading, failure screens
│   ├── contract/   # Analysis carousel, chatbot, save flow
│   └── mypage/     # Profile, recordings, terms
├── services/       # Kakao auth service
└── types/          # TypeScript type definitions
```

---

## Screen Flow

```
Home
 ├── Scan Contract → Camera / Album → OCR Loading → Analysis (3 tabs)
 │                                                       ├── Original Text
 │                                                       ├── Summary
 │                                                       └── Risk Analysis
 ├── Voice Recording → Save Modal → Link to Contract
 └── Chatbot Panel

My Contracts → Filter / Sort / Bookmark
My Page      → Kakao Login / Logout / Recordings
```

---

## Wiki

Full development documentation is available in the [GitHub Wiki](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki):

- [Getting Started](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki/Getting-Started)
- [Project Structure](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki/Project-Structure)
- [User Flow](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki/User-Flow)
- [API Reference](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki/API-Reference)
- [Authentication](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki/Authentication)
- [Voice Recording](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki/Voice-Recording)

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable production branch |
| `feat/*` | Feature development |
| `fix/*` | Bug fixes |
| `chore/*` | Config, docs, and maintenance |
