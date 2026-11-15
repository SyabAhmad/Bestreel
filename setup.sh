#!/usr/bin/env bash
# beatreel setup. Safe to run again.   usage: bash setup.sh [--sfx]
#   Python packages, the Kokoro voice model (~340 MB, cached in ~/.cache/beatreel/tts), GSAP (npm), the icon sets
#   (~30 MB), and checks for ffmpeg, node/npx and a headless Chrome. --sfx also installs earshot (sound effects).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
CACHE="${BEATREEL_CACHE:-$HOME/.cache/beatreel}"

echo "python packages ..."
python3 -m pip install -q -r "$HERE/requirements.txt" 2>/dev/null || python3 -m pip install -q --break-system-packages -r "$HERE/requirements.txt"

echo "voice model ..."
TTS="${BEATREEL_TTS:-$CACHE/tts}"; mkdir -p "$TTS"
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "$TTS/$f" ] || curl -fL --retry 3 -o "$TTS/$f" "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
done

echo "gsap ..."
( cd "$HERE" && npm install --no-audit --no-fund -s )

echo "icons ..."
ICONS="${BEATREEL_ICONS:-$CACHE/icons}"; mkdir -p "$ICONS"
[ -d "$ICONS/node_modules/@iconify-json/logos" ] || npm i -s --no-audit --no-fund --prefix "$ICONS" \
  @iconify-json/logos @iconify-json/simple-icons @iconify-json/devicon @iconify-json/lucide @iconify-json/tabler @iconify-json/fluent-emoji-flat \
  || echo "WARN: icon install failed; icons will be fetched on first use" >&2

if [ "${1:-}" = "--sfx" ]; then
  echo "earshot (sound effects) ..."
  E="$CACHE/earshot"
  if [ ! -x "$E/.venv/bin/earshot" ]; then
    rm -rf "$E"; git clone -q --depth 1 https://github.com/Leonxlnx/earshot.git "$E"
    ( cd "$E" && python3 -m venv .venv && .venv/bin/pip install -q -e . ) || echo "WARN: earshot install failed; reels render without sound effects" >&2
  fi
fi

command -v ffmpeg >/dev/null || echo "WARN: ffmpeg is missing (macOS: brew install ffmpeg; Debian/Ubuntu: apt install ffmpeg)" >&2
command -v npx >/dev/null || echo "WARN: node/npx is missing (https://nodejs.org); HyperFrames renders through npx" >&2
found=""
for c in "${HYPERFRAMES_BROWSER_PATH:-}" "${PLAYWRIGHT_BROWSERS_PATH:-/nonexistent}"/chromium_headless_shell-*/chrome-*/chrome-headless-shell \
         "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-*/chrome-headless-shell "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-*/chrome-headless-shell; do
  [ -n "$c" ] && [ -x "$c" ] && found="$c"
done
[ -n "$found" ] || echo "NOTE: no headless Chrome found; HyperFrames will fetch one (or run: npx playwright install chromium-headless-shell)" >&2
echo "done. Try: python3 beatreel.py make examples/coffee/coffee.json"
