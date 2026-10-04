import { Gameboard } from "./gameboard.js";

export class Player {
  constructor(name, type = "human", boardSize = 10) {
    if (!["human", "computer"].includes(type))
      throw new RangeError("Player should be either computer or human");

    if (typeof name !== "string" || name.trim() === "")
      throw new TypeError("Name should be proper string");

    this.name = name;
    this.type = type;
    this.gameboard = new Gameboard(boardSize);
  }

  attack(enemyBoard, coordinates) {
    return enemyBoard.recieveAttack(coordinates);
  }

  randomiseMove(enemyBoard, random = Math.random) {
    const availableCells = [];

    for (let row = 0; row < enemyBoard.size; row++) {
      for (let column = 0; column < enemyBoard.size; column++) {
        if (!enemyBoard.getCellState([row, column]).isAttacked) {
          availableCells.push([row, column]);
        }
      }
    }

    if (availableCells.length === 0)
      throw new RangeError("No Available Cells left");

    return availableCells[Math.floor(random() * availableCells.length)];
  }
}
