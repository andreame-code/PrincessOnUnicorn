export class RhombusSprite {
  constructor(x, y, size = 1) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.baseWidth = size;
    this.baseHeight = size;
    this.spriteScale = 1;
    this.state = 'waiting';
    this.timer = 0;
    this.dashInterval = 0.5; // seconds between dashes
    this.dashDuration = 0.2; // seconds dash lasts
    this.dashSpeed = -2; // relative speed during dash
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta) {
    this.x -= scroll;
    if (delta !== undefined) {
      this.timer += delta;
      if (this.state === 'waiting') {
        if (this.timer >= this.dashInterval) {
          this.state = 'dashing';
          this.timer = 0;
        }
      } else if (this.state === 'dashing') {
        this.x += this.dashSpeed * delta;
        if (this.timer >= this.dashDuration) {
          this.state = 'waiting';
          this.timer = 0;
        }
      }
    }
  }
}
