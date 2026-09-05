# Astro MVP Build Pack v0.1

This pack contains the four implementation inputs requested for the Claude Code MVP:

1. `03-astro-calculation-spec.md`
2. `04-scoring-ranking-spec.md`
3. `06-interpretation-library.md`
4. `07-golden-test-cases.md`

## Recommended Claude Code sequence

1. Read all four documents.
2. Build calculation engine only.
3. Run mathematical + Case 001 Golden Tests.
4. Build scoring/ranking.
5. Run scoring fixtures.
6. Add interpretation library and deterministic composition.
7. Run interpretation tests.
8. Only then connect the engine to UI.

## Important status notes

- Astronomy calculation is intended to be deterministic.
- Astrological interpretation/scoring is an editorial model, not scientifically validated.
- **2026-09-05:** `03`, `04`, and `06` were approved and rewritten to **v0.2** (see `docs/PROPOSAL-canonical-framework.md`) to lean on real, broadly-taught astrocartography/traditional-astrology classification instead of a fully hand-tuned relevance matrix. Implementation is pending a new Golden Test suite (`04-scoring-ranking-spec.md` §16 tracks exactly what's live in code today vs. still v0.1).
- The scoring matrix and narrative rules remain **product hypotheses, now v0.2**, and should continue to be versioned as user feedback is collected.
- Reference numerical fixtures in Golden Case 001 came from the earlier Swiss Ephemeris sensitivity analysis and should be used as regression benchmarks with tolerances, not as bit-identical requirements for another ephemeris library.
