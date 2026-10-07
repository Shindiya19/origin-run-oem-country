# Origin Run

A browser-based OEM country-of-origin game for roadshow participants.

## Launch

Open `index.html` in Chrome, Edge, Firefox, or Safari. No installation, build step, or development server is required. Google Fonts and Lucide icons load over the internet; gameplay, the illustrated yard, and the world map are local.

## Play

1. Select **Send to warehouse**. The mystery truck enters the warehouse.
2. A randomly branded truck emerges and the world map opens. Choose its country of origin using the country markers on the map.
3. The truck travels along your selected route to that country's geographic location. A correct answer earns 100 points; an incorrect answer ends the run and reveals the correct country. No destination is suggested before you choose.
4. After a correct answer, select **Next truck**. Each of the twelve OEMs appears once, in shuffled order.
5. View the final score and play again. The maximum score is 1,200.

Accuracy, current streak, and round progress appear beside the yard. The personal best is stored in browser local storage when available. Sound is optional and starts muted. Fullscreen is available on supported browsers. Restart clears the current round after confirmation.

## OEM List

The mappings intentionally follow the supplied event list.

| OEM | Country |
| --- | --- |
| JCB | UK |
| MAN | Germany |
| Nikola | USA |
| Ford Otosan | Turkey |
| FPT | Italy |
| Deutz | Germany |
| HATZ | Germany |
| Daimler | Germany |
| Navistar | USA |
| Cummins | USA |
| IRIZAR | Spain |
| Weichai | China |

## Files

- `index.html`: game layout and original SVG yard/truck artwork.
- `style.css`: responsive desktop and mobile presentation.
- `game-ui.css`: polished dispatch-game colors, hierarchy, and motion.
- `game.js`: OEM data, shuffled rounds, animation state, scoring, audio, and controls.
- `world-map.svg`: local country boundaries derived from public-domain [Natural Earth](https://www.naturalearthdata.com/) 1:110m map data.

Branding uses text labels rather than official OEM logos. No participant information is collected or sent to a server.