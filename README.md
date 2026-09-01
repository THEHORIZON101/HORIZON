# STITCH

**A habitat-corridor optimizer and ecological counterfactual lab.**

[Launch the live decision lab](https://scenemint.danielodeyemi27.chatgpt.site)

STITCH helps conservation teams answer a deceptively hard question: *if we can restore only a few parcels, which connection is most likely to change the ecological system?*

The interactive case study focuses on the endangered Attwater's prairie-chicken and the fragmented Texas Gulf coastal prairie. Users set a restoration budget, run a least-cost corridor search, edit the proposed treatment directly on the map, and compare the current landscape with the intervention across 400 transparent, seeded 20-year model runs.

## Why this problem

The [U.S. Fish & Wildlife Service](https://www.fws.gov/species/attwaters-greater-prairie-chicken-tympanuchus-cupido-attwateri) reports that less than 1% of the estimated six million acres of Gulf coastal prairie remains. Most remaining patches are too small to support an Attwater's prairie-chicken population. Fragmentation also makes small populations more vulnerable to weather, disease, and genetic problems.

Conservation teams do have mapping and modeling tools, but early intervention screening is often split across GIS layers, spreadsheets, and static reports. STITCH combines the first decision loop in one inspectable interface.

## What STITCH does

1. **Translates a landscape** into explicit movement resistance, habitat suitability, and treatment cost.
2. **Finds a corridor** with a budget-aware graph search between protected habitat cores.
3. **Builds a viable treatment width** around the centerline instead of presenting a one-pixel path as a real corridor.
4. **Stress-tests the intervention** with 400 seeded, 20-year metapopulation runs that vary growth, movement, and weather shocks.
5. **Lets the user challenge the result** by adding or removing treatments directly on the planning grid.
6. **Exports an auditable decision brief** containing the chosen intervention, modeled deltas, sources, and limitations.

## The demo is honest about its limits

STITCH is a **screening tool, not a field forecast**. The case uses real species ecology, official habitat-loss context, and the class structure of a published USGS habitat model. The 540-cell demonstration tile and unit treatment costs are illustrative assumptions. A field deployment must ingest current parcel boundaries, ownership, vegetation, hydrology, protected occurrence data, and local cost estimates.

The model deliberately does not publish sensitive occurrence points or claim an exact future wild population. Its outputs are comparative indices for ranking candidate interventions.

## Model architecture

- **Landscape engine:** 30 × 18 grid with eight land-cover classes and exposed per-class parameters.
- **Corridor optimizer:** multi-source Dijkstra search over eight-neighbor movement, combining ecological resistance and restoration cost.
- **Treatment builder:** expands the centerline into adjacent restorable cells while respecting the selected budget.
- **Connectivity score:** least-resistance link transformed into a bounded screening index.
- **Counterfactual engine:** two-patch stochastic metapopulation model with deterministic seeds, 400 runs, 20 annual steps, local growth, carrying capacity, directional rescue, dispersal, and weather shocks.
- **Uncertainty display:** median plus 10th–90th percentile band, never a single false-precision forecast.

All model logic is in [`lib/habitat.ts`](lib/habitat.ts).

## Data and attribution

| Source | Used for |
| --- | --- |
| [U.S. Fish & Wildlife Service species profile](https://www.fws.gov/species/attwaters-greater-prairie-chicken-tympanuchus-cupido-attwateri) | Habitat-loss, fragmentation, life-cycle, and recovery context |
| [USGS Attwater's prairie-chicken habitat distribution model](https://www.usgs.gov/data/attwaters-greater-prairie-chicken-tympanuchus-cupido-attwateri-bgrpcaconus2001v1-habitat-map), DOI `10.5066/F77S7M35` | Deductive habitat-model structure and remotely sensed habitat context |
| [Texas Parks & Wildlife species profile](https://tpwd.texas.gov/huntwild/wild/species/apc/) | Habitat requirements and life-history context |
| [U.S. Fish & Wildlife Service photo by John Magera](https://www.fws.gov/media/attwater-prairie-chicken-pair) | In-product species photograph and attribution |

Third-party software includes React, TypeScript, Vinext, Tailwind CSS, Radix UI/shadcn components, Lucide icons, Vite, and Cloudflare's development/deployment tooling. See `package.json` and `package-lock.json` for exact versions and licenses.

OpenAI Codex assisted implementation, testing, and documentation. The project source, assumptions, and model logic are included for inspection.

## Run locally

```bash
npm run install:ci
npm test
npm run lint
npm run dev
```

The test suite verifies the published default metrics, budget safety across the full slider range, deterministic counterfactuals, server rendering, responsive safeguards, and shared UI semantics.

## Accessibility and privacy

- Semantic controls, visible keyboard focus, accessible labels, and reduced-motion support.
- Responsive layout for desktop, tablet, and mobile.
- No account, tracking, personal data, or location permission.
- The simulation runs entirely in the browser.

## Built for Hack the Habitat 2026

STITCH was built during the official build period for the theme **“Build tech that protects the planet.”** It targets the judging criteria directly: measurable environmental relevance, meaningful code and data, strong usability, complete execution, and clear theme alignment.

Released under the [MIT License](LICENSE).
