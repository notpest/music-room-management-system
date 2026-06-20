# UI Component Refactoring Plan

This plan outlines the steps to refactor components that were using the now-uninstalled UI libraries (`@nextui-org/react`, `@heroui/react`, `@mui/material`, `@chakra-ui/react`). The goal is to consolidate the UI to use Tailwind CSS and Framer Motion, with `react-day-picker` for calendar functionality.

**New Dependency to be added:**
* `react-day-picker`
* `date-fns` (peer dependency for `react-day-picker`)

---

### Phase 1: Global Provider Cleanup

#### 1.1. `app/providers.tsx`

*   **Analysis:** This file wraps the application in `NextUIProvider`. This is no longer needed.
*   **Plan:**
    *   Remove the `NextUIProvider` component.
    - The `ThemeProvider` from `next-themes` will remain.

---

### Phase 2: Component-by-Component Refactoring

#### 2.1. Modals (`components/ui/RBModal.tsx`, `components/ui/RegistrationModal.tsx`)

*   **Analysis:** These components use `Modal` from `@nextui-org/react`.
*   **Plan:**
    1.  Create a new generic, reusable `Modal.tsx` component in `components/ui/` using `Framer Motion` for enter/exit animations and a `div` styled with Tailwind CSS for the modal overlay and content area.
    2.  Refactor `RBModal.tsx` and `RegistrationModal.tsx` to use this new `Modal.tsx` component.
    3.  Replace `@nextui-org/react` `Input`, `Select`, and `Button` components inside `RegistrationModal.tsx` with basic HTML elements (`<input>`, `<select>`, `<button>`) styled with Tailwind CSS.

#### 2.2. Tables (`components/ui/DashboardTable.tsx`, `components/ui/EntryLogTable.tsx`, `components/ui/RBTable.tsx`, `components/ui/SlotsRequestTable.tsx`, `components/ui/TableApp.tsx`, `components/ui/TableEquip.tsx`)

*   **Analysis:** These components rely heavily on `@nextui-org/react` for table structure, pagination, and styling.
*   **Plan:**
    1.  For each table component, replace the NextUI table components (`<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`, etc.) with standard HTML `<table>` elements.
    2.  Apply Tailwind CSS classes for styling (e.g., `w-full`, `text-sm`, `text-left`, `divide-y`, `divide-gray-200`).
    3.  Re-implement functionality like pagination and sorting using React state and custom logic, or by introducing `tanstack-table` if the complexity warrants it. For this plan, we will assume custom state management is sufficient.

#### 2.3. Form Elements (various files)

*   **Analysis:** `Input`, `Select`, `Button`, `ToggleButtonGroup` are used across many components.
*   **Plan:**
    1.  **Inputs/Selects/Buttons:** Systematically replace all instances of `@nextui-org/react`'s `Input`, `Select`, `Button` with styled HTML elements. Create reusable styled versions if needed to maintain consistency.
    2.  **ToggleButtonGroup (`SlotsRequestTable.tsx`):** Replace `@mui/material`'s `ToggleButtonGroup` with a series of `<button>` elements wrapped in a `<div>`. Manage the selected state within the component's React state. Apply conditional Tailwind CSS classes for the "selected" style.

#### 2.4. Calendar (`components/ui/RBTable.tsx`, etc.)

*   **Analysis:** The `Calendar` from `@heroui/react` is used for date selection.
*   **Plan:**
    1.  Add `react-day-picker` and `date-fns` to `package.json`.
    2.  In each component that uses the calendar, replace the `@heroui/react` `Calendar` with `react-day-picker`'s `DayPicker` component.
    3.  Create a custom Tailwind CSS style object or a separate CSS file to style `react-day-picker` to match the application's theme.

---

### Phase 3: Page-Level Refactoring

#### 3.1. `app/(root)/EntryLog/page.tsx` & `app/(root)/Register/page.tsx`

*   **Analysis:** These are page-level components that import UI components.
*   **Plan:**
    *   After refactoring the individual UI components they import (like tables and modals), the imports from the uninstalled libraries in these page files should be removed. The pages themselves will likely require minimal changes beyond removing the dead imports.

---

### Implementation Order

1.  Start with `app/providers.tsx`.
2.  Implement the generic `Modal.tsx` component.
3.  Refactor `RegistrationModal.tsx` and `RBModal.tsx`.
4.  Refactor one table to create a template, e.g., `EntryLogTable.tsx`.
5.  Refactor the remaining tables.
6.  Tackle `SlotsRequestTable.tsx` last, as it's the most complex, using a mix of table, calendar, and form elements.
7.  Finally, clean up the page-level components.
