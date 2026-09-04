const TABLE_MIN = 1;
const TABLE_MAX = 20;
const FACTOR_MIN = 1;
const FACTOR_MAX = 10;

let answer = 0;
let score = 0;
let attempts = 0;

const questionEl = document.getElementById("question");
const inputEl = document.getElementById("answer");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const form = document.getElementById("answer-form");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newQuestion() {
  const table = randomInt(TABLE_MIN, TABLE_MAX);
  const factor = randomInt(FACTOR_MIN, FACTOR_MAX);
  answer = table * factor;
  questionEl.textContent = `${table} × ${factor} = ?`;
  inputEl.value = "";
  feedbackEl.textContent = "";
  inputEl.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  attempts++;
  const userAnswer = Number(inputEl.value);
  recordAttempt(userAnswer === answer);

  if (userAnswer === answer) {
    score++;
    feedbackEl.textContent = "Correct! ✅";
    feedbackEl.style.color = "#4f7a58";
  } else {
    feedbackEl.textContent = `Fout. Het juiste antwoord was ${answer}.`;
    feedbackEl.style.color = "#a83f52";
  }

  scoreEl.textContent = `Score: ${score}/${attempts}`;
  setTimeout(newQuestion, 1200);
});

newQuestion();
