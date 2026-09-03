# Scoring & Ranking Specification v0.1

**Purpose:** Convert deterministic city-line calculations into transparent 1–5 star recommendations.  
**Core rule:** Stars represent **goal fit + strength + coherence + stability**, not luck, destiny, probability, or scientific certainty.

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
Primary Support
+ Secondary Support
+ Coherence
+ Stability
- Tension Penalty
= Internal Goal Score
→ 1–5 stars
```

Internal score exists only for deterministic ranking.

### 3.1 Distance strength

Recommended continuous function:

```ts
function distanceStrength(km: number): number {
  if (km >= 750) return 0;
  // smooth quadratic decay
  const x = km / 750;
  return 1 - x*x;
}
```

This gives a 0–1 strength. Exact function is configurable, but once Golden Tests are approved it must be versioned.

### 3.2 Goal relevance matrix

Scale:
- 5 = primary fit
- 4 = strong
- 3 = contextual/supportive
- 2 = minor
- 1 = little direct relevance

Initial editorial matrix:

| Influence | Career | Love | Home | Growth |
|---|---:|---:|---:|---:|
| Sun MC | 5 | 2 | 1 | 4 |
| Sun IC | 1 | 3 | 4 | 3 |
| Sun ASC | 4 | 3 | 2 | 5 |
| Sun DSC | 3 | 4 | 2 | 3 |
| Moon MC | 3 | 3 | 2 | 3 |
| Moon IC | 1 | 4 | 5 | 4 |
| Moon ASC | 2 | 4 | 4 | 4 |
| Moon DSC | 2 | 5 | 4 | 3 |
| Mercury MC | 5 | 3 | 1 | 3 |
| Mercury IC | 2 | 3 | 3 | 3 |
| Mercury ASC | 4 | 4 | 2 | 4 |
| Mercury DSC | 4 | 4 | 2 | 3 |
| Venus MC | 4 | 4 | 2 | 3 |
| Venus IC | 2 | 4 | 5 | 3 |
| Venus ASC | 3 | 5 | 3 | 4 |
| Venus DSC | 2 | 5 | 3 | 3 |
| Mars MC | 4 | 2 | 1 | 4 |
| Mars IC | 1 | 2 | 2 | 3 |
| Mars ASC | 3 | 3 | 2 | 5 |
| Mars DSC | 3 | 2 | 1 | 4 |
| Jupiter MC | 5 | 3 | 2 | 4 |
| Jupiter IC | 2 | 4 | 5 | 4 |
| Jupiter ASC | 4 | 4 | 3 | 5 |
| Jupiter DSC | 3 | 5 | 3 | 4 |
| Saturn MC | 4 | 2 | 2 | 4 |
| Saturn IC | 2 | 2 | 3 | 4 |
| Saturn ASC | 3 | 2 | 2 | 5 |
| Saturn DSC | 3 | 2 | 2 | 4 |
| Uranus MC | 4 | 2 | 1 | 5 |
| Uranus IC | 2 | 2 | 2 | 5 |
| Uranus ASC | 3 | 2 | 1 | 5 |
| Uranus DSC | 3 | 2 | 1 | 5 |
| Neptune MC | 3 | 2 | 1 | 4 |
| Neptune IC | 1 | 3 | 3 | 4 |
| Neptune ASC | 2 | 3 | 2 | 5 |
| Neptune DSC | 2 | 4 | 2 | 4 |
| Pluto MC | 4 | 2 | 1 | 5 |
| Pluto IC | 2 | 2 | 3 | 5 |
| Pluto ASC | 3 | 2 | 2 | 5 |
| Pluto DSC | 3 | 2 | 1 | 5 |

**Important:** This matrix is an editorial product hypothesis, not an astronomical fact. Version it and validate it with experienced astrocartography readers/user feedback.

## 4. Support vs tension

Do NOT classify planets globally as benefic/bad.

Each influence has:
- `supportPotential` for a goal
- `tensionPotential`
- narrative shadow/trade-off

Suggested baseline tension multipliers:

| Planet | Baseline tension |
|---|---:|
| Sun | 0.15 |
| Moon | 0.20 |
| Mercury | 0.10 |
| Venus | 0.08 |
| Mars | 0.45 |
| Jupiter | 0.10 |
| Saturn | 0.50 |
| Uranus | 0.40 |
| Neptune | 0.45 |
| Pluto | 0.50 |

Angle/goal context may modify these. Example: Saturn-MC can be highly relevant for Career but still carry pressure/responsibility.

## 5. Primary and secondary influences

Candidate influence if distance < 750 km.

Primary:
- highest `distanceStrength × goalRelevance`
- must exceed configurable minimum `0.35`

Secondary:
- next 1–3 meaningful influences
- must exceed `0.20`
- avoid listing weak noise

Never select more than four visible key influences in MVP.

## 6. Coherence

Coherence measures whether multiple strong signals tell a compatible story for the selected goal.

Internal labels:
- `HIGH`
- `MEDIUM`
- `LOW`

Examples:
- Career: Sun-MC + Jupiter-MC → HIGH
- Career: Sun-MC + Mercury-MC → HIGH
- Love: Venus-DSC + Jupiter-DSC → HIGH
- Home: Moon-IC + Jupiter-IC → HIGH
- Career: Sun-MC + Neptune-ASC → MEDIUM; strong career signal plus identity/clarity trade-off
- Love: Venus-ASC + Saturn-ASC → MEDIUM; connection plus seriousness/boundaries
- Career: Sun-MC + Saturn-ASC + Pluto-IC → LOW/MEDIUM depending strengths; powerful but competing demands

Implementation: use explicit pairwise interaction rules in the Interpretation Library. Do not ask an LLM to decide coherence.

## 7. Stability

For uncertainty scenarios, compute the city’s relevant influence score at each sampled time.

Suggested classification:

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

## 8. Internal score proposal

Normalize relevance: `R = relevance / 5`.

For each influence:
`support_i = distanceStrength_i × R_i × (1 - 0.35*tension_i)`

Primary support:
`P = max(support_i)`

Secondary support:
take top 3 remaining support values; diminishing weights:
`S = 0.45*s2 + 0.25*s3 + 0.15*s4`, capped at 0.35.

Coherence:
- High: +0.12
- Medium: +0.04
- Low: -0.08

Stability:
- High: +0.10
- Medium: +0.03
- Time-sensitive: -0.10
- Exact time: 0

Tension penalty:
sum top two strong tension contributions:
`tensionContribution = distanceStrength × R × tension`
`T = min(0.25, 0.18*t1 + 0.10*t2)`

Raw:
`raw = P + S + coherenceAdj + stabilityAdj - T`

Clamp 0..1.20, then normalize:
`score = min(1, raw / 1.05)`

This numeric score is internal and may be tuned only through versioned Golden Test review.

## 9. Numeric-to-stars mapping

Initial thresholds:

| Internal score | Stars |
|---|---|
| ≥ 0.78 | ★★★★★ |
| 0.62–<0.78 | ★★★★☆ |
| 0.45–<0.62 | ★★★☆☆ |
| 0.28–<0.45 | ★★☆☆☆ |
| <0.28 | ★☆☆☆☆ |

Guardrails:
- `Time-sensitive` cannot receive ★★★★★ unless an explicit product decision changes this rule.
- A city with no influence inside 500 km cannot receive ★★★★★.
- A city whose strongest relevant signal is primarily tension-heavy may be capped at ★★★☆☆ and described as “powerful/challenging,” not “bad.”
- Do not force a five-star city into every result set.

## 10. Overall rating

Overall is NOT the arithmetic average of four goals.

Calculate:
- breadth: number of goals ≥ ★★★★
- peak: strongest goal
- coherence across goals
- stability
- severe tension

Suggested internal weighting:
- Career 25%
- Love 25%
- Home 25%
- Growth 25%
then apply:
- + breadth bonus up to 0.10
- + stability up to 0.05
- - severe cross-goal tension up to 0.10

The UI should explain the top 2–3 dimensions behind Overall.

## 11. Country ranking

Never score a country from its capital only.

Country candidate score:
- best city: 45%
- second-best distinct metro: 25%
- third-best distinct metro: 15%
- geographic breadth/supportive corridor: 10%
- stability consistency: 5%

Require at least two qualifying cities for ★★★★★ country rating, unless a small-country exception is documented.

Country narrative types:
- `CORRIDOR`: several cities share a strong pattern
- `ANCHOR`: one standout city dominates
- `MIXED`: different cities suit different goals

## 12. De-duplication

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
  coherence: "HIGH"|"MEDIUM"|"LOW";
  stability: "EXACT"|"HIGH"|"MEDIUM"|"TIME_SENSITIVE";
  archetypeId: string;
}
```

## 14. Product integrity

Stars mean:
“Relative astrology-based strength and coherence for the selected goal.”

They do NOT mean:
- probability of success
- objective quality of a city
- visa/job feasibility
- safety
- medical or financial outcome
- destiny

## 15. Versioning

Store:
- `calculationVersion`
- `scoringVersion`
- `interpretationVersion`

A result must be reproducible from input + these versions.
