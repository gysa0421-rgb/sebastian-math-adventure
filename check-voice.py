#!/usr/bin/env python3
"""Check family voice recordings and update js/custom-manifest.js."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent
CUSTOM_DIR = ROOT / "audio" / "custom"
MANIFEST_JS = ROOT / "js" / "custom-manifest.js"

EXPECTED = [
    "good-job.m4a",
    "amazing.m4a",
    "thats-right.m4a",
    "math-star.m4a",
    "fantastic.m4a",
    "great-work.m4a",
    "brilliant.m4a",
    "you-got-it.m4a",
    "nice-try.m4a",
    "keep-going.m4a",
    "almost.m4a",
    "incredible.m4a",
    "wow-champion.m4a",
    "super-job.m4a",
    "pop-good.m4a",
    "nice-pop.m4a",
    "bubble-great.m4a",
    "fuel-up.m4a",
    "go-go.m4a",
    "rocket-power.m4a",
    "unlocked.m4a",
    "moon.m4a",
]

PHRASES = {
    "good-job.m4a": "Good job, Sebastian!",
    "amazing.m4a": "Amazing, Sebastian!",
    "thats-right.m4a": "That's right, Sebastian!",
    "math-star.m4a": "You're a math star, Sebastian!",
    "fantastic.m4a": "Fantastic, Sebastian!",
    "great-work.m4a": "Great work, Sebastian!",
    "brilliant.m4a": "Brilliant, Sebastian!",
    "you-got-it.m4a": "You got it, Sebastian!",
    "nice-try.m4a": "Nice try, Sebastian!",
    "keep-going.m4a": "Keep going, Sebastian!",
    "almost.m4a": "Almost, Sebastian!",
    "incredible.m4a": "Incredible, Sebastian!",
    "wow-champion.m4a": "Wow, Sebastian, champion!",
    "super-job.m4a": "Super job, Sebastian!",
    "pop-good.m4a": "Pop! Good, Sebastian!",
    "nice-pop.m4a": "Nice pop, Sebastian!",
    "bubble-great.m4a": "Bubble great, Sebastian!",
    "fuel-up.m4a": "Fuel up, Sebastian!",
    "go-go.m4a": "Go go go, Sebastian!",
    "rocket-power.m4a": "Rocket power, Sebastian!",
    "unlocked.m4a": "New skill unlocked, Sebastian!",
    "moon.m4a": "You reached the moon, Sebastian!",
}


def main():
    CUSTOM_DIR.mkdir(parents=True, exist_ok=True)
    found = sorted(
        f.name
        for f in CUSTOM_DIR.iterdir()
        if f.is_file() and f.suffix == ".m4a" and not f.name.endswith(".m4a.m4a")
    )

    print("Sebastian Math Adventure — Family Voice Check\n")
    print(f"Folder: {CUSTOM_DIR}\n")

    missing = [name for name in EXPECTED if name not in found]
    extra = [name for name in found if name not in EXPECTED]

    for name in EXPECTED:
        mark = "✓" if name in found else "✗"
        phrase = PHRASES.get(name, "")
        print(f"  {mark}  {name:22}  {phrase}")

    print(f"\nFound {len(found)} / {len(EXPECTED)} recordings.")

    if missing:
        print("\nStill need to record:")
        for name in missing:
            print(f"  • {name}  →  say: \"{PHRASES[name]}\"")

    if extra:
        print("\nExtra files (not in list, ignored by app):")
        for name in extra:
            print(f"  • {name}")

    lines = ["window.CUSTOM_VOICE_FILES = ["]
    for name in found:
        if name in EXPECTED:
            lines.append(f'  "{name}",')
    lines.append("];")
    lines.append("")

    MANIFEST_JS.write_text("\n".join(lines), encoding="utf-8")
    print(f"\nUpdated {MANIFEST_JS.name}")

    if len(found) >= 1:
        print("Refresh the game in your browser — Family Voice will play when Sound is on.")
    else:
        print("Put .m4a files in audio/custom/, then run this script again.")


if __name__ == "__main__":
    main()
