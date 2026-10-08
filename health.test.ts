import test from "node:test";
import assert from "node:assert";
import { getHealthStatus } from "./health.js";

test("getHealthStatus returns status ok", () => {
  const result = getHealthStatus();
  assert.strictEqual(result.status, "ok");
  assert.ok(result.timestamp > 0);
});
