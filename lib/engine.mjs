const product = (values) => values.reduce((total, value) => total * BigInt(value), 1n);

export function formatBigInt(value) {
  return BigInt(value).toLocaleString("en-US");
}

export function partitionInteger(min, max, predicates) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new Error("Integer domains require finite integer bounds.");
  }
  const regions = [];
  let start = min;
  let previous = predicates.map((predicate) => Boolean(predicate(min))).join("");
  for (let value = min + 1; value <= max; value += 1) {
    const signature = predicates.map((predicate) => Boolean(predicate(value))).join("");
    if (signature !== previous) {
      regions.push({ start, end: value - 1, representative: start, weight: BigInt(value - start), signature: previous });
      start = value;
      previous = signature;
    }
  }
  regions.push({ start, end: max, representative: start, weight: BigInt(max - start + 1), signature: previous });
  return regions;
}

export function partitionCategorical(values, predicates) {
  const groups = new Map();
  values.forEach((value) => {
    const signature = predicates.map((predicate) => Boolean(predicate(value))).join("");
    const current = groups.get(signature) ?? [];
    current.push(value);
    groups.set(signature, current);
  });
  return [...groups.entries()].map(([signature, members]) => ({
    members,
    representative: members[0],
    weight: BigInt(members.length),
    signature,
  }));
}

export function countRegions(partitions, predicate) {
  let count = 0n;
  let cells = 0;
  const profile = {};
  const names = Object.keys(partitions);
  const visit = (index, weight) => {
    if (index === names.length) {
      cells += 1;
      if (predicate(profile)) count += weight;
      return;
    }
    const name = names[index];
    for (const region of partitions[name]) {
      profile[name] = region.representative;
      visit(index + 1, weight * region.weight);
    }
  };
  visit(0, 1n);
  return { count, cells };
}

export function findMinimumRepair({ partitions, feasible, referencePolicy, candidatePolicy, candidates, currentValue }) {
  const ranked = candidates.map((value) => {
    const result = countRegions(
      partitions,
      (profile) => feasible(profile) && referencePolicy(profile) !== candidatePolicy(profile, value),
    );
    return {
      value,
      remainingConflicts: result.count,
      changedConstants: value === currentValue ? 0 : 1,
      distance: typeof value === "number" && typeof currentValue === "number" ? Math.abs(value - currentValue) : 0,
      evaluatedCells: result.cells,
    };
  }).sort((a, b) => {
    if (a.remainingConflicts !== b.remainingConflicts) return a.remainingConflicts < b.remainingConflicts ? -1 : 1;
    if (a.changedConstants !== b.changedConstants) return a.changedConstants - b.changedConstants;
    return a.distance - b.distance;
  });

  return {
    ...ranked[0],
    candidatesChecked: ranked.length,
    proven: ranked[0].remainingConflicts === 0n,
  };
}

export function analyzePopulationBenchmark() {
  const started = performance.now();
  const income = partitionInteger(0, 166666, [
    (v) => v >= 30001,
    (v) => v <= 75000,
    (v) => v === 30001,
    (v) => v === 75000,
  ]);
  const age = partitionInteger(0, 82, [(v) => v >= 18, (v) => v >= 26, (v) => v >= 65]);
  const householdSize = partitionInteger(1, 13, [(v) => v <= 11, (v) => v === 1, (v) => v <= 4, (v) => v <= 8]);
  const region = partitionCategorical(["north", "central", "coastal", "mountain", "rural"], [
    (v) => ["north", "central", "coastal"].includes(v),
  ]);
  const status = partitionCategorical(
    Array.from({ length: 12 }, (_, index) => index),
    [(v) => v < 6, (v) => v < 2, (v) => v < 4],
  );

  const rawUniverse = product([166667, 83, 13, 5, 12]);
  const partitions = { income, age, householdSize, region, status };
  const feasible = (p) => p.householdSize <= 11 && p.status < 6;
  const referencePolicy = (p) => p.householdSize !== 1 || p.income <= 75000;
  const candidatePolicy = (p, onePersonIncomeLimit) => p.householdSize !== 1 || p.income <= onePersonIncomeLimit;
  const disagreement = (p) => feasible(p) && referencePolicy(p) !== candidatePolicy(p, 30000);
  const feasibleResult = countRegions(partitions, feasible);
  const affectedResult = countRegions(partitions, disagreement);
  const repair = findMinimumRepair({
    partitions,
    feasible,
    referencePolicy,
    candidatePolicy,
    candidates: [30000, 75000],
    currentValue: 30000,
  });
  const feasibleRegions = product([
    income.length,
    age.length,
    householdSize.filter((item) => item.representative <= 11).length,
    region.length,
    status.filter((item) => item.representative < 6).length,
  ]);

  return {
    rawUniverse,
    feasibleUniverse: feasibleResult.count,
    affectedProfiles: affectedResult.count,
    symbolicRegions: feasibleRegions,
    evaluatedCells: BigInt(affectedResult.cells),
    runtimeMs: Math.max(0.01, performance.now() - started),
    proofStatus: "Exact",
    repair: {
      field: "One-person income limit",
      before: 30000,
      after: repair.value,
      changedConstants: repair.changedConstants,
      candidatesChecked: repair.candidatesChecked,
      remainingConflicts: repair.remainingConflicts,
      recheckedProfiles: feasibleResult.count,
      proven: repair.proven,
    },
    witness: {
      income: 30001,
      age: 0,
      householdSize: 1,
      region: "north",
      status: "status-0",
    },
  };
}

export function analyzeReverie() {
  const websiteDeadline = Date.parse("2026-08-24T23:59:00-05:00");
  const devpostDeadline = Date.parse("2026-08-24T00:00:00-05:00");
  const witnessTime = Date.parse("2026-08-24T10:00:00-05:00");
  const websiteOnTime = witnessTime <= websiteDeadline;
  const devpostOnTime = witnessTime <= devpostDeadline;
  const requirements = [
    { id: "software", track: "Software Development", declared: 4, items: ["Code repository", "Demo video", "Documentation"] },
    { id: "ml", track: "ML Prompt Engineering", declared: 4, items: ["ML workflow", "Samples", "Documentation"] },
  ];
  const listFindings = requirements
    .filter((requirement) => requirement.declared !== requirement.items.length)
    .map((requirement) => ({
      id: requirement.id,
      type: "Instructions unclear",
      severity: "warning",
      title: `${requirement.track} names ${requirement.items.length} of ${requirement.declared} required files`,
      summary: `A team can turn in every file listed here and still be unsure whether its submission is complete.`,
      clauseA: `“You are required to submit ${requirement.declared} different files.”`,
      clauseB: requirement.items.join(" · "),
      witness: [
        ["Team submits", `All ${requirement.items.length} named deliverables`],
        ["List says", "Complete"],
        ["Declared count says", "One file missing"],
      ],
      proof: `${requirement.declared} declared ≠ ${requirement.items.length} enumerated`,
      fix: `Name the fourth deliverable or change the declared count to ${requirement.items.length}.`,
    }));

  return {
    title: "The rules disagree about when a valid submission becomes late.",
    summary: "A team following the website could think it still has time after the Devpost deadline has passed. Two tracks also say four files are required but only name three.",
    findings: [
      {
        id: "deadline",
        type: "Problem proven",
        severity: "critical",
        title: "One deadline, two answers",
        summary: "The exact same submission is on time according to the website and late according to Devpost.",
        clauseA: "Website · “August 24 at 11:59 p.m. local time”",
        clauseB: "Devpost · “August 24 at 12:00 a.m. CDT”",
        witness: [
          ["Entrant", "Houston, Texas (CDT)"],
          ["Submission", "August 24, 2026 at 10:00 a.m."],
          ["Website says", websiteOnTime ? "On time" : "Late"],
          ["Devpost says", devpostOnTime ? "On time" : "Late"],
        ],
        proof: `${new Date(devpostDeadline).toISOString()} ≠ ${new Date(websiteDeadline).toISOString()}`,
        fix: "Publish one absolute timestamp with a named timezone on every official page.",
      },
      ...listFindings,
    ],
  };
}

const behaviorActions = [
  { name: "Create order", apply: (s) => (s.created ? null : { ...s, created: true }) },
  { name: "Pay", apply: (s) => (s.created && !s.paid ? { ...s, paid: true } : null) },
  { name: "Cancel", apply: (s) => (s.created && !s.cancelled ? { ...s, cancelled: true } : null) },
  { name: "Ship", apply: (s) => (s.paid && !s.shipped ? { ...s, shipped: true } : null) },
  { name: "Refund", apply: (s) => (s.paid ? { ...s, refundCount: s.refundCount + 1 } : null) },
];

const violatedInvariant = (state) => {
  if (state.refundCount > 1) return "An order may not be refunded more than once.";
  if (state.cancelled && state.shipped) return "A cancelled order may not be shipped.";
  if (state.shipped && !state.paid) return "A shipped order must be paid.";
  return null;
};

const stateKey = (state) => `${Number(state.created)}${Number(state.paid)}${Number(state.cancelled)}${Number(state.shipped)}:${state.refundCount}`;

export function findBehaviorViolation(maxDepth = 8) {
  const initial = { created: false, paid: false, cancelled: false, shipped: false, refundCount: 0 };
  const queue = [{ state: initial, actions: [], states: [initial] }];
  const visited = new Map([[stateKey(initial), 0]]);
  let explored = 0;
  while (queue.length) {
    const current = queue.shift();
    explored += 1;
    const violation = violatedInvariant(current.state);
    if (violation) {
      return { ...current, violation, explored, shortest: true };
    }
    if (current.actions.length >= maxDepth) continue;
    for (const action of behaviorActions) {
      const next = action.apply(current.state);
      if (!next) continue;
      const depth = current.actions.length + 1;
      const key = stateKey(next);
      if ((visited.get(key) ?? Infinity) <= depth) continue;
      visited.set(key, depth);
      queue.push({ state: next, actions: [...current.actions, action.name], states: [...current.states, next] });
    }
  }
  return { state: initial, actions: [], states: [initial], violation: null, explored, shortest: false };
}

export function runRandomizedVerification(iterations = 5000) {
  let seed = 271828;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let test = 0; test < iterations; test += 1) {
    const xMax = 2 + Math.floor(random() * 7);
    const yMax = 2 + Math.floor(random() * 7);
    const xLow = Math.floor(random() * (xMax + 1));
    const xHigh = xLow + Math.floor(random() * (xMax - xLow + 1));
    const yCut = Math.floor(random() * (yMax + 1));
    const xPartitions = partitionInteger(0, xMax, [(v) => v >= xLow, (v) => v <= xHigh]);
    const yPartitions = partitionInteger(0, yMax, [(v) => v >= yCut]);
    const condition = (p) => p.x >= xLow && p.x <= xHigh && p.y >= yCut;
    const symbolic = countRegions({ x: xPartitions, y: yPartitions }, condition).count;
    let brute = 0n;
    for (let x = 0; x <= xMax; x += 1) {
      for (let y = 0; y <= yMax; y += 1) {
        if (condition({ x, y })) brute += 1n;
      }
    }
    if (symbolic !== brute) {
      throw new Error(`Verification failed on randomized case ${test}: ${symbolic} !== ${brute}`);
    }
  }
  return iterations;
}
