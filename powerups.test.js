import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import {
  AURA_SHIELD_DURATION,
  ZOCCOLI_VENTO_DURATION,
  ALI_DI_ZUCCHERO_DURATION,
} from './src/config.js';

const FRAME = 1 / 60;

function runFor(game, seconds) {
  for (let t = 0; t < seconds; t += FRAME) {
    game.update(FRAME);
  }
}

test('special power-ups spawn only in level 3', () => {
  const g1 = createStubGame({ search: '?level=1' });
  assert.strictEqual(g1.level.powerUps, undefined);
  const g2 = createStubGame({ search: '?level=2' });
  assert.strictEqual(g2.level.powerUps, undefined);
  const g3 = createStubGame({ search: '?level=3' });
  assert.ok(Array.isArray(g3.level.powerUps));
  assert.strictEqual(g3.level.powerUps.length, 3);
});

function collect(game, kind) {
  const level = game.level;
  const player = game.player;
  const p = level.powerUps.find(pu => pu.kind === kind);
  player.x = p.x;
  player.y = p.y;
  level.update(0); // trigger pickup without movement
  return player;
}

test('power-ups grant temporary effects', () => {
  // Aura-Shield
  let game = createStubGame({ search: '?level=3' });
  let player = collect(game, 'aura');
  assert.ok(player.shieldActive);
  runFor(game, AURA_SHIELD_DURATION + FRAME);
  assert.ok(!player.shieldActive);

  // Wind-Hooves
  game = createStubGame({ search: '?level=3' });
  player = game.player;
  const baseSpeed = player.moveSpeed;
  collect(game, 'wind');
  assert.ok(player.moveSpeed > baseSpeed);
  runFor(game, ZOCCOLI_VENTO_DURATION + FRAME);
  assert.strictEqual(player.moveSpeed, baseSpeed);

  // Sugar-Wings
  game = createStubGame({ search: '?level=3' });
  player = game.player;
  const baseJumps = player.maxJumps;
  collect(game, 'wings');
  assert.ok(player.maxJumps > baseJumps);
  runFor(game, ALI_DI_ZUCCHERO_DURATION + FRAME);
  assert.strictEqual(player.maxJumps, baseJumps);
});
