const Music = {
  enabled: true,
  player: null,
  starting: false,
  normalVolume: 0.1,
  duckVolume: 0.03,

  init() {
    if (!this.player) {
      this.player = document.getElementById("bg-music");
      if (this.player) this.player.volume = this.normalVolume;
    }
  },

  duck() {
    this.init();
    if (this.player && !this.player.paused) {
      this.player.volume = this.duckVolume;
    }
  },

  unduck() {
    this.init();
    if (this.player && this.enabled) {
      this.player.volume = this.normalVolume;
    }
  },

  setEnabled(on) {
    this.enabled = on;
    if (!on) this.pause();
  },

  play() {
    if (!this.enabled || this.starting) return;
    this.init();
    if (!this.player) return;

    this.starting = true;
    const playNow = () => {
      this.player
        .play()
        .catch(() => {})
        .finally(() => {
          this.starting = false;
        });
    };

    if (this.player.readyState >= 2) {
      playNow();
      return;
    }

    const onReady = () => {
      this.player.removeEventListener("canplaythrough", onReady);
      this.player.removeEventListener("error", onFail);
      playNow();
    };
    const onFail = () => {
      this.player.removeEventListener("canplaythrough", onReady);
      this.player.removeEventListener("error", onFail);
      this.starting = false;
    };

    this.player.addEventListener("canplaythrough", onReady, { once: true });
    this.player.addEventListener("error", onFail, { once: true });
    this.player.load();
  },

  pause() {
    this.init();
    if (this.player) this.player.pause();
  },

  isPlaying() {
    this.init();
    return !!(this.player && !this.player.paused);
  },
};
