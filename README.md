# Purita Suerte - MVP0: Authentication Foundation

This is the initial MVP0 milestone of Purita Suerte, a raffle & gamified giveaways mobile platform. This release focuses on the foundational app shell with authentication.

## Project Structure

This project follows the **feature-sliced architecture** outlined in the Purita Suerte Constitution:

```
src/
├── app/                          # Composition root & initialization
│   ├── navigation/               # Navigation config & stacks
│   ├── providers.tsx             # QueryClientProvider, theme, i18n
│   └── index.tsx                 # Root entry
├── features/                     # Feature modules (autonomous)
│   ├── auth/                     # Authentication module
│   │   ├── ui/                   # React components (LoginScreen)
│   │   ├── model/                # Zustand store (authStore)
│   │   ├── api/                  # API client & contracts (mock backend)
│   │   ├── hooks/                # Custom hooks (useAuth)
│   │   └── index.ts              # Public API
│   └── home/                     # Home screen module (post-login)
│       ├── ui/                   # React components (HomeScreen)
│       └── index.ts              # Public API
├── shared/                       # Shared, reusable code
│   ├── api/                      # HTTP client, base URL config
│   ├── types/                    # Global types, Result pattern
│   ├── validation/               # Zod schemas
│   └── utils/                    # Pure utilities
└── config/                       # Environment config
```

## Key Features (MVP0)

### Authentication Flow
1. **Login Screen**: User enters email and password
2. **Mocked Backend**: Deterministic mock responses (no real API required)
3. **Session Persistence**: Token stored securely; session restored on app restart
4. **Error Handling**: Clear error messages for invalid credentials

### User Stories Implemented
- ✅ User can open app and see Login screen
- ✅ User enters valid credentials → redirected to Home screen with "Hola mundo"
- ✅ User enters invalid credentials → sees error, stays on Login
- ✅ User reopens app during same session → remains signed in

### Demo Users
```
Email: user@example.com
Password: password123

Email: admin@example.com
Password: admin123
```

## Technology Stack

- **React Native** (0.73.0) with Expo
- **TypeScript** (strict mode)
- **State Management**: Zustand (client state)
- **Server State**: TanStack Query (React Query)
- **Navigation**: React Navigation (native stack)
- **Forms**: react-hook-form + Zod validation
- **Networking**: Axios
- **Storage**: Expo Secure Store (encrypted)
- **Testing**: Jest + React Native Testing Library
- **Linting**: ESLint + TypeScript

## Setup & Running

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm start          # All platforms
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

### Run Tests
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run test:coverage # Coverage report
```

### Build & Type Check
```bash
npm run typecheck  # TypeScript check
npm run lint       # ESLint check
npm run lint:fix   # Auto-fix lint errors
```

## Architecture Decisions

### 1. Result Pattern for Error Handling
All async operations return `Result<T>` instead of throwing errors:
```typescript
interface Result<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}
```

**Why**: Explicit error handling, no surprise throws, easier testing.

### 2. Zustand for Client State
Client state (auth, UI preferences) uses Zustand with devtools:
```typescript
const useAuthStore = create<AuthState>((set, get) => ({...}));
```

**Why**: Minimal boilerplate, excellent DevTools support, direct store updates, no Redux complexity.

### 3. React Query for Server State
API responses cached/managed by TanStack Query:
```typescript
useQuery(['raffles', raffleId], () => fetchRaffle(raffleId));
```

**Why**: Automatic caching, stale management, background refetch, normalized queries.

### 4. Mock Backend (No Real API Required)
Authentication uses deterministic mock responses:
```typescript
export async function mockLogin(request: LoginRequest): Promise<Result<...>> {
  // Simulates 500ms network latency
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Returns success/error based on mock user db
}
```

**Why**: MVP0 focuses on architecture; mock backend enables testing UI flows without server. Easily replaced with real API calls.

### 5. Feature-Sliced Architecture
Each feature (auth, home, raffles) is autonomous:
- `features/auth/ui/` - React components
- `features/auth/model/` - Zustand store
- `features/auth/api/` - API client & contracts
- `features/auth/hooks/` - Custom hooks
- `features/auth/index.ts` - Public API export

**Why**: Clear dependency direction (shared ← features ← app), isolated testing, scalable to many features.

## Dependency Direction Rules

```
app/          ← imports from features/ and shared/
features/<X>/ ← imports from shared/ and other features/ ONLY via index.ts
shared/       ← imports ONLY from shared/ and external deps
```

**No circular imports allowed.** ESLint enforces via `eslint-plugin-import`.

## Testing Strategy

### Unit Tests
- Auth store: `authStore.test.ts`
- API contracts: `contracts.test.ts`
- Result pattern: `result.test.ts`

### Component Tests
- LoginScreen: `LoginScreen.test.tsx`
- HomeScreen: `HomeScreen.test.tsx`

### Test Coverage Requirements
- Unit/component tests: ≥80% coverage
- Critical flows: login, sign out, session restore
- Mock data: deterministic, reproducible

### Run Tests
```bash
npm test                 # Single run
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## Accessibility Features

- All inputs have accessible labels
- Touch targets ≥44pt
- Error states clearly indicated
- Loading states show spinners
- Color paired with icons/text (not sole indicator)

## Security Considerations

### Token Storage
- Auth tokens stored in **Expo Secure Store** (encrypted)
- Never logged or exposed in errors
- Cleared on sign out

### API Security
- All requests include `Authorization: Bearer <token>` header
- 401 responses trigger sign-out + redirect to login
- Network errors logged with context (not PII)

### Secrets Management
- API base URL: env var `EXPO_PUBLIC_API_URL`
- `.env` files NOT committed (use `.env.example`)

## Next Steps (Beyond MVP0)

1. **Backend Integration**: Replace mock login with real API
2. **Raffles Module**: Create, join, manage raffles
3. **Gamification**: Mini-games, daily streaks, missions
4. **Payments**: Subscribe to plans, process transactions
5. **Notifications**: Push notifications (Firebase Cloud Messaging)
6. **Admin Panel**: Fraud detection, moderation, audit trail

## Troubleshooting

### Port Already in Use
```bash
expo start --port 8081
```

### Cache Issues
```bash
npm run prebuild  # Clean rebuild
npm start -- --clear
```

### Secure Store Errors (Physical Device)
Ensure Expo Go app is latest version:
```bash
expo install expo-secure-store
```

## References

- [Purita Suerte Constitution](../../.specify/memory/constitution.md)
- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Query Docs](https://tanstack.com/query/latest)
