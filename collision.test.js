import test from 'node:test';
import assert from 'node:assert';
import { isColliding } from './collision.js';

const groundY = 1.5;

// Helper to create entities using left/bottom coordinates for convenience
// while the collision system operates on center-based coordinates.
function createEntity(x, y, width, height) {
  return {
    x: x + width / 2,
    y: y - height / 2,
    width,
    height,
  };
}

test('detects collision when overlapping at ground', () => {
  const unicorn = createEntity(0.5, groundY, 0.8, 0.8);
  const obstacle = createEntity(0.6, groundY, 0.32, 0.64);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});

test('no collision when apart horizontally', () => {
  const unicorn = createEntity(0.5, groundY, 0.8, 0.8);
  const obstacle = createEntity(2, groundY, 0.32, 0.64);
  assert.strictEqual(isColliding(unicorn, obstacle), false);
});

test('no collision with vertical separation', () => {
  const unicorn = createEntity(0.5, groundY - 1.2, 0.8, 0.8); // jump high
  const obstacle = createEntity(0.5, groundY, 0.32, 0.64);
  assert.strictEqual(isColliding(unicorn, obstacle), false);
});

test('detects collision on partial overlap', () => {
  const unicorn = createEntity(0.55, groundY, 0.8, 0.8);
  const obstacle = createEntity(0.8, groundY, 0.48, 0.64);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});

test('detects collision while jumping into obstacle', () => {
  const unicorn = createEntity(0.5, groundY - 0.3, 0.8, 0.8); // mid-air
  const obstacle = createEntity(0.6, groundY, 0.32, 0.48);
  assert.strictEqual(isColliding(unicorn, obstacle), true);
});
