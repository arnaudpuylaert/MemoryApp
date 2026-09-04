const HOLES = 45; // aantal lege vakjes in de puzzel

let solution = [];
let puzzle = [];

const board = document.getElementById("board");
const status = document.getElementById("status");
const checkBtn = document.getElementById("check-btn");
const newBtn = document.getElementById("new-btn");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffledNumbers() {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = nums.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

function isValid(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

// Vult het rooster cel voor cel, met terugkeren (backtracking) zodra een tak vastloopt.
function generateSolvedGrid() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

  function fill(pos) {
    if (pos === 81) return true;
    const row = Math.floor(pos / 9);
    const col = pos % 9;

    for (const num of shuffledNumbers()) {
      if (isValid(grid, row, col, num)) {
        grid[row][col] = num;
        if (fill(pos + 1)) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  }

  fill(0);
  return grid;
}

function makePuzzle(solvedGrid, holes) {
  const grid = solvedGrid.map((row) => [...row]);
  let removed = 0;
  while (removed < holes) {
    const row = randomInt(0, 8);
    const col = randomInt(0, 8);
    if (grid[row][col] !== 0) {
      grid[row][col] = 0;
      removed++;
    }
  }
  return grid;
}

function renderBoard() {
  board.innerHTML = "";
  status.textContent = "Vul de ontbrekende cijfers in.";

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement("input");
      cell.classList.add("cell");
      cell.maxLength = 1;
      cell.inputMode = "numeric";
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (col % 3 === 2 && col !== 8) cell.style.borderRightWidth = "3px";
      if (row % 3 === 2 && row !== 8) cell.style.borderBottomWidth = "3px";

      const value = puzzle[row][col];
      if (value !== 0) {
        cell.value = value;
        cell.disabled = true;
        cell.classList.add("given");
      } else {
        cell.addEventListener("input", () => {
          cell.value = cell.value.replace(/[^1-9]/g, "").slice(0, 1);
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
    const userValue = Number(cell.value);

    cell.classList.remove("correct", "incorrect");

    if (!cell.value) {
      allFilled = false;
      return;
    }

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
