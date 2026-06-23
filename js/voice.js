const Voice = {
  enabled: true,
  player: null,
  availableCustom: [],

  fileNames: {
    correct: [
      "good-job.m4a",
      "amazing.m4a",
      "thats-right.m4a",
      "math-star.m4a",
      "fantastic.m4a",
      "great-work.m4a",
      "brilliant.m4a",
      "you-got-it.m4a",
    ],
    wrong: ["nice-try.m4a", "keep-going.m4a", "almost.m4a"],
    tryAgain: ["try-again.m4a", "keep-going.m4a", "almost.m4a"],
    win: ["incredible.m4a", "wow-champion.m4a", "super-job.m4a"],
    bubble: ["pop-good.m4a", "nice-pop.m4a", "bubble-great.m4a"],
    rocket: ["fuel-up.m4a", "go-go.m4a", "rocket-power.m4a"],
    unlock: "unlocked.m4a",
    moon: "moon.m4a",
  },

  async loadCustomManifest() {
    this.availableCustom = Array.isArray(window.CUSTOM_VOICE_FILES)
      ? window.CUSTOM_VOICE_FILES
      : [];
  },

  setEnabled(on) {
    this.enabled = on;
  },

  hasCustom() {
    return this.availableCustom.length > 0;
  },

  customPath(name) {
    return `audio/custom/${name}`;
  },

  clipsForCategory(category) {
    const files = this.fileNames[category];
    const list = Array.isArray(files) ? files : [files];
    const available = list.filter((f) => this.availableCustom.includes(f));
    if (available.length) return available.map((f) => this.customPath(f));
    if (this.availableCustom.length) {
      return [this.customPath(this.availableCustom[0])];
    }
    return [];
  },

  get clips() {
    return {
      correct: this.clipsForCategory("correct"),
      wrong: this.clipsForCategory("wrong"),
      tryAgain: this.clipsForCategory("tryAgain"),
      win: this.clipsForCategory("win"),
      bubble: this.clipsForCategory("bubble"),
      rocket: this.clipsForCategory("rocket"),
      unlock: this.clipsForCategory("unlock")[0],
      moon: this.clipsForCategory("moon")[0],
    };
  },

  playFile(path) {
    if (!this.enabled || !path) return;

    const clip = new Audio(path);
    clip.volume = 1;
    if (typeof Music !== "undefined") Music.duck();

    const restoreMusic = () => {
      if (typeof Music !== "undefined") Music.unduck();
    };

    clip.addEventListener("ended", restoreMusic, { once: true });
    clip.addEventListener("error", restoreMusic, { once: true });
    setTimeout(restoreMusic, 4000);

    clip.play().catch(restoreMusic);
  },

  playRandom(list) {
    if (!list?.length) return;
    this.playFile(pickRandom(list));
  },

  cheerCorrect() {
    this.playRandom(this.clips.correct);
  },

  cheerWrong() {
    this.playRandom(this.clips.wrong);
  },

  cheerTryAgain() {
    this.playRandom(this.clips.tryAgain);
  },

  cheerWin() {
    this.playRandom(this.clips.win);
  },

  cheerUnlock() {
    this.playFile(this.clips.unlock);
  },

  cheerBubblePop() {
    this.playRandom(this.clips.bubble);
  },

  cheerRocketBoost() {
    this.playRandom(this.clips.rocket);
  },

  cheerMoon() {
    this.playFile(this.clips.moon);
  },
};
