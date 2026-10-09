/**
 * Second half of the trailer pipeline: repair, then cut.
 *
 *   node tools/film.mjs     --script tools/trailer.mjs --out /tmp/clips
 *   node tools/film-cut.mjs --script tools/trailer.mjs --clips /tmp/clips --out ~/Videos/hoids-journal
 *   node tools/film-cut.mjs ... --soundtrack public/audio/soundtrack.mp3
 *
 * The script module's `cuts` export names each output: either a list of
 * sections, or `{ sections, dissolve }`. Clips inside a section are hard
 * cuts; sections meet in a dissolve (`--dissolve`, default 0.3 s, unless the
 * cut sets its own). With --soundtrack every output carries the track,
 * looped with crossfades for as long as the cut runs and faded out under
 * the end card. Without it, outputs are silent.
 *
 * Repair first. Now and then a frame comes back from headless Chrome with
 * an unpainted tile, even after waiting for two real compositor frames. It
 * is not random: frame 64 of the Lumar shot did it on two separate renders,
 * so something at that moment re-rasters a layer late. The cause is not
 * known. Such a frame disagrees sharply with both neighbours while the
 * neighbours agree with each other, which a cut never does, so it is
 * replaced with the mean of the two. The clip is rewritten in place, and a
 * second run finds nothing.
 *
 * Colour: the clips are JPEG frames through swscale, which makes them
 * limited-range BT.601. The cut converts to BT.709 and tags it, or a phone
 * plays the greens and reds slightly wrong.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, renameSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1] ?? true]);
    return acc;
  }, []),
);
for (const k of ['script', 'clips', 'out']) {
  if (typeof args[k] !== 'string') throw new Error(`--${k} is required`);
}
const CLIPS = resolve(args.clips);
const OUT = resolve(args.out);
const FADE = Number(args.dissolve ?? 0.3);
const CRF = Number(args.crf ?? 16);
mkdirSync(OUT, { recursive: true });

const { cuts } = await import(pathToFileURL(resolve(args.script)).href);
if (!cuts) throw new Error(`${args.script} exports no \`cuts\``);

const run = (cmd, argv, opts = {}) => {
  const r = spawnSync(cmd, argv, { encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
  if (r.status !== 0) throw new Error(`${cmd} failed:\n${(r.stderr || '').slice(-2000)}`);
  return r;
};
const duration = (f) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim().replace(/,$/, ''));

/** Mean squared error between frame i and frame i+gap, for every i. */
function mse(file, gap) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-filter_complex',
    `[0:v]split[a][b];[b]trim=start_frame=${gap},setpts=PTS-STARTPTS[c];[a][c]psnr=stats_file=-`,
    '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 });
  return [...r.stdout.matchAll(/mse_avg:([\d.]+)/g)].map((m) => Number(m[1]));
}

function badFrames(file) {
  const d1 = mse(file, 1);
  const d2 = mse(file, 2);
  const bad = [];
  for (let i = 1; i < d1.length && i - 1 < d2.length; i++) {
    const before = d1[i - 1], after = d1[i], across = d2[i - 1];
    if (before > 40 && after > 40 && across < 0.35 * Math.min(before, after)) bad.push(i);
  }
  return bad;
}

function repair(file, frames) {
  const dir = mkdtempSync(join(tmpdir(), 'film-cut-'));
  try {
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', file, join(dir, '%05d.png')]);
    const name = (n) => join(dir, `${String(n).padStart(5, '0')}.png`);
    for (const i of frames) run('magick', [name(i), name(i + 2), '-evaluate-sequence', 'mean', name(i + 1)]);
    const fixed = `${file}.fixed.mp4`;
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '60', '-i', join(dir, '%05d.png'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '10', '-pix_fmt', 'yuv420p', fixed]);
    renameSync(fixed, file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const plan = Object.fromEntries(Object.entries(cuts).map(([name, c]) => [name,
  Array.isArray(c) ? { sections: c, dissolve: FADE } : { dissolve: FADE, ...c }]));
const used = [...new Set(Object.values(plan).flatMap((c) => c.sections.flat()))];
const present = new Set(readdirSync(CLIPS));
const missing = used.filter((c) => !present.has(`${c}.mp4`));
if (missing.length) throw new Error(`missing clips in ${CLIPS}: ${missing.join(', ')}`);

for (const clip of used) {
  const file = join(CLIPS, `${clip}.mp4`);
  const bad = badFrames(file);
  if (bad.length) {
    repair(file, bad);
    console.error(`[cut] ${clip}: repaired frame${bad.length > 1 ? 's' : ''} ${bad.join(', ')}`);
  }
}

function cut(name, { sections, dissolve }, audio) {
  const files = sections.flat().map((c) => join(CLIPS, `${c}.mp4`));
  const argv = ['-hide_banner', '-loglevel', 'error', '-y'];
  for (const f of files) argv.push('-i', f);
  const graph = [];
  const lens = [];
  let idx = 0;
  sections.forEach((s, si) => {
    const ins = s.map((_, i) => `[${idx + i}:v]`).join('');
    graph.push(`${ins}concat=n=${s.length}:v=1:a=0,settb=1/60,fps=60[s${si}]`);
    lens.push(s.reduce((t, c) => t + duration(join(CLIPS, `${c}.mp4`)), 0));
    idx += s.length;
  });
  let cur = 's0';
  let total = lens[0];
  for (let si = 1; si < sections.length; si++) {
    graph.push(`[${cur}][s${si}]xfade=transition=fade:duration=${dissolve}:offset=${(total - dissolve).toFixed(4)}[x${si}]`);
    cur = `x${si}`;
    total += lens[si] - dissolve;
  }
  graph.push(`[${cur}]scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=tv:out_range=tv,format=yuv420p[v]`);
  if (audio) {
    // As many copies as the cut needs, each crossfaded into the next so a
    // short track covers a long cut without a seam, then faded out under
    // the end card.
    const X = 1.5;
    const track = duration(audio);
    const copies = Math.max(1, Math.ceil((total - X) / (track - X)));
    const a = files.length;
    for (let i = 0; i < copies; i++) argv.push('-i', audio);
    let chain = `[${a}:a]`;
    for (let i = 1; i < copies; i++) {
      graph.push(`${chain}[${a + i}:a]acrossfade=d=${X}:c1=tri:c2=tri[m${i}]`);
      chain = `[m${i}]`;
    }
    graph.push(`${chain}atrim=0:${total.toFixed(3)},`
      + `afade=t=in:d=0.6,afade=t=out:st=${(total - 3.0).toFixed(3)}:d=3.0,`
      + 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]');
  }
  const out = join(OUT, `${name}.mp4`);
  argv.push('-filter_complex', graph.join(';'), '-map', '[v]');
  if (audio) argv.push('-map', '[a]', '-c:a', 'aac', '-b:a', '192k');
  argv.push('-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF), '-profile:v', 'high', '-level', '4.2',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-r', '60', '-g', '120', '-movflags', '+faststart', out);
  run('ffmpeg', argv);
  console.error(`[cut] ${out}  ${total.toFixed(2)}s`);
}

const soundtrack = typeof args.soundtrack === 'string' ? resolve(args.soundtrack) : null;
for (const [name, c] of Object.entries(plan)) cut(name, c, soundtrack);
