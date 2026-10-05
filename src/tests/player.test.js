import { beforeEach, describe, expect, it } from "@jest/globals";
import { Player } from "../modules/player.js";
import { Gameboard } from "../modules/gameboard.js";
import { Ship } from "../modules/ship.js";

describe("Player constructor", () => {
  it("should store name and type, and default to human", () => {
    const player = new Player("Swapnil");

    expect(player.name).toBe("Swapnil");
    expect(player.type).toBe("human");
  });

  it("should accept the computer type", () => {
    expect(new Player("CPU", "computer").type).toBe("computer");
  });

  it("should create its own Gameboard with the given size", () => {
    const player = new Player("Swapnil", "human", 5);

    expect(player.gameboard).toBeInstanceOf(Gameboard);
    expect(player.gameboard.size).toBe(5);
  });

  it("should default to a 10x10 board", () => {
    expect(new Player("Swapnil").gameboard.size).toBe(10);
  });

  it("should give each player a separate board", () => {
    const a = new Player("A");
    const b = new Player("B");

    expect(a.gameboard).not.toBe(b.gameboard);
  });

  it.each([
    ["an unknown word", "robot"],
    ["a number", 1],
    ["an empty string", ""],
  ])("should throw RangeError when type is %s", (_label, badType) => {
    expect(() => new Player("Swapnil", badType)).toThrow(RangeError);
  });

  it.each([
    ["an empty string", ""],
    ["only spaces", "   "],
    ["a number", 5],
    ["null", null],
    ["undefined", undefined],
  ])("should throw TypeError when name is %s", (_label, badName) => {
    expect(() => new Player(badName)).toThrow(TypeError);
    expect(() => new Player(badName)).toThrow("Name should be proper string");
  });
});

describe("Player attack", () => {
  let player;
  let enemy;

  beforeEach(() => {
    player = new Player("Swapnil");
    enemy = new Gameboard();
  });

  it("should return 'hit' and damage the enemy ship", () => {
    const ship = new Ship(3);
    enemy.placeShip(ship, [2, 2], "horizontal");

    expect(player.attack(enemy, [2, 3])).toBe("hit");
    expect(ship.hits).toBe(1);
  });

  it("should return 'miss' on an empty cell", () => {
    expect(player.attack(enemy, [0, 0])).toBe("miss");
  });

  it("should return 'already attacked' on a repeated cell", () => {
    player.attack(enemy, [0, 0]);

    expect(player.attack(enemy, [0, 0])).toBe("already attacked");
  });

  it("should not touch the player's own board", () => {
    player.attack(enemy, [0, 0]);

    expect(player.gameboard.getCellState([0, 0]).isAttacked).toBe(false);
  });

  it("should pass invalid coordinates through as an error", () => {
    expect(() => player.attack(enemy, [99, 99])).toThrow(RangeError);
  });
});

describe("Player randomiseMove", () => {
  let computer;

  beforeEach(() => {
    computer = new Player("CPU", "computer");
  });

  it("should return an in-bounds [row, column] pair", () => {
    const enemy = new Gameboard();
    const [row, column] = computer.randomiseMove(enemy);

    expect(Number.isInteger(row)).toBe(true);
    expect(Number.isInteger(column)).toBe(true);
    expect(row).toBeGreaterThanOrEqual(0);
    expect(row).toBeLessThan(enemy.size);
    expect(column).toBeGreaterThanOrEqual(0);
    expect(column).toBeLessThan(enemy.size);
  });

  it("should never pick a cell that was already attacked", () => {
    const enemy = new Gameboard(2);
    enemy.recieveAttack([0, 0]);
    enemy.recieveAttack([0, 1]);
    enemy.recieveAttack([1, 0]);

    expect(computer.randomiseMove(enemy)).toEqual([1, 1]);
  });

  it("should cover every cell exactly once, then throw", () => {
    const enemy = new Gameboard(3);
    const seen = new Set();

    for (let i = 0; i < 9; i++) {
      const coords = computer.randomiseMove(enemy);
      seen.add(coords.join(","));
      computer.attack(enemy, coords);
    }

    expect(seen.size).toBe(9);
    expect(() => computer.randomiseMove(enemy)).toThrow(RangeError);
  });

  it("should pick the first free cell when random returns 0", () => {
    const enemy = new Gameboard(3);

    expect(computer.randomiseMove(enemy, () => 0)).toEqual([0, 0]);

    computer.attack(enemy, [0, 0]);
    expect(computer.randomiseMove(enemy, () => 0)).toEqual([0, 1]);
  });

  it("should pick the last free cell when random is close to 1", () => {
    const enemy = new Gameboard(3);

    expect(computer.randomiseMove(enemy, () => 0.999)).toEqual([2, 2]);
  });

  it("should pick the middle cell when random returns 0.5", () => {
    const enemy = new Gameboard(3);

    expect(computer.randomiseMove(enemy, () => 0.5)).toEqual([1, 1]);
  });
});
