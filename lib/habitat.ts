export const GRID_COLS = 30;
export const GRID_ROWS = 18;
export const CELL_ACRES = 25;

export type LandCover =
  | "core"
  | "prairie"
  | "pasture"
  | "cropland"
  | "shrub"
  | "road"
  | "developed"
  | "water";

export type HabitatCell = {
  id: number;
  row: number;
  col: number;
  cover: LandCover;
  protected: boolean;
};

export type LandMeta = {
  label: string;
  shortLabel: string;
  resistance: number;
  restoredResistance: number;
  restorationCost: number;
  suitability: number;
  description: string;
};

export const LAND_META: Record<LandCover, LandMeta> = {
  core: {
    label: "Protected coastal prairie",
    shortLabel: "Core prairie",
    resistance: 1,
    restoredResistance: 1,
    restorationCost: 0,
    suitability: 0.98,
    description: "High-value habitat already managed as coastal prairie.",
  },
  prairie: {
    label: "Remnant native prairie",
    shortLabel: "Prairie remnant",
    resistance: 3,
    restoredResistance: 1.4,
    restorationCost: 20_000,
    suitability: 0.82,
    description: "Existing grassland that can be improved with fire and grazing management.",
  },
  pasture: {
    label: "Restorable pasture",
    shortLabel: "Pasture",
    resistance: 9,
    restoredResistance: 1.8,
    restorationCost: 60_000,
    suitability: 0.48,
    description: "Open land with corridor potential after native-grass restoration.",
  },
  cropland: {
    label: "Working cropland",
    shortLabel: "Cropland",
    resistance: 18,
    restoredResistance: 2.6,
    restorationCost: 115_000,
    suitability: 0.2,
    description: "Low-cover habitat; conservation easements or field-edge restoration are possible.",
  },
  shrub: {
    label: "Brush encroachment",
    shortLabel: "Brush",
    resistance: 14,
    restoredResistance: 2.1,
    restorationCost: 75_000,
    suitability: 0.28,
    description: "Woody cover suppresses prairie habitat but can be treated and maintained.",
  },
  road: {
    label: "Transport barrier",
    shortLabel: "Road",
    resistance: 52,
    restoredResistance: 8,
    restorationCost: 280_000,
    suitability: 0.02,
    description: "A major movement barrier; intervention represents a protected crossing treatment.",
  },
  developed: {
    label: "Developed land",
    shortLabel: "Developed",
    resistance: 220,
    restoredResistance: 24,
    restorationCost: 750_000,
    suitability: 0,
    description: "Highly resistant land that the optimizer strongly avoids.",
  },
  water: {
    label: "Permanent water",
    shortLabel: "Water",
    resistance: 300,
    restoredResistance: 22,
    restorationCost: 900_000,
    suitability: 0,
    description: "Permanent water; not considered restorable in this screening scenario.",
  },
};

export type CorridorPlan = {
  path: number[];
  restored: Set<number>;
  cost: number;
  fullCost: number;
  restoredAcres: number;
  complete: boolean;
  crossingCell: number | null;
};

export type ModelMetrics = {
  connectivity: number;
  geneFlowProxy: number;
  suitableAcres: number;
  barrierCost: number;
};

export type SimulationResult = {
  risk: number;
  median: number[];
  low: number[];
  high: number[];
};

function inEllipse(col: number, row: number, cx: number, cy: number, rx: number, ry: number) {
  return ((col - cx) ** 2) / rx ** 2 + ((row - cy) ** 2) / ry ** 2 <= 1;
}

function noise(col: number, row: number) {
  const raw = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

export function createScenario(): HabitatCell[] {
  const cells: HabitatCell[] = [];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      const id = row * GRID_COLS + col;
      const leftCore = inEllipse(col, row, 4.6, 7.1, 3.7, 3.05);
      const rightCore = inEllipse(col, row, 25.2, 9.7, 3.6, 3.15);
      const nearLeft = inEllipse(col, row, 6.3, 7.6, 7.1, 5.1);
      const nearRight = inEllipse(col, row, 23.1, 9.1, 7.2, 5.3);
      const creekRow = Math.round(14.25 + Math.sin(col * 0.47) * 1.15);
      const isCreek = col > 3 && col < 28 && row === creekRow;
      const isRoad = col === 14 || col === 15;
      const town = col >= 17 && col <= 21 && row >= 3 && row <= 6;
      const subdivision = col >= 10 && col <= 13 && row >= 12 && row <= 16;

      let cover: LandCover;
      if (leftCore || rightCore) {
        cover = "core";
      } else if (isCreek) {
        cover = "water";
      } else if (isRoad) {
        cover = "road";
      } else if (town || subdivision) {
        cover = "developed";
      } else if ((nearLeft || nearRight) && noise(col, row) > 0.43) {
        cover = "prairie";
      } else if (noise(col + 3, row + 11) > 0.76) {
        cover = "shrub";
      } else if (row < 3 || row > 14 || noise(col + 19, row + 5) > 0.68) {
        cover = "cropland";
      } else {
        cover = "pasture";
      }

      cells.push({ id, row, col, cover, protected: cover === "core" });
    }
  }

  return cells;
}

function neighbors(id: number) {
  const row = Math.floor(id / GRID_COLS);
  const col = id % GRID_COLS;
  const result: Array<{ id: number; diagonal: boolean }> = [];

  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow < 0 || nextRow >= GRID_ROWS || nextCol < 0 || nextCol >= GRID_COLS) continue;
      result.push({ id: nextRow * GRID_COLS + nextCol, diagonal: dr !== 0 && dc !== 0 });
    }
  }

  return result;
}

function cheapestPath(cells: HabitatCell[], restored = new Set<number>(), budgetWeight = 25_000) {
  const distance = Array(cells.length).fill(Number.POSITIVE_INFINITY) as number[];
  const previous = Array(cells.length).fill(-1) as number[];
  const visited = new Set<number>();
  const sources = cells.filter((cell) => cell.cover === "core" && cell.col < 10).map((cell) => cell.id);
  const targets = new Set(cells.filter((cell) => cell.cover === "core" && cell.col > 20).map((cell) => cell.id));

  for (const source of sources) distance[source] = 0;

  while (visited.size < cells.length) {
    let current = -1;
    let best = Number.POSITIVE_INFINITY;

    for (let id = 0; id < cells.length; id += 1) {
      if (!visited.has(id) && distance[id] < best) {
        best = distance[id];
        current = id;
      }
    }

    if (current === -1) break;
    if (targets.has(current)) {
      const path: number[] = [];
      let cursor = current;
      while (cursor !== -1) {
        path.push(cursor);
        cursor = previous[cursor];
      }
      return { path: path.reverse(), resistance: best };
    }

    visited.add(current);
    for (const candidate of neighbors(current)) {
      if (visited.has(candidate.id)) continue;
      const cell = cells[candidate.id];
      const meta = LAND_META[cell.cover];
      const isRestored = restored.has(cell.id);
      const resistance = isRestored ? meta.restoredResistance : meta.resistance;
      const acquisition = isRestored || cell.protected ? 0 : meta.restorationCost / budgetWeight;
      const step = (resistance + acquisition) * (candidate.diagonal ? 1.414 : 1);
      const nextDistance = distance[current] + step;

      if (nextDistance < distance[candidate.id]) {
        distance[candidate.id] = nextDistance;
        previous[candidate.id] = current;
      }
    }
  }

  return { path: [] as number[], resistance: Number.POSITIVE_INFINITY };
}

export function optimizeCorridor(cells: HabitatCell[], budget: number): CorridorPlan {
  const weighted = cheapestPath(cells, new Set(), Math.max(20_000, budget / 90));
  const candidates = weighted.path.filter((id) => {
    const cell = cells[id];
    return cell.cover !== "core" && cell.cover !== "water" && !cell.protected;
  });
  const desired = new Set(candidates);
  for (const id of candidates) {
    for (const neighborId of [id - GRID_COLS, id + GRID_COLS]) {
      const cell = cells[neighborId];
      if (
        cell &&
        !cell.protected &&
        cell.cover !== "core" &&
        cell.cover !== "water" &&
        cell.cover !== "developed" &&
        cell.cover !== "road"
      ) {
        desired.add(neighborId);
      }
    }
  }
  const prioritized = [...candidates, ...[...desired].filter((id) => !candidates.includes(id))];
  const fullCost = prioritized.reduce((sum, id) => sum + LAND_META[cells[id].cover].restorationCost, 0);
  const restored = new Set<number>();
  let cost = 0;

  for (const id of prioritized) {
    const next = LAND_META[cells[id].cover].restorationCost;
    if (cost + next <= budget) {
      restored.add(id);
      cost += next;
    }
  }

  const crossing = weighted.path.find((id) => cells[id].cover === "road") ?? null;
  return {
    path: weighted.path,
    restored,
    cost,
    fullCost,
    restoredAcres: restored.size * CELL_ACRES,
    complete: cost >= fullCost,
    crossingCell: crossing,
  };
}

export function calculateMetrics(cells: HabitatCell[], restored: Set<number>): ModelMetrics {
  const path = cheapestPath(cells, restored, 1_000_000_000);
  const connectivity = Math.max(2, Math.min(96, Math.round(100 * Math.exp(-path.resistance / 74))));
  const geneFlowProxy = Math.max(1, Math.min(93, Math.round(connectivity * 0.84 + 4)));
  const suitableAcres = cells.reduce((sum, cell) => {
    const meta = LAND_META[cell.cover];
    const suitability = restored.has(cell.id) ? Math.max(meta.suitability, 0.84) : meta.suitability;
    return sum + suitability * CELL_ACRES;
  }, 0);

  return {
    connectivity,
    geneFlowProxy,
    suitableAcres: Math.round(suitableAcres / 25) * 25,
    barrierCost: path.resistance,
  };
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function gaussian(random: () => number) {
  const first = Math.max(random(), 0.000001);
  const second = Math.max(random(), 0.000001);
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function percentile(values: number[], fraction: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * fraction)));
  return sorted[index];
}

export function runMetapopulationModel(
  cells: HabitatCell[],
  restored: Set<number>,
  runs = 400,
  years = 20,
): SimulationResult {
  const metrics = calculateMetrics(cells, restored);
  const connection = metrics.connectivity / 100;
  const extraCapacity = restored.size * 0.8;
  const traces: number[][] = [];
  let collapseCount = 0;

  for (let run = 0; run < runs; run += 1) {
    const random = mulberry32(7_913 + run * 97 + restored.size * 31);
    let west = 20;
    let east = 12;
    const trace = [west + east];
    const westCapacity = 34 + extraCapacity * 0.48;
    const eastCapacity = 27 + extraCapacity * 0.52;
    let localCollapse = false;

    for (let year = 1; year <= years; year += 1) {
      const growthWest = 0.075 * west * (1 - west / westCapacity);
      const growthEast = 0.07 * east * (1 - east / eastCapacity);
      const weatherShock = random() < 0.155 - connection * 0.13;
      const shockSide = random();
      const shockWest = weatherShock && shockSide < 0.56 ? west * (0.3 + random() * 0.25) : 0;
      const shockEast = weatherShock && shockSide >= 0.56 ? east * (0.3 + random() * 0.25) : 0;
      const movementRate = 0.005 + connection * 0.17;
      const westToEast = west * movementRate * (0.35 + random() * 0.4);
      const eastToWest = east * movementRate * (0.35 + random() * 0.4);

      west = Math.max(
        0,
        west + growthWest + gaussian(random) * Math.sqrt(Math.max(1, west)) * 1.08 - shockWest - westToEast + eastToWest,
      );
      east = Math.max(
        0,
        east + growthEast + gaussian(random) * Math.sqrt(Math.max(1, east)) * 1.16 - shockEast + westToEast - eastToWest,
      );

      if (west < 4 && east > 9) {
        const rescue = Math.min(3.2, east * connection * 0.13);
        west += rescue;
        east -= rescue;
      }
      if (east < 4 && west > 9) {
        const rescue = Math.min(3.2, west * connection * 0.13);
        east += rescue;
        west -= rescue;
      }

      if (west < 0.7) west = 0;
      if (east < 0.7) east = 0;
      if (west < 2.5 || east < 2.5) localCollapse = true;
      trace.push(Math.round(west + east));
    }

    if (localCollapse || west + east < 12) collapseCount += 1;
    traces.push(trace);
  }

  const median: number[] = [];
  const low: number[] = [];
  const high: number[] = [];
  for (let year = 0; year <= years; year += 1) {
    const values = traces.map((trace) => trace[year]);
    median.push(percentile(values, 0.5));
    low.push(percentile(values, 0.1));
    high.push(percentile(values, 0.9));
  }

  return {
    risk: Math.round((collapseCount / runs) * 100),
    median,
    low,
    high,
  };
}

export function formatMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(value / 1_000)}K`;
}
