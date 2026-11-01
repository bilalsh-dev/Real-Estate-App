import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SEED_ORDER } from "./seedOrder.ts";

const schema = readFileSync(path.join(import.meta.dirname, "schema.prisma"), "utf-8");

function foreignKeyDependencies(): Map<string, Set<string>> {
  const dependencies = new Map<string, Set<string>>();
  for (const [, model, body] of schema.matchAll(/model (\w+) \{([\s\S]*?)\n\}/g)) {
    if (!model || body === undefined) continue;
    const targets = new Set<string>();
    for (const [, target] of body.matchAll(/^\s+\w+\s+(\w+)\??\s+@relation\(.*fields:/gm)) {
      if (target) targets.add(target);
    }
    dependencies.set(model, targets);
  }
  return dependencies;
}

describe("SEED_ORDER", () => {
  const dependencies = foreignKeyDependencies();

  it("covers every model in the schema exactly once", () => {
    expect([...SEED_ORDER].sort()).toEqual([...dependencies.keys()].sort());
  });

  it("seeds every model after the models its foreign keys reference", () => {
    for (const [model, targets] of dependencies) {
      for (const target of targets) {
        expect(
          SEED_ORDER.indexOf(model as never),
          `${model} must come after ${target}`,
        ).toBeGreaterThan(SEED_ORDER.indexOf(target as never));
      }
    }
  });
});
