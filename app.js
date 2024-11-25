const dotenv = require("dotenv");
dotenv.config();

const { readFileSync } = require("fs");
const express = require("express");
const PokemonBattleEngine = require("./battle-engine");
const app = express();

app.set("view engine", "ejs");

app.set("views", "./views");

const data = readFileSync(process.env.POKEMON_DATA_FILE_PATH);
const pokemonBattleEngine = new PokemonBattleEngine(JSON.parse(data));
console.log(pokemonBattleEngine.getGameState().SecondTeam.Pokemons);

app.get("/", (req, res) => {
  res.render("index", {
    title: "Hello World!",
    message: "Bienvenue sur mon site",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
