import { Obstacle } from '../obstacle.js';

export class Checkpoint extends Obstacle {
  constructor(x, groundY, size) {
    super(x, groundY - size / 2, size, size);
    this.type = 'checkpoint';
  }

  setScale(scale) {
    super.setScale(scale);
  }

  update(move, delta = 0) {
    super.update(move);
  }
}
