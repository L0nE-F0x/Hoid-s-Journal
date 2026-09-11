/**
 * A quiet rumble that follows scale. Off until the reader asks for it.
 * No soundtrack: original audio only, generated here.
 */
import { store } from './store.ts';

export function connectAudio(): () => void {
  let ctx: AudioContext | null = null;
  let osc: OscillatorNode | null = null;
  let gain: GainNode | null = null;
  let filter: BiquadFilterNode | null = null;

  const ensure = () => {
    if (ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    osc = ctx.createOscillator();
    filter = ctx.createBiquadFilter();
    gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 42;
    filter.type = 'lowpass';
    filter.frequency.value = 120;
    gain.gain.value = 0;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
  };

  const tick = () => {
    if (!store.state.visual.rumble || store.state.shell !== 'play') {
      if (gain && ctx) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      return;
    }
    ensure();
    if (!ctx || !osc || !gain || !filter) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    const scale = store.state.scale;
    const hz = scale === 'city' || scale === 'surface' ? 28
      : scale === 'globe' ? 36
        : scale === 'system' ? 48
          : 58;
    const amp = scale === 'globe' || scale === 'surface' || scale === 'city' ? 0.03 : 0.012;
    osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.12);
    filter.frequency.setTargetAtTime(hz * 3.2, ctx.currentTime, 0.12);
    gain.gain.setTargetAtTime(amp, ctx.currentTime, 0.12);
  };

  const offs = [
    store.on('visual', tick),
    store.on('scale', tick),
    store.on('shell', tick),
  ];
  tick();
  return () => {
    offs.forEach((o) => o());
    if (osc) try { osc.stop(); } catch { /* already stopped */ }
    ctx?.close().catch(() => undefined);
  };
}
