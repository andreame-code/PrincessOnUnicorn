import test from 'node:test';
import assert from 'node:assert';
import { isColliding } from './collision.js';

const groundY = 150;

// helper to create unicorn/obstacle with bottom-based y coordinate
function createEntity(x, y, width, height) {
  return { x, y, width, height };
}

test('detects collision when overlapping at ground', () => {
  const unicorn = createEntity(50, groundY, 40, 40);
  const obstacle = createEntity(60, groundY, 20, 40);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});

test('no collision when apart horizontally', () => {
  const unicorn = createEntity(50, groundY, 40, 40);
  const obstacle = createEntity(200, groundY, 20, 40);
  assert.strictEqual(isColliding(unicorn, obstacle), false);
});

test('no collision with vertical separation', () => {
  const unicorn = createEntity(50, groundY - 60, 40, 40); // jump high
  const obstacle = createEntity(50, groundY, 20, 40);
  assert.strictEqual(isColliding(unicorn, obstacle), false);
});

test('detects collision on partial overlap', () => {
  const unicorn = createEntity(55, groundY, 40, 40);
  const obstacle = createEntity(80, groundY, 30, 40);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});

test('detects collision while jumping into obstacle', () => {
  const unicorn = createEntity(50, groundY - 15, 40, 40); // mid-air
  const obstacle = createEntity(60, groundY, 20, 30);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});
