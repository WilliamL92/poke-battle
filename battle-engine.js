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
      FirstTeam: this.#initPlayerGameStateData(
        this.#gameData.Teams.FirstTeam,
        null
      ),
      SecondTeam: this.#initPlayerGameStateData(
        this.#gameData.Teams.SecondTeam,
        null
      ),
    };
  }
  firstTeamChoice(firstTeamChoice) {
    return this;
  }
  getGameState() {
    return this.#gameState;
  }
  #initPlayerGameStateData(teamData, teamDataState) {
    return {
      ActivePokemon: teamData.ActivePokemonIndex,
      Pokemons: teamData.Pokemons.map((item, index) => ({
        Name: item.Name,
        Status: [],
        AccuracyModifier: 1,
        MovePool: item.MovePool.map((attack, attackIndex) => ({
          Name: attack.Name,
          PP: attack.PP,
          Description: this.#gameData.Attacks.find(
            (desc) => desc.Name === attack.Name
          ).Description,
          Power: this.#gameData.Attacks.find(
            (desc) => desc.Name === attack.Name
          ).Power,
          Accuracy: this.#gameData.Attacks.find(
            (desc) => desc.Name === attack.Name
          ).Accuracy,
          Contact: this.#gameData.Attacks.find(
            (desc) => desc.Name === attack.Name
          ).Contact,
          Type: this.#gameData.Attacks.find((desc) => desc.Name === attack.Name)
            .Type,
        })),
        StatModifier: {
          Hp: 1,
          Attack: 1,
          Defense: 1,
          SpeAttack: 1,
          SpeDefense: 1,
          Speed: 1,
        },
        CalculatedStat: {
          Hp: this.#getCalculatedBaseStat(teamData, teamDataState, index, "Hp"),
          Attack: this.#getCalculatedBaseStat(
            teamData,
            teamDataState,
            index,
            "Attack"
          ),
          Defense: this.#getCalculatedBaseStat(
            teamData,
            teamDataState,
            index,
            "Defense"
          ),
          SpeAttack: this.#getCalculatedBaseStat(
            teamData,
            teamDataState,
            index,
            "SpeAttack"
          ),
          SpeDefense: this.#getCalculatedBaseStat(
            teamData,
            teamDataState,
            index,
            "SpeDefense"
          ),
          Speed: this.#getCalculatedBaseStat(
            teamData,
            teamDataState,
            index,
            "Speed"
          ),
        },
        BaseStat: this.#gameData.Pokemons.find(
          (poke) => poke.Name === item.Name
        ).BaseStat,
      })),
    };
  }
  #getPokemonDataByIndex(team, pokemonName) {
    return this.#gameData.Teams[team].Pokemons[pokemonName];
  }
  #getCalculatedBaseStat(team, teamGameState, pokemonIndex, statName) {
    if (!team) return null;
    // Récupérer les données du Pokémon dans l'équipe par son index
    const teamPokemon = team.Pokemons[pokemonIndex];
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
      this.firstTeamPokemonsStatModifier = team.Pokemons.map((item) => ({
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
      teamGameState?.Pokemons?.[pokemonIndex]?.StatModifier?.[statName] ?? 1;

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
      this.#gameData.Teams.FirstTeam,
      this.#gameState?.FirstTeam,
      this.#gameData.Teams.FirstTeam.ActivePokemonIndex,
      "Speed"
    ) >
      this.#getCalculatedBaseStat(
        this.#gameData.Teams.SecondTeam,
        this.#gameState?.SecondTeam,
        this.#gameData.Teams.SecondTeam.ActivePokemonIndex,
        "Speed"
      )
      ? "FirstTeam"
      : this.#getCalculatedBaseStat(
          this.#gameData.Teams.FirstTeam,
          this.#gameState?.FirstTeam,
          this.#gameData.Teams.FirstTeam.ActivePokemonIndex,
          "Speed"
        ) ==
        this.#getCalculatedBaseStat(
          this.#gameData.Teams.SecondTeam,
          this.#gameState?.SecondTeam,
          this.#gameData.Teams.SecondTeam.ActivePokemonIndex,
          "Speed"
        )
      ? this.#getRandomNumber(0, 1) === 0
        ? "FirstTeam"
        : "SecondTeam"
      : "SecondTeam";
  }
  #getRandomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }
};
