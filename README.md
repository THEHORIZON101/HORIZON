# Archemidy

> **Calculate what your rules will do before they affect people.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_Archemidy-264A9B?style=for-the-badge)](https://archemidy.danielodeyemi27.chatgpt.site)
[![Tests](https://img.shields.io/badge/tests-5%2C000_randomized_checks-19734C?style=for-the-badge)](#verified-results)
[![License](https://img.shields.io/badge/license-MIT-172B55?style=for-the-badge)](LICENSE)

![Archemidy project thumbnail](public/project-thumbnail.png)

Archemidy began with a personal question: how can we know whether software built by AI actually does what a person asked? That led to a broader discovery. Policies, competitions, and eligibility systems have the same problem: every sentence can look reasonable by itself while the complete rule set creates an outcome nobody intended.

Archemidy checks those combined consequences. It finds contradictions and uncovered cases, returns a concrete example, counts exactly how many bounded profiles are affected, proposes the smallest candidate repair, and verifies the repaired model again.

The project was built for the **ReverieHacks Software Development track**.

## Why it exists

Rules can look reasonable one sentence at a time and still create harmful results when combined. Ordinary testing checks a handful of examples. Brute-force simulation becomes impractical when several variables produce billions of combinations.

Archemidy avoids generating every person individually. It groups values that are guaranteed to behave identically under the approved predicates, evaluates one representative from each group, and preserves the group's exact weight.

## Verified results

The included benchmark is reproduced by the test suite:

| Result | Verified value |
|---|---:|
| Raw bounded universe | 10,790,021,580 profiles |
| Feasible universe | 4,565,009,130 profiles |
| Profiles affected by the conflict | 112,050,000 |
| Feasible symbolic regions | 480 |
| Cells evaluated by the conflict pass | 800 |
| Repair | One limit changed from $30,000 to $75,000 |
| Conflicts after repair | 0 |
| Random symbolic-vs-brute-force checks | 5,000 / 5,000 passed |
| Shortest software failure | 4 actions; 8 states explored |

These are exact results **inside the declared bounded model**. Archemidy does not claim to prove the whole real world.

## The demonstration

Archemidy audits the ReverieHacks instructions themselves:

- The website presents ReverieHacks as a high-school hackathon, while the published rules allow students ages 13–27 and contain no project-start or prior-work disclosure requirement.
- Concrete witness: a 26-year-old graduate student entering alone with a mature project built three years earlier passes every eligibility check that is actually published.
- This does not claim the organizers intended that outcome. It proves the published rules do not currently prevent it.
- The website and Devpost deadline wording can classify the same Houston submission differently.
- The Software Development track declares four required files but lists three.
- The ML & Prompt Engineering track declares four required files but lists three.

The suggested repair is to define the intended participant division and either require projects to begin during the hacking period or require prior-work disclosure and judge only work created during the event.

The same engine also demonstrates software-behavior analysis by finding the shortest sequence that ships a cancelled order:

```text
Create order → Pay → Cancel → Ship
```

## How it works

```text
Human rules
    ↓
AI transcription into a structured draft
    ↓
Human-visible model and bounds
    ↓
Deterministic symbolic partitioning
    ↓
Exact conflict count + concrete witness
    ↓
Minimum candidate repair
    ↓
Full deterministic recheck
```

AI has a deliberately narrow role. It does **not** decide whether a rule is correct, count affected profiles, choose the final repair, or declare a proof. Those operations are performed by deterministic code in [`lib/engine.mjs`](lib/engine.mjs).

## Run locally

### Requirements

- Node.js 22.13 or later
- npm
- Linux-compatible shell scripts for the current build pipeline
- Optional: an OpenAI API key for natural-language rule transcription

### Installation

```bash
git clone --branch archemidy --single-branch https://github.com/UMBR-A/GPT5.6.git Archemidy
cd Archemidy
npm ci
```

Create `.env.local` only if you want to use the rule-reading input:

```bash
cp .env.example .env.local
```

Then place your key in `.env.local`:

```text
OPENAI_API_KEY=your_key_here
```

The deterministic demonstrations and tests work without an API key.

### Development

```bash
npm run dev
```

Open the local URL printed by the development server.

### Tests

```bash
npm test
```

The test command checks the exact population benchmark, the ReverieHacks audit, the shortest software-breaking path, 5,000 randomized differential cases, the production build, and the rendered application shell.

## Project structure

| Path | Purpose |
|---|---|
| `app/page.tsx` | Main product interface and demonstrations |
| `app/api/extract/route.ts` | Narrow AI transcription endpoint |
| `lib/engine.mjs` | Deterministic symbolic/counting/search engine |
| `tests/engine.test.mjs` | Exact benchmarks and randomized verification |
| `tests/rendered-html.test.mjs` | Production-render smoke test |
| `public/` | Brand and demonstration assets |
| `docs/PROJECT_DOCUMENTATION.md` | Full technical and user documentation |

## Documentation

- [Complete project documentation](docs/PROJECT_DOCUMENTATION.md)
- [Submission checklist](SUBMISSION_CHECKLIST.md)

## Technology

- TypeScript and JavaScript
- React 19 and Next.js 16
- Vinext/Vite deployment pipeline
- Cloudflare Workers runtime
- Node's built-in test runner
- OpenAI Responses API for optional structured transcription

## Security and privacy

- API keys remain server-side and are excluded from Git.
- Rule input is capped at 12,000 characters.
- AI output is constrained by a strict JSON schema and a 1,200-token limit.
- The AI response is labeled as a draft, not a proof.
- Exact decisions and counts come from deterministic functions.

## Limitations

- Exactness is limited to the variables, domains, predicates, and feasibility constraints in the approved model.
- Complicated cross-variable rules can create many symbolic regions.
- Natural-language transcription can be incomplete or wrong and must be reviewed.
- Minimum repair means minimum only within the supplied candidate-edit set.
- The current benchmark uses a purpose-built symbolic partitioner; SMT and BDD backends are future extensions.

## License

Released under the [MIT License](LICENSE).
