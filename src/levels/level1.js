import { Obstacle } from '../obstacle.js';
import { isColliding } from '../../collision.js';

export class Level1 {
  constructor(game) {
    this.game = game;
    this.obstacles = [];
    this.timer = 0;
    this.interval = Level1.getInterval();
  }

  static getInterval() {
    return 80 + Math.random() * 70;
  }

  update() {
    this.timer++;
    if (this.timer > this.interval) {
      this.obstacles.push(
        new Obstacle(this.game.canvas.width, this.game.groundY, 20, 40)
      );
      this.timer = 0;
      this.interval = Level1.getInterval();
    }
    this.obstacles.forEach(o => o.update(this.game.speed));
    this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);

    if (this.obstacles.some(o => isColliding(this.game.player, o))) {
      this.game.gameOver = true;
    }
  }
}
