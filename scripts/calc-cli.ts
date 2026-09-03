// Minimal CLI harness: prints structured calculation output for a BirthInput.
// Usage: npm run calc -- path/to/birth-input.json
// Exists so the calculation engine can be exercised/verified before any UI
// is built (CLAUDE.md §7, Milestone 0: "Output structured JSON/CLI/test fixture").
import { readFileSync } from "node:fs";
import { buildUncertaintyScenarios, resolveBirthInstant } from "../src/astro/time.js";
import { computeAllLinesAtInstant } from "../src/astro/lines.js";
import type { BirthInput } from "../src/astro/types.js";

function main(): void {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: npm run calc -- path/to/birth-input.json");
    process.exit(1);
  }

  const birthInput = JSON.parse(readFileSync(inputPath, "utf-8")) as BirthInput;
  const resolution = resolveBirthInstant(birthInput);

  if (!resolution.ok) {
    console.error("Could not resolve birth instant:", JSON.stringify(resolution.error, null, 2));
    process.exit(1);
  }

  const uncertaintyMinutes = birthInput.uncertaintyMinutes ?? 0;
  const scenarios = buildUncertaintyScenarios(resolution.resolved.utcIso, uncertaintyMinutes);

  const output = {
    input: birthInput,
    resolvedUtc: resolution.resolved.utcIso,
    scenarios,
    linesAtBaseline: computeAllLinesAtInstant(scenarios.baselineUtcIso).map((line) => ({
      body: line.body,
      angle: line.angle,
      longitude: line.longitude,
      pointCount: line.points?.length
    }))
  };

  console.log(JSON.stringify(output, null, 2));
}

main();
