const SIZE = 6;
const HALF = SIZE / 2;
const HOLES = 18; // aantal lege vakjes in de puzzel

let solution = [];
let puzzle = [];

const board = document.getElementById("board");
const status = document.getElementById("status");
const checkBtn = document.getElementById("check-btn");
const newBtn = document.getElementById("new-btn");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isPlacementValid(grid, row, col, val) {
  // niet 3 dezelfde naast elkaar, horizontaal
  if (col >= 2 && grid[row][col - 1] === val && grid[row][col - 2] === val) return false;
  // niet 3 dezelfde naast elkaar, verticaal
  if (row >= 2 && grid[row - 1][col] === val && grid[row - 2][col] === val) return false;

  // niet meer dan de helft van de rij met dezelfde waarde
  let rowCount = 0;
  for (let c = 0; c < col; c++) if (grid[row][c] === val) rowCount++;
  if (rowCount >= HALF) return false;

  // niet meer dan de helft van de kolom met dezelfde waarde
  let colCount = 0;
  for (let r = 0; r < row; r++) if (grid[r][col] === val) colCount++;
  if (colCount >= HALF) return false;

  return true;
}

function rowsEqual(a, b) {
  return a.every((v, i) => v === b[i]);
}

function columnsEqual(grid, c1, c2) {
  for (let r = 0; r < SIZE; r++) {
    if (grid[r][c1] !== grid[r][c2]) return false;
  }
  return true;
}

function attemptGenerate() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

  function fill(pos) {
    if (pos === SIZE * SIZE) return true;
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;
    const options = Math.random() < 0.5 ? [0, 1] : [1, 0];

    for (const val of options) {
      if (!isPlacementValid(grid, row, col, val)) continue;

      grid[row][col] = val;

      if (col === SIZE - 1) {
        let duplicateRow = false;
        for (let r = 0; r < row; r++) {
          if (rowsEqual(grid[r], grid[row])) {
            duplicateRow = true;
            break;
          }
        }
        if (duplicateRow) {
          grid[row][col] = null;
          continue;
        }
      }

      if (fill(pos + 1)) return true;
      grid[row][col] = null;
    }
    return false;
  }

  if (!fill(0)) return null;

  for (let c1 = 0; c1 < SIZE; c1++) {
    for (let c2 = c1 + 1; c2 < SIZE; c2++) {
      if (columnsEqual(grid, c1, c2)) return null;
    }
  }

  return grid;
}

function generateSolvedGrid() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const grid = attemptGenerate();
    if (grid) return grid;
  }
  return attemptGenerate();
}

function makePuzzle(solvedGrid, holes) {
  const grid = solvedGrid.map((row) => [...row]);
  let removed = 0;
  while (removed < holes) {
    const row = randomInt(0, SIZE - 1);
    const col = randomInt(0, SIZE - 1);
    if (grid[row][col] !== null) {
      grid[row][col] = null;
      removed++;
    }
  }
  return grid;
}

function renderBoard() {
  board.innerHTML = "";
  status.textContent = "Vul de ontbrekende cijfers in.";

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const cell = document.createElement("input");
      cell.classList.add("cell");
      cell.maxLength = 1;
      cell.inputMode = "numeric";
      cell.dataset.row = row;
      cell.dataset.col = col;

      const value = puzzle[row][col];
      if (value !== null) {
        cell.value = value;
        cell.disabled = true;
        cell.classList.add("given");
      } else {
        cell.addEventListener("input", () => {
          cell.value = cell.value.replace(/[^01]/g, "").slice(0, 1);
        });
      }

      board.appendChild(cell);
    }
  }
}

function checkBoard() {
  const cells = board.querySelectorAll(".cell");
  let allFilled = true;
  let allCorrect = true;

  cells.forEach((cell) => {
    if (cell.disabled) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    cell.classList.remove("correct", "incorrect");

    if (!cell.value) {
      allFilled = false;
      return;
    }

    const userValue = Number(cell.value);
    if (userValue === solution[row][col]) {
      cell.classList.add("correct");
    } else {
      cell.classList.add("incorrect");
      allCorrect = false;
    }
  });

  if (allFilled) {
    recordAttempt(allCorrect);
  }

  if (!allFilled) {
    status.textContent = "Nog niet alle vakjes ingevuld.";
  } else if (allCorrect) {
    status.textContent = "Opgelost! 🎉";
  } else {
    status.textContent = "Er staan nog fouten in (rood gemarkeerd).";
  }
}

function newPuzzle() {
  solution = generateSolvedGrid();
  puzzle = makePuzzle(solution, HOLES);
  renderBoard();
}

checkBtn.addEventListener("click", checkBoard);
newBtn.addEventListener("click", newPuzzle);

newPuzzle();
