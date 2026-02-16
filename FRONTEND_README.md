# Frontend Architecture Guide

This document explains the frontend in `frontend/`: pages, routing, Ant Design UI choices, component/file responsibilities, hooks, custom hooks, and prop contracts.

## Stack

- React 19 + TypeScript + Vite
- Ant Design (`antd`) for UI system/components
- React Router (`react-router-dom`) for page navigation
- Axios for HTTP requests
- Day.js for deadline/date handling

## Routing

Routing is centralized in `frontend/src/routes/AppRoutes.tsx`.

- `/` redirects to `/tasks` with `<Navigate replace />`
- `/tasks` renders `TasksPage`
- `/tasks/deleted` renders `DeletedTasksPage`

`frontend/src/App.tsx` only renders `AppRoutes` to keep navigation concerns isolated.

## Pages

### `frontend/src/pages/tasks/TasksPage.tsx`
- Main active-task CRUD page.
- Uses `useTasks` custom hook for data loading and CRUD actions.
- Renders:
- `TaskTable` for listing/filtering/actions.
- `TaskFormModal` for create/edit.
- `TaskDetailsModal` for full-view/complete/delete from modal.
- Calculates footer summary (`total`, `completed`, `pending`) with `useMemo`.
- Handles local details-modal state (`detailsOpen`, `selectedTaskId`) with `useState`.

### `frontend/src/pages/tasks/DeletedTasksPage.tsx`
- Read-only page for soft-deleted tasks.
- Uses `useDeletedTasks` custom hook.
- Includes client-side search and filters:
- keyword search
- status filter
- deadline range filter
- deadline quick filter (1/7/14 days)
- Displays filtered results in AntD `Table`.

## Ant Design Design Choices

Global design tokens are configured in `frontend/src/main.tsx` using `ConfigProvider`:

- Bigger readable defaults: `fontSize: 18`, `controlHeight: 44`
- Softer corners: `borderRadius: 12`
- Comfortable spacing: `padding: 16`
- Component-level overrides:
- `Button`: larger control and text
- `Table`: larger font and cell paddings
- `Card`: increased content padding

Layout approach across pages:

- `Layout + Content + Card + Space` for consistent vertical rhythm
- `Alert` for transient notices
- `Table` as main data surface
- `Modal` for focused workflows (form/details)
- `Tag` for status/priority/deadline emphasis

This gives a desktop-first CRUD dashboard style that is consistent and legible.

## Components and Purpose

### `frontend/src/components/tasks/TaskTable.tsx`
- Reusable active-task table with:
- Search + filters + sorting + pagination
- Row actions: `View`, `Edit`, `Delete`, `Complete`
- Local UI state for filters/pagination.
- Uses `useMemo` to derive filtered/sorted rows efficiently.
- Uses `Popconfirm` before destructive delete.

Props:

- `tasks: TaskResponse[]` source data
- `loading: boolean` loading state for table spinner
- `onEdit(task)` open edit flow
- `onDelete(id)` soft-delete action
- `onComplete(id)` complete action
- `onView(id)` open details modal

### `frontend/src/components/tasks/TaskFormModal.tsx`
- Shared modal for both create and edit.
- Uses AntD `Form` with validation and normalized payload.
- Converts Day.js value to `YYYY-MM-DDTHH:mm:ss` for backend.
- Resets/defaults fields when creating.
- Pre-fills fields when editing.

Props:

- `open: boolean` modal visibility
- `onClose()` close handler
- `onSubmit(values: TaskRequest)` confirmed payload callback
- `initialValues?: TaskRequest` presence means edit mode

### `frontend/src/components/tasks/TaskDetailsModal.tsx`
- Fetches a single task by ID when opened.
- Shows full text/details (not truncated).
- Supports inline `Complete` and `Delete` actions.
- Handles loading, invalid ID, not-found, and API error states.

Props:

- `open: boolean`
- `taskId?: number`
- `onClose()`
- `onDeleted?()` notify parent after delete
- `onUpdated?(task)` notify parent after complete/update

## Hooks Used and Why

Built-in React hooks used:

- `useState`: local UI state (modal visibility, filters, pagination, selected IDs).
- `useEffect`: run side effects (initial fetch, refetch on dependency change, form hydration).
- `useMemo`: memoize expensive derived lists/summaries (filter + sort output, totals).
- `useCallback`: stabilize async fetch functions used by effects.

Why these are good fits:

- Data fetching and modal/form behavior are side effects, so `useEffect` is appropriate.
- Table filtering/sorting can be expensive and should only recompute when inputs change, so `useMemo`.
- Stable fetch references avoid unnecessary re-runs of effects, so `useCallback`.
- Multiple independent UI controls need isolated mutable state, so `useState`.

## Custom Hooks

### `frontend/src/hooks/tasks/useTasks.ts`
- Encapsulates active-task business logic:
- fetch all paged tasks
- create/update/delete/complete operations
- shared loading + top notice + modal/edit state
- Returns handlers and state so page stays declarative.

Why custom hook:

- Separates data/business logic from page rendering.
- Keeps `TasksPage` focused on composition/layout.
- Improves reuse and testability of task lifecycle behavior.

### `frontend/src/hooks/tasks/useDeletedTasks.ts`
- Encapsulates deleted-task retrieval (paged aggregation), loading state, and notices.

Why custom hook:

- Same separation-of-concerns benefits as `useTasks`.
- Keeps deleted page focused on display/filtering instead of transport logic.

## Services, Types, and Support Files

### `frontend/src/services/http/httpClient.ts`
- Single Axios instance with `baseURL: http://localhost:8080`.
- Central place to add interceptors/headers later.

### `frontend/src/services/tasks/taskApi.ts`
- Task API contract layer:
- `getAllTasks`, `getTaskById`
- `createTask`, `updateTask`
- `deleteTask` (soft delete)
- `markTaskAsCompleted`
- `getDeletedTasks`
- Prevents components/hooks from hardcoding endpoint details.

### `frontend/src/types/task.ts`
- Shared backend contract types:
- `TaskRequest` (create/update payload)
- `TaskResponse` (server response)
- `TaskPriority` and `TaskStatus` union types.

### `frontend/src/main.tsx`
- App bootstrap.
- Wraps app in AntD `ConfigProvider` theme config.

### `frontend/src/index.css`
- Global reset/base styles.
- Full-height root and hidden page scroll so table/modal manage scrolling.

## Props Flow Overview

- `TasksPage` passes task data + CRUD callbacks into `TaskTable`.
- `TaskTable` emits user-intent events via callback props (`onEdit`, `onDelete`, etc.).
- `TasksPage` passes open/close/submit contract into `TaskFormModal`.
- `TaskFormModal` emits validated `TaskRequest` back via `onSubmit`.
- `TasksPage` passes selected `taskId` and refresh callbacks into `TaskDetailsModal`.
- `TaskDetailsModal` notifies parent with `onDeleted`/`onUpdated` so parent can refresh.

This is a unidirectional flow: parent owns state, child triggers actions through props.

## End-to-End File Map

- `frontend/src/main.tsx`: entry + AntD global theme
- `frontend/src/App.tsx`: root wrapper
- `frontend/src/routes/AppRoutes.tsx`: route definitions
- `frontend/src/pages/tasks/TasksPage.tsx`: active tasks dashboard
- `frontend/src/pages/tasks/DeletedTasksPage.tsx`: deleted tasks page
- `frontend/src/components/tasks/TaskTable.tsx`: active tasks table UI + filters/actions
- `frontend/src/components/tasks/TaskFormModal.tsx`: create/edit task form modal
- `frontend/src/components/tasks/TaskDetailsModal.tsx`: task detail modal with actions
- `frontend/src/hooks/tasks/useTasks.ts`: active-task state + CRUD orchestration
- `frontend/src/hooks/tasks/useDeletedTasks.ts`: deleted-task fetching orchestration
- `frontend/src/services/http/httpClient.ts`: shared Axios client
- `frontend/src/services/tasks/taskApi.ts`: task API calls
- `frontend/src/types/task.ts`: task domain types
- `frontend/src/index.css`: global CSS base

