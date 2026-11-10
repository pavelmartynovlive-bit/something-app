"""Rebuild PCM16/44.1 kHz mono game SFX. Requires Python/numpy and ffmpeg.
Originals remain byte-identical; explicit edits and gains, no peak normalization.
"""
from pathlib import Path
import hashlib, json, subprocess, wave
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public/assets/audio/source'
OUTPUT = ROOT / 'public/assets/audio/sfx'
# start/end seconds, fixed gain dB, fade-in/out seconds. Keep attack preroll.
EDITS = {
 'jump': (0, .300, -8, 0, .008),
 'snow_land': (0, .620, 3, 0, .040),
 'food_pickup': (0, .366, 5, 0, .020),
 'lipton_bottle': (.060, .580, -6, .002, .035),
 'lipton_magic': (.360, 1.750, -4, .012, .200),
 'bench_sit': (.390, 1.176, -5, .005, .045),
 'granny_hit': (0, .360, 5, 0, .030),
 'scooter_hit': (0, .220, -8, 0, .012),
 'pigeon_takeoff': (.025, .950, -3, .003, .100),
 'pit_snow': (0, .780, -8, 0, .060),
 'pit_slush': (.390, 1.120, -8, .008, .090),
 'respawn': (0, .501, -11, 0, .020),
 'cat_meow_01': (.040, 1.166, -3, .003, .035),
 'cat_meow_02': (0, 1.544, -14, 0, .060),
 'cat_feed': (.390, 1.100, 2, .005, .055),
 'ui_click': (0, .200, -1, 0, .025),
}
RATE = 44100

def db(value):
 return round(20 * np.log10(max(float(value), 1e-12)), 2)

def save(name, samples, info):
 peak = float(np.max(np.abs(samples)))
 if peak >= .999: raise ValueError(f'{name}: clipping risk {peak}')
 file = OUTPUT / f'{name}.wav'
 pcm = np.rint(samples * 32767).astype('<i2')
 with wave.open(str(file), 'wb') as out:
  out.setnchannels(1); out.setsampwidth(2); out.setframerate(RATE); out.writeframes(pcm.tobytes())
 report[name] = dict(info, durationSeconds=round(len(samples)/RATE, 4),
  peakDbFS=db(peak), rmsDbFS=db(np.sqrt(np.mean(samples*samples))),
  sha256=hashlib.sha256(file.read_bytes()).hexdigest())
 print(f'{name:18} {len(samples)/RATE:.3f}s peak={db(peak):6.2f} rms={report[name]["rmsDbFS"]:6.2f}')

OUTPUT.mkdir(parents=True, exist_ok=True)
manifest = json.loads((SOURCE / 'manifest.json').read_text())
clips, report = {}, {}
for source in manifest['sources']:
 file = SOURCE / source['file']
 assert hashlib.sha256(file.read_bytes()).hexdigest() == source['sha256'], file
 raw = subprocess.check_output(['ffmpeg','-v','error','-xerror','-i',str(file),
  '-ac','1','-ar',str(RATE),'-f','f32le','-'])
 samples = np.frombuffer(raw, dtype='<f4')
 name = source['output']; start, end, gain, fade_in, fade_out = EDITS[name]
 cut = samples[round(start*RATE):round(end*RATE)].copy()
 cut *= 10 ** (gain/20)
 for duration, leading in [(fade_in, True), (fade_out, False)]:
  n = min(round(duration*RATE), len(cut))
  if n:
   envelope = np.linspace(0, 1, n) if leading else np.linspace(1, 0, n)
   if leading: cut[:n] *= envelope
   else: cut[-n:] *= envelope
 clips[name] = cut
 save(name, cut, dict(sourceId=source['id'], sourceFile=source['file'], startSeconds=start,
  endSeconds=min(end,len(samples)/RATE), gainDb=gain, fadeInSeconds=fade_in, fadeOutSeconds=fade_out))

def combo(name, first, second, offset, second_gain):
 delay = round(offset*RATE)
 accent = clips[second] * 10 ** (second_gain/20)
 mixed = np.zeros(max(len(clips[first]),delay+len(accent)), dtype=np.float32)
 mixed[:len(clips[first])] += clips[first]
 mixed[delay:delay+len(accent)] += accent
 save(name, mixed, dict(parts=[first, second], secondOffsetSeconds=offset, secondGainDb=second_gain))

# Magic follows the bottle with a short crossfade of its quiet tail.
combo('lipton_combo', 'lipton_bottle', 'lipton_magic', .490, -2)
# A 300 ms slush accent follows the snow attack; keep impact clearer than splash.
slush = clips['pit_slush'][:round(.300*RATE)].copy()
n = round(.050*RATE); slush[-n:] *= np.linspace(1,0,n)
clips['pit_slush_accent'] = slush
combo('pit_combo', 'pit_snow', 'pit_slush_accent', .075, -6)
report['pit_combo']['parts'][1] = 'pit_slush (first 300 ms, extra 50 ms fade)'
(ROOT / 'art-assets/audio').mkdir(exist_ok=True)
(ROOT / 'art-assets/audio/processing.json').write_text(json.dumps({
 'sampleRate':RATE,'channels':1,'format':'PCM16 WAV','normalization':'none; fixed per-source gain',
 'files':report},indent=2)+'\n')
