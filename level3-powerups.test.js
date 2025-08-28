import test, { describe } from 'node:test';
import assert from 'node:assert';
import { createLevel3Game, FRAME } from './level3TestHelpers.js';
import { createStubGame } from './testHelpers.js';
import {
  AURA_SHIELD_DURATION,
  WIND_HOOVES_DURATION,
  SUGAR_WINGS_DURATION,
  WIND_HOOVES_SPEED,
} from './src/config.js';

// Power-up related tests for Level 3

describe('Level 3 power-ups', () => {
  test('special power-ups appear only in level 3', () => {
    const g1 = createStubGame({ search: '?level=1', skipLevelUpdate: true });
    const g2 = createStubGame({ search: '?level=2', skipLevelUpdate: true });
    const g3 = createLevel3Game({ skipLevelUpdate: true });
    assert.ok(!g1.level.powerUps || g1.level.powerUps.length === 0);
    assert.ok(!g2.level.powerUps || g2.level.powerUps.length === 0);
    assert.strictEqual(g3.level.powerUps.length, 3);
  });

  test('power-ups grant temporary effects', () => {
    const game = createLevel3Game();
    const level = game.level;
    level.getMoveSpeed = () => 0;
    const player = game.player;
    const [aura, hooves, wings] = level.powerUps;

    aura.x = player.x;
    aura.y = player.y;
    game.update(FRAME);
    assert.ok(player.shieldActive);
    for (let i = 0; i < Math.ceil(AURA_SHIELD_DURATION / FRAME) + 1; i++) game.update(FRAME);
    assert.ok(!player.shieldActive);

    hooves.x = player.x;
    hooves.y = player.y;
    game.update(FRAME);
    assert.strictEqual(player.moveSpeed, WIND_HOOVES_SPEED);
    for (let i = 0; i < Math.ceil(WIND_HOOVES_DURATION / FRAME) + 1; i++) game.update(FRAME);
    assert.strictEqual(player.moveSpeed, player.defaultMoveSpeed);

    wings.x = player.x;
    wings.y = player.y;
    game.update(FRAME);
    assert.strictEqual(player.maxJumps, player.defaultMaxJumps + 1);
    for (let i = 0; i < Math.ceil(SUGAR_WINGS_DURATION / FRAME) + 1; i++) game.update(FRAME);
    assert.strictEqual(player.maxJumps, player.defaultMaxJumps);
  });
});
