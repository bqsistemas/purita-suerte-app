# Purita Suerte MVP0 Specification

**Project**: Purita Suerte (Multi-tenant Raffle & Gamified Giveaways Platform)  
**Milestone**: MVP0 (Authentication Foundation)  
**Status**: Specification Complete  
**Version**: 1.0.0  

---

## Overview

MVP0 is the foundational shell for Purita Suerte, establishing the app structure, authentication flow, and post-login navigation. This milestone focuses entirely on enabling users to sign in and access the app; no raffle, gamification, or payments logic is included.

### Goal
Build a minimal, type-safe React Native app with:
- Clear separation between authentication and app states
- Session persistence across app restarts
- A working demo login flow with error handling
- Clean architecture enabling future feature additions

---

## User Stories & Acceptance Criteria

### Story 1: User Opens App and Sees Login
**As a** user  
**I want to** see a login screen when I open the app  
**So that** I can authenticate before accessing the app

**Acceptance Criteria**:
- When the app opens and no session token exists, the Login screen is shown
- Login screen displays email and password input fields
- Login screen displays a "Sign In" button
- Demo credentials are visible as a hint (for testing)

**Given** the user is signed out  
**When** the app opens  
**Then** the Login screen is displayed

---

### Story 2: User Logs In Successfully
**As a** user  
**I want to** enter my credentials and sign in  
**So that** I can access the post-login app experience

**Acceptance Criteria**:
- User can enter email and password
- User can tap "Sign In" button
- On successful login, the app navigates to the Home screen
- Home screen displays the message "Hola mundo"
- Home screen shows the signed-in user's profile info (name, email, tenant)
- A loading indicator appears during sign-in
- After sign-in, the user's token is persisted securely

**Given** the user enters valid credentials  
**When** they press "Sign In"  
**Then** they are redirected to Home and see "Hola mundo"

---

### Story 3: User Sees Error on Invalid Credentials
**As a** user  
**I want to** receive a clear error message when my credentials are wrong  
**So that** I know what went wrong and can try again

**Acceptance Criteria**:
- Invalid email/password combination shows an error message
- Error message is user-friendly and non-technical
- User remains on the Login screen
- User can retry with different credentials
- Error message is cleared when user modifies inputs (optional)

**Given** the user enters invalid credentials  
**When** they press "Sign In"  
**Then** an error message is shown and they stay on Login

---

### Story 4: User Remains Logged In Across Sessions
**As a** user  
**I want to** remain logged in when I close and reopen the app  
**So that** I don't have to sign in every time

**Acceptance Criteria**:
- Auth token is stored securely (encrypted) on device
- On app startup, the token is restored from secure storage
- If token exists, Home screen is shown directly (no Login)
- If token is invalid or expired, user is directed to Login
- User can manually sign out from Home screen

**Given** the user is signed in  
**When** they close and reopen the app (same session)  
**Then** they land on Home without seeing Login

---

## Functional Requirements

### Login Screen
- **Fields**: Email, Password (masked)
- **Validation**: 
  - Email must be valid (email format)
  - Password must not be empty
  - Validation errors shown inline
- **Button**: "Sign In" button disabled until both fields are valid
- **Loading State**: Button shows spinner during sign-in; inputs disabled
- **Error State**: Error message displayed above inputs or as toast
- **Accessibility**: All inputs have accessible labels; touch targets ≥44pt

### Home Screen
- **Welcome Message**: Display "Hola mundo" (Spanish for "Hello world")
- **User Profile**: Show user's displayName, email, and tenantId
- **Sign Out**: Button to sign out and return to Login

### Authentication Flow
1. User opens app
2. Session restoration check (async, with loading state)
3. If token exists → navigate to Home
4. If no token → show Login
5. User enters credentials and taps "Sign In"
6. Login request sent to mock backend (500ms latency simulated)
7. On success: token stored + navigate to Home
8. On failure: error message displayed, user remains on Login
9. User taps "Sign Out" on Home → token cleared + navigate to Login

### Session Persistence
- Auth token stored in **Expo Secure Store** (encrypted, platform-specific)
- Token restored on app startup
- Token cleared on sign-out
- No token = redirect to Login

---

## Mock Backend Specification

### Login Endpoint (Mocked)
**Endpoint**: `POST /auth/login` (simulated, not real)

**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-001",
    "displayName": "Test User",
    "email": "user@example.com",
    "tenantId": "tenant-001"
  }
}
```

**Response (Failure)**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### Mock Users
```
User 1:
  email: user@example.com
  password: password123
  response: success + valid user + token

User 2:
  email: admin@example.com
  password: admin123
  response: success + valid admin user + token

Invalid Credentials:
  email: (any other)
  password: (any)
  response: INVALID_CREDENTIALS error
```

### Mock Implementation Details
- Deterministic responses based on email/password
- 500ms simulated network latency
- Mock JWT token generated (structure only, not cryptographically signed)
- Easily replaced with real API call: `apiClient.post('/auth/login', request)`

---

## Non-Functional Requirements

### Performance
- Initial app load: <3s
- Login request: <1s (with 500ms mock latency)
- Session restoration: <500ms
- Bundle size: <2.5MB (Android), <2MB (iOS)

### Accessibility
- All interactive elements labeled (ARIA labels or accessibility props)
- Touch targets ≥44pt (minimum)
- Color not sole indicator of state (paired with icons/text)
- Error messages announced via accessibility layer

### Security
- Auth tokens stored encrypted (Expo Secure Store)
- Tokens never logged or exposed in errors
- All API requests include `Authorization: Bearer <token>` header
- 401 responses trigger sign-out
- No PII (email, password) cached in logs

### Testability
- Mock backend easily replaced with real API
- UI testable without network calls
- State (Zustand) mockable in tests
- Clear separation: UI layer ↔ business logic ↔ API layer

### Maintainability
- TypeScript strict mode (0 `any` types)
- Feature-sliced architecture
- Clear dependency directions (shared ← features ← app)
- Comprehensive test coverage (≥80%)

---

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Platform** | React Native | 0.73.0 |
| **Runtime** | Expo | 50.0.0 |
| **Language** | TypeScript | 5.3.3 |
| **UI Framework** | React | 18.2.0 |
| **Navigation** | React Navigation | 6.1.8 |
| **State** | Zustand | 4.4.1 |
| **Server State** | TanStack Query | 5.25.0 |
| **Forms** | react-hook-form | 7.48.0 |
| **Validation** | Zod | 3.22.4 |
| **HTTP** | Axios | 1.6.2 |
| **Storage** | Expo Secure Store | 13.0.0 |
| **Testing** | Jest | 29.7.0 |
| **Testing** | React Native Testing Library | 12.4.0 |
| **Linting** | ESLint | 8.56.0 |
| **Code Style** | Prettier | 3.1.1 |

---

## Project Structure

```
src/
├── app/                          # Composition root
│   ├── navigation/               # Navigation stacks (Auth, App)
│   │   ├── types.ts             # Navigation type definitions
│   │   └── index.ts             # RootNavigator component
│   ├── providers.tsx             # QueryClientProvider
│   └── index.tsx                 # Root App component
│
├── features/                     # Feature modules
│   ├── auth/                     # Authentication feature
│   │   ├── ui/                   # React components
│   │   │   ├── LoginScreen.tsx
│   │   │   └── __tests__/
│   │   ├── model/                # State & types
│   │   │   ├── authStore.ts
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   ├── api/                  # API & contracts
│   │   │   ├── contracts.ts      # Zod schemas, mock login
│   │   │   └── __tests__/
│   │   ├── hooks/                # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   └── __tests__/
│   │   └── index.ts              # Public API
│   │
│   └── home/                     # Home feature (post-login)
│       ├── ui/
│       │   ├── HomeScreen.tsx
│       │   └── __tests__/
│       └── index.ts
│
├── shared/                       # Shared code
│   ├── api/                      # HTTP client
│   │   ├── client.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── types/                    # Global types
│   │   ├── result.ts             # Result pattern
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── validation/               # Shared validators
│   ├── utils/                    # Utilities
│   └── ui/                       # Design system (future)
│
└── index.tsx                     # Entry point
```

---

## Architecture Principles

### 1. Feature-Sliced Design
Each feature module is autonomous and includes:
- `ui/` - React components (presentational & container)
- `model/` - State management (Zustand stores)
- `api/` - API client, contracts, mocked endpoints
- `hooks/` - Custom hooks
- `index.ts` - Public API (exports only what's needed)

**Dependencies**: Shared layer → features → app root  
**No**: Cross-feature imports (use shared or public APIs)  
**No**: Circular imports

### 2. Result Pattern
All async operations return `Result<T>` instead of throwing:
```typescript
type Result<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
};
```

**Benefits**: Explicit error handling, testable, no surprise throws

### 3. State Management Strategy
- **Client State** (Zustand): Auth, UI preferences, user session
- **Server State** (TanStack Query): API responses, cached data
- **Component State** (`useState`): Form inputs, temporary UI state

**Never duplicate** data between systems; single source of truth.

### 4. Type Safety
- TypeScript strict mode enabled
- No `any` types (except documented escapes)
- Type coverage >85%
- Generic types include constraints

### 5. Testing Strategy
- **Unit Tests**: Pure functions, utilities, validators (Jest)
- **Component Tests**: UI, user interactions (React Native Testing Library)
- **Integration Tests**: Multi-component flows, API mocking
- **Coverage Target**: ≥80% across all layers

---

## Compliance with Constitution

This MVP0 implementation adheres to the **Purita Suerte Constitution** (v1.0.0):

| Principle | Implementation |
|-----------|----------------|
| **Type Safety** | Strict TypeScript, no `any` types |
| **Test-First** | Tests written before implementation; Jest + React Native Testing Library |
| **Feature-Sliced Architecture** | Feature modules with UI, model, api, hooks |
| **Zustand State** | useAuthStore manages client state |
| **TanStack Query** | Setup for future server state queries |
| **React Navigation** | Auth & App stacks with conditional rendering |
| **Forms + Zod** | LoginRequestSchema validates inputs |
| **Axios Networking** | API client with interceptors & error handling |
| **Result Pattern** | standardized error objects (not throws) |
| **Security** | Tokens in Expo Secure Store, no logging of PII |
| **Accessibility** | Labels, touch targets ≥44pt, color + text/icons |
| **Error States** | Clear, actionable error messages |
| **Loading States** | Spinners, disabled inputs during async ops |

---

## Acceptance Criteria Summary

### Pre-Launch Checklist

- [ ] App opens and shows Login screen (no token)
- [ ] User can enter email and password
- [ ] "Sign In" button disabled until fields valid
- [ ] Valid credentials (user@example.com / password123) → Home screen
- [ ] Invalid credentials → Error message, stay on Login
- [ ] Loading state shows during sign-in
- [ ] Home screen displays "Hola mundo"
- [ ] Home screen shows user profile (name, email, tenant)
- [ ] Sign Out button on Home → redirects to Login
- [ ] Reopen app during same session → Home screen (no Login)
- [ ] All inputs have accessible labels
- [ ] TypeScript compiles (0 errors)
- [ ] ESLint passes (0 errors)
- [ ] Jest tests pass (≥80% coverage)
- [ ] Credentials masked in password field
- [ ] Error messages non-technical and helpful
- [ ] Touch targets ≥44pt

---

## Out of Scope (MVP0)

- Real backend integration (use mock)
- Raffle creation/joining
- Gamification (mini-games, streaks)
- Payments/subscriptions
- Push notifications
- Admin/moderation panel
- Analytics
- Multi-language i18n (structure only)
- Dark mode
- Deep linking (structure only)

---

## Future Enhancements (Post-MVP0)

1. **Backend Integration**: Replace mockLogin with real API
2. **Raffles Module**: Create, join, browse, draw mechanics
3. **Gamification**: Mini-games, daily streaks, missions, leaderboards
4. **Payments**: Subscription plans, transactions, revenue splits
5. **Notifications**: Push notifications via Firebase Cloud Messaging
6. **Admin Tools**: Fraud detection, moderation, audit logs
7. **Analytics**: Event tracking, funnels, cohort analysis
8. **Offline Support**: Queue mutations, indicate offline status
9. **Internationalization**: Multi-language support
10. **Performance**: Code splitting, lazy loading, bundle optimization

---

## References

- [Purita Suerte Constitution](../../.specify/memory/constitution.md)
- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
