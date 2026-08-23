# Archemidy Project Documentation

## 1. Project overview

**Project:** Archemidy  
**Track:** ReverieHacks — Software Development  
**Live application:** <https://archemidy.danielodeyemi27.chatgpt.site>  
**Tagline:** Calculate what your rules will do before they affect people.

Archemidy began with a question about AI-built software: how can a person prove that the program they received actually follows what they asked for? The same hidden problem exists in policies and competitions. Rules are usually reviewed one sentence at a time, but people experience the whole system at once. A complete rule set can therefore create contradictions, uncovered cases, or unintended outcomes even when every sentence sounds reasonable alone.

Archemidy is a web application that analyzes those combined consequences before the rules are applied. It identifies disagreements and uncovered cases, produces an exact counterexample, calculates the number of affected profiles in a bounded model, proposes the smallest candidate repair, and reruns the analysis to verify whether the repair removes the conflict.

The central idea is simple: a policy should be tested before a real person loses a benefit, misses a deadline, or receives a different decision because two instructions disagree.

## 2. The problem

Organizations publish rules in websites, forms, policy documents, and software. These rules are often written by different people and updated at different times. Each sentence may appear sensible, but the combined system can still contain contradictory deadlines, eligibility cliffs, missing cases, impossible requirements, exception conflicts, unequal decisions, or software action sequences that violate the original requirements.

Manual review is slow and usually tests only a few obvious examples. Generating every possible profile is also impractical: a small set of variables can produce billions or trillions of combinations.

## 3. Target audience

Archemidy is designed for government and civic-policy teams, schools and scholarship programs, hackathon organizers, benefits administrators, compliance teams, developers validating AI-generated software, and anyone responsible for rules that can affect people.

## 4. Main features

### 4.1 Rule transcription

Users can paste natural-language policy or software requirements. An optional AI layer converts the words into a structured draft containing variables, domains, clauses, operators, values, and ambiguities.

The AI is a transcriber, not a judge. It is explicitly instructed not to decide whether the rules conflict, calculate affected populations, invent missing values, propose a final repair, or claim that anything has been proven.

### 4.2 Symbolic population analysis

The deterministic engine partitions each finite domain according to the predicates that can change a rule's answer. Values with the same predicate signature are grouped into a symbolic region.

For predicates p₁, p₂, …, pₖ that depend on a value x, the signature is:

```text
σ(x) = (p₁(x), p₂(x), …, pₖ(x))
```

Two values with the same signature are indistinguishable to every included predicate. One representative can therefore be evaluated for the whole region, while the region's weight preserves the exact number of concrete values it represents.

### 4.3 Exact affected-population counting

The population model is the Cartesian product of the symbolic regions. For a condition P, the exact count is the sum of the weights of all symbolic cells where P is true:

```text
N(P) = Σ 1[P(representatives)] × product(region weights)
```

This is not sampling or clustering. It is exact within the declared finite model because the truth value of every included predicate is constant inside each region.

### 4.4 Concrete witnesses

When two rules disagree, Archemidy returns one exact profile demonstrating the disagreement. A witness turns an abstract result into a case a human can inspect and reproduce.

### 4.5 Minimum candidate repair

Candidate repairs are ranked lexicographically by remaining conflicts, number of changed constants, and numerical distance from the original value. The repair is then rechecked against the complete bounded feasible model.

### 4.6 Shortest software-failure search

For software requirements, Archemidy represents the application as states, actions, and invariants. Breadth-first search explores reachable states in increasing action depth. With equal action costs, the first failure returned is guaranteed to use the fewest actions.

The included example finds:

```text
Create order → Pay → Cancel → Ship
```

This violates the invariant: **A cancelled order may not be shipped.**

### 4.7 Downloadable evidence

The interface provides judge-readable evidence cards with the conflicting clauses, witness, proof statement, and suggested repair.

## 5. Verified benchmark

| Variable | Domain size | Domain |
|---|---:|---|
| Income | 166,667 | $0–$166,666 inclusive |
| Age | 83 | 0–82 inclusive |
| Household size | 13 | 1–13 inclusive |
| Region | 5 | Five named categories |
| Status | 12 | Twelve category values |

The raw bounded universe is:

```text
166,667 × 83 × 13 × 5 × 12 = 10,790,021,580 profiles
```

Feasibility requires household size to be at most 11 and status to be below 6:

```text
166,667 × 83 × 11 × 5 × 6 = 4,565,009,130 feasible profiles
```

The reference rule allows a one-person household up to $75,000. The candidate rule allows only $30,000. The disagreement interval contains 45,000 income values:

```text
$30,001 through $75,000 inclusive
45,000 × 83 × 1 × 5 × 6 = 112,050,000 affected profiles
```

The feasible model is represented by 480 symbolic regions. The conflict pass evaluates 800 symbolic cells. These figures describe different stages: 480 is the feasible symbolic model, while 800 is the pre-feasibility Cartesian product visited by the counter.

The minimum tested repair changes the one-person limit from $30,000 to $75,000. Archemidy rechecks all 4,565,009,130 feasible profiles and reports zero remaining conflicts.

## 6. ReverieHacks demonstration

The primary demonstration analyzes the event's own instructions.

### Competition-integrity gap

- The official website describes ReverieHacks as the “largest virtual high school hackathon.”
- The official Devpost rules say any student ages 13–27 may enter in teams of one to three.
- The published rules do not state that projects must begin during the hacking period.
- The published rules do not require entrants to disclose prior work.
- Exact witness: a 26-year-old graduate student, entering alone and not as a company, submits a mature software project built in 2023 with a repository, demo video, and documentation.
- Deterministic result: the witness passes all four published eligibility checks; no published clause in the modeled rules rejects the project because of its age.

This could place mature pre-existing work beside a project a 13-year-old created during the event, potentially affecting eligibility, rankings, prizes, and internships. Archemidy is **not** claiming the organizers intended to allow this. It proves that the published rules do not currently prevent it.

Suggested repair:

1. Define whether the event is high-school-only or open to all students ages 13–27, possibly using separate divisions.
2. Require projects to begin during the hacking period, or require prior-work disclosure and judge only the work created during the event.

### Supporting finding: deadline conflict

- Website wording: August 24 at 11:59 p.m. local time.
- Devpost wording: August 24 at 12:00 a.m. CDT.
- Witness: a Houston participant submits on August 24, 2026 at 10:00 a.m. CDT.
- Website result: on time.
- Devpost result: late.

### Supporting findings: required-file mismatches

- Software Development declares four required files but names three.
- ML & Prompt Engineering declares four required files but names three.

This demonstration was selected because it requires no specialist knowledge. One concrete entrant shows the consequence of a missing safeguard; one concrete submission shows the deadline contradiction.

## 7. System architecture

### Front end

- `app/page.tsx` renders the landing page, analysis demonstrations, witness cards, repair interaction, and downloadable evidence.
- `app/globals.css` contains the responsive visual system.
- `public/` contains the brand and demonstration illustrations.

### Deterministic engine

- `partitionInteger()` creates adjacent integer regions with identical predicate signatures.
- `partitionCategorical()` groups categorical members with identical signatures.
- `countRegions()` performs exact weighted counting.
- `findMinimumRepair()` evaluates and ranks candidate edits.
- `analyzePopulationBenchmark()` reproduces the population model.
- `analyzeReverie()` produces the hackathon-rule findings.
- `findBehaviorViolation()` uses breadth-first search.
- `runRandomizedVerification()` compares symbolic and brute-force answers.

### Optional AI route

`app/api/extract/route.ts` uses the OpenAI Responses API with model `gpt-5-mini`, strict JSON Schema output, a 12,000-character input limit, a 1,200-token output limit, and an instruction limiting the model to transcription. The API key is read only on the server from `OPENAI_API_KEY`.

## 8. Installation and configuration

### Requirements

- Node.js 22.13 or later
- npm
- A Linux-compatible environment for the included bounded shell scripts

### Install

```bash
git clone --branch archemidy --single-branch https://github.com/UMBR-A/GPT5.6.git Archemidy
cd Archemidy
npm ci
```

### Optional API configuration

```bash
cp .env.example .env.local
```

Then set:

```text
OPENAI_API_KEY=your_key_here
```

Never commit `.env.local` or an API key.

### Commands

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # start production build
npm test         # complete verification
```

## 9. User manual

### Run a prepared demonstration

1. Open the live application.
2. Select hackathon rules, population rules, or software behavior.
3. Read the plain-language finding.
4. Open the evidence to inspect the clauses and witness.
5. Select the repair action where available.
6. Run **Prove the fix** to perform the deterministic recheck.
7. Download the evidence if needed.

### Transcribe new rules

1. Paste at least one complete rule into the input.
2. Keep the input below 12,000 characters.
3. Run the rule reader.
4. Review every extracted variable, bound, clause, value, and ambiguity.
5. Treat the result as a draft until a compatible deterministic model has been approved and run.

## 10. Testing methodology

### Fixed regression tests

The suite asserts the exact population universes, affected count, region count, repair, zero-conflict recheck, the competition-integrity witness, supporting ReverieHacks findings, and the four-action shortest software path.

### Randomized differential testing

For 5,000 generated small models, Archemidy calculates the satisfying count in two independent ways: symbolic partitioning and direct enumeration. Every result must match. This catches off-by-one boundaries, incorrect weights, and partitioning mistakes.

### Rendered application test

After the production build, the suite loads the generated worker, requests the page, and checks the status, content type, product title, and main tagline.

## 11. Security, privacy, and reliability

- Environment files and keys are ignored by Git.
- The AI endpoint rejects undersized and oversized requests.
- AI output must match a strict structured schema.
- API errors return safe messages without exposing credentials.
- Deterministic calculations use `BigInt` for large exact counts.
- The product labels AI output as transcription only.
- Randomized verification uses a fixed seed and is reproducible.

## 12. Limitations

1. A proof covers only the declared bounded variables, domains, predicates, and feasibility constraints.
2. An incomplete model can omit important real-world conditions even when its internal calculation is correct.
3. Natural-language transcription can misunderstand ambiguous wording and requires human review.
4. Symbolic region products can grow rapidly when many predicates interact.
5. Minimum repair is minimum only within the supplied candidate changes.
6. General SMT solving and decision-diagram backends are future work, not current features.

## 13. Future development

- editable visual rule graphs;
- automatic regression-test export;
- richer policy-language compiler;
- SMT and decision-diagram backends;
- model complexity reporting;
- signed analysis reports; and
- collaborative rule-review histories.

## 14. References and conceptual foundations

Symbolic model checking and weighted model counting inspired the compression strategy. Breadth-first search provides the shortest-path guarantee for equal-cost actions. Differential testing validates the symbolic implementation against direct enumeration. OpenAI Responses API structured outputs provide the optional transcription interface.

Official demonstration sources: [ReverieHacks website](https://www.reveriehacks.org/), [ReverieHacks Devpost overview](https://reverie-hacks-2026.devpost.com/), and [published Devpost rules](https://reverie-hacks-2026.devpost.com/rules).

The repository is the authoritative source for all benchmark figures. Future symbolic backends are not described as currently implemented.

## 15. License

Archemidy is released under the MIT License. See `LICENSE`.
