# Feature: Frontend Redesign — Stryds-Inspired Athlete OS UI

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to the existing shadcn/ui component names, globals.css variable names, and import paths.

## Feature Description

Redesign the Athlete OS frontend with a premium, athletic aesthetic inspired by Stryds — bold display typography, a vibrant electric-blue primary accent, a compelling marketing landing page, refined auth/onboarding flows, and a polished dashboard header. The current UI uses a generic neutral palette with a boilerplate home page. This redesign elevates the brand to match the premium sports platform it is.

## User Story

As an athlete visiting Athlete OS for the first time,
I want to land on a compelling, professional-looking platform that clearly communicates value,
So that I trust it enough to sign up and build my profile.

## Problem Statement

1. **Home page is generic boilerplate** — shows Next.js logo and template links, not product value
2. **Zero brand identity** — the entire color system is neutral gray/black with no accent color
3. **Auth pages feel generic** — no brand logo, plain card layout
4. **Dashboard nav is minimal** — shows "Editor" text link and raw email address only
5. **Minimal theme uses hardcoded grays** — `text-gray-900`, `bg-gray-200` — not theme-aware

## Solution Statement

1. Update `globals.css`: change `--primary` to electric blue `oklch(0.62 0.27 260)` and add display/headline typography utilities
2. Rewrite `src/app/page.tsx` as a full marketing landing page (nav + hero + 4 modules + CTA banner + footer)
3. Update auth layout to show brand logo above cards
4. Update dashboard layout with a sticky glass nav and proper user identity display
5. Polish onboarding wizard with a step counter label and consistent brand color
6. Fix `MinimalTheme` to use semantic color variables instead of hardcoded grays

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: `globals.css`, `page.tsx`, auth layout, dashboard layout, onboarding wizard, minimal theme
**Dependencies**: All existing (lucide-react icons, tailwindcss, shadcn/ui) — no new packages

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ BEFORE IMPLEMENTING

- `src/app/globals.css` (lines 1–126) — Current OKLCH color system and @theme inline mapping; this is where `--primary` is defined and needs updating
- `src/app/page.tsx` (lines 1–65) — Current boilerplate; full rewrite target
- `src/app/(auth)/layout.tsx` (lines 1–9) — Auth centering wrapper; add brand logo
- `src/app/(auth)/login/page.tsx` — Read before touching auth layout so you don't break existing Card composition
- `src/app/(auth)/signup/page.tsx` — Same as login
- `src/app/(dashboard)/layout.tsx` (lines 1–28) — Dashboard header; update to sticky glassmorphic nav
- `src/components/onboarding/onboarding-wizard.tsx` (lines 121–316) — Current wizard rendering; add step counter, keep all state logic untouched
- `src/components/themes/minimal.tsx` (lines 1–52) — Fix hardcoded grays; replace with theme variables
- `src/components/ui/button.tsx` — Do NOT modify; it already uses `bg-primary` which will inherit the new color automatically
- `src/types/index.ts` — `ThemeProps` interface the MinimalTheme receives

### New Files to Create

- None. All changes are updates to existing files.

### Relevant Documentation

- [Tailwind v4 CSS Variables](https://tailwindcss.com/docs/v4-upgrade#css-theme-variables)
  - Section: Using CSS custom properties as theme values
  - Why: globals.css uses `@theme inline` — changes to `--primary` propagate automatically to all `bg-primary`, `text-primary`, `ring-primary` classes
- [OKLCH Color Tool](https://oklch.com/)
  - Why: Use to verify electric blue oklch values render correctly
- [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)
  - Why: Button default variant uses `bg-primary text-primary-foreground` — updating `--primary` updates all buttons automatically

### Patterns to Follow

**Color variable naming** (from `globals.css` lines 49–82):
```css
:root {
  --primary: oklch(0.205 0 0);         /* update this */
  --primary-foreground: oklch(0.985 0 0);  /* keep */
  --ring: oklch(0.708 0 0);            /* update to match primary */
}
```

**Tailwind class usage** (from existing components):
- Use `bg-primary`, `text-primary`, `border-primary` — never inline oklch values in JSX
- Use `text-muted-foreground` for secondary text (not `text-gray-500`)
- Use `bg-muted` for subtle backgrounds (not `bg-gray-100`)
- Use `border-border` for dividers (not `border-gray-200`)

**Component composition pattern** (from `src/app/(auth)/layout.tsx`):
```tsx
// Server component, no "use client"
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="...">
      {children}
    </div>
  );
}
```

**Link vs anchor** (from `dashboard/layout.tsx` line 16):
- Use Next.js `<Link href="...">` for internal navigation
- Use `<a href="...">` only for external links

**Icon imports** (from existing editor components):
```tsx
import { ShieldCheck, Handshake, Users, User, ArrowRight } from "lucide-react";
```

**Error color** (from onboarding-wizard.tsx line 173):
- Current: `text-red-600` (hardcoded) — keep as-is in this task, not the focus of redesign

---

## IMPLEMENTATION PLAN

### Phase 1: Color System & Typography Foundation

Update `globals.css` — this propagates the brand color to every component that uses `bg-primary`, `text-primary`, `ring`, or focus rings. No component-level changes needed.

**Tasks:**
- Change `--primary` from neutral dark to electric blue in `:root`
- Update `--ring` to match primary for cohesive focus states
- Update dark mode `--primary` to a lighter blue that works on dark backgrounds
- Add `@layer utilities` with `.text-display` and `.text-headline` CSS classes for large viewport-responsive typography

### Phase 2: Landing Page

Complete rewrite of `src/app/page.tsx` as a full marketing page. This is a pure Server Component (no "use client" needed).

**Sections:**
1. **Nav** — sticky, logo + sign in / get started CTAs with backdrop blur
2. **Hero** — min-h-screen, centered, `.text-display` headline, sub-paragraph, two CTA buttons
3. **Features** — 4-column grid (2-col on mobile) with module cards: Contract Guard, NIL Matchmaker, Parent Dashboard, Athlete Profile
4. **CTA Banner** — dark section with sign-up prompt
5. **Footer** — minimal: logo + copyright

### Phase 3: Auth Layout

Update `src/app/(auth)/layout.tsx` to add brand logo above the card and remove the muted background in favor of clean white.

### Phase 4: Dashboard Header

Update `src/app/(dashboard)/layout.tsx` to a sticky glass nav with:
- "Athlete OS" logo linking to home
- Nav items: Profile, NIL (dimmed), Contracts (dimmed)
- User avatar (initials, `h-8 w-8 rounded-full`) instead of raw email text

### Phase 5: Onboarding Wizard Polish

Update `src/components/onboarding/onboarding-wizard.tsx`:
- Add a "Step X of 3" label above the step title
- Change progress pills to use `bg-brand` (which is now primary) — already correct since it uses `bg-primary`
- Increase Card max-width to `max-w-lg` for breathing room
- No logic changes — only rendering updates

### Phase 6: Minimal Theme Fix

Update `src/components/themes/minimal.tsx`:
- Replace `bg-white` → `bg-background`
- Replace `text-gray-900` → `text-foreground`
- Replace `bg-gray-200` (avatar fallback) → `bg-muted`
- Replace `text-gray-500` (avatar initial) → `text-muted-foreground`
- Replace `text-gray-600` (bio) → `text-muted-foreground`
- Replace `border-gray-200` → `border-border`
- Replace `hover:bg-gray-50` → `hover:bg-muted`
- Replace `text-gray-500` (header label) → `text-muted-foreground`

---

## STEP-BY-STEP TASKS

### TASK 1: UPDATE `src/app/globals.css`

- **IMPLEMENT**: In `:root`, change `--primary` to `oklch(0.62 0.27 260)` (electric blue). Change `--primary-foreground` to `oklch(0.985 0 0)` (near white — stays same). Change `--ring` to `oklch(0.62 0.27 260)` to match.
- **IMPLEMENT**: In `.dark`, change `--primary` to `oklch(0.72 0.22 260)` (lighter blue for dark bg). Change `--primary-foreground` to `oklch(0.145 0 0)` (dark text on lighter blue). Change `--ring` to `oklch(0.72 0.22 260)`.
- **IMPLEMENT**: After the `.dark { }` block and before `@layer base`, add:
  ```css
  @layer utilities {
    .text-display {
      font-size: clamp(2.5rem, 4vw + 2vh + 0.5rem, 5rem);
      line-height: 1.08;
      letter-spacing: -0.025em;
      font-weight: 800;
    }
    .text-headline {
      font-size: clamp(1.75rem, 2.5vw + 1vh, 3rem);
      line-height: 1.15;
      letter-spacing: -0.018em;
      font-weight: 700;
    }
  }
  ```
- **GOTCHA**: Do NOT touch the `@theme inline` block — it maps CSS vars to Tailwind classes and must stay intact. Only change values inside `:root {}` and `.dark {}`.
- **VALIDATE**: `npx tsc --noEmit` (no TS errors) + visually check button colors in browser at `/login`

---

### TASK 2: UPDATE `src/app/page.tsx`

- **IMPLEMENT**: Full rewrite. Remove all existing boilerplate. This is a Server Component (no "use client"). Use `import Link from "next/link"` for navigation. Use `import { ShieldCheck, Handshake, Users, UserCircle, ArrowRight, Zap } from "lucide-react"` for icons. Use `import { Button } from "@/components/ui/button"` for CTAs.
- **IMPLEMENT**: Exact structure:
  ```tsx
  // Nav: sticky, z-50, border-b border-border/40, bg-background/80 backdrop-blur
  //   Left: "Athlete OS" in font-bold tracking-tight
  //   Right: <Link href="/login"> (ghost variant) + <Link href="/signup"> (default Button)

  // Hero: min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-24
  //   <h1 className="text-display max-w-3xl">
  //     "Your Athletic Career,<br/>One Platform."
  //   </h1>
  //   <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
  //     "NIL matchmaking, AI contract review, recruiting intelligence,
  //     and a professional athlete profile — everything serious athletes need."
  //   </p>
  //   <div className="mt-10 flex flex-wrap gap-4 justify-center">
  //     <Button asChild size="lg"><Link href="/signup">Get Started Free <ArrowRight /></Link></Button>
  //     <Button asChild size="lg" variant="outline"><Link href="/login">Sign In</Link></Button>
  //   </div>

  // Features: py-24 px-4, bg-muted/30
  //   <h2 className="text-headline text-center mb-4">Everything You Need</h2>
  //   <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
  //     "Built for athletes navigating NIL, recruiting, and career decisions."
  //   </p>
  //   Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto
  //   4 cards (rounded-xl border bg-card p-6 flex flex-col gap-3):
  //     1. ShieldCheck icon, "Contract Guard", "AI flags predatory clauses, perpetuity terms, and exclusivity traps before you sign."
  //     2. Handshake icon, "NIL Matchmaker", "Match with brands aligned to your sport, audience, and compliance status."
  //     3. Users icon, "Parent Dashboard", "Unified recruiting timeline, NIL opportunities, and eligibility tracking for your family."
  //     4. UserCircle icon, "Athlete Profile", "A professional public profile with stats, highlights, and social links."
  //   Icon: h-10 w-10 rounded-lg bg-primary/10 p-2 text-primary
  //   Card title: font-semibold text-lg
  //   Card description: text-sm text-muted-foreground leading-relaxed

  // CTA Banner: py-24 px-4 bg-primary text-primary-foreground text-center
  //   <h2 className="text-headline mb-4">Ready to maximize your athletic career?</h2>
  //   <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
  //     "Join thousands of athletes building their careers on Athlete OS."
  //   </p>
  //   <Button asChild size="lg" variant="secondary">
  //     <Link href="/signup">Create Your Free Profile <ArrowRight /></Link>
  //   </Button>

  // Footer: border-t py-8 px-4
  //   flex items-center justify-between max-w-6xl mx-auto
  //   Left: "Athlete OS" in font-semibold + "© 2026" in text-muted-foreground text-sm
  //   Right: <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
  ```
- **GOTCHA**: Do NOT use `<Image>` from next/image for the logo — keep it as a text mark "Athlete OS" for now. Do NOT add `"use client"` — this page has no client state.
- **GOTCHA**: `Button asChild` with `<Link>` inside requires no href on Button — `Link` provides the href. Pattern: `<Button asChild><Link href="...">text</Link></Button>`
- **VALIDATE**: `npm run build 2>&1 | tail -20` — should show `/` as `○ (Static)`

---

### TASK 3: UPDATE `src/app/(auth)/layout.tsx`

- **IMPLEMENT**: Replace the current implementation with:
  ```tsx
  import Link from "next/link";

  export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
        <Link href="/" className="mb-8 text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          Athlete OS
        </Link>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }
  ```
- **GOTCHA**: The children (login/signup pages) render `<Card>` components. The layout just provides centering and the logo above. Do NOT add a Card wrapper in the layout.
- **VALIDATE**: Visit `/login` — should see "Athlete OS" text link above the card

---

### TASK 4: UPDATE `src/app/(dashboard)/layout.tsx`

- **IMPLEMENT**: Replace the header section with:
  ```tsx
  import Link from "next/link";
  import { redirect } from "next/navigation";
  import { auth } from "@/lib/auth/server";

  export const dynamic = "force-dynamic";

  export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect("/login");

    const initials = session.user.email?.slice(0, 2).toUpperCase() ?? "??";

    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-base font-bold tracking-tight hover:opacity-80 transition-opacity">
                Athlete OS
              </Link>
              <nav className="hidden sm:flex items-center gap-6 text-sm">
                <Link href="/editor" className="font-medium hover:text-primary transition-colors">
                  Profile
                </Link>
                <span className="text-muted-foreground cursor-not-allowed select-none">NIL</span>
                <span className="text-muted-foreground cursor-not-allowed select-none">Contracts</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {initials}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }
  ```
- **GOTCHA**: The sticky header needs `bg-background/95 backdrop-blur` — this uses Tailwind's opacity modifier syntax. Test that the `supports-[backdrop-filter]` class renders correctly (Tailwind v4 supports arbitrary variants).
- **GOTCHA**: `cursor-not-allowed` on non-interactive `<span>` elements communicates "coming soon" nav items without adding confusion of a disabled button.
- **VALIDATE**: Visit `/editor` when logged in — header should be sticky with "Athlete OS" logo, nav items, and blue initials avatar

---

### TASK 5: UPDATE `src/components/onboarding/onboarding-wizard.tsx`

- **IMPLEMENT**: Add step counter label. In the `<CardHeader>` section (after the progress pills div, before `<CardTitle>`), insert:
  ```tsx
  <p className="text-xs font-medium text-muted-foreground text-center tracking-wide uppercase">
    Step {step} of 3
  </p>
  ```
  The final CardHeader JSX order: progress pills → step counter → CardTitle → CardDescription.
- **IMPLEMENT**: Change `max-w-md` on the Card to `max-w-lg` for more breathing room:
  ```tsx
  <Card className="w-full max-w-lg">
  ```
- **GOTCHA**: The progress pill already uses `bg-primary` which will now be electric blue automatically after Task 1. No change needed to pill color.
- **GOTCHA**: Do NOT touch any state, validation logic, API call, or useEffect — only rendering changes.
- **VALIDATE**: `npx tsc --noEmit` — no type errors on the component

---

### TASK 6: UPDATE `src/components/themes/minimal.tsx`

- **IMPLEMENT**: Replace all hardcoded gray Tailwind classes with semantic equivalents:

  | Current (hardcoded) | Replace with (semantic) |
  |---|---|
  | `bg-white` (outer div) | `bg-background` |
  | `text-gray-900` (outer div) | `text-foreground` |
  | `bg-gray-200` (avatar fallback) | `bg-muted` |
  | `text-gray-500` (avatar initial) | `text-muted-foreground` |
  | `text-gray-600` (bio) | `text-muted-foreground` |
  | `text-gray-500` (header h2) | `text-muted-foreground` |
  | `border-gray-200` (divider hr) | `border-border` |
  | `border-gray-200` (link button border) | `border-border` |
  | `bg-white` (link button bg) | `bg-background` |
  | `hover:bg-gray-50` (link button hover) | `hover:bg-muted` |
  | `text-gray-900` is NOT used in link button in current code — it only uses inherited foreground | n/a |

- **PATTERN**: Reference `src/app/globals.css` lines 49–82 for semantic token definitions.
- **GOTCHA**: The outer div currently has `text-gray-900` — this needs to become `text-foreground` so the theme works correctly in dark mode when the app adds dark mode support.
- **VALIDATE**: `npx tsc --noEmit && npm run lint` — no errors

---

## TESTING STRATEGY

### Visual Validation (Primary)

This is a frontend-only redesign with no API changes. The primary validation is visual.

### TypeScript Checks

All updated components use the same props/types — no type changes are made. Run `npx tsc --noEmit` after each task.

### Lint Checks

Biome will catch import issues and formatting. Run `npm run lint` after all tasks.

### Edge Cases

- **Empty avatar URL**: MinimalTheme must still show fallback with `bg-muted` (not bg-gray-200)
- **Dark mode**: The brand color change affects dark mode too — test by toggling `.dark` class in browser dev tools
- **Auth redirect flow**: Auth layout logo link to `/` must work on both login and signup pages
- **Small screens**: Landing page grid collapses to 1 column, hero text clamps correctly via `clamp()`
- **`asChild` Button**: If `Button` from shadcn/ui doesn't support `asChild` prop, check `src/components/ui/button.tsx` — it uses CVA and should already support it via Radix Slot

---

## VALIDATION COMMANDS

### Level 1: Type Check

```bash
npx tsc --noEmit
```
Expected: zero errors

### Level 2: Lint

```bash
npm run lint
```
Expected: zero errors (pre-existing `slug-input.tsx` warning may appear — ignore)

### Level 3: Build

```bash
npm run build 2>&1 | tail -30
```
Expected: build succeeds, `/` shows as `○ (Static)` in route table

### Level 4: Unit Tests

```bash
npm run test:run
```
Expected: 41/41 tests pass (no test files are changed)

### Level 5: Manual Visual Check

Start dev server:
```bash
npm run dev
```

Check each page:
1. `/` — Landing page: nav with "Athlete OS" + CTAs, blue "Get Started" button, hero with large `text-display` headline, 4 feature cards, CTA banner with blue background, footer
2. `/login` — "Athlete OS" link above card, electric-blue "Sign in" button
3. `/signup` — Same as login
4. `/onboarding` — "Step X of 3" label above wizard title, electric-blue progress pills, wider card (`max-w-lg`)
5. `/editor` — Sticky header: "Athlete OS", Profile/NIL/Contracts nav, blue initials avatar

---

## ACCEPTANCE CRITERIA

- [ ] Primary color is electric blue `oklch(0.62 0.27 260)` — visible on all buttons and focus rings
- [ ] Home page `/` shows full marketing page with nav, hero, 4 feature cards, CTA section, footer
- [ ] Home page hero headline uses `text-display` class with responsive sizing
- [ ] Auth pages show "Athlete OS" logo link above the sign-in/sign-up card
- [ ] Dashboard header is sticky, glassmorphic, shows "Athlete OS" logo + nav + initials avatar
- [ ] Onboarding wizard shows "Step X of 3" label and uses `max-w-lg`
- [ ] MinimalTheme uses zero hardcoded gray classes — all semantic
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `npm run lint` exits with code 0 (or pre-existing warnings only)
- [ ] `npm run build` succeeds
- [ ] All 41 unit tests pass

---

## COMPLETION CHECKLIST

- [ ] Task 1: `globals.css` primary → electric blue, ring updated, display utilities added
- [ ] Task 2: `page.tsx` fully rewritten as marketing landing page
- [ ] Task 3: `(auth)/layout.tsx` has brand logo above card
- [ ] Task 4: `(dashboard)/layout.tsx` sticky glass nav with initials avatar
- [ ] Task 5: Onboarding wizard has step counter + wider max-width
- [ ] Task 6: MinimalTheme uses zero hardcoded grays
- [ ] All validation commands executed and passing

---

## NOTES

**Why electric blue `oklch(0.62 0.27 260)`?**
Recruiting/NIL platforms benefit from trustworthy blue (used by LinkedIn, recruiting apps). OKLCH value 0.62 lightness + 0.27 chroma + 260 hue gives a saturated, vibrant blue that reads clearly on white backgrounds while remaining professional.

**Why update `--primary` vs adding `--brand`?**
Updating `--primary` means all existing components (Button default, focus rings, sidebar) automatically inherit the brand color. Adding a new token would require updating every component manually.

**Stryds aesthetic principles applied:**
- Large viewport-responsive headlines via `clamp()` (mirrors Stryds' `calc(6vw + 6vh + 0.5rem)` approach)
- Clean sections with generous padding (`py-24`)
- Minimal nav with strong CTAs
- Section-based value communication
- Mobile-first grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)

**Coming soon nav items:**
"NIL" and "Contracts" in the dashboard nav are `<span>` (not `<Link>`) with `text-muted-foreground` to communicate planned features without broken links. Remove these or replace with real routes as modules are built.

**Confidence Score: 9/10**
All changes are isolated to specific files, no new dependencies, no API changes. The only uncertainty is exact pixel rendering of the `clamp()` headline sizes which may need minor tuning.
