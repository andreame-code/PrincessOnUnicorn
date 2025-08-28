import { createStubGame } from './testHelpers.js';

export const FRAME = 1 / 60;

export function createLevel3Game({ skipLevelUpdate = false } = {}) {
  return createStubGame({ search: '?level=3', skipLevelUpdate });
}
