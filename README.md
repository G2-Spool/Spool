# Spool Frontend

The frontend application for Spool - an AI-powered learning companion that personalizes education through voice-enabled interactions.

## Repository Structure

This repository contains the Next.js frontend application. The backend services have been moved to a separate repository for better separation of concerns and independent deployment pipelines.

- **Frontend (this repo)**: Next.js app deployed via AWS Amplify
- **Backend**: [spool-backend](https://github.com/your-org/spool-backend) - Voice interview service and infrastructure deployed via AWS CodeBuild/ECS

## Features

- 🎤 Voice-enabled onboarding flow
- 📚 Personalized learning dashboard
- 🎯 Interest-based content recommendations
- 📊 Progress tracking and visualization
- 🌙 Dark mode support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React hooks + Local storage
- **Voice Integration**: Custom WebSocket hook for real-time audio

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/spool-frontend.git
   cd spool-frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend API URL
   ```

4. **Run the development server**:
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Environment Variables

Create a `.env.local` file with:

```env
# Backend API URL (local development)
NEXT_PUBLIC_INTERVIEW_API_URL=http://localhost:8080

# For production (update after backend deployment)
# NEXT_PUBLIC_INTERVIEW_API_URL=https://your-alb-url.amazonaws.com/interview
```

## Voice Interview Integration

The application includes a voice interview feature for onboarding:

1. **Start Voice Interview**: Click the microphone button in the onboarding flow
2. **Grant Permissions**: Allow microphone access when prompted
3. **Speak Naturally**: Talk about your interests and hobbies
4. **Real-time Detection**: See interests detected in real-time
5. **Manual Addition**: You can also type interests manually

The voice integration uses:
- WebSocket connection to the backend interview service
- Real-time audio streaming (16-bit PCM at 16kHz)
- Speech-to-text and text-to-speech processing
- GPT-4 powered conversation flow

## Deployment

The frontend is deployed using AWS Amplify:

1. **Connect Repository**: Link your GitHub repo to AWS Amplify
2. **Configure Build**: Amplify will detect Next.js automatically
3. **Set Environment Variables**: Add `NEXT_PUBLIC_INTERVIEW_API_URL` in Amplify console
4. **Deploy**: Push to main branch triggers automatic deployment

The `amplify.yml` file is already configured for pnpm and Next.js builds.

## Project Structure

```
spool-frontend/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── atoms/             # Basic UI components
│   ├── molecules/         # Composite components
│   ├── organisms/         # Complex components
│   ├── pages/            # Page-level components
│   └── ui/               # Shadcn UI components
├── hooks/                 # Custom React hooks
│   └── use-voice-interview.ts  # Voice interview WebSocket hook
├── lib/                   # Utility functions
├── public/               # Static assets
└── styles/              # Global styles
```

## Development

### Component Architecture

Following atomic design principles:
- **Atoms**: Basic building blocks (buttons, inputs)
- **Molecules**: Simple component groups
- **Organisms**: Complex UI sections
- **Templates**: Page layouts
- **Pages**: Complete views

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- Proper error boundaries

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Repositories

- [spool-backend](https://github.com/your-org/spool-backend) - Backend services and infrastructure

## License

[Your License Here] 