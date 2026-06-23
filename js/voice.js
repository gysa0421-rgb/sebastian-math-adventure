const Voice = {
  enabled: true,
  unlocked: false,
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
    tryAgain: ["try-again.m4a"],
    win: ["incredible.m4a", "wow-champion.m4a", "super-job.m4a"],
    bubble: ["pop-good.m4a", "nice-pop.m4a", "bubble-great.m4a"],
    rocket: ["fuel-up.m4a", "go-go.m4a", "rocket-power.m4a"],
    unlock: "unlocked.m4a",
    moon: "moon.m4a",
  },

  loadCustomManifest() {
    this.availableCustom = Array.isArray(window.CUSTOM_VOICE_FILES)
      ? window.CUSTOM_VOICE_FILES
      : [];
    return Promise.resolve();
  },

  getPlayer() {
    if (!this.player) {
      this.player = document.getElementById("family-voice");
    }
    return this.player;
  },

  setEnabled(on) {
    this.enabled = on;
    const el = this.getPlayer();
    if (!on && el) el.pause();
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

  unlock() {
    const el = this.getPlayer();
    if (!el || this.unlocked || !this.enabled || !this.hasCustom()) return;
    this.unlocked = true;
    el.src = this.customPath(this.availableCustom[0]);
    el.volume = 0.01;
    el.play().catch(() => {});
  },

  playFile(path) {
    const el = this.getPlayer();
    if (!el || !this.enabled || !path) return;

    const musicWasPlaying =
      typeof Music !== "undefined" && Music.enabled && Music.isPlaying();
    if (musicWasPlaying) Music.pause();

    const restoreMusic = () => {
      el.onended = null;
      el.onerror = null;
      if (musicWasPlaying && typeof Music !== "undefined" && Music.enabled) {
        Music.play();
      }
    };

    el.onended = restoreMusic;
    el.onerror = restoreMusic;
    el.pause();
    el.currentTime = 0;
    el.src = path;
    el.volume = 1;
    el.play().catch(restoreMusic);
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
    const name = "try-again.m4a";
    if (!this.availableCustom.includes(name)) {
      this.cheerWrong();
      return;
    }
    this.playFile(this.customPath(name));
  },

  cheerWrongAttempt(attempt) {
    if (attempt <= 1) this.cheerTryAgain();
    else this.cheerWrong();
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

Voice.loadCustomManifest();
