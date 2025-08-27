import { Obstacle } from '../obstacle.js';

export class ThornGuard {
  constructor(x, y, size = 1) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.baseWidth = size;
    this.baseHeight = size;
    this.spriteScale = 1;
    this.throwInterval = 1; // seconds between throws
    this.timer = 0;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta) {
    this.x -= scroll;
    const spawned = [];
    if (delta !== undefined) {
      this.timer += delta;
      if (this.timer >= this.throwInterval) {
        this.timer = 0;
        const width = this.width * 0.3;
        const height = this.height * 0.5; // semi-wall
        const wall = new Obstacle(
          this.x - this.width / 2 - width / 2,
          this.y,
          width,
          height
        );
        wall.setScale(this.spriteScale);
        spawned.push(wall);
      }
    }
    return spawned;
  }
}
