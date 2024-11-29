module.exports = class PokemonBattleEngine {
  #gameState;
  #gameData;
  #lastRoundState = { FirstTeam: {}, SecondTeam: {} };
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
    if (firstTeamChoice.Type === "UseMove") {
      const secondTeamPokemon =
        this.#gameState.SecondTeam.Pokemons[
          this.#gameState.SecondTeam.ActivePokemon
        ];
      const firstTeamPokemon =
        this.#gameState.FirstTeam.Pokemons[
          this.#gameState.FirstTeam.ActivePokemon
        ];

      const firstTeamAttack = firstTeamPokemon.MovePool.find(
        (atk) => atk.Name === firstTeamChoice.Name
      );

      const damageCalculator = this.#calculateDamage(
        firstTeamAttack,
        firstTeamPokemon,
        secondTeamPokemon
      );
      this.#lastRoundState.FirstTeam = damageCalculator;
      this.#gameState.SecondTeam.Pokemons[
        this.#gameState.SecondTeam.ActivePokemon
      ].CalculatedStat.Hp -= damageCalculator.HpLost;
    }
  }

  secondTeamChoice(secondTeamChoice) {
    if (secondTeamChoice.Type === "UseMove") {
      const secondTeamPokemon =
        this.#gameState.SecondTeam.Pokemons[
          this.#gameState.SecondTeam.ActivePokemon
        ];
      const firstTeamPokemon =
        this.#gameState.FirstTeam.Pokemons[
          this.#gameState.FirstTeam.ActivePokemon
        ];

      const secondTeamAttack = secondTeamPokemon.MovePool.find(
        (atk) => atk.Name === secondTeamChoice.Name
      );

      const damageCalculator = this.#calculateDamage(
        secondTeamAttack,
        secondTeamPokemon,
        firstTeamPokemon
      );
      this.#lastRoundState.SecondTeam = damageCalculator;
      this.#gameState.FirstTeam.Pokemons[
        this.#gameState.FirstTeam.ActivePokemon
      ].CalculatedStat.Hp -= damageCalculator.HpLost;
    }
  }
  getGameState() {
    return this.#gameState;
  }
  getLastRoundState() {
    return this.#lastRoundState;
  }
  #calculateDamage(attack, pokemonRoot, pokemonTarget) {
    const attackDetails = pokemonRoot.MovePool.find(
      (atk) => atk.Name === attack.Name
    );

    const stab = attackDetails.Type === pokemonRoot.Type ? 1.5 : 1;

    const efficacity = pokemonTarget.Type.map((targetType) => {
      const typeData = this.#gameData.Types.find(
        (type) => type.Name === targetType
      );
      if (typeData.Immune.includes(attack.Type)) return 0; // Ineffective
      if (typeData.Weakness.includes(attack.Type)) return 2; // Super effective
      if (typeData.Stronger.includes(attack.Type)) return 0.5; // Not very effective
      return 1; // Neutral
    }).reduce((acc, curr) => acc * curr, 1);

    const baseCritChance = 512;
    const critThreshold = pokemonRoot.CalculatedStat.Speed;
    const randomValue = this.#getRandomNumber(0, baseCritChance - 1);

    const critChance = randomValue < critThreshold ? 2 : 1;

    const roll = this.#getRandomNumber(85, 100) / 100;

    const finalMultiplicator = stab * efficacity * critChance * roll;

    const physicalAttackStatOrSpecial =
      attackDetails.Contact === "Physic"
        ? {
            pokemonRootCalculatedAttackStat: pokemonRoot.CalculatedStat.Attack,
            pokemonTargetCalculatedDefenseStat:
              pokemonTarget.CalculatedStat.Defense,
          }
        : {
            pokemonRootCalculatedAttackStat:
              pokemonRoot.CalculatedStat.SpeAttack,
            pokemonTargetCalculatedDefenseStat:
              pokemonTarget.CalculatedStat.SpeDefense,
          };
    const result = {
      HpLost: Math.floor(
        (((pokemonRoot.Level * 0.4 + 2) *
          physicalAttackStatOrSpecial.pokemonRootCalculatedAttackStat *
          attackDetails.Power) /
          physicalAttackStatOrSpecial.pokemonTargetCalculatedDefenseStat /
          50 +
          2) *
          finalMultiplicator
      ),
      Stab: stab,
      Efficacity: efficacity,
      IsACrit: critChance === 2,
      Roll: roll,
      DamageType: attackDetails.Contact,
    };
    return result;
  }
  #initPlayerGameStateData(teamData, teamDataState) {
    return {
      ActivePokemon: teamData.ActivePokemonIndex,
      Name: teamData.Name,
      Pokemons: teamData.Pokemons.map((item, index) => ({
        Name: item.Name,
        Status: [],
        AccuracyModifier: 1,
        Level: item.Level,
        Type: this.#gameData.Pokemons.find((pkm) => pkm.Name === item.Name)
          .Type,
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
          MaxHp: this.#getCalculatedBaseStat(
            teamData,
            teamDataState,
            index,
            "Hp"
          ),
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
