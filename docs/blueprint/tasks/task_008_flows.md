# TASK 008: Procedural guides (flows)

> **Status:** PENDING
> **Assigned to:** Constructor (Kilo Code)

## 1. Goal

Render the 4 procedural guides: `/pruvodci` lists them, and `/pruvodci/[id]` (statically generated)
shows the step-by-step flow with positional branches, keyword cross-links and rule references.

## 2. Files

- Create: `src/components/flow-view.tsx` + `src/components/__tests__/flow-view.test.tsx`
- Create: `src/app/pruvodci/[id]/page.tsx`
- Modify: `src/app/pruvodci/page.tsx`

## 3. Implementation Steps (TDD)

- [ ] **Write failing test** — `src/components/__tests__/flow-view.test.tsx`:
  ```tsx
  import { describe, it, expect } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { flows } from "@/data";
  import { TermSheetProvider } from "@/components/term-sheet";
  import { FlowView } from "@/components/flow-view";

  function fixture(id: string) {
    const f = flows.find((x) => x.id === id);
    if (!f) throw new Error(`flow ${id} missing`);
    return f;
  }

  describe("FlowView", () => {
    it("renders the flow title, a step and its positional branches", () => {
      render(
        <TermSheetProvider>
          <FlowView flow={fixture("detonace-antihmoty")} />
        </TermSheetProvider>,
      );
      expect(screen.getByRole("heading", { name: "Detonace antihmoty" })).toBeInTheDocument();
      expect(screen.getByText("Kdy se odjistí")).toBeInTheDocument();
      expect(screen.getByText("Okolní vesmír:")).toBeInTheDocument(); // branch label
      expect(screen.getByText("Na stanici:")).toBeInTheDocument();
    });
  });
  ```

- [ ] **Verify failure**
  Run: `pnpm test`
  Expected: FAIL — `@/components/flow-view` does not exist.

- [ ] **Implement `src/components/flow-view.tsx`** (complete, no placeholders):
  ```tsx
  import type { CausalFlow } from "@/data";
  import { RuleText } from "@/components/rule-text";

  export function FlowView({ flow }: { flow: CausalFlow }) {
    return (
      <article className="p-4">
        <h1 className="text-2xl font-semibold">{flow.title}</h1>
        {flow.intro ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            <RuleText>{flow.intro}</RuleText>
          </p>
        ) : null}

        <ol className="mt-4 space-y-4">
          {flow.steps.map((step, i) => (
            <li key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm">
                <RuleText>{step.body}</RuleText>
              </p>

              {step.branches && step.branches.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {step.branches.map((b, j) => (
                    <li key={j} className="rounded bg-zinc-50 p-2 text-sm dark:bg-zinc-900">
                      <span className="font-medium">{b.label}:</span>{" "}
                      <RuleText>{b.body}</RuleText>
                    </li>
                  ))}
                </ul>
              ) : null}

              {step.ruleRefs && step.ruleRefs.length > 0 ? (
                <p className="mt-2 text-xs text-zinc-500">Pravidla: {step.ruleRefs.join(", ")}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </article>
    );
  }
  ```

- [ ] **Implement `src/app/pruvodci/[id]/page.tsx`**:
  ```tsx
  import { notFound } from "next/navigation";
  import { flows } from "@/data";
  import { FlowView } from "@/components/flow-view";

  export function generateStaticParams() {
    return flows.map((f) => ({ id: f.id }));
  }

  export default async function FlowPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const flow = flows.find((f) => f.id === id);
    if (!flow) notFound();
    return (
      <main>
        <FlowView flow={flow} />
      </main>
    );
  }
  ```

- [ ] **Wire `src/app/pruvodci/page.tsx`** (landing — flow cards; Q&A section lands in task 009):
  ```tsx
  import Link from "next/link";
  import { flows } from "@/data";

  export default function PruvodciPage() {
    return (
      <main className="space-y-4 p-4">
        <h1 className="text-xl font-semibold">Průvodci</h1>
        <section aria-label="Postupy">
          <h2 className="mb-1 text-sm font-semibold text-zinc-500">Postupy</h2>
          <ul className="space-y-2">
            {flows.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/pruvodci/${f.id}`}
                  className="block rounded-lg border border-zinc-200 p-3 active:bg-zinc-50 dark:border-zinc-800 dark:active:bg-zinc-900"
                >
                  <span className="font-medium">{f.title}</span>
                  {f.intro ? <span className="mt-1 block text-sm text-zinc-500">{f.intro}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }
  ```

- [ ] **Verify pass**
  Run: `pnpm test`
  Expected: PASS — flow title, step, branch labels render.

- [ ] **Run linter & build**
  Run: `pnpm lint && pnpm build`
  Expected: lint zero warnings; build exports `/pruvodci` + 4 `/pruvodci/<id>` pages.

## 4. Constraints

- Reference: `docs/instructions/AGENTIC_PROTOCOL.md`
- Git: DO NOT COMMIT.
- Strict typing: No `any`, `as any`, `@ts-ignore`. Do not modify data / `src/data/*` / `term-sheet.tsx`.
- Keep all existing tests passing.

## 5. Acceptance Criteria

1. `pnpm test` passes (flow title, step, positional branch labels).
2. `pnpm lint` zero warnings; `pnpm build` exports `/pruvodci` and all 4 `/pruvodci/<id>` pages.
3. Flow bodies and branch bodies route through `RuleText` (keywords tappable); rule refs shown.
4. `/pruvodci` lists the 4 flows linking to their detail pages.
5. Report written to `docs/blueprint/reports/report_008.md`.
