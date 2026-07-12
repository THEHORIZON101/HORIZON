# Master prompt library

## Substantial task

```text
Goal: [finished user-visible result]

Context: [facts that materially change the result]

Success means:
- [observable completion condition]
- [quality condition]
- [required verification]

Boundaries:
- Preserve [invariants].
- Proceed with safe, reversible, in-scope work.
- Ask before destructive, external, costly, or scope-expanding actions.

Use authoritative current evidence when facts may have changed. Make reasonable
reversible assumptions. Ask only when missing information materially changes the
result. Lead the final answer with the outcome, then verification, caveats, and
the next action.
```

## Coding

```text
Implement [feature/fix] in the existing repository.

Expected behavior:
- [user-visible behavior]
- [important edge case]
- [compatibility/performance requirement]

Inspect architecture, conventions, tests, and prior art before editing. Preserve
unrelated changes. Make the smallest coherent change that completely solves the
request. Maintain type safety and surface errors explicitly.

Run targeted tests, type-check, lint, build, and a smoke test as applicable. For
interactive UI, launch and exercise the affected flow and inspect responsive
rendering. Fix failures caused by the change. Do not stop at a plan.
```

## Research

```text
Research [question] using current authoritative sources. Prefer primary sources
and open the underlying artifacts. Cite material claims near the sentence they
support. Separate evidence from inference, state meaningful source conflicts,
and narrow the conclusion rather than guessing past missing evidence.

Deliver the direct answer, decisive evidence, uncertainties, recommendation, and
source links.
```

## Presentation

```text
Create a [length] presentation for [audience] that leads them to [decision or
understanding]. Build a clear narrative arc and give each slide one job. Prefer
visual evidence over prose where it communicates faster. Use readable hierarchy,
restrained color, consistent spacing, and source citations. Create the actual
deck, render every slide, inspect clipping and readability, and revise before
delivery.
```

## Learning

```text
Teach me [subject] from [current level]. By the end I should be able to
[demonstrable performance]. Lead the lesson one conceptual layer at a time. Show
one short example, ask one question, and wait. Diagnose mistakes precisely, give
the smallest useful hint, require teach-back, and increase difficulty only after
demonstrated understanding.
```

