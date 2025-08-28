import { createStubGame } from './testHelpers.js';

export const FRAME = 1 / 60;

export function createLevel3Game({ skipLevelUpdate = false } = {}) {
  return createStubGame({ search: '?level=3', skipLevelUpdate });
}

// Shared helpers for Level 3 tests
export function setupLevel3(options) {
  const game = createLevel3Game(options);
  return { game, level: game.level, player: game.player };
}

export function teardownLevel3(game) {
  // Currently no special teardown is required but this ensures
  // symmetry with setup and provides a single place for future cleanup.
  void game;
}

export function withLevel3(options, fn) {
  const { game, level, player } = setupLevel3(options);
  try {
    return fn({ game, level, player });
  } finally {
    teardownLevel3(game);
  }
}
