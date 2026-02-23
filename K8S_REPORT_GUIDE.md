# Kubernetes Report Guide (Simple, Submission-Ready)

Use this as a ready structure for your report on adding Kubernetes to the app.

## 1. Introduction

This project is a full-stack Task Manager application with:

- Frontend (React + Nginx)
- Backend (Spring Boot)
- Database (MySQL)

The application was already Dockerized. The next step was to deploy the same application using Kubernetes so it can be managed in a more scalable and structured way.

## 2. Objective of the Kubernetes Implementation

The objective was to run the application in Kubernetes by separating each major component into Kubernetes-managed resources and making the setup easier to demonstrate and explain.

Main goals:

- Deploy frontend, backend, and MySQL in Kubernetes
- Use Kubernetes networking for service-to-service communication
- Use persistent storage for MySQL
- Use ConfigMap and Secret for configuration management
- Expose the frontend for browser access in Minikube

## 3. Existing Docker Setup (Before Kubernetes)

Before Kubernetes, the project used:

- `frontend/Dockerfile` for building and serving the frontend with Nginx
- `task/Dockerfile` for building/running the Spring Boot backend
- `docker-compose.yml` for running frontend, backend, and MySQL together

The frontend uses `/api` calls and Nginx proxies them to the backend. This design was helpful because it also works well in Kubernetes.

## 4. Kubernetes Components Used and Their Purpose

### 4.1 Namespace

- File: `k8s/00-namespace.yaml`
- Purpose: groups all app resources under `task-app`

### 4.2 Secret

- File: `k8s/01-mysql-secret.yaml`
- Purpose: stores MySQL root password (`mysql-root-password`)

### 4.3 ConfigMap

- File: `k8s/02-app-configmap.yaml`
- Purpose: stores non-sensitive app config such as:
  - DB host/port/name/user
  - allowed CORS origins for demo access

### 4.4 PersistentVolumeClaim (PVC)

- File: `k8s/03-mysql-pvc.yaml`
- Purpose: keeps MySQL data persistent even if the MySQL pod is recreated

### 4.5 MySQL Deployment and Service

- Files:
  - `k8s/04-mysql-deployment.yaml`
  - `k8s/05-mysql-service.yaml`
- Purpose:
  - run MySQL container
  - expose stable internal service name `mysql`

### 4.6 Backend Deployment and Service

- Files:
  - `k8s/06-backend-deployment.yaml`
  - `k8s/07-backend-service.yaml`
- Purpose:
  - run Spring Boot API
  - connect to MySQL through the `mysql` service
  - expose stable internal service name `backend`

### 4.7 Frontend Deployment and NodePort Service

- Files:
  - `k8s/08-frontend-deployment.yaml`
  - `k8s/09-frontend-service-nodeport.yaml`
- Purpose:
  - run frontend container (Nginx serving React build)
  - expose the app to the browser through NodePort (`30080`)

## 5. Implementation Steps (Step-by-Step)

### Step 1: Prepare Docker Images

The backend and frontend images were built from the existing Dockerfiles and pushed to Docker Hub so Kubernetes could pull them.

Image names used:

- `docker.io/timpogi/task-backend:v1`
- `docker.io/timpogi/task-frontend:v1`

### Step 2: Create Split Kubernetes Manifests

The original single-file manifest (`k8s/task-app.yaml`) was kept as a legacy reference.

A split-manifest approach was used for learning and reporting because each file has one clear responsibility.

### Step 3: Configure App Settings and Secret Values

- MySQL password was stored in a `Secret`
- Database and CORS settings were stored in a `ConfigMap`
- Backend reads values through environment variables

### Step 4: Configure Persistent Storage for MySQL

A `PersistentVolumeClaim` was created and mounted to `/var/lib/mysql` so database data survives pod restarts.

### Step 5: Deploy MySQL, Backend, and Frontend

Resources were applied in order:

1. Namespace
2. Secret and ConfigMap
3. PVC
4. MySQL Deployment + Service
5. Backend Deployment + Service
6. Frontend Deployment + NodePort Service

### Step 6: Verify Kubernetes Resources

The following were checked:

- Pods are `Running`
- Services are created correctly
- PVC status is `Bound`
- Frontend is reachable through NodePort

## 6. Docker Hub Build and Push Process

### Backend

```bash
docker build -t timpogi/task-backend:v1 ./task
docker push timpogi/task-backend:v1
```

### Frontend

```bash
docker build -t timpogi/task-frontend:v1 ./frontend
docker push timpogi/task-frontend:v1
```

After pushing, the image names in:

- `k8s/06-backend-deployment.yaml`
- `k8s/08-frontend-deployment.yaml`

were updated to the Docker Hub username `timpogi`.

## 7. Minikube Deployment Process

### Start Minikube

```bash
minikube start
kubectl get nodes
```

### Apply manifests

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-mysql-secret.yaml
kubectl apply -f k8s/02-app-configmap.yaml
kubectl apply -f k8s/03-mysql-pvc.yaml
kubectl apply -f k8s/04-mysql-deployment.yaml
kubectl apply -f k8s/05-mysql-service.yaml
kubectl apply -f k8s/06-backend-deployment.yaml
kubectl apply -f k8s/07-backend-service.yaml
kubectl apply -f k8s/08-frontend-deployment.yaml
kubectl apply -f k8s/09-frontend-service-nodeport.yaml
```

### Get access URL

```bash
minikube service frontend -n task-app --url
```

This opens the frontend, and the frontend proxies `/api` requests to the backend service inside the cluster.

## 8. Testing and Verification Results (What to Report)

Use this as your result summary:

- All Kubernetes resources were created successfully in namespace `task-app`
- MySQL, backend, and frontend pods reached `Running` state
- MySQL PVC was successfully bound, confirming persistent storage
- Frontend was accessible through NodePort service
- CRUD operations (Create, Read, Update, Complete, Delete/soft delete) worked successfully through Kubernetes
- Frontend-to-backend communication worked through Nginx `/api` proxy and Kubernetes Services

Optional strong result:

- Deleting the MySQL pod caused Kubernetes to recreate it automatically, and data remained available because of the PVC

## 9. Challenges Encountered and Fixes

### Challenge 1: Image Pull Errors (`ImagePullBackOff`)

Cause:
- wrong Docker Hub username or image tag in manifest

Fix:
- confirm image name/tag
- push image to Docker Hub
- re-apply deployment

### Challenge 2: Backend Not Ready Immediately

Cause:
- MySQL may need more time to start

Fix:
- use readiness/liveness probes
- wait and check logs using `kubectl logs`

### Challenge 3: Frontend Loads but API Fails

Cause:
- backend service mismatch, backend pod not ready, or CORS origin not allowed

Fix:
- verify backend service name is `backend`
- check backend logs
- patch ConfigMap CORS value and restart backend if needed

## 10. Conclusion

The application was successfully migrated from a Docker Compose setup to a Kubernetes-based setup using Minikube. The new configuration separates concerns clearly using Kubernetes resources such as Deployments, Services, ConfigMap, Secret, and PersistentVolumeClaim.

This implementation improved portability, organization, and readiness for future scaling while still remaining simple enough for beginner learning and demonstration.

## 11. Appendix (Useful Commands)

### Check resources

```bash
kubectl get all -n task-app
kubectl get pvc -n task-app
```

### Logs and debugging

```bash
kubectl logs deployment/backend -n task-app
kubectl logs deployment/mysql -n task-app
kubectl describe pod -n task-app <pod-name>
kubectl get events -n task-app --sort-by=.metadata.creationTimestamp
```

### Restart backend after ConfigMap change

```bash
kubectl rollout restart deployment/backend -n task-app
```

### Open frontend URL

```bash
minikube service frontend -n task-app --url
```
