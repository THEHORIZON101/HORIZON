# Earth Reader — Experiment A Results

This file records the real-data mechanism tests run on the isolated `earth-reader-exp-a` branch. The repository's `main` branch was not modified.

## Benchmark

PostRainBench Germany: COSMO-DE-EPS precipitation/NWP state vs RADKLIM radar precipitation.

- NWP precipitation grid: 36 x 36
- Radar truth: 72 x 72, downsampled to the aligned 36 x 36 NWP grid by the benchmark-compatible factor-2 bilinear mapping (equivalent here to aligned 2 x 2 averaging)
- Rain occurrence definition used in these tests: radar precipitation >= 0.1 mm/h
- Development: validation samples ordered by provided time; first 70% used to fit, last 30% used only for threshold calibration
- Blind evaluation: official test set, all 3,461,616 finite pixels, no abstention or selective coverage

## A1 — precipitation-only residual correction

Residual target: observed precipitation - raw NWP precipitation.

Features: point precipitation, 3 x 3 mean, 3 x 3 maximum, 9 x 9 mean, normalized x/y position.

### Raw NWP
- Balanced accuracy: **85.2608%**
- Sensitivity: **87.2011%**
- Specificity: **83.3205%**
- TN 2,625,529; FP 525,591; FN 39,740; TP 270,756

### Residual-corrected NWP
- Balanced accuracy: **85.9863%**
- Sensitivity: **88.4414%**
- Specificity: **83.5313%**
- TN 2,632,171; FP 518,949; FN 35,889; TP 274,607

**Gain: +0.7255 percentage points balanced accuracy.**

Interpretation: precipitation-only residual learning improved sensitivity and specificity simultaneously on the untouched test set. This supports the hypothesis that NWP forecast errors contain learnable structure rather than the gain being only a threshold tradeoff.

## A2 — naive full-state 143-channel ablation

Same benchmark and blind test. LightGBM residual correction was compared with precipitation-only features and with the precipitation features plus all 143 NWP state channels at the target grid point.

### Raw NWP
- Balanced accuracy: **85.2608%**
- Sensitivity: **87.2011%**
- Specificity: **83.3205%**

### Precipitation-only residual model
- Balanced accuracy: **85.9284%**
- Sensitivity: **89.2588%**
- Specificity: **82.5981%**
- Gain over raw: **+0.6676 pp**

### Pointwise 143-channel full-state residual model
- Balanced accuracy: **85.5076%**
- Sensitivity: **83.4970%**
- Specificity: **87.5181%**
- Gain over raw: **+0.2468 pp**
- Difference vs precipitation-only residual: **-0.4209 pp**

Interpretation: simply feeding all 143 atmospheric channels at one grid point is not enough. The richer state contains useful information, but it is high-dimensional/redundant and lacks explicit spatial geometry. The next test should select informative channels and derive neighborhood gradients, curvature/Laplacian, local means/spread, and related geometric features rather than treating the atmosphere as an unordered 143-number vector.

## Evidence status

These are real-data internal mechanism tests on PostRainBench Germany. They are not directly comparable to the project's earlier 82.48% WeatherAUS next-day station benchmark because the geography, temporal target, data source, and evaluation unit differ. They validate the residual-correction mechanism; they do not establish >90% next-day accuracy for Earth Reader.
