#!/usr/bin/env bash
set -euo pipefail

if ! command -v pyftsubset >/dev/null 2>&1; then
  echo "pyftsubset is required (install fonttools)." >&2
  exit 1
fi

text_file="$(mktemp)"
trap 'rm -f "$text_file"' EXIT

python - "$text_file" <<'PY'
from pathlib import Path
import sys

characters = set(chr(i) for i in range(0x20, 0x250))
for root in (Path("app"), Path("src")):
    for path in root.rglob("*"):
        if path.suffix in {".ts", ".tsx", ".js", ".jsx", ".json"}:
            characters.update(path.read_text(errors="ignore"))
Path(sys.argv[1]).write_text("".join(sorted(characters)))
print(f"Subsetting {len(characters)} shipped characters")
PY

common=(
  "--text-file=$text_file"
  "--layout-features=*"
  "--name-IDs=*"
  "--name-legacy"
  "--name-languages=*"
  "--notdef-glyph"
  "--notdef-outline"
  "--recommended-glyphs"
)

pyftsubset assets/fonts/PretendardVariable.ttf \
  --output-file=assets/fonts/PretendardKJourney.ttf "${common[@]}"
pyftsubset node_modules/@expo-google-fonts/noto-serif-kr/500Medium/NotoSerifKR_500Medium.ttf \
  --output-file=assets/fonts/NotoSerifKR500KJourney.ttf "${common[@]}"
pyftsubset node_modules/@expo-google-fonts/noto-serif-kr/700Bold/NotoSerifKR_700Bold.ttf \
  --output-file=assets/fonts/NotoSerifKR700KJourney.ttf "${common[@]}"

du -h assets/fonts/*KJourney.ttf
