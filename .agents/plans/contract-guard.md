# Feature: Contract Guard — AI-Powered NIL Contract Review

The following plan should be complete, but validate documentation and codebase patterns before implementing.
Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Contract Guard lets athletes upload a PDF or paste raw contract text, then receive a structured AI-powered analysis that flags predatory clauses, rates risk severity, and provides plain-English explanations — all without paying a sports attorney ($250–$500/hr). Claude reads the contract, evaluates each clause against the NIL risk taxonomy, and returns structured JSON rendered as risk-rating cards in the UI.

## User Story

As a college athlete,
I want to upload an NIL contract and receive a plain-English analysis of risky clauses,
So that I can protect myself from predatory terms without paying $500–$1,500 for an attorney.

## Problem Statement

97% of NCAA athletes have no NIL deal. Those who do often sign predatory contracts — perpetuity clauses, excessive commissions, broad exclusivity — because they can't afford legal review. Contract Guard democratizes access to contract intelligence at zero marginal cost.

## Solution Statement

A Next.js page at `/contracts` (within the `(dashboard)` route group) where athletes upload a PDF or paste text. A server action / API route sends the content to Claude (`claude-sonnet-4-6`) with structured JSON output using `output_config.format` + `zodOutputFormat()`. Results are stored per athlete in a `contract_reviews` table and rendered as risk-rated cards.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: `src/lib/db/schema.ts`, `src/app/api/contracts/`, `src/app/(dashboard)/contracts/`, `src/lib/ai/`
**Dependencies**: `@anthropic-ai/sdk` (NOT YET INSTALLED — must `npm install @anthropic-ai/sdk`)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — MUST READ BEFORE IMPLEMENTING

- `src/lib/db/schema.ts` (lines 64–109) — Drizzle table + relations pattern to mirror for `contractReviews`. Uses `uuid().defaultRandom().primaryKey()`, `timestamp({ withTimezone: true })`, FK with `references(() => profiles.id, { onDelete: "cascade" })`
- `src/app/api/onboarding/route.ts` — Full API route pattern: `export const dynamic = "force-dynamic"`, IP-based rate limiting, `auth.getSession()`, Zod `.safeParse()`, `db.insert().values().returning()`
- `src/lib/validations.ts` — Zod v4 schema pattern; add `contractReviewSchema` here
- `src/lib/rate-limit.ts` (line 29) — `apiRateLimiter = createRateLimiter(30, 60_000)`; create a new `contractRateLimiter = createRateLimiter(5, 60_000)` (5 reviews/min to limit AI cost)
- `src/types/index.ts` — `InferSelectModel<typeof table>` pattern for exported types
- `src/app/(dashboard)/editor/page.tsx` — Dashboard page component pattern (Server Component, auth guard)
- `drizzle.config.ts` — Know the migration config for running `npx drizzle-kit push`
- `.env.example` and `.env.local` — Know where to add `ANTHROPIC_API_KEY`

### New Files to Create

- `src/lib/ai/contract-agent.ts` — Claude integration: builds prompt, calls Anthropic SDK with structured output, returns `ContractAnalysis`
- `src/app/api/contracts/route.ts` — `POST` to submit contract for review; `GET` to list reviews for current user
- `src/app/api/contracts/[id]/route.ts` — `GET` to fetch single review result
- `src/app/(dashboard)/contracts/page.tsx` — Dashboard page: upload form + list of past reviews
- `src/app/(dashboard)/contracts/[id]/page.tsx` — Review detail page: risk cards

### Relevant Documentation — READ BEFORE IMPLEMENTING

- **Anthropic SDK structured output**: https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/constrained-outputs#json-mode
  Key: use `output_config: { format: { type: "json" } }` or `zodOutputFormat()` helper. The `zodOutputFormat()` function is available as `import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"`.

- **Anthropic SDK PDF document blocks**: https://docs.anthropic.com/en/docs/build-with-claude/pdf-support
  Key: base64-encode the PDF and send as a `document` content block with `media_type: "application/pdf"`. Must use Node.js runtime (NOT edge). Claude reads native PDF — no server-side PDF parsing library needed.

- **Anthropic SDK Node.js**: https://github.com/anthropic-ai/anthropic-sdk-node
  Install: `npm install @anthropic-ai/sdk`. Import: `import Anthropic from "@anthropic-ai/sdk"`.

- **Zod v4** (already installed): Use `z.object(...)` — same as existing `athleteProfileSchema` pattern.

### Patterns to Follow

**API Route Pattern** (from `src/app/api/onboarding/route.ts`):
```typescript
export const dynamic = "force-dynamic";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { apiRateLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = apiRateLimiter.check(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ... zod safeParse, db.insert().values().returning()
}
```

**Drizzle Schema Pattern** (from `src/lib/db/schema.ts` lines 64–87):
```typescript
export const contractReviews = pgTable("contract_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  // ...
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("idx_contract_reviews_profile_id").on(t.profileId)]);
```

**Anthropic SDK Structured Output Pattern**:
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const ContractAnalysisSchema = z.object({ ... });

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  output_config: { format: zodOutputFormat(ContractAnalysisSchema, "contract_analysis") },
  messages: [{ role: "user", content: [...] }],
  system: "...",
});
// response.content[0].type === "tool_use", response.content[0].input is typed
```

**PDF Upload Pattern** (base64 document block):
```typescript
const base64Pdf = Buffer.from(pdfBuffer).toString("base64");
const content = [{
  type: "document" as const,
  source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64Pdf },
}];
```

**Naming Conventions**: camelCase for variables/functions, PascalCase for types/components, kebab-case for files. Tables use snake_case. Imports from `@/` aliases.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (DB Schema + Types + Validation)

Add `contractReviews` table to schema, run migration, add Zod schema, export TypeScript type, install SDK.

### Phase 2: AI Agent

Implement `src/lib/ai/contract-agent.ts` — Claude call with system prompt, PDF/text input, structured JSON output.

### Phase 3: API Routes

Implement `POST /api/contracts` (submit), `GET /api/contracts` (list), `GET /api/contracts/[id]` (detail).

### Phase 4: UI Pages

Implement `/contracts` page (upload form + list) and `/contracts/[id]` page (risk cards).

---

## STEP-BY-STEP TASKS

### TASK 1: Install Anthropic SDK

- **RUN**: `npm install @anthropic-ai/sdk`
- **VALIDATE**: `node -e "require('@anthropic-ai/sdk')" && echo OK`

### TASK 2: ADD ANTHROPIC_API_KEY to .env.example and .env.local

- **UPDATE** `.env.example`: add `ANTHROPIC_API_KEY=` after the Neon Auth block
- **UPDATE** `.env.local`: add `ANTHROPIC_API_KEY=<your-key>` (required for local dev)
- **ALSO**: Add `ANTHROPIC_API_KEY` to Vercel environment variables via dashboard or `vercel env add ANTHROPIC_API_KEY`
- **VALIDATE**: `grep ANTHROPIC_API_KEY .env.example`

### TASK 3: ADD contractReviews table to schema

- **UPDATE** `src/lib/db/schema.ts`
- **ADD** after `athleteProfiles` table (line 87):

```typescript
export const contractReviews = pgTable(
  "contract_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull().default(""),
    rawText: text("raw_text").notNull().default(""),
    analysisJson: text("analysis_json").notNull().default("{}"),
    overallRisk: text("overall_risk").notNull().default("unknown"),
    flagCount: integer("flag_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_contract_reviews_profile_id").on(t.profileId)],
);
```

- **ADD** relations after `athleteProfilesRelations`:
```typescript
export const contractReviewsRelations = relations(contractReviews, ({ one }) => ({
  profile: one(profiles, { fields: [contractReviews.profileId], references: [profiles.id] }),
}));
```
- **UPDATE** `profilesRelations` to add `contractReviews: many(contractReviews)` alongside `linkItems`
- **PATTERN**: Mirror `linkItems` table (lines 32–47) and `linkItemsRelations` (lines 101–104)
- **IMPORTS**: Add `contractReviews` to the import at the top of schema if needed; add `many` to relations import
- **VALIDATE**: `npx tsc --noEmit 2>&1 | head -20`

### TASK 4: Run DB migration

- **RUN**: `npx drizzle-kit push`
- **VALIDATE**: `npx drizzle-kit push` exits 0; check Neon console or query `SELECT table_name FROM information_schema.tables WHERE table_name='contract_reviews'`

### TASK 5: ADD contractReviewSchema to validations.ts

- **UPDATE** `src/lib/validations.ts` — append at end:
```typescript
export const contractSubmitSchema = z.object({
  fileName: z.string().max(255).optional().default(""),
  rawText: z.string().max(200_000).optional().default(""),
  // pdfBase64 handled separately (multipart or raw body)
});
```
- **VALIDATE**: `npx tsc --noEmit 2>&1 | head -20`

### TASK 6: ADD ContractReview type to types/index.ts

- **UPDATE** `src/types/index.ts`
- **ADD**:
```typescript
import type { InferSelectModel } from "drizzle-orm";
import type { contractReviews } from "@/lib/db/schema";

export type ContractReview = InferSelectModel<typeof contractReviews>;
```
- **PATTERN**: Mirror existing `InferSelectModel` pattern in the same file
- **VALIDATE**: `npx tsc --noEmit 2>&1 | head -20`

### TASK 7: ADD contractRateLimiter to rate-limit.ts

- **UPDATE** `src/lib/rate-limit.ts` — append:
```typescript
export const contractRateLimiter = createRateLimiter(5, 60_000); // 5 per minute (AI cost control)
```
- **VALIDATE**: `npx tsc --noEmit 2>&1 | head -20`

### TASK 8: CREATE src/lib/ai/contract-agent.ts

- **CREATE** directory `src/lib/ai/` if it doesn't exist
- **IMPLEMENT** the Claude agent:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();

// Risk taxonomy from PRD
const RiskFlagSchema = z.object({
  category: z.enum([
    "perpetuity",
    "excessive_commission",
    "lifetime_agreement",
    "missing_buyout",
    "broad_exclusivity",
    "liquidated_damages",
    "missing_payment_terms",
    "ip_rights_overcapture",
    "other",
  ]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  clauseText: z.string().describe("Exact quoted text from the contract"),
  explanation: z.string().describe("Plain-English explanation of why this is risky"),
  recommendation: z.enum(["accept", "negotiate", "reject_seek_attorney"]),
});

const ContractAnalysisSchema = z.object({
  overallRisk: z.enum(["low", "medium", "high", "critical"]),
  attorneyRecommended: z.boolean(),
  summary: z.string().describe("2-3 sentence plain-English contract summary"),
  flags: z.array(RiskFlagSchema),
  disclaimer: z.string().default(
    "This analysis is for informational purposes only and does not constitute legal advice. Consult a licensed sports attorney for legal guidance.",
  ),
});

export type ContractAnalysis = z.infer<typeof ContractAnalysisSchema>;

const SYSTEM_PROMPT = `You are Contract Guard, an expert NIL (Name, Image, Likeness) contract analyst for college and high school athletes. Your job is to review athlete contracts and identify predatory or unfavorable clauses.

Analyze contracts for these risk categories:
- perpetuity: clauses granting rights "in perpetuity" or forever
- excessive_commission: agent/manager commission above 10% of earnings
- lifetime_agreement: multi-year or career-length exclusivity
- missing_buyout: no exit terms or buyout clause defined
- broad_exclusivity: prevents all competing brand deals in a category
- liquidated_damages: penalties above $50,000 for breach or transfer
- missing_payment_terms: no payment schedule, milestone, or due date
- ip_rights_overcapture: athlete loses rights to their own content/likeness
- other: any other materially unfavorable clause

Return structured JSON only. Be thorough — athletes' financial futures depend on accurate analysis. When in doubt, flag it.`;

export async function analyzeContract(input: {
  fileName: string;
  rawText?: string;
  pdfBase64?: string;
}): Promise<ContractAnalysis> {
  const userContent: Anthropic.MessageParam["content"] = [];

  if (input.pdfBase64) {
    userContent.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: input.pdfBase64,
      },
    } as Anthropic.DocumentBlockParam);
  }

  if (input.rawText) {
    userContent.push({
      type: "text",
      text: `Contract text:\n\n${input.rawText}`,
    });
  }

  if (userContent.length === 0) {
    throw new Error("Must provide either pdfBase64 or rawText");
  }

  userContent.push({
    type: "text",
    text: "Analyze this NIL contract and identify all risky clauses. Return your analysis in the required JSON format.",
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    output_config: {
      format: zodOutputFormat(ContractAnalysisSchema, "contract_analysis"),
    },
    messages: [{ role: "user", content: userContent }],
  });

  // With zodOutputFormat, response.content[0] is a tool_use block
  const block = response.content[0];
  if (block.type !== "tool_use") throw new Error("Unexpected response format from Claude");
  return ContractAnalysisSchema.parse(block.input);
}
```

- **GOTCHA**: `DocumentBlockParam` type — check exact type shape in `@anthropic-ai/sdk/resources/messages`. Cast with `as` if needed.
- **GOTCHA**: `output_config` field — this is the GA structured output feature as of Anthropic SDK v0.78.0. If the type error occurs, check the SDK version and the exact field name (`output_config` vs `betas`).
- **GOTCHA**: Must use Node.js runtime (NOT edge). API routes default to Node.js in Next.js App Router.
- **VALIDATE**: `npx tsc --noEmit 2>&1 | head -30`

### TASK 9: CREATE src/app/api/contracts/route.ts

```typescript
export const dynamic = "force-dynamic";

import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { contractReviews, profiles } from "@/lib/db/schema";
import { contractRateLimiter } from "@/lib/rate-limit";
import { analyzeContract } from "@/lib/ai/contract-agent";

// GET: list reviews for current user
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = contractRateLimiter.check(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, session.user.id) });
  if (!profile) return NextResponse.json({ reviews: [] });

  const reviews = await db.query.contractReviews.findMany({
    where: eq(contractReviews.profileId, profile.id),
    orderBy: [desc(contractReviews.createdAt)],
    columns: { rawText: false, analysisJson: false }, // omit large fields in list view
  });

  return NextResponse.json({ reviews });
}

// POST: submit contract for review
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = contractRateLimiter.check(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, session.user.id) });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const contentType = request.headers.get("content-type") ?? "";
  let fileName = "";
  let rawText = "";
  let pdfBase64: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    if (file) {
      fileName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());
      pdfBase64 = buffer.toString("base64");
    }
    if (text) rawText = text;
  } else {
    const body = await request.json();
    fileName = body.fileName ?? "";
    rawText = body.rawText ?? "";
    pdfBase64 = body.pdfBase64;
  }

  if (!rawText && !pdfBase64) {
    return NextResponse.json({ error: "Must provide file or text" }, { status: 400 });
  }

  let analysis;
  try {
    analysis = await analyzeContract({ fileName, rawText, pdfBase64 });
  } catch (err) {
    console.error("[contract-guard] AI analysis failed:", err);
    return NextResponse.json({ error: "Contract analysis failed. Please try again." }, { status: 500 });
  }

  const [review] = await db
    .insert(contractReviews)
    .values({
      profileId: profile.id,
      fileName,
      rawText: rawText.slice(0, 100_000), // cap stored text
      analysisJson: JSON.stringify(analysis),
      overallRisk: analysis.overallRisk,
      flagCount: analysis.flags.length,
    })
    .returning();

  return NextResponse.json({ review: { ...review, analysis } }, { status: 201 });
}
```

- **PATTERN**: Mirror `src/app/api/onboarding/route.ts` for auth/rate-limit guard
- **VALIDATE**: `npx tsc --noEmit 2>&1 | head -20`

### TASK 10: CREATE src/app/api/contracts/[id]/route.ts

```typescript
export const dynamic = "force-dynamic";

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { contractReviews, profiles } from "@/lib/db/schema";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, session.user.id) });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const review = await db.query.contractReviews.findFirst({
    where: and(eq(contractReviews.id, id), eq(contractReviews.profileId, profile.id)),
  });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const analysis = JSON.parse(review.analysisJson);
  return NextResponse.json({ review: { ...review, analysis } });
}
```

- **GOTCHA**: `context.params` is a `Promise` in Next.js 15+ — must `await context.params`
- **PATTERN**: Mirror `src/app/api/links/[id]/route.ts` for the dynamic route pattern
- **VALIDATE**: `npx tsc --noEmit 2>&1 | head -20`

### TASK 11: CREATE src/app/(dashboard)/contracts/page.tsx

This is the main contracts page. Use a Server Component to fetch the list, and a Client Component for the upload form.

```typescript
// src/app/(dashboard)/contracts/page.tsx  (Server Component)
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { profiles, contractReviews } from "@/lib/db/schema";
import { ContractUploadForm } from "@/components/contracts/contract-upload-form";
import { ContractReviewList } from "@/components/contracts/contract-review-list";

export default async function ContractsPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });

  const reviews = profile
    ? await db.query.contractReviews.findMany({
        where: eq(contractReviews.profileId, profile.id),
        columns: { rawText: false, analysisJson: false },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Contract Guard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload an NIL contract to get an AI-powered risk analysis. Not legal advice.
        </p>
      </div>
      <ContractUploadForm />
      {reviews.length > 0 && <ContractReviewList reviews={reviews} />}
    </div>
  );
}
```

- **PATTERN**: Mirror `src/app/(dashboard)/editor/page.tsx` for the Server Component + redirect pattern

### TASK 12: CREATE src/components/contracts/contract-upload-form.tsx

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContractUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !text.trim()) {
      setError("Upload a PDF or paste contract text.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);

    const res = await fetch("/api/contracts", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    const { review } = await res.json();
    router.push(`/contracts/${review.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
      <div className="space-y-2">
        <Label>Upload PDF</Label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label>Or paste contract text</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste contract text here..."
          rows={6}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Analyzing..." : "Analyze Contract"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        For informational purposes only. Not legal advice.
      </p>
    </form>
  );
}
```

### TASK 13: CREATE src/components/contracts/contract-review-list.tsx

```typescript
import Link from "next/link";
import type { ContractReview } from "@/types";

const RISK_COLORS: Record<string, string> = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

export function ContractReviewList({ reviews }: { reviews: Omit<ContractReview, "rawText" | "analysisJson">[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Past Reviews</h2>
      {reviews.map((r) => (
        <Link
          key={r.id}
          href={`/contracts/${r.id}`}
          className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:bg-muted"
        >
          <div>
            <p className="font-medium">{r.fileName || "Pasted contract"}</p>
            <p className="text-xs text-muted-foreground">
              {r.flagCount} flag{r.flagCount !== 1 ? "s" : ""}
            </p>
          </div>
          <span className={`text-sm font-semibold capitalize ${RISK_COLORS[r.overallRisk] ?? ""}`}>
            {r.overallRisk}
          </span>
        </Link>
      ))}
    </div>
  );
}
```

### TASK 14: CREATE src/app/(dashboard)/contracts/[id]/page.tsx

```typescript
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { contractReviews, profiles } from "@/lib/db/schema";
import type { ContractAnalysis } from "@/lib/ai/contract-agent";

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

export default async function ContractReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  });
  if (!profile) notFound();

  const review = await db.query.contractReviews.findFirst({
    where: and(eq(contractReviews.id, id), eq(contractReviews.profileId, profile.id)),
  });
  if (!review) notFound();

  const analysis: ContractAnalysis = JSON.parse(review.analysisJson);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">{review.fileName || "Contract Review"}</h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          Overall risk: <span className="font-semibold">{review.overallRisk}</span>
          {analysis.attorneyRecommended && (
            <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
              Attorney review recommended
            </span>
          )}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm leading-relaxed">{analysis.summary}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Risk Flags ({analysis.flags.length})</h2>
        {analysis.flags.length === 0 && (
          <p className="text-sm text-muted-foreground">No significant risk flags detected.</p>
        )}
        {analysis.flags.map((flag, i) => (
          <div key={i} className={`rounded-lg border p-4 ${SEVERITY_BADGE[flag.severity]}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide">{flag.category.replace(/_/g, " ")}</span>
              <span className="text-xs font-semibold uppercase">{flag.severity}</span>
            </div>
            <blockquote className="text-xs italic border-l-2 border-current pl-2 mb-2 opacity-70">
              "{flag.clauseText.slice(0, 200)}{flag.clauseText.length > 200 ? "..." : ""}"
            </blockquote>
            <p className="text-sm">{flag.explanation}</p>
            <p className="text-xs mt-2 font-medium">
              Recommendation: {flag.recommendation.replace(/_/g, " ")}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground border-t pt-4">{analysis.disclaimer}</p>
    </div>
  );
}
```

### TASK 15: ADD "Contracts" nav link to dashboard layout

- **UPDATE** `src/app/(dashboard)/layout.tsx` — add a nav link to `/contracts` alongside the editor link
- **PATTERN**: Find the existing nav/sidebar structure and add a `<Link href="/contracts">Contract Guard</Link>` item

### TASK 16: Run type check and linter

- **VALIDATE**: `npx tsc --noEmit 2>&1`
- **VALIDATE**: `npx biome check src/lib/ai src/app/api/contracts src/app/\(dashboard\)/contracts src/components/contracts 2>&1`

---

## TESTING STRATEGY

### Unit Tests

**Test file**: `src/lib/__tests__/contract-agent.test.ts`

Test the `analyzeContract` function with a mocked Anthropic client. Mock `@anthropic-ai/sdk` to return a fixture analysis JSON. Assert the output matches `ContractAnalysisSchema`.

```typescript
import { vi, describe, it, expect } from "vitest";
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{
          type: "tool_use",
          input: {
            overallRisk: "critical",
            attorneyRecommended: true,
            summary: "This contract contains severe predatory clauses.",
            flags: [{
              category: "perpetuity",
              severity: "critical",
              clauseText: "in perpetuity throughout the universe",
              explanation: "This grants rights forever with no end date.",
              recommendation: "reject_seek_attorney",
            }],
            disclaimer: "Not legal advice.",
          },
        }],
      }),
    },
  })),
}));

import { analyzeContract } from "../ai/contract-agent";

describe("analyzeContract", () => {
  it("returns structured analysis from text input", async () => {
    const result = await analyzeContract({ fileName: "test.txt", rawText: "in perpetuity throughout the universe" });
    expect(result.overallRisk).toBe("critical");
    expect(result.flags).toHaveLength(1);
    expect(result.flags[0].category).toBe("perpetuity");
  });

  it("throws when no text or pdf provided", async () => {
    await expect(analyzeContract({ fileName: "" })).rejects.toThrow("Must provide");
  });
});
```

- **VALIDATE**: `npx vitest run src/lib/__tests__/contract-agent.test.ts`

### Edge Cases

- Empty contract text → 400 from API route
- PDF too large (>20MB) → reject before calling Claude, return 413
- Claude times out → catch error, return 500 with friendly message
- User has no profile → 404 from API route
- Rate limit exceeded → 429 from API route

---

## VALIDATION COMMANDS

### Level 1: Type Check
```bash
npx tsc --noEmit 2>&1
```

### Level 2: Lint
```bash
npx biome check src/ 2>&1
```

### Level 3: Unit Tests
```bash
npx vitest run 2>&1
```

### Level 4: DB Migration Verification
```bash
# Verify table exists in Neon
npx drizzle-kit push --dry-run 2>&1
```

### Level 5: Local E2E (manual)
```bash
# Start dev server
npm run dev
# Visit http://localhost:3000/contracts
# Upload a PDF or paste text
# Verify redirect to /contracts/[id] with risk cards
```

### Level 6: Production Curl Test (after deploy)
```bash
# Must have a session cookie from login
curl -X POST https://bagentsports.vercel.app/api/contracts \
  -F "text=The athlete grants Company the right to use their likeness in perpetuity throughout the universe." \
  -H "Cookie: __neon-auth.session_token=..." | jq .
```

---

## ACCEPTANCE CRITERIA

- [ ] `npm install @anthropic-ai/sdk` succeeds; SDK importable
- [ ] `ANTHROPIC_API_KEY` added to `.env.example`, `.env.local`, and Vercel env
- [ ] `contract_reviews` table created in Neon DB via `drizzle-kit push`
- [ ] `POST /api/contracts` with text body returns 201 with `analysisJson` containing risk flags
- [ ] `GET /api/contracts` returns list of reviews (without rawText/analysisJson)
- [ ] `GET /api/contracts/[id]` returns full review with parsed analysis
- [ ] `/contracts` page renders upload form with PDF and text input options
- [ ] Submitting form navigates to `/contracts/[id]` with risk flag cards
- [ ] Risk cards display severity color coding (critical=red, high=orange, medium=yellow, low=green)
- [ ] Rate limiter blocks >5 requests/minute per IP
- [ ] Unit tests pass with mocked Anthropic client
- [ ] `npx tsc --noEmit` exits 0
- [ ] Disclaimer "not legal advice" visible on both upload and result pages

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order (1–16)
- [ ] `npx tsc --noEmit` passes (0 errors)
- [ ] `npx biome check src/` passes
- [ ] `npx vitest run` passes (including contract-agent unit test)
- [ ] Local dev server: upload form works, result renders
- [ ] No regressions on existing `/editor` page or auth flow

---

## NOTES

### Why store `analysisJson` as TEXT not JSONB?
Drizzle's pg-core has `jsonb()` but using `text()` keeps the schema import minimal and avoids potential serialization edge cases. The trade-off is no server-side JSON querying, which is acceptable since the full object is always deserialized in application code.

### Why not use edge runtime?
Anthropic SDK requires Node.js APIs (`Buffer`, streams). All contract API routes must use `export const dynamic = "force-dynamic"` (Node.js runtime, NOT `export const runtime = "edge"`).

### Why cap rawText at 100,000 chars in DB?
Claude's context window handles large documents well, but storing the full original text wastes DB space. 100k chars (~25k words) covers virtually all NIL contracts.

### zodOutputFormat availability
`zodOutputFormat` is exported from `@anthropic-ai/sdk/helpers/zod` as of SDK v0.78.0+. It uses constrained decoding (tool_use internally) to guarantee valid JSON matching the Zod schema. If import fails, fall back to `type: "json"` in `output_config` with manual `JSON.parse()` + zod `.parse()`.

### Confidence Score
**8/10** — All patterns are established in the codebase. The only risk is the exact Anthropic SDK type signatures for `output_config.format` and `DocumentBlockParam`, which may require minor casting. The Claude integration pattern is well-documented and the structured output feature is GA.
