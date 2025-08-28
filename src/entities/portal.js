import { Obstacle } from '../obstacle.js';

export class Portal extends Obstacle {
  constructor(x, groundY, size) {
    super(x, groundY - size, size, size * 2);
    this.type = 'portal';
    this.open = false;
  }

  setScale(scale) {
    super.setScale(scale);
  }

  update(move, delta = 0) {
    super.update(move);
  }
}
