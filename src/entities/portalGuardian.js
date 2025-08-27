export class PortalGuardian {
  constructor(x, y, size = 1) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.baseWidth = size;
    this.baseHeight = size;
    this.spriteScale = 1;
    this.hits = 0;
    this.phase = 1;
    this.attackPhases = ['sweep', 'charge', 'rage'];
    this.defeated = false;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(scroll, delta) {
    this.x -= scroll;
  }

  hit() {
    this.hits += 1;
    if (this.hits < 3) {
      this.phase += 1;
    } else {
      this.defeated = true;
    }
  }
}
