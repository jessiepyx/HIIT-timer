// =========================
// MUSIC ENGINE v3 — 6 styles
// =========================
var musicEnabled = localStorage.getItem("hiitMusic") === "1";
var musicStyleIdx = +(localStorage.getItem("hiitMusicStyle") || 0);
var musicTimer = null;
var musicStep = 0;
var musicBar = 0;
var nextMusicTime = 0;
var noiseBuffer = null;
var musicMasterGain = null;
var audioUnlocked = false;
var prevLeadNote = 0;
var currentDrumPattern = 0;
var currentArpPattern = 0;
var currentMotif = null;
var motifStep = 0;
var motifStartBar = -1;

function unlockAudio(){
  if(audioUnlocked) return;
  try {
    if(typeof getAudioCtx !== "function") return;
    var ctx = getAudioCtx();
    if(ctx.state === "suspended") ctx.resume();
    var b = ctx.createBuffer(1, 1, 22050);
    var s = ctx.createBufferSource();
    s.buffer = b; s.connect(ctx.destination); s.start(0);
    audioUnlocked = true;
  } catch(e){}
}
document.addEventListener("touchstart", unlockAudio);
document.addEventListener("click", unlockAudio);

var MUSIC_STYLES = [
  { name: "Electronic", bpm: 128, type: "synth",
    chords: [[130.8,155.6,196],[207.7,261.6,311.1],[155.6,196,233.1],[233.1,293.7,349.2],
             [174.6,207.7,261.6],[196,246.9,293.7],[207.7,261.6,311.1],[233.1,293.7,349.2]],
    bassN: [65.4,103.8,77.8,116.5,87.3,98,103.8,116.5],
    scale: [261.6,293.7,311.1,349.2,392,415.3,466.2,523.3,587.3,622.3],
    drums: [
      {k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
      {k:[1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],h:[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0]},
      {k:[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1]},
      {k:[1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,1,0,0,1,0,1,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]}],
    arpShapes: [[0,1,2,1],[2,1,0,1],[0,2,1,0],[0,0,2,1],[1,2,0,2]],
    leadSteps: [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    padWave:"triangle", synthWave:"sawtooth", openHat:[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]
  },
  { name: "Hip Hop", bpm: 90, type: "synth",
    chords: [[196,233.1,293.7],[155.6,196,233.1],[233.1,293.7,349.2],[174.6,220,261.6],
             [196,233.1,293.7],[146.8,174.6,220],[155.6,196,233.1],[174.6,220,261.6]],
    bassN: [49,77.8,58.3,87.3,49,73.4,77.8,87.3],
    scale: [196,220,233.1,261.6,293.7,311.1,349.2,392,440,466.2],
    drums: [
      {k:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1]},
      {k:[1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
      {k:[1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],h:[1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0]},
      {k:[1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0],h:[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0]}],
    arpShapes: [[0,1,2,1],[2,1,0,0],[0,2,0,1]],
    leadSteps: [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    padWave:"sine", synthWave:"triangle", openHat:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  },
  { name: "Trap", bpm: 140, type: "synth",
    chords: [[185,220,277.2],[146.8,185,220],[220,277.2,329.6],[164.8,207.7,246.9],
             [123.5,155.6,185],[146.8,185,220],[185,220,277.2],[164.8,207.7,246.9]],
    bassN: [46.2,73.4,55,82.4,61.7,73.4,46.2,82.4],
    scale: [185,207.7,220,246.9,277.2,293.7,329.6,370,415.3,440],
    drums: [
      {k:[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],h:[1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1]},
      {k:[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},
      {k:[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1]}],
    arpShapes: [[0,0,2,1],[2,0,0,1],[0,2,1,2],[1,0,2,0]],
    leadSteps: [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],
    padWave:"sawtooth", synthWave:"square", openHat:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0]
  },
  { name: "Drum & Bass", bpm: 174, type: "synth",
    chords: [[220,261.6,329.6],[174.6,220,261.6],[146.8,174.6,220],[164.8,207.7,246.9],
             [130.8,164.8,196],[174.6,220,261.6],[146.8,174.6,220],[196,246.9,293.7]],
    bassN: [55,87.3,73.4,82.4,65.4,87.3,73.4,98],
    scale: [220,246.9,261.6,293.7,329.6,349.2,392,440,493.9,523.3],
    drums: [
      {k:[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],h:[1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,0,1,0,0,1,1,0,1,0,1,0,0,1,1,0]},
      {k:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0],h:[1,1,0,1,0,0,1,1,0,1,0,0,1,0,1,0]},
      {k:[1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1],h:[1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1]}],
    arpShapes: [[0,1,2,1],[2,1,0,2],[0,2,0,1],[1,0,2,1],[2,0,1,0]],
    leadSteps: [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    padWave:"triangle", synthWave:"sawtooth", openHat:[0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0]
  },
  { name: "Country", bpm: 110, type: "country",
    // Guitar voicings: wide open chords
    chords: [
      [196,246.9,293.7,392],     // G
      [130.8,164.8,261.6,329.6], // C
      [196,246.9,293.7,392],     // G
      [146.8,220,293.7,370],     // D
      [164.8,196,246.9,329.6],   // Em
      [130.8,164.8,261.6,329.6], // C
      [196,246.9,293.7,392],     // G
      [146.8,220,293.7,370]      // D
    ],
    bassN: [98,65.4,98,73.4,82.4,65.4,98,73.4],
    altBass: [146.8,98,146.8,110,123.5,98,146.8,110], // alternate bass (5th)
    scale: [196,220,246.9,261.6,293.7,329.6,370,392,440,493.9],
    drums: [
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],h:[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}],
    // Fingerpick patterns: [step, chordNoteIndex] — which chord note to pluck at which step
    pickPatterns: [
      [[0,-1],[2,0],[4,1],[6,2],[8,-2],[10,1],[12,2],[14,0]],
      [[0,-1],[2,2],[4,1],[6,0],[8,-2],[10,0],[12,1],[14,2]],
      [[0,-1],[2,0],[3,1],[4,2],[6,1],[8,-2],[10,2],[12,1],[14,0]],
    ],
    leadSteps: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],
    padWave:"triangle", synthWave:"triangle", openHat:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  },
  { name: "Pop", bpm: 120, type: "pop",
    chords: [
      [261.6,329.6,392],   // C
      [196,246.9,293.7],   // G
      [220,261.6,329.6],   // Am
      [174.6,220,261.6],   // F
      [261.6,329.6,392],   // C
      [196,246.9,293.7],   // G
      [220,261.6,329.6],   // Am
      [174.6,220,261.6]    // F
    ],
    bassN: [65.4,98,55,87.3,65.4,98,55,87.3],
    scale: [261.6,293.7,329.6,349.2,392,440,493.9,523.3,587.3,659.3],
    drums: [
      {k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
      {k:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],h:[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0]},
      {k:[1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],h:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
      {k:[1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0]}],
    arpShapes: [[0,1,2,1],[2,1,0,1],[0,2,1,0]],
    // Pre-composed melodic motifs: [step, scaleDegreeOffset]
    motifs: [
      [[0,0],[2,2],[4,4],[6,2],[8,0],[10,1],[12,2],[14,4]],
      [[0,4],[2,5],[4,4],[6,2],[8,0],[10,2],[12,4],[14,5]],
      [[0,2],[2,2],[4,1],[6,0],[8,1],[10,2],[12,4],[14,2]],
      [[0,0],[4,4],[6,5],[8,4],[10,2],[12,0],[14,1]],
      [[0,4],[2,2],[4,0],[8,2],[10,4],[12,5],[14,4]],
      [[0,0],[2,0],[4,2],[6,4],[8,4],[10,2],[12,0],[14,0]],
    ],
    leadSteps: [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0],
    padWave:"sine", synthWave:"sawtooth", openHat:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  }
];

// --- Sections ---
function getSection(bar){
  var p = bar % 64;
  if(p<4) return "intro"; if(p<12) return "verse"; if(p<20) return "chorus";
  if(p<24) return "break"; if(p<28) return "build"; if(p<36) return "drop";
  if(p<44) return "verse2"; if(p<52) return "chorus2"; if(p<56) return "break2";
  return "build2";
}
function sectionConfig(sec){
  var cfgs = {
    intro:  {drums:true,bass:false,pad:false,arp:false,lead:false,guitar:false,melody:false,energy:0.5},
    verse:  {drums:true,bass:true,pad:true,arp:false,lead:true,guitar:true,melody:true,energy:0.7},
    chorus: {drums:true,bass:true,pad:true,arp:true,lead:true,guitar:true,melody:true,energy:1.0},
    "break":{drums:false,bass:false,pad:true,arp:false,lead:false,guitar:true,melody:false,energy:0.3},
    build:  {drums:true,bass:true,pad:true,arp:true,lead:false,guitar:true,melody:false,energy:0.8},
    drop:   {drums:true,bass:true,pad:true,arp:true,lead:true,guitar:true,melody:true,energy:1.0},
    verse2: {drums:true,bass:true,pad:true,arp:false,lead:true,guitar:true,melody:true,energy:0.7},
    chorus2:{drums:true,bass:true,pad:true,arp:true,lead:true,guitar:true,melody:true,energy:1.0},
    break2: {drums:false,bass:false,pad:true,arp:true,lead:false,guitar:false,melody:false,energy:0.3},
    build2: {drums:true,bass:true,pad:true,arp:false,lead:false,guitar:true,melody:false,energy:0.6}
  };
  return cfgs[sec] || cfgs.verse;
}

// --- Melody helpers ---
function pickLeadNote(chordTones, scale){
  if(Math.random()<0.55) return chordTones[Math.floor(Math.random()*chordTones.length)]*2;
  if(prevLeadNote && Math.random()<0.7){
    var idx=-1;
    for(var i=0;i<scale.length;i++){if(Math.abs(scale[i]-prevLeadNote)<5){idx=i;break;}}
    if(idx<0) idx=Math.floor(scale.length/2);
    var step=Math.random()<0.5?1:-1; if(Math.random()<0.2) step*=2;
    idx=Math.max(0,Math.min(scale.length-1,idx+step));
    return scale[idx];
  }
  return scale[Math.floor(Math.random()*scale.length)];
}
function getMotifNote(sty, step, chordIdx){
  if(!currentMotif) return null;
  for(var i=0;i<currentMotif.length;i++){
    if(currentMotif[i][0]===step){
      var deg=currentMotif[i][1]; var root=Math.floor(sty.scale.length/2);
      var idx=Math.min(sty.scale.length-1, Math.max(0, root+deg-2));
      return sty.scale[idx];
    }
  }
  return null;
}

// --- Audio synthesis ---
function getMusicDest(){var ctx=getAudioCtx();if(!musicMasterGain){musicMasterGain=ctx.createGain();musicMasterGain.gain.value=0.35;musicMasterGain.connect(ctx.destination);}return musicMasterGain;}
function getNoiseBuffer(){if(!noiseBuffer){var ctx=getAudioCtx();var len=ctx.sampleRate/5;noiseBuffer=ctx.createBuffer(1,len,ctx.sampleRate);var d=noiseBuffer.getChannelData(0);for(var i=0;i<len;i++)d[i]=Math.random()*2-1;}return noiseBuffer;}

function playMKick(t,v){var ctx=getAudioCtx(),d=getMusicDest(),o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(d);o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+0.08);g.gain.setValueAtTime(0.7*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);o.start(t);o.stop(t+0.31);}
function playMSnare(t,v){var ctx=getAudioCtx(),d=getMusicDest();var ns=ctx.createBufferSource();ns.buffer=getNoiseBuffer();var nf=ctx.createBiquadFilter();nf.type="bandpass";nf.frequency.value=3000;nf.Q.value=0.8;var ng=ctx.createGain();ns.connect(nf);nf.connect(ng);ng.connect(d);ng.gain.setValueAtTime(0.4*v,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.12);ns.start(t);ns.stop(t+0.13);var o=ctx.createOscillator(),og=ctx.createGain();o.connect(og);og.connect(d);o.frequency.setValueAtTime(200,t);og.gain.setValueAtTime(0.25*v,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.08);o.start(t);o.stop(t+0.09);}
function playMClap(t,v){var ctx=getAudioCtx(),d=getMusicDest();for(var i=0;i<3;i++){var tt=t+i*0.012;var ns=ctx.createBufferSource();ns.buffer=getNoiseBuffer();var f=ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=2000;f.Q.value=1;var g=ctx.createGain();ns.connect(f);f.connect(g);g.connect(d);g.gain.setValueAtTime(0.18*v,tt);g.gain.exponentialRampToValueAtTime(0.001,tt+0.07);ns.start(tt);ns.stop(tt+0.08);}}
function playMHat(t,v,open){var ctx=getAudioCtx(),d=getMusicDest(),dur=open?0.14:0.04;var ns=ctx.createBufferSource();ns.buffer=getNoiseBuffer();var f=ctx.createBiquadFilter();f.type="highpass";f.frequency.value=9000;var g=ctx.createGain();ns.connect(f);f.connect(g);g.connect(d);g.gain.setValueAtTime((open?0.14:0.18)*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);ns.start(t);ns.stop(t+dur+0.01);}
function playMBass(t,freq,dur,v){var ctx=getAudioCtx(),d=getMusicDest(),o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();o.type="sawtooth";o.frequency.setValueAtTime(freq,t);f.type="lowpass";f.frequency.setValueAtTime(280,t);f.Q.value=5;o.connect(f);f.connect(g);g.connect(d);g.gain.setValueAtTime(0.3*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.start(t);o.stop(t+dur+0.01);}
function playMSub(t,freq,dur,v){var ctx=getAudioCtx(),d=getMusicDest(),o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";o.frequency.setValueAtTime(freq,t);o.connect(g);g.connect(d);g.gain.setValueAtTime(0.2*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.start(t);o.stop(t+dur+0.01);}
function playMPad(t,freqs,dur,v,wave){var ctx=getAudioCtx(),d=getMusicDest();freqs.forEach(function(freq){[-5,5].forEach(function(det){var o=ctx.createOscillator(),g=ctx.createGain();o.type=wave||"triangle";o.frequency.setValueAtTime(freq,t);o.detune.setValueAtTime(det,t);o.connect(g);g.connect(d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.03*v,t+0.25);g.gain.setValueAtTime(0.03*v,t+dur-0.3);g.gain.linearRampToValueAtTime(0,t+dur);o.start(t);o.stop(t+dur+0.01);});});}
function playMArp(t,freq,dur,v,wave){var ctx=getAudioCtx(),d=getMusicDest(),o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();o.type=wave||"square";o.frequency.setValueAtTime(freq,t);f.type="lowpass";f.frequency.setValueAtTime(2500+Math.random()*1500,t);f.Q.value=2;o.connect(f);f.connect(g);g.connect(d);g.gain.setValueAtTime(0.065*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.start(t);o.stop(t+dur+0.01);}
function playMLead(t,freq,dur,v,wave){var ctx=getAudioCtx(),d=getMusicDest();[-4,4].forEach(function(det){var o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();o.type=wave||"sawtooth";o.frequency.setValueAtTime(freq,t);o.detune.setValueAtTime(det,t);f.type="lowpass";f.frequency.setValueAtTime(2000+Math.random()*1000,t);o.connect(f);f.connect(g);g.connect(d);g.gain.setValueAtTime(0.05*v,t);g.gain.setValueAtTime(0.05*v,t+dur*0.6);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.start(t);o.stop(t+dur+0.01);});}
function playMPluck(t,freq,dur,v){var ctx=getAudioCtx(),d=getMusicDest(),o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();o.type="square";o.frequency.setValueAtTime(freq,t);f.type="lowpass";f.frequency.setValueAtTime(4000,t);f.frequency.exponentialRampToValueAtTime(500,t+dur);o.connect(f);f.connect(g);g.connect(d);g.gain.setValueAtTime(0.06*v,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.start(t);o.stop(t+dur+0.01);}

// Guitar pluck (triangle wave with fast filter decay — sounds like nylon string)
function playMGuitar(t,freq,dur,v){
  var ctx=getAudioCtx(),d=getMusicDest(),o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  o.type="triangle"; o.frequency.setValueAtTime(freq,t);
  f.type="lowpass"; f.frequency.setValueAtTime(3500,t); f.frequency.exponentialRampToValueAtTime(600,t+dur*0.4);
  o.connect(f);f.connect(g);g.connect(d);
  g.gain.setValueAtTime(0.09*v,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.start(t);o.stop(t+dur+0.01);
}
// Strum: play chord notes with slight delay
function playMStrum(t,freqs,dur,v){
  for(var i=0;i<freqs.length;i++){
    playMGuitar(t+i*0.018, freqs[i], dur*(0.8+Math.random()*0.2), v*(0.7+Math.random()*0.3));
  }
}

// --- MAIN SEQUENCER ---
function startMusic(){
  if(!musicEnabled) return;
  try {
    var ctx=getAudioCtx(); if(ctx.state==="suspended") ctx.resume();
    musicStep=0; musicBar=0; prevLeadNote=0; currentMotif=null; motifStep=0;
    currentDrumPattern=Math.floor(Math.random()*4);
    currentArpPattern=Math.floor(Math.random()*5);
    nextMusicTime=ctx.currentTime+0.05;
    if(musicTimer) clearInterval(musicTimer);
    musicTimer=setInterval(musicScheduler,25);
  } catch(e){}
}
function stopMusic(){ if(musicTimer) clearInterval(musicTimer); musicTimer=null; }
function musicScheduler(){
  if(!musicEnabled) return;
  var ctx=getAudioCtx();
  if(ctx.state==="suspended"){ ctx.resume(); return; }
  while(nextMusicTime<ctx.currentTime+0.1){
    scheduleMusicBeat(musicStep,nextMusicTime);
    var sty=MUSIC_STYLES[musicStyleIdx];
    nextMusicTime+=60.0/sty.bpm/4;
    musicStep++;
    if(musicStep>=16){
      musicStep=0; musicBar++;
      if(musicBar%4===0 && Math.random()<0.4) currentDrumPattern=Math.floor(Math.random()*4);
      if(musicBar%2===0 && Math.random()<0.5) currentArpPattern=Math.floor(Math.random()*5);
      // New motif every 2-4 bars
      if(musicBar%2===0 && Math.random()<0.6) currentMotif=null;
    }
  }
}

function scheduleMusicBeat(step,time){
  var sty=MUSIC_STYLES[musicStyleIdx];
  var vel=0.8+Math.random()*0.4;
  var stepDur=60.0/sty.bpm/4;
  var barDur=stepDur*16;
  var sec=getSection(musicBar);
  var sc=sectionConfig(sec);
  var ci=musicBar%8;
  var chord=sty.chords[ci];
  var dm=sty.drums[currentDrumPattern%sty.drums.length];
  var isFill=(musicBar%8===7 && step>=12);

  // --- DRUMS ---
  if(sc.drums){
    if(isFill){
      if(step%2===0) playMKick(time,vel*sc.energy);
      if(step%2===1){playMSnare(time,vel*0.8*sc.energy);playMClap(time,vel*0.5);}
      playMHat(time,vel*0.4,step===14);
    } else {
      if(dm.k[step]) playMKick(time,vel*sc.energy);
      if(dm.s[step]){playMSnare(time,vel*sc.energy);if(Math.random()<0.35) playMClap(time,vel*0.4);}
      if(sty.openHat && sty.openHat[step]) playMHat(time,vel*sc.energy,true);
      else if(dm.h[step]){
        var hv=(sty.name==="Trap"&&step%2!==0)?vel*0.3:vel;
        playMHat(time,hv*sc.energy,false);
      } else if(Math.random()<0.1) playMHat(time,vel*0.15,false);
    }
  }
  if(!sc.drums&&(sec==="break"||sec==="break2")&&step%4===0) playMHat(time,vel*0.25,true);

  // --- STYLE-SPECIFIC ---
  if(sty.type==="country"){
    // Fingerpicking guitar
    if(sc.guitar){
      var pp=sty.pickPatterns[musicBar%sty.pickPatterns.length];
      for(var pi=0;pi<pp.length;pi++){
        if(pp[pi][0]===step){
          var ni=pp[pi][1];
          if(ni===-1) playMGuitar(time,sty.bassN[ci],stepDur*3,vel*sc.energy);
          else if(ni===-2) playMGuitar(time,sty.altBass[ci],stepDur*3,vel*sc.energy*0.8);
          else playMGuitar(time,chord[ni%chord.length],stepDur*2,vel*sc.energy*0.7);
        }
      }
    }
    // Strum on chorus/drop
    if((sec==="chorus"||sec==="chorus2"||sec==="drop")&&step===0&&Math.random()<0.5){
      playMStrum(time,chord,barDur*0.4,vel*0.5);
    }
    // Country lead (fiddle-like)
    if(sc.lead && sty.leadSteps[step] && Math.random()<0.6){
      var note=pickLeadNote(chord,sty.scale); prevLeadNote=note;
      playMLead(time,note,stepDur*(2+Math.floor(Math.random()*2)),vel*0.6*sc.energy,sty.synthWave);
    }
    // Bass
    if(sc.bass && step===0){
      playMBass(time,sty.bassN[ci],stepDur*6,vel*0.6*sc.energy);
      playMSub(time,sty.bassN[ci]/2,stepDur*8,vel*0.5);
    }
    // Light pad on verse/chorus
    if(sc.pad && step===0) playMPad(time,chord.slice(0,3),barDur*0.9,vel*0.4*sc.energy,sty.padWave);
    return;
  }

  if(sty.type==="pop"){
    // Bass
    if(sc.bass){
      if(step===0){playMBass(time,sty.bassN[ci],stepDur*3,vel*sc.energy);playMSub(time,sty.bassN[ci]/2,stepDur*4,vel*0.7);}
      else if(step===6&&Math.random()<0.6) playMBass(time,sty.bassN[ci],stepDur*2,vel*0.6*sc.energy);
      else if(step===10&&Math.random()<0.4) playMBass(time,sty.bassN[ci]*1.5,stepDur*1.5,vel*0.5*sc.energy);
    }
    // Pad
    if(sc.pad && step===0) playMPad(time,chord,barDur*0.95,vel*0.8*sc.energy,sty.padWave);
    // Arp
    if(sc.arp){
      var as=sty.arpShapes[currentArpPattern%sty.arpShapes.length];
      if(step%2===0&&Math.random()<0.6){
        var an=chord[as[step%as.length]%chord.length]*2;
        playMArp(time,an,stepDur*0.8,vel*sc.energy,sty.synthWave);
        if(Math.random()<0.2) playMArp(time+stepDur*1.5,an*1.001,stepDur*0.5,vel*0.25,sty.synthWave);
      }
    }
    // Pop melody: use pre-composed motifs
    if(sc.melody){
      if(!currentMotif && sty.motifs){
        currentMotif=sty.motifs[Math.floor(Math.random()*sty.motifs.length)];
        motifStep=0;
      }
      if(currentMotif){
        var mn=getMotifNote(sty,step,ci);
        if(mn){
          prevLeadNote=mn;
          playMLead(time,mn,stepDur*2.5,vel*0.7*sc.energy,sty.synthWave);
        }
      }
    }
    // Pluck in chorus
    if((sec==="chorus"||sec==="chorus2"||sec==="drop")&&step%4===0&&Math.random()<0.4){
      playMPluck(time,chord[Math.floor(Math.random()*chord.length)]*4,stepDur*2,vel*0.4);
    }
    return;
  }

  // --- DEFAULT SYNTH STYLES (Electronic, Hip Hop, Trap, D&B) ---
  // Bass
  if(sc.bass){
    if(step===0){playMBass(time,sty.bassN[ci],stepDur*3,vel*sc.energy);playMSub(time,sty.bassN[ci]/2,stepDur*4,vel*0.8);}
    else if(step===6&&Math.random()<0.7) playMBass(time,sty.bassN[ci],stepDur*2,vel*0.7*sc.energy);
    else if(step===10&&Math.random()<0.5) playMBass(time,sty.bassN[ci]*1.5,stepDur*1.5,vel*0.5*sc.energy);
    else if(step===12&&sec==="drop"&&Math.random()<0.6) playMBass(time,sty.bassN[ci]*0.75,stepDur*2,vel*0.6);
  }
  // Pad
  if(sc.pad && step===0) playMPad(time,chord,barDur*0.95,vel*0.85*sc.energy,sty.padWave);
  // Arp
  if(sc.arp && sty.arpShapes){
    var shape=sty.arpShapes[currentArpPattern%sty.arpShapes.length];
    var arpActive=(step%2===0&&Math.random()<0.65)||(step%2===1&&Math.random()<0.25);
    if(arpActive){
      var cni=shape[step%shape.length]%chord.length;
      var arpNote=chord[cni]*2;
      if(Math.random()<0.15) arpNote*=0.5;
      if(Math.random()<0.1) arpNote*=2;
      playMArp(time,arpNote,stepDur*0.8,vel*sc.energy,sty.synthWave);
      if(Math.random()<0.25) playMArp(time+stepDur*1.5,arpNote*1.001,stepDur*0.5,vel*0.25,sty.synthWave);
    }
  }
  // Lead
  if(sc.lead && sty.leadSteps[step] && Math.random()<0.7){
    var note=pickLeadNote(chord,sty.scale); prevLeadNote=note;
    playMLead(time,note,stepDur*(2+Math.floor(Math.random()*3)),vel*0.75*sc.energy,sty.synthWave);
  }
  // Pluck
  if((sec==="chorus"||sec==="chorus2"||sec==="drop")&&step%4===0&&Math.random()<0.4){
    playMPluck(time,chord[Math.floor(Math.random()*chord.length)]*4,stepDur*2,vel*0.5);
  }
}

// --- CONTROLS ---
function toggleMusic(){
  musicEnabled=!musicEnabled;
  localStorage.setItem("hiitMusic",musicEnabled?"1":"0");
  if(musicEnabled&&state!=="idle"){var ctx=getAudioCtx();if(ctx.state==="suspended")ctx.resume();startMusic();}
  else stopMusic();
  updateMusicUI();
}
function cycleMusic(){
  musicStyleIdx=(musicStyleIdx+1)%MUSIC_STYLES.length;
  localStorage.setItem("hiitMusicStyle",musicStyleIdx);
  updateMusicUI();
}
function updateMusicUI(){
  var tb=$("btnMusicToggle");
  if(tb){tb.textContent=musicEnabled?"Music: On":"Music: Off";tb.classList.toggle("music-on",musicEnabled);}
  var sb=$("btnMusicStyle");
  if(sb) sb.textContent=MUSIC_STYLES[musicStyleIdx].name;
}
