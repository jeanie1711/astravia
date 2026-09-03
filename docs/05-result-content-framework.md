# 05 — Result Content Framework v0.1

## 1. Purpose

This document defines how astrocartography results should be presented to users.

It is the **content and UX contract** between the scoring engine and the user interface.

It answers:

> **What should a good result look like, communicate, and feel like?**

This framework does **not** define astronomical calculation formulas or scoring weights. Those belong in:

- `03-astro-calculation-spec.md`
- `04-scoring-ranking-spec.md`

Interpretation primitives and combination rules belong in:

- `06-interpretation-library.md`

---

## 2. Result design principle

Every result should answer five questions:

1. **Where does this place rank for me?**
2. **What is it strongest for?**
3. **Why does it stand out?**
4. **What is the opportunity and trade-off?**
5. **How stable is this result if my birth time is uncertain?**

Core principle:

> **Stars tell me where.  
> Story tells me why.  
> Stability tells me how much confidence to place in it.**

The product should feel like a personalized editorial discovery experience, not a technical astrology report.

---

## 3. Result hierarchy

The MVP has three content layers.

### Level 1 — Discovery Card

Used on the main results page.

Purpose:
- quick comparison;
- help user decide which place to explore;
- avoid astrology jargon overload.

Required fields:

```text
City, Country
★★★★★

Primary themes / best-for tags

One-line hook

Birth-time confidence
Primary influence

[Why this place?]
```

Example:

```text
Stockholm, Sweden
★★★★★

Career · Visibility · Reinvention

A strong place for stepping into a more visible professional identity.

Birth-time confidence: High
☉ Sun–MC

[Why Stockholm?]
```

Rules:
- keep to one primary message;
- max 3 visible tags;
- no internal numeric score;
- do not list every nearby planetary line.

---

### Level 2 — City Story

Opened from a Discovery Card.

Purpose:
- explain why the city appears;
- synthesize multiple influences;
- show upside and trade-off;
- create emotional resonance without becoming deterministic.

Required sections:

1. Why this place stands out
2. The opportunity
3. The trade-off
4. How this place may feel
5. Best suited for
6. Birth-time confidence
7. Key influences

Example structure:

```text
Stockholm, Sweden
★★★★★

Career · Visibility · Reinvention

WHY STOCKHOLM STANDS OUT
...

THE OPPORTUNITY
...

THE TRADE-OFF
...

HOW THIS PLACE MAY FEEL
...

BEST SUITED FOR
...

BIRTH-TIME CONFIDENCE
High

KEY INFLUENCES
☉ Sun–MC — Primary
♆ Neptune–ASC — Secondary
```

---

### Level 3 — Explore the Astrology

Collapsed by default.

Purpose:
- give advanced users traceability;
- show that the story comes from structured calculations;
- keep technical detail away from the default experience.

May contain:

```text
Sun–MC
Closest distance: 38 km

Birth-time scenarios:
249 km / 38 km / 176 km

Neptune–ASC
Closest distance: 39 km
```

Rules:
- technical values come directly from calculation output;
- do not generate technical details from narrative content;
- do not show raw scoring weights unless explicitly added as a future expert feature.

---

## 4. Star Rating Framework

The user sees **1–5 stars**, not percentages or 0–100 scores.

| Rating | Label | Meaning |
|---|---|---|
| ★★★★★ | Exceptional | Strong, coherent and stable fit for the selected goal |
| ★★★★☆ | Strong | Clearly supportive, with meaningful trade-offs |
| ★★★☆☆ | Mixed | Meaningful potential with notable competing or challenging signals |
| ★★☆☆☆ | Challenging | Strong influence may exist but does not align cleanly with the selected goal |
| ★☆☆☆☆ | Weak | Little meaningful support for the selected goal |

Definition shown in product help:

> **Stars are a relative astrology-based rating of how strongly and coherently a location aligns with the selected goal.**

Stars are **not**:

- probability;
- objective city quality;
- luck;
- destiny;
- relocation feasibility;
- scientific certainty.

---

## 5. Goal Framework

The same city may receive different ratings under different goals.

MVP goals:

### Career

Themes:
- visibility;
- professional direction;
- leadership;
- communication;
- reputation;
- expansion;
- entrepreneurship;
- mastery.

### Love & Relationships

Themes:
- attraction;
- partnership;
- connection;
- social ease;
- emotional exchange;
- collaboration.

### Home & Family

Themes:
- belonging;
- roots;
- emotional grounding;
- home;
- family;
- settling;
- private foundation.

### Personal Growth

Themes:
- identity;
- reinvention;
- independence;
- transformation;
- self-development;
- breaking old patterns.

### Overall

Overall is not a simple average of the four goals.

It should reward:
- breadth of support;
- coherence;
- stability;
- meaningful multi-goal fit.

---

## 6. City Story Content Anatomy

### A. Hook

One sentence.

Purpose:
- summarize the core story;
- make the result immediately understandable.

Examples:

> A place where your professional identity may become much more visible.

> A socially magnetic place that also asks you to reinvent how you relate to others.

Rules:
- no more than one idea plus one optional modifier;
- must align with the primary influence and archetype;
- avoid generic horoscope language.

---

### B. Why this place stands out

2–4 sentences.

Must explain:
- primary influence;
- why it matters for the selected goal;
- important secondary influence if material.

Example:

> Your Sun–MC influence is especially strong around Stockholm. In astrocartography, this combination is traditionally associated with visibility, professional direction and being recognised for what you do. A nearby Neptune influence adds imagination and inspiration, while making clarity and boundaries more important.

Rules:
- primary influence first;
- synthesize secondary influence;
- no dictionary-style line dump.

---

### C. The opportunity

3–5 short points or one concise paragraph.

Purpose:
- translate astrology into practical themes for reflection.

Example:

```text
You may find it easier here to:
- establish a stronger professional identity;
- take ownership or leadership;
- become more visible in your work;
- pursue ambitious professional goals.
```

Rules:
- describe themes, not outcomes;
- no guarantee;
- no practical city claims.

---

### D. The trade-off

Required for every City Story.

Especially mandatory for ★★★★★.

Purpose:
- prevent one-sided “good place / bad place” interpretation;
- surface demanding or conflicting influences.

Example:

> Increased visibility may also bring greater pressure to perform. If Neptune is also strong, inspiration can be high while clarity is more important to protect.

Use:

- “may ask for…”
- “watch for…”
- “the challenge here may be…”
- “this influence can become demanding when…”

Avoid:

- dangerous;
- cursed;
- bad energy;
- avoid this place.

---

### E. How this place may feel

One emotionally resonant sentence.

This is a signature content element.

Examples:

> More visible. More ambitious. Less able to stay in the background.

> Like conversations keep opening doors.

> Like home matters more here than achievement.

> Like the old version of you has less room to stay unchanged.

Rules:
- maximum one sentence;
- use approved interpretation-library language;
- evocative but not predictive;
- never claim an actual emotional outcome as certainty.

---

### F. Best suited for

3–5 concise tags.

Examples:

```text
Leadership · Career change · Entrepreneurship · Building reputation
```

```text
Home base · Family life · Settling · Emotional grounding
```

Rules:
- derive from primary + relevant secondary influences;
- tags indicate themes, not promises.

---

### G. Birth-Time Confidence

#### Exact

**Exact-time calculation**

> Calculated using the exact birth time you entered.

#### High

**High confidence**

> This location remains one of your stronger matches across your full birth-time range.

#### Medium

**Medium confidence**

> This location remains meaningful, although its strength changes depending on your exact birth time.

#### Time-sensitive

**Time-sensitive**

> This recommendation depends significantly on your exact birth time.

Use **Time-sensitive**, not “Low confidence”, in the primary user experience.

Do not describe the confidence score as probability.

---

### H. Key Influences

Show only the influences that materially contribute to the result.

Example:

```text
☉ Sun–MC — Primary
♆ Neptune–ASC — Secondary
```

Recommended maximum:
- 1 primary;
- 1–3 secondary.

Avoid clutter from weak lines.

---

## 7. Multi-Line Composition

The engine should tell a **location story**, not provide separate dictionary definitions.

Bad:

> Sun–MC means career visibility. Neptune–ASC means imagination.

Good:

> Strong professional visibility is combined with a more intuitive and imaginative atmosphere, making this a powerful but less straightforward location.

The Interpretation Library defines approved combination rules.

Examples:

### Sun–MC + Jupiter–MC

> **Visibility meets expansion.**

### Sun–MC + Venus–ASC

> **Professional visibility meets social ease.**

### Sun–MC + Neptune–ASC

> **Visibility meets inspiration — and ambiguity.**

### Venus–ASC + Saturn–ASC

> **Connection meets maturity.**

### Moon–IC + Jupiter–IC

> **Belonging meets expansion.**

Rules:
- use explicit combination rule where available;
- if no combination rule exists, use controlled composition from structured traits;
- never ask an LLM to decide what two lines “mean together” in MVP.

---

## 8. Coherence

Coherence is an internal concept that helps determine rating and wording.

It does not need to be shown as a user-facing metric in MVP.

### High coherence

Multiple meaningful influences tell a compatible story.

Example:
- Sun–MC + Jupiter–MC for Career.

Preferred copy:

> This is one of your clearer locations for career visibility and expansion.

### Medium coherence

Strong opportunity exists, but the story is layered.

Example:
- Sun–MC + Neptune–ASC.

Preferred copy:

> There is real potential here, but the story is more layered.

### Low coherence

Strong but competing influences exist.

Preferred copy:

> This location carries several strong influences that may pull in different directions.

Do not equate low coherence with “bad”.

---

## 9. Narrative Archetypes

Each city should have a dominant narrative archetype selected from structured calculation/scoring data.

MVP archetypes:

| Archetype | Typical dominant influence |
|---|---|
| The Visibility Place | Sun–MC |
| The Expansion Place | Jupiter dominant |
| The Connection Place | Venus dominant |
| The Belonging Place | Moon/Jupiter/Venus IC |
| The Connector Place | Mercury dominant |
| The Momentum Place | Mars dominant |
| The Builder Place | Saturn dominant |
| The Reinvention Place | Uranus dominant |
| The Vision Place | Neptune dominant |
| The Transformation Place | Pluto dominant |
| The Layered Place | strong supportive + strong tension signals |
| The Balanced Place | meaningful multi-goal support |

Archetypes are editorial summaries, not astrological entities.

They may appear in UI later but are primarily useful for content composition.

---

## 10. “Your Pattern”

The Results page may include one personalized aggregate insight.

Purpose:

> Help the user understand not only **which places**, but **what kind of places repeatedly stand out**.

Examples:

> Visibility and professional identity repeat across several of your strongest locations.

> Connection, collaboration and social ease are recurring themes across your map.

> Several of your strongest places pair opportunity with responsibility or transformation, so your map is more about meaningful challenge than effortless ease.

Rules:
- derive from repeated structured patterns;
- do not infer fixed psychological traits;
- no LLM;
- show only when a pattern threshold is met;
- otherwise omit the section.

---

## 11. Country Result Framework

Country results must aggregate city-level evidence.

A country is **not** its capital.

Country Story types:

### Corridor

Several cities share a similar strong pattern.

Example:

> Several cities in Finland fall within the same supportive corridor, making the country notable for more than one isolated location.

### Anchor

One standout city dominates.

Example:

> Austria appears primarily because Vienna is a particularly strong match, while other cities are less pronounced.

### Mixed

Different cities support different goals.

Example:

> Germany is more varied: some cities emphasize communication and professional visibility, while others carry a stronger transformation theme.

Country card may show:

```text
Finland ★★★★★

Several cities fall within a strong supportive corridor.

Best matches:
Turku · Tampere · Oulu
```

Country rating logic is defined in the Scoring & Ranking Spec.

---

## 12. Weak or Mixed Results

The system must not force positive output.

If no city is exceptionally strong:

> **Your map is more mixed for this goal.**

Supporting copy:

> These are the locations with the clearest signals in the current model, even though none stand out as an exceptional match.

A ★★★ result can still be useful.

Do not use artificial positivity to make every result feel “special”.

---

## 13. Tone of Voice

Target tone:

**Insightful · Reflective · Grounded · Slightly evocative**

Use:

- may support;
- may feel;
- can bring attention to;
- traditionally associated with;
- this location emphasises;
- this combination suggests;
- may make X more important.

Avoid:

- certainty;
- prophecy;
- fear;
- pseudo-scientific wording;
- overuse of mystical language.

---

## 14. Deterministic Language Rules

Recommended:

> This location may support greater professional visibility.

> In astrocartography, Sun–MC is traditionally associated with public identity and career direction.

> This combination can feel more demanding when responsibility becomes heavy.

Prohibited:

> You will become successful here.

> This city guarantees love.

> You are destined to move here.

> This is your soulmate city.

> You will become wealthy here.

> Do not move here.

---

## 15. Positive + Challenge Balance

Every meaningful location has both potential and trade-off.

A high score means:
- strong relevance;
- coherence;
- stability.

It does not mean:
- easy;
- perfect;
- risk-free.

Examples:

### Sun–MC ★★★★★

Opportunity:
- visibility;
- recognition;
- leadership.

Trade-off:
- performance pressure;
- status sensitivity;
- work identity becoming dominant.

### Venus–ASC ★★★★★

Opportunity:
- attraction;
- social ease;
- creative confidence.

Trade-off:
- people-pleasing;
- comfort-seeking;
- avoiding conflict.

---

## 16. Technical Detail Placement

Distance should not be foregrounded in the normal experience.

Default user language:

> **Strong Sun–MC influence**

Advanced detail:

> Closest distance: 183 km

Reason:
- distance is supporting evidence, not the result itself;
- users should not need to understand line-distance methodology to interpret their city.

---

## 17. Shareable Content

Share copy should be short, curious and non-deterministic.

Approved examples:

> Apparently Stockholm is one of my strongest career cities ★★★★★

> My astro map keeps pointing to Vienna for visibility and career direction.

> Barcelona showed up as a strong communication and career match — and the reason is interesting.

Avoid:

> The universe says I must move to Stockholm.

> I found the city where I will meet my soulmate.

---

## 18. Result Output Schema

Recommended structured output:

```ts
type CityResult = {
  city: string;
  country: string;

  goal: Goal;
  stars: 1 | 2 | 3 | 4 | 5;
  ratingLabel: string;

  archetypeId: string;
  primaryTheme: string;
  secondaryThemes: string[];

  hook: string;

  whyItStandsOut: string;
  opportunities: string[];
  tradeOffs: string[];

  howItMayFeel: string;
  bestFor: string[];

  birthTimeConfidence:
    | "EXACT"
    | "HIGH"
    | "MEDIUM"
    | "TIME_SENSITIVE";

  confidenceExplanation: string;

  primaryInfluence: Influence;
  secondaryInfluences: Influence[];

  technicalDetails: {
    line: string;
    distanceKm: number;
    scenarioDistancesKm: number[];
  }[];

  shareText: string;

  calculationVersion: string;
  scoringVersion: string;
  interpretationVersion: string;
}
```

The UI should consume structured output rather than generating meaning independently.

---

## 19. Content Generation Pipeline

```text
Astronomical calculation
↓
Relevant city-line influences
↓
Goal weighting
↓
Primary influence
↓
Secondary influences
↓
Support / tension classification
↓
Coherence
↓
Birth-time stability
↓
Star rating
↓
Narrative archetype
↓
Combination rule
↓
Content blocks
↓
City Story
```

Non-negotiable principle:

> **Calculation determines the story.  
> Story never determines the calculation.**

---

## 20. Content Safety and Integrity

Do not use astrocartography to assert:

- medical outcomes;
- mental-health diagnosis;
- fertility or pregnancy;
- death;
- disasters;
- guaranteed financial gain;
- guaranteed career outcome;
- guaranteed relationship outcome.

Do not tell the user:

> “Move here.”

Prefer:

> “This may be a place worth exploring for [goal].”

Recommended global disclaimer:

> **Astrocartography is an interpretive astrology practice, not a scientifically validated method for predicting life outcomes. Use these results for reflection and exploration alongside practical factors.**

---

## 21. MVP Content Acceptance Criteria

A City Story passes content QA when:

1. star label matches scoring output;
2. selected goal is clear;
3. primary influence appears first;
4. important secondary influence is synthesized;
5. opportunity is non-empty;
6. trade-off is non-empty;
7. ★★★★★ still includes a trade-off;
8. “How this place may feel” is one concise sentence;
9. confidence wording matches stability output;
10. technical details match calculation output;
11. no deterministic/prohibited claim appears;
12. no practical city facts are invented;
13. same structured input produces the same content blocks;
14. content feels like one coherent place story rather than a list of astrology definitions.

---

## 22. Product Standard

The result should not leave the user thinking:

> “The app told me I have to move to Stockholm.”

The intended response is:

> **“I understand why Stockholm appears in my map, what it may bring into focus, and whether I want to explore it further.”**

That is the target level of promise for the MVP.
