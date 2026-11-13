# ChessMove

## Mandatory

🔴  README.md

🟢  Web App with Frontend/Backend/Database

⏳  Git with meaningful commit messages and from all members

🟢  Containerization solution

⏳  Compatible with Google Chrome

🔴  No warning or errors in the browser console

🟢  Privacy Policy and Terms of Service

⏳  Clear and responsive frontend

🟢  CSS framework

🟢  Credentials in a .env file ignored by git and .env.example provided

🟢  User management system with email and hashed password

⏳  User input validated in both the frontend and backend

⏳  Any connection to the backend must use HTTPS

## Modules

### Major

🟢  Use a framework for both the frontend and backend.
-   Use a frontend framework (React, Vue, Angular, Svelte, etc.).
-   Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails,
etc.).

⏳  Implement real-time features using WebSockets or similar technology.
-   Real-time updates across clients.
-   Handle connection/disconnection gracefully.
-   Efficient message broadcasting.

⏳  Allow users to interact with other users.
-   A basic chat system (send/receive messages between users).
-   A profile system (view user information).
-   A friends system (add/remove friends, see friends list).

⏳  Standard user management and authentication.
-   Users can update their profile information.
-   Users can upload an avatar (with a default avatar if none provided).
-   Users can add other users as friends and see their online status.
-   Users have a profile page displaying their information.

⏳  Implement a complete web-based game where users can play against each
-   The game can be real-time multiplayer (e.g., Pong, Chess, Tic-Tac-Toe, Card
games, etc.).
-   Players must be able to play live matches.
-   The game must have clear rules and win/loss conditions.
-   The game can be 2D or 3D.
other.

🔴  Remote players — Enable two players on separate computers to play the
same game in real-time.
-   Handle network latency and disconnections gracefully.
-   Provide a smooth user experience for remote gameplay.
-   Implement reconnection logic.

### Minor

🟢  Use an ORM for the database.

⏳  Custom-made design system with reusable components, including a proper
color palette, typography, and icons (minimum: 10 reusable components).

⏳  Game statistics and match history (requires a game module).
-   Track user game statistics (wins, losses, ranking, level, etc.).
-   Display match history (1v1 games, dates, results, opponents).
-   Show achievements and progression.
-   Leaderboard integration.

⏳  Support for multiple languages (at least 3 languages).
-   Implement i18n (internationalization) system.
-   At least 3 complete language translations.
-   Language switcher in the UI.
-   All user-facing text must be translatable.

🔴  A gamification system to reward users for their actions.
-   Implement at least 3 of the following: achievements, badges, leaderboards,
XP/level system, daily challenges, rewards
-   System must be persistent (stored in database)
-   Visual feedback for users (notifications, progress bars, etc.)
-   Clear rules and progression mechanics

⏳  Implement spectator mode for games.
-   Allow users to watch ongoing games.
-   Real-time updates for spectators.
-   Optional: spectator chat.

⏳  Implement remote authentication with OAuth 2.0 (Google, GitHub, 42,
etc.).
