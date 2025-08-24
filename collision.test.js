import test from 'node:test';
import assert from 'node:assert';
import { isColliding } from './collision.js';

const groundY = 150;

// helper to create unicorn/obstacle with bottom-based y coordinate
function createEntity(x, y, width, height) {
  return { x, y, width, height };
}

test('detects collision when overlapping at ground', () => {
  const unicorn = createEntity(50, groundY, 80, 80);
  const obstacle = createEntity(60, groundY, 40, 80);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});

test('no collision when apart horizontally', () => {
  const unicorn = createEntity(50, groundY, 80, 80);
  const obstacle = createEntity(200, groundY, 40, 80);
  assert.strictEqual(isColliding(unicorn, obstacle), false);
});

test('no collision with vertical separation', () => {
  const unicorn = createEntity(50, groundY - 120, 80, 80); // jump high
  const obstacle = createEntity(50, groundY, 40, 80);
  assert.strictEqual(isColliding(unicorn, obstacle), false);
});

test('detects collision on partial overlap', () => {
  const unicorn = createEntity(55, groundY, 80, 80);
  const obstacle = createEntity(80, groundY, 60, 80);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});

test('detects collision while jumping into obstacle', () => {
  const unicorn = createEntity(50, groundY - 30, 80, 80); // mid-air
  const obstacle = createEntity(60, groundY, 40, 60);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});
