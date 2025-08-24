export class Obstacle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y; // bottom position
    this.baseWidth = width;
    this.baseHeight = height;
    this.setScale(1);
  }

  setScale(scale) {
    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
  }

  update(speed) {
    this.x -= speed;
  }
}
