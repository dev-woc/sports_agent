# PRD: The Athlete OS — Unified Athlete Career Platform

**Version:** 1.0
**Date:** February 28, 2026
**Status:** Draft

---

## 1. Executive Summary

The Athlete OS is a three-sided AI-powered marketplace that unifies the fragmented athlete career management experience into a single platform. Today's college and high school athletes navigate 5–7 disconnected tools — Hudl for video, NCSA for recruiting, Opendorse for NIL, a private attorney for contracts, and a freelance editor for highlights — with zero cross-module intelligence connecting them. The Athlete OS replaces this patchwork with five agentic modules: NIL Matchmaker, Combine Optimizer, Recruiter's Shadow, Contract Guard, and Highlight Architect.

The platform mirrors Handshake's proven three-sided marketplace architecture: athletes use the core platform for free, athletic departments and schools pay B2B SaaS fees ($5,000–$75,000/year), and brands pay marketplace fees (10–15%) on brokered NIL deals. The differentiated acquisition wedge is a **parent dashboard** — a product with zero direct competition that serves the $40B+ annual decision-maker, driving bottom-up institutional adoption in the same way Hudl penetrated high schools through coach adoption.

The MVP targets NCAA college athletes and high school athletes in the five highest-density NIL states (California, Florida, New York/New Jersey, Illinois, North Carolina), focusing on the Contract Guard and NIL Matchmaker modules as the highest-urgency, most defensible entry points given the post-House v. NCAA regulatory environment.

**MVP Goal:** Launch a web application with Contract Guard (AI-powered NIL contract review) and NIL Matchmaker (brand-athlete matching) for 500+ beta athletes within 90 days, with parent dashboard and Highlight Architect following in Phase 2.

---

## 2. Mission

**Mission Statement:** Democratize access to the tools, intelligence, and connections that determine athletic career outcomes — regardless of an athlete's zip code, family income, or institutional resources.

**Core Principles:**

1. **Athlete-first, always.** Every feature is designed for the athlete's benefit, not the institution's oversight or the agent's commission.
2. **AI that acts, not just informs.** Agentic automation handles multi-step workflows so athletes spend time competing, not managing paperwork.
3. **Equity as architecture.** The platform is designed from the ground up to eliminate the $4x wealth disparity in recruiting outcomes by making elite-level tools free at the base tier.
4. **Compliance is a moat.** Deep regulatory integration (NIL Go, FERPA, COPPA, state-by-state NIL rules) transforms legal complexity into a competitive barrier.
5. **Data compounds.** Longitudinal athlete data from age 14–22 creates precision that no competitor can replicate retroactively.

---

## 3. Target Users

### Primary Persona 1: The College Athlete (Core User)
- **Profile:** 18–22 year old NCAA athlete (any division), 554,298 total addressable
- **Technical comfort:** Moderate — heavy TikTok/Instagram user, comfortable with mobile apps, less comfortable with desktop SaaS
- **Key pain points:**
  - 97% have no NIL deal despite legal eligibility
  - Cannot afford $250–$500/hr sports attorney to review contracts
  - Must "self-recruit" in transfer portal with no matching intelligence
  - No single profile that follows them across their career
- **Goals:** Maximize NIL earnings, protect themselves from predatory contracts, find the right program if transferring

### Primary Persona 2: The High School Athlete (Growth User)
- **Profile:** 14–18 year old HS athlete in a NIL-permitting state, 8.26M total addressable
- **Technical comfort:** High — digital native, creates content natively
- **Key pain points:**
  - Spends $5,000–$15,000+ on fragmented recruiting services over 4 years
  - Has no professional highlight reel without paying $150–$2,000
  - Parents manage recruiting logistics with no unified dashboard
  - 98% must self-recruit; only 7% make a college roster
- **Goals:** Get recruited to the right college program, maximize scholarship opportunities, build a professional-grade profile

### Primary Persona 3: The Sports Parent (Acquisition Wedge)
- **Profile:** Parent of athlete aged 12–18, invests 3hr 23min/sports day on logistics
- **Technical comfort:** Moderate — uses apps, email, Google Sheets for tracking
- **Key pain points:**
  - No unified dashboard for recruiting timelines, NIL opportunities, eligibility tracking
  - Spends $40B+ annually on fragmented youth sports services
  - Primary purchasing decision-maker but no product is built for them
  - Vulnerable to high-pressure NCSA-style phone sales ($1,320–$4,200 packages)
- **Goals:** Understand their child's recruiting landscape, manage compliance, make informed financial decisions about sports investment

### Primary Persona 4: The College Coach (B2B Monetization)
- **Profile:** NCAA coach, works 75 hrs/week, 7+ hours on recruiting
- **Technical comfort:** High for video tools (Hudl), moderate for data platforms
- **Key pain points:**
  - Receives thousands of videos weekly, watches only first 3–5 min of each
  - Has no way to find athletes at events and capture contact info efficiently
  - Manages transfer portal and high school pipelines simultaneously
  - Post-House compliance burden requires entirely new staff positions
- **Goals:** Find the right athletes faster, manage roster caps intelligently, reduce compliance overhead

### Primary Persona 5: The Brand/Sponsor (Revenue Side)
- **Profile:** Local/regional business or national brand seeking NIL athlete partnerships
- **Technical comfort:** Moderate — uses standard marketing tools
- **Key pain points:**
  - Only ~2,000 companies actively seek NIL deals against 180,000+ D1 athletes
  - Cannot evaluate athlete audience demographics or compliance readiness
  - Opendorse and MarketPryce have sparse active campaigns (212 active, only 35 >$750)
- **Goals:** Find authentic athlete partners that match their geography/demographics, execute compliant deals efficiently

---

## 4. MVP Scope

### Core Functionality

**In Scope (MVP):**
- ✅ Athlete onboarding flow with sport, position, school, eligibility status
- ✅ **Contract Guard** — AI-powered NIL contract review with clause flagging (predatory terms, perpetuity clauses, buyout penalties, exclusivity traps)
- ✅ **NIL Matchmaker** — brand-athlete matching based on sport, geography, audience demographics, compliance status
- ✅ **Parent Dashboard** — unified view of recruiting timeline, NIL opportunities, eligibility tracking
- ✅ Athlete public profile with basic stats and social links
- ✅ Brand/sponsor onboarding and campaign creation
- ✅ Free tier (basic profile, limited matches) and Pro tier ($29.99/mo)
- ✅ State-by-state NIL eligibility rule engine (42 states + D.C.)
- ✅ NIL deal submission to NIL Go clearinghouse (for D1 athletes)
- ✅ Email notifications for matches and contract review results

**Out of Scope (MVP):**
- ❌ Combine Optimizer (Phase 2)
- ❌ Recruiter's Shadow / transfer portal matching (Phase 2)
- ❌ Highlight Architect / AI video production (Phase 2)
- ❌ Coach/institutional B2B dashboard (Phase 3)
- ❌ Mobile native apps (iOS/Android) — web-first only
- ❌ Data licensing marketplace (Phase 4)
- ❌ Financial planning / tax documentation tools (Phase 3)
- ❌ Direct messaging between athletes and coaches (Phase 3)
- ❌ Wearable data integrations (Phase 3)

### Technical

**In Scope (MVP):**
- ✅ Next.js 14 web application (App Router)
- ✅ Supabase for auth, database, and storage
- ✅ Claude claude-sonnet-4-6 for contract analysis and matching intelligence
- ✅ Stripe for subscription billing
- ✅ Vercel deployment with Analytics and Speed Insights
- ✅ Railway for backend services / API
- ✅ FERPA-compliant data handling (school-linked athlete data)
- ✅ COPPA-compliant parental consent flow (users under 13)

**Out of Scope (MVP):**
- ❌ Real-time collaboration features
- ❌ Self-hosted LLM inference
- ❌ Custom video processing pipeline
- ❌ Native mobile apps

### Integration

**In Scope (MVP):**
- ✅ NIL Go clearinghouse API (deal submission/status)
- ✅ Stripe payment processing
- ✅ Vercel Analytics

**Out of Scope (MVP):**
- ❌ Hudl API integration
- ❌ NCAA Eligibility Center API
- ❌ Twitter/X, TikTok, Instagram API (social proof/audience data) — manual entry only in MVP
- ❌ NCSA / FieldLevel data imports

---

## 5. User Stories

### Athletes

**Story 1: Contract Review**
> As a college athlete, I want to upload an NIL contract and receive a plain-English analysis of risky clauses, so that I can protect myself from predatory terms without paying $500–$1,500 for an attorney.

*Example:* A freshman quarterback receives a "lifetime marketing agreement" from a local collective agent. She uploads the PDF, and Contract Guard flags the 15% lifetime commission clause, the perpetuity term, and the absence of a buyout clause — presenting each as a red-flag card with plain-English explanation and recommended action.

**Story 2: NIL Deal Discovery**
> As a college athlete, I want to see brand partnerships matched to my sport, location, and social audience, so that I can monetize my NIL without waiting to be discovered.

*Example:* A D2 swimmer in Chicago receives three matched campaigns from local fitness brands, a regional sports nutrition company, and a national athletic apparel brand — all pre-screened for her school's NIL policy compliance.

**Story 3: NIL Deal Submission**
> As a D1 college athlete, I want the platform to automatically submit my accepted NIL deal to the NIL Go clearinghouse, so that I stay compliant without managing the 5-business-day deadline manually.

**Story 4: Eligibility Awareness**
> As a high school athlete in Texas, I want to understand exactly what NIL activities are permitted in my state, so that I don't inadvertently jeopardize my eligibility.

*Example:* The platform displays a Texas-specific eligibility card: "Deferred-payment only. Must be a senior aged 17+. No school branding permitted. Payments received only after graduation."

**Story 5: Profile Building**
> As a high school athlete, I want to build a recruiting profile that showcases my stats, academic record, and contact information, so that college coaches can find and evaluate me.

### Parents

**Story 6: Recruiting Dashboard**
> As a sports parent, I want a unified dashboard showing my child's recruiting timeline, upcoming deadlines, and active NIL opportunities, so that I can manage their career without juggling 5 different tools.

*Example:* Parent sees a timeline view: "NCAA Contact Period opens April 15 → Official Visit window → Signing Day." Alongside, a compliance checklist shows which state NIL rules apply and what documents need to be filed.

**Story 7: Financial Transparency**
> As a sports parent, I want to see all NIL deals and their terms in one place, so that I understand my child's earnings and tax obligations before they become problems.

### Brands

**Story 8: Athlete Discovery**
> As a local business owner, I want to find college athletes in my city who align with my brand values and have relevant social audiences, so that I can create authentic NIL partnerships without a marketing agency.

*Example:* A Charlotte-based car dealership searches for athletes within 25 miles who play revenue sports, have 1,000+ Instagram followers, and whose school NIL policy allows automotive sponsorships — and receives 12 matched profiles with estimated engagement rates.

### Technical

**Story 9: Compliance Automation**
> As the platform, I need to enforce state-by-state NIL eligibility rules at the point of deal creation, so that no athlete inadvertently signs a non-compliant deal through our platform.

---

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│              (App Router, React Server Components)       │
├──────────────┬──────────────┬──────────────┬────────────┤
│  Athlete     │   Parent     │   Brand      │   Admin    │
│  Dashboard   │   Dashboard  │   Portal     │   Panel    │
└──────────────┴──────────────┴──────────────┴────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   API Layer       │
                    │  (Next.js API     │
                    │   Routes +        │
                    │   Railway BFF)    │
                    └─────────┬─────────┘
          ┌──────────┬────────┴────────┬──────────┐
          │          │                 │          │
     ┌────┴───┐ ┌────┴───┐       ┌────┴───┐ ┌────┴────┐
     │Supabase│ │ Claude │       │ Stripe │ │NIL Go  │
     │  DB +  │ │  API   │       │  API   │ │ API    │
     │  Auth  │ │(claude-│       │        │ │        │
     │        │ │sonnet- │       │        │ │        │
     └────────┘ │ 4-6)   │       └────────┘ └────────┘
                └────────┘
```

### Directory Structure

```
athlete-os/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (login, signup, onboarding)
│   ├── (athlete)/                # Athlete-facing routes
│   │   ├── dashboard/
│   │   ├── contracts/            # Contract Guard module
│   │   ├── deals/                # NIL Matchmaker module
│   │   └── profile/
│   ├── (parent)/                 # Parent dashboard routes
│   ├── (brand)/                  # Brand portal routes
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI agent endpoints
│   │   │   ├── contract-review/
│   │   │   └── nil-match/
│   │   ├── deals/
│   │   ├── clearinghouse/        # NIL Go integration
│   │   └── webhooks/             # Stripe webhooks
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── athlete/                  # Athlete-specific components
│   ├── parent/                   # Parent dashboard components
│   ├── brand/                    # Brand portal components
│   └── shared/                   # Cross-cutting components
├── lib/
│   ├── ai/                       # Claude agent orchestration
│   │   ├── contract-agent.ts
│   │   └── matching-agent.ts
│   ├── compliance/               # State NIL rule engine
│   ├── supabase/                 # DB client + queries
│   └── stripe/                   # Billing utilities
├── types/                        # TypeScript interfaces
└── middleware.ts                 # Auth + route protection
```

### Key Design Patterns

- **Server Components by default** — minimize client JS bundle; use Client Components only for interactive UI
- **AI Agent pattern** — each module (Contract Guard, NIL Matchmaker) is a discrete agent with defined tools, system prompts, and structured output schemas
- **Compliance middleware** — state NIL rule engine runs as middleware on all deal-creation paths, not as an afterthought
- **Row-level security** — Supabase RLS policies enforce that athletes only see their own data, parents only see linked athlete data, brands only see their own campaigns
- **Optimistic UI** — contract uploads and match requests show immediate feedback while AI processing happens server-side

---

## 7. Tools / Features

### Module 1: Contract Guard

**Purpose:** Eliminate predatory NIL contracts through AI-powered review accessible at zero marginal cost to athletes.

**Workflow:**
1. Athlete uploads PDF/DOCX or pastes contract text
2. Claude parses contract and extracts key clauses
3. AI evaluates each clause against a risk taxonomy
4. Returns structured report with flagged clauses, risk ratings, and plain-English explanations
5. Recommends action: "Accept," "Negotiate," or "Reject / Seek Attorney"

**Risk Taxonomy (MVP):**
| Risk Category | Example Clause | Severity |
|---|---|---|
| Perpetuity | "in perpetuity throughout the universe" | 🔴 Critical |
| Excessive commission | >10% of earnings | 🔴 Critical |
| Lifetime marketing agreement | multi-year/career-length exclusivity | 🔴 Critical |
| Missing buyout clause | no exit terms defined | 🟡 High |
| Broad exclusivity | prevents all competing brand deals | 🟡 High |
| Liquidated damages | >$50,000 penalty for transfer | 🟡 High |
| Missing payment terms | no payment schedule defined | 🟠 Medium |
| IP rights overcapture | athlete loses content rights | 🟠 Medium |

**Key Features:**
- Structured JSON output from Claude with clause locations, risk ratings, explanations
- "Attorney review recommended" flag for contracts above a risk threshold
- Disclaimer: "Informational only — not legal advice"
- Contract history stored per athlete
- Shareable report link (for sharing with parent/advisor)

### Module 2: NIL Matchmaker

**Purpose:** Connect the 97% of undermonetized athletes with brands actively seeking NIL partnerships, prioritizing local businesses as the largest untapped demand source.

**Athlete-side workflow:**
1. Athlete completes NIL profile: sport, position, school, state, social handles + follower counts (manual entry MVP)
2. Platform calculates estimated NIL valuation (based on sport, division, follower count, engagement)
3. Athlete browses matched brand campaigns or receives proactive match notifications
4. Athlete applies to campaign → brand reviews → deal terms shared via platform

**Brand-side workflow:**
1. Brand creates account and campaign: product category, budget, geography, sport preferences, audience requirements
2. Platform surfaces matching athlete profiles ranked by fit score
3. Brand reaches out or approves athlete applications
4. Both parties agree to deal terms within platform
5. Platform generates deal summary for NIL Go clearinghouse submission (D1 athletes)

**Matching Algorithm (MVP — rule-based + Claude scoring):**
- Hard filters: geography (school within X miles of brand), sport/category compatibility, state NIL eligibility, school NIL policy compliance
- Soft scoring: audience size, engagement rate, brand-athlete value alignment (via Claude)
- Output: ranked list with match score and reason

**Key Features:**
- Campaign dashboard for brands (active campaigns, applicants, deal status)
- Match feed for athletes with notification preferences
- Deal status tracking (Offered → Under Review → Accepted → Submitted to Clearinghouse)
- Automated NIL Go submission for D1 deals >$600

### Module 3: Parent Dashboard

**Purpose:** Create the platform's primary acquisition wedge by serving the $40B+ decision-maker with zero direct competition.

**Key Features:**
- Linked athlete profiles (parent can monitor multiple children)
- Recruiting timeline view with NCAA calendar milestones
- State NIL eligibility summary for the athlete's state
- Active deals and contract review history
- Academic eligibility tracker (GPA/credit thresholds — manual entry MVP)
- NIL earnings summary (for tax awareness)
- Notification preferences (email alerts for new matches, contract submissions, deadline reminders)

---

## 8. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.x | Full-stack React framework (App Router) |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui | latest | Component library |
| Framer Motion | 11.x | Animations |
| Zustand | 5.x | Client state management |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |

### Backend / Infrastructure
| Technology | Version | Purpose |
|---|---|---|
| Supabase | hosted | Postgres DB, Auth, Storage, Realtime |
| Railway | hosted | Backend services, background jobs |
| Vercel | hosted | Frontend deployment, Edge Functions |
| Stripe | latest | Subscription billing, webhooks |

### AI / Intelligence
| Technology | Version | Purpose |
|---|---|---|
| Anthropic Claude | claude-sonnet-4-6 | Contract analysis, NIL matching intelligence |
| Anthropic SDK | latest | API client with streaming support |
| Vercel AI SDK | 4.x | AI streaming UI primitives |

### Key Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "@anthropic-ai/sdk": "^0.x",
    "ai": "^4.x",
    "stripe": "^17.x",
    "@stripe/stripe-js": "^4.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zustand": "^5.x",
    "framer-motion": "^11.x",
    "date-fns": "^3.x",
    "pdf-parse": "^1.x",
    "mammoth": "^1.x"
  }
}
```

### Optional Dependencies (Phase 2+)
- `@vercel/analytics` — Vercel Analytics (installed via `/vercel-analytics` command)
- `uploadthing` — file upload service for contract documents and highlight reels
- `resend` — transactional email
- `posthog-js` — product analytics / feature flags

---

## 9. Security & Configuration

### Authentication / Authorization
- **Provider:** Supabase Auth (email/password + Google OAuth)
- **Role-based access:** `athlete`, `parent`, `brand`, `coach`, `admin`
- **Parent-athlete linking:** verified via email invite flow; parent can only view linked athlete(s)
- **Row-level security:** Supabase RLS policies on all tables — no athlete data accessible cross-account
- **JWT expiry:** 1 hour access tokens, 30-day refresh tokens

### Configuration (Environment Variables)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# NIL Go Clearinghouse
NIL_GO_API_KEY=
NIL_GO_API_URL=

# App
NEXT_PUBLIC_APP_URL=
```

### Security Scope

**In Scope (MVP):**
- ✅ Input sanitization on all user-submitted text
- ✅ File type and size validation for contract uploads (PDF/DOCX, max 10MB)
- ✅ Rate limiting on AI endpoints (contract review: 5/day free, 50/day Pro)
- ✅ Stripe webhook signature verification
- ✅ HTTPS-only (Vercel enforced)
- ✅ FERPA: written data processing agreements required for any school-linked data
- ✅ COPPA: age verification at signup; parental consent flow for under-13 users
- ✅ Contract Guard disclaimer: "This analysis is informational only and does not constitute legal advice."

**Out of Scope (MVP):**
- ❌ SOC 2 compliance (Phase 3, required for institutional B2B contracts)
- ❌ HIPAA (not applicable)
- ❌ Penetration testing (schedule for pre-Series A)

### AI Safety Guardrails
- Contract Guard output always includes attorney referral for Critical-risk contracts
- NIL matching enforces state eligibility rules as hard filters (not AI suggestions)
- No AI-generated legal advice — all contract analysis framed as "risk identification"

---

## 10. API Specification

### Contract Review

**POST** `/api/ai/contract-review`

```typescript
// Request
{
  contract_text?: string;      // pasted text
  file_url?: string;           // Supabase storage URL for uploaded file
  athlete_id: string;
  state: string;               // athlete's state (for compliance context)
}

// Response
{
  review_id: string;
  overall_risk: "low" | "medium" | "high" | "critical";
  attorney_recommended: boolean;
  clauses: {
    id: string;
    text: string;              // extracted clause text
    category: string;          // e.g. "perpetuity", "commission"
    severity: "low" | "medium" | "high" | "critical";
    explanation: string;       // plain-English explanation
    recommendation: string;    // "Accept" | "Negotiate" | "Reject"
    suggested_revision?: string;
  }[];
  summary: string;             // 2-3 sentence overall summary
  disclaimer: string;
  created_at: string;
}
```

### NIL Match

**POST** `/api/deals/match`

```typescript
// Request
{
  athlete_id: string;
}

// Response
{
  matches: {
    campaign_id: string;
    brand_name: string;
    campaign_title: string;
    budget_range: string;
    product_category: string;
    match_score: number;       // 0-100
    match_reasons: string[];
    compliance_status: "compliant" | "review_required" | "ineligible";
    compliance_notes?: string;
  }[];
}
```

### NIL Go Submission

**POST** `/api/clearinghouse/submit`

```typescript
// Request
{
  deal_id: string;
  athlete_id: string;
  brand_id: string;
  compensation_amount: number;
  deal_terms: string;
  effective_date: string;
}

// Response
{
  submission_id: string;
  nil_go_reference: string;
  status: "submitted" | "pending_review" | "approved" | "denied";
  deadline: string;            // 5 business days from submission
}
```

---

## 11. Success Criteria

### MVP Success Definition
A successful MVP demonstrates product-market fit with early adopters, achieves initial revenue, and establishes the data foundation for AI improvement.

### Functional Requirements
- ✅ Athlete can sign up, complete profile, and receive NIL matches within 10 minutes
- ✅ Contract Guard analyzes a 10-page PDF contract and returns structured results in <30 seconds
- ✅ Parent can link to athlete account and view recruiting dashboard
- ✅ Brand can create a campaign and browse matched athletes
- ✅ State NIL rule engine correctly identifies eligibility for all 42 permitting jurisdictions
- ✅ Stripe billing handles free, Starter ($9.99), and Pro ($29.99) tiers correctly
- ✅ D1 athlete deal submission triggers NIL Go clearinghouse workflow
- ✅ All pages load in <2 seconds on a 4G connection (Core Web Vitals: LCP <2.5s)

### Quality Indicators
- Contract Guard clause detection accuracy: >90% on a test set of 50 real NIL contracts
- NIL match relevance: >70% of athletes rate top 3 matches as "somewhat" or "very" relevant
- Zero unauthorized data access across role boundaries (verified by security audit)
- Stripe webhook failure rate: <0.1%

### User Experience Goals
- First contract review completed without reading documentation
- Parent dashboard understood without onboarding tutorial by 80%+ of test users
- Mobile web experience rated >4/5 by beta users (web-first, but must be mobile-responsive)

---

## 12. Implementation Phases

### Phase 1: Foundation & Contract Guard (Weeks 1–6)
**Goal:** Core infrastructure + the highest-urgency, most defensible MVP module

**Deliverables:**
- ✅ Next.js project scaffolded with Supabase, Stripe, Tailwind, shadcn/ui
- ✅ Authentication (email + Google OAuth) with role-based routing
- ✅ Athlete onboarding flow (sport, school, state, position, social handles)
- ✅ Contract Guard: PDF/DOCX upload, Claude contract analysis, structured report UI
- ✅ Contract history page (athlete's past reviews)
- ✅ Free tier (1 review/month) + Pro tier ($29.99/mo, unlimited)
- ✅ Stripe billing integration with webhook handling
- ✅ Basic athlete profile page (public URL)
- ✅ Deploy to Vercel + Vercel Analytics

**Validation:** 20 beta athletes complete at least one contract review; NPS >40

### Phase 2: NIL Matchmaker + Parent Dashboard (Weeks 7–12)
**Goal:** Complete the three-sided marketplace and activate the parent acquisition wedge

**Deliverables:**
- ✅ Brand onboarding and campaign creation flow
- ✅ NIL Matchmaker: matching algorithm + match feed for athletes
- ✅ Campaign management dashboard for brands
- ✅ Deal workflow: apply → review → accept → NIL Go submission
- ✅ State NIL compliance engine (42 states + D.C.)
- ✅ NIL Go clearinghouse API integration
- ✅ Parent dashboard: linked athlete view, recruiting timeline, deal monitor
- ✅ Email notifications (Resend) for matches, deal status, deadlines
- ✅ Starter tier ($9.99/mo) with NIL matchmaking features

**Validation:** 5 completed NIL deals brokered through platform; 100 parent dashboard signups

### Phase 3: Recruiter's Shadow + Combine Optimizer (Weeks 13–20)
**Goal:** Expand athlete value proposition to transfer portal and performance optimization

**Deliverables:**
- ✅ Transfer portal: athlete portal entry flow, roster vacancy monitoring
- ✅ Recruiter's Shadow: AI-powered matching between portal athletes and open roster spots
- ✅ Combine Optimizer: performance benchmarking tool with sport-specific metrics
- ✅ Coach/institutional dashboard (B2B SaaS — D3 schools as initial target)
- ✅ Real-time roster vacancy alerts (email + in-app)
- ✅ Elite tier ($99/mo) launch

**Validation:** 3 D3 institutional contracts signed ($5,000–$15,000/year); 50 portal athlete placements

### Phase 4: Highlight Architect + Data Network Effects (Weeks 21–30)
**Goal:** Complete the five-module platform and activate the viral content flywheel

**Deliverables:**
- ✅ Highlight Architect: AI-powered highlight reel creation from uploaded raw footage
- ✅ TikTok/Instagram share integration with platform watermark
- ✅ Social audience data integration (OAuth-based pull of follower/engagement data)
- ✅ Longitudinal athlete profile (career arc from HS through college)
- ✅ D1 institutional B2B sales motion launch
- ✅ Data licensing product scoping (for Phase 5)

**Validation:** 500 total athletes on platform; 10 viral highlights generating >100K views; 1 D1 institutional contract

---

## 13. Future Considerations

### Post-MVP Enhancements
- **Mobile native apps** (iOS + Android) — athlete and parent personas are heavily mobile; React Native with Expo sharing logic from web
- **Wearable integrations** — Apple Watch, Garmin, Whoop data ingestion for Combine Optimizer
- **Academic eligibility automation** — direct integration with school SIS for real-time GPA/credit monitoring
- **Financial planning module** — NIL income projection, tax withholding estimates, budgeting for athletes newly earning 5-figure+ incomes
- **AI recruiting film analysis** — beyond highlight creation, position-specific film breakdown for coaches

### Integration Opportunities
- **Hudl** — import existing athlete highlight footage; partnership for small-school athletes without game film
- **NCAA Eligibility Center** — eligibility status API (requires formal partnership)
- **Teamworks** — white-label institutional module for schools already on Teamworks
- **IMG Academy / NCSA** — data partnership for recruiting history

### Advanced Features
- **Collective intelligence** — aggregate anonymized deal data to show athletes "what athletes like you are earning" benchmarks
- **Agent marketplace** — verified NIL agent directory with capped commission disclosure (addressing the 67% of athletes who unknowingly gave agents a percentage of earnings)
- **EA Sports / video game licensing** — athlete opt-in for likeness licensing to gaming companies
- **Professional transition module** — career resources for the 98% of athletes who don't go pro

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Unauthorized practice of law (Contract Guard)** | Medium | High | Prominent "informational only" disclaimers; no legal advice framing; attorney referral for critical-risk contracts; monitor Utah/Colorado AI legal tool regulatory sandboxes |
| **NIL Go clearinghouse API access denied** | Medium | High | Build manual submission workflow as fallback; engage NIL Go directly for early access; prioritize non-D1 market initially (no clearinghouse required) |
| **Agent/UAAA licensing requirements triggered** | Low | High | Structure platform as passive marketplace (athletes and brands negotiate directly); no commission on deals; legal opinion letter confirming passive marketplace structure pre-launch |
| **Cold start: no brands, no athletes** | High | High | Launch Contract Guard first (single-player value, no network needed); recruit 100 HS athletes in target markets via parent Facebook groups; offer free brand campaigns for first 90 days |
| **Hudl acquires a competitor or builds parent features** | Medium | Medium | Accelerate parent dashboard differentiation; build parent network effects (parent-to-parent referrals via team invite flows); Hudl's B2B DNA makes consumer pivot structurally difficult |

---

## 15. Appendix

### Related Documents
- `sports_agent_breakdown.md` — Market analysis and VC-level case document (source for this PRD)

### Key Market References
- House v. NCAA settlement (June 2025): $2.8B back-pay + $20.5M annual revenue sharing
- NIL Go clearinghouse (Deloitte): mandatory D1 NIL deal submission >$600, 5-business-day window
- College Sports Commission: new independent regulatory body, active enforcement from January 2026
- SCORE Act: stalled in House December 2025, unlikely before late 2026
- COPPA updated rules: effective April 2026, verifiable parental consent for under-13

### Pricing Reference Points
| Competitor | Price | What It Does |
|---|---|---|
| NCSA (IMG Academy) | $1,320–$4,200/family | Recruiting profile + coach contacts |
| Hudl (HS team) | $900–$3,300/team/year | Video analysis for coaches |
| Opendorse (Nebraska) | $235,000/year | NIL deal execution (institutional) |
| Teamworks (D1) | $20,000–$100,000+/year | Athletic dept operations |
| Sports attorney | $250–$500/hr | Contract review (~$500–$1,500/contract) |
| Private highlight editor | $150–$2,000/reel | Recruiting highlight production |
| Exos combine prep | $15,000–$30,000/8 weeks | Elite combine preparation |

### Target Launch Markets (Priority Order)
1. California (852,575 HS athletes, first NIL state, UC system density)
2. Florida (308,396 HS athletes, HS NIL approved, SEC/ACC concentration)
3. New York + New Jersey (609,000 combined, both allow HS NIL)
4. Illinois (328,362 athletes, HS NIL, strong AAU/travel culture)
5. North Carolina (ACC density, active NIL ecosystem)
