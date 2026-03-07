# Feature: NIL Matchmaker

The following plan should be complete, but validate documentation and codebase patterns before implementing. Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

NIL Matchmaker connects the 97% of undermonetized athletes with brands actively seeking NIL partnerships. Athletes browse a curated feed of brand campaigns, filtered by their sport/state/division and scored by Claude AI for fit. Athletes apply (express interest) in one click. For MVP, brand campaigns are seeded directly into the database — no brand portal UI needed yet. The focus is the athlete-facing match feed.

## User Story

As a college or high school athlete
I want to browse brand campaigns matched to my sport, state, and profile
So that I can find and apply to NIL deals without waiting to be discovered

## Problem Statement

97% of NIL-eligible athletes have never completed a deal. The market is fragmented — brands can't find athletes, athletes don't know where to look. The platform needs a curated match feed so athletes see only relevant, compliant campaigns.

## Solution Statement

Build a seeded `brandCampaigns` table, a `dealApplications` table, a Claude-powered matching agent (`matching-agent.ts`), and an athlete-facing `/deals` page. Claude scores each campaign against the athlete's profile with hard eligibility filters applied first (nil_eligible, state geography, sport). The athlete applies with one click; status is tracked in `dealApplications`.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: DB schema, AI layer, API routes, dashboard UI, nav
**Dependencies**: `@anthropic-ai/sdk` (already installed), Drizzle ORM (existing), existing `athleteProfiles` and `profiles` tables

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ THESE BEFORE IMPLEMENTING

- `src/lib/db/schema.ts` (lines 1-87) — All table definitions; mirror uuid PK, timestamp, FK cascade patterns exactly
- `src/types/index.ts` — `InferSelectModel` pattern for deriving TS types from schema
- `src/lib/ai/contract-agent.ts` — THE reference for all AI agent patterns: `zodOutputFormat`, `parsed_output`, `client.messages.create`, zod schema design
- `src/lib/__tests__/contract-agent.test.ts` — The exact `vi.mock("@anthropic-ai/sdk", ...)` pattern to use for tests
- `src/lib/rate-limit.ts` — `createRateLimiter(n, windowMs)` and existing named limiters; add `matchRateLimiter` here
- `src/lib/validations.ts` — Zod v4 schema patterns; the `DIVISIONS` const; note Zod v4 differences from v3
- `src/lib/sports-data.ts` — `SPORTS`, `US_STATES`, `HS_NIL_STATES`, `computeNilEligible()` — reuse all of these for filtering
- `src/app/api/onboarding/route.ts` — Complete API route pattern: `force-dynamic`, rate limiter, auth.getSession(), profile lookup, zod safeParse, db insert
- `src/app/api/contracts/route.ts` — Pattern for GET (list) + POST (create) in same route file
- `src/app/(dashboard)/contracts/page.tsx` — SSR page pattern: auth.getSession(), redirect, db query, pass to client components
- `src/app/(dashboard)/contracts/[id]/page.tsx` — Dynamic route SSR page pattern; `params: Promise<{ id: string }>` (Next.js 16)
- `src/app/(dashboard)/layout.tsx` — Nav pattern; add "NIL Deals" link here
- `src/components/contracts/contract-review-list.tsx` — List component pattern (typed props, Link cards)
- `src/components/contracts/contract-upload-form.tsx` — Client component pattern: `"use client"`, useState, fetch, router.push

### New Files to Create

- `src/lib/db/seed.ts` — One-time seed script for brand campaigns
- `src/lib/ai/matching-agent.ts` — Claude scoring agent for athlete-campaign fit
- `src/app/api/deals/route.ts` — GET (paginated campaign list with scores for authenticated athlete)
- `src/app/api/deals/[id]/apply/route.ts` — POST (athlete applies to campaign)
- `src/app/(dashboard)/deals/page.tsx` — Athlete-facing match feed page (SSR)
- `src/components/deals/campaign-card.tsx` — Client component: single campaign card with Apply button
- `src/components/deals/match-feed.tsx` — Client component: grid/list of campaign cards
- `src/lib/__tests__/matching-agent.test.ts` — Unit tests for matching agent

### Relevant Documentation — READ BEFORE IMPLEMENTING

- Zod v4 migration notes (project uses `"zod": "^4.3.6"`):
  - `z.object().describe()` still works at schema level
  - Field descriptions: use `.describe()` on individual field schemas
  - `safeParse` error shape: `result.error` (ZodError), NOT `result.error.flatten()` — check how contract route uses it
  - No `.nullable()` needed for optional fields with `.optional().default()`
- Anthropic SDK `zodOutputFormat`:
  - Import: `import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"`
  - Usage: `output_config: { format: zodOutputFormat(MySchema) }`
  - Access result: `(response as { parsed_output?: T }).parsed_output`
  - This is exactly how `contract-agent.ts` does it — mirror that file

### Patterns to Follow

**API Route Pattern** (from `src/app/api/contracts/route.ts`):
```typescript
export const dynamic = "force-dynamic";
// imports...
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = someRateLimiter.check(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, session.user.id) });
  if (!profile) return NextResponse.json({ /* empty result */ });
  // ...
}
```

**DB Schema Pattern** (from `src/lib/db/schema.ts`):
```typescript
export const myTable = pgTable("my_table", {
  id: uuid("id").defaultRandom().primaryKey(),
  // FK:
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  // timestamps:
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("idx_my_table_profile_id").on(t.profileId)]);
```

**AI Agent Pattern** (from `src/lib/ai/contract-agent.ts`):
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
const client = new Anthropic();
const MySchema = z.object({ ... });
export type MyOutput = z.infer<typeof MySchema>;
// In function:
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: SYSTEM_PROMPT,
  output_config: { format: zodOutputFormat(MySchema) },
  messages: [{ role: "user", content: [{ type: "text", text: "..." }] }],
});
const parsed = (response as { parsed_output?: MyOutput }).parsed_output;
if (!parsed) throw new Error("Claude returned no structured output");
return parsed;
```

**Type Pattern** (from `src/types/index.ts`):
```typescript
import type { InferSelectModel } from "drizzle-orm";
import type { brandCampaigns, dealApplications } from "@/lib/db/schema";
export type BrandCampaign = InferSelectModel<typeof brandCampaigns>;
export type DealApplication = InferSelectModel<typeof dealApplications>;
```

**SSR Page Pattern** (from `src/app/(dashboard)/contracts/page.tsx`):
```typescript
export const dynamic = "force-dynamic";
export default async function MyPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");
  // db query...
  return <ClientComponent data={data} />;
}
```

**Dynamic Route Pattern** — Next.js 16 params are a Promise:
```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

**Test Pattern** (from `src/lib/__tests__/contract-agent.test.ts`):
```typescript
import { describe, expect, it, vi } from "vitest";
vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn().mockResolvedValue({ parsed_output: { ... } });
  return { default: class { messages = { create: mockCreate }; } };
});
import { myFunction } from "../ai/matching-agent";
```

**Naming Conventions:**
- Files: `kebab-case.ts`
- Tables: `snake_case` (SQL), camelCase fields in Drizzle definition
- Exports: named exports for components, named exports for functions
- Types: PascalCase, from `InferSelectModel`

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation — Schema + Types + Rate Limiter

Extend the DB schema with two new tables, derive types, and add a rate limiter.

**Tasks:**
- Add `brandCampaigns` and `dealApplications` tables to schema
- Export `BrandCampaign` and `DealApplication` types
- Add `matchRateLimiter` to rate-limit.ts
- Run `npx drizzle-kit push` to apply schema

### Phase 2: Seed Data

Insert realistic brand campaigns so the athlete feed has content.

**Tasks:**
- Create `src/lib/db/seed.ts` with 10 realistic campaigns across sports/states/categories
- Run seed script once against the database

### Phase 3: AI Matching Agent

Implement `matching-agent.ts` following the exact contract-agent pattern.

**Tasks:**
- Hard filter: skip campaigns where athlete is not nil_eligible, or campaign geography doesn't include athlete's state, or campaign sports don't include athlete's sport
- Claude scoring: for campaigns that pass hard filters, score 0-100 match with reasons
- Return `{ score, reasons, complianceStatus }`

### Phase 4: API Routes

Wire up the API with full auth, rate limiting, and ownership checks.

**Tasks:**
- `GET /api/deals` — fetch active campaigns, apply hard filters, run Claude scoring, return sorted list
- `POST /api/deals/[id]/apply` — create dealApplication record

### Phase 5: UI

Build the athlete-facing match feed and integrate into nav.

**Tasks:**
- `CampaignCard` client component
- `MatchFeed` client component
- `/deals` SSR page
- Add "NIL Deals" nav link to dashboard layout

### Phase 6: Tests + Validation

Unit tests for matching agent, run full suite.

---

## STEP-BY-STEP TASKS

### UPDATE `src/lib/db/schema.ts`

- **ADD** `brandCampaigns` table after `contractReviews`:
  ```typescript
  export const brandCampaigns = pgTable(
    "brand_campaigns",
    {
      id: uuid("id").defaultRandom().primaryKey(),
      brandName: text("brand_name").notNull(),
      campaignTitle: text("campaign_title").notNull(),
      description: text("description").notNull().default(""),
      productCategory: text("product_category").notNull(), // e.g. "fitness", "nutrition", "apparel"
      budgetRange: text("budget_range").notNull().default(""), // e.g. "$500-$1,000"
      // Comma-separated state codes, or "ALL" for national
      geographyStates: text("geography_states").notNull().default("ALL"),
      // Comma-separated sports, or "ALL"
      sportPreferences: text("sport_preferences").notNull().default("ALL"),
      // Comma-separated divisions, or "ALL"
      divisionPreferences: text("division_preferences").notNull().default("ALL"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [index("idx_brand_campaigns_is_active").on(t.isActive)],
  );
  ```

- **ADD** `dealApplications` table:
  ```typescript
  export const dealApplications = pgTable(
    "deal_applications",
    {
      id: uuid("id").defaultRandom().primaryKey(),
      campaignId: uuid("campaign_id")
        .notNull()
        .references(() => brandCampaigns.id, { onDelete: "cascade" }),
      profileId: uuid("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
      status: text("status").notNull().default("pending"), // pending | accepted | rejected
      matchScore: integer("match_score").notNull().default(0),
      matchReasons: text("match_reasons").notNull().default("[]"), // JSON array of strings
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
      index("idx_deal_applications_profile_id").on(t.profileId),
      index("idx_deal_applications_campaign_id").on(t.campaignId),
      uniqueIndex("idx_deal_applications_unique").on(t.campaignId, t.profileId),
    ],
  );
  ```

- **ADD** relations at the bottom of schema.ts:
  ```typescript
  export const brandCampaignsRelations = relations(brandCampaigns, ({ many }) => ({
    applications: many(dealApplications),
  }));

  export const dealApplicationsRelations = relations(dealApplications, ({ one }) => ({
    campaign: one(brandCampaigns, { fields: [dealApplications.campaignId], references: [brandCampaigns.id] }),
    profile: one(profiles, { fields: [dealApplications.profileId], references: [profiles.id] }),
  }));
  ```

- **GOTCHA**: `uniqueIndex` is already imported in schema.ts — check existing imports before adding
- **VALIDATE**: `npx tsc --noEmit` (no type errors)

### UPDATE `src/lib/db/schema.ts` — imports

- **VERIFY** that `boolean`, `uniqueIndex`, `index`, `integer`, `relations` are all already imported at line 1-11. Add any missing ones.
- **VALIDATE**: `npx tsc --noEmit`

### RUN migration

- **EXECUTE**: `npx drizzle-kit push`
- **VALIDATE**: Command exits 0; tables appear in Neon console or via `npx drizzle-kit studio`

### UPDATE `src/types/index.ts`

- **ADD** two new type exports:
  ```typescript
  import type { brandCampaigns, dealApplications } from "@/lib/db/schema";
  export type BrandCampaign = InferSelectModel<typeof brandCampaigns>;
  export type DealApplication = InferSelectModel<typeof dealApplications>;
  ```
- **VALIDATE**: `npx tsc --noEmit`

### UPDATE `src/lib/rate-limit.ts`

- **ADD** at the bottom:
  ```typescript
  export const matchRateLimiter = createRateLimiter(20, 60_000);
  ```
- **PATTERN**: mirror `contractRateLimiter` at `src/lib/rate-limit.ts:31`
- **VALIDATE**: `npx tsc --noEmit`

### CREATE `src/lib/db/seed.ts`

- **IMPLEMENT**: A standalone script (not a Next.js route) that inserts brand campaigns. Use `db.insert(brandCampaigns).values([...])` with `onConflictDoNothing()` so it's idempotent.
- **PATTERN**: Import `db` from `@/lib/db` and `brandCampaigns` from `@/lib/db/schema`
- **SEED DATA**: 10 campaigns covering a range of sports, categories, geographies, and budgets:

```typescript
const campaigns = [
  {
    brandName: "ProFit Nutrition",
    campaignTitle: "Campus Brand Ambassador",
    description: "Promote our pre-workout and protein line to your teammates and followers. Monthly stipend + product.",
    productCategory: "nutrition",
    budgetRange: "$300-$500/month",
    geographyStates: "ALL",
    sportPreferences: "ALL",
    divisionPreferences: "ALL",
  },
  {
    brandName: "GridironGear",
    campaignTitle: "Football Content Creator",
    description: "Post 2 TikToks/month featuring our cleats and training gear. Payment per post.",
    productCategory: "apparel",
    budgetRange: "$500-$1,000",
    geographyStates: "ALL",
    sportPreferences: "Football",
    divisionPreferences: "D1,D2",
  },
  {
    brandName: "Bay Area Sports Club",
    campaignTitle: "Local Athlete Partnership",
    description: "Appear in our monthly newsletter and one social post. Perfect for Bay Area college athletes.",
    productCategory: "local_business",
    budgetRange: "$200-$400",
    geographyStates: "CA",
    sportPreferences: "ALL",
    divisionPreferences: "ALL",
  },
  {
    brandName: "SwimFast Gear",
    campaignTitle: "Swimmer Brand Rep",
    description: "Wear our cap and goggles at meets and post meet-day content. Per-post compensation.",
    productCategory: "equipment",
    budgetRange: "$400-$800",
    geographyStates: "ALL",
    sportPreferences: "Swimming",
    divisionPreferences: "ALL",
  },
  {
    brandName: "Lone Star Eats",
    campaignTitle: "Texas Athlete Foodie",
    description: "Visit our Dallas/Houston locations and post a review. Texas athletes only.",
    productCategory: "food_beverage",
    budgetRange: "$150-$300 + free meals",
    geographyStates: "TX",
    sportPreferences: "ALL",
    divisionPreferences: "ALL",
  },
  {
    brandName: "HoopDreams Apparel",
    campaignTitle: "Basketball Ambassador",
    description: "Rock our streetwear collection in your off-court content. Season-long partnership.",
    productCategory: "apparel",
    budgetRange: "$600-$1,200",
    geographyStates: "ALL",
    sportPreferences: "Men's Basketball,Women's Basketball",
    divisionPreferences: "D1,D2,D3",
  },
  {
    brandName: "Sunshine Recovery",
    campaignTitle: "Recovery Athlete Spotlight",
    description: "Feature our CBD recovery balm in your post-workout routine. Florida athletes preferred.",
    productCategory: "health_wellness",
    budgetRange: "$250-$500",
    geographyStates: "FL,GA,SC",
    sportPreferences: "ALL",
    divisionPreferences: "ALL",
  },
  {
    brandName: "IronClad Training",
    campaignTitle: "Strength & Conditioning Partner",
    description: "Promote our gym membership app to your school community. Commission per signup.",
    productCategory: "fitness",
    budgetRange: "$10-$20/referral",
    geographyStates: "ALL",
    sportPreferences: "Football,Wrestling,Men's Basketball,Women's Basketball",
    divisionPreferences: "ALL",
  },
  {
    brandName: "Turf & Track",
    campaignTitle: "Multi-Sport Gear Review",
    description: "Review our training shoes across two Instagram posts. Open to all collegiate athletes.",
    productCategory: "equipment",
    budgetRange: "$300-$600 + gear",
    geographyStates: "ALL",
    sportPreferences: "ALL",
    divisionPreferences: "D1,D2,D3,NAIA",
  },
  {
    brandName: "Chicago Sports Network",
    campaignTitle: "Windy City Athlete Feature",
    description: "Be featured in our digital magazine and one sponsored social post. Illinois athletes only.",
    productCategory: "media",
    budgetRange: "$200-$350",
    geographyStates: "IL",
    sportPreferences: "ALL",
    divisionPreferences: "ALL",
  },
];
```

- **SCRIPT STRUCTURE**:
  ```typescript
  import { db } from "@/lib/db";
  import { brandCampaigns } from "@/lib/db/schema";
  async function seed() {
    await db.insert(brandCampaigns).values(campaigns).onConflictDoNothing();
    console.log("Seeded brand campaigns");
    process.exit(0);
  }
  seed().catch((e) => { console.error(e); process.exit(1); });
  ```
- **VALIDATE**: `npx tsx src/lib/db/seed.ts` (runs successfully)
- **GOTCHA**: `onConflictDoNothing()` requires Drizzle >= 0.28 — we have 0.45 so it's fine

### CREATE `src/lib/ai/matching-agent.ts`

- **PATTERN**: Mirror `src/lib/ai/contract-agent.ts` exactly — same import style, same `zodOutputFormat` usage, same `parsed_output` cast
- **IMPLEMENT**:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { AthleteProfile, BrandCampaign } from "@/types";

const client = new Anthropic();

const MatchScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  reasons: z.array(z.string()),
  complianceStatus: z.enum(["compliant", "review_required"]),
  complianceNote: z.string().optional(),
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;

const SYSTEM_PROMPT = `You are an NIL matching expert. Given an athlete profile and a brand campaign, score the match from 0-100 and explain why. Consider: sport/product relevance, audience fit, geographic alignment, and brand-athlete value alignment. Be honest — a 60 is a decent match, 80+ is excellent.`;

/** Hard-filter: returns false if this campaign is ineligible for the athlete */
export function passesHardFilters(athlete: AthleteProfile, campaign: BrandCampaign): boolean {
  if (!athlete.nilEligible) return false;

  if (campaign.geographyStates !== "ALL") {
    const states = campaign.geographyStates.split(",").map((s) => s.trim());
    if (!states.includes(athlete.state)) return false;
  }

  if (campaign.sportPreferences !== "ALL") {
    const sports = campaign.sportPreferences.split(",").map((s) => s.trim());
    if (!sports.includes(athlete.sport)) return false;
  }

  if (campaign.divisionPreferences !== "ALL") {
    const divisions = campaign.divisionPreferences.split(",").map((s) => s.trim());
    if (!divisions.includes(athlete.division)) return false;
  }

  return true;
}

export async function scoreCampaignMatch(
  athlete: AthleteProfile,
  campaign: BrandCampaign,
): Promise<MatchScore> {
  const athleteDesc = `Sport: ${athlete.sport}, Division: ${athlete.division}, School: ${athlete.school}, State: ${athlete.state}, Eligibility: ${athlete.eligibilityStatus}. Social: Instagram=${athlete.socialInstagram || "none"}, TikTok=${athlete.socialTiktok || "none"}.`;
  const campaignDesc = `Brand: ${campaign.brandName}. Campaign: ${campaign.campaignTitle}. Category: ${campaign.productCategory}. Budget: ${campaign.budgetRange}. Description: ${campaign.description}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    output_config: { format: zodOutputFormat(MatchScoreSchema) },
    messages: [{
      role: "user",
      content: [{
        type: "text",
        text: `Athlete: ${athleteDesc}\n\nCampaign: ${campaignDesc}\n\nScore this match.`,
      }],
    }],
  });

  const parsed = (response as { parsed_output?: MatchScore }).parsed_output;
  if (!parsed) throw new Error("Claude returned no structured output");
  return parsed;
}
```

- **GOTCHA**: `MatchScoreSchema` uses `z.number().int()` — Zod v4 supports this. Do NOT use `z.number().int().nonnegative()` — `.nonnegative()` was renamed in v4, use `.min(0)` instead.
- **VALIDATE**: `npx tsc --noEmit`

### CREATE `src/app/api/deals/route.ts`

- **PATTERN**: Mirror `src/app/api/contracts/route.ts`
- **IMPLEMENT** GET handler:
  1. Rate limit check
  2. Auth check
  3. Look up `profile` then `athleteProfile` — if no athleteProfile, return `{ campaigns: [], message: "Complete onboarding to see matches" }`
  4. Fetch all active campaigns from `brandCampaigns` where `isActive = true`
  5. Filter with `passesHardFilters(athleteProfile, campaign)` for each
  6. Fetch existing applications for this profile (to mark already-applied)
  7. For each eligible campaign, call `scoreCampaignMatch` — run these **in parallel** with `Promise.all` but limit to 5 concurrent (use `Promise.all` on batches of 5 to avoid rate limits)
  8. Sort by `score` descending
  9. Return `{ campaigns: [...], athleteOnboarded: true }`

- **RESPONSE SHAPE**:
  ```typescript
  {
    campaigns: Array<BrandCampaign & { matchScore: number; matchReasons: string[]; complianceStatus: string; alreadyApplied: boolean }>;
    athleteOnboarded: boolean;
  }
  ```

- **GOTCHA**: Claude API calls are slow (~1-3s each). Running 10 campaigns in parallel is fine; do NOT await sequentially. Use `Promise.allSettled` and filter out rejected ones with a fallback score of 50.
- **GOTCHA**: Import `matchRateLimiter` (not `apiRateLimiter`) from `@/lib/rate-limit`
- **VALIDATE**: `curl -s http://localhost:3000/api/deals` (returns 401 without auth — correct)

### CREATE `src/app/api/deals/[id]/apply/route.ts`

- **PATTERN**: POST-only route, same auth pattern
- **IMPLEMENT**:
  ```typescript
  export const dynamic = "force-dynamic";
  // POST: athlete applies to campaign [id]
  // 1. Rate limit (matchRateLimiter)
  // 2. Auth + profile lookup
  // 3. Fetch athleteProfile — if null, 400 "Complete onboarding first"
  // 4. Fetch campaign by id — if not found or not active, 404
  // 5. Check passesHardFilters — if fails, 400 "Not eligible for this campaign"
  // 6. Check for existing application (unique constraint would catch it, but return 409 explicitly)
  // 7. Score the match (scoreCampaignMatch)
  // 8. Insert dealApplications row
  // 9. Return { application } 201
  ```
- **IMPORTS**: `matchRateLimiter`, `passesHardFilters`, `scoreCampaignMatch`, `dealApplications`, `brandCampaigns`, `athleteProfiles`, `profiles`
- **GOTCHA**: Dynamic route params in Next.js 16 are `Promise<{ id: string }>` — use `const { id } = await params`
- **VALIDATE**: `npx tsc --noEmit`

### CREATE `src/components/deals/campaign-card.tsx`

- **PATTERN**: `"use client"` component, similar to `ContractUploadForm` for state/loading/error handling
- **PROPS**: `campaign: BrandCampaign & { matchScore: number; matchReasons: string[]; complianceStatus: string; alreadyApplied: boolean }`
- **IMPLEMENT**: Card showing:
  - Brand name + campaign title
  - Product category badge
  - Budget range
  - Match score (color-coded: ≥80 green, ≥60 yellow, else orange)
  - Match reasons (bullet list, max 3)
  - Description (truncated to 120 chars)
  - "Apply" button → POST `/api/deals/${campaign.id}/apply` → optimistic UI (disable button, show "Applied!")
  - If `alreadyApplied`, show "Applied" badge (disabled button)
- **ERROR HANDLING**: Show inline error if apply fails
- **VALIDATE**: `npx tsc --noEmit`

### CREATE `src/components/deals/match-feed.tsx`

- **PATTERN**: `"use client"` component, wraps `CampaignCard`
- **PROPS**: Same campaign array type + `athleteOnboarded: boolean`
- **IMPLEMENT**:
  - If `!athleteOnboarded`: render a prompt card — "Complete your athlete profile to see matched campaigns" with a link to `/onboarding`
  - If 0 campaigns: "No campaigns matched your profile right now. Check back soon."
  - Otherwise: responsive grid of `CampaignCard` components
- **VALIDATE**: `npx tsc --noEmit`

### CREATE `src/app/(dashboard)/deals/page.tsx`

- **PATTERN**: Mirror `src/app/(dashboard)/contracts/page.tsx` exactly
- **IMPLEMENT**:
  ```typescript
  export const dynamic = "force-dynamic";
  export default async function DealsPage() {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect("/login");

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
    });

    const athleteProfile = profile
      ? await db.query.athleteProfiles.findFirst({
          where: eq(athleteProfiles.profileId, profile.id),
        })
      : null;

    // Fetch and score campaigns server-side
    // (reuse the same logic as the API route, or call the API route — prefer direct DB+AI call for SSR perf)
    // For simplicity: import passesHardFilters + scoreCampaignMatch directly, same logic as GET /api/deals
    // Return data to MatchFeed client component

    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold">NIL Matchmaker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Brand campaigns matched to your sport and profile.
          </p>
        </div>
        <MatchFeed campaigns={campaigns} athleteOnboarded={!!athleteProfile} />
      </div>
    );
  }
  ```
- **GOTCHA**: Don't import from `@/app/api/...` — duplicate the DB+AI query logic directly in the page, or extract to a shared service function. Prefer a shared `getMatchedCampaigns(profileId, athleteProfile)` function in `src/lib/ai/matching-agent.ts` that both the API route and page can call.
- **REFACTOR**: Add `export async function getMatchedCampaigns(...)` to `matching-agent.ts` that encapsulates the fetch + filter + score pipeline. Both the API route and the SSR page call this.
- **VALIDATE**: `npx tsc --noEmit`; navigate to `/deals` in browser

### UPDATE `src/app/(dashboard)/layout.tsx`

- **ADD** "NIL Deals" nav link in the `<nav>` alongside "Contract Guard":
  ```tsx
  <Link href="/deals" className="font-medium transition-colors hover:text-primary">
    NIL Deals
  </Link>
  ```
- **PATTERN**: mirror the existing `Contract Guard` Link at `src/app/(dashboard)/layout.tsx:25`
- **VALIDATE**: Nav renders in browser with both links

### CREATE `src/lib/__tests__/matching-agent.test.ts`

- **PATTERN**: Mirror `src/lib/__tests__/contract-agent.test.ts` exactly — same `vi.mock` structure
- **IMPLEMENT** tests:

```typescript
import { describe, expect, it, vi } from "vitest";

vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn().mockResolvedValue({
    parsed_output: {
      score: 85,
      reasons: ["Sport alignment: Football matches campaign preferences", "National campaign — no geo restriction"],
      complianceStatus: "compliant",
    },
  });
  return { default: class { messages = { create: mockCreate }; } };
});

import { passesHardFilters, scoreCampaignMatch } from "../ai/matching-agent";
import type { AthleteProfile, BrandCampaign } from "@/types";

const mockAthlete: AthleteProfile = {
  id: "athlete-1",
  profileId: "profile-1",
  sport: "Football",
  position: "QB",
  school: "State University",
  division: "D1",
  state: "CA",
  gradYear: 2026,
  eligibilityStatus: "Junior",
  nilEligible: true,
  socialInstagram: "@athlete",
  socialTiktok: "",
  socialTwitter: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCampaign: BrandCampaign = {
  id: "campaign-1",
  brandName: "TestBrand",
  campaignTitle: "Test Campaign",
  description: "Test description",
  productCategory: "apparel",
  budgetRange: "$500-$1,000",
  geographyStates: "ALL",
  sportPreferences: "Football",
  divisionPreferences: "D1,D2",
  isActive: true,
  createdAt: new Date(),
};

describe("passesHardFilters", () => {
  it("returns true when athlete is eligible and campaign matches", () => {
    expect(passesHardFilters(mockAthlete, mockCampaign)).toBe(true);
  });

  it("returns false when athlete is not nil_eligible", () => {
    expect(passesHardFilters({ ...mockAthlete, nilEligible: false }, mockCampaign)).toBe(false);
  });

  it("returns false when athlete state not in campaign geography", () => {
    const campaign = { ...mockCampaign, geographyStates: "TX,FL" };
    expect(passesHardFilters(mockAthlete, campaign)).toBe(false); // athlete is CA
  });

  it("returns false when athlete sport not in campaign sport preferences", () => {
    const campaign = { ...mockCampaign, sportPreferences: "Swimming,Volleyball" };
    expect(passesHardFilters(mockAthlete, campaign)).toBe(false);
  });

  it("returns false when athlete division not in campaign division preferences", () => {
    const campaign = { ...mockCampaign, divisionPreferences: "D3,NAIA" };
    expect(passesHardFilters(mockAthlete, campaign)).toBe(false);
  });

  it("returns true for ALL geography/sport/division", () => {
    const campaign = { ...mockCampaign, geographyStates: "ALL", sportPreferences: "ALL", divisionPreferences: "ALL" };
    expect(passesHardFilters(mockAthlete, campaign)).toBe(true);
  });
});

describe("scoreCampaignMatch", () => {
  it("returns score, reasons, and complianceStatus from Claude", async () => {
    const result = await scoreCampaignMatch(mockAthlete, mockCampaign);
    expect(result.score).toBe(85);
    expect(result.reasons).toHaveLength(2);
    expect(result.complianceStatus).toBe("compliant");
  });
});
```

- **VALIDATE**: `npx vitest run src/lib/__tests__/matching-agent.test.ts`

---

## TESTING STRATEGY

### Unit Tests

`src/lib/__tests__/matching-agent.test.ts` — covers:
- `passesHardFilters`: all filter combinations (nil_eligible, geography, sport, division)
- `scoreCampaignMatch`: returns structured output from mocked Claude

### Integration Tests (Manual)

1. Navigate to `/deals` as an authenticated athlete with completed onboarding → see campaign cards
2. Navigate to `/deals` as an authenticated athlete without onboarding → see prompt to complete profile
3. Click "Apply" on a campaign → button becomes "Applied", page does not reload
4. Click "Apply" again on same campaign → see "Already applied" or disabled state
5. Visit `/api/deals` in browser (authenticated) → see JSON with campaigns array

### Edge Cases

- Athlete not onboarded → `getMatchedCampaigns` returns `{ campaigns: [], athleteOnboarded: false }`
- No campaigns pass hard filters → return empty array (not an error)
- Claude API failure on one campaign → `Promise.allSettled` catches it, campaign gets `score: 50` fallback and `reasons: ["Match score unavailable"]`
- Athlete applies to campaign that doesn't pass hard filters (direct API call) → 400 response
- Duplicate application (unique index) → 409 response
- `dealApplications` unique index fires at DB level → catch error and return 409

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
npx biome check src/lib/db/schema.ts src/lib/rate-limit.ts src/types/index.ts src/lib/ai/matching-agent.ts src/app/api/deals/route.ts src/components/deals/campaign-card.tsx src/components/deals/match-feed.tsx src/app/(dashboard)/deals/page.tsx src/app/(dashboard)/layout.tsx
```

### Level 2: Type Check
```bash
npx tsc --noEmit
```

### Level 3: Unit Tests
```bash
npx vitest run src/lib/__tests__/matching-agent.test.ts
npx vitest run  # full suite — zero regressions
```

### Level 4: DB Migration
```bash
npx drizzle-kit push
npx tsx src/lib/db/seed.ts
```

### Level 5: Manual Validation
```bash
npm run dev
# Then:
# 1. Login → visit /deals → confirm campaign cards render
# 2. Check nav shows "NIL Deals" link
# 3. Click Apply on a campaign → confirm 201 response and UI update
# 4. Login as user without onboarding → /deals shows prompt card
```

---

## ACCEPTANCE CRITERIA

- [ ] `brandCampaigns` and `dealApplications` tables exist in Neon DB after `drizzle-kit push`
- [ ] 10 seeded campaigns visible in DB after `tsx src/lib/db/seed.ts`
- [ ] `passesHardFilters` correctly filters by nilEligible, state, sport, and division
- [ ] `GET /api/deals` returns 401 without auth, and scored campaign list with auth
- [ ] `POST /api/deals/[id]/apply` creates an application row and returns 201
- [ ] Duplicate application returns 409
- [ ] Ineligible campaign application returns 400
- [ ] `/deals` page renders with campaign cards for onboarded athletes
- [ ] `/deals` page shows onboarding prompt for athletes without `athleteProfile`
- [ ] "NIL Deals" appears in dashboard nav
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx biome check .` passes with zero errors
- [ ] `npx vitest run` passes — all existing + new tests green
- [ ] Apply button transitions to "Applied" state without full page reload

---

## COMPLETION CHECKLIST

- [ ] Schema updated and migrated
- [ ] Types exported from `src/types/index.ts`
- [ ] `matchRateLimiter` added to `src/lib/rate-limit.ts`
- [ ] Seed script created and run
- [ ] `matching-agent.ts` implemented with `passesHardFilters`, `scoreCampaignMatch`, `getMatchedCampaigns`
- [ ] `GET /api/deals` route implemented
- [ ] `POST /api/deals/[id]/apply` route implemented
- [ ] `CampaignCard` client component implemented
- [ ] `MatchFeed` client component implemented
- [ ] `/deals` page implemented
- [ ] Dashboard nav updated with NIL Deals link
- [ ] Unit tests written and passing
- [ ] All validation commands executed successfully

---

## NOTES

### Architecture Decisions

**Why seed data instead of a brand portal?** The brand portal (create account, create campaign UI) is a significant feature on its own. Seeding realistic campaigns lets us validate the athlete-facing match feed — the primary user value — without blocking on brand-side auth. A brand portal can be planned separately as the next phase.

**Why store `geographyStates`, `sportPreferences`, `divisionPreferences` as comma-separated text instead of arrays?** Neon (Postgres) supports array columns via Drizzle's `text("field").array()`, but the current schema uses only primitive Drizzle types. Staying consistent with existing patterns keeps the schema simple and avoids needing `pg-array` parsing on the JS side. The filtering logic in `passesHardFilters` handles the split.

**Why `Promise.allSettled` for Claude scoring?** Each match score call is independent. Using `Promise.all` would fail the entire response if one campaign's Claude call errors. `Promise.allSettled` is resilient — failed campaigns get a fallback score of 50 and are still shown.

**Why extract `getMatchedCampaigns` to `matching-agent.ts`?** Both the SSR page and the API route need identical logic. Duplicating it would create drift. Extracting to `matching-agent.ts` makes both consumers thin wrappers. Avoid importing from `app/api/` in pages — that's an anti-pattern in Next.js.

**Rate limit for /api/deals**: 20 req/min (vs 30 for general API and 5 for contract review). Match scoring calls Claude for every eligible campaign — more expensive than a DB read, less expensive than contract analysis. 20/min is generous for UX while protecting the Anthropic API budget.

### Known Risks

1. **Latency**: If an athlete has 10 eligible campaigns, we make 10 Claude API calls in parallel. At 1-3s each, parallel execution means total latency ~3s max. Consider adding a loading skeleton in the `MatchFeed` component or moving scoring to a background job in a future iteration.
2. **Cost**: Each score call is ~$0.001-0.003 with claude-sonnet-4-6. At 20 calls/page load for a power user, add a cache layer (DB or in-memory) to avoid re-scoring unchanged athlete+campaign pairs. Not needed for MVP.
3. **Zod v4**: The project uses Zod 4.x (`"zod": "^4.3.6"`). Do not use deprecated v3 APIs. Notable: `.min(0)` instead of `.nonnegative()`, `.int()` still works. Test schema with `npx tsc --noEmit` before running.
