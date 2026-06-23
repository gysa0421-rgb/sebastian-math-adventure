const MINIGAME_ROUNDS = 8;

const BUBBLE_RETRY = [
  "Try again!",
  "Almost! Pick another bubble!",
  "Keep going, Sebastian!",
  "You can do it!",
];

let bubbleState = null;
let rocketState = null;
let onMinigameComplete = null;

function initMinigames(completeCallback) {
  onMinigameComplete = completeCallback;

  document.getElementById("start-bubble-btn").addEventListener("click", () => {
    Sound.playClick();
    startBubbleGame();
  });

  document.getElementById("start-rocket-btn").addEventListener("click", () => {
    Sound.playClick();
    startRocketGame();
  });
}

function startBubbleGame(unlockedOps) {
  const ops = unlockedOps || loadProgress().unlockedOps;
  bubbleState = {
    round: 0,
    correct: 0,
    questions: buildQuizQuestions(ops, MINIGAME_ROUNDS),
    locked: false,
  };
  window.showScreen("bubble");
  showBubbleRound();
}

function showBubbleRound() {
  if (bubbleState.round >= MINIGAME_ROUNDS) {
    endBubbleGame();
    return;
  }

  bubbleState.locked = false;
  const q = bubbleState.questions[bubbleState.round];
  document.getElementById("bubble-question").textContent = questionText(q);
  document.getElementById("bubble-feedback").textContent = "";
  document.getElementById("bubble-score").textContent =
    `Score: ${bubbleState.correct} / ${MINIGAME_ROUNDS}`;
  updateBubbleProgress();

  const arena = document.getElementById("bubble-arena");
  arena.innerHTML = "";

  const values = shuffle([...q.choices]);
  while (values.length < 5) {
    const extra = q.answer + randomInt(-6, 6);
    if (extra >= 0 && extra <= 100 && !values.includes(extra)) values.push(extra);
  }

  shuffle(values.slice(0, 5)).forEach((value, i) => {
    const bubble = document.createElement("button");
    bubble.className = "game-bubble";
    bubble.textContent = value;
    bubble.style.animationDelay = `${i * 0.15}s`;
    bubble.addEventListener("click", () => popBubble(bubble, value, q));
    arena.appendChild(bubble);
  });
}

function spawnBubbleBurst(bubble, arena) {
  const arenaRect = arena.getBoundingClientRect();
  const bubbleRect = bubble.getBoundingClientRect();
  const cx = bubbleRect.left + bubbleRect.width / 2 - arenaRect.left;
  const cy = bubbleRect.top + bubbleRect.height / 2 - arenaRect.top;
  const size = bubbleRect.width;
  const screen = document.getElementById("screen-bubble");

  const mega = document.createElement("span");
  mega.className = "bubble-mega-burst";
  mega.style.left = `${cx}px`;
  mega.style.top = `${cy}px`;
  arena.appendChild(mega);
  setTimeout(() => mega.remove(), 900);

  const bigCheer = document.createElement("span");
  bigCheer.className = "bubble-celebration mega";
  bigCheer.textContent = "🎉";
  bigCheer.style.left = `${cx}px`;
  bigCheer.style.top = `${cy}px`;
  arena.appendChild(bigCheer);
  setTimeout(() => bigCheer.remove(), 1050);

  for (let r = 0; r < 5; r++) {
    const ripple = document.createElement("span");
    ripple.className = "bubble-ripple";
    ripple.style.left = `${cx}px`;
    ripple.style.top = `${cy}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.animationDelay = `${r * 0.06}s`;
    arena.appendChild(ripple);
    setTimeout(() => ripple.remove(), 950);
  }

  for (let i = 0; i < 30; i++) {
    const spark = document.createElement("span");
    spark.className = "bubble-gold-spark";
    const angle = (Math.PI * 2 * i) / 30 + randomInt(-10, 10) * 0.01;
    const dist = randomInt(70, 150);
    const rot = (angle * 180) / Math.PI;
    spark.style.left = `${cx}px`;
    spark.style.top = `${cy}px`;
    spark.style.setProperty("--rot", `${rot}deg`);
    spark.style.setProperty("--len", `${randomInt(14, 32)}px`);
    spark.style.setProperty("--thick", `${randomInt(3, 5)}px`);
    spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    spark.style.animationDelay = `${randomInt(0, 80)}ms`;
    arena.appendChild(spark);
    setTimeout(() => spark.remove(), 900);
  }

  for (let i = 0; i < 20; i++) {
    const dot = document.createElement("span");
    dot.className = "bubble-gold-dot";
    const angle = randomInt(0, 360) * (Math.PI / 180);
    const dist = randomInt(45, 120);
    const dotSize = randomInt(6, 14);
    dot.style.left = `${cx}px`;
    dot.style.top = `${cy}px`;
    dot.style.width = `${dotSize}px`;
    dot.style.height = `${dotSize}px`;
    dot.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    dot.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    dot.style.animationDelay = `${randomInt(0, 100)}ms`;
    arena.appendChild(dot);
    setTimeout(() => dot.remove(), 850);
  }

  const celebrationEmojis = ["✨", "⭐", "🌟", "🎉", "🎊"];
  for (let i = 0; i < 14; i++) {
    const cheer = document.createElement("span");
    cheer.className = "bubble-celebration";
    cheer.textContent = pickRandom(celebrationEmojis);
    const angle = randomInt(0, 360) * (Math.PI / 180);
    const dist = randomInt(40, 100);
    cheer.style.left = `${cx}px`;
    cheer.style.top = `${cy}px`;
    cheer.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    cheer.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    cheer.style.animationDelay = `${i * 30}ms`;
    arena.appendChild(cheer);
    setTimeout(() => cheer.remove(), 1000);
  }

  arena.classList.add("burst-flash", "shake");
  if (screen) screen.classList.add("celebrate");
  setTimeout(() => {
    arena.classList.remove("burst-flash", "shake");
    if (screen) screen.classList.remove("celebrate");
  }, 650);

  arena.querySelectorAll(".game-bubble:not(.pop)").forEach((b) => {
    b.classList.add("fade-away");
  });
}

function popBubble(bubble, value, q) {
  if (bubbleState.locked) return;
  bubbleState.locked = true;

  const feedback = document.getElementById("bubble-feedback");
  const arena = document.getElementById("bubble-arena");

  if (value === q.answer) {
    bubbleState.correct += 1;
    bubble.classList.add("pop");
    spawnBubbleBurst(bubble, arena);
    const questionEl = document.getElementById("bubble-question");
    questionEl.classList.remove("pop-success");
    void questionEl.offsetWidth;
    questionEl.classList.add("pop-success");
    feedback.textContent = pickRandom(ENCOURAGEMENTS);
    feedback.className = "feedback bounce happy";
    Sound.playBubblePop();
    Voice.cheerBubblePop();
    launchConfetti(true, true);
    recordAnswer(loadProgress(), q.op, true);
    setTimeout(() => {
      bubbleState.round += 1;
      showBubbleRound();
    }, 1050);
  } else {
    bubble.classList.add("burst-wrong");
    bubble.disabled = true;
    feedback.textContent = pickRandom(BUBBLE_RETRY);
    feedback.className = "feedback gentle bounce";
    Sound.playWrong();
    Voice.cheerTryAgain();
    setTimeout(() => {
      bubble.remove();
      bubbleState.locked = false;
    }, 550);
  }
}

function updateBubbleProgress() {
  document.getElementById("bubble-lives").textContent =
    `Round ${bubbleState.round + 1} of ${MINIGAME_ROUNDS}`;
}

function endBubbleGame() {
  const progress = loadProgress();
  progress.roundsPlayed += 1;
  saveProgress(progress);
  onMinigameComplete("bubble", bubbleState.correct, MINIGAME_ROUNDS);
}

function startRocketGame(unlockedOps) {
  const ops = unlockedOps || loadProgress().unlockedOps;
  rocketState = {
    round: 0,
    correct: 0,
    questions: buildQuizQuestions(ops, MINIGAME_ROUNDS),
    answered: false,
  };
  window.showScreen("rocket");
  updateRocketVisual();
  showRocketRound();
}

function updateRocketVisual() {
  const pct = (rocketState.correct / MINIGAME_ROUNDS) * 100;
  document.getElementById("rocket-ship").style.bottom = `${8 + pct * 0.75}%`;
  document.getElementById("rocket-fuel-fill").style.width = `${pct}%`;
}

function showRocketRound() {
  if (rocketState.round >= MINIGAME_ROUNDS) {
    endRocketGame();
    return;
  }

  rocketState.answered = false;
  const q = rocketState.questions[rocketState.round];
  document.getElementById("rocket-question").textContent = questionText(q);
  document.getElementById("rocket-progress").textContent =
    `Stop ${rocketState.round + 1} of ${MINIGAME_ROUNDS}`;
  document.getElementById("rocket-feedback").textContent = "";
  document.getElementById("rocket-feedback").className = "feedback";

  const choicesEl = document.getElementById("rocket-choices");
  choicesEl.innerHTML = "";
  q.choices.forEach((value) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = value;
    btn.addEventListener("click", () => handleRocketAnswer(btn, value, q));
    choicesEl.appendChild(btn);
  });
}

function handleRocketAnswer(btn, chosen, q) {
  if (rocketState.answered) return;
  rocketState.answered = true;

  const buttons = document.querySelectorAll("#rocket-choices .choice-btn");
  buttons.forEach((b) => (b.disabled = true));

  const feedback = document.getElementById("rocket-feedback");

  if (chosen === q.answer) {
    rocketState.correct += 1;
    btn.classList.add("correct");
    feedback.textContent = "Fuel up! 🚀";
    feedback.className = "feedback bounce happy";
    Sound.playCorrect();
    Voice.cheerRocketBoost();
    launchConfetti();
    recordAnswer(loadProgress(), q.op, true);
    updateRocketVisual();
    document.getElementById("rocket-ship").classList.add("boost");
    setTimeout(() => document.getElementById("rocket-ship").classList.remove("boost"), 400);
  } else {
    btn.classList.add("wrong");
    buttons.forEach((b) => {
      if (Number(b.textContent) === q.answer) b.classList.add("correct");
    });
    feedback.textContent = `Not enough fuel! Answer: ${q.answer}`;
    feedback.className = "feedback gentle";
    Sound.playWrong();
    Voice.cheerWrong();
    recordAnswer(loadProgress(), q.op, false);
  }

  setTimeout(() => {
    rocketState.round += 1;
    showRocketRound();
  }, 900);
}

function endRocketGame() {
  const progress = loadProgress();
  progress.roundsPlayed += 1;
  saveProgress(progress);
  if (rocketState.correct >= MINIGAME_ROUNDS) Sound.playUnlock();
  onMinigameComplete("rocket", rocketState.correct, MINIGAME_ROUNDS);
}
