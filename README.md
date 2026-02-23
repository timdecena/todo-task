# Task Manager Project Study Guide (Beginner Friendly)

This project is a full-stack Task Manager system.  
Backend is built with **Spring Boot + MySQL**, and frontend is built with **React + TypeScript + Ant Design**.

This guide is written in simple English so you can:

1. Understand the code quickly.
2. Explain the flow clearly during CRUD demo/report.
3. Answer common panel questions with confidence.

---

## 1. What This System Does

The system manages tasks with these actions:

- Create task
- Read active tasks
- Update task
- Complete task
- Soft delete task
- Read deleted tasks

Important: delete is **soft delete**.  
That means the row is not removed from DB, it is only marked as `deleted=true`.

---

## 2. Tech Stack

## Backend

- Java 17
- Spring Boot
- Spring Data JPA
- MySQL
- Validation (Jakarta Validation)
- Spring Security (configured to allow all requests now)

## Frontend

- React
- TypeScript
- Vite
- Ant Design
- Axios
- Day.js

---

## 3. Folder Structure (High Level)

Root folders:

- `task/` -> backend source
- `frontend/` -> frontend source

Useful backend folders:

- `Controller/`
- `Service/ServiceImpl/`
- `Repository/`
- `Entity/`
- `Dto/`
- `Mapper/`
- `Exception/`

Useful frontend folders:

- `pages/tasks/`
- `components/tasks/`
- `hooks/tasks/`
- `services/tasks/`
- `services/http/`
- `routes/`
- `types/`

---

## 4. End-to-End Flow (One User Action)

When user clicks something in UI, this is the normal flow:

1. Component button click (example: Create, Delete).
2. Page calls a Hook function (example: `useTasks`).
3. Hook calls API service function (`taskApi.ts`).
4. Axios sends HTTP request to Spring Boot.
5. Controller receives request.
6. Service runs business rules.
7. Repository reads/writes DB.
8. Response returns to frontend.
9. Hook refreshes table + shows toast.

Use this exact flow in your report. It is easy and correct.

---

## 5. Backend Architecture (Simple View)

## 5.1 Controller Layer

File:

- `task/src/main/java/com/decena/task/Controller/TaskController.java`

Purpose:

- Exposes REST endpoints.
- No heavy logic here.
- Delegates to Service.

Main endpoints:

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/complete`
- `DELETE /api/tasks/{id}`
- `GET /api/tasks/deleted`

## 5.2 Service Layer

File:

- `task/src/main/java/com/decena/task/Service/ServiceImpl/TaskServiceImpl.java`

Purpose:

- Core business logic.
- Validates task rules (deadline checks, active/deleted checks).
- Handles pagination/sorting safely.

## 5.3 Repository Layer

File:

- `task/src/main/java/com/decena/task/Repository/TaskRepository.java`

Purpose:

- Talks to DB with JPA query methods.

Common query methods:

- `findByDeletedFalse(...)`
- `findByIdAndDeletedFalse(...)`
- `findAllByDeletedTrue(...)`

## 5.4 Entity + Domain Methods

File:

- `task/src/main/java/com/decena/task/Entity/Task.java`

Purpose:

- DB model of task.
- Contains enums:
  - Priority: `HIGH`, `MODERATE`, `LOW`
  - Status: `PENDING`, `COMPLETED`
- Contains domain methods:
  - `markAsCompleted()`
  - `updateDeadline(...)`

## 5.5 Global Exception Handling

File:

- `task/src/main/java/com/decena/task/Exception/GlobalExceptionHandler.java`

Purpose:

- Converts exceptions into user-friendly JSON error response.
- Keeps controller code cleaner.

---

## 6. Frontend Architecture (Simple View)

Pattern used:

1. **Page** = layout of the screen
2. **Hook** = state + business flow
3. **Service** = HTTP calls
4. **Component** = reusable UI parts (table/modals)

This pattern is good for beginners because each file has one clear job.

### 6.1 Entry + Routing

- `frontend/src/main.tsx` -> app startup + global AntD theme
- `frontend/src/App.tsx` -> route wrapper
- `frontend/src/routes/AppRoutes.tsx` -> route list

Routes:

- `/tasks` (active tasks)
- `/tasks/deleted` (soft-deleted tasks)

### 6.2 Hooks

- `frontend/src/hooks/tasks/useTasks.ts`
  - fetch active tasks
  - create/update/complete/delete
  - toast feedback
  - refresh list

- `frontend/src/hooks/tasks/useDeletedTasks.ts`
  - fetch deleted tasks
  - used by deleted page

### 6.3 Components

- `TaskTable.tsx`
  - main list table
  - search + filters + actions
  - truncated long text in list

- `TaskFormModal.tsx`
  - create/edit form
  - validates required fields
  - hides seconds in deadline input

- `TaskDetailsModal.tsx`
  - full task info
  - long text fully visible
  - complete/delete actions

---

## 7. CRUD Demo Script (What To Say While Clicking)

Use this script during demo.

## C - Create

Say:

1. "I click Create Task and modal opens."
2. "I enter title, optional description, priority, status, and deadline."
3. "On submit, frontend calls POST `/api/tasks`."
4. "Backend validates and saves task."
5. "Frontend refreshes list and shows success toast."

## R - Read

Say:

1. "On page load, hook fetches tasks from backend with pagination."
2. "Rows are shown in table with filters and search."
3. "Deleted tasks are available in a separate page `/tasks/deleted`."

## U - Update

Say:

1. "I click Edit for one row."
2. "Modal opens with existing values."
3. "Submit calls PUT `/api/tasks/{id}`."
4. "Table refreshes, then update toast appears."

## Complete (Business Action)

Say:

1. "I click Complete."
2. "Frontend calls PATCH `/api/tasks/{id}/complete`."
3. "Status changes to COMPLETED and UI refreshes."

## D - Delete (Soft Delete)

Say:

1. "I click Delete and confirm the dialog."
2. "Frontend calls DELETE `/api/tasks/{id}`."
3. "Backend sets deleted flag true, not hard delete."
4. "Task disappears from active list and appears in deleted list page."

---

## 8. API Examples You Can Mention

## Create Task Request

```json
{
  "title": "Finish report",
  "description": "Prepare CRUD demo slides",
  "priority": "HIGH",
  "status": "PENDING",
  "deadline": "2026-02-20T16:00:00"
}
```

## Create Task Response (sample)

```json
{
  "id": 12,
  "title": "Finish report",
  "description": "Prepare CRUD demo slides",
  "priority": "HIGH",
  "status": "PENDING",
  "deadline": "2026-02-20T16:00:00",
  "dateCreated": "2026-02-11T10:12:00"
}
```

## Common Error Response (sample)

```json
{
  "timestamp": "2026-02-11T10:12:10",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "title": "Title is required"
  }
}
```

---

## 9. UI Features Already Added

- Long text in list is truncated with `...` for clean table layout.
- Full text is visible in details modal.
- Page scroll is locked; scroll is inside list tables and modal body.
- Toasts used for create/update/complete/delete feedback.
- Delete has confirmation dialog.
- Deadline colors:
  - red -> within 1 day (or overdue)
  - orange -> within 7 days
- Filters:
  - search
  - status dropdown (`Status`, `Completed`, `Pending`)
  - deadline date range
  - quick deadline filter (`Deadlines`, `Within 1 day`, `Within 7 days`, `Within 14 days`)
- Default ordering focuses on closest deadline first.

---

## 10. Validation and Business Rules (Important for Q&A)

Rules implemented:

- Title is required.
- Deadline cannot be in the past.
- Completing an already completed task throws business exception.
- Deleting an already deleted task returns handled response.
- Fetch-by-id for active tasks checks `deleted=false`.

Why this matters:

- Prevents invalid data.
- Makes API behavior predictable.
- Good point to discuss during panel questions.

---

## 11. Configuration Notes

Database settings are in:

- `task/src/main/resources/application.properties`

You are using environment variables for DB (current setup):

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

This is better than hardcoding password in source code.

---

## 12. How To Run

## Backend

From `task/`:

1. Set environment variables (PowerShell):
   - `$env:DB_HOST="localhost"`
   - `$env:DB_PORT="3306"`
   - `$env:DB_NAME="task_db"`
   - `$env:DB_USER="root"`
   - `$env:DB_PASSWORD="your_password"`
2. Run backend:
   - `./mvnw spring-boot:run`

## Frontend

From `frontend/`:

1. `npm install`
2. `npm run dev`

Default frontend URL is usually:

- `http://localhost:5173`

Backend base URL in frontend:

- `http://localhost:8080`

---

## 13. Testing Commands

## Backend tests

From `task/`:

- `./mvnw test`

## Frontend lint

From `frontend/`:

- `npm run lint`

---

## 14. Suggested Study Order (Best for Beginners)

Read files in this order:

1. `frontend/src/routes/AppRoutes.tsx`
2. `frontend/src/pages/tasks/TasksPage.tsx`
3. `frontend/src/hooks/tasks/useTasks.ts`
4. `frontend/src/services/tasks/taskApi.ts`
5. `task/src/main/java/com/decena/task/Controller/TaskController.java`
6. `task/src/main/java/com/decena/task/Service/ServiceImpl/TaskServiceImpl.java`
7. `task/src/main/java/com/decena/task/Entity/Task.java`
8. `frontend/src/components/tasks/TaskTable.tsx`
9. `frontend/src/components/tasks/TaskFormModal.tsx`
10. `frontend/src/components/tasks/TaskDetailsModal.tsx`

Reason:

- This sequence matches real runtime flow: click -> hook -> API -> backend -> DB -> response -> UI update.

---

## 15. Common Demo Questions and Simple Answers

## Q1: Why soft delete instead of hard delete?

A: Soft delete keeps history and allows showing deleted records.  
It is safer because records are not immediately lost.

## Q2: Where is business logic located?

A: In service layer (`TaskServiceImpl`).  
Controller only handles request/response.

## Q3: How do you validate user input?

A: Frontend validates form basics; backend validates DTO and business rules.  
Backend is final source of truth.

## Q4: How is frontend organized?

A: Page + Hook + Service + Component structure.  
This keeps code readable and easy to maintain.

## Q5: What happens after each CRUD action?

A: Hook calls API, then refreshes task list, then shows toast feedback.  
So UI always matches latest backend data.

---

## 16. Quick 2-Minute Demo Checklist

Before demo:

1. Start backend.
2. Start frontend.
3. Verify `/tasks` opens.

During demo:

1. Create one task.
2. Update same task.
3. Complete task.
4. Delete task.
5. Open deleted page and show deleted row.
6. Show filters (status + deadline range + quick deadline).
7. Open details modal to show full long description.

If you follow this checklist, you already covered full CRUD plus extra features.

---

## 17. Docker + Kubernetes Report Flow (Layman Version)

Use this section for your report and live explanation. It is written in simple terms.

### 17.1 What I Did (Simple Summary)

I first Dockerized the app so all parts can run in containers:

- Frontend container
- Backend container
- MySQL container

Then I deployed the same app in Kubernetes (Minikube) so Kubernetes manages:

- starting the containers
- connecting them together
- restarting them if needed
- exposing the frontend to the browser

### 17.2 Why Docker First, Then Kubernetes

- **Docker** solves packaging and consistent setup.
- **Kubernetes** solves managing multiple containers in a structured way.

Simple explanation:

- Docker = puts the app into containers
- Kubernetes = manages those containers as a system

### 17.3 Docker Setup Flow (What Happens)

1. Backend is built into an image using `task/Dockerfile`.
2. Frontend is built into an image using `frontend/Dockerfile`.
3. MySQL uses an official Docker image (`mysql:8.4`).
4. `docker-compose.yml` runs all 3 together.
5. Frontend calls `/api`, and Nginx forwards that to backend.

Layman line to say:

"Docker Compose is my one-button local setup for frontend, backend, and database."

### 17.4 Kubernetes Setup Flow (What Happens)

Kubernetes runs the same app, but each part is described using YAML files in `k8s/`.

Main Kubernetes resources used:

- `Deployment` -> runs and manages pods (frontend/backend/mysql)
- `Service` -> gives stable network names (`frontend`, `backend`, `mysql`)
- `Secret` -> stores MySQL password
- `ConfigMap` -> stores app config (DB host, CORS, etc.)
- `PersistentVolumeClaim` -> keeps MySQL data safe after pod restart
- `Namespace` -> groups all resources under `task-app`

Layman line to say:

"Kubernetes is the manager. It keeps the app parts running and connected."

### 17.5 End-to-End Runtime Flow (Browser to Database)

This is the best flow to explain during your report:

1. User opens frontend in browser (Minikube service URL).
2. Frontend UI sends request to `/api/tasks`.
3. Nginx in frontend container forwards `/api` request to backend service (`backend:8080`).
4. Backend (Spring Boot) receives request and runs business logic.
5. Backend connects to MySQL service (`mysql:3306`).
6. MySQL stores or returns data.
7. Backend sends response back to frontend.
8. Frontend updates table and shows success/error feedback.

Use this exact line:

"The browser only talks to the frontend, and the frontend forwards API calls internally to the backend through Kubernetes networking."

### 17.6 Deployment Flow for Kubernetes (Step-by-Step)

1. Build and push Docker images to Docker Hub (`timpogi/task-backend:v1`, `timpogi/task-frontend:v1`).
2. Start Minikube.
3. Apply Kubernetes YAML files from `k8s/` in order.
4. Wait for pods to become `Running`.
5. Check services and PVC.
6. Open frontend using `minikube service frontend -n task-app --url`.
7. Test CRUD actions.

### 17.7 What Problems Were Solved

- No need to install Java, Node.js, and MySQL separately on every machine (Docker benefit)
- Easier full-stack startup (`docker compose` or Kubernetes manifests)
- Better structure for managing multiple app parts (Kubernetes benefit)
- MySQL data is preserved using PVC
- App is easier to demo and explain

### 17.8 One Real Issue Encountered (Good for Report)

Issue:

- The frontend opened, but `POST /api/tasks` returned `403 Forbidden` in Kubernetes.

Cause (simple):

- Minikube service URL used a random localhost port (example: `127.0.0.1:53205`)
- Backend CORS allowed only fixed ports

Fix:

- Updated backend CORS config to allow localhost/127.0.0.1 with dynamic ports using origin patterns
- Rebuilt and redeployed backend image

Why this is a good report point:

- It shows real debugging and understanding of frontend-backend communication in Kubernetes

### 17.9 Short Conclusion for Report

The application was successfully Dockerized and then deployed in Kubernetes using Minikube. The frontend, backend, and MySQL database run as separate managed components, communicate through Kubernetes Services, and persist database data using a PersistentVolumeClaim. CRUD operations work successfully in both Docker Compose and Kubernetes setups.
