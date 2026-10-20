# Type Battle

A responsive Pokémon type-effectiveness guessing game. Identify every attacking type that deals 2× or 4× damage to a selected Pokémon in at most three attempts.

## Rules and data

A round starts with the Pokémon's name and official artwork only. A wrong first guess reveals one defensive type; a wrong second guess reveals all types; the third miss ends the round. Guesses are sets, so every 2× and 4× weakness must be selected. An explicit “no 2× or 4× weaknesses” action handles an empty answer. The results explain 4× weaknesses, 2× weaknesses, resistances, stacked resistances, and immunities.

The effectiveness chart in `game-logic.js` is the traditional modern main-series chart (Generation VI onward, including Fairy). It applies each attacking type's multiplier against each defender type and multiplies them; final multipliers of 2 or 4 qualify as correct answers. The game bundles names and defensive types for all 1,025 standard species (#1–1025) in `pokemon.json`; alternate forms are excluded. The catalog is loaded locally and no runtime API call is needed for names, types, or gameplay. Sprite artwork is served from the [PokéAPI sprites repository](https://github.com/PokeAPI/sprites), with a regular sprite fallback if official artwork fails. The bundled dataset is based on [cristobalmitchell/pokedex](https://github.com/cristobalmitchell/pokedex), data/pokemon_utf8.csv (1,025 National Pokédex entries).

## Run locally

No build step or dependencies are required. Open `index.html` in a browser, or serve the repository with any static file server. An internet connection is needed to load the initial Pokédex and Pokémon details.

## GitHub Pages

The GitHub Actions workflow deploys the static site on pushes to `main` and supports manual runs via `workflow_dispatch`. In repository Settings → Pages, select **GitHub Actions** as the build and deployment source. The expected URL is https://marcelolamenza.github.io/type-battle/.

## Sources and attribution

Pokémon data and sprite resources are provided by [PokéAPI](https://pokeapi.co/) and [PokéAPI sprites](https://github.com/PokeAPI/sprites). The 18 type-symbol SVGs are copied from the official Pokémon type-chart portal assets already used by [typeDex](https://github.com/marcelolamenza/typeDex/tree/main/public/type-icons); attribution is included in `assets/type-icons/README.md`. These are Pokémon type symbols, not original Type Battle artwork. Pokémon names and imagery are trademarks and property of their respective owners. This fan-made learning project is not affiliated with Nintendo, Game Freak, or The Pokémon Company.

## Limitations

The game is a static client-side site with no backend. Names, types, and game logic work without an API; sprite images require an internet connection. GitHub Pages must remain enabled for the repository deployment workflow.
