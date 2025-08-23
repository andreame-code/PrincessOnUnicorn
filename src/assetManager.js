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

  loadAll(list) {
    return Promise.all(list.map(({ key, src }) => this.loadImage(key, src)));
  }

  get(key) {
    return this.assets.get(key);
  }
}
