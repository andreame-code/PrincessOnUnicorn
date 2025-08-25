export class Obstacle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y; // bottom position
    // Store both the physical hitbox size (width/height) and the scale used
    // only for rendering. The hitbox stays in world units regardless of the
    // sprite size.
    this.width = width;
    this.height = height;
    this.baseWidth = width;
    this.baseHeight = height;
    this.spriteScale = 1;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(speed) {
    this.x -= speed;
  }
}
