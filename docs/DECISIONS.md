# Product-Owner Decision Log

Format per CLAUDE.md §17: Date / Decision needed / Context / Options / Recommended option / Impact / Status.

---

## 2026-09-02 — Birthplace geocoding dataset vs. curated destination city dataset

**Decision needed:** What data source resolves an arbitrary birth-place search (S02) to lat/lon + IANA timezone, separate from the curated 500–2,000 city "destination" list used for scoring (calc spec §10)?

**Context:** The calc spec's curated city dataset is sized for scoring targets (major cities worth ranking as a result), but birthplace search needs to resolve much smaller towns that will never appear as a result. These are two different jobs with two different size/coverage requirements.

**Options:**
- Bundle a larger free static gazetteer (e.g. a trimmed GeoNames extract, CC BY 4.0) purely for birthplace search, distinct from the smaller curated destination list.
- Restrict birthplace search to the same curated 500–2,000 city list (simpler, but many users' actual birth towns won't be selectable).

**Recommended option:** Separate, larger free static dataset for birthplace search (GeoNames-derived), distinct from the destination list.

**Impact:** Affects `src/data/*`, bundle size, and attribution requirements (cost constraint, CLAUDE.md §5/§15).

**Status:** INTERIM RESOLUTION 2026-09-03 for Milestone 3 UI work. Rather than block screen S02 on a separate dataset decision, `scripts/import-birthplaces.ts` reuses the already-approved GeoNames `cities15000.txt` (same source as the destination dataset) with no population/curation filtering (birthplace search needs small towns the destination list deliberately excludes) plus the IANA timezone column, emitting `src/data/birthplaces.json` (34,129 rows, ~4MB). This is **server-side only** (queried via `/api/place-search`, never shipped to the client bundle) since it's far too large for client-side search. This still does not resolve the underlying question of whether a broader/different gazetteer is wanted long-term -- revisit before public launch if 34,129 GeoNames-only towns feels insufficient (e.g. very small villages) or too GeoNames-specific.

---

## 2026-09-02 — Curated destination city dataset source/license

**Decision needed:** Which free dataset backs the ~1,000 curated destination cities (calc spec §10)?

**Context:** Both GeoNames and SimpleMaps' free "Basic" World Cities Database are zero-cost, but SimpleMaps' free tier restricts redistributing the database itself, while GeoNames is CC BY 4.0 (redistribution/modification explicitly permitted, attribution required).

**Decision:** GeoNames `cities15000.txt` + `countryInfo.txt` + `admin1CodesASCII.txt`. Curation pipeline: national capitals ∪ population≥750,000 ∪ top-3-by-population-per-country ∪ (pending) a reviewed manual allow-list for well-known relocation/study/work destinations under those thresholds, then greedy same-country metro de-duplication at 40km. Verified against the real 2026-09-03 GeoNames snapshot: 937 cities, 244/244 countries represented, 149 countries with ≥2 cities, 115 with ≥3.

**Impact:** `data/raw/geonames/` (raw source + `SOURCES.md` license note), `scripts/import-cities.ts` (import pipeline), `src/data/cities.json` + `src/data/cities.ts` (compiled output), attribution credit to GeoNames needed somewhere in the product (footer/about).

**Status:** APPROVED 2026-09-03 and imported. The manual allow-list addition is still pending a separate review pass before being merged in.

---

## 2026-09-02 — Stability "score spread" formula

**Decision needed:** The scoring spec §7 stability thresholds reference "scenario score spread ≤20%/≤45%" without defining spread precisely. Golden Case 001's own fixtures (Turku, Vienna) explicitly say stability is "HIGH or MEDIUM depending finalized threshold implementation... once chosen, freeze fixture."

**Context:** This determines exact Golden Test values for Milestone 1 scoring, not Milestone 0 calculation.

**Options:**
- `spread = (max(scores) - min(scores)) / baselineScore`
- `spread = (max(scores) - min(scores)) / max(scores)`

**Recommended option:** `(max - min) / baselineScore` — baseline is the user's actual entered time, the most meaningful denominator.

**Impact:** Affects `src/scoring/stability.ts` (Milestone 1) and the exact stability classification in frozen Golden Case 001 fixtures for Turku/Vienna/Oulu.

**Status:** OPEN — blocks finalizing Milestone 1 Golden Test fixtures, not Milestone 0.

---

## 2026-09-02 — ±1 hour birth-time uncertainty option

**Decision needed:** Screen spec S03 allows shipping only ±15/±30 minutes if ±1 hour creates "unacceptable calculation cost."

**Context:** The calculation engine itself supports arbitrary `uncertaintyMinutes` (0/15/30/60) with no architectural cost difference — the concern, if real, is client-side latency for 3 full scenario recomputations at UI time, not correctness.

**Options:** Ship all three (15/30/60) / ship only 15/30 initially.

**Recommended option:** Ship all three; revisit only if real-device latency testing in Milestone 3 shows a problem.

**Impact:** UI copy in S03 only; no calculation-layer impact.

**Status:** OPEN — low priority, revisit during Milestone 3 (UI).

---

## 2026-09-02 — Coherence fallback for influence pairs outside the 25 documented combination rules

**Decision needed:** 06-interpretation-library.md §3 documents coherence (HIGH/MEDIUM/LOW) for only 25 specific influence pairs out of 780 possible pairs. Most real cities' primary+secondary pairs won't match a documented rule.

**Context:** Implemented in `src/scoring/coherence.ts`. Falls back to a tension-based heuristic generalized from the documented examples' own pattern: two low-tension bodies (both <0.40 baseline tension) → HIGH; one high-tension body → MEDIUM; two high-tension bodies → LOW. A lone primary with no meaningful secondary → MEDIUM (nothing to cohere or conflict with). Also, where the source doc lists an ambiguous double label for one goal (e.g. "HIGH/MEDIUM Career"), the lower/more conservative label was picked; where labels visibly pair positionally with goals (e.g. "HIGH/MEDIUM Career/Love"), that pairing was used instead.

**Status:** IMPLEMENTED AS DEFAULT — not blocking, but worth product review since it materially affects most cities' coherence classification, not just the 25 documented examples. Revise `src/scoring/coherence.ts`'s `fallbackCoherence()` and the ambiguous-label choices in `src/scoring/combination-rules.ts` if the Product Owner wants different generalization rules.

---

## 2026-09-02 — Overall rating and Country ranking bonus/penalty scaling

**Decision needed:** Scoring spec §10 (Overall) and §11 (Country) both say "suggested internal weighting" without pinning the exact bonus/penalty curves (only the top-level percentages are given: 25/25/25/25 for Overall's base, 45/25/15/10/5 for Country).

**Context:** Implemented in `src/scoring/overall.ts` and `src/scoring/score-country.ts`:
- Overall: breadth bonus = 0.025 per goal scoring ≥4 stars (cap 0.10); stability bonus = average stability quality × 0.05; tension penalty = 0.025 per LOW-coherence goal (cap 0.10).
- Country: "qualifying" city threshold = 0.45 internal score (the spec's own 3-star threshold); CORRIDOR requires ≥2 qualifying cities with second/best score ratio ≥0.7; ANCHOR otherwise when the best city qualifies alone; no small-country five-star exception is implemented (§11 allows one "if documented" -- none is).

**Status:** IMPLEMENTED AS DEFAULT — verified against Golden Test fixtures S007, S008, and synthetic fixtures 9-10, all pass. Revise the constants in those two files if the Product Owner wants different curves; nothing else in the pipeline depends on the specific values.

---

## 2026-09-02 — Moon has no top-level archetype category

**Decision needed:** 06-interpretation-library.md §4's 12 narrative archetypes assign every body a category (Sun→VISIBILITY, Jupiter→EXPANSION, etc.) except Moon, which only appears via the BELONGING case ("Moon/Jupiter/Venus IC"). A city whose primary is Moon-MC, Moon-ASC, or Moon-DSC has no documented top-level archetype, even though §2 gives each of those its own specific narrative title ("The Public Feeling Place", "The Sensitive Self Place", "The Emotional Partnership Place").

**Context:** Implemented in `src/scoring/archetype.ts`: falls back to `UNCLASSIFIED` for Moon on any angle other than IC. This only affects the coarse `archetypeId` classification used for cross-city pattern grouping -- the specific per-influence interpretation text (Milestone 2's 40-entry library) is unaffected and still has full Moon coverage.

**Status:** OPEN, low priority — no Golden Test fixture has Moon as a primary influence, so this doesn't block any gate. Revisit if the Product Owner wants Moon folded into an existing category (e.g. always BELONGING) or given its own.

---

## 2026-09-02 — "How this place may feel" line for the weak/mixed-result fallback

**Decision needed:** 05-result-content-framework.md §12 gives approved copy for the weak/mixed-result headline ("Your map is more mixed for this goal...") but the schema still requires a `howItMayFeel` one-sentence field, and no approved line exists for the no-primary-influence case specifically (every one of the 40 library entries' `feel` lines assumes a primary influence exists).

**Context:** Implemented in `src/interpretation/compose-city-story.ts`'s `composeWeakResult()`: uses "Like the signal here is more mixed than clear." -- a minimal, non-evocative filler that echoes the approved headline's own "mixed" language rather than introducing new imagery, kept deliberately flat since there's no real influence to draw a feeling from.

**Status:** IMPLEMENTED AS DEFAULT — low stakes (this is literal filler text for a low-star edge case, not a claim), but flagging since it's the one sentence in the whole interpretation layer not sourced from the approved library or spec verbatim. Product Owner may want to approve specific wording for this case.

---

## 2026-09-05 — Added S05b (View Mode) step: choose City vs Country lens before seeing results

**Decision needed:** none -- directly requested and approved by the Product Owner.

**Context:** City ranking and country ranking are computed by completely different formulas (04-scoring-ranking-spec.md §11: country score = 45%/25%/15%/10%/5% weighting of best/2nd/3rd city + breadth + stability, not a simple rollup of city scores). Showing both lists on one results page (S06) meant a city inside a top-3 country's "best matches" could carry the same stars as a global top-3 city yet not itself appear in the top-3 city list -- read by users as an inconsistency/bug rather than two different rankings.

Implemented as a new required step, S05b, inserted right after S05 Calculating finishes: the user picks "By city" or "By country", each with a one-line explanation of what that ranking means and an explicit note that the two lists are scored differently. `journey.viewMode` ("city" | "country") is persisted in session state (`src/app/journey/types.ts`). S06 (`src/app/results/page.tsx`) now renders only the section matching the active mode, with a compact switch control to flip modes instantly without re-fetching (`/api/calculate`'s response already includes both `results` and `countries`). Landing on S06 directly with no `viewMode` set (e.g. back-button navigation) redirects to S05b.

**Status:** APPROVED / IMPLEMENTED. Full doc: `docs/02-user-flow-screen-spec.md` S05b and S06.

---

## 2026-09-05 — Star rating shows one decimal (e.g. 4.2) instead of only a whole number

**Decision needed:** none -- directly requested and approved by the Product Owner, reverting the ombre-bar experiment from the same day.

**Context:** The bar-chart replacement for stars (previous entry above) didn't read as clearly to the Product Owner in practice. Reverted to ★ glyphs, but with the underlying granularity problem still solved: `scoreToDisplayValue()` (`src/scoring/score-city.ts`) interpolates `internalScore` within the *final, guardrail-capped* star tier's own bound (reusing `scoreToStars`'s existing thresholds, not a new set of numbers) to produce a decimal in `[stars.0, stars.9]`, capped so it can never round up into the next whole star -- so a result capped by S002/S003/the tension guardrail/country's five-star qualifying-city rule still reads as at most e.g. "4.9", never "basically a 5". The 5-star tier always displays flat as "5.0" (the scale's ceiling; nothing above it). `StarRating.tsx` shows the filled-star count from the real `stars` value, with this decimal printed alongside it.

Read as compliant with CLAUDE.md §11 ("User sees 1–5 stars, not 0–100"): the number shown is a decimal on the 1–5 star scale itself, not the raw internal composite score (which is still 0–1 and never rendered) or a 0–100/percentage figure.

**Status:** APPROVED / IMPLEMENTED. See `scoreToDisplayValue` and its tests in `tests/scoring/score-city.test.ts`.

---

## 2026-09-05 — Unified ranking: star tier now the primary sort key everywhere (scoring v0.2)

**Decision needed:** none -- directly requested and approved by the Product Owner, after they spotted the underlying cause themselves.

**Context:** Global Top City selection/order and a country's own best/second/third-city selection were both sorted by raw `internalScore` alone. A result whose star tier is capped below its raw score by a guardrail (CLAUDE.md §11: S002 no influence within 500km, S003 TIME_SENSITIVE, the tension+LOW-coherence cap, or a country's five-star qualifying-city rule) could therefore still legitimately outrank an *uncapped* result from a higher star tier shown elsewhere on the same page (e.g. a "4 stars" city ranked #1 globally, above a "5 stars" city inside a country's best-matches list). This was mathematically inevitable, not a bug in either individual formula -- but reads as a contradiction once both are visible together, and became sharply visible once decimal granularity was added to the star display the same day (see the two entries above).

**Change:** Added `compareByStarsThenScore()` (`src/scoring/rank-order.ts`): sorts by `stars` descending first, `internalScore` descending only as a tiebreak within the same tier. Applied consistently everywhere a ranking/selection decision is made (`src/app/api/calculate/route.ts`: the global city sort feeding Top City, the per-country city sort feeding a country's best/second/third selection, and the country-vs-country sort; `src/scoring/dedupe.ts`: which city represents a ~100km cluster). A capped result can now never outrank an uncapped higher tier anywhere in the app -- the two contexts (Top City vs. a country's "best matches") use the same mechanism instead of two that could silently disagree.

This changes ranking/selection order (not any individual city's own `internalScore` or `stars`, and not any scoring weight/threshold), so `MODEL_VERSIONS.scoring` was bumped 0.1 → 0.2 per CLAUDE.md §3/§16. No Golden Test asserts cross-city ranking order via the API route (`tests/golden/*` test `scoreCity`/`computeCountryResult` in isolation on fixed inputs), and `tests/scoring/dedupe.test.ts`'s fixtures use uniform `stars` values, so the tiebreak-by-score behavior there is unchanged; all 139 tests pass unmodified except the new `tests/scoring/rank-order.test.ts` added to cover the comparator itself.

Also reverted the same-day ombre-bar and printed-decimal star experiments: `StarRating.tsx` now shows a **partial visual fill** on the star glyphs (e.g. ~30% of a star tinted for a 0.3 fraction) instead of any printed number, per explicit PO instruction: "không muốn hiển thị số... muốn 0.2/0.3 thể hiện bằng 1/3 ngôi sao được tô màu đen". The underlying `scoreToDisplayValue()` fraction math (previous entry) is unchanged and now drives fill percentage instead of printed text.

**Status:** APPROVED / IMPLEMENTED.
