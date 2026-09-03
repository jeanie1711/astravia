# 02 — User Flow & Screen Specification v0.1

## 1. UX objective

Create the shortest possible journey from:

> “I wonder where I might thrive”

to:

> “I understand which places stand out for me and why.”

The experience is mobile-first and progressive: simple first, deeper astrology only on demand.

---

## 2. Primary flow

```text
S01 Landing
   ↓
S02 Birth Details
   ↓
S03 Birth-Time Confidence
   ↓
S04 Life Goal
   ↓
S05 Calculating
   ↓
S06 Your Places
   ↓
S07 City Story
   ↙        ↘
Back        Share / Explore another
```

No account creation interrupts the flow.

---

# S01 — Landing

## Purpose

Communicate the value proposition in seconds and start the experience.

## Required content

**Hero**

> **A broader world for your next chapter**

Supporting copy:

> Your map. Your places. Your possibilities.

> _Approved 2026-09-03: product name "Astravia" and this hero copy replace the original "Where in the world could you thrive?" / "Discover the places that stand out in your astrocartography — and understand why." wording, per the Claude Design prototype the Product Owner signed off on. The original copy remains a valid fallback in spirit -- the value proposition and tone requirements below are unchanged._

Primary CTA:

> **Find my places**

Optional microcopy:

> Takes about 2 minutes.

## Optional preview

One example result card may be shown to explain the experience:

```text
Stockholm ★★★★★
Career · Visibility · Reinvention

Why this place?
A strong Sun–MC location with a more layered Neptune influence.
```

This is sample/demo content and must be labeled as such.

## Interaction

`Find my places` → S02.

## Do not include

- pricing;
- account login;
- long astrology education;
- world map;
- multiple competing CTAs.

---

# S02 — Birth Details

## Purpose

Collect the minimum astronomical inputs.

## Fields

### Date of birth
Required.

### Time of birth
Required for MVP calculation.

Input should allow hour/minute and clearly display 12h/24h convention according to UI choice.

### Place of birth
Required.

User searches/selects a canonical place. Selection resolves:

- display label;
- latitude;
- longitude;
- IANA timezone ID.

## Supporting copy

> Birth time matters because astrocartography lines can move noticeably within a short time.

## Validation

Inline errors:

- “Enter your date of birth.”
- “Enter your birth time.”
- “Choose a birth place from the results.”
- “We couldn’t resolve the historical timezone for this place.”

Do not silently guess unresolved place/timezone data.

## CTA

> **Continue**

Disabled until required data is valid.

## Data retained

Keep in client/session state for the current journey. No account/database required.

---

# S03 — Birth-Time Confidence

## Purpose

Capture uncertainty without making users feel that approximate data is useless.

## Question

> **How confident are you about your birth time?**

Options:

### Exact
> I know the time shown on my birth record.

### Around this time
Then show:

- ±15 minutes
- ±30 minutes
- ±1 hour

MVP may initially ship ±15 and ±30 only if ±1 hour creates unacceptable calculation cost.

## Supporting explanation

> If you’re unsure, we’ll check how much your strongest locations change across that time range.

## CTA

> **Continue**

## Output

```ts
uncertaintyMinutes = 0 | 15 | 30 | 60
```

Do not label approximate birth time as “low quality”.

---

# S04 — Life Goal

## Purpose

Tell the scoring engine what the user wants to explore.

## Heading

> **What matters most right now?**

## Options

### Career
> Visibility, direction, leadership, communication and professional growth.

### Love & Relationships
> Attraction, partnership, connection and social ease.

### Home & Family
> Belonging, emotional grounding, home and family life.

### Personal Growth
> Reinvention, identity, independence and inner development.

### Overall
> A broader view across the major life themes.

Only one goal selected per calculation/result view in MVP.

## CTA

> **Show my places**

## Interaction

CTA → S05.

---

# S05 — Calculating

## Purpose

Give immediate feedback while deterministic calculations run.

## Content

Heading:

> **Mapping your places…**

Rotating/progressive messages may include:

- Calculating your planetary lines
- Comparing cities around the world
- Checking your birth-time range
- Finding your strongest patterns

These messages reflect real stages where possible.

## Requirements

- no fake 10–20 second delay;
- if calculation finishes quickly, transition quickly;
- show a recoverable error state;
- never call an LLM.

## Error state

> **We couldn’t calculate your results.**

Actions:

- Try again
- Review birth details

Technical error details should be logged, not shown to normal users.

---

# S06 — Your Places

## Purpose

Deliver the main “wow” moment: ranked places + immediate explanation.

## Header

> **Your strongest places for Career**

or selected goal.

Context line:

> Based on the birth details and time range you entered.

Allow a small `Edit` action to return to inputs.

---

## Section A — Your Pattern

Show only if a valid aggregate rule fires.

Example:

> **Your pattern**  
> Visibility and professional identity repeat across several of your strongest locations.

Keep to 1–2 sentences.

No personality diagnosis.

---

## Section B — Strongest Matches

Default: Top 5 cities.

Card structure:

```text
#1
Stockholm, Sweden
★★★★★

Career · Visibility · Reinvention

A strong place for stepping into a more visible professional identity.

Birth-time confidence: High
☉ Sun–MC

[Why Stockholm?]
```

Required fields:

- rank;
- city;
- country;
- stars;
- 2–3 theme tags;
- one-line hook;
- confidence label;
- primary influence;
- CTA.

Do not show internal numeric score.

---

## Section C — More places

Optional Top 6–10, visually less prominent.

This allows discovery without overwhelming the first screen.

---

## Section D — Countries

Optional MVP section if country aggregation is implemented reliably.

Example:

```text
Finland ★★★★★
Several cities fall within a strong supportive corridor.

Best matches: Turku · Tampere · Oulu
```

Country result must not be based on capital alone.

---

## Goal switching

Preferred MVP behavior:

A compact goal selector can recompute/rerank the same astronomical data without asking for birth details again.

If this adds excessive UI complexity, defer and provide `Change goal`.

---

## Empty/weak result behavior

Never manufacture a five-star result.

If strongest result is ★★★:

> **Your map is more mixed for this goal.**  
> These are the locations with the clearest signals, even though none are exceptionally strong in the current model.

---

# S07 — City Story

## Purpose

Answer “Why this city?” in a way that feels informative, human and traceable to the calculation.

## Header

```text
Stockholm, Sweden
★★★★★

Career · Visibility · Reinvention
```

---

## A. Why [City] stands out

2–4 sentences.

Rules:

- primary influence first;
- explain meaning in plain language;
- synthesize important secondary influence;
- no technical dump.

Example:

> Your Sun–MC influence is especially strong around Stockholm. In astrocartography, this combination is traditionally associated with visibility, professional direction and being recognised for what you do. A nearby Neptune influence makes the story more imaginative, but also more important to approach with clarity.

---

## B. The opportunity

3–5 concise points or a short paragraph.

Example:

- establish a stronger professional identity;
- take ownership or leadership;
- become more visible in your work;
- pursue ambitious goals.

---

## C. The trade-off

Always required for ★★★★★.

Example:

> Nearby Neptune influence can add imagination and inspiration, but it may also make some situations harder to read clearly. Strong boundaries and practical checks may matter more here.

Do not use “dangerous”, “bad energy”, or “avoid”.

---

## D. How this place may feel

One evocative sentence.

Example:

> **More visible. More ambitious. Less able to stay in the background.**

Only approved library language/composition may be used.

---

## E. Best suited for

3–5 tags.

Example:

`Leadership · Career change · Entrepreneurship · Building reputation`

---

## F. Birth-Time Confidence

### Exact
> Calculated using the exact birth time you entered.

### High
> This location remains one of your stronger matches across your full birth-time range.

### Medium
> This location remains meaningful, although its strength changes depending on your exact birth time.

### Time-sensitive
> This recommendation depends significantly on your exact birth time.

---

## G. Key Influences

Example:

```text
☉ Sun–MC        Primary
♆ Neptune–ASC   Secondary
```

Plain-language labels should be available via tooltip/info:

- MC — public life / career direction
- IC — home / roots / private foundation
- ASC — identity / how you meet the world
- DSC — relationships / significant others

---

## H. Explore the astrology

Collapsed by default.

May show:

```text
Sun–MC
Closest distance: 38 km
Birth-time scenarios: 249 / 38 / 176 km

Neptune–ASC
Closest distance: 39 km
```

Technical details must come directly from calculation output.

---

## I. Actions

Primary:

> **Explore another place**

Secondary:

> **Share**

Back navigation must preserve results.

---

# Share Experience

## MVP option

Use native Web Share API where available; otherwise copy share text.

Approved patterns:

> Apparently Stockholm is one of my strongest career cities ★★★★★

> My astro map keeps pointing to Stockholm for visibility and career direction.

Do not claim destiny.

A visual share card is optional and should not block MVP launch.

---

# Information architecture

```text
/
  Landing

/explore
  Birth Details
  Birth-Time Confidence
  Life Goal

/results
  Your Pattern
  Ranked Cities
  Optional Countries

/place/:cityId
  City Story
  Technical Details
```

Routing may be implemented differently if simpler, but browser Back must work predictably.

---

# State model

```ts
type JourneyState = {
  birthInput: BirthInput;
  uncertaintyMinutes: number;
  selectedGoal: Goal;
  calculationVersion: string;
  scoringVersion: string;
  interpretationVersion: string;
  results?: RankedResults;
}
```

For MVP, state may be held in memory/session storage.

Avoid putting sensitive birth details in public/shareable URLs.

---

# Accessibility

Minimum:

- keyboard-operable inputs/actions;
- semantic labels;
- sufficient contrast;
- stars accompanied by text label for screen readers;
- do not communicate confidence only by color;
- touch targets suitable for mobile;
- loading/error status announced accessibly.

---

# Responsive behavior

Primary design target: mobile portrait.

Desktop:
- center content;
- do not stretch cards excessively;
- City Story can use a readable editorial column.

Do not build separate desktop/mobile products.

---

# Visual direction

Keywords:

**Editorial · Modern · Warm · Premium · Curious · Global**

Avoid default astrology clichés:

- excessive purple;
- galaxy backgrounds;
- crystal-ball imagery;
- constant sparkles;
- dense zodiac symbolism.

Use place/city imagery only if licensing and zero-cost sourcing are resolved. The MVP can succeed without imagery.

---

# Analytics events

If analytics is implemented:

```text
landing_view
start_exploration
birth_details_complete
birth_confidence_selected
goal_selected
calculation_started
calculation_completed
results_viewed
city_story_opened
goal_changed
share_clicked
calculation_error
```

Do not send raw birth details to analytics unless explicitly designed and privacy-reviewed.

---

# Acceptance criteria

The flow is accepted when:

- user can complete it on mobile without account creation;
- inputs are validated;
- historical timezone is resolved;
- user can express time uncertainty;
- selected goal reaches scoring engine;
- results never display internal 0–100 score;
- City Story follows Result Content Framework;
- Back preserves state;
- repeat input gives repeat output;
- weak results are not inflated;
- no LLM/API is required for interpretation;
- Golden Tests pass.
