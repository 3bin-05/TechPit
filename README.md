# TECHPIT — Tech Debate & Forum Platform

A high-fidelity tech debate platform where users join topic-based chat rooms, argue tech positions, get graded by peers & AI, and build a public reputation profile.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (Brutalist Design System)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand (Placeholder)
- **Routing**: React Router v6

## Design Aesthetic
**"BRUTALIST CARTOON TERMINAL"**
- High contrast black & white theme
- Heavy 2px-4px borders
- Offset shadows (no blur)
- Monospace typography (Space Mono, JetBrains Mono)
- Bold condensed headings (Bebas Neue)

## Features Implemented
- [x] **Landing Page**: Hero animations, live room ticker mockup.
- [x] **Auth Page**: Split layout Login/Signup with social auth mockups.
- [x] **Feed Page**: Live rooms, starting soon, recently closed, trending tags.
- [x] **Create Room**: Room creation form with live card preview.
- [x] **Debate Room**: Real-time chat layout, participant panel, verdict phase overlay.
- [x] **Forum**: Knowledge base with post cards, voting, and linked debate indicators.
- [x] **Profile**: User reputation, stats, badge shelf, and XP progress.
- [x] **Leaderboard**: Podium for top contributors and ranked list.
- [x] **404 Page**: Custom brutalist error page.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure
- `/src/components/ui`: Base brutalist components (Button, Card, Badge, Input).
- `/src/components/layout`: Main authenticated layout with sidebar/mobile nav.
- `/src/pages`: Individual page implementations.
- `/src/styles`: Tailwind configuration and global CSS.

## Note on Firebase/Cloudinary
The current implementation uses mock data for the UI demonstration. To enable real-time features and image uploads, configure your own Firebase and Cloudinary credentials in the `.env` file (see `TECHPIT_PROJECT_REVIEW.txt` for schema).
