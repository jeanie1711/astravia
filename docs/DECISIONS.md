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

**Status:** SUPERSEDED 2026-09-05 by the canonical framework rewrite (see the "Step 3/3" entry below) — `src/scoring/combination-rules.ts` no longer exists, and coherence is now a pure category-pair rule with no fallback/lookup-miss case at all. Kept here for history only; do not use this entry to guide current code.

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

---

## 2026-09-05 — Guardrails now cap the score itself, not just the star label (scoring v0.3, supersedes the v0.2 entry above)

**Decision needed:** none -- directly requested and approved by the Product Owner, who pushed back on the v0.2 fix above with the right question: guardrails should act on the score, since stars are supposed to be nothing more than a friendly representation of it. Sorting by "stars, then score" (v0.2) was treating the symptom; this fixes the actual cause.

**Change:** Replaced `compareByStarsThenScore`/`rank-order.ts` (removed) with a simpler, more correct mechanism: every guardrail in `src/scoring/score-city.ts` (S001 no relevant line, S002 no influence within 500km, S003 TIME_SENSITIVE, the tension+LOW-coherence cap) and `src/scoring/score-country.ts` (five-star qualifying-city rule) now caps `internalScore` itself -- to just under the threshold of the tier it's meant to prevent (`preventTierAndAbove()`, e.g. 0.7799 to prevent 5 stars) -- instead of computing `stars` and then overriding the label afterward. `stars` is now, everywhere, always exactly `scoreToStars(internalScore)` with zero exceptions. Ranking reverted to plain `internalScore` descending (`route.ts`, `dedupe.ts`) since it's now automatically consistent with displayed stars by construction -- no special comparator needed at all.

**Spec note:** `04-scoring-ranking-spec.md` §9 phrases these rules in star-label terms ("cannot receive ★★★★★", "may be capped at ★★★☆☆"), separately from §8's score formula. This implementation folds the two together -- functionally equivalent for any single city's own displayed rating, but `internalScore` now means "the score after safety adjustments" rather than "the pure formula output," which is a real reinterpretation of where §9 sits relative to §8. Approved directly by the Product Owner; flagging here per CLAUDE.md §3.

**Test impact:** `tests/scoring/score-city.test.ts`'s S002 test updated (now asserts `internalScore < 0.78` instead of `>= 0.78`, since the old assertion specifically checked the behavior being replaced). Added a regression test asserting `stars === scoreToStars(internalScore)` across every guardrail-triggering scenario. No Golden Test fixture triggers a guardrail with an asserted exact `internalScore` value, so `tests/golden/*` are unaffected. 137/137 tests pass.

**Status:** APPROVED / IMPLEMENTED.

---

## 2026-09-05 — Canonical Astrocartography framework: proposed, then approved and adopted the same day

**Decision needed:** Whether to replace the current scoring/interpretation framework (04/06) with one that minimizes invented elements, per the Product Owner's standing question about how much of the app is "real" astrocartography vs. product invention (raised earlier this session, deferred while more concrete UI work was prioritized).

**Context:** At the Product Owner's explicit request, wrote a full proposal spec: `docs/PROPOSAL-canonical-framework.md`. It replaces the 40-entry per-goal relevance matrix and per-planet "baseline tension" table with a 4-category traditional planet classification (Personal/Benefic/Malefic/Transformative) driving narrative tone, adds real parans (currently excluded per `03-astro-calculation-spec.md` §1), and simplifies the coherence/scoring formulas accordingly. It explicitly overrides `04-scoring-ranking-spec.md` §4's "do not classify planets as benefic/bad" policy at the internal-classification level, while keeping the actual user-facing language rule (never "good/bad", never fatalistic -- CLAUDE.md §12/§13) intact at the copy layer.

**Recommended option:** See the proposal document's own §9 -- options are adopt in full, adopt partially (parans + planet categories only, keeping today's score shape), or shelve.

**Impact:** Sized as a full rewrite of Milestones 1-2, would invalidate every Golden Test fixture's expected numeric values, and needs its own Golden Test suite authored and approved before any implementation, per CLAUDE.md §8/§9/§19.

**Update, same day:** Product Owner approved the proposal in full. `docs/03-astro-calculation-spec.md`, `docs/04-scoring-ranking-spec.md`, and `docs/06-interpretation-library.md` were rewritten to v0.2 to reflect it (relevance matrix + tension table → 4-category classification; 25-pair coherence table → 3-tier rule; 5-term score → 2-term richness formula; parans moved from out-of-scope to approved-pending-its-own-geometry-spec).

**Status: APPROVED, implementation pending.** No production code changed by the doc updates. `04-scoring-ranking-spec.md` §16 tracks exactly which pieces are implemented (only the score-level guardrail mechanism, already shipped in v0.3 scoring — see the entry above) vs. still pending a dedicated Golden Test suite per CLAUDE.md §8/§9/§19 before any further code changes. Full detail in `docs/PROPOSAL-canonical-framework.md`.

---

## 2026-09-05 — Step 3/3: canonical framework implemented (scoring/interpretation v1.0)

**Decision needed:** none -- final implementation step of the Product Owner-approved rewrite (see the two entries above and `docs/PROPOSAL-canonical-framework.md`).

**Change:** Implemented `04-scoring-ranking-spec.md` v0.2 and `06-interpretation-library.md` v0.2 in full, except parans (still spec-only, `03-astro-calculation-spec.md` §19):
- `src/scoring/category.ts` (new, replaces `relevance.ts`): `planetCategory()` (4-category classification) and `angleDomain()` (angle -> life-domain, the 4 scorable goals).
- `src/scoring/select-influences.ts`: primary must match the goal's domain (strict, no partial credit for a non-matching angle -- the single most significant behavior change from v0.1); secondary has no domain restriction.
- `src/scoring/internal-score.ts`: 2-term richness formula (`primary.strength + 0.5*secondary.strength`) replaces the 5-term v0.1 formula. No per-candidate tension discount anywhere.
- `src/scoring/coherence.ts`: 3-tier category-pair rule (Reinforcing/Layered/Complex-effortful) replaces the 25-pair lookup table. `combination-rules.ts` deleted.
- `src/scoring/score-city.ts`: `1.3` score normalizer added (`docs/07-golden-test-cases.md` §10 explains why); guardrail conditions updated to key off category instead of the removed tension number.
- `src/interpretation/combinations.ts`: category-tier synthesis templates (built from each influence's own already-approved `coreTheme`/`tradeOff` text) replace the 25 hand-authored phrases. Always returns a value now (category-pair coverage is exhaustive), so `compose-city-story.ts`'s fallback-on-undefined branch was removed as dead code.
- `MODEL_VERSIONS.scoring` and `.interpretation` bumped to `"1.0"` (a full methodology generation, not an incremental bump).

**Real design correction found during implementation, not during spec authoring:** secondary selection must exclude the primary's own body. A body's MC and IC longitudes are always exactly 180° apart, placing them on the *same* meridian great circle -- so a city's distance to a body's MC line and to that same body's IC line are always identical. Without excluding same-body candidates, whenever a body was selected as primary via MC (or IC), its own IC (or MC) counterpart would mechanically tie for the strongest remaining candidate and become "the secondary" -- not a second signal, just the same line from its other angle. v0.1 avoided this by accident (the opposite angle's per-goal relevance was usually low, suppressing it); v0.2 has no such accidental suppression since candidate strength no longer depends on goal at all. Found by running the real Golden Case 001 birth chart against the new code (Stockholm's secondary was initially "Sun-IC" instead of the expected "Neptune-ASC") -- exactly the kind of thing synthetic fixtures alone would not have caught. Documented in `04-scoring-ranking-spec.md` §5.

**Test impact:** `select-influences.test.ts`, `archetype.test.ts`, `dedupe.test.ts`, `overall.test.ts`, `score-country.test.ts` updated for the new `CandidateInfluence`/`CoherenceLabel` shapes; `score-city.test.ts`'s v0.1 "synthetic fixtures (07 §8)" describe block retired and replaced with the v0.2 fixtures from `07` §10 (RICH-01/02/03, DOM-01); `interpretation/combinations.test.ts` rewritten for category-tier behavior (no more "undocumented pair returns undefined" case -- coverage is now exhaustive); `golden/case-001-scoring-behavior.test.ts`'s Stockholm fixture confirmed coherence relabels HIGH/MEDIUM/LOW -> REINFORCING/LAYERED/COMPLEX_EFFORTFUL with no other change, but its Lisbon fixture's primary genuinely changed identity (Jupiter-IC -> Mars-IC, since v0.1's relevance weighting let Jupiter-IC outrank a closer Mars-IC, which v0.2's pure-proximity selection no longer does) and was rewritten to assert the new, correct behavior with the reasoning inline. All 140 tests pass.

**Status:** APPROVED / IMPLEMENTED. Remaining: parans (`src/astro/parans.ts` per `03-astro-calculation-spec.md` §19) -- the one piece of the approved framework not yet coded.

---

## 2026-09-05 — Parans implemented (closes the v0.2 canonical framework)

**Decision needed:** none -- final piece of the approved framework (see the "Step 1/2/3" entries above and `docs/PROPOSAL-canonical-framework.md`).

**Change:** Implemented the geometry specified in `03-astro-calculation-spec.md` §19 and wired it into scoring:
- `src/astro/parans.ts`: closed-form solver for MC/IC×ASC/DSC pairs, deterministic sampling + fixed-30-iteration bisection for ASC/DSC×ASC/DSC pairs, MC/IC×MC/IC excluded. Verified against hand-computed cases and self-consistency checks (`tests/astro/parans.test.ts`) -- **not** cross-checked against any third-party ACG software or published paran table (`03` §19.9 flags this explicitly as still open).
- `src/astro/paran-proximity.ts`: exact city-to-paran distance (a paran has no longitude dependency, so the nearest point is always along the city's own meridian).
- `src/scoring/select-influences.ts`: a paran is only eligible for the reinforcement role when it involves the primary's exact body+angle; the other side becomes `paranReinforcement`, winning over the plain secondary only if it's strictly stronger.
- `src/scoring/internal-score.ts`/`stability.ts`: **parans are baseline-instant only, not tracked across the three birth-time uncertainty scenarios.** Deliberate scope decision, not an oversight -- a paran can only add reinforcement on top of an already-selected primary, so it can't change which stability tier a result lands in, only nudge the score within that tier. Including a paran bonus asymmetrically on just the baseline scenario would otherwise inflate the measured spread and risk misclassifying stability as an artifact of where the bonus happens to be computed.
- `RankedCity.paranInfluence` / `CityResult.paranInfluence` (new field): named as its own distinct signal in a City Story ("A paran of X and Y also sits close by"), never folded into `secondaryInfluences` -- matches `06-interpretation-library.md` §5's instruction.
- `src/app/place/[cityId]/page.tsx`: renders a paran as its own labeled row ("Paran"), distinct from "Primary"/"Secondary".

**Test impact:** `tests/astro/parans.test.ts` (new, geometry), `tests/scoring/select-influences.test.ts` and `tests/scoring/score-city.test.ts` (new paran-reinforcement cases), `tests/interpretation/compose-city-story.test.ts` (new paran-narrative case). All existing tests pass unmodified with `cityParans` defaulting to `[]` (fully backward compatible). 157/157 tests pass.

**Status:** APPROVED / IMPLEMENTED. The v0.2 canonical Astrocartography framework (`docs/PROPOSAL-canonical-framework.md`) is now complete in full.

---

## 2026-09-05 — FIXED: pre-existing city-to-line distance computation was very slow, and had a latent correctness bug

**Decision needed:** none -- fixed the same day, per explicit Product Owner request after the initial finding was reported.

**Context:** While measuring the performance impact of the paran feature (itself well under 100ms per request), discovered that the *existing*, unrelated `computeCityDistancesAtInstant` (`src/astro/city-proximity.ts`, pre-dates this session entirely) took approximately **7.4 seconds** for one scenario instant across the full ~955-city dataset (confirmed linear in city count via 10/50/100/200-city measurements). A full `/api/calculate` request repeats this **three times** (lower/baseline/upper, per G007) before any scoring even begins -- roughly 22s+ for a single-goal request, worse for OVERALL. Never load-tested before (Milestone 4's performance item had been pending since the project's start) and very likely at or beyond typical Vercel serverless timeouts.

**Two distinct root causes were found and fixed, not one:**

1. **`distanceToSegmentKm` had a latent correctness bug, not just a performance one.** Its along-track distance used `acos`, which only returns values in `[0, π]` and therefore cannot distinguish the perpendicular foot from `point` landing *between* segment endpoints `a` and `b` from landing an equal angular distance *behind* `a` (off the far end, outside the segment). Both cases produced the same positive "alongTrack" number, so a query point nearly opposite `b` as seen from `a` could wrongly pass the `alongTrack <= deltaSegment` check and return a small cross-track distance to a foot that was never actually on the segment -- instead of correctly falling back to the nearer endpoint. Fixed by computing along-track distance with `atan2(sin(delta13)*cos(theta13-theta12), cos(delta13))` instead, which preserves the sign (negative = behind `a`). This bug predates this session and has been in `src/astro/geo-distance.ts` since Milestone 0; it affects every ASC/DSC line-to-city distance ever computed by this codebase, though it apparently never triggered on any of the documented Golden Case fixtures (all existing Golden Tests still pass unmodified after the fix). **Found only because** a new brute-force cross-check test (added for the performance fix below) disagreed with the optimized version, which turned out to be correctly exposing a bug in the *original* function both versions call -- not a bug in the optimization itself.

2. **Performance: `distanceToPolylineKm` brute-force checked every city against every one of a polyline's ~700 sampled points, with no pruning.** Fixed with an exact (not approximate) optimization: for each segment, `max(distance(point,a), distance(point,b)) - segmentLength` is a rigorous lower bound on that segment's true minimum distance to `point` (triangle inequality -- valid for any segment shape, unlike an earlier draft of this fix that bounded by latitude alone, which a brute-force cross-check test also caught as unsound: a great-circle segment can bulge to a latitude beyond either endpoint's own latitude, invalidating a latitude-only bound). Segments whose bound already exceeds the best distance found so far are skipped without the expensive exact computation. Segment lengths are cached per polyline (`WeakMap`, keyed by array identity) since the same polyline is queried once per city (~955 times) and a segment's length never depends on the query point.

3. **Separately found, same investigation: `computeCityInfluencesAcrossScenarios` (`src/astro/sensitivity.ts`) was O(n^2).** It matched each of the ~38,000 baseline (city, body, angle) entries against the other two scenarios' results using `Array.find` -- a linear scan repeated per entry. Fixed by indexing each scenario's distances into a `Map` once (O(n)) and looking up by key (O(1)).

**Verification:** `tests/astro/geo-distance.test.ts` cross-checks the optimized `distanceToPolylineKm` against a naive brute-force reference across multiple synthetic curves and ~60+ random query points (including points on the opposite side of the globe and beyond the curve's latitude range) -- this is what caught both the along-track sign bug and the latitude-only-bound unsoundness before either shipped. All 161 tests pass, including every existing Golden Case fixture, unmodified.

**Measured result (real ~955-city dataset, same birth chart used throughout this session):**

| Step | Before | After |
|---|---:|---:|
| `computeCityDistancesAtInstant`, 1 instant | ~7.4s | ~1.4s |
| Full 3-scenario line computation | ~36s (measured for a single-goal request, unindexed) | ~6.0s |
| Scoring all 955 cities × 4 goals (OVERALL) | negligible | ~90ms |
| **Full OVERALL-goal request, end to end** | ~36s+ | **~6.1s** |

About a 5.9x overall speedup. Measured locally via `tsx` (not the compiled Next.js/Vercel runtime, which may differ, likely favorably) -- real production timing on Vercel has still not been directly measured and should be verified before relying on this number for a launch decision.

**Status:** FIXED. Not yet verified on the actual deployed Vercel environment -- recommend a real production timing check before considering Milestone 4's performance item fully closed.

---

## 2026-09-06 — Full visual/IA redesign brief: scope split into Phase 1 (done) and Phase 2 (pending), plus two methodology-adjacent calls

**Decision needed:** The Product Owner supplied a 13-section redesign brief (palette, Home page IA, view-mode copy, results-page hero/map/card density, scoring-label clarity, Overall restructure, "Your Pattern" rewrite, country discovery framing, City Story restructure, micro-interactions, brand header) plus one new feature request ("What matters most in this chapter?" -- up to 3 chips from 8 life-priority options). Given the size, three sub-decisions were asked via AskUserQuestion before implementing anything.

**Decisions made (approved by Product Owner):**

1. **"What matters most" chips map onto the 4 existing goals** (e.g. "A meaningful career" -> CAREER, "Deeper relationships" -> LOVE), used only to pre-select/reorder which goal tab opens first. Explicitly **not** a new scoring input -- internalScore/ranking math is unchanged, so no version bump or new Golden Tests are needed for this alone. Still **not implemented** (Phase 2): needs its own new selection screen plus a mapping table and default-tab wiring in `results/page.tsx`/`journey/types.ts`.
2. **A simplified static SVG map (world map on results, mini map on country cards) will be built**, tap-a-pin-to-open-preview only -- no pan/zoom, no line rendering. Judged meaningfully smaller than the "interactive astrocartography map" CLAUDE.md §4 lists as out of scope (that phrase refers to the full line-based map with pan/zoom). **Not implemented yet** (Phase 2) -- real new component, needs its own city-coordinate-to-SVG-projection work.
3. **Sequencing: Phase 1 now (self-contained, no new components), Phase 2 later** (map, results-page hero card for #1, country "discovery type" labels which need a new familiarity heuristic, consistent brand header, save-place bookmarking, and animation/micro-interaction polish).

**Phase 1 implemented this session (no methodology/scoring changes, presentation and copy only):**
- `src/app/globals.css`: new palette tokens (`--color-sky`/`-bg`, `--color-sage`/`-bg`, `--color-sun`/`-bg`) reserved for icon/chip/highlight use only, per Product Owner's explicit instruction not to turn the app multicolored; existing ivory/navy/coral tokens adjusted to the requested exact hex values.
- `src/app/components/StarRating.tsx`: star-tier word labels renamed (Exceptional -> Strongest match, Strong -> Strong match, Mixed -> Layered match -- "Mixed" read as a poor result rather than "opportunity alongside challenge"); added an optional `caption` prop ("Match strength") so the star row doesn't get confused with birth-time confidence, used on results-page cards and the City Story hero.
- `src/app/results/page.tsx`: Overall is no longer a 5th pill alongside the 4 goals -- replaced with a two-tab segmented control ("By life area" / "Whole picture"); the persistent dark explainer box was removed and replaced with a dismissible tooltip that auto-shows once (localStorage-gated: `astravia_overall_info_seen`) and can be re-opened via a small "i" affordance. "Your Pattern" renamed "Your location story" with short pattern chips added. Country narrative badges now show plain-language text (Strong city cluster / Standout city / Mixed strengths) instead of the raw `CORRIDOR`/`ANCHOR`/`MIXED` enum text.
- `src/interpretation/compose-pattern.ts`: `detectPattern` now returns `{ sentence, chips }` instead of a bare string -- each existing branch got a small, fixed chip set describing that same already-approved sentence, not new interpretive claims. `CalculateResponse.pattern` type updated to match (`src/app/journey/types.ts`); `tests/interpretation/compose-pattern.test.ts` updated to the new shape.
- `src/app/explore/view-mode/page.tsx`: city/country option cards shortened to an icon + one-line tagline + one-sentence description (were two-sentence paragraphs).
- `src/app/page.tsx`: the four MC/IC/ASC/DSC angle cards are no longer shown by default -- replaced with a two-sentence "How Astravia finds your places" lead-in and a "How astrocartography works ->" toggle (same collapse pattern already used for the City Story's technical-astrology section) that reveals the full explainer + angle cards + planet note. The footer illustration moved up to right after the primary CTA.
- `src/app/place/[cityId]/page.tsx`: restructured per the Product Owner's proposed order (hero -> confidence -> short version -> opportunity/watch-out two-column -> feel -> best-for -> why-Astravia-picked-it with the technical-astrology toggle nested inside -> save/share). **Fixed a real content bug**: `story.tradeOffs.join(" ")` was rendering the trade-off keyword array as one run-on sentence with no connecting words (visible in the Product Owner's screenshot, e.g. "control struggles intensity obsession..."); now rendered as a bulleted list like the opportunities column, which uses the same already-approved short-phrase content correctly instead of concatenating it into prose. This is a presentation-layer fix, not a content-library rewrite -- turning the existing approved phrases into full natural sentences (as the Product Owner's own example draft did) would be a content-authoring change to the 40-entry library and needs separate PO sign-off before that's attempted.

**Not done (explicitly Phase 2, tracked here so a future session picks up the right scope):** world/country map, results-page hero card for the #1 result, reduced card density (goal/rating/classification currently repeat across several places on one card), country "discovery type" labels (Familiar possibility / Unexpected match / etc. -- needs a new familiarity heuristic, itself a product decision), the "What matters most" selection screen, consistent brand header across screens, save-place bookmarking, and micro-interaction/animation polish.

**Status:** Phase 1 APPROVED / IMPLEMENTED (typecheck clean, 161/161 tests pass). Phase 2 OPEN.
