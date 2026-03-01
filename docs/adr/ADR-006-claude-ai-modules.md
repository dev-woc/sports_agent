# ADR-006: Use Claude claude-sonnet-4-6 for AI Modules

**Date:** 2026-02-28
**Status:** Proposed (Phase 2)
**Deciders:** Engineering team

---

## Context

Phase 2 introduces two AI-powered modules:
1. **Contract Guard** — NIL contract analysis with clause-level risk flagging
2. **NIL Matchmaker** — brand-athlete matching with compliance scoring

We need an LLM capable of structured document analysis, JSON output, and long-context reasoning (NIL contracts can be 10–30 pages).

## Decision

Use **Anthropic Claude** (`claude-sonnet-4-6`) via the Anthropic SDK, integrated through the **Vercel AI SDK** for streaming UI support.

## Rationale

### Contract Guard Requirements
- **Long context window**: Contracts up to 30 pages (~24,000 tokens) — Claude claude-sonnet-4-6's 200K context window handles this comfortably
- **Structured JSON output**: Clause extraction requires reliable JSON with specific schema (clause text, category, severity, recommendation)
- **Legal document comprehension**: Claude excels at dense professional/legal document analysis
- **Consistent risk taxonomy**: Claude reliably follows complex system prompts defining risk categories

### NIL Matchmaker Requirements
- **Reasoning over constraints**: Matching requires weighing multiple hard filters (geographic, compliance) against soft scores (audience fit, brand alignment)
- **Explainability**: `match_reasons[]` array requires the model to articulate its scoring rationale

### SDK Choice
- **`@anthropic-ai/sdk`** for direct API access
- **`ai` (Vercel AI SDK)** for streaming response UI — contract review progress visible to user during 15–30s processing
- **Structured outputs** via Zod schema validation of Claude's JSON responses

### Model Selection: claude-sonnet-4-6 vs Alternatives
- **claude-sonnet-4-6**: Best balance of capability and cost for production use; strong legal document comprehension
- **claude-opus-4-6**: Higher cost, marginal improvement for structured extraction tasks
- **claude-haiku-4-5**: Too weak for nuanced legal clause analysis

## Implementation Pattern

```typescript
// Contract Guard agent pattern
const contractAgent = new Anthropic();

const response = await contractAgent.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  system: CONTRACT_REVIEW_SYSTEM_PROMPT,  // risk taxonomy + output schema
  messages: [
    {
      role: "user",
      content: `Review this NIL contract:\n\n${contractText}`
    }
  ]
});

// Parse structured JSON from response
const review = ContractReviewSchema.parse(JSON.parse(response.content[0].text));
```

## Alternatives Considered

| Option | Rejected Because |
|---|---|
| GPT-4o (OpenAI) | Higher cost at scale; slightly weaker on long legal documents; vendor diversification concern |
| Gemini 1.5 Pro | Less consistent structured output; less tested on NIL-specific legal language |
| Self-hosted Llama | Infrastructure complexity; quality gap for legal analysis; no managed API |
| Fine-tuned model | Insufficient training data for NIL contracts; maintenance burden |

## Safety Guardrails

1. All Contract Guard output includes disclaimer: "This analysis is informational only and does not constitute legal advice"
2. `attorney_recommended: true` flag triggered for any `critical` severity clauses
3. No AI output goes directly to NIL Go clearinghouse — human review required for all submissions
4. Rate limiting on AI endpoints: 5 reviews/day (free), 50 reviews/day (Pro)

## Consequences

- **Positive:** Best-in-class long-document analysis; Vercel AI SDK streaming integration; reliable structured JSON
- **Negative:** API cost at scale ($0.003/1K input tokens; 30-page contract ~= $0.08/review); latency 15–30s for full contract review
- **Cost projection:** At 1,000 Pro users each submitting 10 reviews/month = ~$800/month in API costs at $29.99 ARPU — <3% of revenue
