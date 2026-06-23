let progress = loadProgress();
let playState = null;

const screens = {
  home: document.getElementById("screen-home"),
  skills: document.getElementById("screen-skills"),
  play: document.getElementById("screen-play"),
  results: document.getElementById("screen-results"),
  bubble: document.getElementById("screen-bubble"),
  rocket: document.getElementById("screen-rocket"),
};

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove("active"));
  screens[name].classList.add("active");
}

window.showScreen = showScreen;

function syncSoundToggle() {
  const btn = document.getElementById("sound-toggle");
  const musicBtn = document.getElementById("music-toggle");
  if (!btn || !musicBtn) return;
  Sound.setEnabled(progress.soundEnabled);
  Voice.setEnabled(progress.soundEnabled);
  Music.setEnabled(progress.musicEnabled);
  btn.textContent = progress.soundEnabled ? "🔊 Sound & Voice On" : "🔇 Sound & Voice Off";
  musicBtn.textContent = progress.musicEnabled ? "🎵 Music On" : "🔇 Music Off";
}

function refreshHome() {
  progress = loadProgress();
  document.getElementById("total-stars").textContent = progress.stars;
  document.getElementById("best-streak").textContent = progress.bestStreak;
  syncSoundToggle();
}

function renderSkillGrid() {
  const grid = document.getElementById("skill-grid");
  grid.innerHTML = "";

  UNLOCK_ORDER.forEach((op) => {
    const info = OPS[op];
    const btn = document.createElement("button");
    btn.className = "skill-btn";
    btn.innerHTML = `<span class="skill-symbol">${info.symbol}</span><small>${info.label}</small>`;
    const unlocked = progress.unlockedOps.includes(op);
    const mastered = progress.masteredOps.includes(op);
    if (unlocked) btn.classList.add("unlocked");
    else btn.classList.add("locked");
    if (mastered) btn.classList.add("mastered");
    btn.disabled = !unlocked;
    btn.addEventListener("click", () => {
      unlockAllAudio();
      Sound.playClick();
      startPractice(op);
    });
    grid.appendChild(btn);
  });
}

function startPractice(op) {
  playState = {
    mode: "practice",
    op,
    questions: buildPracticeQuestions(op),
    index: 0,
    correct: 0,
    streak: 0,
    answered: false,
  };
  document.getElementById("play-title").textContent = OPS[op].label;
  document.getElementById("play-back-btn").dataset.go = "skills";
  showScreen("play");
  showQuestion();
}

function startQuiz() {
  playState = {
    mode: "quiz",
    op: null,
    questions: buildQuizQuestions(progress.unlockedOps),
    index: 0,
    correct: 0,
    streak: 0,
    answered: false,
  };
  document.getElementById("play-title").textContent = "Math Quest";
  document.getElementById("play-back-btn").dataset.go = "home";
  showScreen("play");
  showQuestion();
}

function showQuestion() {
  const q = playState.questions[playState.index];
  playState.answered = false;

  document.getElementById("question-text").textContent = questionText(q);
  document.getElementById("progress-text").textContent =
    `Question ${playState.index + 1} of ${playState.questions.length}`;
  document.getElementById("progress-fill").style.width =
    `${(playState.index / playState.questions.length) * 100}%`;

  const streakEl = document.getElementById("streak-badge");
  streakEl.textContent = `🔥 Streak: ${playState.streak}`;
  streakEl.classList.toggle("on-fire", playState.streak >= 3);

  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback";
  document.getElementById("next-btn").classList.add("hidden");

  renderHint(q);

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";
  q.choices.forEach((value) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = value;
    btn.addEventListener("click", () => handleAnswer(btn, value, q.answer, q.op));
    choicesEl.appendChild(btn);
  });
}

function handleAnswer(btn, chosen, answer, opForStats) {
  if (playState.answered) return;
  playState.answered = true;

  const buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach((b) => (b.disabled = true));

  const feedback = document.getElementById("feedback");
  const statsOp = playState.mode === "practice" ? playState.op : opForStats;

  if (chosen === answer) {
    playState.correct += 1;
    playState.streak += 1;
    btn.classList.add("correct");
    feedback.textContent = pickRandom(ENCOURAGEMENTS);
    feedback.classList.add("bounce", "happy");
    popQuestionCard();
    launchStarBurst();
    launchConfetti(playState.streak >= 5);
    Sound.playCorrect();
    Voice.cheerCorrect();
    recordAnswer(progress, statsOp, true);
  } else {
    playState.streak = 0;
    btn.classList.add("wrong");
    buttons.forEach((b) => {
      if (Number(b.textContent) === answer) b.classList.add("correct");
    });
    feedback.textContent = `${pickRandom(GENTLE_WRONG)} ${answer}.`;
    feedback.classList.add("gentle");
    Sound.playWrong();
    Voice.cheerWrongAttempt(1);
    recordAnswer(progress, statsOp, false);
  }

  updateBestStreak(progress, playState.streak);
  const streakEl = document.getElementById("streak-badge");
  streakEl.textContent = `🔥 Streak: ${playState.streak}`;
  streakEl.classList.toggle("on-fire", playState.streak >= 3);
  document.getElementById("next-btn").classList.remove("hidden");
}

function finishRound() {
  const total = playState.questions.length;
  const correct = playState.correct;
  const starsEarned = correct;
  addStars(progress, starsEarned);

  let mastered = false;
  if (playState.mode === "practice" && playState.op) {
    recordRound(progress, playState.op);
    mastered = maybeUnlockNextOp(progress, playState.op, correct, total);
    if (mastered) Sound.playUnlock();
    if (mastered) Voice.cheerUnlock();
  } else {
    progress.roundsPlayed += 1;
    saveProgress(progress);
  }

  document.getElementById("progress-fill").style.width = "100%";

  const ratio = correct / total;
  let emoji = "🌟";
  let title = "Good job, Sebastian!";
  let message = `You got ${correct} out of ${total} correct.`;

  if (ratio >= 0.9) {
    emoji = "🏆";
    title = "Incredible, Sebastian!";
    message = "You're a math champion!";
    launchConfetti(true);
    Voice.cheerWin();
  } else if (ratio >= 0.7) {
    emoji = "🎉";
    title = "Great work, Sebastian!";
  }

  if (mastered) {
    const nextIdx = UNLOCK_ORDER.indexOf(playState.op) + 1;
    const nextOp = UNLOCK_ORDER[nextIdx];
    const nextLabel = nextOp ? OPS[nextOp].label : "";
    message += ` You mastered ${OPS[playState.op].label}!`;
    if (nextLabel) message += ` ${nextLabel} unlocked!`;
    emoji = "⭐";
    launchConfetti(true);
  }

  document.getElementById("results-emoji").textContent = emoji;
  document.getElementById("results-title").textContent = title;
  document.getElementById("results-message").textContent = message;
  document.getElementById("results-correct").textContent = correct;
  document.getElementById("results-stars").textContent = `+${starsEarned}`;

  refreshHome();
  showScreen("results");
}

function finishMinigame(gameId, correct, total) {
  const starsEarned = correct;
  addStars(progress, starsEarned);

  playState = { mode: gameId, correct, total };

  const ratio = correct / total;
  let emoji = "🌟";
  let title = "Good job, Sebastian!";
  let message = `You got ${correct} out of ${total} correct.`;

  if (gameId === "bubble") {
    title = correct >= 6 ? "Bubble Master!" : "Nice popping, Sebastian!";
    emoji = correct >= 6 ? "🫧" : "💫";
    if (correct >= 6) Voice.cheerWin();
  } else if (gameId === "rocket") {
    if (correct >= total) {
      emoji = "🌙";
      title = "You reached the Moon!";
      message = "Sebastian the astronaut! All fuel stops complete!";
      launchConfetti(true);
      Sound.playUnlock();
      Voice.cheerMoon();
    } else {
      emoji = "🚀";
      title = "Great flight, Sebastian!";
      message = `You reached ${correct} of ${total} fuel stops. Try again!`;
    }
  }

  if (ratio >= 0.9 && gameId !== "rocket") {
    launchConfetti(true);
  }

  document.getElementById("results-emoji").textContent = emoji;
  document.getElementById("results-title").textContent = title;
  document.getElementById("results-message").textContent = message;
  document.getElementById("results-correct").textContent = correct;
  document.getElementById("results-stars").textContent = `+${starsEarned}`;

  refreshHome();
  showScreen("results");
}

function navigate(target) {
  if (target === "home") {
    refreshHome();
    showScreen("home");
  } else if (target === "skills") {
    progress = loadProgress();
    renderSkillGrid();
    showScreen("skills");
  } else if (target === "quiz") {
    Sound.playClick();
    startQuiz();
  }
}

document.querySelectorAll("[data-go]").forEach((el) => {
  el.addEventListener("click", () => {
    unlockAllAudio();
    Sound.playClick();
    navigate(el.dataset.go);
  });
});

document.getElementById("sound-toggle")?.addEventListener("click", () => {
  progress.soundEnabled = !progress.soundEnabled;
  saveProgress(progress);
  syncSoundToggle();
  unlockAllAudio();
  if (progress.soundEnabled) Sound.playClick();
});

document.getElementById("music-toggle")?.addEventListener("click", () => {
  progress.musicEnabled = !progress.musicEnabled;
  saveProgress(progress);
  syncSoundToggle();
  unlockAllAudio();
  if (progress.musicEnabled) Music.play();
});

function unlockAllAudio() {
  Sound.init();
  Voice.unlock();
  if (progress.musicEnabled) Music.play();
}

document.body.addEventListener("touchend", unlockAllAudio, { passive: true });
document.body.addEventListener("click", unlockAllAudio);

document.getElementById("next-btn").addEventListener("click", () => {
  Sound.playClick();
  if (playState.index < playState.questions.length - 1) {
    playState.index += 1;
    showQuestion();
  } else {
    finishRound();
  }
});

document.getElementById("play-again-btn").addEventListener("click", () => {
  Sound.playClick();
  if (!playState) return;
  if (playState.mode === "quiz") startQuiz();
  else if (playState.mode === "practice" && playState.op) startPractice(playState.op);
  else if (playState.mode === "bubble") startBubbleGame(progress.unlockedOps);
  else if (playState.mode === "rocket") startRocketGame(progress.unlockedOps);
});

initMinigames(finishMinigame);

async function bootVoice() {
  try {
    await Voice.loadCustomManifest();
    Music.init();
    refreshHome();
  } catch (err) {
    console.error("Boot failed:", err);
    refreshHome();
  }
}

bootVoice();
