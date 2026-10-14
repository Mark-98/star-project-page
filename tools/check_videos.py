#!/usr/bin/env python3
"""Validate expected MP4 paths for the STAR GitHub Pages gallery."""
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "video_manifest.json").read_text(encoding="utf-8"))
missing = []
found = []
large = []
for clip in manifest:
    path = root / clip["path"]
    if path.is_file():
        found.append(path)
        if path.stat().st_size > 100 * 1024 * 1024:
            large.append(path)
    else:
        missing.append(clip["path"])
print(f"Video inventory: {len(found)}/{len(manifest)} found; {len(missing)} missing.")
for path in missing:
    print("MISSING", path)
for path in large:
    print("WARNING >100 MiB", path.relative_to(root))
if found:
    total = sum(p.stat().st_size for p in found)
    print(f"Video size: {total / (1024**3):.2f} GiB")
if not missing:
    print("All expected files are present.")
