# 01 — MVP Product Brief v0.1

## 1. Product working concept

A mobile-first web experience that helps users discover which places in the world stand out in their astrocartography and, more importantly, understand **why**.

**Core proposition:**  
**Find your places — and understand why they matter.**

**Product principle:**  
**Not just where. Why this place matters.**

The MVP is an interpretive discovery product, not a relocation decision-maker and not a generic horoscope app.

---

## 2. Problem

Traditional astrocartography tools often lead with a complex world map and planetary lines. A non-expert user may be able to see that a line crosses a region but still not know:

- Which cities matter most?
- Which location is strongest for the goal they care about?
- Why does that city stand out?
- Is the influence supportive, challenging, or mixed?
- Does the recommendation remain meaningful if their birth time is slightly uncertain?

The MVP converts astrocartography calculations into an understandable, editorial-style location discovery experience.

---

## 3. Target user

Initial target user:

- interested in astrology, self-discovery, travel, relocation, or life transitions;
- does not need to understand technical astrocartography;
- wants personalized answers rather than a raw chart;
- may be considering where to live, work, travel, study, build relationships, or begin a new chapter;
- values an explanation of *why* a place appears, not only a ranking.

The MVP does not require the user to believe astrology is scientifically predictive. Results are presented as an interpretive/reflection tool.

---

## 4. Primary job to be done

> “When I am curious about where in the world may fit what I want next, help me discover the places that stand out in my astrocartography and explain what each place may bring into focus.”

Secondary jobs:

- compare different cities;
- understand opportunity versus trade-off;
- explore a place for a specific life goal;
- understand whether uncertain birth time changes the result;
- share an interesting personalized result.

---

## 5. MVP hypothesis

If users receive a small set of personalized city recommendations with:

1. an intuitive 1–5 star rating,
2. a clear “Why this place?” explanation,
3. opportunity + trade-off,
4. a human “How this place may feel” insight, and
5. birth-time confidence,

then they will find the experience more useful and engaging than a raw astrocartography map and will want to explore/share more results.

---

## 6. MVP success question

The MVP exists to answer:

> **Do users care enough about personalized astro-location explanations to finish the experience, explore multiple results, share/save them, or ask for more?**

The MVP is not intended to validate subscriptions, native mobile retention, or a full astrology platform.

---

## 7. Core user journey

```text
Landing
→ Birth details
→ Birth-time confidence
→ Life goal
→ Calculate
→ Your Places
→ City Story
→ Explore another result / share
```

---

## 8. Life goals

MVP supports five result modes:

1. **Career**
2. **Love & Relationships**
3. **Home & Family**
4. **Personal Growth**
5. **Overall**

Goal selection changes ranking and interpretation. It does not change astronomical calculation.

---

## 9. Core result

Each ranked city should answer:

- **Where?** — city/country
- **How strong?** — ★ to ★★★★★
- **For what?** — primary theme / best-for tags
- **Why?** — primary and secondary astrocartography influences
- **Opportunity?** — potential supportive expression
- **Trade-off?** — complexity/challenge
- **How might it feel?** — concise human interpretation
- **How stable is this?** — birth-time confidence
- **What is underneath?** — optional technical details

The star rating is an astrology-based relative score. It is not a probability.

---

## 10. Signature MVP feature: Birth-Time Confidence

Many users do not know their exact birth minute.

If uncertainty is selected, calculate multiple scenarios around the entered time and classify the result:

- **High**
- **Medium**
- **Time-sensitive**

Example:

> **High confidence**  
> This location remains one of your stronger matches across your full birth-time range.

This feature is part of MVP, not a later enhancement.

---

## 11. “Your Pattern”

The results page may show one aggregate personalized observation based only on calculated map patterns.

Example:

> “Visibility and professional identity repeat across several of your strongest locations.”

Rules:

- derive only from structured calculation/scoring data;
- never infer fixed personality traits;
- never use an LLM to invent a pattern.

---

## 12. MVP functional scope

### Included

- birth date input;
- birth time input;
- birthplace input/resolution;
- historical timezone resolution;
- birth-time uncertainty;
- 10 planetary bodies;
- MC / IC / ASC / DSC;
- curated global city dataset;
- city-to-line distance;
- goal-specific scoring;
- 1–5 stars;
- city ranking;
- country aggregation;
- City Story;
- birth-time confidence;
- Your Pattern;
- shareable result text/card if technically simple;
- responsive/mobile-first UI;
- deterministic calculation and interpretation;
- basic anonymous analytics if available at no material cost.

### Explicitly excluded

Do **not** add without Product Owner approval:

- authentication;
- user accounts;
- saved profiles;
- database-backed history;
- subscriptions;
- payment;
- AI/LLM runtime API;
- AI chat;
- daily horoscope;
- natal-chart reading;
- synastry/compatibility;
- transits/progressions;
- native iOS/Android app;
- interactive astrocartography world map;
- relocation visa data;
- job-market data;
- cost-of-living data;
- school/healthcare/safety rankings;
- personalized practical relocation recommendations;
- push notifications.

---

## 13. MVP architecture principle

```text
Birth input
↓
Astronomical calculation
↓
City proximity
↓
Goal scoring
↓
Stability + coherence
↓
1–5 star ranking
↓
Interpretation composition
↓
UI
```

**Calculation determines the story. The story must never determine the calculation.**

No LLM is required at runtime.

---

## 14. Content experience

The product should feel:

- editorial;
- thoughtful;
- modern;
- warm;
- premium but simple;
- curious;
- reflective;
- globally oriented.

It should **not** feel:

- occult/witchy by default;
- like a scientific dashboard;
- like a generic horoscope feed;
- deterministic;
- alarmist;
- overloaded with astrological jargon.

Places are the visual hero. Astrology is the underlying engine.

---

## 15. Product integrity

Astrocartography is not scientifically validated as a method for predicting life outcomes.

The product must not claim:

- guaranteed career success;
- guaranteed wealth;
- soulmate outcomes;
- fertility/pregnancy outcomes;
- health outcomes;
- death/disaster predictions;
- that a user must or must not relocate;
- that astrology replaces practical relocation research.

Recommended footer:

> “Astrocartography is an interpretive astrology practice, not a scientifically validated method for predicting life outcomes. Use these results for reflection and exploration alongside practical factors.”

---

## 16. MVP technology constraints

Optimize for near-zero cash cost.

Preferred:

- TypeScript;
- React / Next.js or similarly simple web stack;
- static/serverless deployment;
- no paid database required;
- no paid AI API;
- astronomy library behind an adapter;
- local/versioned interpretation content;
- curated city dataset bundled or statically served;
- tests runnable locally and in CI.

Do not make a technology decision that creates a recurring paid dependency without Product Owner approval.

---

## 17. Initial validation metrics

Track where feasible:

- landing → birth-details start;
- birth-details completion;
- calculation completion;
- result-page reached;
- number of City Stories opened;
- second/third result explored;
- share action;
- “want more” / waitlist / feedback action if implemented.

The first validation cohort can be small. Qualitative feedback matters more than vanity traffic.

---

## 18. Definition of MVP done

MVP is done when a real user can:

1. open a public URL on mobile;
2. enter valid birth details;
3. indicate birth-time uncertainty;
4. select a life goal;
5. receive deterministic global city results;
6. understand why top places appear;
7. see opportunity and trade-off;
8. see birth-time confidence;
9. inspect at least one City Story;
10. repeat the same input and receive the same result;
11. pass the approved Golden Tests.

A beautiful landing page without a validated calculation/scoring engine is **not** a completed MVP.
