# GPT-5.6 Sol: Tested Operating Manuscript

## Executive conclusion

GPT-5.6 performs best when it receives a compact task contract: a finished outcome, the context that can change it, observable success conditions, real constraints, an evidence standard, and a verification requirement. It does not need motivational “genius” language, repeated rules, or a scripted chain of thought.

The evidence in this kit has two layers:

1. A custom single-session audit scored **95/100**, including 17/17 structured checks and 6/6 executable coding tests.
2. A recognized public HumanEval sample scored **5/5 tasks and 20/20 assertions**.

Neither result is a universal intelligence score. The HumanEval sample covers only five public tasks, and the custom audit was authored and answered in one session. The justified conclusion is narrower: Sol High showed strong precision, basic algorithmic coding, evidence extraction, research discipline, recovery, and end-to-end artifact completion under the tested conditions.

## What the real benchmark adds

HumanEval is an OpenAI hand-written Python code-generation benchmark. The five sampled tasks tested pairwise numeric comparison, balanced-parenthesis parsing, fractional arithmetic, cumulative-state detection, and statistical calculation. Every executable assertion passed.

The result is stronger than self-assigned prose grading because the code either satisfies the assertions or fails. It is weaker than a full benchmark because:

- only 5 of 164 public tasks were sampled;
- public tasks may be present in training data;
- the run was not repeated in fresh contexts;
- no latency, token, credit, or pass@k data was available;
- the model could execute and repair code with tools.

Use the benchmark as a proof that the supplied workflow can produce correct executable code on this sample. Do not use it as a leaderboard claim.

## Best ChatGPT setup

### Global personality

Set **Base style and tone to Candid**. OpenAI defines Candid as direct and encouraging, with straightforward answers, explicit risks and trade-offs, constructive next steps, and less small talk. This matches a user who wants decisive leadership and honest review.

Recommended characteristic controls:

- Warmth: slightly below default.
- Enthusiasm: low.
- Headers and lists: medium.
- Emojis: minimal or off.

Personality changes communication, not model capability. Specialist prompts should override it when the artifact needs a literary, playful, formal, or highly concise voice.

### Global custom instructions

Keep global instructions under the current 1,500-character limit and use them only for durable collaboration behavior. The copy-ready version is in [`../settings/CUSTOM-INSTRUCTIONS.txt`](../settings/CUSTOM-INSTRUCTIONS.txt).

The global contract should make ChatGPT:

- lead with outcomes;
- avoid filler and fake praise;
- ask only consequential questions;
- verify current and high-stakes claims;
- finish implementation when asked;
- test interactive and visual work;
- teach one layer and one question at a time;
- preserve necessary detail even when concise.

Do not place every coding, writing, research, and presentation rule in global Custom Instructions. That creates a long contradictory prompt. Put subject behavior in Projects, custom GPTs, or skills.

### Memory and Projects

Enable saved memories and chat-history reference for continuity. Store durable preferences and long-term constraints, not temporary task data. Use Temporary Chat for sensitive or isolated work.

Create Projects for:

- Books
- Coding and Websites
- School
- Games
- Business

Use project-only memory when a project's assumptions should not leak into unrelated work. Put stable project files, style guides, world bibles, repository rules, and rubrics inside the corresponding Project.

### Apps

Connect only trusted apps that are materially useful. GitHub supports repository workflows; Google Drive supports school and writing files; Canva supports Canva-native design; Sites supports hosted websites and tools. Review permissions because invoked apps can receive relevant conversation or memory context.

## Model and reasoning selection

### Sol

Use Sol for complex open-ended work that needs judgment, research, difficult coding, computer use, architecture, or polished artifacts.

- Medium: strong default.
- High: hard multi-step work.
- Extra High: demanding architecture, game builds, or major synthesis.
- Max: the hardest single quality-first problem; not a global default.

### Terra

Use Terra as the everyday workhorse for ordinary school tasks, documents, analysis, and focused coding when Sol's full depth is unnecessary.

### Luna

Use Luna for clear repeatable tasks with an obvious success condition: extraction, classification, transformation, tagging, and structured summaries.

### Ultra

Ultra is for tasks that divide into independent workstreams. It is not simply “smarter mode,” and most tasks do not need it.

The governing rule is simple: use the lowest-cost configuration that passes representative checks. Increase reasoning because measured quality improves, not because the task feels important.

## The ideal prompt architecture

For substantial work:

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

Use absolute words such as “always” and “never” only for real invariants. For judgment calls, give a decision rule. “Search when facts may have changed” is more useful than “always browse.”

## Subject configurations

### Coding and apps

- Model: Sol High; Extra High for architecture.
- Tone: Efficient with Candid review.
- Skills: Repo Doctor, GitHub, Sites where applicable, Visual Quality Inspector.
- Custom GPT: Naano Code.
- Completion: actual implementation plus tests, type-check, build, smoke flow, and rendered UI inspection.

### Browser games

- Model: Sol Extra High.
- Skills: Browser Game Builder, Asset Integrator, Play-test, Performance Optimizer, Visual Quality Inspector, Repo Doctor.
- Custom GPT: Naano Games.
- Completion: play the core loop, test major states, inspect visuals, and measure practical performance. “It builds” is not “it was play-tested.”

### Books

- Model: Sol High.
- Skills: Write Exceptional Books plus Humanize Writing.
- Custom GPT: Naano Books.
- Completion: continuity, character psychology, scene turns, consequences, tension, voice, and natural prose—not generic polish.

### Research

- Model: Sol High; Max for hardest synthesis.
- Tone: Professional with Candid conclusion.
- Skills: official documentation skills, web research, PDF, Documents.
- Custom GPT: Naano Research.
- Completion: primary sources, claim-level citations, date accuracy, conflict handling, and labeled inference.

### Presentations

- Model: Sol High.
- Tone: Professional.
- Skills: Presentations; Canva Branded Presentation when the brand kit is central; image/chart skills only when they improve comprehension.
- Custom GPT: Naano Slides.
- Completion: actual deck, rendered slide inspection, narrative coherence, readable visuals, and sources.

### Studying

- Model: Terra Medium; Sol High for hard STEM.
- Tone: Friendly teacher with Candid correction.
- Skill: Adaptive Study Director.
- Custom GPT: Naano Study.
- Completion: diagnostic, layered teaching, retrieval, teach-back, transfer, and mastery check.

### Data

- Model: Terra Medium; Sol High for modeling.
- Tone: Efficient.
- Skills: Spreadsheets, Answers Charts, Visualize for adjustable exploration.
- Custom GPT: Naano Data.
- Completion: recalculated formulas, reconciled totals, valid units, correct chart ranges, and documented assumptions.

### Documents and PDFs

- Model: Terra Medium; Sol High for major reports.
- Tone: Professional.
- Skills: Documents, PDF, Library.
- Custom GPT: Naano Documents.
- Completion: rendered page-by-page inspection and a clean final artifact.

### Visual work

- Model: Sol Medium/High.
- Tone: Quirky for ideation; Candid for critique.
- Skills: Imagegen, Visual Quality Inspector, Canva, Answers Images.
- Custom GPT: Naano Visual.
- Rule: do not use generated images for precise numeric charts or technical diagrams.

### Business

- Model: Sol High.
- Tone: Candid.
- Skills: Crown, research, Sites, Spreadsheets.
- Custom GPT: Naano Venture.
- Completion: evidence, offer, price, reachable customer, manual revenue test, success threshold, and kill criteria.

## Skills strategy

Do not create a new skill for every noun. Existing specialist skills already cover most production work. A useful stack has:

- one lead skill;
- support skills with distinct capabilities;
- one or two verification skills.

This kit adds only two reusable gaps:

1. **Benchmark Lab** — empirical prompt/model testing with repeated runs, graders, raw results, and claim boundaries.
2. **Adaptive Study Director** — teacher-led layered instruction with diagnosis, retrieval, teach-back, and mastery tracking.

Create another permanent skill only when the workflow repeats across projects, contains non-obvious procedure, is not covered by existing skills, and saves more errors or context than it costs.

## Final operating principle

Give GPT-5.6 a destination, not a motivational speech. Supply the evidence and constraints that change the result. Define what must be true before stopping. Let the model choose an efficient path, then require the work to prove itself through tests, citations, rendered inspection, or real interaction.

