const test = require('node:test');
const assert = require('node:assert');
const { isColliding } = require('./collision');

const groundY = 150;

test('detects collision when overlapping at ground', () => {
  const unicorn = { x: 50, y: groundY, width: 40, height: 40 };
  const obstacle = { x: 50, width: 20, height: 40 };
  assert.strictEqual(isColliding(unicorn, obstacle, groundY), true);
});

test('no collision when apart', () => {
  const unicorn = { x: 50, y: groundY, width: 40, height: 40 };
  const obstacle = { x: 200, width: 20, height: 40 };
  assert.strictEqual(isColliding(unicorn, obstacle, groundY), false);
});
