# UI Unification Plan: Guitar CRM

This plan outlines the steps to refactor the Guitar CRM application to fully utilize the `shadcn/ui` design system, ensuring consistency, accessibility, and maintainability.

## Phase 1: Infrastructure & Component Installation
**Goal:** Ensure all necessary UI primitives are available in `components/ui`.

- [ ] Install `select` (for filters and forms)
- [ ] Install `alert` (for success/error messages)
- [ ] Install `alert-dialog` (for destructive actions)
- [ ] Install `sheet` (for mobile navigation)
- [ ] Install `form` (for react-hook-form integration)
- [ ] Install `dropdown-menu` (for user menu and actions)
- [ ] Install `dialog` (for modals)
- [ ] Install `popover` (for date pickers/comboboxes)
- [ ] Install `command` (for search/comboboxes)
- [ ] Verify existing `table`, `badge`, `button`, `card`, `input`, `avatar`.

## Phase 2: Dashboard & Layout Refactor
**Goal:** Update the main application shell and dashboard to use the design system.

- [ ] **Dashboard Shell**: Replace custom mobile nav with `Sheet`.
- [ ] **Dashboard Header**: Implement `DropdownMenu` for User Nav.
- [ ] **Dashboard Page**: Ensure Stats Cards use the standard `Card` component correctly.

## Phase 3: Feature Modules Refactor (Data Heavy)
**Goal:** Standardize data presentation across feature modules.

### Assignments
- [ ] Refactor `AssignmentsList.tsx`:
    - Replace manual `<select>` with `Select` component.
    - Replace manual `<table>` with `Table` component.

### Songs
- [ ] Refactor `SongList/Table.tsx`:
    - Replace manual `<table>` with `Table` component.
- [ ] Refactor `DeleteConfirmationDialog.tsx`:
    - Replace custom modal with `AlertDialog`.

### Users
- [ ] Refactor `UsersListTable.tsx`:
    - Replace manual `<table>` with `Table` component.
    - Ensure `Badge` is used for roles/status.

## Phase 4: Forms & Settings
**Goal:** Standardize user input and feedback.

### Settings
- [ ] Refactor `SettingsPageClient.tsx`:
    - Replace manual alert divs with `Alert` component.

### Profile
- [ ] Refactor `ProfileForm.tsx`:
    - Wrap inputs in `Form` component (react-hook-form integration).

## Execution Strategy
We will proceed phase by phase. Each refactor should be verified to ensure functionality is preserved.
