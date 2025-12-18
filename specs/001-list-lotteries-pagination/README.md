# Feature 001: User Lottery Listing with Pagination

## Overview

This feature enables authenticated users to view their personalized lottery list with infinite scroll pagination. The feature displays lottery cards with key information (name, draw date, prize, probability, status) and supports offline mode with graceful degradation.

**Branch**: `001-list-lotteries-pagination`  
**Status**: 🟢 Ready for Implementation  
**Effort**: ~40 story points (3-4 weeks)

---

## Artifacts

### 1. Feature Specification
**File**: [`spec.md`](./spec.md) (139 lines)

Complete functional specification including:
- 4 User Stories (P1/P2/P3)
- 13 Functional Requirements
- 8 Success Criteria
- 6 Edge Cases
- 4 Clarifications resolved in Session 2025-12-17

**Key Clarifications**:
- ✅ Sort order: Ascending by draw date (most imminent first)
- ✅ Display fields: Prize amount, probability, last update date
- ✅ Refresh behavior: Manual pull-to-refresh only (no automatic refresh)
- ✅ Offline mode: Show "Sin conexión" message, disable pagination

### 2. Implementation Plan
**File**: [`plan.md`](./plan.md) (XXX lines)

Complete implementation strategy including:
- Architecture: Feature-sliced design (Constitution III)
- State management: Zustand + TanStack Query (Constitution IV)
- API contracts: Zod schemas (Constitution VI)
- 14 implementation tasks with dependencies
- Quality gates: TypeScript, ESLint, Jest (≥80%), Detox E2E
- Risk analysis & mitigation strategies
- Rollout plan with monitoring

**Phases**:
1. Phase 1: Data model & contracts (2 days)
2. Phase 2: API & server state (2 days)
3. Phase 3: UI components (3-4 days)
4. Phase 4: Integration & testing (2-3 days)

### 3. Quality Checklist
**File**: [`checklists/requirements.md`](./checklists/requirements.md) (44 lines)

Pre-implementation validation confirming:
- ✅ No implementation details in spec (business-focused)
- ✅ All acceptance criteria defined with scenarios
- ✅ Success criteria measurable and testable
- ✅ Edge cases identified and documented
- ✅ Spec ready for planning phase

---

## Constitution Compliance

All phases designed to comply with **Purita Suerte Constitution v1.0.0** (ratified 2025-12-17):

| Principle | Compliance | Implementation |
|-----------|-----------|-----------------|
| **I. Type Safety** | ✅ | TypeScript strict mode, no `any` types, explicit returns |
| **II. Test-First** | ✅ | 80% coverage minimum (unit + component + E2E tests) |
| **III. Feature-Sliced** | ✅ | `src/features/home/{ui, model, api, hooks}` structure |
| **IV. State Management** | ✅ | Zustand (client) + TanStack Query (server state) |
| **V. Form Validation** | ⚠️ | N/A for read-only feature; Zod for API responses |
| **VI. API Contracts** | ✅ | Zod schemas for all requests/responses |
| **VII. Error Handling** | ✅ | Result pattern with typed errors & retry logic |
| **VIII. Navigation** | ✅ | React Navigation (no changes required) |
| **IX. Observability** | ✅ | Sentry integration for errors, structured logging |
| **X. Security** | ✅ | Bearer token auth, secure token storage (no changes) |
| **XI. Accessibility** | ✅ | 44pt touch targets, loading/error/empty states |
| **XII. Design System** | ✅ | Purple primary, cyan secondary, orange accents |
| **XIII. Performance** | ✅ | <2.5MB bundle impact, <2s initial load, <1.5s pagination |
| **XIV. Versioning** | ✅ | Semantic versioning for API contracts |

---

## Key Technical Decisions

### 1. Infinite Scroll vs Pagination Buttons
**Decision**: Infinite scroll with FlatList `onEndReached`  
**Rationale**: Better UX on mobile, matches user expectations from social apps

### 2. Client-side Sort vs Server-side Sort
**Decision**: Server-side (API returns sorted by draw date)  
**Rationale**: Consistency, scalability, reduces client memory usage

### 3. Zustand + TanStack Query Pattern
**Decision**: Zustand for UI state (loading, error, scroll position) + TanStack Query for data cache  
**Rationale**: Clear separation of concerns, prevents race conditions, built-in retry logic

### 4. Offline Behavior
**Decision**: Disable pagination, show "Sin conexión", allow scroll of cached items  
**Rationale**: Graceful degradation, prevents user confusion, avoids failed requests

---

## Development Workflow

### Getting Started

1. **Checkout feature branch** (already checked out):
   ```bash
   git checkout 001-list-lotteries-pagination
   ```

2. **Read specification first**:
   ```bash
   cat specs/001-list-lotteries-pagination/spec.md
   cat specs/001-list-lotteries-pagination/plan.md
   ```

3. **Start Phase 1** (Data model & contracts):
   - Create `src/features/home/model/types.ts`
   - Create `src/features/home/api/contracts.ts` with Zod schemas
   - Write unit tests (target ≥80% coverage)

4. **Daily workflow**:
   ```bash
   # Run tests in watch mode
   npm test -- --watch

   # Run TypeScript checker
   tsc --noEmit

   # Run ESLint
   npm run lint

   # Before committing, verify coverage
   npm test -- --coverage
   ```

### Commit Conventions

Follow Constitution naming:
- Components: **PascalCase** (`LotteryCard.tsx`, `LotteryList.tsx`)
- Hooks: **camelCase** (`useLotteryList.ts`, `useUserLotteries`)
- Stores: **camelCase** (`lotteryStore.ts`)
- Types: **PascalCase** (`Lottery`, `LotteryParticipation`)
- Files: **lowercase with dashes** (`lottery-card.tsx`) *[if not using PascalCase]*

**Commit message format**:
```
feat(home): implement LotteryCard component

- Display lottery name, date, prize, probability, status
- Support status-based color coding (open, drawn, cancelled)
- Implement 44pt touch targets for accessibility
- Add 100% unit test coverage
```

---

## Testing Strategy

### Unit Tests (60% of effort)
- **Types**: Validation of domain interfaces
- **Contracts**: Zod schema validation, edge cases
- **Store**: Zustand actions, state mutations
- **Hooks**: Query behavior, error handling, mocking API

### Component Tests (25% of effort)
- **LotteryCard**: Rendering fields, status colors, tap handling
- **LotteryList**: Scroll behavior, pagination trigger, debounce
- **OfflineOverlay**: Visibility, overlay opacity
- **EmptyLotteryState**: CTA navigation

### E2E Tests (15% of effort)
- **Detox**: Full user flow (login → view lotteries → scroll → offline)

**Coverage Target**: ≥80% (measured by Jest)

---

## Success Metrics

### Code Quality
- ✅ TypeScript: 0 errors (`tsc --noEmit`)
- ✅ ESLint: 0 errors/warnings (`npm run lint`)
- ✅ Tests: ≥80% coverage, all passing (`npm test`)
- ✅ Bundle: <+50KB added size

### Performance
- ✅ Initial load: <2 seconds
- ✅ Pagination load: <1.5 seconds
- ✅ Scroll FPS: ≥55fps (React Native standard)
- ✅ Memory: No leaks with 1000+ items scrolled

### UX
- ✅ SC-001: 95% of users see 10 lotteries within 2s
- ✅ SC-002: Infinite scroll works without manual pagination
- ✅ SC-003: Offline mode prevents user confusion
- ✅ SC-004: No duplicate lotteries in list
- ✅ SC-005: Pagination always terminates (max pages enforced)

---

## Blockers & Dependencies

### External Dependencies
- ✅ **API Endpoint**: `/user/lotteries?page=X&pageSize=10` (assumes implemented)
- ✅ **Authentication**: Bearer token available in `authStore` (already implemented)
- ✅ **NetInfo**: Network status detection (react-native-netinfo, already installed)

### Internal Dependencies
- ✅ `src/shared/api/client.ts`: Axios instance with auth interceptor
- ✅ `src/features/auth/`: Auth state (already implemented)
- ✅ `src/app/providers.tsx`: TanStack Query provider (needs to be added if not present)

---

## Release Checklist

Before merging to main:

- [ ] All tests passing: `npm test` (≥80% coverage)
- [ ] TypeScript check: `tsc --noEmit` (0 errors)
- [ ] Linting: `npm run lint` (0 errors)
- [ ] E2E tests: `npm run test:e2e` (all passing)
- [ ] Code review: Architecture & implementation verified
- [ ] Documentation: README, JSDoc, API contracts documented
- [ ] Performance: Bundle size <+50KB, load time <2s
- [ ] Accessibility: 44pt touch targets, WCAG 2.1 AA compliant
- [ ] Security: No high/critical vulnerabilities (npm audit)

---

## References

- **Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Quality Checklist**: [checklists/requirements.md](./checklists/requirements.md)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **API Client**: [src/shared/api/client.ts](../../src/shared/api/client.ts)
- **Auth Store**: [src/features/auth/model/authStore.ts](../../src/features/auth/model/authStore.ts)

---

## Contact

For questions or blockers:
1. Check specification & plan first
2. Post in #engineering-decisions channel
3. Schedule design review with team lead

**Last Updated**: 2025-12-17  
**Prepared by**: Speckit Planning Agent  
**Status**: 🟢 Ready to Implement
