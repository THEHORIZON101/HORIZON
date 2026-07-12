---
name: benchmark-lab
description: Design, run, score, and report empirical evaluations of AI models, prompts, reasoning settings, tools, agents, or custom GPTs using representative tasks, executable validators, blinded grading, repeated fresh runs, and honest limitations. Use when the user asks to test model capability, compare configurations, validate a prompt, grade an AI, or create a benchmark.
---

# Benchmark Lab

Build evidence that can survive inspection. Never convert a small sample into a universal model score.

## Workflow

1. Define the decision the benchmark must support: model choice, prompt revision, reasoning level, cost trade-off, or regression check.
2. Choose representative tasks from the user's real workload. Add recognized public tasks only when their license and contamination risk are understood.
3. Separate the task author, solver, and grader when independent runs or agents are available. Do not leak answers or suspected failures to the solver.
4. Prefer deterministic graders for code, schemas, calculations, citations, required fields, and file checks. Use a written rubric and blinded grading for style or usefulness.
5. Run multiple fresh samples per configuration when the execution surface allows it. Change one variable at a time.
6. Record task success, partial credit, latency, tokens or credits, retries, tool calls, and cost when available.
7. Report exact scope, raw results, failures, confidence, contamination risk, and limitations.

## Integrity rules

- Call a subset a sample, not the full benchmark.
- Do not claim pass@k without the required independent samples and calculation.
- Do not silently discard failed runs.
- Public benchmark success may reflect memorization; include private holdout tasks.
- Tool-assisted and unaided performance are different conditions.
- Self-grading is diagnostic, not independent evidence.

## Completion

Deliver the runnable tasks and graders, machine-readable results when practical, a concise scorecard, and the decision justified by the data.

