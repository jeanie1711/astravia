# Scoring & Ranking Specification v0.2 (Canonical Framework)

> **Approved and implemented 2026-09-05** (`MODEL_VERSIONS.scoring = "1.0"`). Supersedes v0.1 below. See `docs/PROPOSAL-canonical-framework.md` for the full rationale and `docs/DECISIONS.md` for the approval and implementation record. Parans (§5.1) remain specified but not implemented — see §16 (Implementation status) for exactly what's live.

**Purpose:** Convert deterministic city-line calculations into transparent 1–5 star recommendations, while minimizing invented/arbitrary machinery and relying on real, broadly-taught astrocartography (ACG) and traditional astrology knowledge wherever the product's requirements allow it.
**Core rule:** Stars represent **proximity + reinforcement + coherence + stability**, not luck, destiny, probability, or scientific certainty.

## 1. User-visible star meanings

| Stars | Label | Meaning |
|---|---|---|
| ★★★★★ | Exceptional | Strong, coherent and stable fit for the selected goal |
| ★★★★☆ | Strong | Clearly supportive, with meaningful trade-offs |
| ★★★☆☆ | Mixed | Meaningful potential with notable competing/challenging signals |
| ★★☆☆☆ | Challenging | Strong influence exists but aligns poorly or inconsistently with the goal |
| ★☆☆☆☆ | Weak | Little meaningful support for the selected goal |

Do not display internal numeric score in MVP.

## 2. Goals

MVP goals:
- Career
- Love & Relationships
- Home & Family
- Personal Growth
- Overall

## 3. Scoring model

For each city and goal:

```text
Richness (closest relevant line + capped reinforcement from a second line or paran)
+ Coherence adjustment
+ Stability adjustment
= Internal Goal Score
→ 1–5 stars
```

Internal score exists only for deterministic ranking, and is never itself the product of a per-planet "tension multiplier" (see §4) — that was v0.1's invented mechanism. Richness comes from proximity and reinforcement alone; a body's traditional nature (§3.2) shapes the **narrative**, not the number. This is a real, user-visible behavioral change from v0.1: a Mars- or Saturn-flavored result is no longer implicitly scored lower for being "tense" — it ranks purely on how close and how reinforced it is, exactly as a Venus- or Jupiter-flavored result would.

### 3.1 Distance strength (unchanged from v0.1)

```ts
function distanceStrength(km: number): number {
  if (km >= 750) return 0;
  // smooth quadratic decay
  const x = km / 750;
  return 1 - x*x;
}
```

This gives a 0–1 strength. The general shape (closer = stronger, smooth falloff, cutoff around several hundred km) reflects the one broadly-taught ACG principle that is quantifiable in spirit; the exact exponent and the 750 km cutoff remain a modeling choice, not something sourced from a specific ACG author — say so in any documentation/copy that references it.

### 3.2 Planetary nature classification (replaces the v0.1 goal-relevance matrix and per-planet tension table)

v0.1 hand-tuned a 1–5 relevance number for all 40 (body × angle) combinations across 4 goals — 160 invented numbers, and its own text called the result *"an editorial product hypothesis, not an astronomical fact."* It also carried a separate, invented "baseline tension" multiplier per planet (0.08–0.50) with no traditional source.

Both are replaced by one classification, into exactly one of four categories per body, drawn from real, broadly-taught tradition:

| Category | Bodies | Traditional basis |
|---|---|---|
| **Personal** | Sun, Moon, Mercury | The "personal planets": identity, emotion, communication/thought. Neither benefic nor malefic — quality follows the angle, not the planet. |
| **Benefic** | Venus, Jupiter | Classical benefics since Hellenistic astrology: ease, harmony, growth, opportunity, wherever they fall. |
| **Malefic (classical)** | Mars, Saturn | Classical malefics: friction, effort, consequence. Mars = conflict/drive/assertion. Saturn = restriction/responsibility/delay. Traditionally "hard," never "bad." |
| **Transformative (modern)** | Uranus, Neptune, Pluto | Added by post-1781 astrology; most modern ACG authors treat these as their own category — intensifying and disruptive-but-purposeful, not simply malefic. Uranus = sudden change/rebellion. Neptune = dissolution/idealism/spirituality. Pluto = deep transformation/power. |

This supersedes v0.1 §4's *"Do NOT classify planets globally as benefic/bad"* rule. That rule's real concern — never telling a user a planet or a place is simply "bad," never fatalistic language — is a **language rule** (CLAUDE.md §12–§13), not a reason to avoid a real, traditional classification. The two concerns are now separated: the classification is used internally to select a narrative tone; user-facing copy still always uses effort/reward framing, never "good/bad" (§4 below, and 06 §Combination rules).

Category, together with the angle (§3.3), replaces the entire 160-number relevance matrix: a body's fit for a goal is no longer independently hand-tuned per goal — it follows from which angle it's on (the goal's domain) and which category it belongs to (the story's tone).

### 3.3 Angle → life domain (already implemented; stated explicitly here as the other half of §3.2's replacement)

| Angle | Life domain |
|---|---|
| MC | Career, public life, direction, reputation |
| IC | Home, roots, family, private foundation |
| ASC | Identity, self-presentation, how you meet the world |
| DSC | Relationships, partnerships, significant others |

Near-universal consensus across ACG literature since Jim Lewis's original method; unchanged from how the app already labels influences today.

## 4. Support, tension, and tone

Every influence's story tone comes directly from its category (§3.2), never from a separate numeric multiplier:

- **Personal** on an angle → the domain's theme, expressed directly and personally.
- **Benefic** on an angle → the domain's theme, expressed with ease and opportunity.
- **Malefic** on an angle → the domain's theme, expressed with effort and responsibility — powerful but demanding, never "bad."
- **Transformative** on an angle → the domain's theme, expressed through change and reinvention.

There is no separate `tensionPotential` number and no per-planet "baseline tension" table (v0.1 §4's table is removed). Category alone drives which of the four tones the Interpretation Library (`06`) selects for a given (body, angle) combination.

## 5. Primary, secondary, and paran influences

Candidate influence if distance < 750 km (unchanged).

Primary:
- highest `distanceStrength` among candidates whose angle matches the current goal's domain (§3.3)
- must exceed configurable minimum `0.35`

Secondary / reinforcing:
- the next meaningful candidate **from a different body than the primary** (from any angle/domain — domain-matching is a primary-only requirement; a secondary from a *different* domain is exactly what makes the Layered coherence tier meaningful, §6), **or a paran involving the primary's angle** (§5.1) if one exists and is closer/stronger than the next plain candidate
- must exceed `0.20`

**Why "different body" is required, found during implementation against real Golden Case data (not a synthetic fixture):** a body's MC and IC longitudes are always exactly 180° apart, which places them on the *same* meridian great circle — so a city's distance to a body's MC line and to that same body's IC line are always identical. Without this rule, whenever a body is primary via MC (or IC), its own IC (or MC) counterpart would mechanically tie for the single strongest remaining candidate and become "the secondary" — not a second signal at all, just the same line seen from its other angle. v0.1 avoided this by accident, since that opposite angle's per-goal relevance was usually low; v0.2 has to rule it out explicitly, since a candidate's strength no longer depends on goal at all.

**Real behavior change from v0.1, worth stating plainly:** because the primary must match the goal's domain and there is no per-goal relevance discount any more (§3.2), a line on a *non*-matching angle now contributes **nothing** to that goal's primary selection — not "weakly," as v0.1's relevance-1 entries did, but literally zero. A city with only a Sun-IC line and nothing else within 750 km scores very weakly for Career (no MC/IC.. domain match) while scoring strongly for Home (IC matches) from the exact same input. v0.1 would have given Career a small non-zero contribution from that same Sun-IC line (relevance 1/5). This is intentional — it follows directly from treating the angle-domain mapping as the real, canonical signal (§3.3) rather than a soft, product-invented weighting — but it is a materially different number for some cities, and Golden Test fixture R4 (§16 tracker; see `07-golden-test-cases.md`) locks in exactly this case so it's never "fixed" back to v0.1's behavior by accident.

Never select more than four visible key influences in MVP (unchanged from v0.1).

### 5.1 Parans (geometry specified 2026-09-05 — see `03-astro-calculation-spec.md` §19; not yet implemented in code)

A paran is the latitude at which two planetary lines are simultaneously angular (rising, setting, culminating, or anti-culminating) for an observer there — a real, distinctive ACG concept, and one ACG literature treats as often more specific than a single line alone, because it blends two influences at a latitude band valid across every longitude on it.

The full geometry (closed-form for MC/IC×ASC/DSC, numerical root-finding for ASC/DSC×ASC/DSC, city-to-paran distance) is specified in `03-astro-calculation-spec.md` §19. A paran is eligible as a reinforcing signal in richness (§6/§8 below) exactly like a second nearby line, scored by the same `distanceStrength()` curve applied to its one-dimensional (latitude-only) distance, and is surfaced as its own named signal type in a City Story, distinct from "a second nearby line" (`06-interpretation-library.md` §5).

## 6. Coherence

Coherence measures whether the primary and secondary/paran influences tell a compatible story. It is a function of the **pair of categories (§3.2)** involved — not of domain/angle at all (domain match is irrelevant here; two influences on the same angle can still be a mismatched category pair, and two on different angles can still both be easeful) — replacing a separately hand-authored 25-pair lookup table with one small, unambiguous rule:

| Tier | Condition (category of primary × category of secondary/paran) | Replaces (v0.1) |
|---|---|---|
| **Reinforcing** | Both are **Personal or Benefic** | HIGH |
| **Layered** | Exactly **one** is Malefic or Transformative (mixed) | MEDIUM |
| **Complex/effortful** | **Both** are Malefic or Transformative | LOW |

(An earlier draft of this section keyed the tiers off angle/domain-sameness. That was corrected 2026-09-05 during Golden Test authoring — it produced ambiguous, overlapping conditions and didn't actually match v0.1's own hand-authored examples, several of which have a *same-angle* Benefic+Malefic pair rated MEDIUM, not HIGH. Category-pair alone matches the dominant pattern across nearly all of v0.1's 25 examples; a handful of specific Pluto-involving pairs that v0.1 additionally hand-tuned down to LOW are intentionally not preserved as special cases — see `06-interpretation-library.md` §3 for the reconciliation.)

This replaces v0.1's 25 explicitly hand-picked pairwise rules (`06-interpretation-library.md` §3) with one rule derived from the classification already established in §3.2 — see `06` §3 for the corresponding rewrite of the Combination Rules section.

Implementation: still deterministic, still no runtime LLM (CLAUDE.md §3).

## 7. Stability (unchanged from v0.1)

This layer was never an astrology concern — it reflects uncertainty in the user's *reported* birth time, not the sky. No change proposed.

For uncertainty scenarios, compute the city's relevant influence score at each sampled time.

**High**
- primary influence remains within 500 km in all scenarios AND
- same core narrative/primary planet-angle remains relevant OR rank-equivalent supportive influence replaces it
- scenario score spread ≤ 20%

**Medium**
- city remains meaningful in all scenarios but primary strength/rank changes materially
- or scenario score spread >20% and ≤45%

**Time-sensitive**
- city is strong in only part of the uncertainty range
- primary line moves beyond 750 km in any scenario while being strong in another
- or score spread >45%

For exact birth time (`uncertainty=0`), label `Exact-time calculation` rather than High.

## 8. Internal score formula

Richness (replaces v0.1's five-term `P + S + coherenceAdj + stabilityAdj − T` formula):

```
richness = distanceStrength(closest domain-matching line, i.e. the primary)
         + 0.5 × distanceStrength(secondary line or paran, if any)
```

Coherence and stability then adjust this, using the same adjustment magnitudes as v0.1 as a provisional default (that layer isn't targeted by this rewrite — only richness/tension were, per `docs/PROPOSAL-canonical-framework.md`):

| Coherence tier (§6) | Adjustment | Stability (§7) | Adjustment |
|---|---:|---|---:|
| Reinforcing | +0.12 | Exact | 0 |
| Layered | +0.04 | High | +0.10 |
| Complex/effortful | −0.08 | Medium | +0.03 |
| None (no secondary/paran at all) | 0 | Time-sensitive | −0.10 |

```
raw = richness + coherenceAdjustment + stabilityAdjustment
score = clamp(raw / 1.3, 0, 1)
```

**The `1.3` normalizer (analogous to v0.1's `1.05`) exists because richness alone has no relevance discount** (removed along with the relevance matrix, §3.2) — a single very close primary can already reach `distanceStrength ≈ 1.0`, and v0.1's `R = relevance/5` factor (often well below 1) no longer exists to keep that in check. Without a normalizer, most cities with any reasonably close primary would saturate to 5 stars regardless of reinforcement, defeating the guardrails' purpose. `1.3` was chosen during Golden Test authoring (§16) so that a close primary *alone*, with no secondary and only baseline (High) stability, lands just under the 5-star threshold (§9) — genuine reinforcement or coherence is required to clear it. This constant is provisional and re-tunable through versioned Golden Test review only, same as every other constant in this section.

One clear formula instead of five weighted terms. This numeric score is internal and may be tuned only through versioned Golden Test review (unchanged principle from v0.1).

## 9. Numeric-to-stars mapping and guardrails

Thresholds carry over from v0.1 as a **provisional** starting point — they were tuned against the old formula's output range, which no longer exists, so they need re-validation once a new Golden Test suite exists (§16):

| Internal score | Stars |
|---|---|
| ≥ 0.78 | ★★★★★ |
| 0.62–<0.78 | ★★★★☆ |
| 0.45–<0.62 | ★★★☆☆ |
| 0.28–<0.45 | ★★☆☆☆ |
| <0.28 | ★☆☆☆☆ |

**Guardrails are applied to the score itself, not to the star label** (this mechanism is already implemented in code — `src/scoring/score-city.ts`'s `preventTierAndAbove()`, approved 2026-09-05, see `docs/DECISIONS.md` — and carries over unchanged into this framework):

- A city with no influence inside 500 km cannot receive ★★★★★ — its score is capped just under the 5-star threshold.
- `Time-sensitive` stability cannot receive ★★★★★ — same score cap.
- A city whose only strong signal is Malefic/Transformative-flavored with **Complex/effortful** coherence (§6) is capped just under the 4-star threshold, and described as "powerful/demanding," never "bad."
- Do not force a five-star city into every result set.

`stars` is always exactly `scoreToStars(internalScore)` — no separate override step, so ranking by `internalScore` is automatically consistent with displayed stars everywhere.

## 10. Overall rating

Overall is NOT the arithmetic average of four goals (unchanged principle). Inputs now come from each goal's richness-based score rather than the old five-term score, but the aggregation shape is unchanged:

- breadth: number of goals ≥ ★★★★
- peak: strongest goal
- coherence across goals
- stability
- severe complex/effortful pattern (replaces "severe tension")

Suggested internal weighting (unchanged): 25% per goal, + breadth bonus up to 0.10, + stability bonus up to 0.05, − severe cross-goal complex/effortful pattern penalty up to 0.10.

The UI should explain the top 2–3 dimensions behind Overall.

## 11. Country ranking

Never score a country from its capital only (unchanged). Weighting shape unchanged — inputs are now each city's richness-based score:

- best city: 45%
- second-best distinct metro: 25%
- third-best distinct metro: 15%
- geographic breadth/supportive corridor: 10%
- stability consistency: 5%

Require at least two qualifying cities for ★★★★★ country rating (score-capped, same mechanism as §9 — already implemented in `src/scoring/score-country.ts`), unless a small-country exception is documented.

Country narrative types (unchanged):
- `CORRIDOR`: several cities share a strong pattern
- `ANCHOR`: one standout city dominates
- `MIXED`: different cities suit different goals

## 12. De-duplication (unchanged from v0.1)

To avoid top results filled with neighboring cities:
- cluster cities within ~100 km or same metro
- show strongest representative in Top Results
- list nearby alternatives inside city/country detail

## 13. Ranking output

```ts
type RankedCity = {
  cityId: string;
  goal: Goal;
  internalScore: number;       // never displayed
  stars: 1|2|3|4|5;
  label: "Weak"|"Challenging"|"Mixed"|"Strong"|"Exceptional";
  primaryInfluence: Influence;
  secondaryInfluences: Influence[];
  paranInfluences: Influence[]; // NEW -- pending §5.1's geometry spec
  coherence: "REINFORCING"|"LAYERED"|"COMPLEX_EFFORTFUL";
  stability: "EXACT"|"HIGH"|"MEDIUM"|"TIME_SENSITIVE";
  archetypeId: string;
}
```

## 14. Product integrity (unchanged from v0.1)

Stars mean: "Relative astrology-based strength and coherence for the selected goal."

They do NOT mean: probability of success, objective quality of a city, visa/job feasibility, safety, medical or financial outcome, destiny.

## 15. Versioning

Store `calculationVersion`, `scoringVersion`, `interpretationVersion`. A result must be reproducible from input + these versions (unchanged principle).

## 16. Implementation status (as of 2026-09-05)

| Section | Spec status | Code status |
|---|---|---|
| §9/§11 guardrails cap the score, not just the star label | Approved | **Implemented** (`preventTierAndAbove`, shipped as scoring v0.3, carried into v1.0 unchanged) |
| §3.2/§3.3 planetary category + angle-domain classification | Approved | **Implemented** (`src/scoring/category.ts`, replaces `relevance.ts`) |
| §4 tension removed as a scoring multiplier | Approved | **Implemented** — no per-planet tension table anywhere in `src/scoring/` any more |
| §5 strict domain-matching primary + different-body secondary | Approved | **Implemented** (`src/scoring/select-influences.ts`) |
| §6 3-tier category-pair coherence | Approved | **Implemented** (`src/scoring/coherence.ts`; `combination-rules.ts` deleted) |
| §8 richness formula + `1.3` normalizer | Approved | **Implemented** (`src/scoring/internal-score.ts`, `score-city.ts`) |
| §5.1 parans | Approved, geometry specified (`03-astro-calculation-spec.md` §19) | **Implemented** (`src/astro/parans.ts`, `src/astro/paran-proximity.ts`, wired into `select-influences.ts`/`internal-score.ts`/`route.ts`). Baseline-instant only, not tracked across birth-time uncertainty scenarios (documented scope decision, `docs/DECISIONS.md`). This closes the v0.2 framework -- see the important **performance caveat** logged the same day: the pre-existing (not paran-related) city-to-line distance computation is measured at ~7.4s per scenario instant for the full city dataset, ~22s+ per API request before this feature existed. Parans themselves add under 100ms. |

`MODEL_VERSIONS.scoring` and `.interpretation` both bumped to `"1.0"` for this implementation (`docs/DECISIONS.md`, 2026-09-05). The v0.2 Golden Test fixtures in `07-golden-test-cases.md` §10 are now the live regression suite in `tests/scoring/score-city.test.ts` and `tests/interpretation/combinations.test.ts` (the v0.1 fixtures in §§6-8 there are retired, not deleted, for historical reference). Parans remain the one open item before this framework is considered fully landed.
