# beatreel

Make vertical explainer videos (1080×1920, 30 fps) from a JSON script. You write the lines; beatreel speaks them,
puts the words on screen as they are said, and gives every idea its own animated scene, with a talking presenter
at the bottom.

```
script.json  →  voice (Kokoro, offline)  →  word timings  →  HTML + GSAP page  →  HyperFrames render  →  mix  →  video.mp4
```

It runs entirely on your machine. No accounts, no API keys, no cloud voice.

Sample renders: [docs/coffee.mp4](docs/coffee.mp4), [docs/cold-battery.mp4](docs/cold-battery.mp4) and
[docs/tour.mp4](docs/tour.mp4) (a catalogue of the scenes).

## What it has

- **A voice**: [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M), 50+ stock voices, with a pronunciation
  checker that lists every word it had to guess (`./beatreel say "..."`), so names, acronyms and prices
  come out right.
- **Word-synced captions**: each word pops in as it is spoken, key words (`_like this_`) get a highlight.
- **One idea per beat, cut into shots**: about 60 animated scenes (cards, numbers that roll, terminals that type, checklists that
  tick, code that scrolls, charts, gauges, a world map, dominoes, status boards, file conversions, star bursts,
  follow cards ...). Every piece lands on the word that names it (`"at": "word:checklist"`), entrances vary
  from shot to shot, impacts shake the frame and throw sparks, and every scene is scaled to fit the frame.
- **Kai**, an original presenter drawn in code, on screen the whole video: lip movement on every word, blinks,
  25+ poses and moods (`docs/kai-poses.jpg`), and he moves between left, centre and right along the bottom.
  Recolour him, swap in your own character, or leave him out.
- **Sound effects built in**: 12 short code-made sounds (pops, ticks, a whoosh, an impact, typing, chimes) in
  `engine/sfx/`, placed on every entrance, tick and impact. `"sfx": false` turns them off.
- **Three looks**: `studio` (plain white, default), `night` (dark), `paper` (plain base). All colours are CSS
  variables you can change.
- **Optional extras**: a quiet code-made music bed (`"music": {"style": "soft"}`), any of earshot's 250+
  sounds through [earshot](https://github.com/Leonxlnx/earshot) (`"sfx_id"` on a scene), your own intro sound, pre-rendered clips with
  transparency (for example 3D shots).
- **A frames sheet** before the full render (`board`), so you can check every beat in one picture.

## What it doesn't have

- No timeline editor or GUI: the script is the edit.
- No AI script writing or research: you (or your coding agent) write the lines.
- No stock footage or image generation: it animates what you give it.
- No voice cloning, and no cloud TTS.
- No auto-posting to Instagram, TikTok or YouTube.
- Vertical 1080×1920 only.

## Install

Needs Python 3.10-3.13, Node 18+ and ffmpeg. On a Mac: `brew install python@3.12 node ffmpeg` (the `python3`
that ships with macOS is 3.9, which is too old; setup finds the newer one by itself).

```bash
git clone https://github.com/anand-reddi/beatreel && cd beatreel
bash setup.sh            # .venv with the python packages, voice model (~340 MB), gsap, icons, headless Chrome
bash setup.sh --sfx      # optional: also install earshot for sound effects
```

`./beatreel ...` runs with the Python that setup installed. HyperFrames renders through a headless Chrome; setup
installs one with Playwright, or point `HYPERFRAMES_BROWSER_PATH` at your own.

## Make your first video

```bash
./beatreel board examples/coffee/coffee.json   # voice + a frames sheet: examples/coffee/coffee-frames.jpg
./beatreel make  examples/coffee/coffee.json   # the video: examples/coffee/coffee.mp4
```

A script is a list of beats. Each beat has the lines it says and the scene that shows them:

```json
{
 "name": "coffee",
 "theme": "studio",
 "beats": [
  {"pose": "point_up",
   "lines": ["Coffee doesn't give you energy.", "It _hides_ how tired you are."],
   "shots": [
    {"type": "card", "icon": "fluent-emoji-flat:hot-beverage", "title": "Energy?"},
    {"type": "sticker", "lines": ["IT HIDES", "THE TIRED"], "red": true, "at": "word:hides"}
   ]},
  {"pose": "count",
   "lines": ["About half of it is still in you five hours later."],
   "hero": {"type": "num", "value": 5, "suffix": " hrs", "label": "time to clear half the caffeine", "at": "word:five"}}
 ]
}
```

`hero` is one scene (or a list shown together) for the whole beat; `shots` is a list of scenes that cut from one to
the next, each starting on its `at`. The full reference (every scene type and key) is in [SKILL.md](SKILL.md).

## Examples

| | |
|---|---|
| `examples/coffee/` | 21 s, two shots per beat, Kai on every frame, sound effects |
| `examples/cold-battery/` | 23 s, a different voice (`am_michael`) and the music bed |
| `examples/tour/` | 34 s, no presenter, one beat per scene type: a quick catalogue of what the engine draws |

## Voice

```json
"voice": {"name": "af_heart", "speed": 1.0, "say": {"SQL": "sequel", "Nguyen": "/wˈɪn/"}}
```

`name` is any Kokoro voice: American `af_heart`, `af_bella`, `af_nicole`, `am_michael`, `am_fenrir` ...,
British `bf_emma`, `bm_george` ... (the full list is on the
[Kokoro model card](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md)). `say` fixes a word for this
script, either as plain respelling or as phonemes between slashes; `core/lexicon.json` holds fixes for every script.
After each run, `build/<name>/pronounce.txt` lists every word the voice guessed.

## Look

`"theme": "studio" | "night" | "paper"`. To make your own, copy the `#stage.t-studio` block at the end of
`engine/style.css` and change the variables (`--bg`, `--ink`, `--accent`, `--card` ...), then use
`"theme": "yourname"`.

## Presenter

- Kai (default): `"pose"` per beat, `"kai": "left" | "center" | "right"` per beat (otherwise he moves on his
  own; `"presenter_move": false` keeps him centred), `"avatar_colors": {"shirt": "#2d4f8a", "hair": "#5a3a22", ...}` to recolour,
  `"presenter": false` on a beat to hide him for it, `"character": "none"` to leave him out entirely.
- Your own character: `"character": "path/to/folder"` with a `character.json` and one transparent video holding a
  short clip per pose:

```json
{"file": "me.webm", "canvas": [1800, 1080], "head_x": 0.5, "head_y": 0.31, "default": "talk",
 "clips": {"talk": [0.0, 2.0], "point_up": [2.0, 3.5], "shrug": [3.5, 5.0]}, "aliases": {"explain": "talk"}}
```

## Licence

MIT for beatreel's own code, see [LICENSE](LICENSE). The fonts in `engine/fonts/` are SIL OFL 1.1, and the voice
model, GSAP, HyperFrames and the icon sets are installed from their own projects under their own licences; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
