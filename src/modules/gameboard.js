import { Ship } from "./ship.js";

export class Gameboard {
  constructor(size = 10) {
    if (!Number.isInteger(size) || size < 1) {
      throw new RangeError("Board size must be a positive integer");
    }

    this.size = size;
    this.grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({
        ship: null,
        isHit: false,
        isMiss: false,
      })),
    );
    this.missedAttacks = 0;
    this.ships = [];
  }

  placeShip(ship, coordinates, direction = "horizontal") {
    if (!(ship instanceof Ship))
      throw new TypeError("A Ship instance is required.");

    if (!["horizontal", "vertical"].includes(direction))
      throw new RangeError("Direction must be horicontal or vertical");

    const coordinatesPos = this.createCoordinates(ship, coordinates, direction);

    if (coordinatesPos.some(([row, column]) => this.grid[row][column].ship))
      throw new RangeError("Ships cannot overlap");

    coordinatesPos.forEach(
      ([row, column]) => (this.grid[row][column].ship = ship),
    );

    this.ships.push(ship);
    return ship;
  }

  recieveAttack(coordinates) {
    const [row, column] = this.#validCoordinates(coordinates);
    const cell = this.grid[row][column];
    if (cell.isHit || cell.isMiss) return "already attacked";

    if (cell.ship) {
      cell.isHit = true;
      cell.ship.hit();
      return "hit";
    }

    this.missedAttacks += 1;
    cell.isMiss = true;
    return "miss";
  }

  getCellState(coordinates) {
    const [row, column] = this.#validCoordinates(coordinates);
    const cell = this.grid[row][column];

    return {
      hasShip: Boolean(cell.ship),
      isHit: cell.isHit,
      isMiss: cell.isMiss,
      isAttacked: cell.isHit || cell.isMiss,
      isSunk: Boolean(cell.ship?.isSunk()),
    };
  }

  isAllShipSunk() {
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }

  reset() {
    this.grid.forEach((row) => {
      row.forEach((cell) => {
        cell.ship = null;
        cell.isHit = false;
        cell.isMiss = false;
      });
    });
    this.ships = [];
  }

  createCoordinates(ship, coordinates, direction) {
    const [startRow, startColumn] = this.#validCoordinates(coordinates);
    const coordinatesPos = [];

    for (let startPos = 0; startPos < ship.length; startPos++) {
      coordinatesPos.push([
        startRow + (direction === "vertical" ? startPos : 0),
        startColumn + (direction === "horizontal" ? startPos : 0),
      ]);
    }

    if (
      coordinatesPos.some(
        ([row, column]) => row >= this.size || column >= this.size,
      )
    )
      throw new RangeError("Ship has been outside the boundary");

    return coordinatesPos;
  }

  #validCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new TypeError("Coordinates must be [Row, Column] pair");
    }

    const [row, column] = coordinates;

    if (
      !Number.isInteger(row) ||
      !Number.isInteger(column) ||
      row < 0 ||
      row >= this.size ||
      column < 0 ||
      column >= this.size
    )
      throw new RangeError("Coordinates must be inside the boundary");

    return [row, column];
  }
}
