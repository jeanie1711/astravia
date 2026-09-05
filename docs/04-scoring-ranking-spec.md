# Scoring & Ranking Specification v0.2 (Canonical Framework)

> **Approved 2026-09-05.** Supersedes v0.1 below. See `docs/PROPOSAL-canonical-framework.md` for the full rationale and `docs/DECISIONS.md` for the approval record. **Read §16 (Implementation status) before assuming any specific section is already live in code** — this document was updated ahead of the code that implements it, by explicit Product Owner instruction, so the spec and the running app diverge until the rewrite lands.

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
- the next meaningful candidate, **or a paran involving the primary's angle** (§5.1) if one exists and is closer/stronger than the next plain candidate
- must exceed `0.20`

Never select more than four visible key influences in MVP (unchanged from v0.1).

### 5.1 Parans (new — currently excluded from MVP per `03-astro-calculation-spec.md` §1; this spec assumes that exclusion will be lifted in a follow-up calculation-layer change)

A paran is the latitude at which two planetary lines are simultaneously angular (rising, setting, culminating, or anti-culminating) for an observer there — a real, distinctive ACG concept, and one ACG literature treats as often more specific than a single line alone, because it blends two influences at a latitude band valid across every longitude on it.

**Status: geometry not yet specified.** Computing a paran (solving for the latitude where two bodies' diurnal motions coincide at their respective angles) is meaningfully more involved than the current MC/IC/ASC/DSC calculations and needs its own dedicated mathematical spec and Golden Tests before implementation. This document establishes only the product intent — a paran should be eligible as a reinforcing signal in richness (§6) and should be surfaced as its own signal type in a City Story, distinct from "a second nearby line." Do not implement paran detection from this section alone.

## 6. Coherence

Coherence measures whether the primary and secondary/paran influences tell a compatible story, using categories (§3.2) directly instead of a separately hand-authored lookup table:

| Tier | Condition | Replaces (v0.1) |
|---|---|---|
| **Reinforcing** | Secondary/paran lands on the **same** angle/domain as the primary | HIGH |
| **Layered** | Secondary/paran lands on a **different but complementary** domain (e.g. MC + ASC) | MEDIUM |
| **Complex/effortful** | Secondary/paran is **Malefic or Transformative** while the primary is Personal/Benefic | LOW |

This replaces v0.1's 25 explicitly hand-picked pairwise rules (`06-interpretation-library.md` §3) with one rule derived from classifications already established above — see `06` §3 for the corresponding rewrite of the Combination Rules section.

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
richness = distanceStrength(closest relevant line)
         + 0.5 × distanceStrength(next reinforcing line or paran, if any)
```

Coherence and stability then adjust this the same way v0.1 combined its terms (exact adjustment magnitudes to be re-derived and validated against a new Golden Test suite — see §16):

```
raw = richness + coherenceAdjustment + stabilityAdjustment
score = clamp(raw, 0, 1)
```

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

This spec was updated ahead of the code, by explicit Product Owner request, so the two currently disagree in places. Tracking what's actually true in `src/`:

| Section | Spec status | Code status |
|---|---|---|
| §9/§11 guardrails cap the score, not just the star label | Approved | **Implemented** (`preventTierAndAbove`, scoring v0.3) |
| §3.2 planetary category classification | Approved | Not implemented — `src/scoring/relevance.ts` still uses the v0.1 40-entry matrix |
| §4 tension removed as a scoring multiplier | Approved | Not implemented — v0.1's per-planet tension table is still active in `src/scoring/internal-score.ts` |
| §6 3-tier coherence | Approved | Not implemented — `src/scoring/coherence.ts`/`combination-rules.ts` still use the 25-pair table |
| §8 richness formula | Approved | Not implemented — `src/scoring/internal-score.ts` still uses the 5-term formula |
| §5.1 parans | Approved (product intent only) | Not implemented — needs its own geometry spec first (`03-astro-calculation-spec.md` §19) |

Per CLAUDE.md §8/§9/§19, none of the "Not implemented" rows should be coded until a new Golden Test suite is authored and approved for this framework — this is sized as its own milestone (see `docs/PROPOSAL-canonical-framework.md` §8).
