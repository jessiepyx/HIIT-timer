// =========================
// MUSIC ENGINE
// =========================
let musicEnabled = localStorage.getItem("hiitMusic") === "1";
let musicStyleIdx = +(localStorage.getItem("hiitMusicStyle") || 0);
let musicTimer = null;
let musicStep = 0;
let musicBar = 0;
let nextMusicTime = 0;
let noiseBuffer = null;
let musicMasterGain = null;

const MUSIC_STYLES = [
  {
    name: "Electronic", bpm: 128,
    kick:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare:  [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
    hihat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    openHat:[0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
    bass:   [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    arp:    [1,0,0,1, 0,1,1,0, 1,0,0,1, 0,1,1,0],
    lead:   [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
    chords: [[130.8,155.6,196],[207.7,261.6,311.1],[155.6,196,233.1],[233.1,293.7,349.2]],
    bassN:  [65.4, 103.8, 77.8, 116.5],
    arpN:   [261.6, 311.1, 392, 466.2, 523.3],
    leadN:  [523.3, 466.2, 392, 349.2, 311.1, 261.6],
    padWave: "triangle", synthWave: "sawtooth"
  },
  {
    name: "Hip Hop", bpm: 90,
    kick:   [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
    openHat:[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    bass:   [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
    arp:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    lead:   [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,1],
    chords: [[196,233.1,293.7],[155.6,196,233.1],[233.1,293.7,349.2],[174.6,220,261.6]],
    bassN:  [49, 77.8, 58.3, 87.3],
    arpN:   [],
    leadN:  [392, 349.2, 293.7, 261.6, 233.1, 196],
    padWave: "sine", synthWave: "triangle"
  },
  {
    name: "Trap", bpm: 140,
    kick:   [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    openHat:[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
    bass:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,1],
    arp:    [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
    lead:   [0,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0],
    chords: [[185,220,277.2],[146.8,185,220],[220,277.2,329.6],[164.8,207.7,246.9]],
    bassN:  [46.2, 73.4, 55, 82.4],
    arpN:   [277.2, 329.6, 370, 440, 554.4],
    leadN:  [554.4, 440, 370, 329.6, 277.2, 220],
    padWave: "sawtooth", synthWave: "square"
  },
  {
    name: "Drum & Bass", bpm: 174,
    kick:   [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
    snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
    hihat:  [1,0,1,1, 0,0,1,0, 1,0,1,1, 0,0,1,0],
    openHat:[0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0],
    bass:   [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
    arp:    [1,0,1,0, 0,1,0,1, 1,0,1,0, 0,1,0,1],
    lead:   [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    chords: [[220,261.6,329.6],[174.6,220,261.6],[146.8,174.6,220],[164.8,207.7,246.9]],
    bassN:  [55, 87.3, 73.4, 82.4],
    arpN:   [329.6, 392, 440, 523.3, 659.3],
    leadN:  [659.3, 523.3, 440, 392, 329.6, 261.6],
    padWave: "triangle", synthWave: "sawtooth"
  }
];

function getMusicDest(){
  const ctx = getAudioCtx();
  if(!musicMasterGain){
    musicMasterGain = ctx.createGain();
    musicMasterGain.gain.value = 0.35;
    musicMasterGain.connect(ctx.destination);
  }
  return musicMasterGain;
}

function getNoiseBuffer(){
  if(!noiseBuffer){
    const ctx = getAudioCtx();
    const len = ctx.sampleRate / 5;
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for(let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function playMKick(time, vel){
  const ctx = getAudioCtx(); const dest = getMusicDest();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(dest);
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
  g.gain.setValueAtTime(0.7 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.start(time); osc.stop(time + 0.31);
}

function playMSnare(time, vel){
  const ctx = getAudioCtx(); const dest = getMusicDest();
  const ns = ctx.createBufferSource();
  ns.buffer = getNoiseBuffer();
  const nf = ctx.createBiquadFilter();
  nf.type = "bandpass"; nf.frequency.value = 3000; nf.Q.value = 0.8;
  const ng = ctx.createGain();
  ns.connect(nf); nf.connect(ng); ng.connect(dest);
  ng.gain.setValueAtTime(0.4 * vel, time);
  ng.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  ns.start(time); ns.stop(time + 0.13);
  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.connect(og); og.connect(dest);
  osc.frequency.setValueAtTime(200, time);
  og.gain.setValueAtTime(0.25 * vel, time);
  og.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  osc.start(time); osc.stop(time + 0.09);
}

function playMClap(time, vel){
  const ctx = getAudioCtx(); const dest = getMusicDest();
  for(let i = 0; i < 3; i++){
    const t = time + i * 0.012;
    const ns = ctx.createBufferSource();
    ns.buffer = getNoiseBuffer();
    const f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 2000; f.Q.value = 1;
    const g = ctx.createGain();
    ns.connect(f); f.connect(g); g.connect(dest);
    g.gain.setValueAtTime(0.18 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    ns.start(t); ns.stop(t + 0.08);
  }
}

function playMHat(time, vel, open){
  const ctx = getAudioCtx(); const dest = getMusicDest();
  const dur = open ? 0.14 : 0.04;
  const ns = ctx.createBufferSource();
  ns.buffer = getNoiseBuffer();
  const f = ctx.createBiquadFilter();
  f.type = "highpass"; f.frequency.value = 9000;
  const g = ctx.createGain();
  ns.connect(f); f.connect(g); g.connect(dest);
  g.gain.setValueAtTime((open ? 0.14 : 0.18) * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  ns.start(time); ns.stop(time + dur + 0.01);
}

function playMBass(time, freq, dur, vel){
  const ctx = getAudioCtx(); const dest = getMusicDest();
  const osc = ctx.createOscillator();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, time);
  f.type = "lowpass"; f.frequency.setValueAtTime(280, time); f.Q.value = 5;
  osc.connect(f); f.connect(g); g.connect(dest);
  g.gain.setValueAtTime(0.35 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.start(time); osc.stop(time + dur + 0.01);
}

function playMPad(time, freqs, dur, vel, wave){
  const ctx = getAudioCtx(); const dest = getMusicDest();
  freqs.forEach(freq => {
    [-5, 5].forEach(det => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = wave || "triangle";
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(det, time);
      osc.connect(g); g.connect(dest);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(0.035 * vel, time + 0.2);
      g.gain.setValueAtTime(0.035 * vel, time + dur - 0.3);
      g.gain.linearRampToValueAtTime(0, time + dur);
      osc.start(time); osc.stop(time + dur + 0.01);
    });
  });
}

function playMArp(time, freq, dur, vel, wave){
  const ctx = getAudioCtx(); const dest = getMusicDest();
  const osc = ctx.createOscillator();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  osc.type = wave || "square";
  osc.frequency.setValueAtTime(freq, time);
  f.type = "lowpass"; f.frequency.setValueAtTime(3000, time); f.Q.value = 2;
  osc.connect(f); f.connect(g); g.connect(dest);
  g.gain.setValueAtTime(0.07 * vel, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.start(time); osc.stop(time + dur + 0.01);
}

function playMLead(time, freq, dur, vel, wave){
  const ctx = getAudioCtx(); const dest = getMusicDest();
  [-4, 4].forEach(det => {
    const osc = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = wave || "sawtooth";
    osc.frequency.setValueAtTime(freq, time);
    osc.detune.setValueAtTime(det, time);
    f.type = "lowpass"; f.frequency.setValueAtTime(2500, time);
    osc.connect(f); f.connect(g); g.connect(dest);
    g.gain.setValueAtTime(0.055 * vel, time);
    g.gain.setValueAtTime(0.055 * vel, time + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.start(time); osc.stop(time + dur + 0.01);
  });
}

function startMusic(){
  if(!musicEnabled) return;
  const ctx = getAudioCtx();
  if(ctx.state === "suspended") ctx.resume();
  musicStep = 0;
  musicBar = 0;
  nextMusicTime = ctx.currentTime + 0.05;
  if(musicTimer) clearInterval(musicTimer);
  musicTimer = setInterval(musicScheduler, 25);
}

function stopMusic(){
  if(musicTimer) clearInterval(musicTimer);
  musicTimer = null;
}

function musicScheduler(){
  if(!musicEnabled) return;
  const ctx = getAudioCtx();
  while(nextMusicTime < ctx.currentTime + 0.1){
    scheduleMusicBeat(musicStep, nextMusicTime);
    const sty = MUSIC_STYLES[musicStyleIdx];
    nextMusicTime += 60.0 / sty.bpm / 4;
    musicStep++;
    if(musicStep >= 16){ musicStep = 0; musicBar++; }
  }
}

function scheduleMusicBeat(step, time){
  const sty = MUSIC_STYLES[musicStyleIdx];
  const vel = 0.8 + Math.random() * 0.4;
  const stepDur = 60.0 / sty.bpm / 4;
  const barDur = stepDur * 16;
  const section = musicBar % 8;
  const isFill = (musicBar > 0 && musicBar % 8 === 7 && step >= 12);

  const drumsOn = section !== 6;
  if(drumsOn){
    if(isFill){
      if(step % 2 === 0) playMKick(time, vel);
      if(step % 2 === 1){ playMSnare(time, vel * 0.8); playMClap(time, vel * 0.6); }
      playMHat(time, vel * 0.4, false);
    } else {
      if(sty.kick[step]) playMKick(time, vel);
      if(sty.snare[step]){ playMSnare(time, vel); if(Math.random() < 0.4) playMClap(time, vel * 0.5); }
      if(sty.openHat[step]){
        playMHat(time, vel, true);
      } else if(sty.hihat[step]){
        const hv = (sty.name === "Trap" && step % 2 !== 0) ? vel * 0.3 : vel;
        playMHat(time, hv, false);
      } else if(Math.random() < 0.12){
        playMHat(time, vel * 0.2, false);
      }
    }
  }

  if(section >= 1 && sty.bass[step]){
    const noteIdx = musicBar % sty.bassN.length;
    playMBass(time, sty.bassN[noteIdx], stepDur * 2.5, vel);
  }

  if(section >= 2 && step === 0){
    const chordIdx = musicBar % sty.chords.length;
    playMPad(time, sty.chords[chordIdx], barDur * 0.95, vel * 0.9, sty.padWave);
  }

  if(section >= 3 && sty.arp[step] && sty.arpN.length > 0 && Math.random() < 0.7){
    const note = sty.arpN[Math.floor(Math.random() * sty.arpN.length)];
    playMArp(time, note, stepDur * 0.8, vel, sty.synthWave);
    if(Math.random() < 0.3){
      playMArp(time + stepDur * 1.5, note * 1.0005, stepDur * 0.6, vel * 0.35, sty.synthWave);
    }
  }

  if(section >= 4 && sty.lead[step] && sty.leadN.length > 0){
    const idx = (musicBar * 3 + step) % sty.leadN.length;
    const note = sty.leadN[idx];
    playMLead(time, note, stepDur * 2.5, vel * 0.8, sty.synthWave);
  }

  if(section === 6){
    if(step % 4 === 0) playMHat(time, vel * 0.3, true);
  }
}

function toggleMusic(){
  musicEnabled = !musicEnabled;
  localStorage.setItem("hiitMusic", musicEnabled ? "1" : "0");
  if(musicEnabled && state !== "idle"){
    startMusic();
  } else {
    stopMusic();
  }
  updateMusicUI();
}

function cycleMusic(){
  musicStyleIdx = (musicStyleIdx + 1) % MUSIC_STYLES.length;
  localStorage.setItem("hiitMusicStyle", musicStyleIdx);
  updateMusicUI();
}

function updateMusicUI(){
  const tb = $("btnMusicToggle");
  if(tb){
    tb.textContent = musicEnabled ? "Music: On" : "Music: Off";
    tb.classList.toggle("music-on", musicEnabled);
  }
  const sb = $("btnMusicStyle");
  if(sb) sb.textContent = MUSIC_STYLES[musicStyleIdx].name;
}
