import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateMetrics,
  createScenario,
  optimizeCorridor,
  runMetapopulationModel,
} from "../lib/habitat.ts";

test("default screen is complete, budget-safe, and matches the decision brief", () => {
  const cells = createScenario();
  const plan = optimizeCorridor(cells, 2_400_000);
  const before = calculateMetrics(cells, new Set());
  const after = calculateMetrics(cells, plan.restored);

  assert.equal(cells.length, 540);
  assert.equal(plan.path.length, 15);
  assert.equal(plan.restored.size, 35);
  assert.equal(plan.restoredAcres, 875);
  assert.equal(plan.cost, 2_020_000);
  assert.ok(plan.cost <= 2_400_000);
  assert.equal(plan.complete, true);
  assert.notEqual(plan.crossingCell, null);
  assert.deepEqual(
    [before.connectivity, after.connectivity],
    [13, 61],
  );
  assert.deepEqual(
    [before.geneFlowProxy, after.geneFlowProxy],
    [15, 55],
  );
});

test("the optimizer never spends above the selected budget", () => {
  const cells = createScenario();

  for (const budget of [1_200_000, 1_800_000, 2_400_000, 3_200_000, 4_000_000]) {
    const plan = optimizeCorridor(cells, budget);
    assert.ok(plan.cost <= budget, `${plan.cost} exceeded ${budget}`);
  }
});

test("seeded counterfactuals are reproducible and improve the default downside", () => {
  const cells = createScenario();
  const plan = optimizeCorridor(cells, 2_400_000);
  const baseline = runMetapopulationModel(cells, new Set());
  const first = runMetapopulationModel(cells, plan.restored);
  const second = runMetapopulationModel(cells, plan.restored);

  assert.deepEqual(first, second);
  assert.deepEqual([baseline.risk, first.risk], [58, 24]);
  assert.deepEqual(
    [baseline.median.at(-1), first.median.at(-1)],
    [27, 38],
  );
  assert.ok(first.low.at(-1) > baseline.low.at(-1));
});
