# Feature Specification: User Lottery Listing with Pagination

**Feature Branch**: `001-list-lotteries-pagination`  
**Created**: December 17, 2025  
**Status**: Draft  
**Input**: User description: "Después de iniciar sesión se debe listar los sorteos en los que está participando el usuario en sesión, se deben listar sólo 10 sorteos y a medida que el usuario se va desplazando debería listarse 10 más hasta listarse todos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Initial Lottery List (Priority: P1)

After successful login, the user sees a paginated list of lotteries they are participating in. The initial view displays the first 10 lotteries from their participation list.

**Why this priority**: This is the core functionality. Without displaying the user's lotteries, the feature has no value. It directly addresses the user's primary need post-login.

**Independent Test**: Can be fully tested by logging in with a user account and verifying that the Home Screen displays exactly 10 lotteries (or fewer if the user participates in fewer than 10), delivering the foundational lottery discovery experience.

**Acceptance Scenarios**:

1. **Given** user is logged in and participates in 25 lotteries, **When** home screen loads, **Then** exactly 10 lotteries are displayed in initial view
2. **Given** user is logged in and participates in 5 lotteries, **When** home screen loads, **Then** all 5 lotteries are displayed (fewer than 10)
3. **Given** user is logged in with no lottery participations, **When** home screen loads, **Then** empty state message "No lotteries available" is displayed
4. **Given** home screen is displayed with lotteries, **When** user views the list, **Then** each lottery shows: name, draw date, ticket count, status, prize amount, probability of winning, and last update date

---

### User Story 2 - Infinite Scroll Pagination (Priority: P1)

As the user scrolls down the lottery list and reaches near the bottom, the next batch of 10 lotteries automatically loads without user interaction, creating a seamless infinite scroll experience.

**Why this priority**: This enables users to explore all their lotteries without manual pagination controls. It's core functionality paired with Story 1 to complete the feature.

**Independent Test**: Can be fully tested by logging in with 30+ lotteries, scrolling to the bottom of the visible list, and confirming 10 more items appear automatically without page reload or action button.

**Acceptance Scenarios**:

1. **Given** user scrolled to bottom of 10-item list (participates in 25 total), **When** scroll position reaches last visible item, **Then** next 10 lotteries load automatically within 2 seconds
2. **Given** 20 lotteries are loaded and user scrolls to bottom, **When** remaining 5 lotteries exist, **Then** final 5 lotteries load and no additional requests are made
3. **Given** user is scrolling through list, **When** new items are loading, **Then** loading indicator appears (skeleton or spinner)
4. **Given** new lotteries loaded via scroll, **When** user views them, **Then** transition is smooth without layout shift or flicker

---

### User Story 3 - Retry Failed Pagination Loads (Priority: P2)

If a pagination request fails due to network issues, the user sees an error state with a retry option, allowing them to attempt loading more lotteries.

**Why this priority**: Network failures are common in mobile apps. Providing retry capability improves resilience without requiring app reload. It's valuable but not critical for core functionality.

**Independent Test**: Can be fully tested by simulating a network failure during pagination load and verifying error message with retry button appears; retrying successfully loads the items.

**Acceptance Scenarios**:

1. **Given** user scrolls to trigger pagination and network fails, **When** API request fails, **Then** error message "Unable to load more lotteries" displays with "Retry" button
2. **Given** error state is displayed with retry button, **When** user taps retry, **Then** system attempts to load next batch again
3. **Given** retry succeeds after initial failure, **When** lotteries load, **Then** error state is cleared and items are displayed

---

### User Story 4 - Scroll Position Preservation (Priority: P3)

When user navigates away from the Home Screen and returns, the scroll position is restored to where they left off.

**Why this priority**: Enhances UX by maintaining context during navigation, but not essential for MVP. Users can scroll again if needed.

**Independent Test**: Can be tested by scrolling to middle of list, navigating away, and returning to verify scroll position is restored.

**Acceptance Scenarios**:

1. **Given** user scrolled to position showing item #15-16, **When** navigates to lottery detail and back, **Then** list scrolls back to previously viewed position
2. **Given** scroll position is stored, **When** session is closed and app reopened, **Then** scroll position is NOT restored (session-scoped only)

---

### Edge Cases

- What happens when user participates in 0 lotteries? → Display empty state with message
- What happens when user participates in exactly 10 lotteries? → Display all 10, no pagination needed
- What happens when network is offline during scroll pagination? → Show error with retry option
- What happens if API returns fewer items than expected? → Handle gracefully, no infinite requests
- What happens if user scrolls very quickly? → Prevent multiple simultaneous requests via debouncing
- What happens if pagination data is corrupted? → Show error state, allow retry

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve the current authenticated user's lottery participation list from API
- **FR-002**: System MUST initially display exactly 10 lotteries (or fewer if user participates in fewer than 10)
- **FR-003**: System MUST load the next 10 lotteries when user scrolls near the bottom (within 1-2 items of list end)
- **FR-004**: System MUST prevent duplicate lottery requests during rapid scrolling (debounce/throttle pagination triggers)
- **FR-005**: System MUST display a loading indicator while fetching pagination results
- **FR-006**: System MUST continue loading until all user lotteries are displayed
- **FR-007**: System MUST handle API failures gracefully with error message and retry option
- **FR-008**: System MUST display each lottery with: lottery name, draw date, ticket count, participation status, prize amount, probability of winning, and last update date
- **FR-009**: System MUST display empty state message when user has no lottery participations
- **FR-010**: System MUST refresh the lottery list when user returns to Home Screen from another screen
- **FR-011**: System MUST sort lotteries by draw date in ascending order (most imminent draws first)
- **FR-012**: System MUST support pull-to-refresh manual refresh action (no automatic background refresh)
- **FR-013**: System MUST disable list and display "Sin conexión" message when network is offline

### Key Entities

- **User**: Authenticated user making the request (has many Lottery Participations)
- **LotteryParticipation**: Represents a user's participation in a lottery (has Lottery, has Tickets)
- **Lottery**: The lottery entity (name, draw date, description, status, prize info)
- **Pagination**: Offset-based or cursor-based pagination state (page, pageSize=10, total)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Initial lottery list loads within 2 seconds on typical 4G connection
- **SC-002**: Pagination load (next 10 items) completes within 1.5 seconds
- **SC-003**: Users can scroll through 100+ lotteries without app lag or memory issues
- **SC-004**: 95% of users successfully discover their lotteries without support intervention
- **SC-005**: Zero unintended duplicate lottery displays in list
- **SC-006**: Error recovery (retry) succeeds 95% of the time after user action
- **SC-007**: Empty state displays immediately for users with zero lottery participations
- **SC-008**: Scroll position preserved during session (before app close)

## Assumptions

- User is already authenticated (login is complete)
- Backend API supports pagination with limit/offset or cursor parameters
- Lottery data changes are infrequent; real-time updates not required for MVP
- Network connectivity can be intermittent; app must handle gracefully
- List can handle 100+ lotteries without performance degradation
- Draw dates and lottery metadata are always available and valid

## Clarifications

### Session 2025-12-17

- Q: ¿En qué orden deben aparecer los sorteos? → A: Orden ascendente por fecha de sorteo (más próximos primero)
- Q: ¿Qué detalles adicionales mostrar en cada tarjeta? → A: Monto del premio + Probabilidad de ganar + Fecha de última actualización
- Q: ¿Cuándo y cómo refresca la lista? → A: Solo pull-to-refresh manual (sin refresco automático)
- Q: ¿Comportamiento en modo offline? → A: Mostrar mensaje "Sin conexión" y deshabilitar lista
