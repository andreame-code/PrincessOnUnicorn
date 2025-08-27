export class Guardian {
  constructor(x, y, size = 1) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.baseWidth = size;
    this.baseHeight = size;
    this.spriteScale = 1;
    this.type = 'guardian';
    this.attackPhases = ['charge', 'jump', 'rage'];
    this.phase = 0;
    this.hits = 0;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta) {
    this.x -= scroll;
  }

  registerHit() {
    this.hits++;
    if (this.hits < this.attackPhases.length) {
      this.phase = this.hits;
    }
  }
}
