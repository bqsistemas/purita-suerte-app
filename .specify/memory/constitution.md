# Purita Suerte Constitution

## Core Principles

### I. Type Safety & Code Quality (NON-NEGOTIABLE)
All code MUST be written in TypeScript with strict mode enabled (`strict: true`). No `any` types permitted except in escape hatches documented with `// @ts-expect-error: <reason>`. Type coverage MUST exceed 85%. All public APIs MUST have explicit return types. Generic types MUST include meaningful constraints. Code reviews MUST reject untyped code.

### II. Test-First Development (NON-NEGOTIABLE)
TDD is mandatory: specifications written → tests authored → tests fail → implementation → tests pass → refactor. Unit test coverage MUST be ≥80% (Jest + React Native Testing Library). Critical user flows MUST have e2e tests (Detox). All feature merges MUST pass: typecheck, lint, unit tests, and integration tests. Skipped or pending tests are forbidden in main branch.

### III. Feature-Sliced Architecture
Code organization MUST follow feature-sliced design. Folder structure: `src/features/<feature>/{ui, model, api, hooks}`, `src/shared/{ui, utils, types, constants}`, `src/app/`. Feature modules are autonomous; no cross-feature imports except via shared layer. Dependency direction is strict: `shared → features → app`; circular imports are prohibited. Each feature MUST export a single public API entry point (`index.ts`).

### IV. Centralized State Management
Client state MUST use Zustand exclusively (no Redux). Server state MUST use TanStack Query (React Query). Store creation MUST follow the pattern: `const useStore = create<State>((set, get) => ({...}))`. Actions MUST be pure; side effects belong in Query hooks. Devtools integration MUST be enabled in development. State slices MUST not exceed 50 lines; break into composable slices if larger.

### V. Form & Data Validation
Forms MUST use `react-hook-form` with Zod schema validation. All user inputs MUST be validated client-side before submission. Zod schemas MUST be collocated with form components or in `shared/validation/`. API contracts MUST be defined as Zod schemas first; OpenAPI specs generated from schemas where backend supports it. Validation errors MUST show inline with clear, user-facing messages. Never silently ignore validation failures.

### VI. Networking & API Contracts
All HTTP networking MUST use Axios (standardized). API client MUST be centralized in `src/shared/api/`. All API responses MUST be validated against Zod schemas before use. Typed contracts (Zod) MUST be used for all endpoints; OpenAPI-first when backend provides OpenAPI specs. Contract versioning MUST follow semantic versioning; breaking changes require new endpoints (e.g., `/v2/raffles`). API client MUST handle retry logic, timeout (30s default), and error normalization.

### VII. Error Handling & Result Pattern
All operations MUST return a standardized error object: `{ success: boolean; data?: T; error?: { code: string; message: string; details?: unknown } }`. Never throw errors in async operations; catch and return error object. Network errors MUST include HTTP status and server message. User-facing errors MUST be localized and non-technical. Validation errors MUST list all failed fields. Development logs MUST include full error stack; production MUST mask sensitive details.

### VIII. Navigation & Platform Consistency
Mobile apps MUST use React Navigation exclusively. Web builds MAY use React Router but ONLY as a separate code path; no React Router in native mobile code. Navigation stacks MUST be defined centrally in `src/app/navigation/`. Deep linking MUST be configured via `react-native-deep-linking`. All routes MUST have type-safe params (TypeScript unions). Platform-specific UI MUST use `Platform.select()` or separate component files (`*.native.ts` / `*.web.ts`).

### IX. Observability & Performance
Structured logging MUST use a consistent JSON schema: `{ timestamp, level, event, context, userId?, tenantId? }`. Crash reporting MUST integrate Sentry with sourcemap uploads. Performance traces MUST track critical user flows: auth, raffle join, payment, draw execution. Bundle size monitoring MUST be automated; breaking change threshold: +50KB. React Native Debugger MUST work out-of-box. All network requests MUST be traced (timing, payload size); slow requests (>3s) MUST be logged with context.

### X. Security & Authentication
Auth tokens MUST be stored in secure storage (React Native Keychain / Secure Enclave). Tokens MUST never be logged or exposed in errors. API requests MUST include `Authorization: Bearer <token>` header; refresh token flow MUST be transparent to components. Multi-tenant isolation MUST be enforced at API layer; frontend MUST never bypass tenant context. PII (emails, phone, SSN) MUST be sanitized in logs. All secrets MUST be managed via environment variables; `.env` files MUST NOT be committed.

### XI. Accessibility & User Experience
All screens MUST handle loading, error, and empty states explicitly. Loading states MUST show skeleton screens (not spinners) for better perceived performance. Error states MUST display actionable messages with retry options. Empty states MUST guide users (e.g., "No raffles yet. Create your first raffle"). Offline support MUST queue mutations; UI MUST indicate offline status. Safe area insets MUST be applied on all screens. Touch targets MUST be ≥44pt. Color MUST never be the sole indicator of state; pair with icons or text.

### XII. Design System & Branding
All UI MUST use the Purita Suerte color palette: `--color-primary: #7e22ce` (purple, primary actions), `--color-secondary: #0ea5e9` (cyan, secondary/links), `--color-accent: #f97316` (orange, alerts/highlights), `--color-dark: #18181b` (near-black, text), `--color-light: #f8fafc` (off-white, backgrounds). Usage rules: primary for CTAs & top-level nav, secondary for links & supporting actions, accent for errors/warnings, dark for body text, light for card backgrounds. Deviations MUST be approved via design review. Typography MUST use consistent scale (base 16px); spacing MUST use 4px grid.

### XIII. Performance & Bundle Optimization
Initial bundle size MUST be <2.5MB (Android) / <2MB (iOS). Code splitting MUST separate feature modules; lazy-load non-critical features. Image MUST be optimized: WebP format, responsive sizes, progressive JPEG fallback. Third-party dependencies MUST be reviewed before inclusion; tree-shaking MUST be verified. React components MUST be memoized if they receive complex props; useMemo/useCallback MUST be applied judiciously (not by default). Runtime performance: Lighthouse score MUST be ≥75 on all key pages.

### XIV. Versioning & Breaking Changes
All public APIs follow SemVer: MAJOR.MINOR.PATCH. MAJOR increments on backward-incompatible changes (removed endpoints, changed schemas, renamed exports). MINOR increments on new features (new endpoints, new optional fields). PATCH increments on bug fixes. Breaking changes MUST include: deprecation notice (1 release minimum), migration guide, changelog entry. All version tags MUST be signed (`git tag -s`). Release notes MUST be auto-generated from conventional commits.

## Architecture

### Folder Structure
```
src/
├── app/                          # Composition root & initialization
│   ├── navigation/               # Navigation config & stacks
│   ├── providers.tsx             # QueryClientProvider, theme, i18n
│   └── index.tsx                 # Root entry
├── features/                     # Feature modules (autonomous)
│   ├── auth/
│   │   ├── ui/                   # React components
│   │   ├── model/                # Zustand stores, types
│   │   ├── api/                  # API client, contracts
│   │   ├── hooks/                # Custom hooks (useAuth, etc.)
│   │   └── index.ts              # Public API
│   ├── raffles/
│   ├── gamification/
│   ├── payments/
│   ├── notifications/
│   └── admin/
├── shared/                       # Shared, reusable code
│   ├── ui/                       # Design system components
│   ├── utils/                    # Pure utilities
│   ├── types/                    # Global types, enums
│   ├── constants/                # App constants
│   ├── api/                      # HTTP client, base URL config
│   ├── validation/               # Zod schemas, validators
│   └── hooks/                    # Cross-cutting hooks (useTheme, etc.)
└── config/                       # Environment, theme config
```

### Dependency Direction
- `app/` imports from `features/` and `shared/`
- `features/<X>/` imports from `shared/` and other `features/` ONLY via public API (`../other-feature/index.ts`)
- `shared/` imports ONLY from `shared/` and external dependencies
- No `features/<X>` importing from `features/<Y>` privately (only via index)
- No circular imports (enforce via ESLint: `eslint-plugin-import`)

### Component Patterns
- Smart components (containers) live in `ui/` and use hooks
- Presentational components live in `ui/` as pure functions
- Custom hooks (useRaffles, useUserProfile) live in `hooks/`
- All hooks MUST be named `use*` and follow React rules
- Hooks MUST NOT call hooks conditionally; use early returns for logic

### API & Server State
- TanStack Query queries defined in `features/<X>/api/queries.ts`
- TanStack Query mutations defined in `features/<X>/api/mutations.ts`
- Zod schemas defined in `features/<X>/api/contracts.ts`
- Query/mutation keys namespaced: `['raffles', raffleId]`, `['user', 'profile']`
- All queries include `staleTime`, `cacheTime`, `retry` config
- Background refetch intervals MUST be explicit (no infinite refetch)

### State Interactions
- Local component state via `useState` (form inputs, UI flags)
- Client state via Zustand (auth, UI preferences, user session)
- Server state via TanStack Query (API responses, cached data)
- Never duplicate data between state systems; use a single source of truth

## Technical Requirements

### Naming Conventions
- Components: PascalCase, suffix with type (e.g., `RaffleCard.tsx`, `useRaffles.ts`)
- Hooks: camelCase, prefix `use` (e.g., `useAuthStore`, `useRaffleQuery`)
- Stores: camelCase, prefix `use` (e.g., `useAuthStore`)
- Files: lowercase with dashes for multi-word (e.g., `raffle-card.tsx`)
- Enum values: UPPER_SNAKE_CASE (e.g., `RaffleStatus.OPEN`, `UserRole.ADMIN`)
- API types/schemas: PascalCase with suffix `Schema` or `Contract` (e.g., `CreateRaffleSchema`)

### Validation & Error Handling
- All Zod schemas MUST have `.describe()` comments for fields
- API error responses MUST include: `{ code: string; message: string; fieldErrors?: { [key]: string[] } }`
- Form validation MUST show per-field errors inline; never a single error toast
- Network timeouts MUST retry automatically (backoff: 100ms, 300ms, 900ms)
- 4xx errors MUST NOT retry; 5xx errors MUST retry (max 3 times)

### Testing Strategy
- Unit tests cover pure functions, utilities, validators
- Component tests cover rendering, user interaction, error states
- Integration tests cover multi-component flows, API calls via mocked queries
- E2E tests (Detox) cover critical user journeys: sign up → join raffle → payment → draw
- Test files colocated: `component.test.tsx` next to `component.tsx`
- Mock data factory functions live in `shared/testing/fixtures/`

### CI Quality Gates
All PRs MUST pass:
- Typecheck: `tsc --noEmit` (0 errors)
- Lint: ESLint (0 errors, no warnings for Sonarqube rules)
- Unit tests: Jest (≥80% coverage, all tests pass)
- Bundle analysis: <2.5MB (Android), <2MB (iOS)
- Security scan: Snyk (0 high/critical vulns)
- No uncommitted changes after formatting

### Observability Configuration
- Sentry: initialized at app launch with environment, release, user context
- Logging: use consistent JSON structure; include request ID for tracing
- Performance traces: mark critical sections with `Sentry.startTransaction()`
- React component profiling: use React DevTools Profiler in development
- Network monitoring: log all requests >1s; log all errors with stack trace

## Business Domains & Modules

### Core Domains
- **Auth**: Sign up, login, password reset, profile management, tenant selection
- **Multi-Tenant**: Creator/community accounts, role-based access (Admin, Moderator, User), tenant isolation
- **Raffles**: Create raffle, browse raffles, join raffle, manage tickets, view draws, claim prizes
- **Gamification**: Mini-games (Flappy Purita), daily streaks, missions, reward tickets, leaderboards
- **Payments**: Subscribe to plans, view entitlements, process payments, handle revenue splits
- **Notifications**: Push notifications (Firebase Cloud Messaging), in-app notification center, user preferences
- **Admin**: Fraud detection, risk controls, audit trail, user moderation, dispute resolution
- **Analytics**: Event tracking, funnels, retention cohorts, revenue analytics

### Feature Flags
All experimental features MUST use feature flags (e.g., LaunchDarkly). New feature MUST be behind flag; flag MUST be removed once 100% rolled out. Flags MUST be evaluated server-side; client receives flag state at startup.

## Governance

This Constitution supersedes all informal practices, Slack discussions, and prior documentation. All engineering decisions MUST comply with these principles.

### Amendment Process
1. Author submits ADR (Architecture Decision Record) in `docs/adrs/`
2. ADR MUST include: context, decision, rationale, consequences, compliance plan
3. Team reviews & approves (at least 2 reviewers)
4. Decision recorded in `docs/adrs/<number>-<title>.md`
5. Constitution updated; version incremented per SemVer
6. Migration plan documented if breaking changes required; old patterns deprecated gradually

### Compliance Review
- PR reviews MUST validate: type safety, test coverage, naming, architecture rules, security checks
- Automated checks enforce: typecheck, lint, tests, bundle size via GitHub Actions
- Manual review checklist MUST include: "Constitution compliance reviewed"
- Quarterly audits MUST verify: test coverage, bundle size trends, security incidents

### Effective Date & Rollout
This Constitution takes effect immediately for all new code. Existing code MUST migrate per ADR migration plans within 2 quarters. Technical debt tracking MUST use GitHub Issues with `constitution-debt` label.

**Version**: 1.0.0 | **Ratified**: 2025-12-17 | **Last Amended**: 2025-12-17
