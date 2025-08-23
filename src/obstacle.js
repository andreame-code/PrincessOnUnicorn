export class Obstacle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y; // bottom position
    this.width = width;
    this.height = height;
  }

  update(speed) {
    this.x -= speed;
  }
}
