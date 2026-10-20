# Type Battle

A responsive Pokémon type-effectiveness guessing game. Identify the complete set of attacking types that deal exactly 2× damage to a selected Pokémon in at most three attempts.

## Rules and data

A round starts with the Pokémon's name and official artwork only. A wrong first guess reveals one defensive type; a wrong second guess reveals all types; the third miss ends the round. Guesses are sets, so every exact 2× weakness must be selected. An explicit “No 2× weaknesses” action handles an empty answer. The results explain 4× weaknesses, 2× weaknesses, resistances, stacked resistances, and immunities.

The effectiveness chart in `index.html` is the traditional modern main-series chart (including Fairy). It applies each attacking type's multiplier against each defender type and multiplies them; only a final result of exactly 2 qualifies. Pokémon names/types/sprites are loaded from PokéAPI. The search pool covers the 1,025 standard species (National Pokédex #1–1025); alternate forms are excluded. Individual loaded Pokémon are cached in browser storage. Initial catalog and first-time data access need an internet connection; the app reports API failures and can use previously cached Pokémon. Sprites use PokéAPI's official-artwork assets with a regular sprite fallback.

## Run locally

No build step or dependencies are required. Open `index.html` in a browser, or serve the repository with any static file server. An internet connection is needed to load the initial Pokédex and Pokémon details.

## GitHub Pages

The GitHub Actions workflow deploys the static site on pushes to `main` and supports manual runs via `workflow_dispatch`. In repository Settings → Pages, select **GitHub Actions** as the build and deployment source. The expected URL is https://marcelolamenza.github.io/type-battle/.

## Sources and attribution

Pokémon data and sprite resources are provided by [PokéAPI](https://pokeapi.co/) and [PokéAPI sprites](https://github.com/PokeAPI/sprites). Pokémon names and imagery are trademarks and property of their respective owners. This fan-made learning project is not affiliated with Nintendo, Game Freak, or The Pokémon Company.

## Limitations

The game is a static client-side site with no backend. It relies on PokéAPI for catalog and uncached Pokémon details, so a network outage prevents starting uncached rounds. GitHub Pages must be enabled for the repository before the deployment workflow can publish the site.
