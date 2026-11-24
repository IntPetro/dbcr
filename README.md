# dbcr.si

A minimal, responsive landing page featuring all eight members and seven mini games. Plain HTML, CSS, and JavaScript, with no dependencies or build step.

## Play

Hold any playable name box for about half a second (mouse or touch). Keyboard users can focus a box and press Enter or Space. Release early or move your pointer to cancel. Games open in a dialog; Close or Escape returns to the page.

- Naman: ten-question personality quiz with four playful archetypes, ties, and revisable answers.
- Shiven: five valid reaction attempts and their average; early clicks and hidden-tab rounds do not count.
- Ishan: 35 randomized unrelated words, live WPM, elapsed time, and accuracy. Pasting is blocked.
- Shubh: hidden-country guessing with eight attempts, distance, compass direction, warmer/colder feedback, shared-border hints, and progressive clues.
- Harshit: clicks per second with 3, 5, or 10-second rounds, live countdown, and final CPS.
- Somil: original Doodle Jump-style platform game with automatic bouncing, scrolling platforms, moving platforms, edge wrapping, keyboard/touch movement, pause, and game-over/replay.
- Vinayak: randomized 9×9 Sudoku with a verified unique solution, number pad, arrow-key navigation, conflict highlighting, board checks, hints, and timer.

Parth's game is marked as coming soon. No scores or responses are saved or sent anywhere.

## Deploy

From this directory, run:

```sh
vercel --prod
```

For a new Vercel project, choose **Other** as the framework preset if prompted and leave the default build settings unchanged. The Vercel CLI will guide you through login and project linking if needed.

To use the custom domain `dbcr.si`, add it to the deployed project's Domains settings in Vercel and follow the DNS instructions there.

## Edit

Landing page content is in `index.html`; mini game styles and behavior are in `games.css` and `games.js`. Calculations live in `games-core.js`. Open `index.html` in a browser to preview locally.

Country data is bundled in `countries.js`, derived from [mledoze/countries](https://github.com/mledoze/countries) under the Open Database License 1.0 (included in `COUNTRY-DATA-LICENSE.txt`). The dataset includes 193 UN members, Palestine, and Vatican City. Distance is the great-circle distance between representative coordinates, not the shortest distance between borders. The bundled data requires no API calls during play.
