import { Obstacle } from '../obstacle.js';

export class Star extends Obstacle {
  constructor(x, y, size) {
    super(x, y, size, size);
    this.type = 'star';
  }

  setScale(scale) {
    super.setScale(scale);
  }

  update(move, delta = 0) {
    super.update(move);
  }
}
