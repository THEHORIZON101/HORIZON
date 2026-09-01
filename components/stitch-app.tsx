"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bird,
  Check,
  CircleDollarSign,
  Database,
  Download,
  ExternalLink,
  Eye,
  FlaskConical,
  Info,
  Leaf,
  Map as MapIcon,
  MousePointer2,
  Play,
  RotateCcw,
  Route,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  calculateMetrics,
  CELL_ACRES,
  createScenario,
  formatMoney,
  GRID_COLS,
  GRID_ROWS,
  HabitatCell,
  LAND_META,
  LandCover,
  optimizeCorridor,
  runMetapopulationModel,
} from "@/lib/habitat";

const SOURCE_IMAGE =
  "https://www.fws.gov/sites/default/files/styles/max_1300x1300/public/2021-09/Attwater%20Prairie%20Chicken%20Pair%20John%20Magera.jpg?itok=uyt_rMXZ";

const COVER_ORDER: LandCover[] = [
  "core",
  "prairie",
  "pasture",
  "cropland",
  "shrub",
  "road",
  "developed",
  "water",
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SparkChart({
  baseline,
  intervention,
}: {
  baseline: { median: number[]; low: number[]; high: number[] };
  intervention: { median: number[]; low: number[]; high: number[] };
}) {
  const width = 420;
  const height = 150;
  const padX = 14;
  const padY = 15;
  const all = [...baseline.high, ...intervention.high];
  const max = Math.max(80, ...all) * 1.08;
  const x = (index: number) => padX + (index / (baseline.median.length - 1)) * (width - padX * 2);
  const y = (value: number) => height - padY - (value / max) * (height - padY * 2);
  const line = (values: number[]) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(2)},${y(value).toFixed(2)}`).join(" ");
  const band = (low: number[], high: number[]) => {
    const upper = high.map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(2)},${y(value).toFixed(2)}`);
    const lower = [...low]
      .reverse()
      .map((value, reverseIndex) => {
        const index = low.length - 1 - reverseIndex;
        return `L${x(index).toFixed(2)},${y(value).toFixed(2)}`;
      });
    return `${[...upper, ...lower].join(" ")} Z`;
  };

  return (
    <div className="chart-wrap" aria-label="Twenty-year modeled population comparison">
      <div className="chart-key" aria-hidden="true">
        <span><i className="line-key baseline" /> Current landscape</span>
        <span><i className="line-key plan" /> With corridor</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="chart-title chart-desc">
        <title id="chart-title">Modeled population range over twenty years</title>
        <desc id="chart-desc">The corridor scenario has a higher median modeled population and a narrower downside range.</desc>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={padX}
            x2={width - padX}
            y1={padY + fraction * (height - padY * 2)}
            y2={padY + fraction * (height - padY * 2)}
            className="chart-gridline"
          />
        ))}
        <path d={band(baseline.low, baseline.high)} className="risk-band baseline-band" />
        <path d={band(intervention.low, intervention.high)} className="risk-band plan-band" />
        <path d={line(baseline.median)} className="chart-line baseline-line" />
        <path d={line(intervention.median)} className="chart-line plan-line" />
        <text x={padX} y={height - 1} className="chart-label">NOW</text>
        <text x={width - padX} y={height - 1} textAnchor="end" className="chart-label">YEAR 20</text>
      </svg>
    </div>
  );
}

function Metric({
  label,
  before,
  after,
  unit,
  inverse = false,
}: {
  label: string;
  before: number;
  after: number;
  unit?: string;
  inverse?: boolean;
}) {
  const improved = inverse ? after < before : after > before;
  return (
    <div className="metric-row">
      <div>
        <span className="metric-label">{label}</span>
        <span className="metric-before">{before}{unit}</span>
      </div>
      <ArrowRight aria-hidden="true" />
      <strong className={improved ? "improved" : ""}>{after}{unit}</strong>
    </div>
  );
}

function MapCell({
  cell,
  isRestored,
  isPath,
  nextCell,
  active,
  onSelect,
  onInspect,
}: {
  cell: HabitatCell;
  isRestored: boolean;
  isPath: boolean;
  nextCell?: HabitatCell;
  active: boolean;
  onSelect: (cell: HabitatCell) => void;
  onInspect: (cell: HabitatCell) => void;
}) {
  const editable = !cell.protected && cell.cover !== "water" && cell.cover !== "developed";
  const angle = nextCell
    ? (Math.atan2(nextCell.row - cell.row, nextCell.col - cell.col) * 180) / Math.PI
    : 0;
  const diagonal = nextCell && nextCell.row !== cell.row && nextCell.col !== cell.col;
  const style = {
    "--thread-angle": `${angle}deg`,
    "--thread-length": diagonal ? "146%" : "108%",
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className={cx(
        "map-cell",
        `cover-${cell.cover}`,
        isRestored && "is-restored",
        isPath && "is-path",
        active && "is-active",
      )}
      style={style}
      aria-label={`${LAND_META[cell.cover].label}, row ${cell.row + 1}, column ${cell.col + 1}${isRestored ? ", selected for restoration" : ""}`}
      aria-pressed={isRestored}
      onClick={() => editable && onSelect(cell)}
      onFocus={() => onInspect(cell)}
      onMouseEnter={() => onInspect(cell)}
      disabled={!editable}
    >
      {isPath && nextCell ? <span className="stitch-segment" aria-hidden="true" /> : null}
      {isPath ? <span className="stitch-knot" aria-hidden="true" /> : null}
    </button>
  );
}

export function StitchApp() {
  const cells = useMemo(() => createScenario(), []);
  const [budget, setBudget] = useState(2_400_000);
  const [restored, setRestored] = useState<Set<number>>(new Set());
  const [plannedPath, setPlannedPath] = useState<number[]>([]);
  const [inspected, setInspected] = useState<HabitatCell>(cells[7 * GRID_COLS + 8]);
  const [ranModel, setRanModel] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [layer, setLayer] = useState<"cover" | "resistance">("cover");

  const pathPositions = useMemo(() => new Map(plannedPath.map((id, index) => [id, index])), [plannedPath]);
  const baselineMetrics = useMemo(() => calculateMetrics(cells, new Set()), [cells]);
  const planMetrics = useMemo(() => calculateMetrics(cells, restored), [cells, restored]);
  const baselineSimulation = useMemo(() => runMetapopulationModel(cells, new Set()), [cells]);
  const planSimulation = useMemo(() => runMetapopulationModel(cells, restored), [cells, restored]);
  const activeCost = useMemo(
    () => [...restored].reduce((sum, id) => sum + LAND_META[cells[id].cover].restorationCost, 0),
    [cells, restored],
  );
  const hasPlan = restored.size > 0;

  const createPlan = () => {
    const plan = optimizeCorridor(cells, budget);
    setRestored(new Set(plan.restored));
    setPlannedPath(plan.path);
    setRanModel(false);
    if (plan.crossingCell !== null) setInspected(cells[plan.crossingCell]);
  };

  const toggleCell = (cell: HabitatCell) => {
    setRestored((current) => {
      const next = new Set(current);
      if (next.has(cell.id)) next.delete(cell.id);
      else next.add(cell.id);
      return next;
    });
    setRanModel(false);
  };

  const reset = () => {
    setRestored(new Set());
    setPlannedPath([]);
    setRanModel(false);
  };

  const stressTest = () => {
    if (!hasPlan) return;
    setIsRunning(true);
    window.setTimeout(() => {
      setIsRunning(false);
      setRanModel(true);
    }, 520);
  };

  const downloadBrief = () => {
    const text = `# STITCH intervention brief\n\n## Case\nAttwater's prairie-chicken — Texas Gulf coastal prairie\n\n## Proposed screen\n- Budget used: ${formatMoney(activeCost)}\n- Cells treated: ${restored.size}\n- Planning area treated: ${restored.size * CELL_ACRES} acres\n- Connectivity index: ${baselineMetrics.connectivity} → ${planMetrics.connectivity}\n- Local-collapse risk in 400 screening runs: ${baselineSimulation.risk}% → ${planSimulation.risk}%\n- Gene-flow proxy: ${baselineMetrics.geneFlowProxy} → ${planMetrics.geneFlowProxy}\n\n## Interpretation\nThis result is a screening comparison, not a field forecast. It identifies a candidate linkage worth validating with current parcel, vegetation, hydrology, ownership, and species-monitoring data.\n\n## Sources\n- U.S. Fish & Wildlife Service species profile: https://www.fws.gov/species/attwaters-greater-prairie-chicken-tympanuchus-cupido-attwateri\n- USGS habitat distribution model, DOI 10.5066/F77S7M35\n- Texas Parks & Wildlife species profile: https://tpwd.texas.gov/huntwild/wild/species/apc/\n\nGenerated by STITCH. Scenario costs are illustrative screening assumptions.\n`;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "stitch-intervention-brief.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="STITCH home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>
            <strong>STITCH</strong>
            <small>Habitat intervention lab</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#workspace">Model</a>
          <a href="#method">Method</a>
          <a href="#evidence">Evidence</a>
        </nav>
        <span className="model-status"><i /> Transparent model · 400 runs</span>
      </header>

      <section className="case-intro" id="top">
        <div className="intro-copy">
          <span className="eyebrow">CASE 01 / TEXAS GULF COAST</span>
          <h1>Reconnect the last <em>one percent.</em></h1>
          <p>
            Find a feasible habitat corridor. Test whether it meaningfully changes survival before restoration money is spent.
          </p>
        </div>
        <figure className="species-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SOURCE_IMAGE} alt="Two male Attwater's prairie-chickens standing in coastal prairie" />
          <figcaption>
            <span>ATTWATER&apos;S PRAIRIE-CHICKEN</span>
            <strong>&lt;1%</strong>
            <small>of its original Gulf coastal prairie remains</small>
            <a href="https://www.fws.gov/species/attwaters-greater-prairie-chicken-tympanuchus-cupido-attwateri" target="_blank" rel="noreferrer">
              USFWS fact <ExternalLink />
            </a>
          </figcaption>
        </figure>
      </section>

      <section className="workspace-shell" id="workspace" aria-label="Habitat corridor planning workspace">
        <aside className="control-rail">
          <div className="rail-heading">
            <span>INTERVENTION</span>
            <strong>Corridor screen</strong>
            <p>Colorado County demonstration tile</p>
          </div>

          <div className="budget-control">
            <div className="control-label">
              <span><CircleDollarSign /> Restoration budget</span>
              <strong>{formatMoney(budget)}</strong>
            </div>
            <Slider
              min={1_200_000}
              max={4_000_000}
              step={100_000}
              value={[budget]}
              onValueChange={(values) => setBudget(values[0])}
              aria-label="Restoration budget"
            />
            <div className="range-labels"><span>$1.2M</span><span>$4.0M</span></div>
          </div>

          <ol className="workflow-list">
            <li className="is-complete">
              <span><Check /></span>
              <div><strong>Read landscape</strong><small>540 planning cells classified</small></div>
            </li>
            <li className={hasPlan ? "is-complete" : "is-current"}>
              <span>{hasPlan ? <Check /> : "2"}</span>
              <div><strong>Find linkage</strong><small>Least-cost graph search</small></div>
            </li>
            <li className={ranModel ? "is-complete" : hasPlan ? "is-current" : ""}>
              <span>{ranModel ? <Check /> : "3"}</span>
              <div><strong>Stress-test</strong><small>400 × 20-year model runs</small></div>
            </li>
          </ol>

          <div className="action-stack">
            <Button className="primary-action" onClick={createPlan}>
              <Route /> {hasPlan ? "Recalculate lifeline" : "Find the lifeline"}
            </Button>
            <Button className="secondary-action" variant="outline" onClick={stressTest} disabled={!hasPlan || isRunning}>
              {isRunning ? <span className="run-spinner" /> : <Play />}
              {isRunning ? "Running 400 futures…" : "Run 20-year stress test"}
            </Button>
          </div>

          <div className="manual-hint">
            <MousePointer2 />
            <p><strong>Challenge the optimizer.</strong> Click an editable cell to add or remove a treatment, then rerun.</p>
          </div>

          <button type="button" className="reset-button" onClick={reset} disabled={!hasPlan}>
            <RotateCcw /> Reset landscape
          </button>
        </aside>

        <div className={cx("map-panel", layer === "resistance" && "resistance-layer")}>
          <div className="map-toolbar">
            <div>
              <span className="map-kicker"><MapIcon /> HABITAT PLANNING TILE</span>
              <h2>Two protected populations. No safe link.</h2>
            </div>
            <div className="layer-toggle" role="group" aria-label="Map layer">
              <button type="button" className={layer === "cover" ? "active" : ""} onClick={() => setLayer("cover")}><Leaf /> Cover</button>
              <button type="button" className={layer === "resistance" ? "active" : ""} onClick={() => setLayer("resistance")}><Eye /> Resistance</button>
            </div>
          </div>

          <div className="map-stage">
            <div
              className="habitat-grid"
              style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
              role="grid"
              aria-label={`${GRID_ROWS} by ${GRID_COLS} habitat planning grid`}
            >
              {cells.map((cell) => {
                const position = pathPositions.get(cell.id);
                const nextId = position === undefined ? undefined : plannedPath[position + 1];
                return (
                  <MapCell
                    key={cell.id}
                    cell={cell}
                    isRestored={restored.has(cell.id)}
                    isPath={position !== undefined}
                    nextCell={nextId === undefined ? undefined : cells[nextId]}
                    active={inspected.id === cell.id}
                    onSelect={toggleCell}
                    onInspect={setInspected}
                  />
                );
              })}
              <div className="population-marker west" aria-hidden="true"><i /><span>WEST<br />CORE</span></div>
              <div className="population-marker east" aria-hidden="true"><i /><span>EAST<br />CORE</span></div>
            </div>
            <div className="north-arrow" aria-hidden="true"><span>N</span><i /></div>
            <div className="scale-bar" aria-hidden="true"><i /><span>5 km screening tile</span></div>
          </div>

          <div className="map-bottom">
            <div className="legend" aria-label="Land cover legend">
              {COVER_ORDER.slice(0, 6).map((cover) => (
                <span key={cover}><i className={`swatch cover-${cover}`} />{LAND_META[cover].shortLabel}</span>
              ))}
            </div>
            <div className="cell-inspector" aria-live="polite">
              <i className={`swatch cover-${inspected.cover}`} />
              <div>
                <span>CELL {String(inspected.row + 1).padStart(2, "0")}-{String(inspected.col + 1).padStart(2, "0")}</span>
                <strong>{LAND_META[inspected.cover].label}</strong>
                <small>{LAND_META[inspected.cover].description}</small>
              </div>
              <b>{LAND_META[inspected.cover].resistance}<small> resistance</small></b>
            </div>
          </div>
        </div>

        <aside className="results-rail" aria-label="Model results">
          <div className="results-heading">
            <span>COUNTERFACTUAL</span>
            <strong>{hasPlan ? (ranModel ? "Stress test complete" : "Candidate corridor ready") : "Waiting for intervention"}</strong>
            <p>{hasPlan ? `${restored.size * CELL_ACRES} acres screened for treatment` : "Run the optimizer to compare futures."}</p>
          </div>

          <div className="score-panel">
            <span className="score-label">CONNECTIVITY INDEX</span>
            <div className="big-score">
              <strong>{hasPlan ? planMetrics.connectivity : baselineMetrics.connectivity}</strong>
              <span>/100</span>
            </div>
            <div className="score-track"><i style={{ width: `${hasPlan ? planMetrics.connectivity : baselineMetrics.connectivity}%` }} /></div>
            <small>{hasPlan ? "+" + (planMetrics.connectivity - baselineMetrics.connectivity) + " points after treatment" : "Fragmented · intervention needed"}</small>
          </div>

          <div className="metrics-block">
            <Metric label="Local-collapse risk" before={baselineSimulation.risk} after={hasPlan ? planSimulation.risk : baselineSimulation.risk} unit="%" inverse />
            <Metric label="Gene-flow proxy" before={baselineMetrics.geneFlowProxy} after={hasPlan ? planMetrics.geneFlowProxy : baselineMetrics.geneFlowProxy} />
            <Metric label="Suitable habitat" before={baselineMetrics.suitableAcres} after={hasPlan ? planMetrics.suitableAcres : baselineMetrics.suitableAcres} unit=" ac" />
          </div>

          <div className="simulation-card">
            <div className="simulation-title">
              <span><Activity /> MODELED POPULATION</span>
              <small>10th–90th percentile</small>
            </div>
            <SparkChart baseline={baselineSimulation} intervention={hasPlan ? planSimulation : baselineSimulation} />
            {!ranModel && hasPlan ? <div className="chart-shield"><FlaskConical /><span>Run the stress test to validate this screen</span></div> : null}
          </div>

          <div className="decision-strip">
            <div><span>Budget used</span><strong>{formatMoney(activeCost)}</strong></div>
            <div><span>Cells treated</span><strong>{restored.size}</strong></div>
            <div><span>Crossing</span><strong>{plannedPath.some((id) => cells[id].cover === "road") ? "1" : "0"}</strong></div>
          </div>

          <Button variant="outline" className="download-action" onClick={downloadBrief} disabled={!ranModel}>
            <Download /> Download decision brief
          </Button>
          <p className="honesty-note"><Info /> Screening result, not a population forecast. Assumptions are exposed below.</p>
        </aside>
      </section>

      <section className="method-section" id="method">
        <div className="section-number">02</div>
        <div className="section-lead">
          <span className="eyebrow">WHAT THE MODEL DOES</span>
          <h2>From colored pixels to a decision you can inspect.</h2>
          <p>STITCH separates the parts conservation teams usually have to juggle across GIS, spreadsheets, and static reports.</p>
        </div>
        <div className="method-steps">
          <article>
            <span>01</span><Database />
            <h3>Translate the landscape</h3>
            <p>Each land-cover class becomes a transparent movement resistance, suitability score, and treatment cost.</p>
          </article>
          <article>
            <span>02</span><Route />
            <h3>Search every viable stitch</h3>
            <p>A budget-aware graph search traces the lowest combined ecological and restoration-cost path between core patches.</p>
          </article>
          <article>
            <span>03</span><FlaskConical />
            <h3>Ask “what if?” 400 times</h3>
            <p>A two-patch metapopulation model varies growth, movement, and weather shocks across twenty years.</p>
          </article>
        </div>
      </section>

      <section className="evidence-section" id="evidence">
        <div className="evidence-visual" aria-hidden="true">
          <div className="stitch-diagram"><i /><i /><i /><i /><i /><i /></div>
          <strong>1%</strong>
          <span>remaining habitat<br />cannot survive as islands</span>
        </div>
        <div className="evidence-content">
          <span className="eyebrow">PROVENANCE & LIMITS</span>
          <h2>Evidence, not theatre.</h2>
          <p className="evidence-intro">
            The ecological context is real. The demo tile and unit costs are clearly labeled screening assumptions so the interface never pretends to know more than its inputs.
          </p>
          <div className="source-list">
            <a href="https://www.fws.gov/species/attwaters-greater-prairie-chicken-tympanuchus-cupido-attwateri" target="_blank" rel="noreferrer">
              <ShieldCheck />
              <span><strong>U.S. Fish & Wildlife Service</strong><small>Habitat loss, fragmentation, lifecycle, and recovery context</small></span>
              <ExternalLink />
            </a>
            <a href="https://www.usgs.gov/data/attwaters-greater-prairie-chicken-tympanuchus-cupido-attwateri-bgrpcaconus2001v1-habitat-map" target="_blank" rel="noreferrer">
              <Database />
              <span><strong>USGS habitat distribution model</strong><small>Deductive species model built from remotely sensed layers · DOI 10.5066/F77S7M35</small></span>
              <ExternalLink />
            </a>
            <a href="https://tpwd.texas.gov/huntwild/wild/species/apc/" target="_blank" rel="noreferrer">
              <Bird />
              <span><strong>Texas Parks & Wildlife</strong><small>Coastal-prairie habitat needs and life-history parameters</small></span>
              <ExternalLink />
            </a>
          </div>
          <div className="limits-grid">
            <div><AlertTriangle /><p><strong>Not field-ready yet.</strong> A deployed analysis must ingest current parcel, ownership, vegetation, hydrology, and monitoring data.</p></div>
            <div><ShieldCheck /><p><strong>Safe by design.</strong> STITCH ranks interventions; it does not publish sensitive occurrence points or claim an exact future population.</p></div>
          </div>
        </div>
      </section>

      <section className="impact-section">
        <div>
          <span className="eyebrow">THE PATH TO IMPACT</span>
          <h2>Spend the next restoration dollar where it changes the system.</h2>
        </div>
        <ol>
          <li><span>1</span><p><strong>Screen</strong> candidate corridors in minutes</p></li>
          <li><span>2</span><p><strong>Validate</strong> the short list with field and parcel data</p></li>
          <li><span>3</span><p><strong>Fund</strong> the intervention with an auditable brief</p></li>
        </ol>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>STITCH</strong><small>Reconnect habitat before the break becomes permanent.</small></span>
        </a>
        <p>Built for Hack the Habitat 2026 · Open, inspectable, and designed for real conservation decisions.</p>
      </footer>
    </main>
  );
}
