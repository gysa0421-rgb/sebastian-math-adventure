const STORAGE_KEY = "sebastian-math-adventure";

const OPS = {
  add: { symbol: "+", label: "Addition", emoji: "➕" },
  sub: { symbol: "−", label: "Subtraction", emoji: "➖" },
  mul: { symbol: "×", label: "Multiplication", emoji: "✖️" },
  div: { symbol: "÷", label: "Division", emoji: "➗" },
};

const UNLOCK_ORDER = ["add", "sub", "mul", "div"];

const DEFAULT_PROGRESS = {
  stars: 0,
  bestStreak: 0,
  unlockedOps: ["add"],
  masteredOps: [],
  opStats: {},
  roundsPlayed: 0,
  soundEnabled: true,
  musicEnabled: true,
  voiceMode: "custom",
};

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(DEFAULT_PROGRESS);
    const data = { ...structuredClone(DEFAULT_PROGRESS), ...JSON.parse(saved) };
    if (!data.unlockedOps.includes("add")) {
      data.unlockedOps = ["add", ...data.unlockedOps];
    }
    data.opStats = data.opStats || {};
    return data;
  } catch {
    return structuredClone(DEFAULT_PROGRESS);
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function addStars(progress, amount) {
  progress.stars += amount;
  saveProgress(progress);
  return progress;
}

function updateBestStreak(progress, streak) {
  if (streak > progress.bestStreak) {
    progress.bestStreak = streak;
    saveProgress(progress);
  }
}

function recordAnswer(progress, op, wasCorrect) {
  const key = op;
  if (!progress.opStats[key]) {
    progress.opStats[key] = { correct: 0, total: 0, rounds: 0 };
  }
  progress.opStats[key].total += 1;
  if (wasCorrect) progress.opStats[key].correct += 1;
  saveProgress(progress);
}

function recordRound(progress, op) {
  if (!progress.opStats[op]) {
    progress.opStats[op] = { correct: 0, total: 0, rounds: 0 };
  }
  progress.opStats[op].rounds += 1;
  progress.roundsPlayed += 1;
  saveProgress(progress);
}

function maybeUnlockNextOp(progress, op, correct, total) {
  const ratio = correct / total;
  if (ratio >= 0.8 && !progress.masteredOps.includes(op)) {
    progress.masteredOps.push(op);
    const idx = UNLOCK_ORDER.indexOf(op);
    if (idx >= 0 && idx < UNLOCK_ORDER.length - 1) {
      const next = UNLOCK_ORDER[idx + 1];
      if (!progress.unlockedOps.includes(next)) {
        progress.unlockedOps.push(next);
      }
    }
    saveProgress(progress);
    return true;
  }
  return false;
}
