module.exports = (pokemonBattleEngine) => {
  playBattle(0, pokemonBattleEngine);
};

function playBattle(round, pokemonBattleEngine) {
  console.log(`Round: ${round}`);
  if (
    pokemonBattleEngine.getLastRoundState() &&
    pokemonBattleEngine.getLastRoundState().FirstTeam.IsACrit
  )
    console.log(
      `${
        pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
          pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
        ].Name
      } made a critical hit !`
    );
  if (
    pokemonBattleEngine.getLastRoundState() &&
    pokemonBattleEngine.getLastRoundState().SecondTeam.IsACrit
  )
    console.log(
      `${
        pokemonBattleEngine.getGameState().SecondTeam.Pokemons[
          pokemonBattleEngine.getGameState().SecondTeam.ActivePokemon
        ].Name
      } made a critical hit !`
    );
  console.log(
    `${
      pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
        pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
      ].Name
    }: ${
      pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
        pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
      ].CalculatedStat.Hp
    } / ${
      pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
        pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
      ].CalculatedStat.MaxHp
    } HP`
  );
  console.log(
    `${
      pokemonBattleEngine.getGameState().SecondTeam.Pokemons[
        pokemonBattleEngine.getGameState().SecondTeam.ActivePokemon
      ].Name
    }: ${
      pokemonBattleEngine.getGameState().SecondTeam.Pokemons[
        pokemonBattleEngine.getGameState().SecondTeam.ActivePokemon
      ].CalculatedStat.Hp
    } / ${
      pokemonBattleEngine.getGameState().SecondTeam.Pokemons[
        pokemonBattleEngine.getGameState().SecondTeam.ActivePokemon
      ].CalculatedStat.MaxHp
    } HP`
  );
  pokemonBattleEngine.firstTeamChoice({ Type: "UseMove", Name: "Vine Whip" });
  pokemonBattleEngine.secondTeamChoice({ Type: "UseMove", Name: "Water Gun" });
  if (
    pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
      pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
    ].CalculatedStat.Hp >= 0 &&
    pokemonBattleEngine.getGameState().SecondTeam.Pokemons[
      pokemonBattleEngine.getGameState().SecondTeam.ActivePokemon
    ].CalculatedStat.Hp >= 0
  ) {
    playBattle((round += 1), pokemonBattleEngine);
  } else {
    console.log(`Round: ${(round += 1)}`);
    console.log(
      `${
        pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
          pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
        ].Name
      }: ${
        pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
          pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
        ].CalculatedStat.Hp
      } / ${
        pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
          pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
        ].CalculatedStat.MaxHp
      } HP`
    );
    console.log(
      `${
        pokemonBattleEngine.getGameState().SecondTeam.Pokemons[
          pokemonBattleEngine.getGameState().SecondTeam.ActivePokemon
        ].Name
      }: ${
        pokemonBattleEngine.getGameState().SecondTeam.Pokemons[
          pokemonBattleEngine.getGameState().SecondTeam.ActivePokemon
        ].CalculatedStat.Hp
      } / ${
        pokemonBattleEngine.getGameState().SecondTeam.Pokemons[
          pokemonBattleEngine.getGameState().SecondTeam.ActivePokemon
        ].CalculatedStat.MaxHp
      } HP`
    );
    const winner =
      pokemonBattleEngine.getGameState().FirstTeam.Pokemons[
        pokemonBattleEngine.getGameState().FirstTeam.ActivePokemon
      ].CalculatedStat.Hp <= 0
        ? pokemonBattleEngine.getGameState().SecondTeam.Name
        : pokemonBattleEngine.getGameState().FirstTeam.Name;
    console.log(`${winner} won the game !`);
  }
}
