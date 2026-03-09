# Student Mobile UX Analysis

**Date:** 2026-03-09
**Version Analyzed:** 0.83.0
**Scope:** Student-facing views on mobile devices (< 768px)

---

## Executive Summary

Strummy has a solid foundation for student mobile UX — a dedicated bottom navigation bar, responsive padding/spacing, role-based menu filtering, and touch-friendly card components. However, the student experience still feels like a "scaled-down teacher dashboard" rather than a purpose-built mobile learning companion. This analysis identifies 15 concrete improvement areas, prioritized by impact.

---

## Current Student Mobile Architecture

### What Students See
- **Dashboard** (`StudentDashboardClient`) — Welcome message, Practice Today, Next/Last Lesson, Stats Grid, Progress Chart, Song Library, Practice Timer, Recent Activity, Assignments
- **My Lessons** (`StudentLessonsPageClient`) — Chronological list of all lessons with badges
- **My Songs** (`StudentSongsPageClient`) — Filterable card grid with status selectors
- **Song Detail** (`StudentSongDetailPageClient`) — Full song info: metadata grid, strumming, chords, lyrics, YouTube embed, resources, gallery, status history
- **My Assignments** (`StudentAssignmentsPageClient`) — Card grid with status transitions
- **My Stats** — Progress statistics page
- **My Repertoire** — Song collection view
- **Theory** — Music theory content

### Mobile Navigation
- **Top bar** (`HorizontalNav`): Logo + notification bell + theme toggle + settings dropdown
- **Bottom nav** (`MobileBottomNav`): Home | Lessons | Songs | Stats | More
- **More menu** (`MobileMoreMenu`): Overflow items like Assignments, Theory, Repertoire

---

## 15 Improvement Areas

### 1. Dashboard Information Overload on Mobile

**Current state:** The student dashboard stacks 8+ sections vertically:
Welcome → Song of the Week → Practice Today → Stats Grid → Next Lesson → Last Lesson → (Progress Chart + Song Library) → (Practice Timer + Recent Activity + Assignments)

**Problem:** On a 375px mobile screen, students must scroll through 4-5+ screen heights to see everything. There's no hierarchy signaling what matters most right now. The `lg:grid-cols-3` layout at the bottom collapses to a single column, making it even longer.

**File:** `components/dashboard/student/StudentDashboardClient.tsx:114-183`

**Recommendation:**
- Collapse the dashboard into 3 priority zones: (1) Next Action (next lesson + due assignments), (2) Practice Focus (today's songs), (3) Everything Else (collapsible)
- Add a "quick actions" floating bar or swipeable card carousel for the most important items
- Move Progress Chart, Recent Activity, and Song Library behind a "View All" tap

**Impact:** High | **Effort:** Medium

---

### 2. Lesson Notes Hidden on Mobile

**Current state:** In `StudentLessonsPageClient.tsx:166`, lesson notes are wrapped in `hidden md:block`:

```tsx
<div className="hidden md:block md:max-w-xs lg:max-w-md bg-secondary/30 rounded-lg p-3 text-sm truncate">
  <p className="text-muted-foreground italic truncate">&quot;{lesson.notes}&quot;</p>
</div>
```

**Problem:** Lesson notes are completely invisible on mobile. These are arguably the most valuable piece of information for a student — what the teacher said about the lesson, what to focus on, homework notes. Hiding them defeats the purpose of a student view.

**File:** `components/lessons/student/StudentLessonsPageClient.tsx:166-170`

**Recommendation:**
- Show a truncated preview of notes (1-2 lines) on mobile with "Read more" expansion
- Or show notes as a collapsible section within the lesson card
- Consider making notes the primary content after the lesson title, not secondary metadata

**Impact:** High | **Effort:** Low

---

### 3. Badge Overload on Lesson Cards

**Current state:** Each lesson card displays 4 badges inline: Date, Time, Duration, Status. On mobile (< 640px), these wrap within `flex-wrap` but have no visual grouping.

**File:** `components/lessons/student/StudentLessonsPageClient.tsx:134-150`

**Problem:** Four small badges on a ~340px container feel cluttered. The date/time information is the most important for students (when is my lesson?) but it competes visually with duration and status for attention.

**Recommendation:**
- Combine date and time into a single, prominent display (e.g., "Mon, Mar 10 at 3:00 PM")
- Move duration to secondary text
- Make status a colored left-border accent on the card rather than a badge
- Show the most relevant temporal info: "In 2 days" or "Last Tuesday" for quick scanning

**Impact:** Medium | **Effort:** Low

---

### 4. Song Detail Page is Excessively Long on Mobile

**Current state:** `StudentSongDetailPageClient.tsx` renders up to 10 sequential sections:
1. Back link + Header (title, author, status selector)
2. Cover image (up to `max-w-md aspect-square`)
3. Details grid (Difficulty, Key, Tempo, Time Sig, Duration, Released, Capo, Category — up to 8 cards)
4. Strumming pattern
5. Chord progression
6. Lyrics & Chords (`max-h-[60vh]` scrollable area)
7. YouTube video embed
8. Learning Resources links
9. Related Lessons
10. Gallery images
11. Status History

**Problem:** This creates an extremely long scrolling experience. A student in a lesson wanting to quickly check chords has to scroll past the cover image, 8 metadata cards, and the strumming pattern to get there. The `max-h-[60vh]` lyrics section creates a scroll-within-a-scroll, which is disorienting on touch devices.

**File:** `components/songs/student/StudentSongDetailPageClient.tsx:352-519`

**Recommendation:**
- Add tabbed navigation or an anchor-link quick-jump bar at the top (e.g., Info | Chords | Lyrics | Video | Resources)
- Collapse metadata grid into a compact 2-column layout on mobile (currently `grid-cols-1` on mobile means 8 full-width cards stacked)
- Make the cover image smaller on mobile or move it inline with the header
- Consider a "Practice Mode" that shows only chords + lyrics + strumming in a clean, full-screen view

**Impact:** High | **Effort:** Medium

---

### 5. No Pull-to-Refresh or Refresh Mechanism

**Current state:** All student pages (`StudentLessonsPageClient`, `StudentSongsPageClient`, `StudentAssignmentsPageClient`) fetch data once on mount via `useEffect`. There is no refresh mechanism, pull-to-refresh gesture, or stale data indicator.

**Problem:** Mobile students who keep the app open in a browser tab will see stale data. After a lesson where the teacher updates song statuses or adds assignments, the student has to fully reload the page. This feels broken on mobile where users expect apps to stay fresh.

**Recommendation:**
- Add pull-to-refresh using a library like `react-pull-to-refresh` or a custom implementation
- Use TanStack Query's `refetchOnWindowFocus` and `staleTime` for automatic background refreshes
- Show a "New updates available" toast when data changes (via Supabase Realtime subscriptions)

**Impact:** High | **Effort:** Medium

---

### 6. No Offline or Low-Connectivity Support

**Current state:** The app has a `manifest.json` (PWA-ready) and `appleWebApp` metadata, but there's no service worker, offline fallback, or cached data strategy. Every page requires a network fetch.

**Problem:** Guitar students often practice in locations with poor connectivity (basement studios, parks, commuting). If they lose connection mid-practice, the entire app becomes unusable. Song lyrics, chord charts, and strumming patterns are all lost.

**Recommendation:**
- Implement a service worker that caches the student's assigned songs, chords, and lyrics for offline access
- Add offline indicators and graceful degradation (show cached data with "Offline" badge)
- Cache the most recent dashboard state in localStorage
- Prioritize caching static learning content (chords, lyrics, strumming patterns) over dynamic data

**Impact:** High | **Effort:** High

---

### 7. Song Card Information Density on Mobile

**Current state:** Each `StudentSongCard` contains: cover image/icon, difficulty badge, status badge, title, artist, key info, chords info, learning progress dropdown, 4 resource buttons (YouTube/Tabs/Spotify/Audio), and a "View Full Details" button.

**File:** `components/songs/student/StudentSongCard.tsx:62-226`

**Problem:** A single song card on mobile spans ~400px height. With even 5-6 songs, the student is scrolling through 2400px+ of card content. The resource buttons (YouTube, Tabs, Spotify, Audio) in a 2-column grid within each card take significant space, and many songs may not have all 4 resources.

**Recommendation:**
- Create a compact card variant for mobile: show just cover/icon + title + artist + status badge + progress selector
- Move resources and details behind the "View Full Details" tap
- Or offer a list view toggle (like Spotify) as an alternative to the grid
- Consider a horizontal scrolling carousel for the "My Songs" section on mobile

**Impact:** Medium | **Effort:** Medium

---

### 8. Assignments Page Missing Quick-Action Patterns

**Current state:** Assignment cards show: icon, status badge, title, description, due date, assigned date, teacher name, then action buttons ("Start Working" / "Mark Complete") and "View Details".

**File:** `components/assignments/student/StudentAssignmentsPageClient.tsx:171-258`

**Problem:** The most common student action is "I finished this assignment" — marking it complete. But the "Mark Complete" button is at the bottom of a card after scrolling past metadata. Additionally, there's no visual urgency for overdue assignments and no countdown/days-remaining indicator for upcoming due dates.

**Recommendation:**
- Add swipe-to-complete gesture on mobile (swipe right to mark complete)
- Show "Due in X days" or "Overdue by X days" as the primary temporal indicator instead of raw dates
- Pin overdue assignments to the top with a warning banner
- Add a progress summary at the top: "3 of 5 assignments completed this week"

**Impact:** Medium | **Effort:** Medium

---

### 9. Mobile Bottom Nav Missing Assignments

**Current state:** The bottom nav shows: Home | Lessons | Songs | Stats | More. Assignments is in the "More" menu.

**File:** `components/navigation/MobileBottomNav.tsx:18-34`

**Problem:** Assignments are arguably one of the most important student actions (tracking homework). Burying them in "More" means students need two taps to reach their practice assignments. Stats is in the primary nav, but students likely check assignments far more frequently than stats.

**Recommendation:**
- Replace "Stats" in the bottom nav with "Tasks" (Assignments) for the student role
- Move Stats to the More menu instead
- Or use a dynamic 5th slot that shows whichever has pending items (assignments with due dates > stats)

**Impact:** Medium | **Effort:** Low

---

### 10. Full-Screen Loading Spinners Block the UI

**Current state:** Every student page shows a full-screen centered spinner during initial load:

```tsx
<div className="min-h-screen bg-background flex items-center justify-center">
  <Loader2 className="w-8 h-8 animate-spin text-primary" />
</div>
```

This appears in `StudentLessonsPageClient`, `StudentSongsPageClient`, `StudentAssignmentsPageClient`, and `StudentSongDetailPageClient`.

**Problem:** On slower mobile connections (3G, spotty WiFi), students see a blank screen with a spinner for 2-5+ seconds. There's no skeleton UI, no progressive loading, and no content above the fold to reassure users the page is loading. This feels especially slow because the navigation disappears (min-h-screen pushes content off viewport).

**Recommendation:**
- Replace full-screen spinners with skeleton screens that match the page layout
- Show the page header and navigation immediately (they don't require data)
- Use React Suspense boundaries at the data-dependent level, not the page level
- Add a subtle progress bar in the top nav (like YouTube/GitHub loading indicator)

**Impact:** High | **Effort:** Low

---

### 11. No Haptic/Vibration Feedback on Key Actions

**Current state:** There's a `useHaptic` hook imported in `StudentSongCard.tsx:27` and used for status changes, but it's only used in one place. Assignment completion, lesson interactions, and other actions don't provide haptic feedback.

**File:** `hooks/use-haptic.ts` (imported in `StudentSongCard.tsx`)

**Problem:** Mobile users expect tactile feedback for important actions (marking assignments complete, changing song status). The haptic hook exists but isn't applied consistently across the student experience.

**Recommendation:**
- Apply `useHaptic` to all student action buttons: assignment status changes, lesson interactions, navigation taps
- Use different haptic patterns for different actions: light tap for navigation, medium for status change, success pattern for completion
- Ensure haptic feedback fires on the button press, not after the API response

**Impact:** Low | **Effort:** Low

---

### 12. Chart Data is Mocked/Fake on Dashboard

**Current state:** In `StudentDashboardClient.tsx:48-80`, the weekly progress chart data is artificially constructed:

```tsx
const chartData = [
  { name: 'Mon', lessons: data.stats.completedLessons > 0 ? 1 : 0, ... },
  { name: 'Tue', lessons: data.stats.completedLessons > 1 ? 1 : 0, ... },
  ...
];
```

Song library data also has hardcoded values: `difficulty: 'Medium'`, `duration: '3:45'`, `studentsLearning: 12`.

**File:** `components/dashboard/student/StudentDashboardClient.tsx:48-89`

**Problem:** Students see progress data that doesn't reflect their actual activity. The chart shows fake weekly distribution. Song metadata shows incorrect difficulty and duration. This erodes trust in the platform — if a student notices the data is wrong, they'll stop trusting all metrics.

**Recommendation:**
- Fetch actual weekly lesson/practice data from the database (group by day of week)
- Remove hardcoded song metadata and use actual values from the songs table
- If data isn't available, show an honest empty state ("Not enough data yet") rather than fake numbers
- Add TODO tracking for the `song_status` issue noted in the code comment (line 103)

**Impact:** High | **Effort:** Medium

---

### 13. Song Status Vocabulary Inconsistency

**Current state:** The app uses two different status progressions:

**PracticeToday component** (`PracticeToday.tsx:10`):
`to_learn → started → remembered → with_author → mastered`

**StudentSongCard & Detail** (`StudentSongCard.tsx:41-49`):
`to_learn → learning → practicing → improving → mastered`

The `statusLabels` map in `StudentSongCard` includes entries for both vocabularies (lines 41-49), suggesting this is a known inconsistency.

**Problem:** A student might see their song labeled "Started" on the dashboard Practice Today card but see the selector options as "Learning / Practicing / Improving" on the song card. This is confusing and makes the progression unclear.

**Recommendation:**
- Pick ONE status vocabulary and use it everywhere
- The 5-step `to_learn → learning → practicing → improving → mastered` feels more natural for students
- Update `PracticeToday` and all backend references to use the consistent vocabulary
- Add a visual progress indicator (e.g., 5 dots/steps) showing where they are in the progression

**Impact:** Medium | **Effort:** Low

---

### 14. No Quick-Practice or "Start Practicing" Flow

**Current state:** The dashboard shows a `PracticeTimerCard` and a `PracticeToday` list, but there's no unified "start practicing" flow. A student who wants to practice has to:
1. Look at Practice Today to see what to practice
2. Tap into each song individually to see chords/lyrics
3. Manually start the practice timer
4. Navigate back and forth between songs

**Problem:** There's no streamlined practice session flow. Mobile students need a one-tap "Start Practice" experience that queues up their songs, shows relevant content, and tracks time — similar to how Spotify creates a playlist experience.

**Recommendation:**
- Add a prominent "Start Practice" button on the dashboard that launches a focused practice mode
- Practice mode: shows one song at a time with chords/lyrics/strumming, swipe to move to next song
- Integrate the practice timer into this mode (auto-start, track time per song)
- Show a practice summary at the end ("You practiced 3 songs for 25 minutes")
- Add practice streak tracking for motivation

**Impact:** High | **Effort:** High

---

### 15. Mobile Keyboard Pushes Content Off-Screen in Filters

**Current state:** `AppShell.tsx:14` imports a `useKeyboardViewport` hook, suggesting awareness of keyboard issues. The student songs page has a search filter (`StudentSongFilterControls`) and the assignments page has a status filter dropdown.

**Problem:** When students tap the search field on the songs page, the mobile keyboard appears and pushes content up. Combined with the fixed top and bottom navigation bars (total ~128px), the visible area shrinks dramatically. The filter controls themselves take additional space, leaving very little room to see results while typing.

**Recommendation:**
- Implement the keyboard viewport hook to resize the content area when the keyboard appears
- Consider hiding the bottom nav when the keyboard is open
- Make the search filter sticky at the top so results scroll beneath it
- Add debounced search so results update as the user types (reducing the need to dismiss the keyboard to see results)
- Consider a full-screen search overlay (like iOS Spotlight) that maximizes available space

**Impact:** Medium | **Effort:** Medium

---

## Priority Matrix

| # | Issue | Impact | Effort | Priority |
|---|-------|--------|--------|----------|
| 2 | Lesson notes hidden on mobile | High | Low | P1 |
| 3 | Badge overload on lesson cards | Medium | Low | P1 |
| 10 | Full-screen loading spinners | High | Low | P1 |
| 13 | Status vocabulary inconsistency | Medium | Low | P1 |
| 9 | Bottom nav missing Assignments | Medium | Low | P1 |
| 11 | Haptic feedback inconsistency | Low | Low | P2 |
| 1 | Dashboard information overload | High | Medium | P2 |
| 4 | Song detail page too long | High | Medium | P2 |
| 5 | No pull-to-refresh | High | Medium | P2 |
| 8 | Assignment quick-actions | Medium | Medium | P2 |
| 12 | Fake chart data on dashboard | High | Medium | P2 |
| 7 | Song card density | Medium | Medium | P3 |
| 15 | Keyboard + filter interaction | Medium | Medium | P3 |
| 14 | No practice session flow | High | High | P3 |
| 6 | No offline support | High | High | P4 |

---

## Key Files Referenced

| File | Lines | Issue |
|------|-------|-------|
| `components/dashboard/student/StudentDashboardClient.tsx` | 48-89, 114-183 | #1, #12 |
| `components/lessons/student/StudentLessonsPageClient.tsx` | 134-150, 166-170 | #2, #3 |
| `components/songs/student/StudentSongDetailPageClient.tsx` | 352-519 | #4 |
| `components/songs/student/StudentSongsPageClient.tsx` | 24-29 | #5, #10 |
| `components/songs/student/StudentSongCard.tsx` | 27, 41-49, 62-226 | #7, #11, #13 |
| `components/assignments/student/StudentAssignmentsPageClient.tsx` | 110-116, 171-258 | #8, #10 |
| `components/navigation/MobileBottomNav.tsx` | 18-34 | #9 |
| `components/dashboard/student/PracticeToday.tsx` | 10, 24-29 | #13 |
| `components/layout/AppShell.tsx` | 14, 107 | #15 |
| `hooks/use-haptic.ts` | — | #11 |
| `hooks/use-keyboard-viewport.ts` | — | #15 |

---

## Conclusion

The five highest-ROI fixes (P1 items: issues #2, #3, #9, #10, #13) require minimal effort but dramatically improve the student mobile experience. They involve showing hidden content, reducing visual noise, fixing navigation priorities, adding skeleton loading states, and unifying status labels. These should be addressed before tackling the medium-effort structural improvements (P2) or the larger feature additions (P3/P4).
