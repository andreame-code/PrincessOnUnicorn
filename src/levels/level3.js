import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';

// Level 3 - Unicornolandia with mini cactus obstacles
export class Level3 extends BaseLevel {
  static getInterval(random) {
    // Faster pace similar to classic platformers
    return (50 + random() * 40) / 60;
  }

  getMoveSpeed() {
    // Slightly increase speed to keep the challenge
    return this.game.speed + 0.2;
  }

  createObstacle() {
    // Mini cactus obstacles
    const width = 0.2;
    const height = 0.4;
    const obstacle = new Obstacle(
      this.game.worldWidth + width / 2,
      this.game.groundY - height / 2,
      width,
      height
    );
    obstacle.setScale(this.game.scale);
    obstacle.imageIndex = Math.floor(this.random() * 3);
    obstacle.coinAwarded = false;
    return obstacle;
  }
}
