import { BaseLevel } from './baseLevel.js';
import { Goomba } from '../entities/goomba.js';
import { ShadowCrow } from '../entities/shadowCrow.js';
import { RhombusSprite } from '../entities/rhombusSprite.js';
import { ThornGuard } from '../entities/thornGuard.js';
import { PortalGuardian } from '../entities/portalGuardian.js';
import { CloudPlatform } from '../entities/cloudPlatform.js';
import { FallingPlatform } from '../entities/fallingPlatform.js';
import { Pipe } from '../entities/pipe.js';
import { Block } from '../entities/block.js';
import { Star } from '../entities/star.js';
import { Checkpoint } from '../entities/checkpoint.js';
import { Portal } from '../entities/portal.js';
import { isColliding, isLandingOn } from '../../collision.js';
import {
  JUMP_VELOCITY,
  GRAVITY,
  AURA_SHIELD_DURATION,
  WIND_HOOVES_DURATION,
  SUGAR_WINGS_DURATION,
  WIND_HOOVES_SPEED,
  SUGAR_WINGS_EXTRA_JUMPS,
  LEVEL3_ACCELERATION,
  LEVEL3_AIR_ACCELERATION,
  LEVEL3_FRICTION,
  LEVEL3_COYOTE_TIME,
  LEVEL3_JUMP_BUFFER,
  LEVEL3_JUMP_HOLD,
} from '../config.js';
import { PowerUp, POWERUP } from '../entities/powerUp.js';

// Tile identifiers inspired by tylerreichle/mario_js.
// 0 = empty, 1 = ground, 2 = cloud platform, 3 = falling platform
// 4 = pipe, 5 = block, 6 = enemy, 7 = star collectible
// 8 = checkpoint, 9 = rainbow portal (finish)
const TILE = {
  EMPTY: 0,
  GROUND: 1,
  CLOUD_PLATFORM: 2,
  FALLING_PLATFORM: 3,
  PIPE: 4,
  BLOCK: 5,
  GOOMBA: 6,
  STAR: 7,
  CHECKPOINT: 8,
  PORTAL: 9,
};

// Two dimensional map describing the level layout. Each number
// corresponds to a tile type defined above. The first row is the
// ground and subsequent rows stack upwards.
// The map is programmatically generated to provide a long progressive
// level with a hidden star path, a central checkpoint and a rainbow
// portal at the end.
const MAP_WIDTH = 240; // ~120 seconds at move speed ~2
const ground = Array(MAP_WIDTH).fill(TILE.GROUND);
const row1 = Array(MAP_WIDTH).fill(TILE.EMPTY);
const row2 = Array(MAP_WIDTH).fill(TILE.EMPTY);

// Ability section - small platforms to practice jumping
for (let c = 10, i = 0; c < 20; c += 2, i++) {
  row1[c] = i % 2 === 0 ? TILE.CLOUD_PLATFORM : TILE.FALLING_PLATFORM;
}

// Ramp up to a sky path of stars, allowing backtracking and verticality
for (let c = 24; c < 30; c += 2) row1[c] = TILE.PLATFORM;

// Secret star path high in the sky (visual guide)
for (let c = 30; c < 35; c++) row2[c] = TILE.STAR;
for (let c = 35; c < 40; c += 2) row1[c] = TILE.PLATFORM;

// Second optional elevated route using clouds
for (let c = 80; c < 88; c += 2) row1[c] = TILE.PLATFORM;
for (let c = 88; c < 96; c += 2) row2[c] = TILE.PLATFORM;
row1[96] = TILE.PLATFORM;

// Challenge obstacles
[60, 90, 130, 170, 210].forEach(c => (row1[c] = TILE.GOOMBA));
[70, 110, 160, 190].forEach(c => (row1[c] = TILE.PIPE));

// Central checkpoint
row1[100] = TILE.CHECKPOINT;

// Final rainbow portal
row1[MAP_WIDTH - 5] = TILE.PORTAL;

const MAP = [ground, row1, row2];


// Level 3 - Unicornolandia converted to a tile-based platform section
export class Level3 extends BaseLevel {
  constructor(game, random = Math.random) {
    super(game, random);
    this.game.player.maxJumps = 2;
    this.game.player.defaultMaxJumps = 2;
    this.game.player.enablePlatformControls({
      acceleration: LEVEL3_ACCELERATION,
      airAcceleration: LEVEL3_AIR_ACCELERATION,
      friction: LEVEL3_FRICTION,
      coyoteTime: LEVEL3_COYOTE_TIME,
      jumpBuffer: LEVEL3_JUMP_BUFFER,
      jumpHold: LEVEL3_JUMP_HOLD,
      jumpHoldForce: GRAVITY,
    });
    this.map = MAP;
    this.tileSize = 1; // world units per tile
    this.distance = 0;
    this.levelLength = this.map[0].length * this.tileSize;
    this.platforms = [];
    this.pipes = [];
    this.blocks = [];
    this.enemies = [];
    this.thornWalls = [];
    this.stars = [];
    this.powerUps = [];
    this.checkpoint = null;
    this.checkpointReached = false;
    this.respawnPoint = null;
    this.respawning = false;
    this.respawnTimer = 0;
    this.portal = null;
    this.boss = null;
    this.disableAutoScroll = true;
    this.generateFromMap();
    this.addExclusiveEnemies();
    this.spawnPortalGuardian();
    this.spawnPowerUps();
  }

  // Spawn interval from BaseLevel isn't used anymore but kept for
  // compatibility with existing code paths.
  static getInterval() {
    return Infinity;
  }

  getMoveSpeed() {
    // Slightly increase speed to keep the challenge
    return this.game.speed + 0.2;
  }

  generateFromMap() {
    for (let row = 0; row < this.map.length; row++) {
      const cols = this.map[row];
      for (let col = 0; col < cols.length; col++) {
        const tile = cols[col];
        const x = this.game.worldWidth + col * this.tileSize + this.tileSize / 2;
        const y = this.game.groundY - row * this.tileSize - this.tileSize / 2;
        switch (tile) {
          case TILE.CLOUD_PLATFORM:
            this.platforms.push(new CloudPlatform(x, y, this.tileSize));
            break;
          case TILE.FALLING_PLATFORM:
            this.platforms.push(
              new FallingPlatform(x, y, this.tileSize, this.game.groundY)
            );
            break;
          case TILE.PIPE:
            this.pipes.push(new Pipe(x, this.game.groundY, this.tileSize));
            break;
          case TILE.BLOCK:
            this.blocks.push(new Block(x, y, this.tileSize));
            break;
          case TILE.GOOMBA:
            // Enemies always spawn on the ground regardless of row
            this.enemies.push(
              new Goomba(x, this.game.groundY - this.tileSize / 2, this.tileSize)
            );
            break;
          case TILE.STAR:
            this.stars.push(new Star(x, y, this.tileSize));
            break;
          case TILE.CHECKPOINT:
            this.checkpoint = new Checkpoint(x, this.game.groundY, this.tileSize);
            break;
          case TILE.PORTAL:
            this.portal = new Portal(x, this.game.groundY, this.tileSize);
            break;
          default:
            break;
        }
      }
    }
    this.obstacles = [
      ...this.platforms,
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
    ];
  }

  addExclusiveEnemies() {
    // Position enemies ahead in the level so they appear over time
    const startX = this.game.worldWidth + 20;
    const ground = this.game.groundY - this.tileSize / 2;
    const crow = new ShadowCrow(startX, this.game.groundY - 1.5, this.tileSize);
    const sprite = new RhombusSprite(startX + 20, ground, this.tileSize);
    const guard = new ThornGuard(startX + 40, ground, this.tileSize);
    this.enemies.push(crow, sprite, guard);
    this.obstacles.push(crow, sprite, guard);
  }

  spawnPortalGuardian() {
    if (this.portal) {
      const x = this.portal.x - this.tileSize * 5;
      const y = this.game.groundY - this.tileSize / 2;
      this.boss = new PortalGuardian(x, y, this.tileSize * 2);
      this.enemies.push(this.boss);
      this.obstacles.push(this.boss);
    }
  }

  spawnPowerUps() {
    const ground = this.game.groundY - this.tileSize / 2;
    const startX = this.game.worldWidth + 30;
    const positions = [
      { x: startX, kind: POWERUP.AURA_SHIELD },
      { x: startX + 40, kind: POWERUP.WIND_HOOVES },
      { x: startX + 80, kind: POWERUP.SUGAR_WINGS },
    ];
    positions.forEach(p => {
      const pu = new PowerUp(p.x, ground, this.tileSize, p.kind);
      this.powerUps.push(pu);
      this.obstacles.push(pu);
    });
  }

  handlePlayerDeath() {
    if (this.checkpointReached && this.respawnPoint) {
      if (!this.respawning) {
        this.respawning = true;
        this.respawnTimer = 0;
        this.game.player.die();
      }
    } else {
      this.game.gameOver = true;
    }
  }

  respawnPlayer() {
    const player = this.game.player;
    const { x, y } = this.respawnPoint || {
      x: player.x,
      y: this.game.groundY - player.height / 2,
    };
    player.x = x;
    player.y = y;
    player.vx = 0;
    player.vy = 0;
    player.dead = false;
    player.jumping = false;
    player.jumpCount = 0;
    this.respawning = false;

    // Rebuild platforms, enemies and power-ups from the original level map so
    // that any destroyed or altered entities return to their initial state.
    this.platforms = [];
    this.pipes = [];
    this.blocks = [];
    this.enemies = [];
    this.thornWalls = [];
    this.stars = [];
    this.powerUps = [];
    this.checkpoint = null;
    this.portal = null;
    this.boss = null;

    // Recreate level entities using the original LEVEL3_MAP.
    this.generateFromMap();
    this.addExclusiveEnemies();
    this.spawnPortalGuardian();
    this.spawnPowerUps();

    // Ensure newly created objects use the current game scale.
    this.setScale(this.game.scale);

    // Only keep objects that are ahead of the respawn point.
    const filterAhead = arr => arr.filter(o => o.x + o.width / 2 > player.x - 0.01);

    // Reset stateful properties so entities behave as if never interacted with.
    this.platforms = filterAhead(this.platforms).map(p => {
      if (p.kind === 'cloud') {
        p.visible = true;
        p.stepped = false;
        p.timer = 0;
        p.respawn = 0;
      } else if (p.kind === 'falling') {
        p.visible = true;
        p.stepped = false;
        p.falling = false;
        p.shake = 0;
        p.vy = 0;
      }
      return p;
    });

    this.pipes = filterAhead(this.pipes);
    this.blocks = filterAhead(this.blocks);

    this.enemies = filterAhead(this.enemies).map(e => {
      if (e instanceof ShadowCrow) {
        e.time = 0;
        e.y = e.baseY;
      } else if (e instanceof RhombusSprite) {
        e.state = 'waiting';
        e.timer = 0;
      } else if (e instanceof ThornGuard) {
        e.timer = 0;
      } else if (e instanceof PortalGuardian) {
        e.hits = 0;
        e.phase = 1;
        e.defeated = false;
      }
      return e;
    });

    this.thornWalls = filterAhead(this.thornWalls);
    this.stars = filterAhead(this.stars);
    this.powerUps = filterAhead(this.powerUps);

    // Rebuild combined obstacle list for collision checks.
    this.obstacles = [
      ...this.platforms.filter(p => p.visible),
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
      ...this.thornWalls,
      ...this.powerUps,
    ];
  }

  update(delta, move = this.game.player.vx * delta) {
    if (this.respawning) {
      this.respawnTimer += delta;
      if (this.respawnTimer >= 1) {
        this.respawnPlayer();
      }
      return;
    }

    this.distance += move > 0 ? move : 0;

    const moveArr = arr => arr.forEach(e => e.update(move, delta));
    moveArr(this.platforms);
    moveArr(this.pipes);
    moveArr(this.blocks);
    moveArr(this.stars);
    moveArr(this.powerUps);
    if (this.checkpoint) this.checkpoint.update(move);
    if (this.portal) this.portal.update(move);
    moveArr(this.thornWalls);
    const spawnedWalls = [];
    this.enemies.forEach(e => {
      const spawn = e.update(move, delta);
      if (spawn && spawn.length) {
        spawnedWalls.push(...spawn);
      }
    });
    spawnedWalls.forEach(w => this.thornWalls.push(w));

    const player = this.game.player;

    // Handle platform collisions allowing the player to stand on them.
    for (const p of this.platforms) {
      if (!p.visible) continue;
      if (isColliding(player, p)) {
        const platformTop = p.y - p.height / 2;
        const platformBottom = p.y + p.height / 2;
        const platformLeft = p.x - p.width / 2;
        const platformRight = p.x + p.width / 2;
        const playerBottom = player.y + player.height / 2;
        const playerTop = player.y - player.height / 2;
        const playerLeft = player.x - player.width / 2;
        const playerRight = player.x + player.width / 2;
        const fromAbove =
          player.vy >= 0 && playerBottom >= platformTop && player.y < p.y;
        if (fromAbove) {
          player.y = platformTop - player.height / 2;
          player.vy = 0;
          player.jumping = false;
          player.jumpCount = 0;
          if (typeof p.onStep === 'function') p.onStep();
        } else {
          const overlapLeft = playerRight - platformLeft;
          const overlapRight = platformRight - playerLeft;
          const overlapTop = platformBottom - playerTop;
          const overlapBottom = playerBottom - platformTop;
          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);
          if (minOverlapX < minOverlapY) {
            if (overlapLeft < overlapRight) {
              player.x = platformLeft - player.width / 2;
            } else {
              player.x = platformRight + player.width / 2;
            }
            player.vx = 0;
          } else if (player.vy < 0) {
            player.y = platformBottom + player.height / 2;
            player.vy = 0;
          }
        }
      }
    }

    const collideArr = arr => {
      for (const e of arr) {
        if (isColliding(player, e)) {
          this.handlePlayerDeath();
          return false;
        }
      }
      return true;
    };

    if (!collideArr(this.pipes)) return;
    if (!collideArr(this.blocks)) return;
    if (!collideArr(this.thornWalls)) return;

    // Handle enemy collisions and cull off-screen entities
    this.enemies = this.enemies.filter(e => {
      if (e === this.boss) {
        if (isLandingOn(player, e)) {
          player.vy = JUMP_VELOCITY / 2;
          player.jumping = true;
          player.jumpCount = 1;
          e.hit();
          if (e.defeated) {
            this.portal.open = true;
            return false;
          }
          return true;
        }
        if (isColliding(player, e)) {
          this.handlePlayerDeath();
          return false;
        }
        return true;
      }
      if (isLandingOn(player, e)) {
        player.vy = JUMP_VELOCITY / 2;
        player.jumping = true;
        player.jumpCount = 1;
        return false;
      }
      if (isColliding(player, e)) {
        this.handlePlayerDeath();
        return false;
      }
      return true;
    });

    this.stars = this.stars.filter(s => {
      if (isColliding(player, s)) {
        this.game.stars++;
        return false;
      }
      return true;
    });
    this.powerUps = this.powerUps.filter(p => {
      if (isColliding(player, p)) {
        if (p.kind === POWERUP.AURA_SHIELD) {
          player.activateShield(AURA_SHIELD_DURATION, 0);
        } else if (p.kind === POWERUP.WIND_HOOVES) {
          player.activateSpeedBoost(WIND_HOOVES_DURATION, WIND_HOOVES_SPEED);
        } else if (p.kind === POWERUP.SUGAR_WINGS) {
          player.activateWings(SUGAR_WINGS_DURATION, SUGAR_WINGS_EXTRA_JUMPS);
        }
        return false;
      }
      return true;
    });
    if (
      !this.checkpointReached &&
      this.checkpoint &&
      isColliding(player, this.checkpoint)
    ) {
      this.checkpointReached = true;
      this.respawnPoint = { x: player.x, y: this.game.groundY - player.height / 2 };
    }
    if (this.portal && this.portal.open && isColliding(player, this.portal)) {
      this.game.gameOver = true;
      this.game.win = true;
    }
    this.obstacles = [
      ...this.platforms.filter(p => p.visible),
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
      ...this.thornWalls,
      ...this.powerUps,
    ];

    if (this.distance >= this.levelLength && !this.portal) {
      this.game.gameOver = true;
      this.game.win = true;
    }
  }

  setScale(scale) {
    [
      ...this.platforms,
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
      ...this.stars,
      ...this.thornWalls,
      ...this.powerUps,
    ].forEach(o => o.setScale(scale));
    if (this.checkpoint) this.checkpoint.setScale(scale);
    if (this.portal) this.portal.setScale(scale);
  }
}

export { MAP as LEVEL3_MAP, TILE };

