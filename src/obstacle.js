export class Obstacle {
  constructor(x, y, width, height) {
    // x and y represent the center of the hitbox in world units.
    this.x = x;
    this.y = y;
    // Store both the physical hitbox size (width/height) and the scale used
    // only for rendering. The hitbox stays in world units regardless of the
    // sprite size.
    this.width = width;
    this.height = height;
    this.baseWidth = width;
    this.baseHeight = height;
    this.spriteScale = 1;
    // Horizontal velocity in world units per second.
    this.vx = 0;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(speed, delta = 0) {
    this.x -= speed;
    this.x += this.vx * delta;
  }
}
