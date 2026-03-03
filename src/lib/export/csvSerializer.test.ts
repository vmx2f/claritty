import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { toCSV } from "@/lib/export/csvSerializer";

describe("toCSV", () => {
  test("escapes commas, quotes, and newlines", () => {
    const csv = toCSV([
      { name: "A,B", notes: 'He said "hi"', extra: "line1\nline2" },
    ]);

    assert.ok(csv.includes('"A,B"'));
    assert.ok(csv.includes('"He said ""hi"""'));
    assert.ok(csv.includes('"line1\nline2"'));
  });

  test("renders nullish fields as empty", () => {
    const csv = toCSV([{ a: null, b: undefined, c: 1 }]);
    const lines = csv.split("\r\n");

    assert.equal(lines[1], ",,1");
  });
});
