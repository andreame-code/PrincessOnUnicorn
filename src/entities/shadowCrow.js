export class ShadowCrow {
  constructor(x, y, size = 1) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.baseWidth = size;
    this.baseHeight = size;
    this.spriteScale = 1;
    // horizontal speed
    this.vx = -0.6;
    // sine wave parameters
    this.baseY = y;
    this.time = 0;
    this.amplitude = size / 2;
    this.frequency = 3;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta = 0) {
    // move with level scroll
    this.x -= scroll;
    // apply own velocity and sine movement
    this.x += this.vx * delta;
    this.time += delta;
    this.y = this.baseY + Math.sin(this.time * this.frequency) * this.amplitude;
  }
}
