# Tasks: User Lottery Listing with Pagination

**Feature**: 001-list-lotteries-pagination  
**Created**: December 17, 2025  
**Status**: Ready for Implementation  
**Total Tasks**: 24  
**Estimated Effort**: 40 story points (3-4 weeks)

---

## Dependencies & Execution Order

### Critical Path (Must complete in order)
```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3+ (User Stories in parallel)
```

### Parallelization Strategy
- **Phase 1**: Sequential (1 task, blocks everything)
- **Phase 2**: Sequential (3 foundational tasks, blocks all stories)
- **Phase 3**: Parallel (US1 tasks can run independently of US2, US3, US4)
- **Phase 4**: Sequential within each story, but parallel across stories
- **Phase 5**: Final polish (can start when all stories reach testing phase)

### Example Parallel Execution
```
Developers: 4 people

Sprint Day 1-2 (Phase 1 + Phase 2):
  • Dev1: T001 (Feature structure) → T004 (Types)
  • Dev2: Waiting (blocked until T003 complete)
  • Dev3: Waiting (blocked until T003 complete)
  • Dev4: Waiting (blocked until T003 complete)

Sprint Day 3-4 (Phase 3 - Parallel):
  • Dev1: T005-T007 (US1 API contracts & Zustand)
  • Dev2: T012-T014 (US2 Pagination hooks & LotteryList)
  • Dev3: T019 (US3 Error handling component)
  • Dev4: T022 (US4 Scroll position hook)

Sprint Day 5-6 (Phase 4 - Parallel):
  • Dev1: T008-T010 (US1 Component tests)
  • Dev2: T015-T017 (US2 Component tests)
  • Dev3: T020-T021 (US3 Tests)
  • Dev4: T023-T024 (US4 Tests)

Sprint Day 7 (Phase 5):
  • All devs: T025-T026 (Code review, E2E, accessibility)
```

---

## Phase 1: Setup & Project Structure

- [ ] **T001** Create feature module structure for `src/features/home/` with all required folders and `index.ts`

**Description**: Set up the feature-sliced directory structure with folders: `ui/`, `model/`, `api/`, `hooks/`, and their respective `__tests__/` subdirectories. Initialize `index.ts` with empty exports.

**Files to Create**:
- `src/features/home/ui/__tests__/` (directory)
- `src/features/home/model/__tests__/` (directory)
- `src/features/home/api/__tests__/` (directory)
- `src/features/home/hooks/__tests__/` (directory)
- `src/features/home/index.ts` (public API file)

---

## Phase 2: Foundational Requirements (Blocking)

- [ ] **T002** Create domain types file (`src/features/home/model/types.ts`) with `Lottery`, `LotteryParticipation`, and `PaginationState` interfaces

**Description**: Define TypeScript interfaces for all domain entities used throughout the feature. Include JSDoc comments for each property. Follow Constitution I (Type Safety).

**Files to Create**:
- `src/features/home/model/types.ts` (200+ lines with interfaces and types)

**Acceptance Criteria**:
- ✅ All 3 interfaces exported
- ✅ All properties have explicit types (no `any`)
- ✅ JSDoc comments present
- ✅ Interfaces match spec.md data model

---

- [ ] **T003** Create API contracts file (`src/features/home/api/contracts.ts`) with Zod schemas for request/response validation

**Description**: Define Zod schemas for `GetUserLotteriesRequest`, `LotterySchema`, and `GetUserLotteriesResponse`. Include `.describe()` for all fields. Validate edge cases (negative values, invalid dates).

**Files to Create**:
- `src/features/home/api/contracts.ts` (300+ lines with Zod schemas)

**Acceptance Criteria**:
- ✅ 3+ Zod schemas defined and exported
- ✅ All schemas include `.describe()` for documentation
- ✅ Request validates page ≥ 1, pageSize ∈ [1, 100]
- ✅ Response validates lottery fields (draw date is valid, probability ∈ [0, 1])
- ✅ Schemas match spec.md requirements (FR-008 fields)

---

- [ ] **T004** Create Zustand store (`src/features/home/model/lotteryStore.ts`) with client state management for pagination, loading, and offline status

**Description**: Implement Zustand store with state for lotteries, pagination, loading, error, offline status, and scroll position. Include actions for all state mutations. No async logic (that's TanStack Query).

**Files to Create**:
- `src/features/home/model/lotteryStore.ts` (200+ lines with Zustand store)

**Acceptance Criteria**:
- ✅ Store exports `useLotteryStore` hook
- ✅ Initial state matches specification requirements
- ✅ All actions are pure functions (no async)
- ✅ No external dependencies in actions
- ✅ Store is immutable (Zustand with proper state updates)

---

## Phase 3.1: User Story 1 - Display Initial Lottery List (P1)

- [ ] **T005** [P] [US1] Create unit tests for domain types and contracts (`src/features/home/model/__tests__/types.test.ts` and `src/features/home/api/__tests__/contracts.test.ts`)

**Description**: Write Jest tests validating type definitions, Zod schema validation, edge cases (invalid inputs, boundary values), and error messages. Target ≥90% coverage for types and contracts.

**Files to Create**:
- `src/features/home/model/__tests__/types.test.ts` (100+ lines)
- `src/features/home/api/__tests__/contracts.test.ts` (150+ lines)

**Acceptance Criteria**:
- ✅ All interfaces tested with valid data
- ✅ Zod schemas tested with invalid data (expect errors)
- ✅ Edge cases covered: negative numbers, null values, invalid dates
- ✅ ≥90% line coverage
- ✅ All tests pass: `npm test -- src/features/home/model/__tests__/types.test.ts`

---

- [ ] **T006** [P] [US1] Create unit tests for Zustand store (`src/features/home/model/__tests__/lotteryStore.test.ts`)

**Description**: Write Jest tests for all Zustand store actions, state mutations, and initial state. Verify immutability and that actions don't have side effects.

**Files to Create**:
- `src/features/home/model/__tests__/lotteryStore.test.ts` (150+ lines)

**Acceptance Criteria**:
- ✅ Test store initialization
- ✅ Test each action (setLotteries, setPagination, setLoading, etc.)
- ✅ Verify state is immutable after mutations
- ✅ Verify store reset works correctly
- ✅ ≥90% coverage, all tests pass

---

- [ ] **T007** [P] [US1] Create TanStack Query hooks for lottery fetching (`src/features/home/api/queries.ts`)

**Description**: Implement `useUserLotteries(page: number)` hook using TanStack Query with proper cache configuration (staleTime=5min, cacheTime=10min), retry logic (2 attempts, exclude 4xx), and Zod validation. Include error handling.

**Files to Create**:
- `src/features/home/api/queries.ts` (200+ lines with query hooks)

**Acceptance Criteria**:
- ✅ Hook accepts page parameter and returns query result
- ✅ Query validates request with GetUserLotteriesRequestSchema
- ✅ Query validates response with GetUserLotteriesResponseSchema
- ✅ Retry logic configured (2 attempts, no 4xx retry)
- ✅ Cache configuration: staleTime=5min, cacheTime=10min
- ✅ Error handling with typed error result

---

- [ ] **T008** [P] [US1] Create LotteryCard component (`src/features/home/ui/LotteryCard.tsx`) displaying 7 fields per spec

**Description**: Build React Native component to display individual lottery card with 7 fields: name, draw date, prize amount, probability, ticket count, status badge, and last update date. Use Constitution XII design system (purple, cyan, orange). Implement 44pt+ touch targets.

**Files to Create**:
- `src/features/home/ui/LotteryCard.tsx` (150+ lines)

**Acceptance Criteria**:
- ✅ Component accepts `lottery: LotteryParticipation` prop
- ✅ All 7 fields displayed (FR-008)
- ✅ Status badge uses correct colors: OPEN=purple, DRAWN=cyan, CANCELLED=gray
- ✅ Touch target ≥44pt
- ✅ TypeScript types for all props (no `any`)
- ✅ Accessible (semantic structure, alt text for icons)

---

- [ ] **T009** [P] [US1] Create unit tests for LotteryCard component (`src/features/home/ui/__tests__/LotteryCard.test.tsx`)

**Description**: Write Jest + React Native Testing Library tests for LotteryCard component. Test rendering of all 7 fields, status colors, accessibility, and prop handling.

**Files to Create**:
- `src/features/home/ui/__tests__/LotteryCard.test.tsx` (120+ lines)

**Acceptance Criteria**:
- ✅ Test rendering of all 7 lottery fields
- ✅ Test status color mapping (OPEN→purple, DRAWN→cyan, CANCELLED→gray)
- ✅ Test date formatting
- ✅ Test accessibility (semantic HTML, alt text)
- ✅ ≥85% coverage, all tests pass

---

- [ ] **T010** [P] [US1] Create EmptyLotteryState component (`src/features/home/ui/EmptyLotteryState.tsx`) for when user has no lotteries

**Description**: Build component showing empty state message "No lotteries yet. Explore raffles to join!" with icon and CTA button using Constitution design colors.

**Files to Create**:
- `src/features/home/ui/EmptyLotteryState.tsx` (80+ lines)

**Acceptance Criteria**:
- ✅ Component displays empty state message
- ✅ Icon uses accent color (orange from palette)
- ✅ CTA button has onPress handler
- ✅ Component is horizontally and vertically centered
- ✅ Meets 44pt touch target for button

---

## Phase 3.2: User Story 2 - Infinite Scroll Pagination (P1)

- [ ] **T011** [P] [US2] Create custom hook for lottery list logic (`src/features/home/hooks/useLotteryList.ts`)

**Description**: Implement hook combining Zustand store + TanStack Query with pagination logic, debounce (300ms), and automatic load-on-scroll trigger. Return combined state and actions for consumers.

**Files to Create**:
- `src/features/home/hooks/useLotteryList.ts` (200+ lines)

**Acceptance Criteria**:
- ✅ Hook returns `{ lotteries, pagination, isLoading, error, loadMore }`
- ✅ Implements debounce (300ms) for pagination triggers
- ✅ Automatically prevents rapid repeated requests
- ✅ Handles pagination state correctly (page, hasMore)
- ✅ TypeScript types for all returned values

---

- [ ] **T012** [P] [US2] Create LotteryList component (`src/features/home/ui/LotteryList.tsx`) with infinite scroll using FlatList

**Description**: Build FlatList-based component implementing infinite scroll with 80% threshold trigger, loading indicators (skeleton or spinner), and proper debouncing to prevent duplicate requests.

**Files to Create**:
- `src/features/home/ui/LotteryList.tsx` (250+ lines)

**Acceptance Criteria**:
- ✅ Uses FlatList with `onEndReached` callback
- ✅ Trigger at 80% scroll position (onEndReachedThreshold=0.2)
- ✅ Loading indicator shown while fetching (FR-005)
- ✅ Debounce prevents duplicate requests (300ms)
- ✅ Smooth scroll performance (memoized LotteryCard)
- ✅ No duplicate items in list (FR-005)

---

- [ ] **T013** [P] [US2] Create pull-to-refresh functionality in LotteryList component

**Description**: Implement React Native `RefreshControl` for manual pull-to-refresh. Reset pagination to page 1, clear lotteries, and reload fresh data.

**Files to Create**:
- Update `src/features/home/ui/LotteryList.tsx` (add RefreshControl)

**Acceptance Criteria**:
- ✅ RefreshControl appears on scroll up
- ✅ Pull-to-refresh resets to page 1 (FR-012)
- ✅ No duplicate requests during refresh
- ✅ Loading spinner visible during refresh
- ✅ Works on both Android and iOS

---

- [ ] **T014** [P] [US2] Create unit tests for LotteryList component (`src/features/home/ui/__tests__/LotteryList.test.tsx`)

**Description**: Write tests for FlatList rendering, infinite scroll trigger, debounce behavior, and pull-to-refresh functionality. Mock TanStack Query and Zustand.

**Files to Create**:
- `src/features/home/ui/__tests__/LotteryList.test.tsx` (200+ lines)

**Acceptance Criteria**:
- ✅ Test initial render of 10 items
- ✅ Test onEndReached callback triggers at 80%
- ✅ Test debounce prevents rapid calls
- ✅ Test pull-to-refresh resets pagination
- ✅ Test loading indicator visibility
- ✅ ≥80% coverage, all tests pass

---

## Phase 3.3: User Story 3 - Retry Failed Pagination Loads (P2)

- [ ] **T015** [P] [US3] Create ErrorBanner component (`src/features/home/ui/ErrorBanner.tsx`) for pagination errors

**Description**: Build component displaying error message with "Retry" button. Show when pagination fails, allow user to retry last failed request.

**Files to Create**:
- `src/features/home/ui/ErrorBanner.tsx` (100+ lines)

**Acceptance Criteria**:
- ✅ Component displays error message (from prop)
- ✅ Retry button has onRetry callback handler
- ✅ Retry button is ≥44pt touch target
- ✅ Banner styling uses Constitution design system
- ✅ Message matches spec: "Unable to load more lotteries"

---

- [ ] **T016** [P] [US3] Implement error state in LotteryList component with retry option

**Description**: Update LotteryList to show ErrorBanner when pagination fails, handle retry clicks, and clear error state on success.

**Files to Create**:
- Update `src/features/home/ui/LotteryList.tsx` (add error handling + ErrorBanner)

**Acceptance Criteria**:
- ✅ Error state from Zustand is checked and displayed
- ✅ ErrorBanner shown only when error exists
- ✅ Retry button triggers loadMore action
- ✅ Error cleared after successful retry
- ✅ Error persists if retry fails again

---

- [ ] **T017** [P] [US3] Create unit tests for error handling (`src/features/home/ui/__tests__/ErrorBanner.test.tsx` and pagination error test)

**Description**: Write tests for ErrorBanner component and error state handling in LotteryList.

**Files to Create**:
- `src/features/home/ui/__tests__/ErrorBanner.test.tsx` (80+ lines)
- Update `src/features/home/ui/__tests__/LotteryList.test.tsx` with error scenarios

**Acceptance Criteria**:
- ✅ Test ErrorBanner renders error message
- ✅ Test retry button functionality
- ✅ Test error display in LotteryList
- ✅ Test error clears on success
- ✅ ≥85% coverage for error paths

---

## Phase 3.4: User Story 4 - Scroll Position Preservation (P3)

- [ ] **T018** [P] [US4] Create scroll position hook (`src/features/home/hooks/useScrollPosition.ts`)

**Description**: Implement hook to persist and restore scroll position using Zustand store. Save position on scroll change, restore on component mount.

**Files to Create**:
- `src/features/home/hooks/useScrollPosition.ts` (100+ lines)

**Acceptance Criteria**:
- ✅ Hook saves scroll position to Zustand store
- ✅ Hook restores scroll position on mount
- ✅ Scroll position is session-scoped (cleared on app close)
- ✅ Performance: minimal overhead, no jank
- ✅ Works on both Android and iOS

---

- [ ] **P] [US4] Integrate scroll position persistence into LotteryList component

**Description**: Update LotteryList to use scroll position hook, restore position after scroll, and pass restored position to FlatList.

**Files to Create**:
- Update `src/features/home/ui/LotteryList.tsx` (add scroll position restoration)

**Acceptance Criteria**:
- ✅ Scroll position saved on user scroll
- ✅ Scroll position restored when returning to screen
- ✅ Position accuracy within 1-2 items
- ✅ No performance regression

---

- [ ] **T019** [P] [US4] Create unit tests for scroll position functionality (`src/features/home/hooks/__tests__/useScrollPosition.test.ts`)

**Description**: Write tests for scroll position save/restore behavior.

**Files to Create**:
- `src/features/home/hooks/__tests__/useScrollPosition.test.ts` (100+ lines)

**Acceptance Criteria**:
- ✅ Test position saved correctly
- ✅ Test position restored on mount
- ✅ Test session scope (cleared on reset)
- ✅ ≥85% coverage

---

## Phase 3.5: Cross-Cutting Concerns - Offline Mode

- [ ] **T020** Create OfflineOverlay component (`src/features/home/ui/OfflineOverlay.tsx`) showing "Sin conexión" message

**Description**: Build component displaying full-screen "Sin conexión" overlay that appears when device is offline (detected via NetInfo). Disable list interaction below overlay.

**Files to Create**:
- `src/features/home/ui/OfflineOverlay.tsx` (100+ lines)

**Acceptance Criteria**:
- ✅ Component shows "Sin conexión" message
- ✅ Overlay covers entire screen
- ✅ Uses Constitution design colors (muted)
- ✅ Appears only when `isOffline` is true
- ✅ Allows scroll of cached items below overlay

---

- [ ] **T021** Integrate offline detection into HomeScreen component

**Description**: Add network status monitoring via `react-native-netinfo` to HomeScreen. Update Zustand store `isOffline` state when network changes. Show OfflineOverlay when offline.

**Files to Create**:
- Update `src/features/home/ui/HomeScreen.tsx` (add NetInfo listener, OfflineOverlay integration)

**Acceptance Criteria**:
- ✅ NetInfo listener attached on mount
- ✅ Network status changes update Zustand store
- ✅ OfflineOverlay shown when offline
- ✅ Pagination disabled when offline (no requests attempted)
- ✅ Pull-to-refresh disabled when offline

---

- [ ] **T022** Create unit tests for offline functionality (`src/features/home/ui/__tests__/OfflineOverlay.test.tsx`)

**Description**: Write tests for OfflineOverlay component and offline state handling.

**Files to Create**:
- `src/features/home/ui/__tests__/OfflineOverlay.test.tsx` (80+ lines)

**Acceptance Criteria**:
- ✅ Test overlay visibility based on isOffline prop
- ✅ Test message displayed correctly
- ✅ Test pagination disabled when offline
- ✅ ≥85% coverage

---

## Phase 4: Integration Testing & Accessibility

- [ ] **T023** Update HomeScreen component to integrate all lottery list components

**Description**: Update existing `HomeScreen.tsx` to use LotteryList, EmptyLotteryState, and OfflineOverlay. Handle initial data loading, error states, and user interactions.

**Files to Create**:
- Update `src/features/home/ui/HomeScreen.tsx` (300+ lines, complete integration)

**Acceptance Criteria**:
- ✅ Renders LotteryList when data available
- ✅ Renders EmptyLotteryState when no lotteries
- ✅ Renders OfflineOverlay when offline
- ✅ Handles loading state on initial mount
- ✅ All error states handled gracefully
- ✅ Integrates NetInfo for network monitoring

---

- [ ] **T024** Create integration tests for HomeScreen (`src/features/home/ui/__tests__/HomeScreen.test.tsx`)

**Description**: Write comprehensive tests for HomeScreen covering user flows: happy path (load lotteries), empty state, error scenarios, offline mode, and navigation.

**Files to Create**:
- `src/features/home/ui/__tests__/HomeScreen.test.tsx` (250+ lines)

**Acceptance Criteria**:
- ✅ Test initial load flow (user logs in → sees 10 items)
- ✅ Test empty state flow
- ✅ Test error flow with retry
- ✅ Test offline mode flow
- ✅ Test pagination flow (scroll → load more)
- ✅ ≥80% coverage overall

---

## Phase 5: E2E Testing, Performance & Accessibility

- [ ] **T025** Create end-to-end tests using Detox (`e2e/lotteries.e2e.ts`)

**Description**: Write Detox E2E tests covering complete user flows: login → view lotteries → scroll → offline → reconnect. Verify all acceptance scenarios from spec.

**Files to Create**:
- `e2e/lotteries.e2e.ts` (300+ lines)

**Acceptance Criteria**:
- ✅ E2E: Login flow
- ✅ E2E: Initial lottery list appears
- ✅ E2E: Infinite scroll loads more items
- ✅ E2E: Empty state displayed for users with no lotteries
- ✅ E2E: Error handling and retry
- ✅ E2E: Offline mode behavior
- ✅ All tests pass: `npm run test:e2e`

---

- [ ] **T026** Performance review and accessibility audit

**Description**: Run performance profiling, accessibility audit, and bundle size check. Verify all Constitution XIII (Performance) and XI (Accessibility) requirements are met.

**Tasks**:
- Run: `npm run build && du -sh dist/`
- Run: `npm test -- --coverage`
- Run TypeScript: `tsc --noEmit`
- Run Linting: `npm run lint`
- Check: Bundle size <+50KB added
- Check: Test coverage ≥80%
- Check: No ESLint errors
- Check: 44pt touch targets verified
- Check: WCAG 2.1 AA compliance

**Acceptance Criteria**:
- ✅ Bundle size increase <+50KB
- ✅ Initial load <2 seconds (measured)
- ✅ Pagination load <1.5 seconds (measured)
- ✅ Test coverage ≥80% overall
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ No memory leaks with 1000+ items
- ✅ 44pt touch targets verified
- ✅ WCAG 2.1 AA compliant

---

## Summary Statistics

| Phase | Tasks | Effort | Story |
|-------|-------|--------|-------|
| Phase 1: Setup | 1 | 0.5 days | - |
| Phase 2: Foundation | 3 | 2 days | - |
| Phase 3.1: US1 (Initial List) | 4 | 2 days | US1 |
| Phase 3.2: US2 (Pagination) | 4 | 2.5 days | US2 |
| Phase 3.3: US3 (Error Retry) | 3 | 1.5 days | US3 |
| Phase 3.4: US4 (Scroll Pos) | 3 | 1.5 days | US4 |
| Phase 3.5: Offline Mode | 3 | 1.5 days | Cross-cutting |
| Phase 4: Integration | 2 | 2 days | Integration |
| Phase 5: E2E & Perf | 2 | 2 days | Testing |
| **Total** | **25** | **15 days (40 SP)** | **All** |

---

## Quality Gates (Pre-Merge)

All tasks must satisfy:

- [ ] **TypeScript**: `tsc --noEmit` → 0 errors
- [ ] **ESLint**: `npm run lint` → 0 errors/warnings
- [ ] **Tests**: `npm test` → ≥80% coverage, all pass
- [ ] **E2E**: `npm run test:e2e` → all pass
- [ ] **Bundle**: <+50KB added size
- [ ] **Security**: `npm audit` → no high/critical
- [ ] **Code Review**: Architecture & implementation approved
- [ ] **Accessibility**: 44pt targets, semantic HTML verified

---

## Sign-Off Checklist

- [ ] All 25 tasks completed
- [ ] All unit tests passing (≥80% coverage)
- [ ] All E2E tests passing
- [ ] Code review approved
- [ ] Performance gates met
- [ ] Accessibility verified
- [ ] Ready to merge to main

---

**Status**: 🟢 Ready for Development  
**Next**: Assign tasks to development team, start Phase 1  
**Last Updated**: December 17, 2025
