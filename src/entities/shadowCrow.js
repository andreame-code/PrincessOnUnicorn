export class ShadowCrow {
  constructor(x, y, size = 1, amplitude = 0.5, frequency = 1) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.width = size;
    this.height = size;
    this.baseWidth = size;
    this.baseHeight = size;
    this.spriteScale = 1;
    this.amplitude = amplitude;
    this.frequency = frequency; // cycles per second
    this.time = 0;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta) {
    // Move with level scroll
    this.x -= scroll;
    if (delta !== undefined) {
      this.time += delta;
      // Vertical sinusoidal movement
      const angle = this.time * this.frequency * Math.PI * 2;
      this.y = this.baseY + Math.sin(angle) * this.amplitude;
    }
  }
}
