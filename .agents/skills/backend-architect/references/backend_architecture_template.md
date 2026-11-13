# Reference: Sample Backend Architecture Document

This reference document illustrates a complete **Backend Architecture & Database Plan** produced by the Backend Architect skill for an enterprise SaaS platform ("DataMesh Engine").

---

# Backend Architecture Plan: DataMesh Engine

## 1. System Overview & Technology Stack
- **Database**: PostgreSQL 16 (Hosted via Supabase)
- **API Paradigm**: Hybrid REST (OpenAPI 3.1) & Real-time WebSockets
- **Serverless / Compute**: Cloudflare Workers / Supabase Edge Functions (TypeScript)
- **Auth**: Supabase Auth with JWT and Server-side Row Level Security (RLS)
- **Caching & Rate Limiting**: Upstash Redis (Sliding window rate limit: 100 req/min/user)

## 2. Relational Schema & Migration Design

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'analyst', 'viewer');
CREATE TYPE audit_action AS ENUM ('query_executed', 'dataset_exported', 'access_granted');

-- Core Tenancy & Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan_tier TEXT NOT NULL DEFAULT 'starter',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (Linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Datasets
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    schema_definition JSONB NOT NULL,
    row_count BIGINT DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_datasets_org ON datasets(organization_id);
CREATE INDEX idx_datasets_created_at ON datasets(created_at DESC);
```

## 3. Security & Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Datasets Tenant Isolation Policy
CREATE POLICY "Users can only read datasets belonging to their organization"
ON datasets FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Only admins and analysts can create datasets"
ON datasets FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
);
```

## 4. API Endpoints & Request Contracts

### `POST /api/v1/datasets`
- **Headers**: `Authorization: Bearer <JWT>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Q3 Revenue Logs",
  "schema_definition": {
    "columns": [
      {"name": "transaction_id", "type": "string"},
      {"name": "amount_usd", "type": "numeric"}
    ]
  }
}
```
- **Responses**:
  - `201 Created`: Returns created dataset record with generated UUID
  - `400 Bad Request`: Payload validation error (Zod schema failed)
  - `401 Unauthorized`: Missing or expired token
  - `403 Forbidden`: User role insufficient (viewer trying to write)
