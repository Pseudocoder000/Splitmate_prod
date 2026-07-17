# SplitMate — Phase 1 Plan

## Objective
Phase 1 establishes the engineering blueprint for SplitMate before implementation begins. The goal is to make the product robust, secure, and easy to extend while keeping the solution simple enough to explain and debug during development.

## Files created or modified in this phase
- [REQUIREMENTS_CHECKLIST.md](../REQUIREMENTS_CHECKLIST.md)
- [docs/phase1-plan.md](phase1-plan.md)

## 1. Recommended folder structure

### Backend
```text
server/
  src/
    config/
      env.js
      db.js
      cors.js
    middleware/
      auth.js
      authorize.js
      errorHandler.js
      validate.js
    models/
      User.js
      Group.js
      Membership.js
      Expense.js
      ExpenseSplit.js
      Settlement.js
      ActivityLog.js
      RefreshToken.js
    services/
      auth.service.js
      group.service.js
      expense.service.js
      balance.service.js
      settlement.service.js
      activity.service.js
      socket.service.js
    controllers/
      auth.controller.js
      groups.controller.js
      expenses.controller.js
      settlements.controller.js
      history.controller.js
      dashboard.controller.js
    routes/
      auth.routes.js
      groups.routes.js
      expenses.routes.js
      settlements.routes.js
      history.routes.js
      dashboard.routes.js
    utils/
      response.js
      errors.js
      money.js
      pagination.js
      crypto.js
    sockets/
      index.js
    app.js
    server.js
  seed/
    seed.js
  tests/
    auth.test.js
    expenses.test.js
    balance.test.js
    authorization.test.js
```

### Frontend
```text
client/
  src/
    api/
      client.js
      auth.js
      groups.js
      expenses.js
      settlements.js
      history.js
      dashboard.js
    components/
      common/
      layout/
      forms/
      cards/
    pages/
      LoginPage.jsx
      SignupPage.jsx
      DashboardPage.jsx
      GroupsPage.jsx
      GroupPage.jsx
      CreateGroupPage.jsx
      PersonalHistoryPage.jsx
    hooks/
      useAuth.js
      useSocket.js
    stores/
      authStore.js
    routes/
      AppRouter.jsx
      ProtectedRoute.jsx
    styles/
      index.css
    main.jsx
    App.jsx
```

## 2. MongoDB data model

### User
```js
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Group
```js
{
  _id: ObjectId,
  name: String,
  description: String,
  ownerId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Membership
```js
{
  _id: ObjectId,
  groupId: ObjectId,
  userId: ObjectId,
  role: 'owner' | 'member',
  joinedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense
```js
{
  _id: ObjectId,
  groupId: ObjectId,
  description: String,
  amountCents: Number,
  payerId: ObjectId,
  expenseDate: Date,
  createdById: ObjectId,
  splitType: 'equal' | 'exact',
  createdAt: Date,
  updatedAt: Date
}
```

### ExpenseSplit
```js
{
  _id: ObjectId,
  expenseId: ObjectId,
  memberId: ObjectId,
  shareCents: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Settlement
```js
{
  _id: ObjectId,
  groupId: ObjectId,
  senderId: ObjectId,
  receiverId: ObjectId,
  amountCents: Number,
  note: String,
  createdById: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### ActivityLog
```js
{
  _id: ObjectId,
  groupId: ObjectId,
  actorId: ObjectId,
  type: 'group_created' | 'member_added' | 'member_removed' | 'expense_added' | 'expense_updated' | 'expense_deleted' | 'settlement_created',
  message: String,
  metadata: Object,
  createdAt: Date
}
```

### RefreshToken
```js
{
  _id: ObjectId,
  userId: ObjectId,
  tokenHash: String,
  expiresAt: Date,
  revokedAt: Date | null,
  replacedByTokenHash: String | null,
  createdAt: Date
}
```

## 3. Relationships between entities
- One User can own many Groups.
- One User can belong to many Groups via Membership.
- One Group has many Memberships.
- One Group has many Expenses.
- One Expense has many ExpenseSplits.
- One Group has many Settlements.
- One Group has many ActivityLogs.
- One User can have many RefreshTokens, but only active ones should remain valid.

## 4. Embedded vs separate collections
### Recommendation
- Use separate collections for Membership and ExpenseSplit.
- Use separate collections for Settlement and ActivityLog.
- Keep Group and User as top-level documents.

### Why
- Memberships are a classic many-to-many relationship and need efficient queries by both user and group.
- Expense splits are independent records that may be updated, deleted, and queried separately.
- Separate collections make authorization, balance recalculation, pagination, and deletion cleaner.
- Embedding every split into the Expense document would make updates and large expense histories harder to maintain.

## 5. API endpoint design

### Authentication
- POST /auth/signup
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- GET /auth/me

### Groups
- GET /groups
- POST /groups
- GET /groups/:groupId
- POST /groups/:groupId/members
- DELETE /groups/:groupId/members/:userId
- DELETE /groups/:groupId

### Expenses
- GET /groups/:groupId/expenses?page=1&limit=20&sortBy=expenseDate&order=desc
- POST /groups/:groupId/expenses
- PATCH /groups/:groupId/expenses/:expenseId
- DELETE /groups/:groupId/expenses/:expenseId

### Balances and suggestions
- GET /groups/:groupId/balances
- GET /groups/:groupId/debts

### Settlements
- GET /groups/:groupId/settlements
- POST /groups/:groupId/settlements

### Activity and history
- GET /groups/:groupId/activity?page=1&limit=20
- GET /users/me/history?page=1&limit=20

### Dashboard
- GET /dashboard

## 6. Authentication and refresh-token architecture
### Recommended approach
- Use bcrypt to hash passwords.
- Issue short-lived JWT access tokens (for example 15 minutes).
- Issue longer-lived refresh tokens (for example 7 days or 30 days).
- Store refresh-token hashes in the database and rotate them on use.

### Flow
1. User logs in.
2. Server issues access token and refresh token.
3. Refresh token is stored hashed in RefreshToken collection.
4. On refresh, validate the old token, revoke it, and issue a new one.
5. On logout, revoke all valid refresh tokens for the user.

### Token storage
- Prefer httpOnly, Secure cookies for both access and refresh tokens.
- Trade-off: cookies are safer against XSS, but the setup is slightly more involved than storing tokens in localStorage.
- The frontend should use Axios interceptors to automatically retry the original request after a refresh.
- Use a small in-memory refresh lock to avoid duplicate simultaneous refresh calls.

## 7. Authorization strategy
- Every protected route must verify JWT and load the authenticated user.
- Group resources must verify membership on the backend.
- Only the group owner may remove members or delete the group.
- Only the expense creator or group owner may modify or delete an expense.
- Settlement creation must verify that sender and receiver belong to the group and that the balance is valid.
- Any unauthorized request should return HTTP 401 or 403 with a consistent error structure.

## 8. Money storage and rounding strategy
- Store all monetary values as integer cents/paisa in MongoDB.
- Never use floating-point arithmetic.
- For equal splits:
  - baseShare = Math.floor(totalAmount / participantCount)
  - remainder = totalAmount % participantCount
  - assign baseShare to each participant
  - distribute one extra cent/paisa to the first remainder participants in deterministic order
- This guarantees the total exactly equals the original amount.
- The README should document this rule clearly.

## 9. Balance calculation algorithm
For every expense:
- The payer receives credit for the full amount.
- Each participant is debited by their share.
- Net balance for each user is:
  - totalPaid - totalShare + settlementAdjustments

### Deterministic rules
- Use integer cents throughout.
- Recalculate balances from stored expenses, expense splits, and settlements each time, or cache a derived view that is rebuilt after mutations.
- For a simple and reliable implementation, recalculate from source data on each balance request.

## 10. Debt simplification algorithm
Use a greedy two-pointer style algorithm:
- Collect all positive balances (creditors) and negative balances (debtors).
- Match the largest debtor with the largest creditor.
- Transfer the smaller of the two amounts.
- Continue until all balances are zero.

### Guarantees
- Total credits and debts remain consistent.
- Zero balances are excluded.
- The result is deterministic based on sorted balances.

## 11. Settlement model
A settlement represents a payment from one group member to another.

### Validation rules
- Amount must be positive.
- Sender and receiver must be different.
- Both users must be group members.
- The settlement direction must be supported by outstanding balances.
- Settlement amount cannot exceed the valid outstanding debt.

### Impact
- Settlements adjust the net balance calculation and should be included in balance and history views.

## 12. Activity logging architecture
Activity logs should be written for:
- Group created
- Member added
- Member removed
- Expense added
- Expense edited
- Expense deleted
- Settlement recorded

### Design notes
- Store enough metadata to render a meaningful message even if referenced entities are later deleted.
- Use a single ActivityLog collection with indexed queries by group and date.
- Create activity entries transactionally when feasible.

## 13. WebSocket authentication and room scoping
### Authentication
- Authenticate Socket.io connections using the JWT access token from the handshake.
- Reject unauthenticated connections.

### Room strategy
- Join each user to a private room such as `user:<userId>`.
- Join each connected client to group rooms such as `group:<groupId>` for groups they belong to.
- Emit invalidation events rather than sending full financial state unless the payload is small and safe.

### Client behavior
- On connect, join group rooms for the current user’s memberships.
- On reconnect, rejoin the rooms and refetch authoritative server state.
- Use events like `expense:created`, `expense:updated`, `expense:deleted`, `settlement:created`, `member:added`, `member:removed`, `group:balances-updated`, `user:dashboard-updated`, and `activity:created`.

## 14. Frontend state-management and server-state strategy
- Use TanStack Query for server state, caching, and invalidation.
- Use Axios interceptors for authentication and automatic refresh retry.
- Use Zustand only if needed for global auth state, but keep it lightweight.
- The app should treat the backend as the single source of truth and use WebSocket events to invalidate or refetch data rather than duplicating all financial logic in the UI.

## 15. Error handling strategy
- Use centralized error middleware in Express.
- Return a consistent response shape such as:
  - success: boolean
  - data: object | null
  - error: { message, details, code }
- Validation errors should be descriptive and field-specific.
- Authorization errors should return 403.
- Authentication errors should return 401.

## 16. Development phases in exact order
1. Phase 1 — Architecture, data model, folder structure, environment configuration.
2. Phase 2 — User model, authentication, JWT access tokens, refresh tokens, logout, auth middleware.
3. Phase 3 — Groups and memberships with authorization.
4. Phase 4 — Expense models, equal splitting, exact splitting, validation, pagination, sorting.
5. Phase 5 — Balance calculation and debt simplification.
6. Phase 6 — Settlements.
7. Phase 7 — Activity logging and personal history.
8. Phase 8 — Authenticated Socket.io setup, group rooms, user rooms, and real-time events.
9. Phase 9 — Frontend authentication, Axios refresh interceptor, routing, and protected pages.
10. Phase 10 — Dashboard and group UI.
11. Phase 11 — Expense, settlement, balance, and activity interfaces.
12. Phase 12 — Socket.io and TanStack Query integration.
13. Phase 13 — Loading, error, empty, validation, and request-progress states.
14. Phase 14 — Seed script, tests, README, cleanup, and final audit.

## 17. Testing strategy
### Critical tests
- Authentication flows
- Equal-split rounding
- Exact-split validation
- Balance calculation correctness
- Debt simplification correctness
- Authorization enforcement
- Member removal when balances are unsettled

### Suggested tooling
- Backend: Vitest or Jest + Supertest
- Frontend: Vitest + React Testing Library

## 18. Seed-data strategy
The seed script should create:
- At least two users
- A shared group
- Multiple expenses with both equal and exact split types
- At least one settlement example
- Enough data to verify balances, debt suggestions, activity logs, and real-time updates

## 19. README documentation checklist
The README should include:
- Project overview
- Features
- Tech stack and rationale
- Architecture summary
- Folder structure
- Data model
- Entity relationships
- Local setup instructions
- Environment variable docs
- Seed instructions
- Money storage strategy
- Equal-split rounding rule
- Balance calculation logic
- Debt simplification logic
- JWT flow and refresh-token flow
- Token storage and security trade-offs
- WebSocket authentication and room scoping
- API endpoint overview
- Authorization rules
- Known limitations and future improvements
- AI usage disclosure

## 20. Major edge cases
- Duplicate membership attempts
- Removing a member with a non-zero balance
- Expense shares that do not sum correctly
- Payer not in the group
- Duplicate expense participants
- Concurrent refresh-token usage
- Reconnecting WebSocket after a disconnect
- Group deletion leaving orphaned documents
- Authorization bypass attempts from the frontend

## Recommendation before implementation
Proceed to Phase 2 only after this architecture is reviewed. The core design is intentionally simple, secure, and aligned with the assignment requirements while keeping the implementation understandable for interviews and future maintenance.
