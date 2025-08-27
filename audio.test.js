import test from 'node:test';
import assert from 'node:assert';
import { Renderer } from './src/renderer.js';

class AudioMock {
  constructor() {
    this._listeners = {};
    this.volume = 1;
    this.currentTime = 0;
    this.playCalled = false;
    this.loop = false;
    this.pauseCalled = false;
  }
  addEventListener(event, handler) {
    this._listeners[event] = handler;
  }
  set src(value) {
    this._src = value;
    setTimeout(() => {
      if (this._listeners.canplaythrough) this._listeners.canplaythrough();
    }, 0);
  }
  play() {
    this.playCalled = true;
  }
  pause() {
    this.pauseCalled = true;
  }
}

test('renderer preloads audio assets and sets volume', async () => {
  global.Audio = AudioMock;
  const renderer = new Renderer({ ctx: {} });
  await renderer.preload();
  const jump = renderer.assets.get('jump');
  assert.ok(jump instanceof AudioMock);
  assert.strictEqual(jump.volume, 0.5);
  const bounce = renderer.assets.get('bounce');
  assert.ok(bounce instanceof AudioMock);
  assert.strictEqual(bounce.volume, 0.5);
  const coin = renderer.assets.get('coin');
  assert.ok(coin instanceof AudioMock);
  assert.strictEqual(coin.volume, 0.5);
});

test('playSound resets time and plays audio', async () => {
  global.Audio = AudioMock;
  const renderer = new Renderer({ ctx: {} });
  await renderer.preload();
  const jump = renderer.assets.get('jump');
  jump.currentTime = 1;
  renderer.playSound('jump');
  assert.strictEqual(jump.currentTime, 0);
  assert.ok(jump.playCalled);
});

test('playLevelMusic plays looping track', async () => {
  global.Audio = AudioMock;
  const renderer = new Renderer({ ctx: {} });
  await renderer.preload();
  renderer.playLevelMusic(3);
  const bgm = renderer.music.bgm3;
  assert.ok(bgm.playCalled);
  assert.strictEqual(bgm.loop, true);
});
