# Reference: Sample DevOps & Deployment Architecture Document

This reference document illustrates a complete **DevOps, CI/CD, and Cloud Deployment Plan** produced by the DevOps Deployment Engineer skill for a containerized microservice web application ("CloudHorizon").

---

# DevOps Deployment Plan: CloudHorizon

## 1. Hosting Architecture & Topology
- **Edge / Frontend**: Vercel Edge Network / Cloudflare Pages (Global CDN with zero cold starts).
- **Backend / API**: Containerized Node.js/Python services deployed on Railway / AWS ECS Fargate.
- **Database**: Managed PostgreSQL on Supabase / Neon with automated daily backups and WAL replication.
- **Cache**: Upstash Redis with replica clustering.

## 2. Docker Multi-Stage Build Strategy

```dockerfile
# Multi-stage production container build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 3. GitHub Actions CI/CD Pipeline (`.github/workflows/deploy.yml`)
- **Stage 1 (Lint & Test)**: Runs ESLint, Prettier check, Vitest unit suite in parallel.
- **Stage 2 (Security Audit)**: Trivy container vulnerability scanner & `npm audit --audit-level=high`.
- **Stage 3 (Docker Build & Push)**: Pushes immutable image tagged with `sha-${{ github.sha }}` to container registry.
- **Stage 4 (Deploy & Healthcheck)**: Triggers deployment hook and polls `/healthz` endpoint with 30s timeout.
