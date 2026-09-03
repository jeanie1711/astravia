# CLAUDE.md — Astro MVP Engineering Instructions

## 1. Your role

You are implementing a tightly scoped MVP from approved product, calculation, scoring, content, and test specifications.

Your job is to **implement the specifications faithfully**, not redesign the astrology model or expand product scope.

When documents conflict, stop and surface the conflict rather than inventing a resolution.

---

## 2. Read before coding

Read these documents in order:

1. `/docs/01-product-brief.md`
2. `/docs/02-user-flow-screen-spec.md`
3. `/docs/03-astro-calculation-spec.md`
4. `/docs/04-scoring-ranking-spec.md`
5. `/docs/05-result-content-framework.md`
6. `/docs/06-interpretation-library.md`
7. `/docs/07-golden-test-cases.md`

If `05-result-content-framework.md` is not yet present, do not invent its missing product/content rules. Implement only what is unambiguously specified in the other documents and flag the dependency.

---

## 3. Non-negotiable engineering rules

### Determinism

Astronomical calculation, scoring, ranking, stability, archetype selection, and interpretation composition must be deterministic.

The same:

```text
input
+ calculationVersion
+ scoringVersion
+ interpretationVersion
```

must produce the same structured result.

### No LLM runtime

Do not add:

- Claude API;
- OpenAI API;
- Gemini API;
- AI SDK;
- runtime text generation.

Interpretation must be composed from the approved local/versioned content library.

### Separation of concerns

Keep these layers separate:

```text
time/place resolution
↓
astronomical calculation
↓
line geometry
↓
city proximity
↓
scoring/ranking
↓
interpretation composition
↓
presentation/UI
```

The calculation layer must not know about “career”, “love”, “good”, “bad”, stars, or narrative.

The interpretation layer must not recalculate astronomy.

### No silent methodology changes

Do not change:

- ephemeris approach;
- coordinate frame;
- sidereal-time approach;
- MC/IC formulas;
- ASC/DSC formulas;
- distance model;
- scoring weights;
- star thresholds;
- stability rules;
- interpretation meanings;
- combination rules;

without:
1. documenting the proposed change;
2. showing affected Golden Tests;
3. receiving Product Owner approval;
4. incrementing the relevant version.

---

## 4. MVP scope guard

Do not add features outside Product Brief scope.

Specifically, do not add:

- authentication;
- accounts;
- database-backed profiles/history;
- payment/subscriptions;
- AI chat;
- daily horoscope;
- natal chart reports;
- synastry;
- transits;
- native mobile app;
- interactive astrocartography map;
- practical visa/job/cost-of-living recommendations.

If a feature seems useful but is not in scope, write it to a `FUTURE.md` suggestion list only if the Product Owner asks for backlog capture. Do not implement it opportunistically.

---

## 5. Cost constraint

The MVP is designed for near-zero infrastructure cost.

Before introducing any dependency/service that may create recurring cost, explain:

- why it is needed;
- free-tier limitation;
- no-cost alternative;
- whether it is required for MVP.

Do not sign the project up for services or create paid resources automatically.

---

## 6. Preferred implementation

Unless the existing repository dictates otherwise:

- TypeScript;
- React/Next.js or equivalent simple web stack;
- strict TypeScript;
- pure functions for calculation/scoring;
- local structured interpretation data;
- unit tests;
- no unnecessary state-management framework;
- no database for MVP;
- no microservices.

Astronomy dependency should be wrapped behind an adapter so it can be validated/replaced without rewriting product logic.

Example:

```text
src/
  astro/
    types.ts
    time.ts
    ephemeris.ts
    sidereal.ts
    mc-ic.ts
    asc-dsc.ts
    geo-distance.ts
    city-proximity.ts
    sensitivity.ts

  scoring/
    relevance.ts
    distance-strength.ts
    coherence.ts
    stability.ts
    score-city.ts
    score-country.ts

  interpretation/
    library.ts
    combinations.ts
    archetypes.ts
    compose-city-story.ts
    compose-pattern.ts

  data/
    cities.*

  app/
    ...

tests/
  astro/
  scoring/
  interpretation/
  golden/
```

Adapt to framework conventions without collapsing domain boundaries.

---

## 7. Build order

Do not start by polishing the landing page.

### Milestone 0 — Calculation engine

Build:

- validated birth input model;
- historical timezone conversion interface;
- ephemeris adapter;
- RA/declination;
- sidereal time;
- MC/IC;
- ASC/DSC;
- city-line distance;
- uncertainty scenarios.

Output structured JSON/CLI/test fixture.

**Gate:** mathematical + numerical Golden Tests.

### Milestone 1 — Scoring/ranking

Build:

- distance strength;
- goal relevance;
- primary/secondary selection;
- tension;
- coherence;
- stability;
- star conversion;
- city ranking;
- country aggregation/de-duplication.

**Gate:** scoring Golden Tests.

### Milestone 2 — Interpretation

Build:

- 40 primary interpretation objects;
- combination rules;
- archetypes;
- City Story composition;
- Your Pattern rules;
- safety language validation.

**Gate:** interpretation Golden Tests.

### Milestone 3 — Product UI

Build screens from `02-user-flow-screen-spec.md`.

**Gate:** end-to-end journey works on mobile.

### Milestone 4 — Public beta readiness

- error handling;
- performance;
- accessibility;
- anonymous analytics if approved;
- deployment;
- regression test.

---

## 8. Testing discipline

Run tests after every material domain change.

Never “fix” a failing Golden Test by weakening/removing the assertion without explaining why the expected behavior is wrong.

When a Golden Test fails:

1. identify whether failure is calculation, fixture tolerance, scoring, or content;
2. show actual vs expected;
3. explain likely cause;
4. propose the smallest correction;
5. do not tune unrelated weights to make one city pass.

Golden Tests are regression contracts, not targets to game.

---

## 9. Reference fixture caution

Golden Case 001 includes prior Swiss Ephemeris numerical benchmarks.

If the selected astronomy library differs:

- quantify the difference;
- verify coordinate frame/time conventions;
- do not assume either implementation is wrong immediately;
- document systematic deltas;
- ask for approval before changing tolerance/methodology.

Do not hardcode Golden Case values into production logic.

---

## 10. Timezone rules

Historical timezone handling is required.

Never calculate UTC by using a city's present-day UTC offset.

Ambiguous DST fold:
- require explicit resolution.

Nonexistent DST-gap local time:
- flag it.

Do not silently normalize ambiguous/nonexistent civil time.

---

## 11. Scoring rules

User sees 1–5 stars, not 0–100.

Internal numeric scores may exist for ranking but must not be shown in the MVP UI.

Do not:
- force ★★★★★ into results;
- globally classify a planet as “bad”;
- hide strong tension influences;
- let a TIME_SENSITIVE result become ★★★★★ under v0.1 rules;
- rank countries from capitals alone.

---

## 12. Interpretation rules

Use the approved library.

Required City Story structure:

```text
City + stars
Best-for themes
Why this place stands out
The opportunity
The trade-off
How this place may feel
Best suited for
Birth-time confidence
Key influences
Optional technical details
```

Rules:

- primary influence first;
- synthesize secondary influences;
- use an explicit combination rule where available;
- every ★★★★★ result has a trade-off;
- do not concatenate generic planet definitions;
- do not invent practical city facts;
- do not infer user personality as fact.

---

## 13. Prohibited copy

Do not generate language equivalent to:

- “You will definitely…”
- “Guaranteed…”
- “You are destined…”
- “Soulmate city”
- “You will become rich”
- “Do not move here”
- medical/fertility/death/disaster predictions.

Use reflective language:

- “may”
- “can”
- “traditionally associated with”
- “this location emphasises”
- “this combination suggests”

---

## 14. Privacy

Birth date, birth time and birthplace are personal inputs.

For MVP:

- do not put raw birth details in public URLs;
- do not log them unnecessarily;
- do not send them to analytics by default;
- do not send them to third-party AI services;
- minimize persistence.

Session/local state is preferred unless the Product Owner approves persistence.

---

## 15. Dependency discipline

Before adding a package:

- check whether platform/native APIs already solve the problem;
- prefer maintained, small dependencies;
- record why a major dependency is needed;
- check license compatibility;
- avoid duplicate libraries for the same purpose.

Keep the astronomy engine behind an adapter.

---

## 16. Code quality

Prefer:

- pure, testable functions;
- explicit types;
- small modules;
- descriptive domain names;
- no magic numbers outside versioned config;
- configuration objects for weights/thresholds;
- comments explaining formulas, not obvious syntax.

Store versions in one place:

```ts
export const MODEL_VERSIONS = {
  calculation: "0.1",
  scoring: "0.1",
  interpretation: "0.1"
};
```

Include versions in result output.

---

## 17. Product-owner decision log

When a spec leaves a real product decision unresolved, do not guess silently.

Create/maintain:

```text
/docs/DECISIONS.md
```

with:

```text
Date
Decision needed
Context
Options
Recommended option
Impact
Status: OPEN / APPROVED
```

Ask the Product Owner only when the decision blocks correct implementation.

Do not ask about trivial implementation details that can be safely chosen within the spec.

---

## 18. Definition of done for a coding task

A task is complete only when:

- implementation matches spec;
- TypeScript checks pass;
- relevant unit tests pass;
- Golden Tests pass;
- no unrelated feature was added;
- errors are handled;
- code is readable;
- versioned methodology remains unchanged unless explicitly approved.

---

## 19. First instruction when starting the repo

Before writing production code:

1. inspect repository;
2. read `/docs`;
3. summarize the MVP architecture and constraints;
4. identify any blocking contradictions/missing dependencies;
5. propose Milestone 0 implementation plan;
6. wait for approval of the plan if it changes architecture or methodology;
7. then implement calculation engine first.

Do **not** begin by generating a complete app from one prompt.
