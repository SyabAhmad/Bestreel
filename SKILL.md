---
name: beatreel
description: Make vertical talking-avatar explainer videos (1080x1920) from a JSON script - Kokoro voice, word-synced captions, one animated scene per idea, a presenter at the bottom, rendered with HyperFrames.
---

# beatreel

You write a script of **beats**: a beat is one idea, the line(s) that say it, and the scene that shows it.
beatreel voices the lines (Kokoro, offline), times every word, builds an HTML/GSAP page and renders it with
HyperFrames, then mixes the audio to -14 LUFS.

```bash
bash setup.sh                                  # once
./beatreel board path/script.json     # voice + frames sheet <name>-frames.jpg (middle of each beat)
./beatreel make  path/script.json     # <name>.mp4 next to the script
./beatreel say   "Postgres on macOS"  # how the voice reads a line, and which words it guessed
./beatreel icons rocket               # icon names for "icon": "set:name"
```

Work happens in `build/<name>/` next to the script (voice is cached until the lines change).

## Workflow

1. Write the beats. Keep each line literal: the scene must **show** what the line **says**. If you cannot name the
   object for a line, rewrite the line.
2. `board` → read `build/<name>/pronounce.txt` and fix guessed words with `voice.say`; look at the frames sheet.
3. `make` → check the first frames and a few frames per beat before handing the video over.
4. Scenes stay on screen ~2-3 s; set `"max_hold": 2.6` and the build warns about anything held longer.

## Script

```json
{
 "name": "coffee", "theme": "studio",
 "voice": {"name": "af_heart", "speed": 1.0, "say": {"SQL": "sequel"}},
 "beats": [
  {"pose": "point_up",
   "lines": ["Coffee doesn't give you energy.", "It _hides_ how tired you are."],
   "shots": [
    {"type": "card", "icon": "fluent-emoji-flat:hot-beverage", "title": "Energy?"},
    {"type": "sticker", "lines": ["IT HIDES", "THE TIRED"], "red": true, "at": "word:hides"}]},
  {"pose": "count", "lines": ["Half of it is still in you five hours later."],
   "hero": {"type": "num", "value": 5, "suffix": " hrs", "at": "word:five"}}
 ]
}
```

**Top level**: `name`, `theme` (`studio` default, `night`, `paper`, or your own), `voice` {name, speed, say,
natural}, `music` {style: "soft" | "beat" | "none" (default), level (dB, default -33), bpm, transpose, duck_db},
`sfx` (true = sound effects through earshot), `sfx_level`, `intro` {sound: "file.wav", gain, lead},
`character` ("kai" default, "none", or a folder path), `avatar_colors`, `presenter` {scale, y},
`caption_words` (words per caption block, default 7), `caption_y` (y px, or [with presenter, without]),
`hero_scale` (multiplies every scene), `hero_x`, `max_hold`, `meta` (true = slug row on top) + `counter`
{label, start}.

**Beat**: `lines` (`_word_` = highlighted key word), `hero` (one item or a list, whole beat) or `shots` (a list;
each shot is an item or a list of items and lasts until the next shot's `at`), `pose`, `presenter` (false = hide
the presenter for this beat), `react` (word(s): burst lines around the head), `cam: "big"` (presenter starts
large until the first scene lands), `bg` ("red" floods the accent colour, "black"), `wipe` (true = an iris wipe
into this beat), `pause_before` (seconds), `slug`, `count` (new counter value), `keep` on a hero (stay N more
beats), `flash` ["word:x", seconds] (presenter cutaway).

**Times**: `"word:five"`, `"word:five#2"` (second "five" in the beat), `"word:five+0.2"`, `"next:word:x"` (a word
in the next beat), or seconds from the beat start. Omitted = beat start.

**Every item**: `type`, `at`, `until`, `x`, `y` (centre px; default 540, 820 with a presenter / 960 without),
`scale`, `rot`, `z`, `in` (zoom, left, right, up, down, flip, drop, swing), `out` (left, right, zoom, down,
shrink), `exit: "cut"`, `pop: false`, `float: false`, `tilt` [rx, ry], `push` (slow zoom to this scale),
`icon` + `color` wherever an icon is shown. Icons are Iconify names (`lucide:key`, `simple-icons:github`,
`logos:python`, `fluent-emoji-flat:rocket`); never use emoji characters.

Safe area: keep scenes within x 100-980, y 120-1380 when the video will be posted to a platform with UI overlays.

## Scenes

| type | keys |
|---|---|
| `card` | label, icon, title (html ok), text, img, w |
| `panel` | w, h, label, children [items placed in panel px, each with its own `at`] |
| `browser` | tab, url, icon, title, text, w, h, incognito |
| `num` | value, from, prefix, suffix, decimals, label, count (seconds), size: rolls like an odometer |
| `scramble` | text, red, size, decode, label: decodes from noise |
| `sticker` | lines [..], red, redLine, or text, size |
| `stamp` | text, size |
| `shot` | src, label, w, rings [[x%, y%, w%, h%]], ringAt [times]: a screenshot with rings on what matters |
| `image` | src, w, radius, shadow |
| `video` | src, media, url, tab, w, aspect, fit, words [[time, text, red]]: a clip in a browser window |
| `clip` | src (mp4/webm, alpha ok), w, h, media: a pre-rendered shot with no frame |
| `phone` | src or title, scale |
| `term` | title, lines [..] ("$ " lines are commands; FAILED/OK words colour), typeDur, w |
| `code` | file, tag, lines, lang ("py"/"md"), rows, fs, scroll [[time, line]], marks [{line, to, at, until, tag, color}], scanAt |
| `logo` | icon, color, name |
| `wordmark` | text, typeAt, typeDur, badge, badgeIcon, sub |
| `list` | title, items, ticks [times], mark ("x" = crosses), w |
| `row` | tiles [{icon, label}], ats, crossAt: icon tiles landing one per word |
| `grid` | n, cols, shape ("doc"), hi [indexes], hiAt, dropAt |
| `dots` | n, cols, cell, hi, hi2, redAt, darkAt, legend [[time, text, "r1"/"r2"]]: a share of 100 |
| `compare` | left {title, text}, right {title, text}, rightAt, swap |
| `gauge` | title, value (0-100), verdict, at2, count |
| `spike` | title, points [0-100], peakLabel, drawAt, dur: a chart that spikes |
| `tokbars` | title, rows [{name, parts [{v, c, label}]}], ats, max, note: stacked bars |
| `limits` | items [{name, to, end}], drainAt, dur: meters that drain at different speeds |
| `burn` | label, sub, to, dur: a counter that burns up |
| `coins` | n, text, textAt: coins pouring |
| `hub` | icon, label, items [{icon, title, a (angle)}], ats, plug, fromIcon, plugAt: one thing reaching many |
| `pile` | items, hi, dropAt, each, fs: labels rain down and pile up |
| `domino` | items, fallAt, each |
| `status` | title, items [{icon, title}], ats, downAt [times], downText: a status board going down |
| `world` | redAt, spread, pin, arcs [[city, city]], arcsAt, icon, crackAt, label, labelAt: a dotted world map |
| `upgrade` | icon, title, sub, doneAt, done, bugIcon, bugAt |
| `restart` | icon, text, pressAt, dur |
| `freeze` | title, items, freezeAt, icon, snowIcon, text |
| `clock` | text, sub, spinAt, dur, turn |
| `date` | month, day |
| `flip` | pages [{m, d, y}], flipAt, dur: calendar pages flipping |
| `mail` | n, title, icon, dropAt, each, countAt, hours, releaseAt, okAt: envelopes held in a tray |
| `send` | from, fromIcon, to, toIcon, c, sendAt: a paper plane to someone |
| `chat` | title, icon, file, ext, meta, msg, dropAt, tokens, dur: a file dropped into a chat |
| `files` | items [{ext, name, c}], ats, suckAt, outAt, outName: files (optionally converted into one) |
| `morph` | before (html), lines, file, flipAt, w: a document turning into plain text |
| `page3d` | scanAt, rx, rz: a page tilted in 3D being scanned |
| `gift` | icon, openAt, tag, tagAt |
| `repo` | icon, owner, name, desc, chips, chipAt, count: a code repository card |
| `stars` | rollAt, dur, to, n, curIcon, label: stars being added |
| `starburst` | text, sub, icon, burstAt |
| `meet` | people [{n, c}], title, icon, bot, claudeAt (bot joins), speak, typing, outsiderAt, leaveAt, endAt: a video call |
| `doc` | title, by, icon, lines ["# heading", ...], ats or step: a doc writing itself |
| `speak` | who, c, text, dur: someone speaking (waveform + words) |
| `sort` | title, notes [{t, col, c}], ats, sortAt, cols: sticky notes sorted into columns |
| `answer` | who, q, docs, hit, a, link, bot, checkAt, answerAt, linkAt |
| `mpage` | title, sub, icon, items [{icon, title, sub}], ats |
| `wave` | label, strikeAt |
| `plans` | items [{t, ok}], markAt |
| `xpost` | src, iw, head, crop, w, label, marks [{r, at}]: a post screenshot with highlighted words |
| `comment` | who, keyword |
| `follow` | img (optional), handle, text, tapAt |
| `profile` | img, handle, cat, bio, covers, tapAt, gridAt |
| `html` | html (escape hatch) |

`examples/tour/` shows most of them one per beat.

## Presenter (Kai)

Poses: talk, calm, smile, explain/present, both, hi/wave, point_up, point_side, one, count, count3, shrug, shocked,
gasp, oops, excited, shh, thumbs_up, think, wait, stop, facepalm, clasp, arms_crossed. Moods on the talk arms:
laugh, nervous, stressed, sad, angry, bored, skeptical, wink, cry, panic. See `docs/kai-poses.jpg`.
`avatar_colors` keys: skin, skinSh, hair, hairHi, shirt, shirtSh, shirtHi, cuff, tee, iris, shadow, mark.

## Checking frames by hand

The page is one paused GSAP timeline (`window.__timelines.reel`). To screenshot a moment, seek with events on:
`tl.seek(t, false)` (Kai redraws in onUpdate), and don't return the timeline from a Playwright `evaluate`.

## Adding a scene type

Add a builder to `B` in `engine/beats.js` (`(o, el, t) => {...}`; change state with `tl.set(...)`/tweens at
absolute times, never callbacks, so any frame can render in any order), its CSS in `engine/style.css`, and any new
time keys (`somethingAt`) to `TIME_ONE` / `TIME_LISTS` in `beatreel.py` so `"word:x"` resolves.
