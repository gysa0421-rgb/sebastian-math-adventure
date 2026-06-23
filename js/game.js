const ENCOURAGEMENTS = [
  "Amazing, Sebastian!",
  "You're a math star!",
  "So smart, Sebastian!",
  "Keep going, superstar!",
  "Fantastic work!",
  "Sebastian rocks!",
  "Brilliant!",
  "You got it!",
];

const GENTLE_WRONG = [
  "Nice try! The answer is",
  "Almost! It's",
  "Good effort! It was",
];

const QUESTIONS_PER_ROUND = 10;

const MUL_PAIRS = (() => {
  const pairs = [];
  for (let a = 1; a <= 12; a++) {
    for (let b = 1; b <= 12; b++) {
      if (a * b <= 100) pairs.push([a, b]);
    }
  }
  return pairs;
})();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function questionText(q) {
  return `${q.a} ${OPS[q.op].symbol} ${q.b} = ?`;
}

function buildWrongChoices(answer, op) {
  const wrong = new Set();
  const spread = op === "mul" || op === "div" ? 4 : 10;
  let attempts = 0;
  while (wrong.size < 3 && attempts < 40) {
    attempts += 1;
    const offset = randomInt(-spread, spread) || 1;
    const candidate = answer + offset;
    if (candidate >= 0 && candidate <= 100 && candidate !== answer) {
      wrong.add(candidate);
    }
  }
  while (wrong.size < 3) {
    const candidate = randomInt(0, 100);
    if (candidate !== answer) wrong.add(candidate);
  }
  return [...wrong];
}

function buildQuestion(op) {
  let a;
  let b;
  let answer;

  switch (op) {
    case "add": {
      answer = randomInt(0, 100);
      a = randomInt(0, answer);
      b = answer - a;
      break;
    }
    case "sub": {
      a = randomInt(0, 100);
      b = randomInt(0, a);
      answer = a - b;
      break;
    }
    case "mul": {
      [a, b] = pickRandom(MUL_PAIRS);
      answer = a * b;
      break;
    }
    case "div": {
      b = randomInt(1, 10);
      answer = randomInt(1, Math.floor(100 / b));
      a = answer * b;
      break;
    }
    default:
      return buildQuestion("add");
  }

  const choices = [answer, ...buildWrongChoices(answer, op)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return { op, a, b, answer, choices };
}

function buildPracticeQuestions(op, count = QUESTIONS_PER_ROUND) {
  const questions = [];
  while (questions.length < count) {
    questions.push(buildQuestion(op));
  }
  return questions;
}

function buildQuizQuestions(unlockedOps, count = QUESTIONS_PER_ROUND) {
  const questions = [];
  while (questions.length < count) {
    const op = pickRandom(unlockedOps);
    questions.push(buildQuestion(op));
  }
  return questions;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderHint(q) {
  const grid = document.getElementById("dot-grid");
  grid.innerHTML = "";
  if (q.op !== "mul" || q.a > 6 || q.b > 6 || q.a * q.b > 36) {
    grid.style.display = "none";
    return;
  }
  grid.style.display = "inline-grid";
  grid.style.gridTemplateColumns = `repeat(${q.b}, 14px)`;
  for (let i = 0; i < q.a * q.b; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    grid.appendChild(dot);
  }
}

function launchConfetti(big = false) {
  const container = document.getElementById("confetti");
  const colors = ["#38bdf8", "#2563eb", "#fbbf24", "#34d399", "#22d3ee"];
  const count = big ? 40 : 24;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.style.left = `${randomInt(0, 100)}%`;
    piece.style.background = pickRandom(colors);
    piece.style.animationDelay = `${randomInt(0, 400)}ms`;
    if (big) piece.style.width = "14px";
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 1800);
  }
}

function launchStarBurst() {
  const container = document.getElementById("star-burst");
  container.innerHTML = "";
  const emojis = ["⭐", "✨", "🌟"];
  for (let i = 0; i < 6; i++) {
    const star = document.createElement("span");
    star.textContent = pickRandom(emojis);
    star.style.left = `${20 + randomInt(0, 60)}%`;
    star.style.top = `${30 + randomInt(0, 20)}%`;
    star.style.animationDelay = `${i * 80}ms`;
    container.appendChild(star);
    setTimeout(() => star.remove(), 900);
  }
}

function popQuestionCard() {
  const card = document.getElementById("question-card");
  card.classList.remove("pop");
  void card.offsetWidth;
  card.classList.add("pop");
}
