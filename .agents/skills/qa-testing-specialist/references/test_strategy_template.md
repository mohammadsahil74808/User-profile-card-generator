# Reference: Sample Test Strategy Document

This reference document illustrates a complete **QA Test Automation & Verification Plan** produced by the QA Testing Specialist skill for a high-availability fintech application ("PayStream Core").

---

# QA Test Strategy: PayStream Core

## 1. Test Pyramid & Scope
- **Unit Tests**: Target > 85% branch coverage on core domain logic, accounting ledger math, and token validation.
- **Integration Tests**: Target > 80% coverage on database transactions, external payment gateway mocks, and caching layers.
- **End-to-End (E2E) Tests**: Target 100% pass on 8 critical user journeys (Checkout, Transfer, 2FA Verification, Dispute Filing).

## 2. Test Execution Matrix
| Level | Framework | Frequency | Target SLA |
| :--- | :--- | :--- | :--- |
| **Unit** | Vitest / Jest | Pre-commit & PR | < 15 seconds |
| **API Contract**| Supertest / Pact | PR merge gate | < 45 seconds |
| **E2E / UI** | Playwright | Nightly & Pre-deploy | < 5 minutes |
| **A11y** | Axe-core | PR merge gate | Zero Critical/Serious violations |

## 3. Mocking & Fixtures Guidelines
- Use MSW (Mock Service Worker) for network-level API mocking in browser/frontend tests.
- Always use deterministic test seeds for database state (`test_seed.sql`).
- Isolate test runs with dynamic database schemas or ephemeral SQLite/Testcontainers.
