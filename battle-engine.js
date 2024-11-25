module.exports = class PokemonBattleEngine {
  #gameState;
  #gameData;
  constructor(gameData) {
    this.#gameData = gameData;
    this.#gameState = {
      FasterPokemon: {
        TeamName: this.#getWhichTeamPlayInFirstBasedOnPokemonSpeed(),
        PokemonIndex:
          this.#gameData.Teams[
            this.#getWhichTeamPlayInFirstBasedOnPokemonSpeed()
          ].ActivePokemonIndex,
      },
      FirstTeam: {
        ActivePokemon: this.#gameData.Teams.FirstTeam.ActivePokemonIndex,
        Pokemons: this.#gameData.Teams.FirstTeam.Pokemons.map(
          (item, index) => ({
            Name: item.Name,
            Status: [],
            AccuracyModifier: 1,
            StatModifier: {
              Hp: 1,
              Attack: 1,
              Defense: 1,
              SpeAttack: 1,
              SpeDefense: 1,
              Speed: 1,
            },
            CalculatedStat: {
              Hp: this.#getCalculatedBaseStat("FirstTeam", index, "Hp"),
              Attack: this.#getCalculatedBaseStat("FirstTeam", index, "Attack"),
              Defense: this.#getCalculatedBaseStat(
                "FirstTeam",
                index,
                "Defense"
              ),
              SpeAttack: this.#getCalculatedBaseStat(
                "FirstTeam",
                index,
                "SpeAttack"
              ),
              SpeDefense: this.#getCalculatedBaseStat(
                "FirstTeam",
                index,
                "SpeDefense"
              ),
              Speed: this.#getCalculatedBaseStat("FirstTeam", index, "Speed"),
            },
            BaseStat: this.#gameData.Pokemons.find(
              (poke) => poke.Name === item.Name
            ).BaseStat,
          })
        ),
      },
      SecondTeam: {
        ActivePokemon: this.#gameData.Teams.SecondTeam.ActivePokemonIndex,
        Pokemons: this.#gameData.Teams.SecondTeam.Pokemons.map(
          (item, index) => ({
            Name: item.Name,
            Status: [],
            AccuracyModifier: 1,
            StatModifier: {
              Hp: 1,
              Attack: 1,
              Defense: 1,
              SpeAttack: 1,
              SpeDefense: 1,
              Speed: 1,
            },
            CalculatedStat: {
              Hp: this.#getCalculatedBaseStat("SecondTeam", index, "Hp"),
              Attack: this.#getCalculatedBaseStat(
                "SecondTeam",
                index,
                "Attack"
              ),
              Defense: this.#getCalculatedBaseStat(
                "SecondTeam",
                index,
                "Defense"
              ),
              SpeAttack: this.#getCalculatedBaseStat(
                "SecondTeam",
                index,
                "SpeAttack"
              ),
              SpeDefense: this.#getCalculatedBaseStat(
                "SecondTeam",
                index,
                "SpeDefense"
              ),
              Speed: this.#getCalculatedBaseStat("SecondTeam", index, "Speed"),
            },
            BaseStat: this.#gameData.Pokemons.find(
              (poke) => poke.Name === item.Name
            ).BaseStat,
          })
        ),
      },
    };
  }
  firstTeamChoice(firstTeamChoice) {
    return this;
  }
  getGameState() {
    return this.#gameState;
  }
  #getPokemonDataByIndex(team, pokemonName) {
    return this.#gameData.Teams[team].Pokemons[pokemonName];
  }
  #getCalculatedBaseStat(teamName, pokemonIndex, statName) {
    // Récupérer l'équipe appropriée
    const teamData = this.#gameData.Teams[teamName];
    if (!teamData || !teamData.Pokemons[pokemonIndex]) return null;

    // Récupérer les données du Pokémon dans l'équipe par son index
    const teamPokemon = teamData.Pokemons[pokemonIndex];

    // Récupérer les données de base du Pokémon global (stats de base)
    const basePokemonData = this.#gameData.Pokemons.find(
      (p) => p.Name === teamPokemon.Name
    );
    if (!basePokemonData || !basePokemonData.BaseStat[statName]) return null;

    const baseStat = basePokemonData.BaseStat[statName];
    const iv = teamPokemon.IVS[statName] || 0;
    const ev = teamPokemon.EVS[statName] || 0;
    const level = teamPokemon.Level;

    // Appliquer la modification des stats (buffs/débuffs) via StatModifier
    if (this.#gameState == null) {
      this.firstTeamPokemonsStatModifier =
        this.#gameData.Teams.FirstTeam.Pokemons.map((item) => ({
          StatModifier: {
            Hp: 1,
            Attack: 1,
            Defense: 1,
            SpeAttack: 1,
            SpeDefense: 1,
            Speed: 1,
          },
        }));

      this.secondTeamPokemonsStatModifier =
        this.#gameData.Teams.SecondTeam.Pokemons.map((item) => ({
          StatModifier: {
            Hp: 1,
            Attack: 1,
            Defense: 1,
            SpeAttack: 1,
            SpeDefense: 1,
            Speed: 1,
          },
        }));

      this.#gameState = {
        FirstTeam: {
          Pokemons: this.firstTeamPokemonsStatModifier,
        },
        SecondTeam: {
          Pokemons: this.secondTeamPokemonsStatModifier,
        },
      };
    }
    const statModifier =
      this.#gameState[teamName].Pokemons[pokemonIndex].StatModifier[statName] ||
      1;

    if (statName === "Hp") {
      // Formule spécifique pour les HP
      return Math.floor(
        ((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100 + level + 10
      );
    } else {
      // Calcul de la nature
      const natureData = this.#gameData.Natures.find(
        (n) => n.Name === teamPokemon.Nature
      );
      let natureMultiplier = 1.0;
      if (natureData) {
        if (natureData.Plus.includes(statName)) {
          natureMultiplier = 1.1; // +10%
        } else if (natureData.Less.includes(statName)) {
          natureMultiplier = 0.9; // -10%
        }
      }

      // Formule standard pour les stats hors HP
      const stat = Math.floor(
        ((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100 + 5
      );

      // Application de la nature
      let calculatedStat = Math.floor(stat * natureMultiplier);

      // Application des buff/débuff de StatModifier
      calculatedStat = Math.floor(calculatedStat * statModifier);

      return calculatedStat;
    }
  }

  #getWhichTeamPlayInFirstBasedOnPokemonSpeed() {
    return this.#getCalculatedBaseStat(
      "FirstTeam",
      this.#gameData.Teams.FirstTeam.ActivePokemonIndex,
      "Speed"
    ) >
      this.#getCalculatedBaseStat(
        "SecondTeam",
        this.#gameData.Teams.SecondTeam.ActivePokemonIndex,
        "Speed"
      )
      ? "FirstTeam"
      : this.#getCalculatedBaseStat(
          "FirstTeam",
          this.#gameData.Teams.FirstTeam.ActivePokemonIndex,
          "Speed"
        ) ==
        this.#getCalculatedBaseStat(
          "SecondTeam",
          this.#gameData.Teams.SecondTeam.ActivePokemonIndex,
          "Speed"
        )
      ? this.#getRandomNumber(0, 1) === 0
        ? "FirstTeam"
        : "SecondTeam"
      : "SecondTeam";
  }
  #getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }
};
