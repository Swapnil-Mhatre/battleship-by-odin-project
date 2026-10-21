# 🚢 Battleship

A classic single-player **Battleship** game built with vanilla JavaScript. Place your fleet, then take turns attacking the enemy's waters — whoever sinks the most ships (lands the most hits) wins.

Built following The Odin Project's Battleship curriculum, with the game logic developed test-first using Jest.

---

## ✨ Features

- **Single-player** game against a computer opponent
- **Ship placement phase** — position your fleet on the board before the battle begins
- **Interactive gameboard** — click a cell to attack; the game takes the coordinate and checks whether a ship is there
- **Hit / miss feedback** — each attack is marked on the board
- **Win detection** — the game ends when all ships on one side are sunk
- **Responsive UI** — plays well on desktop, tablet, and mobile
- **Unit-tested core logic** — `Ship`, `Gameboard`, `GameController` and `Player` classes are covered by Jest tests

---

## 🎮 How to Play

1. **Place your ships** on your grid.
2. Once all ships are placed, the **battle starts**.
3. Click a cell on the enemy's grid to **attack** that coordinate.
4. The computer then attacks your grid.
5. Keep taking turns — the first side to sink all enemy ships wins.

---

## 🛠️ Tech Stack

**JavaScript (ES6+)**
**HTML**
**CSS**
**npm**
**Babel**
**Jest**

---

## 🧱 Project Structure

```
Battleship/
│
├── src/
│   │
│   ├── modules/
│   │   ├── gameboard.js
│   │   ├── gameController.js
│   │   ├── player.js
│   │   └── ship.js
│   │
│   ├── tests/
│   │   ├── gameboard.test.js
│   │   ├── gameController.test.js
│   │   ├── player.test.js
│   │   └── ship.test.js
│   │
│   ├── dom.js
│   ├── main.js
│   └── style.css
│
├── .gitignore
├── babel.config.js
├── index.html
├── jest.config.mjs
├── package-lock.json
├── package.json
└── README.md
```

---

## 🧩 Core Classes

### `Ship`

- Validates ship length
- Tracks the number of hits
- `hit()` — registers a hit
- `isSunk()` — returns `true` when hits ≥ length

### `Gameboard`

- Holds the grid, the placed ships, and a record of missed attacks
- `placeShip()` — places a ship at given coordinates
- `receiveAttack()` — takes a coordinate, determines whether a ship was hit, and records hit or miss
- `getCellState()` — give the status of the particular cell
- `isAllShipSunk()` — reports whether every ship on the board has been sunk

### `Player`

- Has a name, type (human / computer), and its own gameboard
- `attack()` — attacks the opponent's board
- `randomiseMove()` — computer picks a random move (random function is injectable for easy testing)

### `gameController`

- Coordinates setup, turns, and win conditions between the players and the UI

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/battleship.git

# Move into the project folder
cd battleship

# Install dependencies
npm install
```

### Run the project

```bash
npm start
```

Then open the local URL shown in your terminal.

### Build for production

```bash
npm run build
```

---

## 🧪 Running Tests

Tests are written with Jest and Babel is used to handle ES module syntax.

```bash
npm test
```

---

## 🔮 Possible Future Improvements

- Smarter computer AI that targets adjacent cells after a hit
- Sound effects and animations
- Two-player mode

---

## 📚 What I Learned

- Writing unit tests first (TDD) and structuring code around testable classes
- Separating game logic from the DOM/UI
- Configuring Babel and Jest with npm
- Building a responsive interface with plain CSS and JavaScript

---

## 👤 Author

**Swapnil Mhatre**