# Golden Test Cases v0.1

**Purpose:** Prevent calculation/scoring regressions and stop Claude Code from “fixing” the engine by intuition.

## 1. Test philosophy

Golden Tests have three levels:

A. **Mathematical invariants** — must pass exactly/tightly.  
B. **Reference calculation fixtures** — expected numerical values within tolerance.  
C. **Product interpretation fixtures** — expected classification/story behavior, not exact prose.

Do not make tests assert full narrative sentences except fixed safety copy. Assert structured output: primary influence, stars/range, stability, archetype, required trade-off.

## 2. Tolerances

Initial:
- MC/IC longitude: ±0.20° versus approved reference fixture
- RA: ±0.02° where reference is available
- declination: ±0.02°
- city-line distance: ±25 km for sampled ASC/DSC MVP implementation; tighten after geodesic segment implementation
- MC/IC city distance: ±10 km
- star classification: exact
- stability classification: exact

If Astronomy Engine systematically differs from Swiss Ephemeris beyond tolerance, document the coordinate-frame/model difference before changing code.

## 3. Golden Case 001 — Birth-time sensitivity benchmark

Input:
- Date: 1987-11-17
- Place: Nha Trang, Vietnam
- Coordinates: use canonical geocoder fixture for Nha Trang
- Timezone: Asia/Ho_Chi_Minh (historical offset resolved by timezone database)
- Local scenarios: 17:15, 17:30, 17:45

Reference fixture source: prior Swiss Ephemeris calculation. Use as regression benchmark, not as a claim that Swiss and Astronomy Engine must be bit-identical.

### 3.1 Expected MC longitudes

| Planet | 17:15 | 17:30 | 17:45 |
|---|---:|---:|---:|
| Jupiter | 170.37E | 166.61E | 162.84E |
| Mars | -5.64 | -9.40 | -13.15 |
| Mercury | 4.81E | 1.06E | -2.68 |
| Moon | -23.45 | -27.09 | -30.74 |
| Neptune | 67.02E | 63.26E | 59.50E |
| Pluto | 13.23E | 9.47E | 5.71E |
| Saturn | 49.82E | 46.06E | 42.30E |
| Sun | 22.47E | 18.72E | 14.97E |
| Uranus | 54.89E | 51.13E | 47.37E |
| Venus | 45.83E | 42.08E | 38.34E |

Expected invariant:
- each IC longitude = corresponding MC + 180°, normalized.

### 3.2 Jupiter IC sensitivity

Expected:
- 17:15: -9.633°
- 17:30: -13.394°
- 17:45: -17.155°

This fixture is important because Portugal changes materially across the range.

## 4. City behavior fixtures for Case 001

These are approximate reference distances from the approved prior calculation.

### Stockholm, Sweden
Expected:
- Neptune ASC ≈ 109 / 39 / 172 km
- Sun MC ≈ 249 / 38 / 176 km
Behavior:
- Career result remains strong across range.
- Sun-MC must be a primary or co-primary Career influence.
- Neptune-ASC must appear as a meaningful secondary/trade-off.
- Stability: HIGH.
- Archetype: VISIBILITY or LAYERED.
- Narrative must include career visibility/direction AND clarity/idealisation/boundary trade-off.
- Must not describe Stockholm as purely easy/beneficial.

### Turku, Finland
Expected:
- Sun MC ≈ 12 / 195 / 400 km
- Venus ASC ≈ 420 / 490 / 547 km
Behavior:
- Strong Career candidate.
- Sun-MC primary.
- Stability: HIGH or MEDIUM depending finalized threshold implementation; once chosen, freeze fixture.
- Should outrank a city with no relevant line inside 500 km.

### Oulu, Finland
Expected:
- Venus ASC ≈ 2 / 55 / 96 km
- Uranus ASC ≈ 154 / 85 / 38 km
- Saturn ASC ≈ 119 / 182 / 234 km
- Neptune ASC ≈ 332 / 227 / 131 km
Behavior:
- Must be identified as multi-line/complex.
- Love/Growth should be meaningfully elevated.
- Venus-ASC cannot erase Uranus/Saturn/Neptune trade-offs.
- Archetype: CONNECTION, REINVENTION, or LAYERED depending selected goal.
- A five-star result, if produced for a goal, must still show a trade-off.

### Tallinn, Estonia
Expected:
- Sun MC ≈ 129 / 341 / 551 km
- Neptune ASC ≈ 135 / 261 / 378 km
Behavior:
- Career should be meaningful but more layered than a clean Sun-only location.
- Birth-time confidence must not be stronger than evidence supports.
- Sun visibility + Neptune ambiguity should be synthesized.

### Vienna, Austria
Expected:
- Sun MC ≈ 451 / 174 / 104 km
- Pluto MC ≈ 233 / 511 / 787 km
Behavior:
- Career should strengthen toward later birth-time scenario.
- Pluto is time-variable and should not be treated as equally strong across all scenarios.
- Strong career candidate; stability likely MEDIUM, subject to finalized scoring thresholds.

### Berlin, Germany
Expected:
- Pluto MC ≈ 12 / 266 / 519 km
- Sun MC ≈ 612 / 359 / 106 km
Behavior:
- Career story should be transformation + increasing visibility across the range.
- Do not reduce the story to “good career city.”
- Pluto trade-off must be present when relevant.

### Barcelona, Spain
Expected:
- Mercury MC ≈ 221 / 93 / 405 km
- Pluto MC ≈ 921 / 609 / 296 km
Behavior:
- Career/communication result should foreground Mercury-MC.
- Suitable tags may include communication, consulting, knowledge work, networking.
- Pluto may enter only when within meaningful range for scenario/stability logic.

### Lisbon, Portugal
Expected:
- Mars MC ≈ 303 / 23 / 348 km
- Neptune ASC ≈ 415 / 124 / 161 km
- Jupiter IC ≈ 43 / 369 / 695 km
Behavior:
- Jupiter-IC Home interpretation is TIME-SENSITIVE.
- Do NOT return “stable five-star home base” across the full 17:15–17:45 range.
- Career/Momentum may remain meaningful because of Mars-MC, but must include intensity/burnout/conflict trade-off.
- This test is a hard regression guard.

### Reykjavik, Iceland
Expected:
- Sun ASC ≈ 21 / 137 / 244 km
Behavior:
- Personal Growth should remain strong and stable.
- Archetype: SELF-DEFINITION/REINVENTION equivalent using Sun-ASC content.
- Identity/self-expression should be primary narrative.

### London, UK
Expected:
- Mercury MC ≈ 342 / 82 / 177 km
Behavior:
- Career/communication should be strong.
- Mercury-MC primary.
- Story should emphasize communication, networks, consulting/knowledge work rather than generic “success.”

## 5. Mathematical invariant tests

### G001 MC/IC opposition
For every body/time:
`angularDifference(MC, IC) == 180° ± 1e-9` internally.

### G002 Longitude normalization
All longitudes are in `[-180, 180)`.

### G003 ASC/DSC horizon
For every emitted ASC/DSC point, recompute geometric altitude from RA/Dec/local sidereal time. Expected altitude ≈ 0° within numerical tolerance.

### G004 Rise/set symmetry
At a given latitude where rising/setting exists:
- hour angles should be `-H0` and `+H0`.

### G005 Circumpolar handling
For `| -tanφ tanδ | > 1`, emit no rise/set point; never clamp the value to fabricate a line.

### G006 Determinism
Same input/version → byte-equivalent structured calculation output after canonical JSON serialization.

### G007 Uncertainty independence
`T-15`, `T`, `T+15` must each run the full astronomy calculation. No scenario may be derived by simply shifting a baseline longitude.

### G008 Antimeridian
A line crossing +180/-180 must be split for rendering/distance logic; no false segment across the world map.

## 6. Scoring invariant tests

### S001 No relevant line
No goal-relevant influence inside 750 km → cannot exceed ★★☆☆☆ unless a documented secondary-rule exception exists.

### S002 Five-star proximity
★★★★★ requires at least one goal-relevant influence inside 500 km.

### S003 Time-sensitive cap
TIME_SENSITIVE → max ★★★★☆ in v0.1.

### S004 Trade-off preservation
If Mars/Saturn/Uranus/Neptune/Pluto has strong tension contribution, generated City Story must include at least one approved trade-off concept.

### S005 No “bad planet” rule
Saturn-MC may still score strongly for Career if close/relevant; tension affects coherence/story rather than deleting support.

### S006 Goal differentiation
Same city must be allowed to have different stars by goal.

### S007 Overall is not mean
Construct fixture where one city is 5/2/2/5 and another 4/4/4/4. Overall should favor broader coherent support unless stability/tension reverses it.

### S008 Country ≠ capital
Fixture with weak capital + three strong secondary cities must allow country to rank strongly.

## 7. Interpretation tests

### I001 Primary first
City Story “Why” section references the primary influence/theme before secondary influences.

### I002 Synthesis
Two strong influences must produce a combination/synthesis rule when one exists; do not concatenate two independent definitions.

### I003 Five-star balance
Every ★★★★★ story has a non-empty trade-off.

### I004 Non-deterministic language
Reject prohibited phrases:
- “will definitely”
- “guaranteed”
- “destined”
- “soulmate city”
- “you will become rich”
- “do not move here”

### I005 Practical-domain separation
Astro story cannot infer visa, jobs, safety, healthcare, cost of living, school quality, or immigration feasibility.

### I006 Pattern language
“Your Pattern” describes repeated calculated map themes, not fixed personality claims.

## 8. Additional synthetic fixtures to implement

Create deterministic synthetic fixtures independent of real people:

1. **Clean Career:** Sun-MC 40 km + Jupiter-MC 90 km, all else >750 → expected Career ★★★★★, HIGH coherence.
2. **Layered Career:** Sun-MC 50 + Neptune-ASC 40 → strong but layered; Neptune trade-off required.
3. **Home Base:** Moon-IC 60 + Jupiter-IC 100 → Home ★★★★★ candidate.
4. **Connection + Structure:** Venus-ASC 30 + Saturn-ASC 80 → Love strong but not “effortless”; commitment/boundary language.
5. **High Intensity:** Mars-MC 30 + Pluto-MC 50 → cap/penalty applies; strong influence but challenging story.
6. **Weak City:** all relevant lines >900 → ★☆☆☆☆ or ★★☆☆☆ according to final threshold.
7. **Time Sensitive:** primary distance 40 / 350 / 900 → TIME_SENSITIVE, max ★★★★☆.
8. **Stable:** primary distance 80 / 100 / 120 → HIGH.
9. **Country Corridor:** three cities 4–5 stars in same country → country can be ★★★★★.
10. **Country Anchor:** one 5-star city, all others weak → country narrative ANCHOR, not CORRIDOR.

## 9. Test execution gate

Before merging any change to:
- ephemeris
- sidereal time
- line geometry
- timezone handling
- distance
- scoring weights
- interpretation combination rules

run the full Golden Test suite.

A scoring/content change may intentionally change Golden outputs, but the developer must:
1. show before/after fixtures,
2. explain product rationale,
3. increment the relevant version,
4. receive product-owner approval.
