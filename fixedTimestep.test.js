import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

const STEP = 1 / 60;

// Verify that the main game loop advances the simulation using a fixed 60 Hz
// timestep regardless of the frame delta provided.
test('game loop uses fixed 60 Hz timestep', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const deltas = [];
  game.update = d => deltas.push(d);
  game.draw = () => {};

  // Prime the loop.
  game.loop(0);
  // Simulate a frame arriving with double the timestep (1/30s)
  game.loop(1000 / 30);

  assert.deepStrictEqual(deltas, [STEP, STEP]);
});
