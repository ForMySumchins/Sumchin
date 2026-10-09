const test = require('node:test');
const assert = require('node:assert/strict');
const { getHealthStatus } = require('./health.cjs');

test('getHealthStatus returns correct status and timestamp', () => {
  const before = new Date().toISOString();
  const health = getHealthStatus();
  const after = new Date().toISOString();

  // Acceptance Test 1: status equals "ok"
  assert.equal(health.status, 'ok');

  // Acceptance Test 2: timestamp is a string that round-trips through Date.toISOString()
  assert.equal(typeof health.timestamp, 'string');
  const dateObj = new Date(health.timestamp);
  assert.ok(!isNaN(dateObj.getTime()), 'Timestamp must be a valid date');
  assert.equal(dateObj.toISOString(), health.timestamp, 'Timestamp must round-trip through Date.toISOString()');

  // Acceptance Test 3: timestamp falls between times captured immediately before/after the call
  assert.ok(
    health.timestamp >= before && health.timestamp <= after,
    `Timestamp ${health.timestamp} should be between ${before} and ${after}`
  );
});
