import { beforeEach, describe, expect, it } from "@jest/globals";
import { Gameboard } from "../modules/gameboard.js";
import { Ship } from "../modules/ship.js";

function attackAll(board, cells) {
  cells.forEach((cell) => board.recieveAttack(cell));
}

describe("Gameboard", () => {
  it("should default to a 10x10 grid", () => {
    const board = new Gameboard();

    expect(board.size).toBe(10);
    expect(board.grid).toHaveLength(10);
    board.grid.forEach((row) => expect(row).toHaveLength(10));
  });

  it("should build a grid matching a custom size", () => {
    const board = new Gameboard(5);

    expect(board.grid).toHaveLength(5);
    board.grid.forEach((row) => expect(row).toHaveLength(5));
  });

  it("should start with every cell empty and unattacked", () => {
    const board = new Gameboard(4);

    board.grid.flat().forEach((cell) => {
      expect(cell).toEqual({ ship: null, isHit: false, isMiss: false });
    });
  });

  it("should start with no ships", () => {
    expect(new Gameboard().ships).toEqual([]);
  });

  it("should create independent cell objects (no shared references)", () => {
    const board = new Gameboard(3);

    expect(board.grid[0][0]).not.toBe(board.grid[0][1]);
    expect(board.grid[0][0]).not.toBe(board.grid[1][0]);
    expect(board.grid[0]).not.toBe(board.grid[1]);

    board.grid[0][0].isHit = true;
    expect(board.grid[0][1].isHit).toBe(false);
    expect(board.grid[1][0].isHit).toBe(false);
  });

  it.each([
    ["zero", 0],
    ["a negative number", -5],
    ["a decimal", 2.5],
    ["a string", "10"],
    ["null", null],
  ])("should throw RangeError when size is %s", (_label, badSize) => {
    expect(() => new Gameboard(badSize)).toThrow(RangeError);
  });
});

describe("Gameboard placeShip", () => {
  let board;
  beforeEach(() => {
    board = new Gameboard();
  });

  it("should put the ship into every cell it covers (horizontal)", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [2, 4], "horizontal");

    expect(board.grid[2][4].ship).toBe(ship);
    expect(board.grid[2][5].ship).toBe(ship);
    expect(board.grid[2][6].ship).toBe(ship);
  });

  it("should put the ship into every cell it covers (vertical)", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [2, 4], "vertical");

    expect(board.grid[2][4].ship).toBe(ship);
    expect(board.grid[3][4].ship).toBe(ship);
    expect(board.grid[4][4].ship).toBe(ship);
  });

  it("should leave neighbouring cells empty", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [2, 4], "horizontal");

    expect(board.grid[2][3].ship).toBeNull();
    expect(board.grid[2][7].ship).toBeNull();
    expect(board.grid[1][4].ship).toBeNull();
    expect(board.grid[3][4].ship).toBeNull();
  });

  it("should add the ship to the ships list", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [0, 0], "horizontal");

    expect(board.ships).toHaveLength(1);
    expect(board.ships[0]).toBe(ship);
  });

  it("should default to horizontal when no direction is given", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [5, 5]);

    expect(board.grid[5][5].ship).toBe(ship);
    expect(board.grid[5][6].ship).toBe(ship);
    expect(board.grid[5][7].ship).toBe(ship);
    expect(board.grid[6][5].ship).toBeNull();
  });

  it("should allow a ship to touch the last row and column", () => {
    const ship = new Ship(3);

    expect(() => board.placeShip(ship, [0, 7], "horizontal")).not.toThrow();
    expect(board.grid[0][9].ship).toBe(ship);
  });

  it("should not change the board when placement overlaps another ship", () => {
    const first = new Ship(5);
    const second = new Ship(4);
    board.placeShip(first, [3, 4], "horizontal"); 

    expect(() => board.placeShip(second, [2, 6], "vertical")).toThrow(
      RangeError,
    );

    expect(board.ships).toHaveLength(1);
    expect(board.grid[2][6].ship).toBeNull();
    expect(board.grid[4][6].ship).toBeNull();
    expect(board.grid[5][6].ship).toBeNull();
  });

  it("should not change the board when placement goes out of bounds", () => {
    const ship = new Ship(5);

    expect(() => board.placeShip(ship, [0, 7], "horizontal")).toThrow(
      RangeError,
    );

    expect(board.ships).toHaveLength(0);
    board.grid.flat().forEach((cell) => expect(cell.ship).toBeNull());
  });
});

describe("Gameboard recieveAttack", () => {
  let board;
  beforeEach(() => {
    board = new Gameboard();
  });

  it("should increase the ship's hits by one on a hit", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [2, 2], "horizontal");

    expect(board.recieveAttack([2, 2])).toBe("hit");
    expect(ship.hits).toBe(1);
  });

  it("should mark a hit cell as hit and not as a miss", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [2, 2], "horizontal");
    board.recieveAttack([2, 3]);

    expect(board.grid[2][3].isHit).toBe(true);
    expect(board.grid[2][3].isMiss).toBe(false);
  });

  it("should not count a repeated attack on the same cell", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [2, 2], "horizontal");

    board.recieveAttack([2, 2]);
    expect(board.recieveAttack([2, 2])).toBe("already attacked");
    expect(ship.hits).toBe(1);
  });

  it("should not count a repeated attack on a missed cell", () => {
    expect(board.recieveAttack([7, 7])).toBe("miss");
    expect(board.recieveAttack([7, 7])).toBe("already attacked");
  });

  it("should mark an empty cell as a miss and leave ships untouched", () => {
    const ship = new Ship(3);
    board.placeShip(ship, [2, 2], "horizontal");

    expect(board.recieveAttack([8, 8])).toBe("miss");
    expect(board.grid[8][8].isMiss).toBe(true);
    expect(board.grid[8][8].isHit).toBe(false);
    expect(ship.hits).toBe(0);
  });

  it.each([
    ["negative row", [-1, 3]],
    ["row too large", [10, 3]],
    ["column too large", [3, 10]],
    ["non-integer", [1.5, 2]],
  ])("should throw RangeError for %s", (_label, coords) => {
    expect(() => board.recieveAttack(coords)).toThrow(RangeError);
  });

  it.each([
    ["not an array", { row: 1, column: 2 }],
    ["too short", [1]],
    ["too long", [1, 2, 3]],
  ])("should throw TypeError when coordinates are %s", (_label, coords) => {
    expect(() => board.recieveAttack(coords)).toThrow(TypeError);
  });
});

describe("Gameboard isAllShipSunk", () => {
  let board;

  beforeEach(() => {
    board = new Gameboard();
  });

  it("should be false when no ships are placed", () => {
    expect(board.isAllShipSunk()).toBe(false);
  });

  it("should be false when a ship is placed but not attacked", () => {
    board.placeShip(new Ship(2), [0, 0], "horizontal");

    expect(board.isAllShipSunk()).toBe(false);
  });

  it("should be false when a ship is only damaged", () => {
    board.placeShip(new Ship(3), [0, 0], "horizontal");
    attackAll(board, [
      [0, 0],
      [0, 1],
    ]);

    expect(board.isAllShipSunk()).toBe(false);
  });

  it("should be false when only one of two ships is sunk", () => {
    board.placeShip(new Ship(2), [0, 0], "horizontal");
    board.placeShip(new Ship(2), [5, 0], "horizontal");
    attackAll(board, [
      [0, 0],
      [0, 1],
    ]);

    expect(board.isAllShipSunk()).toBe(false);
  });

  it("should be true when every ship is sunk", () => {
    board.placeShip(new Ship(2), [0, 0], "horizontal");
    board.placeShip(new Ship(3), [5, 0], "vertical");
    attackAll(board, [
      [0, 0],
      [0, 1],
      [5, 0],
      [6, 0],
      [7, 0],
    ]);

    expect(board.isAllShipSunk()).toBe(true);
  });
});

describe("Gameboard reset", () => {
  it("should clear ships, hits and misses from every cell", () => {
    const board = new Gameboard();
    board.placeShip(new Ship(3), [1, 1], "horizontal");
    board.recieveAttack([1, 1]); // hit
    board.recieveAttack([9, 9]); // miss

    board.reset();

    expect(board.ships).toEqual([]);
    board.grid.flat().forEach((cell) => {
      expect(cell).toEqual({ ship: null, isHit: false, isMiss: false });
    });
  });

  it("should allow placing a ship again where one used to be", () => {
    const board = new Gameboard();
    board.placeShip(new Ship(3), [1, 1], "horizontal");
    board.reset();

    expect(() =>
      board.placeShip(new Ship(3), [1, 1], "horizontal"),
    ).not.toThrow();
  });

  it("should keep the same board size", () => {
    const board = new Gameboard(6);
    board.reset();

    expect(board.size).toBe(6);
    expect(board.grid).toHaveLength(6);
  });
});
