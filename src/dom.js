import { GameController, SHIPS } from "./modules/gamecontroller.js";
import { Player } from "./modules/player.js";
import { Ship } from "./modules/ship.js";

const alphabetStr = "ABCDEFGHIJ";
const player1Board = document.querySelector(".player1-board .gameboard");
const player2Board = document.querySelector(".player2-board .gameboard");
const placementTools = document.querySelector("#placement-tools");
const startGameBtn = document.querySelector("#start-game");
const restartGameBtn = document.querySelector("#restart-game");
const gameMenu = document.querySelector(".game-menu");
const gameInfo = document.querySelector(".game-info");
const player1BoardHeader = document.querySelector(
  ".player1-board .board-header",
);
const player2BoardHeader = document.querySelector(
  ".player2-board .board-header",
);
const shipDeployment = document.querySelector("#deployed-ship");

let player1;
let player2;
let controller;
let direction;
let selectedIndex;
let computerTurn = false;
let phase = "deployment";

export function reset() {
  player1 = new Player("you", "human");
  player2 = new Player("CPU", "computer");
  controller = new GameController(player1, player2);
  phase = "deployment";
  direction = "horizontal";
  selectedIndex = 0;
  computerTurn = false;
  gameMenu.style.justifyContent = "space-between";
  placementTools.style.display = "flex";
  render("Deploy your fleet to begin the operation.");
}

function renderBoard(gameboard, { showShips, clickable }) {
  let clutter = '<span class="corner"></span>';
  const size = gameboard.size;

  for (let row = 1; row <= size; row++) {
    clutter += `<span class="axis-label">${row}</span>`;
  }

  for (let row = 0; row < size; row++) {
    clutter += `<span class="axis-label">${alphabetStr[row]}</span>`;
    for (let column = 0; column < size; column++) {
      const classes = ["cell"];
      const state = gameboard.getCellState([row, column]);

      if (state.isHit) classes.push("hit");
      if (state.isMiss) classes.push("miss");
      if (showShips && state.hasShip) classes.push("ship");

      clutter += `<button class="${classes.join(" ")}"type="button" data-coordinates="${row},${column} ${clickable ? "" : "disabled"}">${state.isHit ? '<i class="ri-close-large-line"></i>' : state.isMiss ? '<i class="ri-circle-fill"></i>' : ""}</button>`;
    }
  }

  return clutter;
}

function render(message) {
  const isDeploying = phase === "deployment";
  const isHumanTurn =
    phase === "playing" &&
    !computerTurn &&
    controller?.currentPlayer === player1;
  const deployedCounts = player1.gameboard.ships.length;
  const sunkCounts = player1.gameboard.ships.filter((ship) =>
    ship.isSunk(),
  ).length;
  const missCounts = player1.gameboard.missedAttacks;
  const player2Hits = player2.gameboard.ships.reduce(
    (sum, ship) => sum + ship.hits,
    0,
  );
  const player2Miss = player2.gameboard.missedAttacks;

  player1Board.innerHTML = renderBoard(player1.gameboard, {
    showShips: true,
    clickable: isDeploying,
  });
  player2Board.innerHTML = renderBoard(player2.gameboard, {
    showShips: false,
    clickable: isHumanTurn,
  });

  startGameBtn.hidden = !isDeploying;
  gameInfo.innerHTML = `
  <span id="phase"><i class="circle ${phase === "playing" ? "phase-playing" : "phase-deployment"}"></i> ${phase}</span>
    <p id="message">${message}</p>
    <div>
        <span class="${isHumanTurn ? "active" : ""}">Your turn</span>
        <span class="${isHumanTurn ? "" : "active"}">${phase === "deployment" ? "Wating" : phase === "conclusion" ? "completed" : "opponent"}</span>
    </div>`;

  player1BoardHeader.innerHTML = `
    <div class="left">
        <h3>Friendly Waters</h3>
        <span>${phase === "deployment" ? "Deployment Zone" : "USS constellation"} </span>
    </div>
    <div class="right">
        <h4><span>${sunkCounts}</span> sunk</h4>
        <h4><span>${missCounts}</span> missed</h4>
    </div>`;

  player2BoardHeader.innerHTML = `
    <div class="left">
        <h3>Enemy Waters</h3>
        <span>${phase === "deployment" ? "Awaiting Contact" : "Hostile Territory"}</span>
    </div>
    <div class="right">
        <h4><span>${player2Hits}</span> direct hits</h4>
        <h4><span>${player2Miss}</span> missed shots</h4>
    </div>`;

  shipDeployment.textContent = `${deployedCounts} / 5`;
}

function placeHumanShip(coordinates, direction) {
  try {
    player1.gameboard.placeShip(
      new Ship(SHIPS[selectedIndex]),
      coordinates,
      direction,
    );
    const shipLength = player1.gameboard.ships.length;
    render(`berth deployed ${shipLength} of 5 vessel ready`);
    selectedIndex = shipLength;

    if (isFleetReady()) {
      randomlyPlaceShips(player2);
    }
  } catch (err) {
    render(
      err.message === "Ships cannot overlap"
        ? "That berth overlaps another vessel."
        : "That vessel will not fit in the selected coordinates.",
    );
  }
}

function resolveAttack(coordinates) {
  const result = controller.attack(coordinates);
  const [row, column] = coordinates;
  const coordinateLabel = `${"ABCDEFGHIJ"[row]}${column + 1}`;
  if (result.result === "already attacked") {
    render(
      `${coordinateLabel} has already been targeted. Choose a fresh coordinate.`,
    );
    return;
  }
  if (result.result === "game-over") return;

  const hitShip = result.opponent.gameboard.getCellState(coordinates);
  const outcome =
    result.result === "hit"
      ? hitShip.isSunk
        ? `Direct hit at ${coordinateLabel}. Enemy vessel sunk.`
        : `Direct hit at ${coordinateLabel}.`
      : `Shot at ${coordinateLabel} missed.`;
  if (controller.phase === "conclusion") {
    phase = controller.phase;
    render(
      `${outcome} ${result.winner.name === player1.name ? "Victory" : "Defeat"}: operation complete.`,
    );
    return;
  }

  if (controller.currentPlayer === player2) {
    computerTurn = true;
    render(outcome);
    window.setTimeout(() => {
      const response = controller.playComputerTurn();
      computerTurn = false;
      if (!response) return render("Computer has no legal shots remaining.");
      const [targetRow, targetColumn] = response.coordinates;
      const target = `${"ABCDEFGHIJ"[targetRow]}${targetColumn + 1}`;
      const computerOutcome =
        response.result === "hit"
          ? response.opponent.gameboard.getCellState(response.coordinates)
              .isSunk
            ? `Enemy fired at ${target}. Your vessel was sunk.`
            : `Enemy fired at ${target}. Your vessel was hit.`
          : `Enemy fired at ${target}. No damage.`;
      if (controller.isOver) {
        phase = controller.phase;
        render(`${computerOutcome} Defeat: operation complete.`);
      } else {
        render(computerOutcome);
      }
    }, 1000);
  } else {
    render(outcome);
  }
}

function isFleetReady() {
  return player1.gameboard.ships.length === SHIPS.length;
}

function randomlyPlaceShips(player) {
  controller.randomizeFleet(player.gameboard);
  if (player.type === "human") {
    render("Ships has been randomized");
    selectedIndex = player.gameboard.ships.length;
  }
}

export function initializeDOM() {
  player1Board.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-coordinates]");

    if (cell && phase === "deployment") {
      const coordinates = event.target.dataset.coordinates
        .split(",")
        .map((coord) => Number(coord));
      placeHumanShip(coordinates, direction);
    }
  });

  player2Board.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-coordinates]");

    if (
      cell &&
      phase === "playing" &&
      controller.currentPlayer === player1 &&
      !computerTurn
    ) {
      const coordinates = event.target.dataset.coordinates
        .split(",")
        .map((coord) => Number(coord));
      resolveAttack(coordinates);
    }
  });

  placementTools.addEventListener("click", (event) => {
    const directionBtn = event.target.closest("[data-direction]");
    if (directionBtn && phase === "deployment") {
      direction = event.target.dataset.direction;
      placementTools.querySelectorAll("[data-direction]").forEach((button) => {
        const active = button === directionBtn;
        button.classList.toggle("active", active);
      });
    }

    if (event.target.closest("#reset-board")) {
      player1.gameboard.reset();
      selectedIndex = 0;
      render("Deploy your fleet to begin the operation.");
    }

    if (event.target.closest("#randomize-btn")) {
      randomlyPlaceShips(player1);
      randomlyPlaceShips(player2);
    }
  });

  startGameBtn.addEventListener("click", (event) => {
    try {
      controller.startGame();
      phase = controller.phase;
      placementTools.style.display = "none";
      gameMenu.style.justifyContent = "flex-end";
      restartGameBtn.hidden = false;
      render("Operation has begun, select a opponent coordinate to attack");
    } catch (err) {
      render(
        err.message === "Both players must place all ships first"
          ? "Place the ships to begin the operation."
          : "Game has already started",
      );
    }
  });

  restartGameBtn.addEventListener("click", () => {
    reset();
    restartGameBtn.hidden = true;
  });
}
