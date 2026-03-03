import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { BLOCK_REGISTRY } from "@/blocks/registry";
import { canDisable, resolve, validateState } from "@/blocks/dependency-engine";
import type { BlockId } from "@/blocks/types";

describe("block dependency engine", () => {
  test("resolve returns required hard dependencies", () => {
    const activeBlocks: BlockId[] = ["chat", "notifications", "settings", "orders"];
    const result = resolve("orders", BLOCK_REGISTRY, activeBlocks);

    assert.equal(result.canActivate, false);
    assert.ok(result.requiredToEnable.includes("products"));
  });

  test("canDisable blocks removal when depended on", () => {
    const activeBlocks: BlockId[] = ["chat", "notifications", "settings", "products", "orders"];
    const result = canDisable("products", BLOCK_REGISTRY, activeBlocks);

    assert.equal(result.canDisable, false);
    assert.ok(result.blockedBy.includes("orders"));
  });

  test("validateState catches invalid configuration", () => {
    const activeBlocks: BlockId[] = ["chat", "notifications", "settings", "orders"];
    const result = validateState(activeBlocks, BLOCK_REGISTRY);

    assert.equal(result.valid, false);
    assert.ok(result.violations.some((violation) => violation.includes("orders requires products")));
  });
});
