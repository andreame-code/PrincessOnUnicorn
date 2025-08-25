# PrincessOnUnicorn Wiki

## Overview

PrincessOnUnicorn is a lightweight JavaScript runner game. The player controls a princess riding a unicorn across a medieval landscape.

## Gameplay

### Controls
- **Jump** – press `Space` or tap the screen.
- **Shield (Level 2)** – press `Space` or tap again repeatedly to maintain a temporary shield that shatters incoming walls. The shield now recharges 10% faster.

### Scoring
Points increase with distance. Reach 1000 to encounter the Black Knight.

### Levels
1. **Forest Run** – avoid obstacles and collect points.
2. **Black Knight** – the knight hurls walls at the unicorn. Use the shield to break them. After several successful blocks the knight retreats.

## Code Structure
- `index.html` boots the game.
- `main.js` handles the game loop and level logic.
- `src/` contains modular utilities and classes.
- `sprites/` and `assets/` include graphics and audio.

## Development Setup
1. Ensure Node.js is installed.
2. Run tests with `npm test`.
3. Use `npm test -- --watch` during development for automatic reruns.

## Testing
Tests cover physics (jumping, landing), collision detection, deterministic behavior, and level logic. They are located in the `*.test.js` files.

## Contributing
Issues and pull requests are welcome. Please run `npm test` before submitting.

## Credits
Game created primarily with assistance from ChatGPT.

