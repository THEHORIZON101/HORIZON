export type Region = { representative: string | number; weight: bigint; signature: string };
export function formatBigInt(value: bigint | number | string): string;
export function partitionInteger(min: number, max: number, predicates: Array<(value: number) => boolean>): Region[];
export function partitionCategorical(values: Array<string | number>, predicates: Array<(value: any) => boolean>): Region[];
export function countRegions(partitions: Record<string, Region[]>, predicate: (profile: Record<string, any>) => boolean): { count: bigint; cells: number };
export function findMinimumRepair(options: {
  partitions: Record<string, Region[]>; feasible: (profile: Record<string, any>) => boolean;
  referencePolicy: (profile: Record<string, any>) => boolean;
  candidatePolicy: (profile: Record<string, any>, value: any) => boolean;
  candidates: any[]; currentValue: any;
}): {
  value: any; remainingConflicts: bigint; changedConstants: number; distance: number;
  evaluatedCells: number; candidatesChecked: number; proven: boolean;
};
export function analyzePopulationBenchmark(): {
  rawUniverse: bigint; feasibleUniverse: bigint; affectedProfiles: bigint; symbolicRegions: bigint; evaluatedCells: bigint;
  runtimeMs: number; proofStatus: string; witness: Record<string, string | number>;
  repair: {
    field: string; before: number; after: number; changedConstants: number; candidatesChecked: number;
    remainingConflicts: bigint; recheckedProfiles: bigint; proven: boolean;
  };
};
export function analyzeReverie(): {
  title: string; summary: string; findings: Array<{
    id: string; type: string; severity: string; title: string; summary: string; clauseA: string; clauseB: string;
    witness: string[][]; proof: string; fix: string;
  }>;
};
export function findBehaviorViolation(maxDepth?: number): {
  state: Record<string, any>; actions: string[]; states: Array<Record<string, any>>; violation: string | null; explored: number; shortest: boolean;
};
export function runRandomizedVerification(iterations?: number): number;
