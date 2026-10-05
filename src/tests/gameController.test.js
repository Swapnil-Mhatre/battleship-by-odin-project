import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameController } from "../modules/gameController.js";
import { Player } from "../modules/player.js";

describe("GameController phase and startGame", () => {
  let human;
  let cpu;
  let game;

  const deployBoth = () => {
    game.randomizeFleet(human.gameboard);
    game.randomizeFleet(cpu.gameboard);
  };

  beforeEach(() => {
    human = new Player("Human");
    cpu = new Player("CPU", "computer");
    game = new GameController(human, cpu);
  });

  it("should begin in the deployment phase", () => {
    expect(game.phase).toBe("deployment");
  });

  it("should refuse to start when no ships are placed", () => {
    expect(() => game.startGame()).toThrow();
    expect(game.phase).toBe("deployment");
  });

  it("should refuse to start when only one player has a full fleet", () => {
    game.randomizeFleet(cpu.gameboard);

    expect(() => game.startGame()).toThrow();
    expect(game.phase).toBe("deployment");
  });

  it("should refuse to start when a fleet is incomplete", () => {
    game.randomizeFleet(cpu.gameboard);
    game.randomizeFleet(human.gameboard, [5, 4, 3, 3]); 

    expect(() => game.startGame()).toThrow();
    expect(game.phase).toBe("deployment");
  });

  it("should switch to the playing phase when both fleets are ready", () => {
    deployBoth();
    game.startGame();

    expect(game.phase).toBe("playing");
  });

  it("should let the first player begin and keep the winner empty", () => {
    deployBoth();
    game.currentPlayer = cpu; 
    game.startGame();

    expect(game.currentPlayer).toBe(human);
    expect(game.winner).toBeNull();
  });

  it("should not allow starting the game twice", () => {
    deployBoth();
    game.startGame();

    expect(() => game.startGame()).toThrow();
  });

  it("should refuse attacks during deployment and leave the board untouched", () => {
    deployBoth();

    expect(() => game.attack([0, 0])).toThrow();
    expect(cpu.gameboard.getCellState([0, 0]).isAttacked).toBe(false);
  });

  it("should accept attacks once the game has started", () => {
    deployBoth();
    game.startGame();

    const outcome = game.attack([0, 0]);

    expect(["hit", "miss"]).toContain(outcome.result);
    expect(game.currentPlayer).toBe(cpu);
  });

  it("should not let the computer move during deployment", () => {
    deployBoth();
    game.currentPlayer = cpu;

    expect(game.playComputerTurn()).toBeNull();
  });

  it("should need a fresh fleet before starting again after a reset", () => {
    deployBoth();
    game.startGame();
    game.reset();

    expect(game.phase).toBe("deployment");
    expect(() => game.startGame()).toThrow(); 

    deployBoth();
    game.startGame();
    expect(game.phase).toBe("playing");
  });
});
