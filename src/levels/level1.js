import { BaseLevel } from './baseLevel.js';

export class Level1 extends BaseLevel {
  getMoveSpeed() {
    // Increase tree velocity by 20% so they impact gameplay less.
    return (this.game.speed + 0.6) * 1.2;
  }
}
