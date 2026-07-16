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
//
// Rhythm goals for this map:
// - clear left-to-right progression
// - easy opening, then small jump lessons
// - readable obstacles with a few gentle surprises
// - increasing challenge after a midpoint checkpoint
// - explicit finale with guardian + portal
const MAP_WIDTH = 144;
const CHECKPOINT_COLUMN = 56;
const PORTAL_OFFSET_FROM_END = 6;

const ground = Array(MAP_WIDTH).fill(TILE.GROUND);
const row1 = Array(MAP_WIDTH).fill(TILE.EMPTY);
const row2 = Array(MAP_WIDTH).fill(TILE.EMPTY);
const row3 = Array(MAP_WIDTH).fill(TILE.EMPTY);
const row4 = Array(MAP_WIDTH).fill(TILE.EMPTY);

const setTiles = (row, columns, tile) => {
  columns.forEach(col => {
    if (col >= 0 && col < MAP_WIDTH) row[col] = tile;
  });
};

// Gentle intro: readable jumps with plenty of recovery space.
setTiles(row1, [10, 14, 18, 23], TILE.CLOUD_PLATFORM);
setTiles(row1, [28], TILE.FALLING_PLATFORM);
setTiles(row1, [33, 38], TILE.CLOUD_PLATFORM);

// A safe crystal stair leads towards the optional star path.
setTiles(row1, [44, 48], TILE.BLOCK);
setTiles(row2, [52, 56], TILE.BLOCK);

// Optional high "rainbow cloud" secret: exactly five stars.
setTiles(row3, [46, 50, 54, 58, 62], TILE.STAR);

// The first real hazard is isolated and easy to read.
setTiles(row1, [64], TILE.PIPE);

// Mid game: alternating stable/falling clouds to teach rhythm.
setTiles(row1, [78, 86, 94], TILE.CLOUD_PLATFORM);
setTiles(row1, [82, 90], TILE.FALLING_PLATFORM);

// Midpoint checkpoint.
row1[CHECKPOINT_COLUMN] = TILE.CHECKPOINT;

// Second half: short, distinct challenges separated by recovery space.
setTiles(row1, [100, 124], TILE.PIPE);
setTiles(row1, [108, 132], TILE.GOOMBA);
setTiles(row2, [104, 112, 120], TILE.CLOUD_PLATFORM);
setTiles(row2, [116], TILE.FALLING_PLATFORM);
setTiles(row3, [120, 128], TILE.BLOCK);

// Clear ending runway to the portal.
setTiles(row1, [134], TILE.CLOUD_PLATFORM);
row1[MAP_WIDTH - PORTAL_OFFSET_FROM_END] = TILE.PORTAL;

const MAP = [ground, row1, row2, row3, row4];


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
    this.scrollX = 0;
    const params = this.game.params;
    this.deadZoneWidthPct = parseFloat(params.get('deadZoneWidthPct')) || 0.5;
    this.deadZoneHeightPct = parseFloat(params.get('deadZoneHeightPct')) || 0.5;
    this.cameraLerp = parseFloat(params.get('cameraLerp')) || 0.1;
    this.platforms = [];
    this.pipes = [];
    this.blocks = [];
    this.enemies = [];
    this.thornWalls = [];
    this.stars = [];
    this.collectedStarColumns = new Set();
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
            if (!this.collectedStarColumns.has(col)) {
              const star = new Star(x, y, this.tileSize);
              star.mapColumn = col;
              this.stars.push(star);
            }
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
    // Space the unique enemies across the route instead of front-loading them.
    const startX = this.game.worldWidth;
    const ground = this.game.groundY - this.tileSize / 2;
    const crow = new ShadowCrow(startX + 52, this.game.groundY - 1.5, this.tileSize);
    const sprite = new RhombusSprite(startX + 86, ground, this.tileSize);
    const guard = new ThornGuard(startX + 116, ground, this.tileSize);
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
    const startX = this.game.worldWidth;
    const positions = [
      { x: startX + 46, kind: POWERUP.AURA_SHIELD },
      { x: startX + 78, kind: POWERUP.WIND_HOOVES },
      { x: startX + 110, kind: POWERUP.SUGAR_WINGS },
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
    const respawn = this.respawnPoint || {
      x: player.x,
      y: this.game.groundY - player.height / 2,
      scrollX: 0,
      distance: 0,
    };
    player.x = respawn.x;
    player.y = respawn.y;
    player.vx = 0;
    player.vy = 0;
    player.dead = false;
    player.jumping = false;
    player.jumpCount = 0;
    player.activateShield(2, 0);
    this.scrollX = respawn.scrollX || 0;
    this.distance = respawn.distance || 0;
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

    const scrollOffset = this.scrollX;
    const repositionAhead = arr =>
      arr
        .map(entity => {
          entity.x -= scrollOffset;
          return entity;
        })
        .filter(entity => entity.x + entity.width / 2 > player.x - 0.01);

    // Reset stateful properties so entities behave as if never interacted with.
    this.platforms = repositionAhead(this.platforms).map(p => {
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

    this.pipes = repositionAhead(this.pipes);
    this.blocks = repositionAhead(this.blocks);

    this.enemies = repositionAhead(this.enemies).map(e => {
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

    this.thornWalls = repositionAhead(this.thornWalls);
    this.stars = repositionAhead(this.stars);
    this.powerUps = repositionAhead(this.powerUps);

    if (this.checkpoint) this.checkpoint.x -= scrollOffset;
    if (this.portal) this.portal.x -= scrollOffset;

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

  updateEntities(move, delta) {
    const moveArr = arr => arr.forEach(e => e.update(move, delta));
    moveArr(this.platforms);
    moveArr(this.pipes);
    moveArr(this.blocks);
    moveArr(this.stars);
    moveArr(this.powerUps);
    if (this.checkpoint) this.checkpoint.update(move);
    if (this.portal) this.portal.update(move);
    this.thornWalls.forEach(wall => {
      wall.update(move);
      wall.x += (wall.vx || 0) * delta;
    });
    const spawnedWalls = [];
    this.enemies.forEach(e => {
      const nextX = e.x - move;
      const isNearViewport =
        nextX - e.width / 2 <= this.game.worldWidth + 2 &&
        nextX + e.width / 2 >= -2;
      const spawn = e.update(move, isNearViewport ? delta : undefined);
      if (spawn && spawn.length) spawnedWalls.push(...spawn);
    });
    spawnedWalls.forEach(w => this.thornWalls.push(w));
  }

  resolvePlatformCollisions(player) {
    for (const p of [...this.platforms, ...this.blocks]) {
      if (p.visible === false) continue;
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
  }

  handleEnemies(player) {
    const absorbHit = () => {
      if (!player.shieldActive) return false;
      player.shieldActive = false;
      player.shieldTimer = 0;
      return true;
    };
    const collideArr = arr => {
      for (const e of arr) {
        if (isColliding(player, e)) {
          this.handlePlayerDeath();
          return false;
        }
      }
      return true;
    };

    if (!collideArr(this.pipes)) return false;
    this.thornWalls = this.thornWalls.filter(wall => {
      if (!isColliding(player, wall)) return true;
      if (absorbHit()) return false;
      this.handlePlayerDeath();
      return false;
    });
    if (this.respawning || this.game.gameOver) return false;

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
          if (absorbHit()) return true;
          this.handlePlayerDeath();
          return false;
        }
        return e.x + e.width / 2 > 0;
      }
      if (isLandingOn(player, e)) {
        player.vy = JUMP_VELOCITY / 2;
        player.jumping = true;
        player.jumpCount = 1;
        return false;
      }
      if (isColliding(player, e)) {
        if (absorbHit()) return false;
        this.handlePlayerDeath();
        return false;
      }
      return e.x + e.width / 2 > 0;
    });
    return true;
  }

  processPickups(player) {
    const filterArr = arr => arr.filter(e => e.x + e.width / 2 > 0);
    this.platforms = filterArr(this.platforms);
    this.pipes = filterArr(this.pipes);
    this.blocks = filterArr(this.blocks);
    this.thornWalls = filterArr(this.thornWalls);
    this.stars = this.stars.filter(s => {
      if (isColliding(player, s)) {
        this.collectedStarColumns.add(s.mapColumn);
        this.game.stars = this.collectedStarColumns.size;
        return false;
      }
      return s.x + s.width / 2 > 0;
    });
    this.powerUps = this.powerUps.filter(p => {
      if (isColliding(player, p)) {
        if (p.kind === POWERUP.AURA_SHIELD) {
          player.activateShield(AURA_SHIELD_DURATION, 0);
        } else if (p.kind === POWERUP.WIND_HOOVES) {
          player.activateSpeedBoost(WIND_HOOVES_DURATION, WIND_HOOVES_SPEED);
        } else if (p.kind === POWERUP.SUGAR_WINGS) {
          player.activateWings(
            SUGAR_WINGS_DURATION,
            SUGAR_WINGS_EXTRA_JUMPS
          );
        }
        return false;
      }
      return p.x + p.width / 2 > 0;
    });

    if (
      !this.checkpointReached &&
      this.checkpoint &&
      (isColliding(player, this.checkpoint) ||
        this.checkpoint.x <= player.x + player.width / 2)
    ) {
      this.checkpointReached = true;
      this.respawnPoint = {
        x: player.x,
        y: this.game.groundY - player.height / 2,
        scrollX: this.scrollX,
        distance: this.distance,
      };
    }
    if (this.portal && this.portal.open && isColliding(player, this.portal)) {
      this.game.gameOver = true;
      this.game.win = true;
    }
    if (this.checkpoint && this.checkpoint.x + this.checkpoint.width / 2 <= 0) {
      this.checkpoint = null;
    }
    if (
      this.portal &&
      this.portal.open &&
      this.portal.x + this.portal.width / 2 <= 0
    ) {
      this.game.gameOver = true;
      this.game.win = true;
    }
  }

  update(delta, move = 0) {
    if (this.respawning) {
      this.respawnTimer += delta;
      if (this.respawnTimer >= 1) {
        this.respawnPlayer();
      }
      return;
    }

    this.distance += move > 0 ? move : 0;

    this.updateEntities(move, delta);

    const player = this.game.player;
    this.resolvePlatformCollisions(player);
    if (!this.handleEnemies(player)) return;
    this.processPickups(player);

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

  getRenderables() {
    return [
      ...this.platforms.filter(p => p.visible),
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
      ...this.thornWalls,
      ...this.powerUps,
      ...this.stars,
      this.checkpoint,
      this.portal,
    ].filter(Boolean);
  }
}

export { MAP as LEVEL3_MAP, TILE };
