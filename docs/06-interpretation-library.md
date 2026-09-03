# Interpretation Library v0.1

**Purpose:** Approved content primitives for deterministic narrative composition.  
**Tone:** insightful, reflective, grounded, slightly evocative.  
**Language rule:** use “may”, “can”, “traditionally associated with”, “may bring attention to”; never promise outcomes.

## 1. Content object schema

```ts
type Interpretation = {
  id: string;
  archetype: string;
  coreTheme: string;
  opportunity: string[];
  tradeOff: string[];
  feel: string[];
  bestFor: string[];
  tone: "outward"|"inward"|"relational"|"transformative"|"mixed";
}
```

## 2. The 40 primary interpretations

### Sun
**Sun–MC — The Visibility Place**  
Core: visibility, professional identity, recognition.  
Opportunity: leadership; confidence in public roles; clearer career direction; reputation-building.  
Trade-off: pressure to perform; status sensitivity; work can dominate identity.  
Feel: “Like staying in the background becomes harder.”  
Best for: leadership, career change, entrepreneurship, public work.

**Sun–IC — The Inner Foundation**  
Core: roots, private identity, belonging.  
Opportunity: create a stronger base; reconnect with self/family; build a home that feels personally meaningful.  
Trade-off: private concerns may outweigh outward ambition; family dynamics can become more visible.  
Feel: “Like life turns your attention inward to what home really means.”  
Best for: settling, family focus, inner reset, home-building.

**Sun–ASC — The Self-Definition Place**  
Core: identity, vitality, self-expression.  
Opportunity: confidence; fresh personal chapter; visibility through being yourself; initiative.  
Trade-off: self-focus; pressure to define yourself quickly.  
Feel: “Like you are invited to take up more space.”  
Best for: reinvention, personal brand, independence, new beginnings.

**Sun–DSC — The Recognition Through Others Place**  
Core: partnership, visibility through relationships.  
Opportunity: meet influential people; collaboration; clearer relationship identity.  
Trade-off: projecting identity onto partners; competition for attention.  
Feel: “Like other people become mirrors for who you are becoming.”  
Best for: partnership, client work, collaboration, relationship learning.

### Moon
**Moon–MC — The Public Feeling Place**  
Core: emotional visibility, care, public responsiveness.  
Opportunity: people-facing work; community connection; intuitive career choices.  
Trade-off: public mood sensitivity; work and emotions can blur.  
Feel: “Like your emotional radar is turned up in public life.”  
Best for: community, care work, audience connection, intuitive leadership.

**Moon–IC — The Belonging Place**  
Core: home, family, emotional roots.  
Opportunity: nesting; family connection; emotional restoration; belonging.  
Trade-off: nostalgia; family patterns intensify; sensitivity to environment.  
Feel: “Like home matters more here than achievement.”  
Best for: family, home base, caregiving, emotional grounding.

**Moon–ASC — The Sensitive Self Place**  
Core: emotional identity, instinct, receptivity.  
Opportunity: intuition; authentic emotional expression; nurturing connections.  
Trade-off: moodiness; porous boundaries; environment strongly affects wellbeing.  
Feel: “Like you feel the place before you understand it.”  
Best for: self-understanding, community, care, creative reflection.

**Moon–DSC — The Emotional Partnership Place**  
Core: attachment, closeness, emotional exchange.  
Opportunity: intimate bonds; nurturing partnerships; feeling understood.  
Trade-off: dependency; projection; heightened relationship sensitivity.  
Feel: “Like relationships quickly become emotionally significant.”  
Best for: partnership, family bonds, emotional connection.

### Mercury
**Mercury–MC — The Connector Place**  
Core: communication, ideas, professional networks.  
Opportunity: writing; consulting; teaching; sales; media; knowledge work; networking.  
Trade-off: mental overload; scattered priorities; constant motion.  
Feel: “Like conversations keep opening doors.”  
Best for: consulting, content, education, tech/business communication, networking.

**Mercury–IC — The Thinking Home Base**  
Core: learning, conversation and movement around home.  
Opportunity: remote work; study; writing from home; intellectually active household.  
Trade-off: difficulty switching off; restlessness at home.  
Feel: “Like home becomes a place to think, learn and exchange ideas.”  
Best for: remote work, study, writing, flexible living.

**Mercury–ASC — The Curious Self Place**  
Core: curiosity, adaptability, social intelligence.  
Opportunity: learning; languages; meeting people; experimentation; mobility.  
Trade-off: nervous energy; fragmented attention.  
Feel: “Like you become more curious, talkative and mobile.”  
Best for: study, networking, travel, communication-led work.

**Mercury–DSC — The Conversation Partnership Place**  
Core: negotiation, exchange, intellectually stimulating relationships.  
Opportunity: clients; collaborators; mentors; contracts; learning through others.  
Trade-off: over-analysis; transactional relationships; debate replacing intimacy.  
Feel: “Like the right conversation can change your direction.”  
Best for: consulting, partnerships, client services, learning.

### Venus
**Venus–MC — The Social Visibility Place**  
Core: charm, aesthetics, collaboration in public life.  
Opportunity: creative work; diplomacy; social reputation; supportive professional relationships.  
Trade-off: people-pleasing; avoiding necessary conflict; comfort over ambition.  
Feel: “Like being liked and being visible begin to reinforce each other.”  
Best for: creative careers, brand, hospitality, partnerships, diplomacy.

**Venus–IC — The Beautiful Home Base**  
Core: comfort, harmony, belonging, pleasure at home.  
Opportunity: enjoyable home life; relationships; aesthetics; hospitality; settling.  
Trade-off: complacency; overspending on comfort; conflict avoidance.  
Feel: “Like creating a life you enjoy living becomes the priority.”  
Best for: home, family, relationships, lifestyle, hospitality.

**Venus–ASC — The Magnetic Place**  
Core: attraction, social ease, self-worth.  
Opportunity: friendships; dating; collaboration; creative confidence; pleasant daily life.  
Trade-off: seeking approval; overindulgence; avoiding difficult conversations.  
Feel: “Like connection comes a little more naturally.”  
Best for: relationships, social life, creative identity, community.

**Venus–DSC — The Partnership Place**  
Core: partnership, attraction, cooperation.  
Opportunity: romance; alliances; supportive clients; diplomacy.  
Trade-off: idealising partners; compromising too much for harmony.  
Feel: “Like relationships move closer to the centre of the story.”  
Best for: love, partnership, collaboration, client relationships.

### Mars
**Mars–MC — The Momentum Place**  
Core: ambition, action, competition in career.  
Opportunity: launch; lead; execute; build momentum; pursue demanding goals.  
Trade-off: conflict; burnout; impatience; competitive pressure.  
Feel: “Like life keeps asking: what are you going to do about it?”  
Best for: launches, entrepreneurship, competitive fields, decisive career moves.

**Mars–IC — The Restless Home Base**  
Core: action and friction in private life.  
Opportunity: renovate; establish independence; confront family patterns.  
Trade-off: domestic tension; difficulty resting; impatience at home.  
Feel: “Like home becomes active rather than restful.”  
Best for: decisive reset, physical projects, independence.

**Mars–ASC — The Courage Place**  
Core: drive, assertiveness, physical agency.  
Opportunity: confidence; action; independence; fitness; initiating change.  
Trade-off: impulsiveness; conflict; exhaustion.  
Feel: “Like you move faster and tolerate less hesitation.”  
Best for: reinvention, action, entrepreneurship, physical challenge.

**Mars–DSC — The Friction-and-Drive Partnership Place**  
Core: energetic, competitive relationships.  
Opportunity: dynamic collaborators; direct negotiation; passionate connection.  
Trade-off: arguments; rivalry; projection of anger.  
Feel: “Like other people activate you — sometimes productively, sometimes not.”  
Best for: negotiation, competitive partnerships, boundary work.

### Jupiter
**Jupiter–MC — The Expansion Place**  
Core: professional growth, opportunity, visibility.  
Opportunity: advancement; teaching; international work; leadership; optimism.  
Trade-off: overconfidence; overcommitment; assuming growth will happen automatically.  
Feel: “Like the horizon of what seems possible gets wider.”  
Best for: career expansion, education, international work, leadership.

**Jupiter–IC — The Expansive Home Base**  
Core: home, family growth, belonging, generosity.  
Opportunity: larger sense of home; family support; hospitality; settling abroad; emotional spaciousness.  
Trade-off: excess; taking on too much; idealising a place as “the answer.”  
Feel: “Like there may be more room here — literally or emotionally.”  
Best for: relocation, family, home-building, long-term base.

**Jupiter–ASC — The Possibility Place**  
Core: optimism, confidence, exploration.  
Opportunity: growth; travel; study; entrepreneurship; broader identity.  
Trade-off: overextension; lack of focus; optimism without follow-through.  
Feel: “Like saying yes becomes easier.”  
Best for: personal growth, education, international life, new ventures.

**Jupiter–DSC — The Helpful People Place**  
Core: growth through partnership.  
Opportunity: mentors; generous collaborators; supportive relationships; international networks.  
Trade-off: expecting others to provide opportunity; overpromising in partnerships.  
Feel: “Like the right people can widen your world.”  
Best for: love, mentorship, business partnerships, networks.

### Saturn
**Saturn–MC — The Builder Place**  
Core: responsibility, structure, long-term achievement.  
Opportunity: authority; mastery; durable reputation; disciplined career building.  
Trade-off: pressure; delay; heavy responsibility; loneliness at the top.  
Feel: “Like progress has to be earned — but it can last.”  
Best for: mastery, senior responsibility, institution-building, long-term career.

**Saturn–IC — The Foundation Work Place**  
Core: duty, boundaries and structure at home.  
Opportunity: create stability; confront family responsibilities; build durable foundations.  
Trade-off: heaviness; isolation; obligations; slower sense of belonging.  
Feel: “Like home asks for commitment before comfort.”  
Best for: long-term foundations, boundaries, serious family responsibilities.

**Saturn–ASC — The Maturity Place**  
Core: discipline, self-definition through responsibility.  
Opportunity: resilience; mastery; boundaries; serious personal development.  
Trade-off: restriction; self-criticism; loneliness; slower progress.  
Feel: “Like life becomes more serious — and asks you to become stronger.”  
Best for: mastery, discipline, long-term transformation.

**Saturn–DSC — The Commitment Place**  
Core: serious relationships, contracts, boundaries.  
Opportunity: durable partnerships; mature collaboration; accountability.  
Trade-off: relationship tests; distance; obligation; power imbalance.  
Feel: “Like relationships become less casual and more consequential.”  
Best for: commitment, contracts, mature partnership, boundary learning.

### Uranus
**Uranus–MC — The Disruption Career Place**  
Core: innovation, independence, unconventional career.  
Opportunity: tech; experimentation; autonomy; career reinvention.  
Trade-off: instability; abrupt changes; resistance to authority.  
Feel: “Like the old career script stops fitting.”  
Best for: innovation, startups, tech, independent work, career pivot.

**Uranus–IC — The Unconventional Home Place**  
Core: freedom and change in home life.  
Opportunity: new lifestyle; unconventional community; break family patterns.  
Trade-off: instability; difficulty settling; sudden domestic changes.  
Feel: “Like home needs to give you freedom, not just security.”  
Best for: lifestyle reset, unconventional living, independence.

**Uranus–ASC — The Reinvention Place**  
Core: freedom, individuality, radical self-update.  
Opportunity: authenticity; experimentation; new communities; independence.  
Trade-off: restlessness; unpredictability; difficulty maintaining continuity.  
Feel: “Like you become less willing to live by someone else’s script.”  
Best for: reinvention, independence, innovation, new identity.

**Uranus–DSC — The Unexpected People Place**  
Core: unconventional, catalytic relationships.  
Opportunity: surprising collaborators; diverse networks; new relationship models.  
Trade-off: instability; sudden starts/stops; difficulty with predictability.  
Feel: “Like people arrive to shake up your assumptions.”  
Best for: new networks, experimentation, unconventional partnership.

### Neptune
**Neptune–MC — The Vision Place**  
Core: imagination, ideals and ambiguity in vocation.  
Opportunity: creative/spiritual work; compassionate service; visionary direction.  
Trade-off: unclear career boundaries; idealisation; confusion about status or direction.  
Feel: “Like vocation becomes more inspiring — and harder to define.”  
Best for: creative work, service, reflection, vision-led projects.

**Neptune–IC — The Dreamlike Home Place**  
Core: sensitivity, retreat, imagination at home.  
Opportunity: sanctuary; creativity; spiritual reflection; compassionate family connection.  
Trade-off: blurred domestic boundaries; escapism; idealising home.  
Feel: “Like home can become a refuge — or a place where reality gets softer.”  
Best for: retreat, creativity, spiritual practice, rest with strong boundaries.

**Neptune–ASC — The Fluid Identity Place**  
Core: sensitivity, imagination, porous identity.  
Opportunity: intuition; art; compassion; spiritual exploration.  
Trade-off: unclear boundaries; projection; uncertainty; being misread.  
Feel: “Like the edges of who you are become softer.”  
Best for: creativity, reflection, spiritual growth, compassionate work.

**Neptune–DSC — The Idealised Relationship Place**  
Core: romantic/spiritual projection in relationships.  
Opportunity: empathy; soulful connection; artistic collaboration.  
Trade-off: idealisation; rescuing; unclear agreements; disappointment.  
Feel: “Like relationships can feel meaningful before they are fully understood.”  
Best for: creative collaboration, compassion, spiritual connection—with boundaries.

### Pluto
**Pluto–MC — The Power-and-Transformation Place**  
Core: career transformation, influence, power dynamics.  
Opportunity: deep reinvention; strategic authority; high-stakes work; impact.  
Trade-off: control struggles; intensity; obsession; endings before new beginnings.  
Feel: “Like your professional life cannot stay superficial.”  
Best for: transformation, leadership under pressure, strategic work, major career reset.

**Pluto–IC — The Deep Roots Place**  
Core: profound private/family transformation.  
Opportunity: heal old patterns; rebuild foundations; psychological depth.  
Trade-off: intense family material; control issues; difficult endings.  
Feel: “Like the place reaches beneath the surface of what ‘home’ means.”  
Best for: deep inner work, rebuilding life foundations, transformative retreat.

**Pluto–ASC — The Personal Transformation Place**  
Core: intensity, power, identity rebirth.  
Opportunity: courage; magnetism; radical self-honesty; reinvention.  
Trade-off: power struggles; obsession; intensity; all-or-nothing behavior.  
Feel: “Like an old version of you may not survive unchanged.”  
Best for: deep reinvention, leadership, psychological growth.

**Pluto–DSC — The Transformative Relationship Place**  
Core: intense relationships and power dynamics.  
Opportunity: profound partnerships; shadow work; catalytic collaboration.  
Trade-off: control; obsession; manipulation; difficult separations.  
Feel: “Like relationships become catalysts rather than background.”  
Best for: deep relationship work, high-stakes partnership, transformation.

## 3. Combination rules

Each rule contains: pair, coherence by relevant goal, synthesis phrase, trade-off modifier.

1. **Sun-MC + Jupiter-MC** — HIGH Career  
   Synthesis: “Visibility meets expansion.”  
   Story: recognition/leadership with broader opportunity. Watch overconfidence.

2. **Sun-MC + Mercury-MC** — HIGH Career  
   “Visibility meets communication.”  
   Strong for consulting, speaking, product/business communication, knowledge work.

3. **Sun-MC + Venus-ASC** — HIGH/MEDIUM Career/Love  
   “Professional visibility meets social ease.”  
   Good for relationship-led careers; watch people-pleasing.

4. **Sun-MC + Neptune-ASC** — MEDIUM Career  
   “Visibility meets inspiration — and ambiguity.”  
   Preserve Sun opportunity; add clarity/boundary warning.

5. **Sun-MC + Saturn-ASC** — MEDIUM Career/Growth  
   “Visibility meets responsibility.”  
   Strong builder story; achievement may feel earned rather than effortless.

6. **Sun-MC + Pluto-MC/ASC** — MEDIUM Career/Growth  
   “Visibility meets transformation and power.”  
   High intensity; leadership and control dynamics foregrounded.

7. **Venus-ASC + Jupiter-ASC/DSC** — HIGH Love/Growth  
   “Connection meets expansion.”  
   Social openness, helpful people, confidence; watch excess/idealisation.

8. **Venus-ASC + Saturn-ASC** — MEDIUM Love/Growth  
   “Connection meets maturity.”  
   Relationships may be meaningful but require boundaries/commitment.

9. **Venus-ASC + Uranus-ASC** — MEDIUM Love/Growth  
   “Attraction meets reinvention.”  
   Exciting networks/new identity; less predictable.

10. **Venus-ASC + Neptune-ASC** — MEDIUM Love/Growth  
    “Magnetism meets idealism.”  
    Creative/romantic; add projection and boundary warning.

11. **Moon-IC + Jupiter-IC** — HIGH Home  
    “Belonging meets expansion.”  
    One of the clearest home/family narratives; still warn against idealising.

12. **Moon-IC + Venus-IC** — HIGH Home/Love  
    “Belonging meets harmony.”  
    Strong home, family and lifestyle narrative.

13. **Jupiter-IC + Venus-IC** — HIGH Home/Love  
    “A generous, comfortable home-base signature.”  
    Watch excess/comfort-seeking.

14. **Mercury-MC + Jupiter-MC** — HIGH Career  
    “Ideas meet expansion.”  
    Teaching, consulting, international business, publishing, networks.

15. **Mercury-MC + Uranus-MC/ASC** — HIGH/MEDIUM Career/Growth  
    “Communication meets innovation.”  
    Strong for tech/new ideas; watch fragmentation.

16. **Mars-MC + Jupiter-MC** — HIGH/MEDIUM Career  
    “Momentum meets expansion.”  
    Excellent launch energy; overreach/burnout warning.

17. **Mars-MC + Saturn-MC** — MEDIUM Career  
    “Drive meets discipline.”  
    High execution potential; heavy workload/frustration if blocked.

18. **Mars + Pluto strong** — LOW/MEDIUM  
    “Intensity compounds.”  
    Never romanticise; foreground power/conflict/burnout risk.

19. **Saturn + Pluto strong** — LOW/MEDIUM  
    “Deep restructuring under pressure.”  
    Strong transformation but demanding; cap positive language.

20. **Uranus + Neptune strong** — MEDIUM Growth  
    “Reinvention meets imagination.”  
    Inspiring but destabilising; practical grounding required.

21. **Uranus + Saturn strong** — MEDIUM Growth/Career  
    “Freedom meets structure.”  
    Productive tension between change and responsibility.

22. **Neptune + Jupiter strong** — MEDIUM/HIGH Growth  
    “Vision meets expansion.”  
    Inspiring; check unrealistic expectations.

23. **Moon + Neptune strong** — MEDIUM Home/Love/Growth  
    “Sensitivity is amplified.”  
    Creative/intuitive; boundaries and emotional clarity important.

24. **Venus + Pluto strong** — MEDIUM Love/Growth  
    “Attraction meets intensity.”  
    Magnetic but not necessarily easy; power dynamics matter.

25. **Mercury + Neptune strong** — MEDIUM Career/Growth  
    “Ideas meet imagination.”  
    Creative communication; fact-checking/clarity needed.

## 4. Narrative archetypes

Primary archetypes:
- VISIBILITY — Sun-MC
- EXPANSION — Jupiter dominant
- CONNECTION — Venus dominant
- BELONGING — Moon/Jupiter/Venus IC
- CONNECTOR — Mercury dominant
- MOMENTUM — Mars dominant
- BUILDER — Saturn dominant
- REINVENTION — Uranus dominant
- VISION — Neptune dominant
- TRANSFORMATION — Pluto dominant
- LAYERED — strong supportive + strong tension influence
- BALANCED — multi-goal support without one dominant line

## 5. City Story composition

Required output order:

1. City + stars
2. Best-for tags
3. `Why [city] stands out`
4. `The opportunity`
5. `The trade-off`
6. `How this place may feel`
7. `Best suited for`
8. Birth-time confidence
9. Key influences
10. Optional technical details

Rules:
- Explain primary influence first.
- Synthesize secondary influences; do not dump definitions.
- Every ★★★★★ result still has a trade-off.
- Use max 1 evocative “feel” sentence.
- Avoid repetitive opening phrases across consecutive city cards.
- Never infer visa, safety, cost, job market, culture, or quality of life from astrology.

## 6. Birth-time wording

**Exact**
“Calculated using the exact birth time you entered.”

**High**
“This location remains one of your stronger matches across your full birth-time range.”

**Medium**
“This location remains meaningful, although its strength changes depending on your exact birth time.”

**Time-sensitive**
“This recommendation depends significantly on your exact birth time.”

## 7. Star wording

★★★★★: “One of your clearest locations for [goal].”  
★★★★☆: “A strong location for [goal], with some meaningful trade-offs.”  
★★★☆☆: “A layered location with both opportunity and challenge.”  
★★☆☆☆: “A strong influence is present, but it may feel demanding for [goal].”  
★☆☆☆☆: “This location is not strongly emphasised for [goal] in this model.”

## 8. “Your Pattern” rules

Generate only from aggregate structured data.

Examples:
- ≥3 top cities with Sun-MC primary/secondary → “Visibility and professional identity repeat across several of your strongest locations.”
- ≥3 Venus angular top cities → “Connection, collaboration and social ease are recurring themes across your map.”
- ≥3 top cities with Saturn/Pluto as strong secondary → “Many of your strongest places pair opportunity with responsibility or transformation; your map is not primarily an ‘easy path’ pattern.”
- several high-stability cities → “Your strongest recommendations remain relatively consistent across your birth-time range.”
- many time-sensitive top candidates → “Your ranking changes noticeably across your birth-time range, so exact birth time matters more for this chart.”

Never claim psychological facts about the user; phrase as patterns in the calculated map.

## 9. Share copy

Share text is playful but not deterministic:
- “Apparently [City] is one of my strongest [goal] cities ★★★★★”
- “My astro map keeps pointing to [City] for [theme].”
- “[City] showed up as a strong [goal] match — and the reason is interesting.”

Avoid “I am destined to live in…”.

## 10. Safety/integrity language

Never produce:
- guaranteed success/wealth
- medical/mental-health diagnosis
- pregnancy/fertility prediction
- death/disaster prediction
- “do not move here”
- “soulmate city”
- claims that astrology overrides practical relocation factors

Recommended footer:
“Astrocartography is an interpretive astrology practice, not a scientifically validated method for predicting life outcomes. Use these results for reflection and exploration alongside practical factors.”
