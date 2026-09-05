# Proposal: A More Canonical Astrocartography Framework

**Status: OPEN / NOT ADOPTED.** Written at the Product Owner's request (2026-09-05) to fully specify, for review, what the scoring and interpretation layers would look like if redesigned to minimize invented/arbitrary elements and rely as much as possible on real, broadly-taught Astrocartography (ACG) and traditional astrology knowledge — even where that means overriding policy already in `04-scoring-ranking-spec.md` and `06-interpretation-library.md`.

This document does not change any approved spec and nothing in it has been implemented. It exists so the Product Owner can decide whether to pursue it, per CLAUDE.md §3/§17 (no silent methodology changes; product decisions get written down before being acted on).

---

## 0. The question this answers

Throughout this project, the calculation engine (Milestone 0) has been faithful to real astrocartography: real ephemeris, real sidereal time, the real MC/IC/ASC/DSC formulas, in the correct coordinate frame. But the scoring and interpretation layers (Milestones 1–2) needed to solve a problem real astrocartography was never designed to solve — *rank and shortlist hundreds of cities with a comparable 1–5 confidence rating* — and did so by inventing a fairly large amount of new machinery: a 40-entry numeric relevance table, per-planet "baseline tension" numbers, a 25-pair coherence lookup table, and a 5-term weighted score. `04-scoring-ranking-spec.md` itself is honest about this ("This matrix is an editorial product hypothesis, not an astronomical fact" — §3.2).

The Product Owner asked: if we start over with the single goal of staying as close as possible to real ACG/astrology, and worry about the product requirements second, what would that look like? This document is that answer.

---

## 1. What is already canonical, and stays unchanged

The entire calculation engine (`src/astro/*`) is already real astrocartography and needs no change under this proposal:

- Geocentric equatorial coordinates (RA/Dec) via the ephemeris adapter, in the correct equator-of-date frame.
- Greenwich sidereal time.
- MC/IC as `longitude = normalize(RA − GST)` and its antimeridian.
- ASC/DSC via the horizon equation `cos(H) = −tan(lat)·tan(dec)`, sampled across latitude.
- Historical timezone resolution, DST fold/gap handling.

Also unchanged: the meaning of the four angles, which is close to universal consensus across ACG literature going back to Jim Lewis's original *Astro\*Carto\*Graphy* method:

| Angle | Life domain |
|---|---|
| MC (Midheaven) | Public life, career, direction, reputation |
| IC (Imum Coeli) | Home, roots, family, private foundation |
| ASC (Ascendant) | Identity, self-presentation, how you meet the world |
| DSC (Descendant) | Relationships, partnerships, significant others |

This mapping is already how the current app's angle labels work (`INFLUENCE_LABEL` in the City Story page). Nothing here changes.

---

## 2. What real astrology does and doesn't give us

Being precise about this matters, because it draws the line between "we can source this from tradition" and "this must be invented regardless of framework."

**Real, and broadly attested:**
- A person living near/crossing a planetary line experiences that planet's themes more prominently in that angle's life domain.
- Traditional (Hellenistic-derived) astrology classifies **Venus and Jupiter as benefics** (ease, harmony, growth, opportunity) and **Mars and Saturn as malefics** (friction, effort, consequence — "hard," not "evil"). The **Sun, Moon, and Mercury** are the "personal" planets: neither classically benefic nor malefic, their quality depends on the angle they occupy.
- Modern astrology (post-1781, once Uranus/Neptune/Pluto were discovered) treats these three **outer planets** as a distinct third category: intensifying, disruptive-but-purposeful, associated with sudden change, dissolution/idealism, and deep transformation respectively — not simply lumped in with Mars/Saturn.
- **Parans** — the latitude at which two planetary lines are simultaneously angular (rising, setting, culminating, or anti-culminating) for an observer there — are a real, distinctive ACG concept. Jim Lewis and subsequent ACG authors treat a paran crossing as often *more* nuanced/significant than a single line alone, because it blends two influences at a specific latitude band (valid at every longitude along that latitude, not just one point). `03-astro-calculation-spec.md` §1 explicitly excludes parans from MVP scope — this proposal would bring them in.
- Real ACG reading is a *qualitative* synthesis: an astrologer looks at every relevant line/paran near a place and weaves a narrative. There is no scored combination table in the actual practice.

**Not real, no matter which framework we pick:**
- Any numeric score, percentage, or star count. Real astrology does not produce "72/100" or "★★★★☆" for a city. The moment the product needs to rank 955 cities and show a comparable confidence signal, we are inventing something — this is unavoidable given the product's actual requirement, not a flaw specific to the current framework.

This is the central design principle below: **shrink the invented part, and make the seam between "real astrology" and "our synthesis" visible**, rather than blending them into one opaque formula the way "baseline tension: Mars = 0.45" currently does — that number *looks* like an astrological fact but is an invented product constant.

---

## 3. Layer 1 — Canonical (sourced from tradition, not invented per-product)

### 3.1 Angle → life-domain (unchanged, see §1)

### 3.2 Planetary nature classification (replaces the 40-entry relevance matrix and the baseline-tension table)

Instead of hand-tuning a relevance score for all 40 (planet × angle) combinations across 4 goals — 160 invented numbers, `04-scoring-ranking-spec.md` §3.2's own words: *"an editorial product hypothesis, not an astronomical fact"* — classify each of the 10 bodies into exactly one of four traditional categories:

| Category | Bodies | Traditional basis |
|---|---|---|
| **Personal** | Sun, Moon, Mercury | The "personal planets": identity, emotion, communication/thought. Neither benefic nor malefic — quality follows the angle, not the planet. |
| **Benefic** | Venus, Jupiter | Classical benefics since Hellenistic astrology: ease, harmony, growth, opportunity, wherever they fall. |
| **Malefic (classical)** | Mars, Saturn | Classical malefics: friction, effort, consequence. Mars = conflict/drive/assertion. Saturn = restriction/responsibility/delay. Traditionally "hard," never "bad." |
| **Transformative (modern)** | Uranus, Neptune, Pluto | Added by post-1781 astrology; most modern ACG authors treat these as their own category — intensifying and disruptive-but-purposeful, not simply malefic. Uranus = sudden change/rebellion. Neptune = dissolution/idealism/spirituality. Pluto = deep transformation/power. |

A city's story then composes as: **domain from the angle** (§1) × **flavor from the planet's category**:
- Personal on that angle → the domain theme, expressed directly and personally.
- Benefic on that angle → the domain theme, expressed with ease and opportunity.
- Malefic on that angle → the domain theme, expressed with effort and responsibility — powerful but demanding.
- Transformative on that angle → the domain theme, expressed through change and reinvention.

This directly uses the real benefic/malefic/outer-planet classification that `04-scoring-ranking-spec.md` §4 currently *forbids* ("Do NOT classify planets globally as benefic/bad"). That policy's actual concern — never telling a user a place or a planet is simply "bad," never fatalistic language — is a **copy/language rule** (CLAUDE.md §12–§13), not a reason to avoid the classification itself. Under this proposal the classification is used internally to pick a *tone*, while user-facing text still always uses effort/reward framing, never "good/bad." The two concerns get separated instead of one policy trying to solve both.

This also deletes the per-goal relevance table entirely: Jupiter-MC no longer needs four separately hand-tuned numbers for Career/Love/Home/Growth — it needs one classification (Benefic-on-MC), and the copy layer phrases that for whichever goal domain the angle implies.

### 3.3 Parans (new — currently excluded from MVP)

A paran is the latitude where two planetary lines are simultaneously angular for an observer there. Unlike MC/IC (vertical longitude lines) or ASC/DSC (curved lines), **a paran is a horizontal band valid at every longitude along that latitude** — a genuinely different kind of signal, and one ACG treats as often more specific/nuanced than a single line.

Computing this is a real, separate piece of geometry, more involved than what's currently implemented: for each pair of (body A, angle A) and (body B, angle B), solve for the latitude at which A's diurnal motion puts it at angle A's local hour angle *at the same moment* B's diurnal motion puts it at angle B's local hour angle. This is meaningfully harder than the current ASC/DSC sampling and needs its own dedicated mathematical spec and Golden Tests before implementation — this document only establishes the product intent (parans should be a first-class, surfaced signal), not the exact algorithm.

### 3.4 Multi-line synthesis (replaces the 25-pair coherence table)

Real ACG reading is qualitative: an astrologer weighs every nearby line/paran together. Since the product still needs a deterministic, non-LLM rule (CLAUDE.md §3: no runtime LLM), the smallest defensible rule set — derived directly from §3.1/§3.2 rather than a separately hand-authored lookup table — is:

- Two nearby influences (or a paran) that land on the **same angle/domain** → *reinforcing* (replaces "HIGH" coherence).
- Two nearby influences on **different but complementary domains** (e.g. MC + ASC) → *layered* (replaces "MEDIUM").
- A **Malefic or Transformative** secondary alongside a Personal/Benefic primary → *complex/effortful*, narrated with the category's own tone rather than scored (replaces "LOW").

Same qualitative outcome as today's 25-row table, but derived from two already-established classifications instead of a third, separately-invented one.

---

## 4. Layer 2 — Necessary synthesis (kept minimal, and labeled as ours)

This layer has no real astrological source and can't be removed — the product's actual requirement (rank hundreds of cities, show a comparable confidence signal) has no equivalent in real practice. The goal here is to keep it as small and transparent as defensible, and to say so plainly in-product ("how Astravia turns your chart into a shortlist"), rather than presenting it as astrological fact the way a precise-looking number like "baseline tension = 0.45" currently reads.

### 4.1 Proximity strength — kept as-is

`distanceStrength(km) = 1 − (km/750)²` remains a reasonable operationalization of the one quantifiable, broadly-taught ACG principle: closer to a line means a stronger effect, fading smoothly, roughly negligible past several hundred km. The exact exponent and 750 km cutoff are still invented (no ACG source supplies a formula) — but the *shape* is an uncontroversial reading of real practice. Proposal: keep the formula, but say explicitly in documentation/copy that this specific curve is a modeling choice, not sourced from a specific author.

### 4.2 A simpler aggregate: richness, not a 5-term formula

With deep synthesis now qualitative (§3.4), Layer 2's remaining job shrinks. Instead of the current `support + secondary + coherenceAdj + stabilityAdj − tensionPenalty` (five weighted terms), propose:

```
richnessScore = distanceStrength(closest relevant line)
              + 0.5 × distanceStrength(next reinforcing line or paran, if any)
```

One clear formula instead of five weighted terms — the "closest line matters most, a second reinforcing signal matters some" idea is preserved, just with far less invented surface area.

### 4.3 Birth-time stability — unchanged

This was never an astrology concern — it's about how uncertain the user's *reported* birth time is, not about the sky. The current independent-recomputation-across-scenarios approach (G007) stays exactly as-is.

### 4.4 Star mapping

Same idea as today (a small number of thresholds mapping a score to 1–5 stars), but the thresholds themselves (0.78/0.62/0.45/0.28) are not portable — they were tuned against the *old* formula's output range, which no longer exists. New thresholds would need to be derived and validated against a new Golden Test suite (§6).

---

## 5. Summary of what changes vs. today

| Current (`04`/`06`, v0.1) | Proposed |
|---|---|
| 40-entry numeric relevance matrix (160 invented numbers) | Angle→domain (canonical) + 4-category planet classification (canonical) |
| Continuous "baseline tension" 0.08–0.50 per planet (invented) | Same 4-category classification drives narrative tone; no separate tension number |
| Policy: "Do NOT classify planets as benefic/bad" | Classification used internally; user-facing language rules (never "good/bad", never fatalistic) unchanged and still enforced at the copy layer |
| 25 explicit pairwise coherence rules + tension fallback heuristic | 3-tier synthesis rule derived directly from angle-domain + planet-category |
| Parans excluded from MVP | Parans computed and surfaced as a distinct, real ACG signal (needs its own geometry spec) |
| 5-term weighted score | 2-term richness score |
| Country ranking: 45/25/15/10/5 weighted composite | Same shape, re-derived once the new richness score is finalized — out of scope for this document's first pass |

## 6. What does not change

- The entire Milestone 0 calculation engine, exactly as it stands.
- CLAUDE.md's product-safety rules: no fatalistic/absolute language, no runtime LLM, determinism, the 1–5 star display rule.
- Milestone 4 concerns (accessibility, deployment, performance) — orthogonal either way.

## 7. Honesty about sourcing

Astrology, traditional or ACG, has no peer-reviewed literature or single canonical authority. The classifications above reflect the most widely-taught mainstream tradition (Hellenistic-derived benefic/malefic; Jim Lewis's ACG angle meanings, which are close to universal across ACG authors) — not one citable source, and individual schools would phrase nuances differently. This proposal is **"maximally aligned with common practice,"** not "objectively, provably correct" — no such standard exists for astrology, and the product's own safety copy (CLAUDE.md §13) already treats every result as reflective/interpretive rather than factual for exactly this reason.

## 8. Impact if adopted

This is sized as a **full rewrite of Milestone 1 and most of Milestone 2**, not an incremental change:

- `src/scoring/relevance.ts`, `combination-rules.ts`, most of `internal-score.ts`/`select-influences.ts`/`coherence.ts` would be replaced.
- `src/interpretation/library.ts`'s 40 hand-authored entries would need reworking around category-driven copy rather than per-entry hand-written text (some flavor text may be preservable — needs its own pass).
- A **new paran-detection module** in `src/astro/` (calculation layer) — real, nontrivial geometry needing its own spec and Golden Tests (§3.3).
- Every expected numeric value in `docs/07-golden-test-cases.md` becomes invalid, since the score formula fundamentally changes. A new Golden Test suite must be authored and approved *before* any of this ships (CLAUDE.md §8/§9).
- Every existing star rating changes meaning — this needs a major version bump across `MODEL_VERSIONS` (calculation stays the same; scoring and interpretation both bump), and if any result has ever been shared/saved, a one-time "we improved the model" note.
- Rough sizing: comparable to redoing Milestones 1 and 2 from scratch — larger than any single change made in this project so far.

## 9. Open questions for the Product Owner

1. Adopt in full, adopt partially (e.g. add parans and planet-category framing first while keeping the current score's shape), or shelve.
2. If proceeding: per CLAUDE.md §19, this should be its own milestone with a Golden Test suite authored and approved *before* touching production scoring/interpretation code, given the size.
3. Paran geometry (§3.3) needs its own dedicated technical spec before implementation — this document establishes intent, not the algorithm.

**Status: OPEN.** Not implemented. No code, spec, or Golden Test in this repository has been changed by this document.
