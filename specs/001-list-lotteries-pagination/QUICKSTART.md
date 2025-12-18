# Quick Start: Implementation Plan Summary

## 📋 Feature Overview
**Lottery Listing with Infinite Scroll Pagination** for authenticated users

| Property | Value |
|----------|-------|
| **Effort** | 40 story points (~3-4 weeks) |
| **Phases** | 4 phases × 2-4 days each |
| **Test Coverage** | ≥80% (Jest) |
| **Branch** | `001-list-lotteries-pagination` |
| **Status** | 🟢 Ready to Code |

---

## 🏗️ Architecture at a Glance

```
src/features/home/
├── ui/                          # React components
│   ├── LotteryCard.tsx          # Individual lottery item
│   ├── LotteryList.tsx          # Infinite scroll list
│   ├── EmptyLotteryState.tsx    # Empty state UI
│   └── OfflineOverlay.tsx       # Network offline overlay
├── model/                        # Business logic (Zustand)
│   ├── lotteryStore.ts          # Client state: UI, pagination, error
│   └── types.ts                 # Domain types (Lottery, etc.)
├── api/                         # Server communication
│   ├── contracts.ts             # Zod schemas (request/response)
│   └── queries.ts               # TanStack Query hooks
├── hooks/                       # Custom hooks
│   └── useLotteryList.ts        # Feature-specific hook
└── __tests__/                   # Colocated tests
```

### State Management Pattern

```typescript
// Client State (UI)
Zustand (lotteryStore.ts)
├── lotteries: LotteryParticipation[]
├── pagination: { page, pageSize, total, hasMore }
├── isLoading: boolean
├── error: { code, message } | null
└── isOffline: boolean

// Server State (Data)
TanStack Query (queries.ts)
├── queryKey: ['lotteries', page]
├── staleTime: 5 minutes
├── cacheTime: 10 minutes
└── retry: 2 attempts (exclude 4xx errors)
```

---

## 📝 Implementation Phases

### Phase 1: Data Model & Contracts (2 days)
**Tasks**: 1.1 → 1.2 → 1.3

| Task | File | Est. | Notes |
|------|------|------|-------|
| 1.1 | `types.ts` + `lotteryStore.ts` | 0.5d | Domain interfaces, Zustand store |
| 1.2 | `contracts.ts` | 0.5d | Zod schemas for API validation |
| 1.3 | `*.test.ts` | 1d | Unit tests (types, contracts, store) |

**Deliverable**: Types, store, schemas with ≥80% coverage

---

### Phase 2: API & Server State (2 days)
**Tasks**: 2.1 → 2.2 → 2.3

| Task | File | Est. | Notes |
|------|------|------|-------|
| 2.1 | `queries.ts` | 1d | TanStack Query hooks w/ pagination |
| 2.2 | `hooks/useLotteryList.ts` | 0.5d | Custom hook combining store + query |
| 2.3 | `queries.test.ts` | 1d | Query tests + integration tests |

**Deliverable**: API integration with query caching & retry logic

---

### Phase 3: UI Components (3-4 days)
**Tasks**: 3.1 → 3.5

| Task | File | Est. | Notes |
|------|------|------|-------|
| 3.1 | `LotteryCard.tsx` | 1d | Display name, date, prize, probability, status |
| 3.2 | `LotteryList.tsx` | 1.5d | FlatList with infinite scroll, debounce |
| 3.3 | `EmptyLotteryState.tsx` | 0.5d | Empty state with CTA |
| 3.4 | `OfflineOverlay.tsx` | 0.5d | "Sin conexión" overlay |
| 3.5 | `HomeScreen.tsx` update | 1d | Integration, pull-to-refresh, error handling |

**Deliverable**: Fully functional UI with offline support

---

### Phase 4: Integration & Testing (2-3 days)
**Tasks**: 4.1 → 4.4

| Task | File | Est. | Notes |
|------|------|------|-------|
| 4.1 | `*.test.tsx` | 2d | Component tests (6 files) |
| 4.2 | `e2e/lotteries.e2e.ts` | 1.5d | Detox E2E tests (login → scroll → offline) |
| 4.3 | Perf review | - | Bundle size, memory leaks, accessibility |
| 4.4 | Code polish | 1d | Linting, docs, accessibility audit |

**Deliverable**: 80% test coverage, 0 lint errors, Detox E2E passing

---

## 🎯 Component Display Fields (7 fields)

Each `LotteryCard` displays:

1. **Lottery Name** (e.g., "Mega Millones")
2. **Draw Date** (e.g., "May 15, 2025 at 20:30")
3. **Prize Amount** (e.g., "$2,500,000")
4. **Probability** (e.g., "1 in 292 million")
5. **Ticket Count** (e.g., "5 tickets")
6. **Status Badge** (OPEN: purple, DRAWN: cyan, CANCELLED: gray)
7. **Last Updated** (e.g., "2 hours ago")

---

## 🔄 Infinite Scroll Flow

```
User scrolls → 80% threshold → onEndReached fired
                ↓
            isOffline? → Yes → Disable pagination, show overlay
                ↓ No
            isLoading? → Yes → Skip (debounce)
                ↓ No
            hasMore? → No → Stop (last page reached)
                ↓ Yes
            Load page N+1 → TanStack Query fetches
                ↓
            Parse with Zod → Update Zustand store
                ↓
            Append to FlatList → Render new items
```

---

## 📱 Offline Mode

**Trigger**: Network status change detected via `NetInfo`

**Behavior**:
- ✅ Allow scroll of cached lotteries
- ✅ Show "Sin conexión" overlay
- ❌ Disable pagination (gray out end of list)
- ✅ Keep all controls visible (allow pull-to-refresh to attempt reconnect)

**Reconnect**: User pulls to refresh → checks network → if online, fetches fresh page 1

---

## ✅ Quality Gates (Pre-Merge)

```bash
# Type Safety
tsc --noEmit

# Linting
npm run lint

# Tests (must pass + ≥80% coverage)
npm test

# E2E Tests
npm run test:e2e

# Bundle Size (< +50KB)
npm run build && du -sh dist/

# Security Audit
npm audit --audit-level=moderate
```

---

## 🚨 Critical Decisions

| Decision | Rationale |
|----------|-----------|
| **Infinite scroll** (not pagination buttons) | Better mobile UX, matches user expectations |
| **Server-side sort** (by draw date) | Consistency, scalability, memory efficiency |
| **Zustand + TanStack Query** | Clear separation (UI state vs data cache), prevents race conditions |
| **"Sin conexión" overlay** | Graceful offline degradation, prevents UX confusion |
| **Manual refresh only** | No automatic refresh; better battery life, clearer intent |
| **Ascending sort** (imminent first) | Most relevant draws shown first |
| **Debounce 300ms** | Prevent rapid pagination requests |

---

## 📊 Risk Matrix

| Risk | Impact | Prob. | Mitigation |
|------|--------|-------|-----------|
| API latency | Slow pagination | Medium | Query caching, placeholder UI, skeletons |
| Memory leak | Performance degrades | Medium | Memoize components, cleanup subs, stress test |
| Offline edge case | User confusion | Low | Clear messaging, cached scroll |
| Network timeout | Failed request | Medium | Retry logic (2x), manual retry CTA |
| Scope creep | Timeline slip | Medium | Strict P1/P2/P3, defer P3 to v2 |

---

## 📚 Documentation

- **Full Spec**: [spec.md](./spec.md) (139 lines, 13 FRs, 8 SCs)
- **Implementation Plan**: [plan.md](./plan.md) (detailed phases, code examples)
- **Quality Checklist**: [checklists/requirements.md](./checklists/requirements.md) (44 lines)
- **README**: [README.md](./README.md) (overview, testing, success metrics)

---

## 🚀 Getting Started

1. **Read the specification first** (5 min)
   ```bash
   cat specs/001-list-lotteries-pagination/spec.md
   ```

2. **Understand the plan** (10 min)
   ```bash
   cat specs/001-list-lotteries-pagination/plan.md
   ```

3. **Start Phase 1** (create types & contracts)
   ```bash
   # Create files
   touch src/features/home/model/types.ts
   touch src/features/home/api/contracts.ts
   
   # Start with types.ts
   # Then write unit tests
   npm test -- watch
   ```

4. **Follow commit conventions**
   ```bash
   git commit -m "feat(home): implement {ComponentName}
   
   - Description of changes
   - Reference to spec requirements (FR-001, etc.)
   - Test coverage info
   "
   ```

---

## 🎓 Constitution Principles Applied

| Principle | How Applied |
|-----------|-------------|
| **Type Safety (I)** | TypeScript strict mode, Zod schemas |
| **Test-First (II)** | ≥80% coverage, tests written before components |
| **Feature-Sliced (III)** | home/{ ui, model, api, hooks } structure |
| **State Management (IV)** | Zustand (client) + TanStack Query (server) |
| **Form Validation (V)** | Zod for API request/response validation |
| **API Contracts (VI)** | Centralized Zod schemas, versioned |
| **Error Handling (VII)** | Result pattern with typed errors, retry logic |
| **Navigation (VIII)** | React Navigation (no changes) |
| **Observability (IX)** | Sentry errors, structured logging |
| **Security (X)** | Bearer token auth, secure storage |
| **Accessibility (XI)** | 44pt touch targets, semantic HTML |
| **Design System (XII)** | Purple (primary), cyan (secondary), orange (accents) |
| **Performance (XIII)** | <2.5MB bundle, <2s initial load, <1.5s pagination |
| **Versioning (XIV)** | Semantic versioning for API contracts |

---

**Branch**: `001-list-lotteries-pagination`  
**Status**: 🟢 Ready to Code  
**Last Updated**: 2025-12-17
