import { Obstacle } from '../obstacle.js';

export const POWERUP = {
  AURA_SHIELD: 'aura-shield',
  WIND_HOOVES: 'wind-hooves',
  SUGAR_WINGS: 'sugar-wings',
};

export class PowerUp extends Obstacle {
  constructor(x, y, size, kind) {
    super(x, y, size, size);
    this.kind = kind;
    this.type = 'powerup';
  }
}

