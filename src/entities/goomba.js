export class Goomba {
  constructor(x, y, speed = 0.5) {
    this.width = 0.6;
    this.height = 0.6;
    this.baseWidth = this.width;
    this.baseHeight = this.height;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.spriteScale = 1;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(worldMove, delta) {
    this.x -= worldMove + this.speed * delta;
  }
}
