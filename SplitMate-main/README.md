# SplitMate

SplitMate is a full-stack expense-sharing app for friends, roommates, and small teams. Users can create groups, add shared expenses, split costs fairly, see pending balances, settle up, and review recent activity in a single place.

## What the app does

SplitMate helps people manage shared spending without messy spreadsheets. A user can sign up and sign in, create a group, invite or add members, record expenses, choose a split method, and immediately see who owes what. The app also provides a dashboard view with recent activity, recent expenses, and pending balances.

## How to run it

The following steps were validated from a clean clone in this workspace.

### 1) Prerequisites

- Node.js 18+ recommended
- MongoDB instance (local MongoDB or MongoDB Atlas)

### 2) Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder with values like:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/splitmate
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Then start the API:

```bash
npm run dev
```

### 3) Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite app should open on the local Vite URL, usually `http://localhost:5173`.

### 4) Verify the install

Backend tests:

```bash
cd backend
npm test
```

Frontend production build:

```bash
cd frontend
npm run build
```

Verified status in this workspace:
- Backend tests: 4/4 passed
- Frontend build: production bundle generated successfully

## Data model

The app uses MongoDB with Mongoose.

### Core collections

- `users`
  - Stores authentication and profile information.
- `groups`
  - Stores group metadata and the group owner.
- `groups.members`
  - Embedded member list inside each group. Each member has a `user` reference and a `role` (`OWNER` or `MEMBER`).
- `expenses`
  - Stores the expense record, its amount, who paid, and its split configuration.
- `expense.splits`
  - Embedded split lines for each expense.
- `settlements`
  - Stores a recorded transfer from one user to another within a group.
- `balances`
  - Stores pairwise debt balances derived from expenses and settlements.
- `activities`
  - Stores a feed of events such as expense creation, updates, member changes, settlements, and group actions.
- `refreshTokens`
  - Stores hashed refresh tokens, expiry, revocation state, and rotation metadata.

### Relationship overview

```text
User
  ├─ owns many Groups
  ├─ belongs to many Groups via Group.members
  ├─ creates many Expenses
  ├─ has many Settlements
  └─ has many RefreshTokens

Group
  ├─ has many members
  ├─ has many Expenses
  ├─ has many Settlements
  └─ has many Activities

Expense
  ├─ belongs to one Group
  ├─ paid by one User
  ├─ created by one User
  └─ has many Splits

Split
  └─ belongs to one Expense and one User

Settlement
  ├─ belongs to one Group
  ├─ from one User
  └─ to one User
```

## Money handling and rounding

The app currently stores monetary values as standard JavaScript numbers in the Mongo documents. The code does not use integer cents/paisa storage yet; instead it keeps values in the app’s currency units and rounds to two decimal places before saving and when updating balances.

### Current rule

- Amounts are rounded to two decimal places with `toFixed(2)` before persistence and balance updates.
- Equal splits are computed as equal shares rounded to two decimals.
- Exact and percentage-based splits are validated and then stored using the same two-decimal rounding behavior.

### Why this approach

The implementation prioritizes clarity and correctness for a first production-ready version while avoiding floating-point drift as much as possible. The balance logic is built around pairwise debt updates so that balances stay consistent after expenses and settlements.

### Important limitation

This is not yet a full cents/paisa-safe integer accounting system. For very edge-case uneven splits, a small rounding residual can appear. That is a known improvement opportunity.

## Stack choice and why

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- Cookie-based auth for refresh-token flow
- Socket.IO scaffolding for future realtime features

Why:
- Fast to build and easy to deploy
- Mongoose makes the document model simple and readable
- JWT + cookies fit a browser-first SPA well

### Frontend
- React + Vite
- Redux Toolkit for state
- Axios for API requests
- Tailwind CSS for styling
- Framer Motion for polished transitions

Why:
- Vite gives a fast development loop
- React + Redux keeps state predictable
- Tailwind makes the UI easier to evolve quickly

## Refresh-token flow

The refresh-token flow is implemented as follows:

1. On signup or login, the backend creates an access token and a refresh token.
2. The refresh token is hashed before being stored in the `refreshTokens` collection.
3. The backend sets both tokens in secure HTTP-only cookies.
4. The frontend also stores the access token in local storage for request authorization.
5. When the client calls the refresh endpoint, the backend:
   - reads the refresh token from the cookie or request body,
   - verifies the JWT,
   - checks that the hashed token still exists in the database and has not expired or been revoked,
   - issues a new access token and a new refresh token,
   - marks the old refresh token as replaced and revoked,
   - stores the new refresh token and sets new cookies.
6. If the refresh token expires or becomes invalid, the user must log in again.

## WebSocket setup

The repository contains socket-related files under `backend/src/sockets/`, but the live socket implementation is not fully wired end-to-end in the current codebase. The intended design is:

- Authenticate the socket with the same JWT-based identity used by the REST API.
- Join a group-specific room for each connected user.
- Emit events only to members of the relevant group room.
- Rejoin rooms after disconnect/reconnect so the client can recover its live activity stream.

In the current implementation, the socket layer is still scaffolded rather than fully active. That is one of the main incomplete areas of the project.

## What was hard and how it was worked through

The hardest part was making the money and balance logic reliable. Shared expenses can create complex debt relationships, especially after edits and settlements. The solution was to keep the balance model simple and derive balances from the expense and settlement records in a consistent way, while also using transactions for expense updates so that balance updates and activity logging stay consistent.

Another difficult area was making the app feel polished while keeping the architecture understandable. That was handled by keeping the backend service-oriented and the frontend route-based, with a single shared state flow for the app shell and theme.

## Known issues / incomplete work

- Socket events are not fully implemented yet.
- The money model is still based on decimal numbers rather than integer cents/paisa.
- Group deletion does not yet cascade related expense, settlement, and activity records.
- The app has strong core features, but it still needs more guardrails around validation, error UX, and edge-case accounting.
- Test coverage is still focused on authentication and should expand to expenses, groups, settlements, and balances.

## What I would improve with more time

- Finish the real-time socket layer end to end.
- Move money storage to integer cents/paisa for stricter accounting.
- Add stronger automated tests for every domain service.
- Add better pagination, search, and filtering for groups and activity.
- Add notifications, invite flow, and richer admin controls.
- Containerize the app with Docker and add production deployment guidance.

## Where AI was used and what I learned

AI was used to help with:
- scaffolding the frontend experience and route structure,
- wiring the authentication and dashboard flow,
- polishing the landing page and responsive UI,
- debugging the theme and state propagation,
- drafting and refining this README.

What was learned:
- It is worth centralizing shared UI state early instead of patching it later.
- Money logic needs to be explicit and documented from the beginning to avoid subtle bugs.
- A clear service-oriented backend structure makes it much easier to evolve the app without breaking core flows.
