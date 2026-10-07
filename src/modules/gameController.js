import { Player } from "./player.js";
import { Ship } from "./ship.js";

export const SHIPS = [5, 4, 3, 3, 2];

export class GameController {
  constructor(playerOne, playerTwo) {
    this.players = [playerOne, playerTwo];
    this.currentPlayer = playerOne;
    this.phase = "deployment";
    this.winner = null;
  }

  startGame() {
    if (this.phase !== "deployment")
      throw new Error("Game has already started");

    const ready = this.players.every(
      (player) => player.gameboard.ships.length === SHIPS.length,
    );

    if (!ready) throw new Error("Both players must place all ships first");

    this.currentPlayer = this.players[0];
    this.phase = "playing";
  }

  attack(coordinates) {
    if (this.phase === "deployment")
      throw new Error("The battle has not started yet");

    if (this.phase === "conclusion") {
      return {
        result: "game-over",
        attacker: this.currentPlayer,
        opponent: this.opponent,
        coordinates,
        winner: this.winner,
      };
    }

    const attacker = this.currentPlayer;
    const opponent = this.opponent;
    const result = opponent.gameboard.recieveAttack(coordinates);

    if (result === "already attacked") {
      return { result, attacker, opponent, coordinates, winner: null };
    }

    if (opponent.gameboard.isAllShipSunk()) {
      this.phase = "conclusion";
      this.winner = attacker;
    } else {
      this.currentPlayer = opponent;
    }

    return { result, attacker, opponent, coordinates, winner: this.winner };
  }

  playComputerTurn() {
    if (this.phase !== "playing" || this.currentPlayer.type !== "computer")
      return null;
    const opponent = this.opponent;
    const coordinates = this.currentPlayer.randomiseMove(opponent.gameboard);
    if (!coordinates) return null;
    return { coordinates, ...this.attack(coordinates) };
  }

  randomizeFleet(
    board,
    shipLengths = SHIPS,
    random = Math.random,
    maxAttempts = 1000,
  ) {
    board.reset();
    const randomInt = (max) => Math.floor(random() * max);

    shipLengths.forEach((length) => {
      let placed = false;

      for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
        const direction = random() < 0.5 ? "horizontal" : "vertical";
        const coords = [randomInt(board.size), randomInt(board.size)];

        try {
          board.placeShip(new Ship(length), coords, direction);
          placed = true;
        } catch (error) {
          if (!(error instanceof RangeError)) throw error;
        }
      }

      if (!placed)
        throw new Error(`Could not place a ship of length ${length}`);
    });
  }

  reset() {
    this.currentPlayer = this.players[0];
    this.phase = "deployment";
    this.winner = null;
    this.players.forEach((player) => player.gameboard.reset());
  }

  get opponent() {
    return this.currentPlayer === this.players[0]
      ? this.players[1]
      : this.players[0];
  }
}
