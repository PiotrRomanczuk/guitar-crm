# Spotify Matches Admin UI

## Overview
The Spotify Matches page provides a clean, modern interface for managing Spotify data synchronization across the song library.

## Location
`/dashboard/admin/spotify-matches`

## Access
Available to Admin and Teacher roles via the sidebar navigation.

## Features

### 1. Statistics Dashboard (4 Cards)
Displays real-time metrics:
- **Total Songs**: Total count of songs in the library
- **With Spotify**: Count and percentage of songs with Spotify data (green)
- **Without Spotify**: Count of songs needing sync (orange)
- **Coverage**: Overall percentage with quality indicator (Excellent/Good/Needs work)

### 2. Sync Actions
Two primary sync buttons in the header:
- **Sync 20**: Process 20 songs without Spotify data
- **Sync 50**: Batch process 50 songs

Both buttons:
- Show loading state with spinning icon during sync
- Disabled during active sync operations
- Display as full-width on mobile, auto-width on desktop

### 3. Sync Results Display
After sync completion, shows detailed results:
- **4 Result Cards**:
  - Total Processed
  - Updated (green border)
  - Skipped (orange border)
  - Failed (red border)
- **Error List**: Expandable list of any errors encountered (max-height with scroll)

### 4. Tabbed Content

#### Pending Sync Tab
Lists songs without Spotify data:
- Song icon placeholder (gray background)
- Song title (truncated if too long)
- Artist name (muted text)
- "No Spotify" badge (orange)
- Edit button linking to song detail page

**Empty State**: "All synced!" message with checkmark icon when no songs pending

#### Recently Synced Tab
Shows recently updated songs:
- Album artwork (if available) or music icon placeholder
- Song title and artist
- "Synced" badge (green)
- External link to Spotify (opens in new tab)

**Empty State**: "No recent syncs" message when tab is empty

## UI Design Standards Compliance

### Layout
✅ Container with `max-w-7xl` for optimal reading width
✅ Responsive padding: `px-4 sm:px-6 lg:px-8`
✅ Vertical spacing: `space-y-6 sm:space-y-8`

### Typography
✅ Page title: `text-2xl sm:text-3xl font-bold tracking-tight`
✅ Description: `text-sm text-muted-foreground`
✅ Card titles: `text-3xl` for stats
✅ Body text: `text-sm` for descriptions

### Colors & Status
✅ Success (Synced): `bg-green-500/10 text-green-600 border-green-500/20`
✅ Warning (Pending): `bg-orange-500/10 text-orange-600 border-orange-500/20`
✅ Error: `bg-destructive/10 border-destructive/20`
✅ Neutral: `bg-muted text-muted-foreground`

### Components
✅ Cards: Using shadcn/ui Card components with proper structure
✅ Buttons: Using shadcn/ui Button with variants (default, outline, ghost)
✅ Badges: Using shadcn/ui Badge with custom colors
✅ Progress: Using shadcn/ui Progress for coverage visualization
✅ Tabs: Using shadcn/ui Tabs for content organization

### Mobile Design
✅ Touch targets: Minimum 44x44px (buttons use `h-8` minimum with padding)
✅ Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
✅ Full-width buttons on mobile: `w-full sm:w-auto`
✅ Stacked layout on mobile: `flex-col sm:flex-row`
✅ Responsive text sizes: `text-sm sm:text-base`

### Accessibility
✅ External links open in new tab with `rel="noopener noreferrer"`
✅ Icon buttons have descriptive hover states
✅ Loading states clearly indicated
✅ Proper semantic HTML structure
✅ Color not the only indicator (text + icons used)

### Animations
✅ Spin animation on sync button during loading
✅ Smooth transitions: `transition-all duration-200`
✅ Hover states: `hover:border-primary/30`

## User Experience Flow

1. **View Status**: Admin sees current sync coverage at a glance
2. **Identify Gaps**: Orange card shows count of songs needing sync
3. **Initiate Sync**: Click "Sync 20" or "Sync 50" based on workload
4. **Monitor Progress**: Button shows spinning state, disabled during sync
5. **Review Results**: Success toast + detailed result card appears
6. **Verify**: Switch to "Recently Synced" tab to see newly updated songs
7. **Manage**: Click external link icon to verify Spotify data, or edit icon to modify song details

## Error Handling

- Network errors: Display error toast with message
- API errors: Show error toast and populate errors list in result card
- No matches found: Info toast explaining no Spotify matches were found
- Partial failures: Warning toast directing user to review error details

## Performance Considerations

- Limits: Queries limited to 100 pending and 50 recent songs to maintain fast load times
- Pagination: Could be added in future if lists grow beyond these limits
- Debouncing: 200ms delay between API requests in sync endpoint (backend)
- Real-time updates: Uses Next.js router.refresh() to update data after sync

## Future Enhancements (Out of Scope)

- Individual song sync (currently batch only)
- Manual match selection for ambiguous results
- Sync scheduling/automation
- Detailed match confidence scores
- Bulk edit operations
