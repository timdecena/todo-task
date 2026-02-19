# CRUD Demo Flow Guide (File-to-File)

This file is a focused guide for your CRUD presentation.  
It explains exactly which file runs first, next, and last for each action.

---

## 1. Quick Map of Important Files

## Frontend

- Page: `frontend/src/pages/tasks/TasksPage.tsx`
- Hook: `frontend/src/hooks/tasks/useTasks.ts`
- Table UI: `frontend/src/components/tasks/TaskTable.tsx`
- Form Modal: `frontend/src/components/tasks/TaskFormModal.tsx`
- Details Modal: `frontend/src/components/tasks/TaskDetailsModal.tsx`
- API Calls: `frontend/src/services/tasks/taskApi.ts`
- HTTP Client: `frontend/src/services/http/httpClient.ts`

## Backend

- Controller: `task/src/main/java/com/decena/task/Controller/TaskController.java`
- Service: `task/src/main/java/com/decena/task/Service/ServiceImpl/TaskServiceImpl.java`
- Repository: `task/src/main/java/com/decena/task/Repository/TaskRepository.java`
- Entity: `task/src/main/java/com/decena/task/Entity/Task.java`
- Mapper: `task/src/main/java/com/decena/task/Mapper/TaskMapper.java`
- Exception Handler: `task/src/main/java/com/decena/task/Exception/GlobalExceptionHandler.java`

---

## 2. C = Create Flow (Step-by-Step)

## User action

User clicks **Create Task** button.

## File flow

1. `TasksPage.tsx`
- Button calls `openCreate()` from `useTasks`.

2. `useTasks.ts`
- `openCreate()` opens `TaskFormModal` and clears edit mode.

3. `TaskFormModal.tsx`
- User fills form.
- On submit, modal calls `onSubmit(values)` passed from page.

4. `useTasks.ts`
- `handleSubmit(values)` sees no editing task, so it calls `createTask(values)`.

5. `taskApi.ts`
- `createTask` sends `POST /api/tasks` via axios.

6. `TaskController.java`
- `createTask(...)` endpoint receives request DTO.

7. `TaskServiceImpl.java`
- Builds entity, validates deadline, sets defaults, saves task.

8. `TaskRepository.java`
- Saves row to database.

9. `TaskMapper.java`
- Converts entity to response DTO.

10. Frontend returns to `useTasks.ts`
- Shows success toast.
- Calls `fetchTasks()` to refresh table.

---

## 3. R = Read Flow (Active List)

## User action

User opens `/tasks`.

## File flow

1. `AppRoutes.tsx`
- Route `/tasks` loads `TasksPage`.

2. `TasksPage.tsx`
- Uses `useTasks()`.

3. `useTasks.ts`
- `useEffect` runs `fetchTasks()` on load.
- It calls backend in pages until all rows are loaded.

4. `taskApi.ts`
- `getAllTasks(...)` sends `GET /api/tasks?page=&size=&sortBy=&sortDir=`.

5. `TaskController.java`
- `getAllTasks(...)` endpoint handles query params.

6. `TaskServiceImpl.java`
- Reads active tasks (`deleted=false`) with pagination and sorting.

7. `TaskRepository.java`
- Executes `findByDeletedFalse(...)`.

8. Frontend back to `useTasks.ts`
- Sets `tasks` state.

9. `TasksPage.tsx` + `TaskTable.tsx`
- Renders rows with search/filter/sort UI.

---

## 4. R = Read Flow (Single Task Details)

## User action

User clicks **View** in table row.

## File flow

1. `TaskTable.tsx`
- Calls `onView(task.id)`.

2. `TasksPage.tsx`
- Opens `TaskDetailsModal` with selected `taskId`.

3. `TaskDetailsModal.tsx`
- `useEffect` runs `getTaskById(taskId)`.

4. `taskApi.ts`
- Sends `GET /api/tasks/{id}`.

5. Backend: controller -> service -> repository
- Service checks active task by id.

6. Modal renders full title/description/deadline/status.

---

## 5. U = Update Flow

## User action

User clicks **Edit**, changes values, clicks **Update**.

## File flow

1. `TaskTable.tsx`
- Calls `onEdit(task)`.

2. `TasksPage.tsx`
- Passes selected row to `TaskFormModal` as `initialValues`.

3. `TaskFormModal.tsx`
- Prefills form from initial values.
- On submit calls `onSubmit(values)`.

4. `useTasks.ts`
- `handleSubmit` sees `editingTask` exists, so calls `updateTask(id, values)`.

5. `taskApi.ts`
- Sends `PUT /api/tasks/{id}`.

6. Backend: controller -> service
- Service finds task, applies updates, validates deadline, saves.

7. Frontend
- Shows success toast.
- Refreshes list with `fetchTasks()`.

---

## 6. Update-Like Action = Complete Task

This is not full update form, but it updates status.

## User action

User clicks **Complete**.

## File flow

1. `TaskTable.tsx`
- Calls `onComplete(id)`.

2. `useTasks.ts`
- Calls `markTaskAsCompleted(id)`.

3. `taskApi.ts`
- Sends `PATCH /api/tasks/{id}/complete`.

4. Backend controller/service
- Service checks task is active and not already completed.
- Sets status to `COMPLETED`.

5. Frontend
- Shows toast.
- Refreshes list.

---

## 7. D = Delete Flow (Soft Delete)

## User action

User clicks **Delete** then confirms popup.

## File flow

1. `TaskTable.tsx`
- `Popconfirm` asks: Are you sure?
- On confirm calls `onDelete(id)`.

2. `useTasks.ts`
- Calls `deleteTask(id)`.

3. `taskApi.ts`
- Sends `DELETE /api/tasks/{id}`.

4. `TaskController.java`
- Calls service delete method.

5. `TaskServiceImpl.java`
- Finds task by id.
- If already deleted, throws custom exception.
- Else sets `deleted=true` and saves.

6. Frontend
- Shows toast.
- Refreshes active list (task disappears).

---

## 8. Read Deleted Tasks Flow

## User action

User clicks **View Deleted Tasks**.

## File flow

1. `TasksPage.tsx`
- Link navigates to `/tasks/deleted`.

2. `AppRoutes.tsx`
- Loads `DeletedTasksPage`.

3. `useDeletedTasks.ts`
- On load calls `fetchDeletedTasks()`.

4. `taskApi.ts`
- Sends `GET /api/tasks/deleted`.

5. Backend controller/service/repository
- Returns rows where `deleted=true`.

6. `DeletedTasksPage.tsx`
- Renders deleted table with filters.

---

## 9. Error Flow (Any CRUD Action)

If backend rejects request:

1. Exception is thrown in service/controller.
2. `GlobalExceptionHandler.java` formats response JSON.
3. Frontend catch block reads error and shows toast/message.

This is why users see clean error feedback instead of app crash.

---

## 10. Demo Script You Can Read

Use this script if you want a short but detailed narration:

1. "This page is loaded by `frontend/src/pages/tasks/TasksPage.tsx`, and all task state is controlled by `frontend/src/hooks/tasks/useTasks.ts`.  
When the page mounts, `useTasks` runs `fetchTasks()`, calls `getAllTasks()` in `taskApi.ts`, then stores the result in React state so `TaskTable.tsx` can render it."

2. "For create, I click the button in `TasksPage.tsx`, which calls `openCreate()` from the hook and opens `TaskFormModal.tsx`.  
After I submit, the modal calls `onSubmit`, then `useTasks.handleSubmit()` calls `createTask()` in `taskApi.ts`, which sends `POST /api/tasks` to backend."

3. "On backend create flow, request enters `TaskController.java`, then moves to `TaskServiceImpl.java` for business rules like deadline validation and default values.  
Service saves through `TaskRepository.java`, converts response using `TaskMapper.java`, and frontend receives success toast then reloads list."

4. "For read, the table view in `TaskTable.tsx` is always based on state from `useTasks.ts`, not hardcoded UI data.  
Every reload comes from backend `GET /api/tasks`, so filters and actions are always working on updated database records."

5. "For update, I click Edit in `TaskTable.tsx`, selected row is passed to `TasksPage.tsx`, then `TaskFormModal.tsx` opens with `initialValues`.  
On submit, hook detects edit mode (`editingTask` exists), calls `updateTask(id, payload)` in `taskApi.ts`, which sends `PUT /api/tasks/{id}`."

6. "For complete, row action calls `onComplete`, then `useTasks.ts` sends `PATCH /api/tasks/{id}/complete` through `taskApi.ts`.  
Backend service checks if task is active and not already completed, updates status to `COMPLETED`, then frontend shows toast and refreshes."

7. "For delete, I click Delete and confirm the popup in `TaskTable.tsx`; this prevents accidental delete.  
Hook sends `DELETE /api/tasks/{id}`, backend performs soft delete by setting `deleted=true`, then row disappears from active list after refresh."

8. "Deleted items are not lost; I can prove that by opening `/tasks/deleted`.  
This page uses `frontend/src/hooks/tasks/useDeletedTasks.ts`, which calls `GET /api/tasks/deleted`, and backend returns rows with `deleted=true`."

9. "If any request fails, backend formats clean error JSON in `GlobalExceptionHandler.java`, and frontend shows message/toast instead of crashing.  
This gives users safe feedback and keeps the demo stable even when validation or business rules fail."

---

## 11. Full Read-Aloud Demo Script (Detailed)

Use this if you want a more detailed walkthrough during your demo.

## 11.1 Opening (Architecture in 20-30 seconds)

"This project is full-stack. The frontend is React + TypeScript and the backend is Spring Boot + MySQL.  
For every button click, the flow is: Page -> Hook -> API service -> Controller -> Service -> Repository -> Database, then response goes back to frontend and table refreshes."

## 11.2 Read Active Tasks

"When I open `/tasks`, route config in `AppRoutes.tsx` loads `TasksPage.tsx`.  
Inside `TasksPage`, the custom hook `useTasks.ts` runs `fetchTasks()` in `useEffect`, and that calls `getAllTasks` from `taskApi.ts`."

"`taskApi.ts` sends HTTP GET to `/api/tasks`.  
On backend, `TaskController` receives request, `TaskServiceImpl` applies active-task logic (`deleted=false`), repository queries database, and rows come back to frontend table."

"In UI, the table is rendered by `TaskTable.tsx`.  
Users can search, filter by status, filter deadlines by range and quick options, and sort other columns."

## 11.3 Create Task

"I click Create Task button in `TasksPage.tsx`.  
That calls `openCreate()` from `useTasks.ts`, which opens `TaskFormModal.tsx` in create mode."

"In the modal, I fill title, description, priority, status, and deadline.  
When I click Create, modal sends values to `handleSubmit` in `useTasks.ts`."

"`handleSubmit` calls `createTask` in `taskApi.ts`, which sends POST `/api/tasks`.  
Backend controller receives DTO, service validates rules (especially deadline), maps to entity, saves in repository, and returns created response."

"Back in frontend, I get success toast and `fetchTasks()` runs again.  
So the new task appears immediately in the active list."

## 11.4 Update Task

"I click Edit on a task row in `TaskTable.tsx`.  
That sends selected row to `TasksPage.tsx`, then the form modal opens with prefilled values."

"When I submit update, `useTasks.ts` detects this is edit mode because `editingTask` exists.  
It calls `updateTask(id, payload)` in `taskApi.ts`, which sends PUT `/api/tasks/{id}`."

"Backend service finds the active task, applies field updates, validates deadline again, and saves.  
Frontend shows update toast and reloads table, so we see updated values right away."

## 11.5 Complete Task

"I click Complete in row actions.  
`TaskTable.tsx` triggers `onComplete`, then `useTasks.ts` calls `markTaskAsCompleted` API."

"`taskApi.ts` sends PATCH `/api/tasks/{id}/complete`.  
Backend service checks if task is active and not already completed, then sets status to COMPLETED."

"Frontend receives success, shows toast, and refreshes list.  
In UI, status changes to COMPLETED and Complete button becomes disabled for that row."

## 11.6 View Task Details

"I click View in row actions.  
`TasksPage.tsx` opens `TaskDetailsModal.tsx` and passes selected task id."

"The modal calls `getTaskById` from `taskApi.ts`.  
Backend returns one active task, and modal shows full details including long title/description."

"This is important because list view truncates long text with `...`.  
Full content is intentionally shown only in details modal."

## 11.7 Delete Task (Soft Delete)

"I click Delete in row actions, and a confirmation pop-up appears first.  
After confirm, `useTasks.ts` calls `deleteTask` API and sends DELETE `/api/tasks/{id}`."

"Backend service does soft delete by setting `deleted=true` instead of removing row permanently.  
If already deleted, service throws business exception handled by global exception handler."

"Frontend shows delete toast and refreshes active list.  
Task disappears from active list because active list only fetches `deleted=false`."

## 11.8 Read Deleted Tasks

"I click View Deleted Tasks button.  
Route changes to `/tasks/deleted` and `DeletedTasksPage.tsx` loads."

"This page uses `useDeletedTasks.ts` hook, which calls `getDeletedTasks` in `taskApi.ts`.  
Backend endpoint `/api/tasks/deleted` returns tasks where `deleted=true`."

"Now the soft-deleted task is visible in this page.  
This proves delete is logical/soft delete, not physical hard delete."

## 11.9 Error Handling (quick mention)

"If a request fails, backend exceptions are formatted by `GlobalExceptionHandler.java`.  
Frontend catch blocks read message and show toast/error feedback without crashing page."

---

## 12. CRUD Checklist While Demoing

Follow this exact click sequence:

1. Open `/tasks` and mention auto-load flow.
2. Create one new task.
3. Edit same task.
4. Complete same task.
5. Open View modal to show full description.
6. Delete same task with confirmation.
7. Open `/tasks/deleted` to show deleted record.

If these 7 steps work, your full CRUD demo is complete.

---

## 13. Quick "File-to-File" Memory Line

Memorize this line:

"`TasksPage` handles screen, `useTasks` handles logic, `taskApi` handles HTTP, `TaskController` receives, `TaskServiceImpl` validates, `TaskRepository` saves/reads, then UI refreshes."

This one sentence is useful when panel asks "explain your architecture quickly".

---

## 14. What to Highlight to Panel

- Clear separation of concerns:
  - UI (components/pages)
  - state/flow (hooks)
  - API communication (services)
  - business logic (backend service)
- Soft delete design for safety/history.
- Frontend always refreshes after mutation to avoid stale UI.
- Backend is source of truth for validation and rules.
