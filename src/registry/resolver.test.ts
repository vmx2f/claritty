import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { actionRegistry } from "@/registry/actionRegistry";
import { resolveActions } from "@/registry/resolver";

describe("resolveActions", () => {
  test("query add returns add-* actions", () => {
    const results = resolveActions("add", actionRegistry, 10);
    const ids = results.map((result) => result.id);

    assert.ok(ids.includes("add-product"));
    assert.ok(ids.includes("add-client"));
    assert.ok(ids.includes("add-order"));
  });

  test("query settings returns settings actions", () => {
    const results = resolveActions("settings", actionRegistry, 10);
    const ids = results.map((result) => result.id);

    assert.ok(ids.includes("user-settings"));
    assert.ok(ids.includes("org-settings"));
  });
});
