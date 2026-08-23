import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzePopulationBenchmark,
  analyzeReverie,
  findBehaviorViolation,
  runRandomizedVerification,
} from "../lib/engine.mjs";

test("reproduces the exact population benchmark", () => {
  const result = analyzePopulationBenchmark();
  assert.equal(result.rawUniverse, 10790021580n);
  assert.equal(result.feasibleUniverse, 4565009130n);
  assert.equal(result.affectedProfiles, 112050000n);
  assert.equal(result.symbolicRegions, 480n);
  assert.equal(result.repair.changedConstants, 1);
  assert.equal(result.repair.after, 75000);
  assert.equal(result.repair.remainingConflicts, 0n);
  assert.equal(result.repair.recheckedProfiles, result.feasibleUniverse);
  assert.equal(result.repair.proven, true);
});

test("finds the ReverieHacks deadline disagreement and list mismatches", () => {
  const result = analyzeReverie();
  assert.equal(result.findings.length, 3);
  assert.equal(result.findings[0].witness.at(-2)[1], "On time");
  assert.equal(result.findings[0].witness.at(-1)[1], "Late");
});

test("returns a shortest software-breaking action sequence", () => {
  const result = findBehaviorViolation();
  assert.equal(result.shortest, true);
  assert.equal(result.actions.length, 4);
  assert.equal(result.violation, "A cancelled order may not be shipped.");
  assert.deepEqual(result.actions, ["Create order", "Pay", "Cancel", "Ship"]);
});

test("matches 5,000 randomized symbolic counts against brute force", () => {
  assert.equal(runRandomizedVerification(5000), 5000);
});
