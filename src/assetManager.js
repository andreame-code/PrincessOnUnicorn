export class AssetManager {
  constructor() {
    this.assets = new Map();
  }

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      if (typeof Image === 'undefined') {
        const img = { src };
        this.assets.set(key, img);
        resolve(img);
        return;
      }
      const img = new Image();
      img.onload = () => {
        this.assets.set(key, img);
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }

  loadAudio(key, src) {
    return new Promise((resolve, reject) => {
      if (typeof Audio === 'undefined') {
        const audio = { src, play: () => {}, volume: 1, currentTime: 0 };
        this.assets.set(key, audio);
        resolve(audio);
        return;
      }
      const audio = new Audio();
      audio.addEventListener(
        'canplaythrough',
        () => {
          this.assets.set(key, audio);
          resolve(audio);
        },
        { once: true }
      );
      audio.addEventListener('error', () => {
        reject(new Error(`Failed to load audio: ${src}`));
      });
      audio.src = src;
    });
  }

  loadAll(list) {
    return Promise.all(
      list.map(({ key, src, type }) =>
        type === 'audio' ? this.loadAudio(key, src) : this.loadImage(key, src)
      )
    );
  }

  get(key) {
    return this.assets.get(key);
  }
}
