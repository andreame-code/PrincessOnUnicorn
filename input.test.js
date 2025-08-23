import test from 'node:test';
import assert from 'node:assert';
import { InputHandler } from './src/input.js';

test('attaches listeners with passive option by default', () => {
  const calls = [];
  global.document = {
    addEventListener: (type, listener, options) => {
      calls.push({ target: 'document', type, options });
    },
    removeEventListener: () => {},
  };
  global.window = {
    addEventListener: (type, listener, options) => {
      calls.push({ target: 'window', type, options });
    },
    removeEventListener: () => {},
  };
  const handler = new InputHandler(() => {});
  handler.attach();
  assert.deepStrictEqual(calls, [
    { target: 'document', type: 'keydown', options: { passive: true } },
    { target: 'window', type: 'pointerdown', options: { passive: true } },
  ]);
});

test('supports custom key mappings', () => {
  let count = 0;
  const handler = new InputHandler(() => count++, { keys: ['KeyA', 'KeyB'] });
  handler.keyListener({ code: 'KeyA', repeat: false });
  handler.keyListener({ code: 'KeyB', repeat: false });
  handler.keyListener({ code: 'Space', repeat: false });
  assert.strictEqual(count, 2);
});
