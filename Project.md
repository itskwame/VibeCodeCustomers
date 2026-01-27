Product Requirements Document (PRD) — Agent-Ready Build Spec (v1.5)
Product: VibeCodeCustomers
Date: 2026-01-09
Owner: Product / Engineering
Primary Audience: Vibe Coders / Indie Hackers (builders shipping quickly using AI)
Core Value Prop: Turn "I built it, now what?" into "I found my first 10 paying customers."

VibeCodeCustomers_PRD_v1_5
________________________________________
1) Executive Summary & Target Customer
1.1 The Target Customer: The “Vibe Coder”
The target user is a Vibe Coder who has used AI to build a SaaS or app at lightning speed. They have a working product (or a solid MVP) but are stuck at the “Distribution Wall.”
Pain Points
•	The “Ghost Town” Effect: They built it, but nobody knows it exists.
•	Marketing Friction: They are great at prompting AI to code, but struggle with manual outreach, marketing copy, and finding where their audience hangs out.
•	Cold Outreach Anxiety: They don’t want to be “that spammy guy” on Reddit or Twitter.
•	Time Poverty: They want to spend time building/improving, not spending 5 hours a day scrolling subreddits for leads.
1.2 The Solution
VibeCodeCustomers is the “Distribution Layer” for Vibe Coders. It automates the discovery of people actively complaining about the problems their app solves and uses AI to draft helpful, non-salesy responses that convert “complainers” into “customers.”

VibeCodeCustomers_PRD_v1_5
________________________________________
2) Scope & Constraints
2.1 MVP Scope (Must-Have)
•	Auth (sign up / sign in / sign out).
•	Project setup (name, optional URL, 1–2 sentence description).
•	Keyword/pain-phrase suggestions from project description.
•	Reddit conversation discovery (by keyword + recency) with scoring/flags.
•	AI reply drafting engine with hard constraints (help-first, non-spammy).
•	Usage limits by plan + upgrade flow (Stripe checkout).
•	Pricing page + in-app pricing modal with Monthly/Annual toggle (Save 25%).
2.2 Out of Scope (Phase 2+)
•	Cross-platform discovery (X, Discord, etc.).
•	Teams/agency workspaces.
•	Advanced analytics dashboards.
•	Automated posting.
•	CRM / pipeline automation.

VibeCodeCustomers_PRD_v1_5
________________________________________
3) Landing Page PRD (High-Converting Marketing Site)
3.1 Hero Section (Locked — Do Not Change Without A/B Test)
•	Headline: You built it with AI. Now get customers with AI.
•	Subheadline: Stop shouting into the void. We find people actively looking for your solution and help you engage them, without being spammy.
•	Primary CTA: Start Finding Customers (Free).
3.2 The “Vibe Coder” Problem Section (Locked)
Copy:
“Vibe coding is fast. Marketing is slow. You shipped your app in a weekend, but you’ve been looking for your first 10 users for a month.”
Bullets
•	Stop manually scanning subreddits for hours.
•	Stop writing cold DMs that get ignored.
•	Stop running ads before you know people want this.
•	Stop guessing where your customers are.
Transition Line:
There is demand for what you built. You just haven’t been plugged into it yet.
________________________________________
How Most People Try to Get Customers (And Why It’s So Hard)
Comparison Table
Approach	What You Get	Why It’s Frustrating
Agencies	Outsourced marketing	$1,000–$5,000+/month, slow feedback, little control
Ads	Cold traffic	You pay for clicks, not buyers, and burn cash before PMF
Cold DMs	Manual outreach	Time-consuming, awkward, and usually ignored
Manual Reddit/Forums	DIY research	Hours of scrolling, guessing, and rewriting messages
VibeCodeCustomers	People already asking for your solution	High intent, fast conversations, and help-first replies that actually convert
Supporting Copy (Key Reframe)
Most tools help you broadcast.
Agencies help you promote.
Ads help you interrupt.
VibeCodeCustomers helps you show up where people are already asking for help.
You’re not chasing customers.
You’re joining conversations they already started.
________________________________________
3.3 Full Landing Page — Section Order & Copy Requirements
•	Hero (above the fold) with CTA + secondary “See Example” anchor link.
•	Social proof strip (as soon as available): 3 short testimonials OR “Used by early indie builders” placeholders.
•	How it Works (4 steps): Describe → Discover → Draft → Engage.
•	Differentiator: “Help-first replies, not spam” (explain the constraint system).
•	Product Demo Panel: 1 thread preview + generated reply (static example).
•	Pricing (Monthly/Annual toggle, Save 25% annual).
•	FAQ (anti-spam, niches, limits, refunds).
•	Final CTA (repeat primary CTA).
3.4 Pricing on Landing Page (With Toggle)
Include a toggle: Monthly | Annual (Save 25%).
Default = Monthly. Annual displays discounted price and shows a “Save 25%” badge.
Plans
•	Free: $0 — 1 project, 10 leads/month, 5 AI drafts/month.
•	Starter: $29/month OR $261/year (25% off) — 1 project, 300 leads/month, 50 AI drafts/month.
•	Pro: $99/month OR $891/year (25% off) — Unlimited projects, leads, AI drafts; advanced analysis; priority support.
•	Founding Member: $49/month lifetime pricing (first 100 paid users) OR $441/year (25% off) — Pro features + lifetime discount + priority feedback channel.

VibeCodeCustomers_PRD_v1_5
________________________________________
4) UX / UI Design Standards
4.1 Visual Style
•	Clean, minimalist, “builder tool” aesthetic
•	Emphasize clarity and speed
•	Use consistent spacing, predictable layouts
4.2 Components (Baseline)
•	AppShell layout with left nav + main content
•	Table view for conversations (sortable)
•	Details drawer/modal for thread preview + reply generator
•	Upgrade modal with plan comparison + toggle
•	Toast notifications for actions/errors
4.3 UX Rules
•	“First Win” in under 3 minutes
•	Always show next action
•	Show limits transparently (progress bar or counter)
•	Graceful errors (no cryptic failures)

VibeCodeCustomers_PRD_v1_5
________________________________________
5) Key Features and User Flows
5.1 Primary Flow: First Win
1.	Sign up / log in
2.	Create Project
o	app name
o	app URL (optional)
o	one-sentence description (“vibe”)
3.	AI suggests keywords/pain phrases
4.	System fetches latest matching Reddit threads
5.	User selects a thread → “Generate Reply”
6.	Reply appears with “Copy” button
7.	User hits limit → upgrade prompt (monthly/annual toggle)
5.2 Projects
•	Create/update/delete (soft delete)
•	Store target pain points + keywords
•	Plan enforcement:
o	Free/Starter = 1 project max
o	Pro/Founding = unlimited
5.3 Conversation Discovery (Reddit)
•	Fetch threads by keyword + recency
•	Score by:
o	Pain intensity
o	Intent category
o	Relevance to project
•	Flags:
o	Toxic / hostile threads
o	Meta threads
o	Low intent
5.4 Reply Generator — Hard Constraints
•	Must acknowledge specific pain point
•	Must provide a useful tip first
•	Must avoid marketing language
•	Must not claim false personal experience
•	Must not mention the app until after value is delivered
•	Must produce tone variants (optional): “Friendly”, “Direct”, “Technical”
5.5 Limits + Upgrade Flow
•	When limit reached: show upgrade modal
•	Include toggle monthly/annual
•	Show “Save 25% annual” badge
•	Allow upgrade in <30 seconds via Stripe checkout

VibeCodeCustomers_PRD_v1_5
________________________________________
6) Technical Architecture
6.1 Frontend
•	Next.js (App Router) + TypeScript
•	UI components in /components
•	Server actions or API routes for backend calls (choose one pattern and keep consistent)
6.2 Backend
•	API routes under /app/api/* (or /pages/api/* if using Pages Router)
•	Supabase (Postgres) for DB + Auth
•	Stripe for billing + webhooks
•	Reddit ingestion:
o	MVP can use official Reddit API or an allowed approach
o	Store minimal thread metadata for caching and rate control
6.3 Data Model (Minimum)
users
•	id (uuid)
•	email
•	created_at
profiles
•	user_id (uuid, pk/fk)
•	plan (enum: free, starter, pro, founding)
•	plan_status (active, past_due, canceled)
•	stripe_customer_id (nullable)
•	created_at, updated_at
projects
•	id (uuid)
•	user_id (uuid, fk)
•	name
•	url (nullable)
•	description
•	targetPainPoints (text[])
•	keywords (text[])
•	created_at, updated_at, deleted_at (nullable)
conversations
•	id (uuid)
•	project_id (uuid, fk)
•	source (enum: reddit)
•	source_thread_id (text)
•	subreddit
•	title
•	url
•	snippet
•	pain_score (int 0–100)
•	intent_category (enum)
•	toxicity_flag (bool)
•	created_at
usage
•	id (uuid)
•	user_id
•	month (YYYY-MM)
•	leads_used (int)
•	drafts_used (int)
•	updated_at
6.4 API Endpoints (Minimum)
All endpoints require: rate limiting, schema validation, auth (except a few public ones), authorization checks (prevent IDOR).
•	POST /api/projects (auth)
•	GET /api/projects (auth)
•	GET /api/projects/:id (auth + ownership)
•	PATCH /api/projects/:id (auth + ownership)
•	DELETE /api/projects/:id (auth + ownership)
•	POST /api/ai/suggest-keywords (auth)
•	GET /api/conversations?projectId=... (auth + ownership)
•	POST /api/ai/generate-reply (auth + ownership)
•	POST /api/billing/checkout (auth)
•	POST /api/billing/webhook (public; signed verification required)
•	GET /api/health (public; rate-limited)

VibeCodeCustomers_PRD_v1_5
________________________________________
7) File Structure and Naming Patterns
7.1 File Structure (Recommended)
/app
  /(marketing)
    /page.tsx
    /pricing/page.tsx
  /(app)
    /dashboard/page.tsx
    /projects/page.tsx
    /projects/[projectId]/page.tsx
    /admin/page.tsx
  /api
    /projects/route.ts
    /projects/[projectId]/route.ts
    /conversations/route.ts
    /ai/suggest-keywords/route.ts
    /ai/generate-reply/route.ts
    /billing/checkout/route.ts
    /billing/webhook/route.ts
/components
  /ui/...
  /pricing/PlanCard.tsx
  /pricing/BillingToggle.tsx
  /conversations/ConversationTable.tsx
  /conversations/ConversationDrawer.tsx
  /reply/ReplyComposer.tsx
/lib
  /auth/requireUser.ts
  /auth/requireAdmin.ts
  /security/rateLimit.ts
  /security/validate.ts
  /security/sanitize.ts
  /db/supabaseServer.ts
  /billing/stripe.ts
  /billing/plans.ts
  /reddit/client.ts
  /reddit/scoring.ts
/types
  /plans.ts
  /conversations.ts
  /projects.ts
7.2 Naming Patterns
•	Components: PascalCase.tsx
•	Routes: route.ts
•	Helpers: camelCase.ts
•	Constants: UPPER_SNAKE_CASE
•	DB columns: snake_case
•	IDs: UUIDs only
•	Enums: explicitly typed (TypeScript + DB)

VibeCodeCustomers_PRD_v1_5
________________________________________
8) Security Requirements (Non-Negotiable)
This section is required for Definition of Done. Failure = not shippable.
8.1 Rate Limiting (All Public Endpoints)
Requirement: Rate limiting on all public endpoints (IP + user-based, sensible defaults, graceful 429s).
•	Apply IP-based limits for unauthenticated routes (billing webhook uses signature verification).
•	Apply user-based + IP-based limits for authenticated routes.
•	Return 429 Too Many Requests with short message and Retry-After header where feasible.
•	Sensible defaults:
o	Authenticated: 60 req/min/user + 120 req/min/IP
o	AI generation: 10 req/min/user
o	Public health/marketing endpoints: 30 req/min/IP
8.2 Strict Input Validation & Sanitization
Requirement: Strict input validation & sanitization on all user inputs (schema-based, type checks, length limits, reject unexpected fields).
•	Use schema validation (e.g., Zod) with strict() to reject unknown fields.
•	Type checks + length limits enforced server-side.
•	Max lengths:
o	project name ≤ 80 chars
o	description ≤ 500 chars
o	keyword ≤ 40 chars
o	max 25 keywords
•	Sanitize strings to remove control characters.
•	Validate URLs strictly (allowlist http/https).
•	Validate IDs as UUID only.
8.3 SQL Injection Protections
•	Use parameterized queries only (Supabase client / prepared statements).
•	No string concatenation for SQL.
•	If using RPC/functions:
o	validate all arguments
o	avoid dynamic SQL
•	Logging must never print raw query strings with user input.
8.4 IDOR Protections (Insecure Direct Object Reference)
•	Every request referencing projectId, conversationId, userId, etc. must verify resource exists and belongs to req.user.id.
•	Return 404 (not 403) when access is not permitted (reduce enumeration).
8.5 Auth on Admin Routes
•	Admin pages and endpoints must require requireAdmin() middleware.
•	Admin claim stored server-side (Supabase custom claim or separate allowlist table).
•	No admin gating via client-side checks alone.
•	Admin routes:
o	/app/(app)/admin/*
o	/api/admin/* (if added)
8.6 Secure API Key Handling
Requirement: Secure API key handling (remove coded keys, move to environment variables, rotate keys, ensure no keys are exposed client-side).
•	All keys in environment variables only.
•	Never expose secret keys in the client bundle.
•	Use server-only modules for Stripe/OpenAI/Reddit keys.
•	Key rotation procedure documented.
•	CI secret scanning to prevent committing secrets.
8.7 Stripe Security
•	Webhook endpoint must verify signature and reject unsigned/invalid payloads.
•	Webhook can be rate-limited conservatively without breaking Stripe (allowlist if needed).
•	Billing state updates must be server-side only.
8.8 Additional Security Baseline
•	CSRF protection where applicable.
•	Security headers: CSP, HSTS, X-Frame-Options, etc.
•	Audit logs for plan changes and admin actions.
•	Avoid verbose errors; log internally; return generic messages.

VibeCodeCustomers_PRD_v1_5
________________________________________
9) Definition of Done (Updated)
•	A user can reach a “First Win” in <3 minutes.
•	Limits are enforced accurately by plan.
•	Monthly/Annual toggle works and charges correct Stripe prices.
•	Founding Member offer is enforced (first 100 paid users).
•	All API routes have:
o	rate limiting (IP + user)
o	strict validation (reject unknown fields)
o	ownership checks (IDOR-proof)
o	SQL injection protections (parameterized)
•	Admin routes are protected server-side.
•	No secrets are shipped client-side (env vars only).

