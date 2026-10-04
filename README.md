# Pocket Park

Pocket Park is a dependency-free static Canvas cooperative puzzle-platformer inspired by Pico Park's local-party puzzle language. Open `index.html` directly in a browser to play, or serve the folder with any static file server.

## Play

- Open `index.html`.
- Use `1` through `6` to pick a Stage Set level.
- Press `R` to restart the current stage and `N` to advance.
- Press `P` to cycle between two, three, and four Pips.
- Press `M` to mute generated sound effects.
- Press `V` to toggle reduced motion.

## Controls

- Pip Star: `WASD`
- Pip Moon: arrow keys
- Pip Bolt: `I`, `J`, `L`
- Pip Heart: numpad `8`, `4`, `6`

## Verification

```sh
npm install
npm run check
```

The check script runs `node --check game.js` and Playwright browser tests against the direct `file://` launch path.
