# MedSafe

A medication management app for patients and their caregivers. Patients track their daily medications, log side effects, and get reminders; caregivers monitor their patients' adherence and intervene when something looks off. An on-device voice + chat assistant lets users ask questions like "did I take my blood-pressure pill today?" and have answers grounded in their own records, never in invented medical advice.

This repository is the senior graduation project of [@ethsmaa](https://github.com/ethsmaa).

## Tech stack

**Backend (`apps/backend`)**
- [Hono](https://hono.dev/) HTTP server
- [tRPC](https://trpc.io/) end-to-end typed API
- [Prisma](https://www.prisma.io/) ORM on PostgreSQL
- [Better Auth](https://www.better-auth.com/) for authentication
- [Google Generative AI](https://ai.google.dev/) (Gemini) for the assistant agent and tool-calling
- [Zod](https://zod.dev/) for schema validation

**Mobile (`apps/mobile`)**
- [Expo](https://expo.dev/) (React Native) with `expo-router`
- [NativeWind](https://www.nativewind.dev/) (Tailwind for React Native)
- [TanStack Query](https://tanstack.com/query) + tRPC client
- `expo-speech` (TTS) and `expo-speech-recognition` (STT) for the voice assistant
- `expo-notifications` for medication reminders
- `react-native-reanimated` for animations

**Tooling**
- [Turborepo](https://turborepo.dev/) + [pnpm](https://pnpm.io/) workspaces
- [Biome](https://biomejs.dev/) for lint and format
- TypeScript everywhere

## Repository layout

```
apps/
  backend/       Hono + tRPC + Prisma server
  mobile/        Expo (React Native) app
packages/
  typescript-config/  Shared tsconfig presets
diagrams/        Architecture and flow diagrams (Excalidraw + PNG/SVG)
reports/         Project reports
```

## Getting started

### Prerequisites
- Node.js 18+
- pnpm 9
- PostgreSQL (locally or via the included `compose.dev.yaml`)
- For mobile: Expo Go on a device, or Xcode / Android Studio

### Install
```sh
pnpm install
```

### Database
Spin up Postgres with Docker Compose:
```sh
docker compose -f compose.dev.yaml up -d
```

Configure `apps/backend/.env.development` (DATABASE_URL, auth secrets, Gemini API key), then:
```sh
pnpm --filter @medsafe/backend db:migrate
```

### Run

Backend and mobile in parallel:
```sh
pnpm dev
```

Or individually:
```sh
pnpm --filter @medsafe/backend dev
pnpm --filter @medsafe/mobile  dev
```

### Other scripts
```sh
pnpm build         # turbo build across the monorepo
pnpm lint          # turbo lint + biome
pnpm check-types   # tsc --noEmit across packages
```

## Architecture

System-level diagrams live under [`diagrams/`](./diagrams):
- `architecture.png` — overall system architecture
- `medication-flow.png` — medication intake / logging flow
- `chat-tool-calling.png` — assistant tool-calling pipeline
- `voice-flow.png` — voice (STT → agent → TTS) pipeline
- `comparison-matrix.png` — comparison with similar apps

## License

This project is currently unlicensed and intended for academic submission. Contact the author before reuse.
