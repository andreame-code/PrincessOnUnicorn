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
  const handler = new InputHandler({}, {}, { pointerCallback: () => {} });
    handler.attach();
    assert.deepStrictEqual(calls, [
      { target: 'document', type: 'keydown', options: { passive: true } },
      { target: 'document', type: 'keyup', options: { passive: true } },
      { target: 'window', type: 'pointerdown', options: { passive: true } },
    ]);
});

test('supports dedicated callbacks for keys', () => {
  let a = 0;
  let b = 0;
  const handler = new InputHandler({
    KeyA: () => a++,
    KeyB: () => b++,
    });
    handler.keydownListener({ code: 'KeyA', repeat: false });
    handler.keydownListener({ code: 'KeyB', repeat: false });
    handler.keydownListener({ code: 'Space', repeat: false });
  assert.strictEqual(a, 1);
  assert.strictEqual(b, 1);
});
