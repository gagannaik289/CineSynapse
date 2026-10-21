# CineSynapse: AI Multimedia Production Suite & Screenplay Co-Pilot

A major studio expansion introducing four AI production capabilities: an ambient film score generator powered by Lyria, a floating multi-turn Gemini Writer's Room chatbot with live scene context, a microphone speech-to-text dictation engine using Gemini 3.5 Transcribe, and a concept art/storyboard image studio powered by Gemini Nano Banana 2.1.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your Phase 1 answers, the new AI capabilities are organized into a **Unified Production Suite tab** complemented by **contextual toolbars inside individual scenes**, featuring a **Floating Writer Room Assistant** with live scene awareness and an **Ambient Cinematic Score Generator**.

- **Soundtrack Engine**: Powered by `lyria-3-clip-preview` (for 30s scene tension tracks) and `lyria-3-pro-preview` (for full atmospheric themes), with live audio waveform player and download capability.
- **Writer's Room Chatbot**: Multi-turn floating assistant with persistent memory, persona switcher (*Story Doctor*, *Dialogue Specialist*, *Sci-Fi Worldbuilder*), and model tier selection (`gemini-3.8-flash` standard, `gemini-4-argon` for complex plot knots, and `gemini-3.1-flash-lite` for high-speed brainstorming).
- **Voice Dictation & Transcription**: Real-time microphone audio capture in the browser streamed to `gemini-3.5-transcribe` on the backend, injecting transcribed speech directly into action lines, dialogue notes, or character dialogue.
- **Storyboard & Concept Art Studio**: Image generation and iterative text-based image editing using `gemini-nano-banana-2.1`, creating visual tone poems, character lookbooks, and scene keyframes.
- **Paid Model Notice**: Models such as Lyria, Argon, and Nano Banana 2.1 integrate with AI Studio's paid key flow (`show_aistudio_ui` / `paid_model_flow`), backed by resilient procedural audio and visual fallbacks so the workspace remains operable.

---

## 1. Overview & Core Concept

### What It Does
Transforms CineSynapse from a text-only script editor into a multimodal film production deck:
1. **Film Score & Soundscape Generator (Lyria)**: Generate customized ambient cues (*e.g., "Ominous low-frequency synthesizer drone with distorted metallic reverb for orbital airlock breach"*), listen via built-in player, and attach cues directly to script beats.
2. **Floating Writer's Room Chatbot**: A collapsible companion window that reads the active script's logline, characters, and selected scene, allowing real-time workshopping, subtext audits, and dialogue punch-ups.
3. **Microphone Voice Dictation (Gemini 3.5 Transcribe)**: Authors can speak scene directions or act out character dialogue aloud into their microphone and have it transcribed and formatted directly into the manuscript.
4. **Storyboard & Concept Art Studio (Gemini Nano Banana 2.1)**: Render high-resolution concept art of settings and characters, with prompt-based iterative editing (*"Add atmospheric volumetric amber mist and cracked visor"*).

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Scoring a Scene**:
   - In any scene or the Production Suite tab, user clicks **"Generate Scene Score"**.
   - Selects mood (*Cyberpunk Dread, High-Altitude Solitude, Quantum Mystery, High-Velocity Pursuit*), enters custom acoustic prompt, and generates a Lyria track.
   - Listens via custom waveform player, loops playback during writing, or downloads the `.wav` file.
2. **Consulting the Writer's Room**:
   - User clicks the floating chat button at the bottom-right corner of the workspace.
   - The assistant initializes with the active script's context already primed.
   - User asks: *"Can you suggest 3 subtle lines of dialogue where Elena hints she knows the AI is lying?"*
   - Chatbot replies with options, which the author can insert into the scene with a single click.
3. **Dictating Scenes via Microphone**:
   - User toggles the microphone button on any scene draft.
   - Speaks scene action or character dialogue; waveform pulse confirms audio recording.
   - Gemini 3.5 Transcribe returns clean, punctuated text mapped directly into the screenplay textarea.
4. **Generating Storyboards & Visual Assets**:
   - In the Storyboard section, user clicks **"Generate Keyframe"** for a scene heading.
   - Prompt is generated from scene slugline and action text.
   - Nano Banana 2.1 generates the visual asset, saved into the script's visual reel.
   - User can apply text edits (*"Shift color palette to emerald and deep obsidian"*).

### Visual Identity & Theme
- **Consistent Neo-Noir Cinematic Aesthetic**:
  - Deep obsidian (`#07090E`), slate cards (`#0C101A`), hairline borders (`#1E2433`).
  - Electric amber (`#F59E0B`) for primary highlights, cyan (`#38BDF8`) for audio signals, emerald (`#10B981`) for recording status.
  - Zero static pill boxes: clean unboxed metadata with `·` separators.
- **Top Bar Contract**:
  - Zone 1: Wordmark (`CineSynapse · AI Sci-Fi Script Studio`)
  - Zone 2: 5 clean nav links (`Trending Radar`, `Script Studio`, `Production Suite`, `Screenplay Reader`, `Teleprompter`)
  - Zone 3: User Cloud Profile & `New Script Draft`

---

## 3. Technical Architecture & Endpoints

### Component & Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser Client (React)                    │
│                                                              │
│  ┌──────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Production Suite │  │ Floating Writer │  │ Microphone  │ │
│  │ (Music & Images) │  │ Room Chatbot    │  │ Dictation   │ │
│  └────────┬─────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                     │                  │         │
│           ▼                     ▼                  ▼         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │    Script Project State + Audio/Visual Media Storage   │  │
│  └──────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │ HTTP / JSON API
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              Server (Express / Node.js :3000)                │
│                                                              │
│  POST /api/music/generate        POST /api/chat/message      │
│  POST /api/audio/transcribe      POST /api/images/generate   │
│                             │    POST /api/images/edit       │
│                             ▼                                │
│              Google GenAI SDK (@google/genai)                │
│  • lyria-3-clip-preview / lyria-3-pro-preview                │
│  • gemini-4-argon / gemini-3.8-flash / gemini-3.1-flash-lite │
│  • gemini-3.5-transcribe                                     │
│  • gemini-nano-banana-2.1                                    │
└──────────────────────────────────────────────────────────────┘
```

### New Server Endpoints (`server.ts`)
1. `POST /api/music/generate`:
   - Inputs: `{ prompt, duration: 'clip' | 'full', sceneId }`
   - Model: `lyria-3-clip-preview` or `lyria-3-pro-preview`
   - Streams/assembles audio bytes into playable `audio/wav` base64.
2. `POST /api/chat/message`:
   - Inputs: `{ messages, systemRole, scriptContext, modelTier }`
   - Model: `gemini-3.8-flash` (default) or `gemini-4-argon` / `gemini-3.1-flash-lite`
   - Returns multi-turn AI response maintaining conversational thread.
3. `POST /api/audio/transcribe`:
   - Inputs: `{ audioBase64, mimeType }`
   - Model: `gemini-3.5-transcribe`
   - Returns clean, transcribed text.
4. `POST /api/images/generate`:
   - Inputs: `{ prompt, aspectRatio, sceneHeading }`
   - Model: `gemini-nano-banana-2.1`
   - Returns generated base64 PNG data.
5. `POST /api/images/edit`:
   - Inputs: `{ base64ImageData, mimeType, editPrompt }`
   - Model: `gemini-nano-banana-2.1`
   - Returns edited base64 image data.

---

## 4. Verification & Delivery Plan

1. **Server Updates**: Implement music, chat, transcription, and image generation endpoints with paid key handling and robust fallbacks.
2. **Frontend Components**:
   - `ProductionSuiteView.tsx`: Tab for managing scene soundtracks and visual storyboards.
   - `FloatingChatbot.tsx`: Minimizable/draggable multi-turn writer's assistant with scene insertion shortcuts.
   - `VoiceDictationButton.tsx`: Audio capture with live recording indicator that calls transcription endpoint.
   - `AudioPlayerWidget.tsx`: Sleek audio playback with loop and download controls.
3. **Verification**: Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors across the entire codebase.
