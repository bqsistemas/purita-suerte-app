# Implementation Plan: User Lottery Listing with Pagination

**Feature**: [001-list-lotteries-pagination](./spec.md)  
**Created**: December 17, 2025  
**Status**: Ready for Development  
**Constitution Version**: 1.0.0  
**Estimated Effort**: 40-50 story points (3-4 weeks)

---

## I. Technical Context

### Architecture Decision: Feature-Sliced Design
Following **Constitution III (Feature-Sliced Architecture)**, the lottery listing feature will be implemented in the `src/features/home/` module (extends existing Home screen).

```
src/features/home/
├── ui/
│   ├── HomeScreen.tsx                    # Main home screen component
│   ├── LotteryList.tsx                   # Paginated lottery list (NEW)
│   ├── LotteryCard.tsx                   # Individual lottery card (NEW)
│   ├── EmptyLotteryState.tsx             # Empty state (NEW)
│   ├── OfflineOverlay.tsx                # Offline mode overlay (NEW)
│   └── __tests__/
│       ├── LotteryList.test.tsx          # (NEW)
│       ├── LotteryCard.test.tsx          # (NEW)
│       └── OfflineOverlay.test.tsx       # (NEW)
├── model/
│   ├── lotteryStore.ts                   # Zustand store for lottery pagination state (NEW)
│   ├── types.ts                          # Domain types (NEW)
│   └── __tests__/
│       └── lotteryStore.test.ts          # (NEW)
├── api/
│   ├── contracts.ts                      # Zod schemas & API contracts (NEW)
│   ├── queries.ts                        # TanStack Query hooks (NEW)
│   └── __tests__/
│       ├── contracts.test.ts             # (NEW)
│       └── queries.test.ts               # (NEW)
├── hooks/
│   ├── useLotteryList.ts                 # Custom hook for lottery list logic (NEW)
│   └── __tests__/
│       └── useLotteryList.test.ts        # (NEW)
└── index.ts                              # Public API (update)
```

### State Management Strategy
Following **Constitution IV (Centralized State Management)**:

1. **Client State** (Zustand): Pagination cursor, scroll position, loading states
   - Store: `src/features/home/model/lotteryStore.ts`
   - Pattern: `const useLotteryStore = create<LotteryState>((set, get) => ({...}))`

2. **Server State** (TanStack Query): API responses, cached lottery data
   - Queries: `src/features/home/api/queries.ts`
   - Hook: `useUserLotteries(page: number)` with pagination config
   - Cache: staleTime=5min, cacheTime=10min, retries=2

3. **Local State** (useState): Form fields (if any), UI toggles
   - Minimal use; prefer Zustand

### API Contract Strategy
Following **Constitution V & VI**:

- Zod schemas first: `src/features/home/api/contracts.ts`
- Request: `GetUserLotteriesSchema` (page, limit)
- Response: `UserLotteriesResponseSchema` (data[], total, hasMore)
- Validation at API client layer before caching

---

## II. Constitution Compliance Check

| Principle | Compliance | Notes |
|-----------|-----------|-------|
| **I. Type Safety** | ✅ | All TypeScript + strict mode, no `any` types, explicit return types |
| **II. Test-First** | ✅ | 80% coverage target (unit + component + integration tests) |
| **III. Feature-Sliced** | ✅ | Home feature module with autonomous substructure |
| **IV. State Management** | ✅ | Zustand for client state, TanStack Query for server state |
| **V. Form Validation** | ⚠️ | N/A for read-only list; apply if filtering added later |
| **VI. API Contracts** | ✅ | Zod schemas, centralized API client |
| **VII. Error Handling** | ✅ | Result pattern, typed errors, user-facing messages |
| **VIII. Navigation** | ✅ | React Navigation (no changes needed) |
| **IX. Observability** | ✅ | Sentry integration for errors, structured logging |
| **X. Security** | ✅ | Bearer token auth, secure token storage (no changes) |
| **XI. Accessibility** | ✅ | Loading/error/empty states, safe areas, 44pt touch targets |
| **XII. Design System** | ✅ | Use Purita Suerte color palette (purple primary, cyan secondary) |
| **XIII. Performance** | ✅ | Lazy load, memoization, <2.5MB bundle |
| **XIV. Versioning** | ✅ | Semantic versioning for API contracts |

---

## III. Detailed Implementation Strategy

### Phase 1: Data Model & Contracts (2 days)

#### 1.1 Domain Types (`src/features/home/model/types.ts`)
```typescript
export interface Lottery {
  id: string;
  name: string;
  drawDate: Date;
  prizeAmount: number;
  winProbability: number;
  lastUpdated: Date;
  status: 'OPEN' | 'DRAWN' | 'CANCELLED';
}

export interface LotteryParticipation {
  lotteryId: string;
  ticketCount: number;
  lottery: Lottery;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
```

**Tests**: Type validation, interface contracts

#### 1.2 API Contracts (`src/features/home/api/contracts.ts`)
```typescript
export const UserLotteriesRequestSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});

export const LotterySchema = z.object({
  id: z.string().uuid().describe('Unique lottery ID'),
  name: z.string().min(1).describe('Lottery name'),
  drawDate: z.coerce.date().describe('When draw occurs'),
  prizeAmount: z.number().positive().describe('Prize in currency'),
  winProbability: z.number().min(0).max(1).describe('Probability [0-1]'),
  lastUpdated: z.coerce.date(),
  status: z.enum(['OPEN', 'DRAWN', 'CANCELLED']),
});

export const UserLotteriesResponseSchema = z.object({
  data: z.array(
    z.object({
      ticketCount: z.number().int().positive(),
      lottery: LotterySchema,
    })
  ),
  pagination: z.object({
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    hasMore: z.boolean(),
  }),
});

export type UserLotteriesResponse = z.infer<typeof UserLotteriesResponseSchema>;
```

**Tests**: Schema validation, edge cases (invalid dates, negative probabilities, etc.)

#### 1.3 Zustand Store (`src/features/home/model/lotteryStore.ts`)
```typescript
interface LotteryState {
  // Data
  lotteries: LotteryParticipation[];
  pagination: PaginationState;
  
  // UI
  isLoading: boolean;
  error: { code: string; message: string } | null;
  isOffline: boolean;
  scrollPosition: number;
  
  // Actions
  setLotteries: (lotteries: LotteryParticipation[]) => void;
  setPagination: (pagination: PaginationState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: State['error']) => void;
  setOffline: (offline: boolean) => void;
  setScrollPosition: (pos: number) => void;
  reset: () => void;
}

const useLotteryStore = create<LotteryState>((set) => ({
  // Initial state
  lotteries: [],
  pagination: { page: 1, pageSize: 10, total: 0, hasMore: false },
  isLoading: false,
  error: null,
  isOffline: false,
  scrollPosition: 0,
  
  // Actions
  setLotteries: (lotteries) => set({ lotteries }),
  setPagination: (pagination) => set({ pagination }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setOffline: (isOffline) => set({ isOffline }),
  setScrollPosition: (scrollPosition) => set({ scrollPosition }),
  reset: () => set({
    lotteries: [],
    pagination: { page: 1, pageSize: 10, total: 0, hasMore: false },
    isLoading: false,
    error: null,
    scrollPosition: 0,
  }),
}));

export default useLotteryStore;
```

**Tests**: Store actions, state immutability, reset functionality

---

### Phase 2: API & Server State (2 days)

#### 2.1 TanStack Query Hooks (`src/features/home/api/queries.ts`)
```typescript
export const lotteryKeys = {
  all: ['lotteries'],
  lists: () => [...lotteryKeys.all, 'list'],
  list: (page: number) => [...lotteryKeys.lists(), page],
};

export function useUserLotteries(page: number) {
  return useQuery({
    queryKey: lotteryKeys.list(page),
    queryFn: async () => {
      // Validate request
      const req = UserLotteriesRequestSchema.parse({ page, pageSize: 10 });
      
      // Fetch from API
      const response = await apiClient.get('/user/lotteries', {
        params: req,
      });
      
      // Validate response
      return UserLotteriesResponseSchema.parse(response.data);
    },
    staleTime: 5 * 60 * 1000,        // 5 minutes
    cacheTime: 10 * 60 * 1000,       // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry 4xx errors (auth, validation)
      if (error instanceof AxiosError && error.status?.startsWith('4')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
```

**Tests**: Query hooks, mocked API responses, error scenarios, cache behavior

#### 2.2 API Client Integration (`src/shared/api/client.ts`)
- Ensure endpoints `/user/lotteries?page=1&pageSize=10` exist
- Add error handling: network errors, timeouts, 5xx retries
- Token refresh if 401 received

---

### Phase 3: UI Components (3-4 days)

#### 3.1 LotteryCard Component (`src/features/home/ui/LotteryCard.tsx`)
- **Props**: `lottery: LotteryParticipation`, `onPress?: () => void`
- **Display**: Name, draw date, prize amount, probability, ticket count, status badge
- **Color Scheme**: 
  - Status OPEN: primary (purple)
  - Status DRAWN: secondary (cyan)
  - Status CANCELLED: gray
- **Accessibility**: 44pt minimum tap area, semantic HTML, alt text for icons
- **Tests**: Rendering all fields, status colors, tap handling, accessible label

#### 3.2 LotteryList Component (`src/features/home/ui/LotteryList.tsx`)
- **Infinite Scroll**: FlatList with `onEndReached` trigger at 80% scroll
- **Loading**: Show skeleton loaders while loading pagination
- **Debounce**: Prevent rapid pagination requests (debounce 300ms)
- **Sort**: Sort by draw date ascending (already from API)
- **Key Props**: `keyExtractor={item => item.lottery.id}`
- **Tests**: Rendering initial 10, scroll triggering load, debounce, error recovery

#### 3.3 EmptyLotteryState Component (`src/features/home/ui/EmptyLotteryState.tsx`)
- **Message**: "No lotteries yet. Explore raffles to join!"
- **CTA**: Link to "Explore" or "Browse Raffles" feature
- **Icon**: Use accent color (orange)
- **Tests**: Rendering, CTA navigation

#### 3.4 OfflineOverlay Component (`src/features/home/ui/OfflineOverlay.tsx`)
- **Display**: "Sin conexión" message overlaying list
- **Behavior**: Disable pagination, allow scroll of cached items
- **Icon**: Offline icon, muted colors
- **Tests**: Visibility based on offline state, no pagination

#### 3.5 HomeScreen Update (`src/features/home/ui/HomeScreen.tsx`)
```typescript
export function HomeScreen() {
  const { lotteries, pagination, isLoading, error, isOffline } = useLotteryStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Monitor network status
  useEffect(() => {
    const subscription = NetInfo.addEventListener((state) => {
      useLotteryStore.setState({ isOffline: !state.isConnected });
    });
    return () => subscription();
  }, []);
  
  // Load initial lotteries on mount
  useEffect(() => {
    loadLotteries(1);
  }, []);
  
  const loadLotteries = async (page: number) => {
    useLotteryStore.setState({ isLoading: true });
    try {
      const result = await queryClient.fetchQuery({
        queryKey: lotteryKeys.list(page),
        queryFn: () => useUserLotteries(page),
      });
      useLotteryStore.setState({
        lotteries: page === 1 ? result.data : [...lotteries, ...result.data],
        pagination: result.pagination,
        error: null,
      });
    } catch (err) {
      useLotteryStore.setState({
        error: { code: 'LOAD_ERROR', message: 'Unable to load lotteries' },
      });
    } finally {
      useLotteryStore.setState({ isLoading: false });
    }
  };
  
  const handlePullToRefresh = () => loadLotteries(1);
  
  const handlePaginationEnd = () => {
    if (!isOffline && !isLoading && pagination.hasMore) {
      loadLotteries(pagination.page + 1);
    }
  };
  
  if (lotteries.length === 0 && !isLoading) {
    return <EmptyLotteryState />;
  }
  
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']}>
      <FlatList
        data={lotteries}
        renderItem={({ item }) => <LotteryCard lottery={item} />}
        onEndReached={handlePaginationEnd}
        onEndReachedThreshold={0.2}
        refreshing={isLoading && pagination.page === 1}
        onRefresh={handlePullToRefresh}
        ListEmptyComponent={<EmptyLotteryState />}
      />
      {isOffline && <OfflineOverlay />}
      {error && (
        <ErrorBanner
          message={error.message}
          onRetry={() => loadLotteries(pagination.page)}
        />
      )}
    </SafeAreaView>
  );
}
```

**Tests**: Component rendering, scroll triggering, pull-to-refresh, error display, offline overlay

---

### Phase 4: Integration & Testing (2-3 days)

#### 4.1 Unit Tests (80% coverage minimum)
- **Types**: 2 test files (home/model/types.ts)
- **Contracts**: 3 test files (home/api/contracts.ts)
- **Store**: 3 test files (home/model/lotteryStore.ts)
- **Queries**: 4 test files (home/api/queries.ts)
- **Hooks**: 2 test files (home/hooks/useLotteryList.ts)
- **Components**: 6 test files (LotteryCard, LotteryList, EmptyState, OfflineOverlay, integration)

#### 4.2 Component Integration Tests
- Render HomeScreen with mocked queries
- Verify initial 10 items load
- Simulate scroll to end → verify next 10 items load
- Test error state + retry
- Test offline mode (disable pagination)
- Test pull-to-refresh

#### 4.3 E2E Tests (Detox)
- User logs in → Home screen shows lotteries
- User scrolls → pagination loads automatically
- User sees all lotteries after scrolling through all pages
- User disconnects network → sees "Sin conexión", can still scroll cached items
- User reconnects → pull-to-refresh works

---

## IV. Task Breakdown

### Subtask Structure
Each task follows Constitution naming: PascalCase components, camelCase hooks/stores.

| ID | Task | Scope | Est. Days | Dependencies |
|----|------|-------|----------|--------------|
| 1.1 | Create domain types & store | types.ts, lotteryStore.ts | 0.5 | - |
| 1.2 | Create API contracts | contracts.ts (Zod schemas) | 0.5 | 1.1 |
| 1.3 | Unit tests for types/contracts | types.test.ts, contracts.test.ts | 1 | 1.1, 1.2 |
| 2.1 | Create TanStack Query hooks | queries.ts | 1 | 1.2 |
| 2.2 | Create useLotteryList hook | hooks/useLotteryList.ts | 0.5 | 2.1 |
| 2.3 | Integration tests (API) | queries.test.ts, hook.test.ts | 1 | 2.1, 2.2 |
| 3.1 | Create LotteryCard component | LotteryCard.tsx | 1 | 1.1 |
| 3.2 | Create LotteryList component | LotteryList.tsx (FlatList) | 1.5 | 1.1, 2.1 |
| 3.3 | Create EmptyLotteryState | EmptyLotteryState.tsx | 0.5 | - |
| 3.4 | Create OfflineOverlay | OfflineOverlay.tsx | 0.5 | 1.1 |
| 3.5 | Update HomeScreen | HomeScreen.tsx integration | 1 | 3.1-3.4 |
| 4.1 | Component tests | *.test.tsx (all) | 2 | 3.1-3.5 |
| 4.2 | E2E tests (Detox) | e2e/lotteries.e2e.ts | 1.5 | 3.5 |
| 4.3 | Performance review | Bundle size, memory leaks | 0.5 | 4.1, 4.2 |
| 4.4 | Code review & polish | Linting, accessibility, docs | 1 | 4.1-4.3 |

**Total Effort**: 14.5 days (2.9 weeks, ~40 story points)

---

## V. Quality Gates

### Before Merge
- [ ] TypeScript: `tsc --noEmit` (0 errors)
- [ ] Lint: ESLint (0 errors)
- [ ] Tests: Jest (≥80% coverage, all pass)
- [ ] Tests: E2E (Detox, all pass)
- [ ] Bundle: <+50KB added
- [ ] Security: No high/critical vulns
- [ ] Accessibility: All components 44pt+ touch targets

### Code Review Checklist
- [ ] Constitution compliance verified
- [ ] Feature-sliced architecture followed
- [ ] Zustand + TanStack Query used correctly
- [ ] Zod schemas validate all inputs
- [ ] Error handling with Result pattern
- [ ] Loading/error/empty states all present
- [ ] Tests colocated and comprehensive
- [ ] No `any` types, strict TypeScript
- [ ] Offline mode tested
- [ ] Performance acceptable (<2s initial load, <1.5s pagination)

---

## VI. Risk & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **API Latency** | Pagination slow | Medium | Implement query caching, placeholder UI, skeleton loaders |
| **Memory Leak** | Scroll performance degrades | Medium | Memoize components, clean up subscriptions, test with 1000+ items |
| **Offline Edge Case** | User confusion | Low | Clear "Sin conexión" messaging, allow cached scroll |
| **Network Timeout** | Failed pagination | Medium | Retry logic, error recovery with user action |
| **Scope Creep** | Timeline extension | Medium | Strict P1/P2/P3 prioritization, P3 features (scroll pos) deferred to v2 |

---

## VII. Success Metrics

### Development
- **Code Quality**: 0 ESLint errors, 0 TS errors, ≥80% test coverage
- **Performance**: Initial load <2s, pagination <1.5s, bundle +<50KB
- **Type Safety**: 0 `any` types, 100% explicit return types

### User Experience
- **SC-001**: 95% of users see 10 lotteries within 2s of login
- **SC-002**: Infinite scroll loads without manual action; 95% success rate
- **SC-003**: Offline mode prevents user confusion; error messages clear
- **SC-004**: Zero duplicate lotteries in list; pagination accurate

### Compliance
- **Constitution**: 14/14 principles verified in code review
- **Architecture**: Feature-sliced, clean dependency graph
- **Testing**: All user flows (happy path, error, offline) covered

---

## VIII. Rollout Plan

### Release Strategy
1. **v0.2.0 (Current MVP)**: Implement P1 stories (initial list + infinite scroll)
2. **v0.2.1 (Patch)**: Add P2 features (retry logic, error handling)
3. **v0.3.0 (Next minor)**: Add P3 features (scroll position preservation)

### Deployment
- Deploy to staging → run Detox E2E tests
- Deploy to production with feature flag (50% rollout)
- Monitor Sentry for errors; if <1% error rate, rollout to 100%
- Revert flag if issues detected

### Monitoring
- Track in Sentry: slow pagination requests, offline errors
- Log lottery list impressions, scroll depth, pagination interactions
- Dashboard: avg load time, success rate, user retention

---

## IX. Documentation

### Code Documentation
- JSDoc comments on all public APIs
- Inline comments for complex logic (pagination logic, debounce)
- Type descriptions in Zod schemas (`.describe()`)

### Integration Docs
- API contract overview in `src/features/home/api/README.md`
- State management flow in `src/features/home/model/README.md`
- Component hierarchy diagram

### User Docs
- "How to browse lotteries" (in-app help)
- Accessibility guide (for support team)

---

## X. Next Steps

1. **Create Feature Branch**: (Already created: `001-list-lotteries-pagination`)
2. **Start Phase 1**: Implement domain types & contracts
3. **Daily Standups**: 15-min sync, blockers/progress
4. **Code Reviews**: Pair review (architecture + implementation)
5. **Weekly Demo**: Show progress to stakeholders

---

**Created by**: Speckit Plan Agent  
**Last Updated**: 2025-12-17  
**Status**: 🟢 Ready to Implement
