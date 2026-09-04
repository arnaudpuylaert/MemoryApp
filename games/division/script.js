const MIN = 1;
const MAX = 100;

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
  // Kies eerst deler en quotiënt, zodat de deling altijd exact uitkomt.
  const divisor = randomInt(MIN, MAX);
  const quotient = randomInt(MIN, MAX);
  const dividend = divisor * quotient;

  answer = quotient;
  questionEl.textContent = `${dividend} ÷ ${divisor} = ?`;
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
