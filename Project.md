# Product Requirements Document (PRD) 

## Product: VibeCodeCustomers
**Version:** 1.1  
**Date:** 2026-01-09  
**Owner:** Product / Engineering  
**Audience:** AI engineering agent + human reviewer  

### Terminology update
Throughout this PRD, use **“Vibe Coders / Indie Hackers”** to refer to builders who ship quickly using AI (“vibe coding”).

---

## 1) Executive Summary

**VibeCodeCustomers** is a conversation discovery + response drafting SaaS that helps **Vibe Coders / Indie Hackers** find real people discussing problems their product solves (starting with Reddit), then craft **value-first, non-spammy** responses using AI.

The product turns “customer discovery” into a repeatable workflow:
1) Define a project (what you’re building + keywords + target communities)
2) Discover relevant conversations
3) Understand pain points via AI summaries
4) Draft helpful responses
5) Track engagement outcomes

---

## 2) Goals, Non-Goals, and Principles

### 2.1 Business Goals
- Achieve **$10k MRR** within 12 months
- Convert **15%** of active free users to paid
- Retain **70%** of paid users at 3 months

### 2.2 Product Goals
- Reduce discovery time from **hours → minutes**
- Deliver **high relevance** results (target: users “save” ≥ 30% of surfaced conversations)
- Generate drafts that are **usable** (target: users copy/edit ≥ 60% of drafts)

### 2.3 Non-Goals (MVP)
- Auto-posting to Reddit (copy-only in MVP)
- Multi-platform discovery beyond Reddit (Twitter/X, HN, etc. post-MVP)
- Full CRM replacement

### 2.4 Product Principles
- **Ethical by design:** discourage spam, encourage help
- **Fast to value:** first useful conversation within 2 minutes of signup
- **Explainable AI:** show “why this matched” + allow feedback

---

## 3) Target Users & Personas

### Primary: Vibe Coders / Indie Hackers
- Solo founders and small teams shipping SaaS quickly with AI tools
- Budget-sensitive, time-sensitive, needs early traction

### Personas
1) **Solo Founder Sarah**: wants quick customer discovery and validation
2) **Vibe Coder / Indie Hacker Mike**: wants AI drafts that don’t sound salesy
3) **Bootstrapped Founder Lisa**: wants to track what outreach converts
4) **Builder Alex**: wants guardrails so they don’t get banned / spam communities

---

## 4) Core User Journeys (MVP)

### 4.1 First-time user journey (Activation)
1. Visit landing page → understands value
2. Sign up / log in
3. Create first project (name, what you’re building, keywords, subreddits)
4. Run discovery → see ranked conversations
5. Open a conversation → read AI summary + pain points
6. Generate a draft → edit → copy

**Activation success criteria:** user generates **≥ 1 draft** and **copies** it within first session.

### 4.2 Daily workflow
- Login → dashboard shows “new opportunities”
- Filter by time and relevance
- Save / dismiss conversations
- Generate drafts for top opportunities

### 4.3 Monetization (upgrade)
- Hit free limits → prompted to upgrade
- Checkout via Stripe → immediate access to Pro limits

---

## 5) Feature Requirements (Prioritized)

### 5.1 P0 (Must Have) — MVP

#### A) Authentication
- Email/password sign up + login
- JWT session
- Password reset (optional for MVP but recommended)

**Acceptance Criteria**
- Users can register/login/logout
- Protected routes require auth

#### B) Projects
- Create/update/archive projects
- Project fields:
  - `name`
  - `productDescription` (what you’re building)
  - `keywords[]`
  - `subreddits[]`
  - `createdAt`, `updatedAt`

**Acceptance Criteria**
- User can create a project and see it in dashboard

#### C) Conversation Discovery (Reddit)
- Search Reddit using project keywords and subreddits
- Store conversations (post URL, title, author, subreddit, createdAt, score, numComments, excerpt)
- Compute a relevance score (heuristic + AI optional)

**Acceptance Criteria**
- User runs discovery and sees results within ~30 seconds

#### D) Conversation View + AI Analysis
- For each conversation:
  - AI summary
  - extracted pain points
  - suggested angle (how to help)
  - “why matched” explanation

**Acceptance Criteria**
- Opening a conversation shows AI analysis reliably

#### E) Draft Generation + Editor
- Generate response draft(s) with:
  - Tone options: helpful, casual, professional
  - Length options: short/medium/long
  - Value-first template (no hard selling)
- Draft editor supports editing and copy-to-clipboard
- Store drafts for later

**Acceptance Criteria**
- User can generate, edit, and copy a draft

#### F) Usage Limits + Plans
- Free plan limits:
  - 1 project
  - 10 conversations/month
  - 5 drafts/month
- Pro plan removes/raises limits

**Acceptance Criteria**
- Limits enforced server-side
- UI clearly shows remaining usage

#### G) Billing (Stripe)
- Stripe checkout for Pro subscription
- Webhook handling to update subscription status

**Acceptance Criteria**
- Paid user instantly sees Pro entitlements after checkout

---

### 5.2 P1 (Should Have)
- Saved searches and scheduled discovery
- Export conversations to CSV
- Outcome tracking (engaged, replied, converted)
- Team accounts (post-MVP if scope too large)

### 5.3 P2 (Nice to Have)
- Chrome extension
- Slack alerts
- Multi-platform discovery (HN, Twitter/X, LinkedIn)

---

## 6) Data Model (PostgreSQL + Prisma)

### 6.1 Entities (MVP)

#### User
- `id` (uuid)
- `email` (unique)
- `passwordHash`
- `plan` (FREE | PRO)
- `createdAt`, `updatedAt`

#### Project
- `id` (uuid)
- `userId` (FK → User)
- `name`
- `productDescription`
- `keywords` (string[])
- `subreddits` (string[])
- `isArchived` (bool)
- `createdAt`, `updatedAt`

#### Conversation
- `id` (uuid)
- `projectId` (FK → Project)
- `platform` (REDDIT)
- `externalId` (Reddit post id)
- `url`
- `title`
- `author`
- `subreddit`
- `createdAt` (post timestamp)
- `score`
- `numComments`
- `excerpt`
- `relevanceScore` (0-100)
- `aiSummary` (text)
- `aiPainPoints` (json/text)
- `aiWhyMatched` (text)
- `lastAnalyzedAt`
- `createdAtDb`, `updatedAtDb`

#### Draft
- `id` (uuid)
- `conversationId` (FK → Conversation)
- `userId` (FK → User)
- `tone`
- `length`
- `content`
- `createdAt`

#### Subscription
- `id` (uuid)
- `userId` (FK → User)
- `stripeCustomerId`
- `stripeSubscriptionId`
- `status` (active | canceled | past_due | incomplete)
- `currentPeriodEnd`

#### UsageEvent (for enforcement + analytics)
- `id` (uuid)
- `userId`
- `type` (DISCOVERY_CONVERSATION | DRAFT_GENERATION)
- `count` (int)
- `createdAt`
- `periodKey` (e.g., `2026-01`)

### 6.2 Notes for agent
- Enforce limits by aggregating `UsageEvent` in the current `periodKey`
- Store AI outputs on `Conversation` to avoid re-spend; only re-run AI if stale or user requests

---

## 7) API Specification (Node.js + Express + TypeScript)

### 7.1 Auth
- `POST /api/auth/register`
  - body: `{ email, password }`
  - returns: `{ token, user }`
- `POST /api/auth/login`
  - body: `{ email, password }`
  - returns: `{ token, user }`
- `GET /api/auth/me` (protected)
  - returns: `{ user }`

### 7.2 Projects (protected)
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `POST /api/projects/:id/archive`

### 7.3 Discovery + Conversations (protected)
- `POST /api/conversations/discover`
  - body: `{ projectId, timeRange }`
  - returns: `{ conversationsAdded, totalFound }`
- `GET /api/conversations?projectId=&timeRange=&minRelevance=`
- `GET /api/conversations/:id`

### 7.4 AI (protected)
- `POST /api/ai/analyze`
  - body: `{ conversationId }`
  - returns: `{ aiSummary, aiPainPoints, aiWhyMatched }`
- `POST /api/ai/draft`
  - body: `{ conversationId, tone, length }`
  - returns: `{ draft }`

### 7.5 Billing (Stripe)
- `POST /api/billing/create-checkout-session`
  - returns: `{ url }`
- `POST /api/billing/webhook` (raw body)
  - handles: subscription created/updated/canceled

### 7.6 Errors
- Standard error shape:
  - `{ error: { code, message, details? } }`

---

## 8) Frontend Requirements (React + TypeScript)

### 8.1 Routes
- `/` Landing
- `/login` Login
- `/dashboard` Dashboard (protected)
- `/projects/new` Create Project (protected)
- `/projects/:id/conversations` Conversations (protected)
- `/conversations/:id` Conversation Detail + Drafting (protected)
- `/pricing` Pricing
- `/settings/billing` Billing settings (protected)

### 8.2 Key UI Components
- Landing: hero, problem/solution, demo screenshots (optional), pricing, CTA
- Project form: keywords + subreddits chips, description
- Conversations list: filters, ranking, quick summary
- Conversation card: title, subreddit, relevance, excerpt
- Draft editor: tone/length selectors, content editor, copy button
- Usage meter: shows remaining quotas

### 8.3 UX constraints
- Show empty states with clear next action
- Avoid “spammy” copy; emphasize “help-first”

---

## 9) AI Requirements

### 9.1 AI Tasks
1) Analyze conversation → summary + pain points + why matched
2) Draft response → value-first, non-pitchy, tailored

### 9.2 Prompt requirements (high level)
- Must reference:
  - project description
  - conversation context (title, excerpt, top comments if available)
  - constraints: no salesy language, no links unless asked, ask a helpful question

### 9.3 Safety / Anti-spam
- Block or warn on:
  - aggressive CTA (“buy now”, “sign up now”)
  - misleading claims
  - mass outreach patterns

---

## 10) Non-Functional Requirements

### 10.1 Performance
- Core pages load < 2 seconds
- Most API responses < 500ms (excluding AI)

### 10.2 Reliability
- Background retries for Reddit calls
- AI failures degrade gracefully (show raw conversation + try again)

### 10.3 Security
- Password hashing (bcrypt)
- JWT expiry
- Rate limits on auth and AI endpoints
- Server-side validation

### 10.4 Privacy
- Store minimal PII
- Clearly state data usage in product

---

## 11) Analytics & Metrics

### 11.1 Activation + retention
- % who create first project
- % who run discovery
- % who generate draft
- D1/D7/D30 retention

### 11.2 Monetization
- Free→Pro conversion
- Churn

### 11.3 Quality
- Save rate of surfaced conversations
- Draft copy rate
- User feedback on relevance

---

## 12) Milestones (Agent Execution Plan)

### Milestone 0 — Repo + Dev Environment
- Docker compose for Postgres
- Prisma migrations
- Env examples

### Milestone 1 — Auth + Projects
- Fully working auth
- CRUD projects

### Milestone 2 — Reddit Discovery + Conversations
- Fetch + store conversations
- Filters + list UI

### Milestone 3 — AI Analyze + Draft
- AI endpoints + caching
- Draft editor UI

### Milestone 4 — Limits + Billing
- Usage tracking
- Stripe subscription + webhooks

### Milestone 5 — Polish + Deployment
- Logging + error handling
- Basic analytics events
- Deploy docs

**Definition of Done:** all routes work end-to-end, server-side limits enforced, Stripe upgrades change entitlements, and the app is usable for real discovery.

---

## 13) QA / Test Plan (Minimum)

- Unit tests:
  - auth services
  - usage limit logic
- Integration tests:
  - auth flow
  - create project → discover → analyze → draft
- Manual test checklist:
  - free tier caps enforced
  - upgrade toggles Pro
  - webhook idempotency

---

## 14) Open Questions

- Exact pricing for Pro (keep at $29/mo or test $19/$39?)
- Which subreddits to recommend by default?
- Should we store top comments (for better AI context) in MVP?

---

## Appendix A — Launch Channels
- Product Hunt
- Indie Hackers (community)
- Reddit (relevant subreddits)
- Twitter/X
- Hacker News

## Appendix B — Glossary
- **Vibe Coders / Indie Hackers:** builders shipping quickly with AI
- **Conversation:** a Reddit post/thread
- **Draft:** AI-generated response suggestion
- **Relevance score:** 0–100 match score