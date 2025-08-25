import { BaseLevel } from './baseLevel.js';

export class Level1 extends BaseLevel {
  getMoveSpeed() {
    // Increase tree velocity so the princess can pass them more easily.
    return this.game.speed + 0.6;
  }
}
