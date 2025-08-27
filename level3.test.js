import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

const FRAME = 1 / 60;

// Ensure obstacles are mini cactus
// and have the expected dimensions
// and type flag for rendering.
test('level 3 uses mini cactus obstacles', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const obstacle = game.level.createObstacle();
  assert.strictEqual(obstacle.width, 0.2);
  assert.strictEqual(obstacle.height, 0.4);
  assert.strictEqual(obstacle.type, 'cactus');
});

// Distance travelled should increase according to the
// move speed so that layout markers are hit at the
// expected times.
test('level 3 advances using move speed', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  level.update(1); // one second
  assert.strictEqual(level.distance, level.getMoveSpeed());
});

// Obstacles spawn only after travelling the layout distance.
test('level 3 spawns obstacles based on layout', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  for (let i = 0; i < 100; i++) level.update(FRAME);
  assert.strictEqual(level.obstacles.length, 0);
  for (let i = 0; i < 100; i++) level.update(FRAME);
  assert.ok(level.obstacles.length > 0);
});

// After travelling the entire level and clearing obstacles
// the level should signal completion.
test('level 3 completes after level length', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  let steps = 0;
  while (!game.win && steps < 5000) {
    level.update(FRAME);
    steps++;
  }
  assert.ok(game.win);
});

// Level 3 uses jump instead of shield when pressing the action button
test('level 3 maps space to jump', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const player = game.player;
  game.handleInput();
  assert.strictEqual(player.jumping, true);
  assert.strictEqual(player.shieldActive, false);
});

// Tile map should include both blocks and platforms
test('level 3 generates tile map with blocks and platforms', () => {
  const game = createStubGame({ search: '?level=3' });
  const tiles = game.level.tiles ?? [];
  const hasBlock = tiles.some(t => t.type === 'block');
  const hasPlatform = tiles.some(t => t.type === 'platform');
  assert.ok(hasBlock, 'tile map lacks blocks');
  assert.ok(hasPlatform, 'tile map lacks platforms');
});

// Enemies should spawn based on the map description
test('level 3 spawns enemies from map', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  for (let i = 0; i < 200; i++) level.update(FRAME);
  assert.ok((level.enemies?.length ?? 0) > 0);
});

// Jumping on enemies should defeat them
test('enemy dies when player jumps on it', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const player = game.player;
  const enemy = { x: player.x, y: player.y + player.height / 2, width: 0.5, height: 0.5, update: () => {} };
  level.enemies = [enemy];
  player.jump();
  player.y = enemy.y - enemy.height - 0.1;
  player.vy = 5;
  level.update(FRAME);
  assert.strictEqual(level.enemies.length, 0);
});

// Direct contact with an enemy should cause game over
test('contact with enemy causes game over', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const player = game.player;
  const enemy = { x: player.x, y: player.y, width: 0.5, height: 0.5, update: () => {} };
  level.enemies = [enemy];
  level.update(FRAME);
  assert.strictEqual(game.gameOver, true);
});

// Completion should depend on reaching map end and defeating enemies
test('level 3 completes after map end and enemies defeated', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  // Remove obstacles and prevent new ones so only enemies gate completion
  level.obstacles = [];
  level.layout = [];
  // Persist enemy so level shouldn't complete
  level.enemies = [{ x: game.player.x + 1, y: game.groundY, width: 0.5, height: 0.5, update: () => {} }];
  let steps = 0;
  while (level.distance < level.levelLength && steps < 5000) {
    level.update(FRAME);
    steps++;
  }
  assert.ok(!game.win, 'level should not complete while enemies remain');
  level.enemies = [];
  while (!game.win && steps < 10000) {
    level.update(FRAME);
    steps++;
  }
  assert.ok(game.win);
});
