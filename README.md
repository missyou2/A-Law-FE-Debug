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
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.6-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?logo=amazons3&logoColor=white)](https://aws.amazon.com/s3)

**🔗 [https://www.a-law.site](https://www.a-law.site)**

</div>

---

**A-Law** helps everyday users understand complex lease contracts by scanning and automatically analyzing them with AI. Users can photograph a contract, receive a plain-language summary and risk analysis in real time, ask follow-up questions via chatbot, and save voice recordings linked to their contracts.

---

## Features

### 📄 Contract Scan & OCR
Capture a contract with your camera or upload an image from your album. The image is automatically compressed and sent to the server for OCR text extraction.

### 🤖 Real-time AI Analysis
Once OCR is complete, AI analysis runs in the background via SSE streaming. Results are displayed across 3 tabs as they arrive — no need to wait for full completion.
- **Original** — Full OCR text with word-level overlay on the captured image
- **Summary** — AI-generated overview, key terms, and plain-language summary
- **Risk Analysis** — Each clause rated as Safe / Caution / Risk with detailed reasoning

### 💬 Plain Language Explanation
Drag to select any clause in the original text tab. An AI explanation panel slides up instantly, breaking down complex legal language into simple terms.

### 🙋 Chatbot Consultation
Ask any question about the contract in natural language. Responses are streamed token by token via SSE for a smooth chat experience. Conversation history is preserved across sessions via localStorage.

### 🎙️ Voice Recording
Record contract-related conversations directly from the home screen. After recording, optionally link the audio file to a specific saved contract. All recordings are accessible from My Page.

### 📁 Contract Management
Browse all saved contracts with filtering by date range and sorting by newest or oldest. Bookmark important contracts for quick access.

### 🔐 Kakao OAuth2 Login
One-tap social login via Kakao. Auth tokens are stored in cookies with a 7-day expiry and automatically attached to every API request.

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│   Scan │ Analysis │ Chatbot │ Voice     │
└────────────────────┬────────────────────┘
                     │  REST / SSE
                     ▼
┌─────────────────────────────────────────┐
│        Backend (Spring Boot 3 / Java 21)│
│  PostgreSQL · MongoDB · Redis · AWS S3  │
│         RabbitMQ · JWT · Swagger        │
└──────────────┬──────────────────────────┘
               │  RabbitMQ
               ▼
┌─────────────────────────────────────────┐
│         AI Server (FastAPI / Python)    │
│  LangChain · LangGraph · OpenAI · Qdrant│
│     Celery · Redis · PyMuPDF · OpenCV   │
└─────────────────────────────────────────┘
               │
               ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│  AWS S3  │  │  Qdrant  │  │ Kakao OAuth2 │
│ Storage  │  │ Vector DB│  │    (Auth)    │
└──────────┘  └──────────┘  └──────────────┘
```

---

## Dependencies

### Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.0 | UI framework |
| react-dom | 19.2.0 | DOM rendering |
| react-router-dom | 7.10.1 | Client-side routing |
| axios | 1.13.5 | HTTP client |
| framer-motion | 12.26.2 | Page transition animations |
| react-icons | 5.5.0 | Icon library |
| react-markdown | 10.1.0 | Markdown rendering |
| remark-gfm | 4.0.1 | GitHub Flavored Markdown support |
| react-datepicker | 9.1.0 | Date picker for contract filtering |
| js-cookie | 3.0.5 | Cookie-based auth token management |
| @stomp/stompjs | 7.3.0 | WebSocket STOMP client |
| sockjs-client | 1.6.1 | WebSocket fallback |

### Dev

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | 5.9.3 | Type safety |
| vite | 7.2.4 | Build tool |
| eslint | 9.39.1 | Linting |

### Plugins

| Package | Version | Purpose |
|---------|---------|---------|
| @vitejs/plugin-react | 5.1.1 | Vite React integration (Fast Refresh) |
| eslint-plugin-react-hooks | 7.0.1 | React Hooks lint rules |
| eslint-plugin-react-refresh | 0.4.24 | React Fast Refresh lint rules |
| typescript-plugin-css-modules | 5.2.0 | CSS Modules type support |

---

## Demonstration

> 📖 See all screenshots in the [Demo Wiki](https://github.com/A-Law-Pproject/A-Law-Frontend/wiki/Demo)

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
A-Law-Frontend/
├── 📁 src/
│   ├── 📁 api/
│   │   ├── 📄 contractApi.ts           # Contract OCR, analysis, bookmark APIs
│   │   ├── 📄 voiceApi.ts              # Voice recording APIs
│   │   └── 📄 chatApi.ts              # Chatbot SSE streaming API
│   ├── 📁 contexts/
│   │   └── 📄 RecordingContext.tsx     # Global voice recording state
│   ├── 📁 pages/
│   │   ├── 📁 scan/                    # Camera & OCR flow
│   │   ├── 📁 contract/               # Analysis carousel & chatbot
│   │   └── 📁 mypage/                  # Profile & recordings
│   ├── 📁 services/
│   │   └── 📄 kakaoAuth.ts             # Kakao OAuth2 & cookie management
│   ├── 📄 App.tsx                      # Root component & routing
│   └── 📄 main.tsx                     # Entry point
├── 📄 vite.config.js                   # Vite & proxy configuration
└── 📄 package.json                     # Dependencies & scripts
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

## Related Repositories

| Repository | Description |
|------------|-------------|
| [A-Law-Backend](https://github.com/A-Law-Pproject/A-Law-Backend) | Spring Boot REST API server — OCR processing, AI analysis, voice storage, authentication |
| [A-Law-AI](https://github.com/A-Law-Pproject/A-Law-AI) | AI model server — contract clause analysis, risk detection, chatbot |

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable production branch |
| `feat/*` | Feature development |
| `fix/*` | Bug fixes |
| `chore/*` | Config, docs, and maintenance |

---

## License

Distributed under the [MIT License](LICENSE).
