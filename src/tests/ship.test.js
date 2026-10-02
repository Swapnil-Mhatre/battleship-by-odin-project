import { describe, expect, it } from "@jest/globals";
import { Ship } from "../modules/ship";

describe("Ships", function () {
  it("Should Throw error on Invalid length", function () {
    expect(() => new Ship("5s")).toThrow(
      "Ship length must be a positive integer.",
    );
  });

  it("Should create a ship with length of 5 and hits 0", function () {
    const ship = new Ship(5);

    expect(ship.length).toBe(5);
    expect(ship.hits).toBe(0);
  });

  it("Should check if hits increase", function () {
    const ship = new Ship(5);

    ship.hit();

    expect(ship.hits).toBe(1);
  });

  it("Should report ship is not sunked", function () {
    const ship = new Ship(5);

    expect(ship.isSunk()).toBeFalsy();
  });

  it("Should report ship is sunked after getting hits", function () {
    const ship = new Ship(3);

    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBeTruthy();
  });

  it("Should not takes hits more than it's length", function () {
    const ship = new Ship(2);

    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.hits).toBe(2);
  });
});
