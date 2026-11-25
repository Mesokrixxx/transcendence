*This project has been created as part of the 42 curriculum by aflandin, nhoussier, shasinan, ecid.*

# ChessMove

## Description

ChessMove is a real-time chess web application built for the 42 `ft_transcendence` project. It combines a complete chess engine with the social and competitive features of a chess platform: authentication, profiles, friends, chat, live matches, spectating, Elo rankings, statistics and achievements.

## Team Information

| Login | Role | Responsibilities |
| --- | --- | --- |
| `nhoussier` | Product Owner | Initiated the chess project, defined the product direction, provided technical direction, developed the chess engine and tests, statistics/history, i18n architecture, public profile refactor and Docker/TLS/Makefile improvements. |
| `aflandin` | Project Manager / Backend Lead | Backend architecture, authentication/OAuth, game/friends APIs, WebSocket real-time layer, notifications, spectating and gamification backends, containerization and final integration. |
| `ecid` | Frontend Lead / UI-UX | Design system, landing/legal/auth pages, profiles and avatars, play/spectator UI, error pages, responsive layouts, translations and frontend integration. |
| `shasinan` | Frontend Developer | Rankings, chat UI, friends/ranking integration, end-of-game actions and UI/translation/console fixes. |

## Project Management

- Trello for task tracking; GitHub feature branches and pull requests for development and review.
- Work split by domain: backend/real-time (`aflandin`), chess engine/statistics (`nhoussier`), frontend/UI (`ecid`, `shasinan`), with regular integration phases.
- Discord for daily communication; short syncs at milestones and a final bug-fixing/validation phase.

## Technical Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, styled-components, i18next/react-i18next |
| Backend | Node.js, Express 5, TypeScript, `ws`, Zod, bcrypt |
| Database | PostgreSQL 17 with Prisma 7 |
| Uploads | multer + sharp (avatar validation and WebP conversion) |
| Infrastructure | Podman Compose, Nginx HTTPS reverse proxy, OpenSSL local CA |
| Tests and quality | Vitest, Supertest, ESLint, Prettier |

React/Express provide a typed SPA/API split; PostgreSQL/Prisma fits the relational data and supports transactional game updates; WebSockets keep games, chats and presence synchronized; Nginx enforces HTTPS for HTTP and WebSocket traffic.

## Database Schema

PostgreSQL with Prisma. Main models:

- `User`, `Profile`, `Session`: accounts, public profile/avatar, server-side sessions.
- `Game`, `DrawOffer`, `GameInvitation`: match state/result, pending draws and invitations.
- `Chat`, `Message`: private, game and spectator conversations.
- `Badge`, `BadgesOnProfile`, `Achievement`, `UserAchievement`: persistent rewards and progression.

Users have one profile and many sessions/games/messages; each game has two players and two chats; chats group users and messages; badges and achievements use join tables. Friends and blocks are self-referential relations on `User`. Moves are stored as a JSON history and replayed by the chess engine.

## Features List

| Feature | Description | Main contributors |
| --- | --- | --- |
| Authentication | Email/password, bcrypt hashing, sessions, password policy and GitHub OAuth 2.0. | `aflandin`, `ecid`, `nhoussier` |
| Profiles and avatars | Public/own profiles, display names, avatar upload/removal, default avatar and real-time updates. | `ecid`, `aflandin`, `nhoussier` |
| Friends and presence | Requests, accept/decline, remove, block/unblock and live online status. | `aflandin`, `ecid`, `shasinan` |
| Chat and notifications | Private messages, game/spectator chat and real-time game/friend/draw notifications. | `aflandin`, `shasinan`, `ecid` |
| Chess engine | Legal moves, castling, en passant, promotion, checkmate, stalemate, draws, repetition and move rules. | `nhoussier` |
| Online matches | Invitations, move validation, reconnection, resign, draw offers and forced draw claims. | `aflandin`, `ecid`, `nhoussier` |
| Spectator mode | Live game viewing with a read-only board and spectator chat. | `aflandin`, `ecid` |
| Rankings and statistics | Elo leaderboard, match history, streaks, opponent/termination stats and Elo progression. | `shasinan`, `nhoussier`, `ecid` |
| Gamification | Achievements, badges, featured badges and leaderboard progression. | `aflandin`, `ecid`, `nhoussier` |
| Internationalization | English, French and Spanish UI with language switcher and localized errors/notifications. | all team members |
| Design system | Responsive reusable components, palette, typography and icons. | `ecid`, `shasinan` |
| Legal and infrastructure | Privacy/Terms pages, Podman stack, Nginx TLS and environment-based configuration. | `ecid`, `aflandin`, `nhoussier` |

## Modules

### Major modules (2 points each)

| Module | Implementation | Contributors |
| --- | --- | --- |
| Use a framework for both the frontend and backend. | React/TypeScript + Express/TypeScript. | all team members |
| Implement real-time features using WebSockets or similar technology. | `ws` rooms for presence, chat, games and notifications, with reconnection. | `aflandin`, `ecid` |
| Allow users to interact with other users. | Profiles, friends/blocking, private/game/spectator chat. | all team members |
| Standard user management and authentication. | bcrypt, sessions, protected routes, profile editing, avatars and GitHub OAuth. | `aflandin`, `ecid`, `nhoussier` |
| Implement a complete web-based game where users can play against each other. | Full chess rules engine and live matches. | `nhoussier`, `aflandin`, `ecid` |
| Remote players — Enable two players on separate computers to play the same game in real-time. | HTTPS/WebSocket multi-client play, LAN instructions and reconnect logic. | `aflandin`, `ecid`, `nhoussier` |

### Minor modules (1 point each)

| Module | Implementation | Contributors |
| --- | --- | --- |
| Use an ORM for the database. | Prisma 7 with PostgreSQL and typed transactions. | `aflandin`, `nhoussier` |
| Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components). | styled-components library, shared styles and responsive layouts. | `ecid`, `shasinan` |
| Game statistics and match history (requires a game module). | Match history, results, streaks, opponents, terminations and Elo chart. | `nhoussier`, `ecid`, `shasinan` |
| Support for multiple languages (at least 3 languages). | English, French and Spanish catalogs with language switcher. | `nhoussier`, `ecid`, `shasinan`, `aflandin` |
| A gamification system to reward users for their actions. | Persistent achievements, badges and leaderboard integration. | `aflandin`, `ecid`, `nhoussier` |
| Implement spectator mode for games. | Live watch pages, game rooms and spectator chat. | `aflandin`, `ecid` |
| Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.). | GitHub OAuth authorization-code flow with state validation. | `aflandin`, `nhoussier`, `ecid` |

**Total: 19 points** (6 major × 2 + 7 minor × 1). Remote Players and Gamification were completed after the initial tracking checklist. No custom module of choice was used.

## Instructions

**Prerequisites:** Linux or macOS, `git`, `make`, `podman` + `podman-compose`, `openssl`, and Node.js 22+ for local development. Google Chrome is recommended for evaluation.

1. Clone the repository and create the environment file:

   ```bash
   git clone <repository-url>
   cd transcendence
   cp .env.example .env
   ```

2. Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and `DATABASE_URL` in `.env`. GitHub OAuth variables are optional; email/password authentication works without them. Never commit `.env`.

3. Start the stack:

   ```bash
   make
   ```

   This generates the certificates, builds and starts the containers, and applies the Prisma schema.

4. Open `https://localhost:4243` and accept the self-signed certificate warning.

5. GitHub OAuth: see `OAuth.README.md`. LAN play: see `README.LAN.md` and use `https://<host-ip>:4243`.

Useful commands:

```bash
make down      # stop containers
make clean     # remove containers/volumes/images (deletes data)
make re        # recreate the stack

cd chessgame && npm ci && npm test   # chess engine tests
cd backend && npm ci && npm test     # backend tests (DATABASE_URL required)
cd frontend && npm ci && npm run build
```

For local frontend/backend development, use `npm run dev`. The Vite proxy targets the Compose service name `backend`, so adjust `frontend/vite.config.ts` if running outside the Compose network.

## Resources

- 42 `ft_transcendence` subject.
- React, Vite, React Router, styled-components and i18next documentation.
- Express, Prisma, PostgreSQL, `ws` and Zod documentation.
- Nginx, Podman and OpenSSL documentation.
- MDN WebSocket API, OWASP Authentication Cheat Sheet, FIDE Laws of Chess and Chess Programming Wiki.
- Project docs: `frontend/README.frontend.md`, `OAuth.README.md`, `README.LAN.md`.

### AI Usage

AI (GitHub Copilot in VS Code, including agent/chat sessions visible in Git) was used for scaffolding/refactoring TypeScript code, drafting tests, debugging WebSockets/presence, i18n extraction and translations, UI bug fixes and documentation. All AI-assisted changes were reviewed and validated with builds, type checks, linting and tests; authentication, database and chess-rule logic were manually reviewed. No secrets or user data were shared with AI tools.

## Individual Contributions

- **`nhoussier` — Product Owner:** initiated the chess project and technical direction; built the `chessgame` engine and tests (special moves, checkmate, stalemate, draws, repetition, move rules); statistics/history components; i18n architecture; public profile refactor; Docker/TLS/Makefile improvements. *Challenges:* chess-rule edge cases, aligning frontend types with the database, and sharing TLS certificates between containers.
- **`aflandin` — Project Manager / Backend Lead:** backend architecture, authentication/OAuth, game/friends APIs, WebSocket presence/rooms/notifications, spectating and gamification backends, containerization and final integration. *Challenges:* real-time consistency across reconnects and game-end events that omit player relations.
- **`ecid` — Frontend Lead / UI-UX:** design system, landing/legal/auth pages, profiles and avatars, play lobby/online game/spectator UI, error pages, responsive layouts and translations. *Challenges:* real-time UI synchronization, avatar upload/preview, and integrating parallel branches.
- **`shasinan` — Frontend Developer:** rankings/search, chat UI and backend integration, friends/ranking integration, end-of-game actions and translation/avatar/console fixes. *Challenges:* evolving backend contracts and stabilizing the UI after merges.

## Known Limitations

- Local deployment uses self-signed certificates; browsers show a warning until the local CA is trusted.
- GitHub OAuth requires external OAuth credentials; without them only email/password authentication works.
- Chess clocks/time controls are not exposed in the UI, despite the `TIMEFORFEIT` enum.
- Some backend tests require a disposable PostgreSQL database via `DATABASE_URL`.

## Credits and License

- Chess piece artwork: [Kosal by Philatype](https://github.com/philatype/kosal), CC BY 4.0.
- Educational 42 project; no standalone open-source license file is provided.
