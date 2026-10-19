# Cube Algorithm Trainer

A dependency-free Rubik’s Cube algorithm trainer by [Zauberwürfel lösen](https://zauberwuerfelloesen.de/). The interface is in German.

## Features
- Five starter algorithms: Sune, Anti-Sune, T-Perm, Ua-Perm and Ub-Perm.
- Inverse setup sequences for a solved physical cube.
- OLL/PLL filters, stopwatch and self-assessed recall.
- Difficult cases appear more frequently; local progress and JSON export.
- Responsive, no accounts or analytics, no build step.

This starter collection is not a complete OLL/PLL course. The trainer does not inspect your cube or verify the solution. Setup and solution require the same cube orientation.

## Run and develop
Open `index.html` in a modern browser, or serve the directory with a static web server. HTTP hosting is recommended for persistent browser storage. Edit `index.html`, `style.css`, and `app.js`. Run `node test.js` for algorithm and progress checks.

## Roadmap
- More cases with verified cube-state illustrations.
- Progress import and review dates.
- English interface and keyboard shortcuts.

Issues and focused pull requests are welcome. Include reproduction steps, browser and expected behavior.

## Learning resources
[German cube guides](https://zauberwuerfelloesen.de/) · [Algorithms](https://zauberwuerfelloesen.de/algorithmen/)

## License
MIT — see [LICENSE](LICENSE).

