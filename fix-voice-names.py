#!/usr/bin/env python3
from pathlib import Path

CUSTOM_DIR = Path(__file__).resolve().parent / "audio" / "custom"

for path in sorted(CUSTOM_DIR.iterdir()):
    if not path.is_file():
        continue
    name = path.name
    if name.endswith(".m4a .m4a"):
        new_name = name.replace(".m4a .m4a", ".m4a")
        path.rename(CUSTOM_DIR / new_name)
        print(f"Fixed: {name} -> {new_name}")
    elif name.endswith(".m4a.m4a"):
        new_name = name[:-4]
        path.rename(CUSTOM_DIR / new_name)
        print(f"Fixed: {name} -> {new_name}")
