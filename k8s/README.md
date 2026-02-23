# Kubernetes Setup (Minikube + NodePort)

This folder contains a beginner-friendly Kubernetes setup for the Task Manager app:

- `mysql` (database)
- `backend` (Spring Boot API)
- `frontend` (Nginx + React build)

`k8s/task-app.yaml` is the older single-file manifest and is kept as a legacy reference. Use the split manifests in this folder for the demo/report.

## 1. Prerequisites

- Docker Desktop (or Docker Engine)
- `kubectl`
- `minikube`
- Docker Hub account (for sharing images)

## 2. Build and Push Images (Docker Hub)

This project is configured to use Docker Hub username `timpogi` and image tag `v1`.

### Backend image

```bash
docker build -t timpogi/task-backend:v1 ./task
docker push timpogi/task-backend:v1
```

### Frontend image

```bash
docker build -t timpogi/task-frontend:v1 ./frontend
docker push timpogi/task-frontend:v1
```

## 3. Update Image Names in Manifests

Image names are already set in these files:

- `k8s/06-backend-deployment.yaml`
- `k8s/08-frontend-deployment.yaml`

Configured image names:

- `docker.io/timpogi/task-backend:v1`
- `docker.io/timpogi/task-frontend:v1`

## 4. Start Minikube

```bash
minikube start
kubectl get nodes
```

## 5. Deploy the App (Apply in Order)

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

## 6. Watch Resources

```bash
kubectl get pods -n task-app -w
```

In another terminal:

```bash
kubectl get svc -n task-app
kubectl get pvc -n task-app
```

Expected:

- `mysql`, `backend`, `frontend` pods reach `Running`
- `frontend` service shows `NodePort` on `30080`
- `mysql-pvc` shows `Bound`

## 7. Open the App

Recommended (works even when Minikube IP varies):

```bash
minikube service frontend -n task-app --url
```

Manual URL (if your Minikube node IP is reachable):

```bash
http://<minikube-ip>:30080
```

## 8. CORS Update for Minikube IP (Only if Needed)

The frontend proxies `/api` to the backend, so CORS is usually only an issue when the browser origin is not already in the backend allowed list.

If your app opens at `http://<minikube-ip>:30080` and API requests are blocked, patch the ConfigMap and restart backend:

### PowerShell example

```powershell
$mkIp = minikube ip
$origins = "http://localhost:*,http://127.0.0.1:*,http://$mkIp:30080"
kubectl patch configmap task-app-config -n task-app --type merge -p "{`"data`":{`"APP_CORS_ALLOWED_ORIGINS`":`"$origins`"}}"
kubectl rollout restart deployment/backend -n task-app
```

## 9. Troubleshooting Commands

```bash
kubectl get all -n task-app
kubectl logs deployment/backend -n task-app
kubectl logs deployment/mysql -n task-app
kubectl describe pod -n task-app <pod-name>
kubectl get events -n task-app --sort-by=.metadata.creationTimestamp
```

Common problems:

- `ImagePullBackOff`: wrong Docker Hub username/tag or image not pushed
- Backend starts but DB not ready: wait, then check backend/mysql logs
- Frontend loads but API fails: confirm backend service name is `backend` and CORS includes your demo URL

## 10. Cleanup

Delete app resources only:

```bash
kubectl delete -f k8s/09-frontend-service-nodeport.yaml
kubectl delete -f k8s/08-frontend-deployment.yaml
kubectl delete -f k8s/07-backend-service.yaml
kubectl delete -f k8s/06-backend-deployment.yaml
kubectl delete -f k8s/05-mysql-service.yaml
kubectl delete -f k8s/04-mysql-deployment.yaml
kubectl delete -f k8s/03-mysql-pvc.yaml
kubectl delete -f k8s/02-app-configmap.yaml
kubectl delete -f k8s/01-mysql-secret.yaml
kubectl delete -f k8s/00-namespace.yaml
```

Stop Minikube:

```bash
minikube stop
```
