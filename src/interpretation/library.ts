import type { Angle, Body } from "../astro/types";
import type { Interpretation, Tone } from "./types";

// The 40 primary interpretation objects (06-interpretation-library.md §2),
// transcribed verbatim from the approved content library. Content only --
// no scoring/astronomy logic belongs here (CLAUDE.md §3).
const ENTRIES: Array<Omit<Interpretation, "id">> = [
  // Sun
  {
    body: "Sun",
    angle: "MC",
    archetype: "The Visibility Place",
    coreTheme: "visibility, professional identity, recognition",
    opportunity: ["leadership", "confidence in public roles", "clearer career direction", "reputation-building"],
    tradeOff: ["pressure to perform", "status sensitivity", "work can dominate identity"],
    feel: ["Like staying in the background becomes harder."],
    bestFor: ["leadership", "career change", "entrepreneurship", "public work"],
    tone: "outward"
  },
  {
    body: "Sun",
    angle: "IC",
    archetype: "The Inner Foundation",
    coreTheme: "roots, private identity, belonging",
    opportunity: ["create a stronger base", "reconnect with self/family", "build a home that feels personally meaningful"],
    tradeOff: ["private concerns may outweigh outward ambition", "family dynamics can become more visible"],
    feel: ["Like life turns your attention inward to what home really means."],
    bestFor: ["settling", "family focus", "inner reset", "home-building"],
    tone: "inward"
  },
  {
    body: "Sun",
    angle: "ASC",
    archetype: "The Self-Definition Place",
    coreTheme: "identity, vitality, self-expression",
    opportunity: ["confidence", "fresh personal chapter", "visibility through being yourself", "initiative"],
    tradeOff: ["self-focus", "pressure to define yourself quickly"],
    feel: ["Like you are invited to take up more space."],
    bestFor: ["reinvention", "personal brand", "independence", "new beginnings"],
    tone: "outward"
  },
  {
    body: "Sun",
    angle: "DSC",
    archetype: "The Recognition Through Others Place",
    coreTheme: "partnership, visibility through relationships",
    opportunity: ["meet influential people", "collaboration", "clearer relationship identity"],
    tradeOff: ["projecting identity onto partners", "competition for attention"],
    feel: ["Like other people become mirrors for who you are becoming."],
    bestFor: ["partnership", "client work", "collaboration", "relationship learning"],
    tone: "relational"
  },
  // Moon
  {
    body: "Moon",
    angle: "MC",
    archetype: "The Public Feeling Place",
    coreTheme: "emotional visibility, care, public responsiveness",
    opportunity: ["people-facing work", "community connection", "intuitive career choices"],
    tradeOff: ["public mood sensitivity", "work and emotions can blur"],
    feel: ["Like your emotional radar is turned up in public life."],
    bestFor: ["community", "care work", "audience connection", "intuitive leadership"],
    tone: "mixed"
  },
  {
    body: "Moon",
    angle: "IC",
    archetype: "The Belonging Place",
    coreTheme: "home, family, emotional roots",
    opportunity: ["nesting", "family connection", "emotional restoration", "belonging"],
    tradeOff: ["nostalgia", "family patterns intensify", "sensitivity to environment"],
    feel: ["Like home matters more here than achievement."],
    bestFor: ["family", "home base", "caregiving", "emotional grounding"],
    tone: "inward"
  },
  {
    body: "Moon",
    angle: "ASC",
    archetype: "The Sensitive Self Place",
    coreTheme: "emotional identity, instinct, receptivity",
    opportunity: ["intuition", "authentic emotional expression", "nurturing connections"],
    tradeOff: ["moodiness", "porous boundaries", "environment strongly affects wellbeing"],
    feel: ["Like you feel the place before you understand it."],
    bestFor: ["self-understanding", "community", "care", "creative reflection"],
    tone: "inward"
  },
  {
    body: "Moon",
    angle: "DSC",
    archetype: "The Emotional Partnership Place",
    coreTheme: "attachment, closeness, emotional exchange",
    opportunity: ["intimate bonds", "nurturing partnerships", "feeling understood"],
    tradeOff: ["dependency", "projection", "heightened relationship sensitivity"],
    feel: ["Like relationships quickly become emotionally significant."],
    bestFor: ["partnership", "family bonds", "emotional connection"],
    tone: "relational"
  },
  // Mercury
  {
    body: "Mercury",
    angle: "MC",
    archetype: "The Connector Place",
    coreTheme: "communication, ideas, professional networks",
    opportunity: ["writing", "consulting", "teaching", "sales", "media", "knowledge work", "networking"],
    tradeOff: ["mental overload", "scattered priorities", "constant motion"],
    feel: ["Like conversations keep opening doors."],
    bestFor: ["consulting", "content", "education", "tech/business communication", "networking"],
    tone: "outward"
  },
  {
    body: "Mercury",
    angle: "IC",
    archetype: "The Thinking Home Base",
    coreTheme: "learning, conversation and movement around home",
    opportunity: ["remote work", "study", "writing from home", "intellectually active household"],
    tradeOff: ["difficulty switching off", "restlessness at home"],
    feel: ["Like home becomes a place to think, learn and exchange ideas."],
    bestFor: ["remote work", "study", "writing", "flexible living"],
    tone: "inward"
  },
  {
    body: "Mercury",
    angle: "ASC",
    archetype: "The Curious Self Place",
    coreTheme: "curiosity, adaptability, social intelligence",
    opportunity: ["learning", "languages", "meeting people", "experimentation", "mobility"],
    tradeOff: ["nervous energy", "fragmented attention"],
    feel: ["Like you become more curious, talkative and mobile."],
    bestFor: ["study", "networking", "travel", "communication-led work"],
    tone: "outward"
  },
  {
    body: "Mercury",
    angle: "DSC",
    archetype: "The Conversation Partnership Place",
    coreTheme: "negotiation, exchange, intellectually stimulating relationships",
    opportunity: ["clients", "collaborators", "mentors", "contracts", "learning through others"],
    tradeOff: ["over-analysis", "transactional relationships", "debate replacing intimacy"],
    feel: ["Like the right conversation can change your direction."],
    bestFor: ["consulting", "partnerships", "client services", "learning"],
    tone: "relational"
  },
  // Venus
  {
    body: "Venus",
    angle: "MC",
    archetype: "The Social Visibility Place",
    coreTheme: "charm, aesthetics, collaboration in public life",
    opportunity: ["creative work", "diplomacy", "social reputation", "supportive professional relationships"],
    tradeOff: ["people-pleasing", "avoiding necessary conflict", "comfort over ambition"],
    feel: ["Like being liked and being visible begin to reinforce each other."],
    bestFor: ["creative careers", "brand", "hospitality", "partnerships", "diplomacy"],
    tone: "outward"
  },
  {
    body: "Venus",
    angle: "IC",
    archetype: "The Beautiful Home Base",
    coreTheme: "comfort, harmony, belonging, pleasure at home",
    opportunity: ["enjoyable home life", "relationships", "aesthetics", "hospitality", "settling"],
    tradeOff: ["complacency", "overspending on comfort", "conflict avoidance"],
    feel: ["Like creating a life you enjoy living becomes the priority."],
    bestFor: ["home", "family", "relationships", "lifestyle", "hospitality"],
    tone: "inward"
  },
  {
    body: "Venus",
    angle: "ASC",
    archetype: "The Magnetic Place",
    coreTheme: "attraction, social ease, self-worth",
    opportunity: ["friendships", "dating", "collaboration", "creative confidence", "pleasant daily life"],
    tradeOff: ["seeking approval", "overindulgence", "avoiding difficult conversations"],
    feel: ["Like connection comes a little more naturally."],
    bestFor: ["relationships", "social life", "creative identity", "community"],
    tone: "outward"
  },
  {
    body: "Venus",
    angle: "DSC",
    archetype: "The Partnership Place",
    coreTheme: "partnership, attraction, cooperation",
    opportunity: ["romance", "alliances", "supportive clients", "diplomacy"],
    tradeOff: ["idealising partners", "compromising too much for harmony"],
    feel: ["Like relationships move closer to the centre of the story."],
    bestFor: ["love", "partnership", "collaboration", "client relationships"],
    tone: "relational"
  },
  // Mars
  {
    body: "Mars",
    angle: "MC",
    archetype: "The Momentum Place",
    coreTheme: "ambition, action, competition in career",
    opportunity: ["launch", "lead", "execute", "build momentum", "pursue demanding goals"],
    tradeOff: ["conflict", "burnout", "impatience", "competitive pressure"],
    feel: ["Like life keeps asking: what are you going to do about it?"],
    bestFor: ["launches", "entrepreneurship", "competitive fields", "decisive career moves"],
    tone: "outward"
  },
  {
    body: "Mars",
    angle: "IC",
    archetype: "The Restless Home Base",
    coreTheme: "action and friction in private life",
    opportunity: ["renovate", "establish independence", "confront family patterns"],
    tradeOff: ["domestic tension", "difficulty resting", "impatience at home"],
    feel: ["Like home becomes active rather than restful."],
    bestFor: ["decisive reset", "physical projects", "independence"],
    tone: "inward"
  },
  {
    body: "Mars",
    angle: "ASC",
    archetype: "The Courage Place",
    coreTheme: "drive, assertiveness, physical agency",
    opportunity: ["confidence", "action", "independence", "fitness", "initiating change"],
    tradeOff: ["impulsiveness", "conflict", "exhaustion"],
    feel: ["Like you move faster and tolerate less hesitation."],
    bestFor: ["reinvention", "action", "entrepreneurship", "physical challenge"],
    tone: "outward"
  },
  {
    body: "Mars",
    angle: "DSC",
    archetype: "The Friction-and-Drive Partnership Place",
    coreTheme: "energetic, competitive relationships",
    opportunity: ["dynamic collaborators", "direct negotiation", "passionate connection"],
    tradeOff: ["arguments", "rivalry", "projection of anger"],
    feel: ["Like other people activate you -- sometimes productively, sometimes not."],
    bestFor: ["negotiation", "competitive partnerships", "boundary work"],
    tone: "relational"
  },
  // Jupiter
  {
    body: "Jupiter",
    angle: "MC",
    archetype: "The Expansion Place",
    coreTheme: "professional growth, opportunity, visibility",
    opportunity: ["advancement", "teaching", "international work", "leadership", "optimism"],
    tradeOff: ["overconfidence", "overcommitment", "assuming growth will happen automatically"],
    feel: ["Like the horizon of what seems possible gets wider."],
    bestFor: ["career expansion", "education", "international work", "leadership"],
    tone: "outward"
  },
  {
    body: "Jupiter",
    angle: "IC",
    archetype: "The Expansive Home Base",
    coreTheme: "home, family growth, belonging, generosity",
    opportunity: ["larger sense of home", "family support", "hospitality", "settling abroad", "emotional spaciousness"],
    tradeOff: ["excess", "taking on too much", "idealising a place as \"the answer\""],
    feel: ["Like there may be more room here -- literally or emotionally."],
    bestFor: ["relocation", "family", "home-building", "long-term base"],
    tone: "inward"
  },
  {
    body: "Jupiter",
    angle: "ASC",
    archetype: "The Possibility Place",
    coreTheme: "optimism, confidence, exploration",
    opportunity: ["growth", "travel", "study", "entrepreneurship", "broader identity"],
    tradeOff: ["overextension", "lack of focus", "optimism without follow-through"],
    feel: ["Like saying yes becomes easier."],
    bestFor: ["personal growth", "education", "international life", "new ventures"],
    tone: "outward"
  },
  {
    body: "Jupiter",
    angle: "DSC",
    archetype: "The Helpful People Place",
    coreTheme: "growth through partnership",
    opportunity: ["mentors", "generous collaborators", "supportive relationships", "international networks"],
    tradeOff: ["expecting others to provide opportunity", "overpromising in partnerships"],
    feel: ["Like the right people can widen your world."],
    bestFor: ["love", "mentorship", "business partnerships", "networks"],
    tone: "relational"
  },
  // Saturn
  {
    body: "Saturn",
    angle: "MC",
    archetype: "The Builder Place",
    coreTheme: "responsibility, structure, long-term achievement",
    opportunity: ["authority", "mastery", "durable reputation", "disciplined career building"],
    tradeOff: ["pressure", "delay", "heavy responsibility", "loneliness at the top"],
    feel: ["Like progress has to be earned -- but it can last."],
    bestFor: ["mastery", "senior responsibility", "institution-building", "long-term career"],
    tone: "outward"
  },
  {
    body: "Saturn",
    angle: "IC",
    archetype: "The Foundation Work Place",
    coreTheme: "duty, boundaries and structure at home",
    opportunity: ["create stability", "confront family responsibilities", "build durable foundations"],
    tradeOff: ["heaviness", "isolation", "obligations", "slower sense of belonging"],
    feel: ["Like home asks for commitment before comfort."],
    bestFor: ["long-term foundations", "boundaries", "serious family responsibilities"],
    tone: "inward"
  },
  {
    body: "Saturn",
    angle: "ASC",
    archetype: "The Maturity Place",
    coreTheme: "discipline, self-definition through responsibility",
    opportunity: ["resilience", "mastery", "boundaries", "serious personal development"],
    tradeOff: ["restriction", "self-criticism", "loneliness", "slower progress"],
    feel: ["Like life becomes more serious -- and asks you to become stronger."],
    bestFor: ["mastery", "discipline", "long-term transformation"],
    tone: "outward"
  },
  {
    body: "Saturn",
    angle: "DSC",
    archetype: "The Commitment Place",
    coreTheme: "serious relationships, contracts, boundaries",
    opportunity: ["durable partnerships", "mature collaboration", "accountability"],
    tradeOff: ["relationship tests", "distance", "obligation", "power imbalance"],
    feel: ["Like relationships become less casual and more consequential."],
    bestFor: ["commitment", "contracts", "mature partnership", "boundary learning"],
    tone: "relational"
  },
  // Uranus
  {
    body: "Uranus",
    angle: "MC",
    archetype: "The Disruption Career Place",
    coreTheme: "innovation, independence, unconventional career",
    opportunity: ["tech", "experimentation", "autonomy", "career reinvention"],
    tradeOff: ["instability", "abrupt changes", "resistance to authority"],
    feel: ["Like the old career script stops fitting."],
    bestFor: ["innovation", "startups", "tech", "independent work", "career pivot"],
    tone: "transformative"
  },
  {
    body: "Uranus",
    angle: "IC",
    archetype: "The Unconventional Home Place",
    coreTheme: "freedom and change in home life",
    opportunity: ["new lifestyle", "unconventional community", "break family patterns"],
    tradeOff: ["instability", "difficulty settling", "sudden domestic changes"],
    feel: ["Like home needs to give you freedom, not just security."],
    bestFor: ["lifestyle reset", "unconventional living", "independence"],
    tone: "transformative"
  },
  {
    body: "Uranus",
    angle: "ASC",
    archetype: "The Reinvention Place",
    coreTheme: "freedom, individuality, radical self-update",
    opportunity: ["authenticity", "experimentation", "new communities", "independence"],
    tradeOff: ["restlessness", "unpredictability", "difficulty maintaining continuity"],
    feel: ["Like you become less willing to live by someone else's script."],
    bestFor: ["reinvention", "independence", "innovation", "new identity"],
    tone: "transformative"
  },
  {
    body: "Uranus",
    angle: "DSC",
    archetype: "The Unexpected People Place",
    coreTheme: "unconventional, catalytic relationships",
    opportunity: ["surprising collaborators", "diverse networks", "new relationship models"],
    tradeOff: ["instability", "sudden starts/stops", "difficulty with predictability"],
    feel: ["Like people arrive to shake up your assumptions."],
    bestFor: ["new networks", "experimentation", "unconventional partnership"],
    tone: "relational"
  },
  // Neptune
  {
    body: "Neptune",
    angle: "MC",
    archetype: "The Vision Place",
    coreTheme: "imagination, ideals and ambiguity in vocation",
    opportunity: ["creative/spiritual work", "compassionate service", "visionary direction"],
    tradeOff: ["unclear career boundaries", "idealisation", "confusion about status or direction"],
    feel: ["Like vocation becomes more inspiring -- and harder to define."],
    bestFor: ["creative work", "service", "reflection", "vision-led projects"],
    tone: "outward"
  },
  {
    body: "Neptune",
    angle: "IC",
    archetype: "The Dreamlike Home Place",
    coreTheme: "sensitivity, retreat, imagination at home",
    opportunity: ["sanctuary", "creativity", "spiritual reflection", "compassionate family connection"],
    tradeOff: ["blurred domestic boundaries", "escapism", "idealising home"],
    feel: ["Like home can become a refuge -- or a place where reality gets softer."],
    bestFor: ["retreat", "creativity", "spiritual practice", "rest with strong boundaries"],
    tone: "inward"
  },
  {
    body: "Neptune",
    angle: "ASC",
    archetype: "The Fluid Identity Place",
    coreTheme: "sensitivity, imagination, porous identity",
    opportunity: ["intuition", "art", "compassion", "spiritual exploration"],
    tradeOff: ["unclear boundaries", "projection", "uncertainty", "being misread"],
    feel: ["Like the edges of who you are become softer."],
    bestFor: ["creativity", "reflection", "spiritual growth", "compassionate work"],
    tone: "inward"
  },
  {
    body: "Neptune",
    angle: "DSC",
    archetype: "The Idealised Relationship Place",
    coreTheme: "romantic/spiritual projection in relationships",
    opportunity: ["empathy", "soulful connection", "artistic collaboration"],
    tradeOff: ["idealisation", "rescuing", "unclear agreements", "disappointment"],
    feel: ["Like relationships can feel meaningful before they are fully understood."],
    bestFor: ["creative collaboration", "compassion", "spiritual connection with boundaries"],
    tone: "relational"
  },
  // Pluto
  {
    body: "Pluto",
    angle: "MC",
    archetype: "The Power-and-Transformation Place",
    coreTheme: "career transformation, influence, power dynamics",
    opportunity: ["deep reinvention", "strategic authority", "high-stakes work", "impact"],
    tradeOff: ["control struggles", "intensity", "obsession", "endings before new beginnings"],
    feel: ["Like your professional life cannot stay superficial."],
    bestFor: ["transformation", "leadership under pressure", "strategic work", "major career reset"],
    tone: "transformative"
  },
  {
    body: "Pluto",
    angle: "IC",
    archetype: "The Deep Roots Place",
    coreTheme: "profound private/family transformation",
    opportunity: ["heal old patterns", "rebuild foundations", "psychological depth"],
    tradeOff: ["intense family material", "control issues", "difficult endings"],
    feel: ["Like the place reaches beneath the surface of what \"home\" means."],
    bestFor: ["deep inner work", "rebuilding life foundations", "transformative retreat"],
    tone: "transformative"
  },
  {
    body: "Pluto",
    angle: "ASC",
    archetype: "The Personal Transformation Place",
    coreTheme: "intensity, power, identity rebirth",
    opportunity: ["courage", "magnetism", "radical self-honesty", "reinvention"],
    tradeOff: ["power struggles", "obsession", "intensity", "all-or-nothing behavior"],
    feel: ["Like an old version of you may not survive unchanged."],
    bestFor: ["deep reinvention", "leadership", "psychological growth"],
    tone: "transformative"
  },
  {
    body: "Pluto",
    angle: "DSC",
    archetype: "The Transformative Relationship Place",
    coreTheme: "intense relationships and power dynamics",
    opportunity: ["profound partnerships", "shadow work", "catalytic collaboration"],
    tradeOff: ["control", "obsession", "manipulation", "difficult separations"],
    feel: ["Like relationships become catalysts rather than background."],
    bestFor: ["deep relationship work", "high-stakes partnership", "transformation"],
    tone: "relational"
  }
];

function buildLibrary(): Map<string, Interpretation> {
  const map = new Map<string, Interpretation>();
  for (const entry of ENTRIES) {
    const id = `${entry.body}-${entry.angle}`;
    map.set(id, { id, ...entry });
  }
  return map;
}

const LIBRARY = buildLibrary();

export function getInterpretation(body: Body, angle: Angle): Interpretation {
  const entry = LIBRARY.get(`${body}-${angle}`);
  if (!entry) {
    throw new Error(`No interpretation entry for ${body}-${angle}`);
  }
  return entry;
}

export function allInterpretations(): Interpretation[] {
  return Array.from(LIBRARY.values());
}

export type { Tone };
