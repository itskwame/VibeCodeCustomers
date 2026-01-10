# QA / Test Plan

## Automated tests
- `npm run test` – runs `vitest` unit tests (currently covers usage helper + period key formatting).

## Manual verification (per PRD section 13)
1. Auth flow – register, log in, and ensure `/dashboard` loads the expected project list.
2. Create project → discover conversations → open a conversation → run AI analysis → generate a draft.
3. Usage enforcement – validate `/api/usage` shows counts and plan limits, then confirm the dashboard usage meter updates.
4. Billing & plan – visit `/settings/billing`, click the `Upgrade to Pro` button, and observe the checkout stub response.
5. Webhook resilience – post a JSON payload to `/api/billing/webhook` and confirm a `200` response with `received: true`.

Document any regressions here before shipping.
