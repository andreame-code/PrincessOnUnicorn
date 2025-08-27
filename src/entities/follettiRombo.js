export class FollettiRombo {
  constructor(x, y, size = 1) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.baseWidth = size;
    this.baseHeight = size;
    this.spriteScale = 1;
    this.vx = -0.4;
    this.dashSpeed = -2;
    this.dashTime = 0.2;
    this.cooldown = 1.5;
    this.timer = 0;
    this.dashing = false;
    this.dashTimer = 0;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta = 0) {
    this.x -= scroll;
    if (this.dashing) {
      this.x += this.dashSpeed * delta;
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) {
        this.dashing = false;
        this.timer = 0;
      }
    } else {
      this.x += this.vx * delta;
      this.timer += delta;
      if (this.timer >= this.cooldown) {
        this.dashing = true;
        this.dashTimer = this.dashTime;
      }
    }
  }
}
