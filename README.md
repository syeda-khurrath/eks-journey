# eks_journey

A hands-on, 16-week journey from **Docker → ECS Fargate → Kubernetes → Amazon EKS → production**, built around one small Node.js application that evolves with every phase.

Goal: be job-ready for **DevOps Engineer, SRE, Kubernetes Administrator and EKS Production Support** roles, with a portfolio repo that proves it.

> ⚠️ **Cost warning.** Most labs create billable AWS resources (EKS control plane, EC2 nodes, NAT gateways, load balancers, EBS/EFS). Set a billing budget alert first and run the cleanup step at the end of **every** session. Check current AWS pricing before you start.

---

## Who this is for

You already know basic Linux, AWS EC2 and Docker, but are new to Kubernetes and EKS.

## Prerequisites

| Tool | Purpose |
|---|---|
| AWS account (sandbox, MFA, budget alert) | All cloud labs |
| AWS CLI v2 | Talk to AWS |
| Docker | Build and run images |
| kubectl | Talk to Kubernetes |
| kind | Free local Kubernetes (Phase 2) |
| eksctl | Quick EKS clusters |
| Terraform (>= 1.5) | Infrastructure as code |
| Helm 3 | Install platform components |
| Git + GitHub account | CI/CD (Phase 9) |
| Optional: velero CLI, trivy, ab/hey | Backup, scanning, load tests |

Verify your setup:

```bash
aws sts get-caller-identity
docker version --format '{{.Server.Version}}'
kubectl version --client
eksctl version
terraform version
helm version --short
kind version
```

Default region used in examples: `ap-south-1` (change it freely).

---

## Roadmap at a glance

| Week | Phase | Topic | Deliverable |
|---|---|---|---|
| 1 | 1 | Node.js app + Docker (images, volumes, networks) | Containerized app |
| 2 | 1 | ECR, ECS Fargate, ALB, Auto Scaling, CloudWatch | **Project 1:** app on Fargate |
| 3 | 2 | Why Kubernetes; Pods, labels, namespaces, kubectl | Pods on kind |
| 4 | 2 | ReplicaSets, Deployments, rolling updates, rollbacks | Zero-downtime update |
| 5 | 2 | Services and networking | **Project 2:** raw-YAML deployment |
| 6 | 3 | EKS setup: IAM, VPC, eksctl, Terraform, node groups, Fargate | Two working clusters |
| 7 | 4 | ConfigMaps, Secrets, production-style Deployment | **Project 3:** app on EKS |
| 8 | 5 | AWS Load Balancer Controller, Ingress, ACM, Route53 | **Project 4:** `https://app.mydomain.com` |
| 9 | 6 | Prometheus, Grafana, Loki, alerts | **Project 5:** dashboards + alert rules |
| 10 | 7 | PV/PVC, StorageClass, EBS and EFS CSI | **Project 6:** stateful app |
| 11 | 8 | RBAC, IRSA, NetworkPolicy, secrets, hardening | Security lab pack |
| 12 | 9 | GitHub Actions → ECR → EKS | **Project 7:** push-to-deploy |
| 13 | 10 | Requests/limits, HPA, Cluster Autoscaler | Autoscaling demo |
| 14 | 10 | Multi-AZ, backup, DR, cost optimization | **Project 8:** HA production app |
| 15 | Capstone | Rebuild everything as code | Capstone repo |
| 16 | Career | Incident drills, interview prep, mock exam | Portfolio + mock interviews |

The full syllabus (theory, analogies, ASCII diagrams, commands, expected outputs, troubleshooting, interview questions, quizzes) lives in the **Amazon EKS Mastery Roadmap** document. Save a copy as `docs/roadmap.md`.

---

## Repository layout

```
eks_journey/
├── README.md
├── docs/
│   ├── roadmap.md              # the full syllabus
│   ├── notes/                  # your weekly notes
│   ├── runbooks/               # PodCrashLooping.md, NodeNotReady.md, ...
│   ├── adr/                    # architecture decision records
│   └── interview-answers.md    # answers in your own words
├── app/                        # Node.js app (server.js, Dockerfile, package.json)
├── phase1-docker-ecs/          # ECS task definition, scaling policy, scripts
├── phase2-k8s-fundamentals/    # kind labs: pods, deployments, services YAML
├── phase3-eks-setup/
│   ├── eksctl/cluster.yaml
│   └── terraform/              # VPC + EKS modules
├── phase4-app-on-eks/k8s/      # namespace, configmap, deployment, service, pdb
├── phase5-ingress/             # ingress.yaml, ACM + Route53 steps
├── phase6-observability/       # helm values, ServiceMonitor, alerts, dashboards
├── phase7-storage/             # StorageClass, StatefulSet, EFS, snapshots
├── phase8-security/            # RBAC, IRSA, NetworkPolicy, ExternalSecrets
├── phase9-cicd/                # (workflow lives in .github/workflows)
├── phase10-production/         # HPA, Cluster Autoscaler, Velero, spot, cost
├── capstone/                   # final from-scratch build
└── .github/workflows/          # deploy.yml and friends
```

Create the skeleton in one go:

```bash
mkdir -p docs/{notes,runbooks,adr} app phase1-docker-ecs phase2-k8s-fundamentals \
  phase3-eks-setup/{eksctl,terraform} phase4-app-on-eks/k8s phase5-ingress \
  phase6-observability phase7-storage phase8-security phase9-cicd \
  phase10-production capstone .github/workflows
touch docs/interview-answers.md
```

---

## Quick start

```bash
# 1. Build and run the app locally (Week 1)
cd app
docker build -t node-app:v1 .
docker run -d --name web -p 8080:3000 node-app:v1
curl localhost:8080/health          # {"status":"ok"}

# 2. Practice Kubernetes for free (Weeks 3-5)
kind create cluster --name lab
kind load docker-image node-app:v1 --name lab
kubectl apply -f phase2-k8s-fundamentals/

# 3. Go to the cloud (Week 6 onward)
eksctl create cluster -f phase3-eks-setup/eksctl/cluster.yaml
aws eks update-kubeconfig --name demo-eks --region ap-south-1
kubectl get nodes
```

---

## Application endpoints

| Path | Purpose |
|---|---|
| `/` | Hello message, version, hostname (Pod name on Kubernetes) |
| `/health` | Liveness/readiness and load balancer health checks |
| `/cpu` | Burns CPU to trigger autoscaling |
| `/visits` | Counter stored on a volume (storage labs) |
| `/config` | Shows ConfigMap/Secret injection (never prints the secret) |
| `/metrics` | Prometheus metrics |

---

## Working agreements

- **Everything as code.** No manual console changes that are not written down.
- **Tag images with the Git commit SHA.** Never deploy `latest`.
- **No secrets in Git.** Use Secrets Manager + External Secrets, or Kubernetes Secrets created out of band.
- **Pin versions** for Kubernetes, Helm charts, add-ons, Terraform modules and GitHub Actions.
- **Commit after every lab**, with notes: what you did, what broke, how you fixed it.
- **Redraw each ASCII diagram by hand** before moving on.

## Weekly rhythm (about 10-12 hours)

| Time | Activity |
|---|---|
| 2h | Theory and diagrams |
| 5-6h | Hands-on labs |
| 2h | Mini-project |
| 1h | Interview questions + quiz |
| 1h | Notes and runbook updates |

---

## Cleanup (end of every session)

```bash
# 1. Remove load balancers created by Kubernetes first
kubectl delete ingress --all -A
kubectl delete svc --all -n shop

# 2. Remove the cluster
eksctl delete cluster -f phase3-eks-setup/eksctl/cluster.yaml
#   or: cd phase3-eks-setup/terraform && terraform destroy

# 3. Verify nothing is still billing
aws eks list-clusters
aws ec2 describe-nat-gateways --filter Name=state,Values=available
aws elbv2 describe-load-balancers --query 'LoadBalancers[].LoadBalancerName'
aws ec2 describe-volumes --filters Name=status,Values=available --query 'Volumes[].VolumeId'
aws efs describe-file-systems --query 'FileSystems[].FileSystemId'
```

Also delete Route53 test records, extra S3 buckets and unneeded ECR images.

---

## Progress tracker

- [ ] Week 1 - Docker fundamentals
- [ ] Week 2 - ECS Fargate project
- [ ] Week 3 - Pods, labels, namespaces
- [ ] Week 4 - Deployments and rollbacks
- [ ] Week 5 - Services and networking
- [ ] Week 6 - EKS with eksctl and Terraform
- [ ] Week 7 - Production-style deployment on EKS
- [ ] Week 8 - HTTPS Ingress and Route53
- [ ] Week 9 - Prometheus, Grafana, Loki
- [ ] Week 10 - Storage and stateful apps
- [ ] Week 11 - Security
- [ ] Week 12 - CI/CD pipeline
- [ ] Week 13 - Autoscaling
- [ ] Week 14 - HA, backup, DR, cost
- [ ] Week 15 - Capstone
- [ ] Week 16 - Interview prep and mock exam

## Skills you will be able to claim

- Containerize and ship apps with ECR, ECS Fargate, ALB and CloudWatch
- Operate EKS clusters (VPC design, IAM, node groups, Fargate profiles, add-ons)
- Deploy with Deployments, Services, ConfigMaps, Secrets, Ingress and TLS
- Observe systems with Prometheus, Grafana and Loki, and write actionable alerts
- Run stateful workloads on EBS/EFS with snapshots and restores
- Secure clusters with RBAC, IRSA, NetworkPolicy, PSA and external secrets
- Automate delivery with GitHub Actions (OIDC, scanning, rollback)
- Scale, harden for multi-AZ, back up with Velero, plan DR, and control cost

## Next steps after week 16

CKAD → CKA → CKS, an AWS associate/professional certification, then GitOps (Argo CD), Karpenter, service mesh, OpenTelemetry and policy-as-code (Kyverno/OPA).

