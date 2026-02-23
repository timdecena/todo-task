# Kubernetes Demo Script (Beginner-Friendly)

Use this script while presenting the Kubernetes version of your app. It is written in simple language so you can explain and demo at the same time.

## 1. 30-Second Intro (What Kubernetes Is)

Say:

"Docker helps us package and run containers. Kubernetes helps us manage multiple containers, restart them if they fail, and connect them together in a structured way."

"In this project, Kubernetes runs my frontend, backend, and MySQL database as separate components."

## 2. Show the App Architecture (Simple Mapping)

Say:

"This app has 3 parts:"

- "Frontend: React app served by Nginx"
- "Backend: Spring Boot REST API"
- "Database: MySQL"

"Kubernetes connects them using Services. The frontend calls `/api`, and Nginx forwards it to the backend service named `backend`."

## 3. Show the Kubernetes Files

Show the `k8s/` folder and say:

"I split the Kubernetes setup into separate files so each part is easier to understand:"

- Namespace
- Secret
- ConfigMap
- Persistent Volume Claim
- MySQL Deployment + Service
- Backend Deployment + Service
- Frontend Deployment + NodePort Service

"I also kept `k8s/task-app.yaml` as the old single-file version for comparison."

## 4. Start the Cluster

Run:

```bash
minikube start
kubectl get nodes
```

Say:

"This starts my local Kubernetes cluster using Minikube."

## 5. Apply the Manifests

Run:

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

Say:

"I apply them in order so the namespace, config, and database are created before the app services."

## 6. Show Pods, Services, and Storage

Run:

```bash
kubectl get pods -n task-app
kubectl get svc -n task-app
kubectl get pvc -n task-app
```

Say:

"Here we can see the three pods running."

"The frontend is exposed using NodePort on port `30080`."

"The MySQL storage is persistent because the PVC is bound."

## 7. Open the App

Run:

```bash
minikube service frontend -n task-app --url
```

Open the returned URL in browser.

Say:

"I access the frontend through the Kubernetes Service. The frontend then talks to backend internally through the cluster network."

## 8. Perform CRUD Demo

Do the same task actions you already use in your Docker demo:

1. Create a task
2. Update the task
3. Complete the task
4. Delete the task (soft delete)
5. Open deleted tasks page

Say:

"This confirms the full frontend -> backend -> database flow is working in Kubernetes."

## 9. Quick Resilience/Persistence Proof (Strong Demo)

Optional but recommended:

### Show DB pod name

```bash
kubectl get pods -n task-app
```

### Delete MySQL pod only (not PVC)

```bash
kubectl delete pod -n task-app <mysql-pod-name>
```

### Watch it recreate

```bash
kubectl get pods -n task-app -w
```

Then refresh the app and show the task still exists.

Say:

"Kubernetes recreated the database pod automatically, and my data stayed because it is stored in a Persistent Volume Claim."

## 10. Q&A Talking Points (Simple Answers)

### Why use a Secret?

"To store sensitive values like the MySQL password instead of hardcoding them in the app code."

### Why use a ConfigMap?

"To store non-sensitive configuration like database host and allowed frontend origins."

### Why use a Service?

"A Service gives a stable name and network address so containers can find each other, even if pods restart."

### Why use a PVC?

"Without it, database data can be lost when the pod is recreated."

### Why NodePort for demo?

"NodePort is the easiest way to expose the app in a local Minikube setup without installing an Ingress controller."

## 11. Backup Troubleshooting Lines (If Something Fails During Demo)

Run:

```bash
kubectl logs deployment/backend -n task-app
kubectl logs deployment/mysql -n task-app
kubectl describe pod -n task-app <pod-name>
```

Say:

"If a pod is not ready, I check logs and describe output first. Most issues are image tags, startup timing, or configuration values."
