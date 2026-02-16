# CRUD Demo Guide (Code Flow First)

This guide is focused on your report flow:
1. Prioritize CRUD on **Task List**  
2. Then present extra features (**Kanban, Calendar, Undo, Recurring, Deleted**)

---

## 1. Quick File Map (What to Mention First)

## Frontend (Task List flow)
- `frontend/src/pages/tasks/TasksPage.tsx`
- `frontend/src/hooks/tasks/useTasks.ts`
- `frontend/src/components/tasks/TaskTable.tsx`
- `frontend/src/components/tasks/TaskFormModal.tsx`
- `frontend/src/components/tasks/TaskDetailsModal.tsx`
- `frontend/src/services/tasks/taskApi.ts`

## Backend (same flow for all CRUD requests)
- `task/src/main/java/com/decena/task/Controller/TaskController.java`
- `task/src/main/java/com/decena/task/Service/ServiceImpl/TaskServiceImpl.java`
- `task/src/main/java/com/decena/task/Repository/TaskRepository.java`
- `task/src/main/java/com/decena/task/Entity/Task.java`
- `task/src/main/java/com/decena/task/Exception/GlobalExceptionHandler.java`

---

## 2. Master Architecture Line (Memorize This)

"Page -> Hook -> API Service -> Controller -> Service -> Repository -> DB -> back to UI refresh."

Use this line whenever panel asks "How does your system work?"

---

## 3. Primary Demo: CRUD in Task List

Do this first in your report.

### 3.1 Read (Load task list)
1. Open `/tasks`.
2. `TasksPage.tsx` mounts and uses `useTasks.ts`.
3. `useTasks.ts` runs `fetchTasks()` in `useEffect`.
4. `taskApi.ts` calls `GET /api/tasks`.
5. Backend flow: Controller -> Service -> Repository.
6. Tasks are stored in state and rendered by `TaskTable.tsx`.

### 3.2 Create
1. Click **Create Task** in `TasksPage.tsx`.
2. `openCreate()` opens `TaskFormModal.tsx`.
3. Submit form -> `useTasks.ts` `handleSubmit(values)`.
4. `taskApi.ts` sends `POST /api/tasks`.
5. Backend validates and saves task.
6. Frontend shows success message and refreshes table.

### 3.3 Update
1. Click **Edit** in `TaskTable.tsx`.
2. Selected task goes to `TaskFormModal.tsx` as `initialValues`.
3. Submit -> `useTasks.ts` detects edit mode.
4. `taskApi.ts` sends `PUT /api/tasks/{id}`.
5. Backend updates and saves.
6. Frontend refreshes list and shows success message.

### 3.4 Complete (status update action)
1. Click **Complete** in row action.
2. `useTasks.ts` calls complete API.
3. `taskApi.ts` sends `PATCH /api/tasks/{id}/complete`.
4. Backend updates task status.
5. Frontend refreshes list.

### 3.5 Delete (soft delete with undo behavior)
1. Click **Delete** in `TaskTable.tsx` and confirm.
2. `useTasks.ts` handles delete using undo flow hook.
3. Backend sets `deleted=true` (soft delete).
4. Task disappears from active list.
5. Undo option can restore task during the time window.

---

## 4. Secondary Demo: Extra Features (After CRUD)

After CRUD is done, continue with these.

### 4.1 Kanban View
- Route: `/tasks/kanban`
- File: `frontend/src/pages/tasks/KanbanPage.tsx`
- What to say:
  - "Tasks are grouped by status columns."
  - "Drag-and-drop updates status and board order via API."
  - "Done tasks are locked from status changes."

### 4.2 Deleted Tasks View
- Route: `/tasks/deleted`
- Files:
  - `frontend/src/pages/tasks/DeletedTasksPage.tsx`
  - `frontend/src/hooks/tasks/useDeletedTasks.ts`
- What to say:
  - "This proves delete is soft delete, not hard delete."
  - "Deleted items are still auditable."

### 4.3 Undo Delete
- File: `frontend/src/hooks/tasks/useUndoDelete.tsx`
- What to say:
  - "Delete is safer because user can undo accidental deletes."

### 4.4 Calendar + Smart Health
- Files:
  - `frontend/src/components/tasks/TaskCalendarWidget.tsx`
  - `frontend/src/components/tasks/TaskHealthWidget.tsx`
- What to say:
  - "Calendar helps plan by date."
  - "Health indicator adds logic: On Track / Due Soon / Overdue."

### 4.5 Recurring Tasks
- What to say:
  - "When recurring tasks are completed, next occurrence is generated based on recurrence settings."
  - "This reduces manual re-creation of routine tasks."

---

## 5. Error Handling (Quick Mention)

If any action fails:
1. Backend throws exception in service/controller.
2. `GlobalExceptionHandler.java` formats response.
3. Frontend shows message/toast instead of crashing.

This shows production-style reliability.

---

## 6. Recommended Demo Order (Use This Exactly)

1. Open `/tasks` (Read)
2. Create task
3. Edit task
4. Complete task
5. Delete task + mention Undo
6. Open deleted page
7. Open Kanban
8. Open Calendar + Smart Health
9. Mention recurring behavior

---

## 7. 30-Second Closing Script

"Sug Done starts with strong CRUD in the Task List, then extends it with practical features like Kanban workflow, Undo delete safety, Calendar planning, recurring tasks, and smart health indicators. The code is cleanly layered from page, hook, and API on frontend to controller, service, and repository on backend."

