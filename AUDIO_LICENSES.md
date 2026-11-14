# Audio licenses

All 16 selected Freesound originals are licensed under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).
Use in commercial videogames and adaptations are permitted. Attribution required: **no**.

Originals were supplied in `freesound-selected-sfx.zip`, downloaded by the local
agent from official Freesound original download links. The supplied license
report records verification on 2026-11-10. All 16 received file sizes and SHA-256
hashes were independently checked against the supplied manifest, and every audio
stream passed complete decoding. Originals are preserved byte-for-byte in
`public/assets/audio/source/`; hashes are recorded in its `manifest.json`.

| Filename | Original title | Author | Freesound URL | License | Attribution required |
|---|---|---|---|---|---|
| `331381__qubodup__public-domain-jump-sound.wav` | Public Domain Jump Sound | qubodup | [Original](https://freesound.org/people/qubodup/sounds/331381/) | CC0 1.0 | No |
| `378058__bajko__sfx_snowball_hit-03.wav` | sfx_snowball_hit-03.wav | bajko | [Original](https://freesound.org/people/bajko/sounds/378058/) | CC0 1.0 | No |
| `563465__nicholasdaryl__itempickup.wav` | ItemPickup.wav | nicholasdaryl | [Original](https://freesound.org/people/nicholasdaryl/sounds/563465/) | CC0 1.0 | No |
| `705750__richerlandtv__opening-water-bottle.mp3` | Opening Water Bottle | RICHERlandTV | [Original](https://freesound.org/people/RICHERlandTV/sounds/705750/) | CC0 1.0 | No |
| `506939__nakhas__magic-spell-small-positive.wav` | Magic spell (small positive) | Nakhas | [Original](https://freesound.org/people/Nakhas/sounds/506939/) | CC0 1.0 | No |
| `523698__bobblyboo__sit-down.wav` | Sit down.wav | Bobblyboo | [Original](https://freesound.org/people/Bobblyboo/sounds/523698/) | CC0 1.0 | No |
| `872227__koimematsuchiya__soft-impact-pillow-hit.wav` | Soft Impact - Pillow Hit | KoimeMatsuchiya | [Original](https://freesound.org/people/KoimeMatsuchiya/sounds/872227/) | CC0 1.0 | No |
| `566117__speedyvelcro__plastic-toy-car-crash-impact.wav` | Plastic Toy Car Crash / Impact | SpeedyVelcro | [Original](https://freesound.org/people/SpeedyVelcro/sounds/566117/) | CC0 1.0 | No |
| `701283__5ro4__pigeons-flying-wings-noise.wav` | pigeons flying wings noise.wav | 5ro4 | [Original](https://freesound.org/people/5ro4/sounds/701283/) | CC0 1.0 | No |
| `167081__julien_matthey__jm_impact_01b-snow-on-cement.wav` | JM_IMPACT_01b - Snow on cement.wav | Julien_Matthey | [Original](https://freesound.org/people/Julien_Matthey/sounds/167081/) | CC0 1.0 | No |
| `450856__kyles__ice-drill-pull-out-of-hole-gushy-splash-with-slush-and-snow-nice-detail.wav` | ice drill pull out of hole gushy splash with slush and snow nice detail.wav | kyles | [Original](https://freesound.org/people/kyles/sounds/450856/) | CC0 1.0 | No |
| `714257__qubodup__puff-of-smoke.wav` | Puff of Smoke | qubodup | [Original](https://freesound.org/people/qubodup/sounds/714257/) | CC0 1.0 | No |
| `362652__trngle__cat-meow.wav` | Cat meow | TRNGLE | [Original](https://freesound.org/people/TRNGLE/sounds/362652/) | CC0 1.0 | No |
| `110011__tuberatanka__cat-meow.wav` | cat meow | tuberatanka | [Original](https://freesound.org/people/tuberatanka/sounds/110011/) | CC0 1.0 | No |
| `534270__patchytherat__pouring-cat-food-into-bowl.wav` | pouring cat food into bowl.wav | patchytherat | [Original](https://freesound.org/people/patchytherat/sounds/534270/) | CC0 1.0 | No |
| `528561__jummit__soft-ui-button-click.ogg` | Soft UI Button Click | Jummit | [Original](https://freesound.org/people/Jummit/sounds/528561/) | CC0 1.0 | No |

## Game derivatives

`public/assets/audio/sfx/` contains 18 PCM16 mono WAVs at 44.1 kHz: 16 individual
edits and `lipton_combo.wav` / `pit_combo.wav`. Fixed per-source gains preserve
relative differences; no common peak normalization is used. Crops retain attack
preroll; short fades smooth cut boundaries. The Lipton mix uses a bottle opening
followed by a quieter positive magic accent. The pit mix uses snow impact followed
by a 300 ms quiet slush accent.

Rebuild with `python scripts/prepare-audio.py` (Python, numpy, ffmpeg).
Exact boundaries, fades, gains, durations, output SHA-256 hashes and signal levels
are recorded in `art-assets/audio/processing.json`. Runtime master volume and
event gains are in `src/audio-manager.ts`.

## Background music audition (three tracks supplied by the user)

| Original filename | Title | Author | Source | License | Attribution required |
|---|---|---|---|---|---|
| `pixel-meadow-calm.ogg` | Pixel Meadow (calm) | Spaceyyy | https://aquumgifts.itch.io/cozy-chiptune | Author's royalty-free game asset license (not CC0) | No |
| `pixel-meadow.ogg` | Pixel Meadow | Spaceyyy | https://aquumgifts.itch.io/cozy-chiptune | Author's royalty-free game asset license (not CC0) | No |
| `Bitcade-Music-02-Overworld.wav` | 02 Overworld | Schniersky / Bitcade Audio | https://schniersky.itch.io/bitcade-free-music-pack | CC BY 4.0 | Yes |

Spaceyyy permits personal/commercial games and modifying/cutting/combining the
music, and prohibits standalone asset redistribution or claiming authorship:
https://aquumgifts.github.io/cozy-game-assets/cozy-chiptune/#license
Only the free-demo Pixel Meadow full/calm tracks are used from that pack.
CC BY 4.0 permits commercial games and modifications with attribution, a license
link and an indication of changes: https://creativecommons.org/licenses/by/4.0/
Required Bitcade credit: Music: Bitcade Audio — https://schniersky.itch.io/bitcade (CC BY 4.0).

All three stream files are game assets in `public/assets/audio/music/` (OGG and
MP3 fallback for older iOS/Safari); the two supplied OGG streams remain byte-identical.
MP3 variants and the Overworld OGG are re-encoded, with no composition changes.
In-game playback applies a separate music gain and switch crossfade. User upload
source filenames/hashes and durations are in `art-assets/audio/music/manifest.json`.
The permanent player link opens `public/audio-credits.html` with attribution for
all three tracks, the licenses and changes. Music is optional, loads after scene
startup, and can be switched/muted without muting game SFX.
