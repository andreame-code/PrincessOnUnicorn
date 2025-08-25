# PrincessOnUnicorn

PrincessOnUnicorn is a side-scrolling runner inspired by the Chrome offline T‑Rex game, starring a brave princess riding a unicorn.

## Features
- Medieval themed interface.
- Start menu disappears once the game begins.
- Two levels, including a boss fight against the Black Knight.

## Play
Open `index.html` in a modern browser. Press the spacebar or tap the screen to jump over obstacles. Reach **1000 points** to face the Black Knight.

To skip directly to the boss fight, open:

```
index.html?level=2
```

In Level 2 the Black Knight throws walls at you. Press the spacebar or tap again to activate a shield. If a wall hits while the shield is active it shatters and the unicorn advances. When the knight runs out of space he flees and the princess wins.

## Development
The project has no external dependencies; a recent Node.js installation is sufficient to run the tests and develop new features.

## Testing
Make sure Node.js is installed, then run the unit tests with:

```
npm test
```

During development you can enable watch mode to automatically rerun tests on file changes:

```
npm test -- --watch
```

## Contributing
Pull requests are welcome! If you'd like to propose changes, open an issue or submit a PR describing your updates.

For more details about the game, see the [wiki](docs/WIKI.md).

## Credits
Game created primarily with the help of ChatGPT.

