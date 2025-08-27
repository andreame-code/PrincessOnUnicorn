export class Goomba {
  constructor(x, y, size = 1) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.baseWidth = size;
    this.baseHeight = size;
    this.spriteScale = 1;
    // Horizontal speed relative to the world
    this.vx = -0.5;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta) {
    // Move with the level scroll
    this.x -= scroll;
    // Apply own walking velocity
    if (delta !== undefined) {
      this.x += this.vx * delta;
    }
  }
}
