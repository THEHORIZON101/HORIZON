"use client";

import { useMemo, useRef, useState } from "react";
import {
  analyzePopulationBenchmark,
  analyzeReverie,
  findBehaviorViolation,
  formatBigInt,
} from "@/lib/engine.mjs";

type Demo = "reverie" | "benchmark" | "behavior";
type Stage = "home" | "review" | "analyzing" | "results";
type RuleDraft = {
  accepted: boolean;
  title: string;
  mode: "policy" | "software" | "unknown";
  variables: Array<{ name: string; type: string; domainText: string }>;
  clauses: Array<{ sourceQuote: string; plainMeaning: string; variable: string; operator: string; valueText: string }>;
  ambiguities: Array<{ sourceQuote: string; reason: string }>;
};

type IconName = "arrow-right" | "arrow-up-right" | "chevron-down" | "download" | "plus";

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {name === "arrow-right" && <><path d="M4 12h15" /><path d="m14 7 5 5-5 5" /></>}
      {name === "arrow-up-right" && <><path d="M6 18 18 6" /><path d="M9 6h9v9" /></>}
      {name === "chevron-down" && <path d="m7 10 5 5 5-5" />}
      {name === "download" && <><path d="M12 4v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M5 20h14" /></>}
      {name === "plus" && <><path d="M12 5v14" /><path d="M5 12h14" /></>}
    </svg>
  );
}

const demoCopy = {
  reverie: {
    eyebrow: "REAL EXAMPLE",
    name: "Check this hackathon’s rules",
    description: "See whether its website and Devpost instructions agree.",
    mode: "Rules for people",
    image: "/demo-audit.png",
  },
  benchmark: {
    eyebrow: "BILLIONS OF CASES",
    name: "Check 10.79 billion people",
    description: "See how Archemidy checks a massive set without guessing.",
    mode: "Rules for people",
    image: "/demo-population.png",
  },
  behavior: {
    eyebrow: "FIND THE FIRST BREAK",
    name: "Find how an order breaks",
    description: "Find the fewest actions needed to make the app break a rule.",
    mode: "Rules for software",
    image: "/demo-behavior.png",
  },
};

const reviewData = {
  reverie: {
    source: "ReverieHacks 2026 · Website + Devpost",
    clauses: [
      "August 24 at 11:59 p.m. local time",
      "August 24 at 12:00 a.m. CDT",
      "Software Development requires 4 files: Code repository, Demo video, Documentation",
      "ML Prompt Engineering requires 4 files: ML workflow, Samples, Documentation",
    ],
    variables: [
      ["When it is submitted", "Date and time", "Aug 23–25, 2026"],
      ["Where the entrant is", "Location", "Every timezone"],
      ["Which track", "Choice", "6 tracks"],
      ["Files turned in", "List", "Named files"],
    ],
  },
  benchmark: {
    source: "Verified eligibility benchmark · Structured policy",
    clauses: [
      "Income is bounded from $0 through $166,666.",
      "Household size must be 11 or fewer to be feasible.",
      "Six of twelve applicant statuses are feasible.",
      "Interpretations disagree for one-person households earning $30,001–$75,000.",
    ],
    variables: [
      ["Income", "Whole number", "$0–$166,666"],
      ["Age", "Whole number", "0–82"],
      ["Household size", "Whole number", "1–13"],
      ["Region", "Choice", "5 regions"],
      ["Applicant status", "Choice", "12 statuses"],
    ],
  },
  behavior: {
    source: "Order workflow · Structured specification",
    clauses: [
      "A cancelled order must never ship.",
      "An order cannot be refunded more than once.",
      "A shipped order must have been paid.",
      "Actions: Create order, Pay, Cancel, Ship, Refund.",
    ],
    variables: [
      ["Order created", "Yes or no", "No / Yes"],
      ["Order paid", "Yes or no", "No / Yes"],
      ["Order cancelled", "Yes or no", "No / Yes"],
      ["Order shipped", "Yes or no", "No / Yes"],
      ["Number of refunds", "Whole number", "0–2"],
    ],
  },
};

const analysisSteps = [
  "Reading every possible case",
  "Removing cases that cannot happen",
  "Grouping cases that behave the same",
  "Checking where the rules disagree",
  "Finding the clearest example",
  "Counting everyone affected",
];

function Logo() {
  return (
    <div className="brand" aria-label="Archemidy">
      <span className="brand-mark" aria-hidden="true"><img src="/archemidy-mark.png" alt="" /></span>
      <span>Archemidy</span>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("home");
  const [demo, setDemo] = useState<Demo>("reverie");
  const [mode, setMode] = useState<"policy" | "behavior">("policy");
  const [selectedFinding, setSelectedFinding] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showReplay, setShowReplay] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [ruleDraft, setRuleDraft] = useState<RuleDraft | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reverie = useMemo(() => analyzeReverie(), []);
  const benchmark = useMemo(() => analyzePopulationBenchmark(), []);
  const behavior = useMemo(() => findBehaviorViolation(), []);

  const chooseDemo = (choice: Demo) => {
    setDemo(choice);
    setMode(choice === "behavior" ? "behavior" : "policy");
    setSelectedFinding(0);
    setShowReplay(false);
    setShowMath(false);
    setStage("review");
  };

  const analyze = () => {
    setAnalysisStep(0);
    setStage("analyzing");
    let step = 0;
    timerRef.current = setInterval(() => {
      step += 1;
      if (step >= analysisSteps.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStage("results");
      } else {
        setAnalysisStep(step);
      }
    }, 340);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("home");
    setShowMath(false);
    setShowReplay(false);
  };

  const extractRules = async () => {
    if (sourceText.trim().length < 20 || extracting) return;
    setExtracting(true);
    setExtractError("");
    setRuleDraft(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The rule reader could not complete this request.");
      setRuleDraft(payload.draft);
    } catch (error) {
      setExtractError(error instanceof Error ? error.message : "The rule reader could not complete this request.");
    } finally {
      setExtracting(false);
    }
  };

  const download = (kind: "json" | "markdown") => {
    let content = "";
    let type = "application/json";
    let filename = "archemidy-regression.json";
    if (demo === "behavior") {
      content = JSON.stringify({
        finding: "cancelled-order-ships",
        initialState: behavior.states[0],
        actions: behavior.actions,
        expectedInvariant: "cancelled implies not shipped",
        forbiddenFinalState: behavior.state,
      }, null, 2);
    } else if (demo === "benchmark") {
      content = JSON.stringify({
        finding: "eligibility-interpretation-disagreement",
        proofStatus: benchmark.proofStatus,
        witness: benchmark.witness,
        rawUniverse: benchmark.rawUniverse.toString(),
        feasibleUniverse: benchmark.feasibleUniverse.toString(),
        affectedProfiles: benchmark.affectedProfiles.toString(),
        symbolicRegions: benchmark.symbolicRegions.toString(),
        expected: "Both interpretations return the same eligibility outcome",
      }, null, 2);
    } else {
      const finding = reverie.findings[selectedFinding] ?? reverie.findings[0];
      content = JSON.stringify({
        finding: finding.id,
        proofStatus: finding.type,
        witness: Object.fromEntries(finding.witness),
        expected: "Both official interpretations return the same outcome",
        sourceClauses: [finding.clauseA, finding.clauseB],
      }, null, 2);
    }
    if (kind === "markdown") {
      type = "text/markdown";
      filename = "archemidy-audit.md";
      const resultTitle = demo === "behavior" ? behavior.violation : demo === "benchmark" ? `${formatBigInt(benchmark.affectedProfiles)} affected profiles` : reverie.title;
      const witnessText = demo === "behavior"
        ? behavior.actions.map((action, index) => `${index + 1}. ${action}`).join("\n")
        : demo === "benchmark"
          ? Object.entries(benchmark.witness).map(([key, value]) => `- **${key}:** ${value}`).join("\n")
          : reverie.findings[selectedFinding].witness.map(([key, value]) => `- **${key}:** ${value}`).join("\n");
      content = `# Archemidy audit\n\n## Result\n${resultTitle}\n\n## Proof status\nExact within the declared bounded model.\n\n## Witness\n${witnessText}\n`;
    }
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="logo-button" onClick={reset} aria-label="Return to Archemidy home"><Logo /></button>
        <div className="top-status"><span className="status-light" /> Proofs ready <span className="top-divider" /> No guessing</div>
        {stage !== "home" && <button className="quiet-button" onClick={reset}>New audit</button>}
      </header>

      {stage === "home" && (
        <div className="home-layout">
          <section className="intro-panel">
            <p className="overline">CHECK YOUR RULES BEFORE THEY GO LIVE</p>
            <h1>Calculate what your rules will do <em>before</em> they affect people.</h1>
            <p className="intro-copy">Give Archemidy the rules. It checks every meaningful case, finds what could go wrong, and shows you one clear example that proves it.</p>

            <div className="simple-steps" aria-label="How Archemidy works">
              <span><b>1</b> Add the rules</span>
              <span><b>2</b> Let Archemidy check them</span>
              <span><b>3</b> See what breaks</span>
            </div>

            <div className="mode-switch" role="tablist" aria-label="Analysis mode">
              <button className={mode === "policy" ? "active" : ""} onClick={() => setMode("policy")} role="tab" aria-selected={mode === "policy"}>Rules for people</button>
              <button className={mode === "behavior" ? "active" : ""} onClick={() => setMode("behavior")} role="tab" aria-selected={mode === "behavior"}>Rules for software</button>
            </div>

            <div className="source-box">
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder={mode === "policy" ? "Paste rules here, then review exactly what Archemidy understood." : "Paste app requirements here, then review exactly what Archemidy understood."}
                aria-label="Rule source"
              />
              <div className="source-actions">
                <span><b><Icon name="plus" size={15} /></b> {sourceText.length.toLocaleString()} / 12,000 characters</span>
                <button disabled={sourceText.trim().length < 20 || extracting} onClick={extractRules}><span>{extracting ? "Reading…" : "Read these rules"}</span>{!extracting && <Icon name="arrow-right" />}</button>
              </div>
            </div>
            <p className="api-note">AI only copies the words into a rule draft. You approve it before deterministic checking begins.</p>
            {extractError && <div className="extract-error">{extractError}</div>}
            {ruleDraft && (
              <div className="extraction-card">
                <div><span>RULE DRAFT · REVIEW REQUIRED</span><strong>{ruleDraft.accepted ? ruleDraft.title : "This does not look like a rule set."}</strong></div>
                <div className="extraction-counts"><span><b>{ruleDraft.clauses.length}</b> clauses</span><span><b>{ruleDraft.variables.length}</b> variables</span><span><b>{ruleDraft.ambiguities.length}</b> unclear parts</span></div>
                <p>Nothing has been proven yet. The AI stopped after transcription, exactly as designed.</p>
              </div>
            )}
          </section>

          <aside className="demo-panel">
            <div className="panel-heading"><span>Run a verified demonstration</span><span>{mode === "policy" ? "02" : "01"}</span></div>
            {(Object.keys(demoCopy) as Demo[]).filter((key) => mode === "behavior" ? key === "behavior" : key !== "behavior").map((key) => (
              <button key={key} className="demo-row" onClick={() => chooseDemo(key)}>
                <span className="demo-icon"><img src={demoCopy[key].image} alt="" /></span>
                <span className="demo-text"><small>{demoCopy[key].eyebrow}</small><strong>{demoCopy[key].name}</strong><span>{demoCopy[key].description}</span></span>
                <span className="arrow"><Icon name="arrow-up-right" /></span>
              </button>
            ))}
            {mode === "policy" && (
              <div className="scale-proof">
              <div className="scale-number">{formatBigInt(benchmark.rawUniverse)}</div>
                <div><span className="pulse-dot" /> possible people checked as <b>{formatBigInt(benchmark.symbolicRegions)}</b> groups that behave the same</div>
              </div>
            )}
          </aside>
        </div>
      )}

      {stage === "review" && (
        <section className="workspace-screen">
          <div className="screen-heading">
            <div><p className="overline">STEP 1 OF 2 · CHECK WHAT WE FOUND</p><h2>Do these look like the rules you meant?</h2></div>
            <button className="primary-button" onClick={analyze}>{demo === "behavior" ? "Try to break this app" : "Check these rules"}<Icon name="arrow-right" /></button>
          </div>
          <div className="review-grid">
            <article className="source-document">
              <div className="document-heading"><span>Original words</span><small>{reviewData[demo].source}</small></div>
              <div className="document-body">
                {reviewData[demo].clauses.map((clause, index) => (
                  <button key={clause} className="clause"><span>{String(index + 1).padStart(2, "0")}</span><p>{clause}</p></button>
                ))}
              </div>
              <div className="document-foot">Every problem links back to the exact words that caused it.</div>
            </article>
            <article className="model-document">
              <div className="document-heading"><span>What Archemidy understood</span><small><span className="confirmed-dot" /> Checked by a person</small></div>
              <div className="model-list">
                {reviewData[demo].variables.map(([name, type, domain]) => (
                  <div className="model-row" key={name}>
                    <div><strong>{name}</strong><span>{type}</span></div>
                    <button>{domain}<Icon name="chevron-down" size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="validation"><span>✓</span><div><strong>Ready to check</strong><p>Every value has a clear limit, so the result can be proven.</p></div></div>
            </article>
          </div>
        </section>
      )}

      {stage === "analyzing" && (
        <section className="analysis-screen" aria-live="polite">
          <div className="analysis-graphic" aria-hidden="true">
            <img className="checking-art" src="/checking-rules.png" alt="" />
          </div>
          <p className="overline">CHECKING THE RULES</p>
          <h2>{analysisSteps[analysisStep]}</h2>
          <div className="progress-track"><span style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }} /></div>
          <div className="analysis-numbers">
            <span>{demo === "benchmark" ? formatBigInt(benchmark.rawUniverse) : demo === "behavior" ? `${behavior.explored} reachable states` : "2 official sources"}</span>
            <small>{demo === "behavior" ? "Trying the shortest action sequences first" : "Checking groups instead of people one by one"}</small>
          </div>
        </section>
      )}

      {stage === "results" && demo === "reverie" && (
        <section className="workspace-screen results-screen">
          <div className="result-heading">
            <div><p className="overline"><span className="critical-dot" /> PROBLEM PROVEN</p><h1>{reverie.title}</h1><p>{reverie.summary}</p></div>
            <button className="quiet-button download-button" onClick={() => download("markdown")}><Icon name="download" />Download report</button>
          </div>
          <div className="metric-strip">
            <Metric label="Pages checked" value="2" detail="Both official" />
            <Metric label="Rules that conflict" value="1" detail="Problem proven" />
            <Metric label="Unclear instructions" value="2" detail="One file unnamed" />
            <Metric label="Confidence" value="Proven" detail="No guessing" />
          </div>
          <div className="findings-grid">
            <div className="finding-list">
              <div className="section-label"><span>Problems found</span><span>{reverie.findings.length}</span></div>
              {reverie.findings.map((finding, index) => (
                <button key={finding.id} className={`finding-row ${selectedFinding === index ? "selected" : ""}`} onClick={() => { setSelectedFinding(index); setShowReplay(false); }}>
                  <span className={`finding-symbol ${finding.severity}`}>{finding.severity === "critical" ? "!" : "?"}</span>
                  <span><small>{finding.type}</small><strong>{finding.title}</strong><p>{finding.summary}</p></span>
                  <span className="row-arrow"><Icon name="arrow-right" /></span>
                </button>
              ))}
            </div>
            <FindingEvidence finding={reverie.findings[selectedFinding]} showReplay={showReplay} setShowReplay={setShowReplay} download={() => download("json")} />
          </div>
          <MathDrawer open={showMath} setOpen={setShowMath} />
        </section>
      )}

      {stage === "results" && demo === "benchmark" && (
        <section className="workspace-screen results-screen">
          <div className="result-heading benchmark-heading">
            <div><p className="overline"><span className="exact-dot" /> EVERY CASE CHECKED</p><h1>{formatBigInt(benchmark.affectedProfiles)} people could get a different answer.</h1><p>Archemidy checked {formatBigInt(benchmark.rawUniverse)} possible people without creating them one by one.</p></div>
            <button className="quiet-button download-button" onClick={() => download("markdown")}><Icon name="download" />Download report</button>
          </div>
          <div className="metric-strip benchmark-metrics">
            <Metric label="Possible people" value={formatBigInt(benchmark.rawUniverse)} detail="Before impossible cases" />
            <Metric label="People who could exist" value={formatBigInt(benchmark.feasibleUniverse)} detail="Impossible cases removed" />
            <Metric label="Groups checked" value={formatBigInt(benchmark.symbolicRegions)} detail="Same behavior in each group" />
            <Metric label="People affected" value={formatBigInt(benchmark.affectedProfiles)} detail="Exact total" />
          </div>
          <div className="benchmark-proof">
            <div className="compression-visual">
              <div className="visual-label"><span>{formatBigInt(benchmark.rawUniverse)} possible people</span><span>{formatBigInt(benchmark.symbolicRegions)} groups checked</span></div>
              <div className="funnel-lines">{Array.from({ length: 11 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}</div>
              <div className="region-grid">{Array.from({ length: 48 }, (_, index) => <span key={index} className={index >= 12 && index <= 25 ? "affected" : ""} />)}</div>
              <p>Each square stands for many people who are guaranteed to receive the same answer from the rules.</p>
            </div>
            <div className="proof-panel">
              <p className="overline">ONE PERSON WHO PROVES IT</p>
              <h3>This one person gets two different answers.</h3>
              {Object.entries(benchmark.witness).map(([key, value]) => <div className="proof-row" key={key}><span>{key}</span><strong>{String(value)}</strong></div>)}
              <div className="equation"><small>PEOPLE AFFECTED</small><strong>{formatBigInt(benchmark.affectedProfiles)}</strong></div>
              <div className="repair-proof">
                <p className="overline">SMALLEST FIX · PROVEN</p>
                <strong className="repair-change"><span>${benchmark.repair.before.toLocaleString()}</span><Icon name="arrow-right" /><span>${benchmark.repair.after.toLocaleString()}</span></strong>
                <div><span>{formatBigInt(benchmark.repair.recheckedProfiles)} people rechecked</span><b>{formatBigInt(benchmark.repair.remainingConflicts)} conflicts remain</b></div>
              </div>
              <div className="proof-actions"><button className="primary-button" onClick={() => setShowReplay(!showReplay)}>Show why</button><button className="quiet-button" onClick={() => download("json")}>Save as a test</button></div>
            </div>
          </div>
          <MathDrawer open={showMath} setOpen={setShowMath} />
        </section>
      )}

      {stage === "results" && demo === "behavior" && (
        <section className="workspace-screen results-screen">
          <div className="result-heading">
            <div><p className="overline"><span className="critical-dot" /> SHORTEST WAY TO BREAK IT</p><h1>A cancelled order can still be shipped.</h1><p>Archemidy tried every shorter path first. This is the quickest way the app can break its own rule.</p></div>
            <button className="quiet-button download-button" onClick={() => download("markdown")}><Icon name="download" />Download report</button>
          </div>
          <div className="metric-strip">
            <Metric label="Actions until bug" value={String(behavior.actions.length)} detail="The shortest way" />
            <Metric label="App states checked" value={String(behavior.explored)} detail="No repeats" />
            <Metric label="Rules broken" value="1" detail="Cancelled but shipped" />
            <Metric label="Confidence" value="Proven" detail="No shorter path exists" />
          </div>
          <div className="behavior-layout">
            <div className="behavior-sequence">
              <div className="section-label"><span>How to make it happen</span><span>{behavior.actions.length} steps</span></div>
              {behavior.actions.map((action, index) => (
                <div className="action-step" key={`${action}-${index}`}>
                  <span>{index + 1}</span><div><small>Action</small><strong>{action}</strong></div><code>{stateSummary(behavior.states[index + 1])}</code>
                </div>
              ))}
            </div>
            <div className="invariant-panel">
              <p className="overline">RULE THAT WAS BROKEN</p>
              <h3>If an order is cancelled, it must never be shipped.</h3>
              <div className="logic-expression"><span>Cancelled?</span> Yes<br /><span>Shipped?</span> Yes<br /><strong>This should never happen.</strong></div>
              <p>The Ship transition checks whether payment exists, but fails to check whether cancellation already occurred.</p>
              <div className="fix-block"><small>SIMPLE CODE FIX</small><code>allowShip = paid &amp;&amp; !cancelled</code></div>
              <div className="proof-actions"><button className="primary-button" onClick={() => setShowReplay(!showReplay)}>{showReplay ? "Hide steps" : "Show it happen"}</button><button className="quiet-button" onClick={() => download("json")}>Save as a test</button></div>
            </div>
          </div>
          <MathDrawer open={showMath} setOpen={setShowMath} behavior />
        </section>
      )}

      <footer><span>If Archemidy finds a problem, it can show you exactly why.</span><span>Archemidy v0.2</span></footer>
    </main>
  );
}

function FindingEvidence({ finding, showReplay, setShowReplay, download }: { finding: ReturnType<typeof analyzeReverie>["findings"][number]; showReplay: boolean; setShowReplay: (value: boolean) => void; download: () => void }) {
  return (
    <article className="evidence-panel">
      <div className="evidence-top"><span className={`proof-pill ${finding.severity}`}>{finding.type}</span><span>PROBLEM · {finding.id.toUpperCase()}</span></div>
      <h2>{finding.title}</h2>
      <p>{finding.summary}</p>
      <div className="clause-pair"><blockquote><small>WHAT ONE PAGE SAYS</small>{finding.clauseA}</blockquote><blockquote><small>WHAT THE OTHER SAYS</small>{finding.clauseB}</blockquote></div>
      <div className="witness-heading"><span>One example that proves the problem</span><span>Proven</span></div>
      <div className="witness-table">{finding.witness.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      {showReplay && <div className="replay"><span>Website says on time</span><i><Icon name="arrow-right" /></i><span>Same submission</span><i><Icon name="arrow-right" /></i><span>Devpost says late</span></div>}
      <div className="repair"><small>SIMPLE FIX</small><p>{finding.fix}</p></div>
      <div className="proof-actions"><button className="primary-button" onClick={() => setShowReplay(!showReplay)}>{showReplay ? "Hide explanation" : "Show how it happens"}</button><button className="quiet-button" onClick={download}>Save as a test</button></div>
    </article>
  );
}

function MathDrawer({ open, setOpen, behavior = false }: { open: boolean; setOpen: (value: boolean) => void; behavior?: boolean }) {
  return (
    <div className={`math-drawer ${open ? "open" : ""}`}>
      <button onClick={() => setOpen(!open)}><span>See the math behind this result</span><span>{open ? "−" : "+"}</span></button>
      {open && (
        <div className="math-content">
          {behavior ? <><code>I₀(s₀) ∧ T(s₀,a₀,s₁) ∧ … ∧ ¬Q(sₖ)</code><p>Breadth-first search explores the finite reachable state graph by sequence length. The first violation is therefore shortest.</p></> : <><code>V = {'{'}x ∈ D₁ × … × Dₙ | F(x){'}'}</code><code>N = Σᵣ [conflict(r)] · ∏ᵢ weight(rᵢ)</code><p>Values sharing the same truth signature across every predicate are compressed into one weighted region. Impossible profiles are removed before counting.</p></>}
          <span className="exactness-note">HONEST LIMIT · Archemidy only calls a result proven when it checked the entire set you defined.</span>
        </div>
      )}
    </div>
  );
}

function stateSummary(state: Record<string, unknown>) {
  return [state.paid && "paid", state.cancelled && "cancelled", state.shipped && "shipped"].filter(Boolean).join(" · ") || "created";
}
