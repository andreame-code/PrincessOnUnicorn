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
    this.vx = -0.3;
    this.throwCooldown = 2; // seconds
    this.timer = 0;
    this.seedSize = size * 0.5;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta = 0) {
    this.x -= scroll;
    this.x += this.vx * delta;
    this.timer += delta;
    const seeds = [];
    if (this.timer >= this.throwCooldown) {
      this.timer = 0;
      const seed = new Obstacle(
        this.x - this.width / 2 - this.seedSize / 2,
        this.y,
        this.seedSize,
        this.seedSize
      );
      seed.setScale(this.spriteScale);
      seeds.push(seed);
    }
    return seeds;
  }
}
