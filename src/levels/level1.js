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
    return (80 + Math.random() * 70) / 60; // seconds
  }

  update(delta) {
    this.timer += delta;
    if (this.timer > this.interval) {
      const obstacle = new Obstacle(
        this.game.canvas.width,
        this.game.groundY,
        20,
        40
      );
      obstacle.coinAwarded = false;
      this.obstacles.push(obstacle);
      this.timer = 0;
      this.interval = Level1.getInterval();
    }
    this.obstacles.forEach(o => {
      o.update(this.game.speed * delta);
      if (!o.coinAwarded && o.x + o.width < this.game.player.x) {
        this.game.coins++;
        o.coinAwarded = true;
      }
    });
    this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);

    if (this.obstacles.some(o => isColliding(this.game.player, o))) {
      this.game.gameOver = true;
    }
  }
}
