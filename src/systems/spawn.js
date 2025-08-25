import { SPAWN_EVERY_S, FIRST_SPAWN_DELAY_S, WORLD_SPEED } from '../config/spawn.js';

export class Spawner {
  constructor(world) {
    this.world = world;
    this.timer = -FIRST_SPAWN_DELAY_S;
  }
  update(dt) {
    this.timer += dt;
    while (this.timer >= SPAWN_EVERY_S) {
      this.timer -= SPAWN_EVERY_S;
      this.world.spawnObstacle({
        x: this.world.cameraRight + 2,
        y: 0,
        w: 1,
        h: 1,
        vx: -WORLD_SPEED
      });
    }
  }
}
