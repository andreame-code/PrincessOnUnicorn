import { Obstacle } from '../obstacle.js';
import { isColliding } from '../../collision.js';

export class Level2 {
  constructor(game) {
    this.game = game;
    this.walls = [];
    this.wallTimer = 0;
    this.wallInterval = 90;
    this.boss = { x: game.canvas.width - 100, y: game.groundY, width: 40, height: 50 };
    this.bossFlee = false;
  }

  update() {
    const speed = this.game.speed + 2;
    this.wallTimer++;
    if (this.wallTimer > this.wallInterval && !this.bossFlee) {
      this.walls.push(new Obstacle(this.boss.x, this.game.groundY, 30, 50));
      this.wallTimer = 0;
      this.wallInterval = 60 + Math.random() * 60;
    }

    this.walls.forEach(w => w.update(speed));
    this.walls = this.walls.filter(w => {
      if (w.x + w.width < 0) return false;
      if (isColliding(this.game.player, w)) {
        if (this.game.player.shieldActive) {
          this.game.player.x += 20;
          return false;
        }
        this.game.gameOver = true;
        return false;
      }
      return true;
    });

    if (this.game.player.x + this.game.player.width >= this.boss.x - 20) {
      this.bossFlee = true;
    }
    if (this.bossFlee) {
      this.boss.x += speed;
      if (this.boss.x > this.game.canvas.width) {
        this.game.gameOver = true;
        this.game.win = true;
      }
    }
  }
}
