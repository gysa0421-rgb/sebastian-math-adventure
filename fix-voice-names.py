#!/usr/bin/env python3
from pathlib import Path

CUSTOM_DIR = Path(__file__).resolve().parent / "audio" / "custom"

RENAMES = {
    "try again.m4a": "try-again.m4a",
    "Try again.m4a": "try-again.m4a",
    "Try-again.m4a": "try-again.m4a",
    "try_again.m4a": "try-again.m4a",
}

for path in sorted(CUSTOM_DIR.iterdir()):
    if not path.is_file():
        continue
    name = path.name
    if name in RENAMES:
        target = CUSTOM_DIR / RENAMES[name]
        if not target.exists():
            path.rename(target)
            print(f"Fixed: {name} -> {RENAMES[name]}")
        continue
    if name.endswith(".m4a .m4a"):
        new_name = name.replace(".m4a .m4a", ".m4a")
        path.rename(CUSTOM_DIR / new_name)
        print(f"Fixed: {name} -> {new_name}")
    elif name.endswith(".m4a.m4a"):
        new_name = name[:-4]
        path.rename(CUSTOM_DIR / new_name)
        print(f"Fixed: {name} -> {new_name}")
