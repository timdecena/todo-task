# Docker + Minikube Setup

## Prerequisites
- Docker Desktop (or Docker Engine)
- Minikube
- kubectl

## Option A: Run Entire App with Docker Compose
From project root:

```powershell
docker compose up --build -d
```

Access:
- Frontend: `http://localhost`
- Backend API: `http://localhost:8080/api/tasks`
- MySQL: `localhost:3306` (user `root`, password `root123`, DB `task_db`)

Stop:

```powershell
docker compose down
```

## Option B: Run Entire App on Minikube
1. Start Minikube:

```powershell
minikube start
```

2. Build images directly into Minikube Docker:

```powershell
minikube image build -t task-backend:latest ./task
minikube image build -t task-frontend:latest ./frontend
```

3. Apply manifests:

```powershell
kubectl apply -f k8s/task-app.yaml
```

4. Open the frontend service:

```powershell
minikube service frontend
```

Useful checks:

```powershell
kubectl get pods,svc
kubectl logs deployment/backend
kubectl logs deployment/frontend
kubectl logs deployment/mysql
```

Delete stack:

```powershell
kubectl delete -f k8s/task-app.yaml
```
