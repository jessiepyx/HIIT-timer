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
var shuffledMelodies = null;

function unlockAudio(){
  if(audioUnlocked) return;
  try {
    if(typeof getAudioCtx !== "function") return;
    // Play silent audio to force iOS to use media volume channel
    var a = new Audio();
    a.src = "data:audio/mpeg;base64,/+NIxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+NIxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
    a.play().catch(function(){});
    // Then unlock AudioContext
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
  { name: "Electronic", bpm: 128, type: "electronic",
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
    melodies: [
      [[0,311.1],[3,392],[5,466.2],[8,523.3],[10,466.2],[12,392],[14,311.1]],
      [[0,523.3],[3,415.3],[6,392],[8,311.1],[11,349.2],[14,466.2]],
      [[0,392],[2,466.2],[4,523.3],[7,392],[10,311.1],[12,261.6],[14,349.2]],
      [[0,466.2],[3,523.3],[6,466.2],[8,392],[11,311.1],[14,392]],
      [[0,261.6],[3,311.1],[6,392],[8,523.3],[11,466.2],[13,392],[14,466.2]],
      [[0,523.3],[2,466.2],[5,311.1],[8,392],[10,466.2],[13,523.3]],
      [[0,349.2],[3,392],[6,466.2],[9,523.3],[11,466.2],[14,311.1]],
      [[0,392],[2,311.1],[5,261.6],[8,311.1],[10,392],[12,466.2],[14,523.3]],
      [[0,466.2],[3,392],[5,523.3],[8,466.2],[11,349.2],[14,392]],
      [[0,311.1],[2,349.2],[4,466.2],[7,523.3],[10,392],[12,311.1],[14,261.6]]
    ],
    drumVol: 0.8, melodyVol: 0.9,
    padWave:"triangle", synthWave:"sawtooth", openHat:[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]
  },
  { name: "Hip Hop", bpm: 90, type: "hiphop",
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
    melodies: [
      [[0,293.7],[3,233.1],[6,196],[9,233.1],[11,293.7],[14,349.2]],
      [[0,392],[3,349.2],[5,293.7],[8,261.6],[11,233.1],[14,261.6]],
      [[0,233.1],[2,261.6],[5,293.7],[8,349.2],[10,392],[13,349.2],[14,293.7]],
      [[0,349.2],[3,293.7],[6,261.6],[9,196],[12,233.1],[14,293.7]],
      [[0,196],[3,261.6],[6,293.7],[9,392],[11,349.2],[14,261.6]],
      [[0,392],[2,311.1],[5,261.6],[8,293.7],[11,233.1],[14,196]],
      [[0,261.6],[3,293.7],[5,349.2],[8,293.7],[10,233.1],[13,261.6],[14,293.7]],
      [[0,293.7],[2,392],[5,349.2],[8,261.6],[11,293.7],[14,233.1]],
      [[0,349.2],[3,261.6],[6,196],[9,233.1],[12,293.7],[14,349.2]],
      [[0,233.1],[3,293.7],[6,392],[9,349.2],[11,293.7],[14,261.6]]
    ],
    drumVol: 0.7, melodyVol: 0.85,
    padWave:"sine", synthWave:"triangle", openHat:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  },
  { name: "Trap", bpm: 140, type: "trap",
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
    melodies: [
      [[0,277.2],[4,220],[7,185],[10,220],[14,277.2]],
      [[0,370],[3,329.6],[6,277.2],[10,246.9],[14,220]],
      [[0,220],[3,277.2],[7,329.6],[10,370],[14,329.6]],
      [[0,329.6],[3,277.2],[7,220],[10,185],[14,220]],
      [[0,185],[3,246.9],[7,277.2],[10,370],[14,329.6]],
      [[0,370],[3,277.2],[7,220],[11,246.9],[14,277.2]],
      [[0,246.9],[3,185],[7,220],[10,277.2],[14,370]],
      [[0,277.2],[3,329.6],[6,370],[10,329.6],[14,246.9]],
      [[0,220],[4,370],[7,329.6],[11,277.2],[14,220]],
      [[0,329.6],[3,220],[6,277.2],[10,370],[14,277.2]]
    ],
    drumVol: 0.9, melodyVol: 0.7,
    padWave:"sawtooth", synthWave:"square", openHat:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0]
  },
  { name: "Drum & Bass", bpm: 174, type: "dnb",
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
    melodies: [
      [[0,329.6],[2,392],[4,440],[6,392],[8,329.6],[10,261.6],[12,293.7],[14,392]],
      [[0,440],[2,523.3],[4,440],[7,392],[9,329.6],[12,261.6],[14,329.6]],
      [[0,261.6],[2,293.7],[4,392],[6,440],[8,523.3],[10,440],[12,392],[14,329.6]],
      [[0,523.3],[3,440],[5,329.6],[7,261.6],[9,293.7],[11,329.6],[13,440],[14,392]],
      [[0,329.6],[2,261.6],[4,329.6],[6,440],[8,392],[10,329.6],[12,440],[14,523.3]],
      [[0,440],[2,392],[5,329.6],[7,440],[9,523.3],[11,440],[14,392]],
      [[0,293.7],[2,329.6],[4,392],[7,440],[9,392],[11,329.6],[13,261.6],[14,293.7]],
      [[0,392],[2,440],[4,523.3],[7,440],[9,329.6],[12,392],[14,440]],
      [[0,261.6],[3,329.6],[5,440],[7,392],[10,261.6],[12,329.6],[14,392]],
      [[0,523.3],[2,440],[4,392],[7,329.6],[10,440],[12,523.3],[14,440]]
    ],
    drumVol: 0.85, melodyVol: 0.8,
    padWave:"triangle", synthWave:"sawtooth", openHat:[0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0]
  },
  { name: "Country", bpm: 110, type: "country",
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
    altBass: [146.8,98,146.8,110,123.5,98,146.8,110],
    scale: [196,220,246.9,261.6,293.7,329.6,370,392,440,493.9],
    drums: [
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0]}],
    pickPatterns: [
      [[0,-1],[2,0],[4,1],[6,2],[8,-2],[10,1],[12,2],[14,0]],
      [[0,-1],[2,2],[4,1],[6,0],[8,-2],[10,0],[12,1],[14,2]],
      [[0,-1],[2,0],[3,1],[4,2],[6,1],[8,-2],[10,2],[12,1],[14,0]],
      [[0,-1],[2,1],[4,2],[6,3],[8,-2],[10,2],[12,1],[14,0]],
    ],
    melodies: [
      [[0,246.9],[3,293.7],[5,392],[8,329.6],[10,293.7],[12,246.9],[14,220]],
      [[0,392],[2,370],[5,329.6],[8,293.7],[10,329.6],[12,370],[14,392]],
      [[0,293.7],[3,329.6],[5,370],[8,392],[10,370],[12,329.6],[14,246.9]],
      [[0,196],[2,220],[5,246.9],[7,293.7],[10,329.6],[12,293.7],[14,246.9]],
      [[0,392],[3,329.6],[6,293.7],[8,246.9],[11,220],[13,246.9],[14,293.7]],
      [[0,329.6],[2,293.7],[5,246.9],[8,220],[10,246.9],[12,293.7],[14,370]],
      [[0,246.9],[3,196],[5,220],[8,246.9],[10,329.6],[12,293.7],[14,246.9]],
      [[0,370],[2,329.6],[5,293.7],[7,329.6],[10,370],[12,392],[14,440]],
      [[0,293.7],[3,246.9],[5,196],[8,220],[10,293.7],[13,370],[14,329.6]],
      [[0,220],[2,246.9],[5,329.6],[8,392],[10,329.6],[12,246.9],[14,220]]
    ],
    padWave:"triangle", synthWave:"triangle", openHat:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  },
  { name: "Pop", bpm: 120, type: "pop",
    chords: [
      [261.6,329.6,392],   // C
      [196,246.9,293.7],   // G
      [220,261.6,329.6],   // Am
      [174.6,220,261.6],   // F
      [146.8,174.6,220],   // Dm
      [196,246.9,293.7],   // G
      [261.6,329.6,392],   // C
      [174.6,220,261.6]    // F
    ],
    bassN: [65.4,98,55,87.3,73.4,98,65.4,87.3],
    scale: [261.6,293.7,329.6,349.2,392,440,493.9,523.3,587.3,659.3],
    drums: [
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
      {k:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],s:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],h:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}],
    arpShapes: [[0,1,2,1],[2,1,0,1],[0,2,1,0]],
    melodies: [
      [[0,329.6],[3,392],[5,523.3],[8,440],[10,392],[12,329.6],[14,392]],
      [[0,523.3],[2,440],[5,392],[8,329.6],[10,261.6],[12,293.7],[14,329.6]],
      [[0,392],[2,329.6],[5,261.6],[7,293.7],[10,329.6],[12,440],[14,392]],
      [[0,261.6],[3,329.6],[5,392],[8,440],[10,523.3],[12,440],[14,392]],
      [[0,440],[2,392],[5,329.6],[8,261.6],[10,293.7],[12,329.6],[14,440]],
      [[0,329.6],[3,261.6],[5,293.7],[8,392],[10,440],[12,523.3],[14,440]],
      [[0,523.3],[2,493.9],[5,440],[8,392],[10,329.6],[13,261.6],[14,293.7]],
      [[0,293.7],[2,329.6],[5,440],[7,523.3],[10,440],[12,392],[14,329.6]],
      [[0,392],[3,440],[5,523.3],[8,440],[10,329.6],[12,261.6],[14,329.6]],
      [[0,261.6],[2,329.6],[4,440],[7,523.3],[9,440],[12,329.6],[14,261.6]]
    ],
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

// Piano: layered harmonics with fast attack, medium decay
function playMPiano(t,freq,dur,v){
  var ctx=getAudioCtx(),d=getMusicDest();
  var harmonics=[1,2,3,4],vols=[1,0.4,0.15,0.06];
  for(var i=0;i<harmonics.length;i++){
    var o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    o.type="sine";o.frequency.setValueAtTime(freq*harmonics[i],t);
    f.type="lowpass";f.frequency.setValueAtTime(4000,t);f.frequency.exponentialRampToValueAtTime(800,t+dur*0.5);
    o.connect(f);f.connect(g);g.connect(d);
    g.gain.setValueAtTime(0.08*v*vols[i],t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.start(t);o.stop(t+dur+0.01);
  }
  var ns=ctx.createBufferSource();ns.buffer=getNoiseBuffer();
  var nf=ctx.createBiquadFilter();nf.type="highpass";nf.frequency.value=6000;
  var ng=ctx.createGain();ns.connect(nf);nf.connect(ng);ng.connect(d);
  ng.gain.setValueAtTime(0.015*v,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.03);
  ns.start(t);ns.stop(t+0.04);
}

// Rich lead with vibrato
function playMRichLead(t,freq,dur,v,wave){
  var ctx=getAudioCtx(),d=getMusicDest();
  [-6,0,6].forEach(function(det){
    var o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    o.type=wave||"sawtooth";o.frequency.setValueAtTime(freq,t);o.detune.setValueAtTime(det,t);
    var lfo=ctx.createOscillator(),lfoG=ctx.createGain();
    lfo.type="sine";lfo.frequency.value=5;lfoG.gain.value=3;
    lfo.connect(lfoG);lfoG.connect(o.detune);lfo.start(t);lfo.stop(t+dur+0.01);
    f.type="lowpass";f.frequency.setValueAtTime(2000+Math.random()*1500,t);
    o.connect(f);f.connect(g);g.connect(d);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.04*v,t+0.02);
    g.gain.setValueAtTime(0.04*v,t+dur*0.6);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.start(t);o.stop(t+dur+0.01);
  });
}

function shuffleArray(arr){
  for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;}
  return arr;
}

// --- MAIN SEQUENCER ---
function startMusic(){
  if(!musicEnabled) return;
  try {
    var ctx=getAudioCtx(); if(ctx.state==="suspended") ctx.resume();
    musicStep=0; musicBar=0; prevLeadNote=0; currentMotif=null; motifStep=0;
    currentDrumPattern=Math.floor(Math.random()*4);
    currentArpPattern=Math.floor(Math.random()*5);
    // Shuffle melodies for variety each session
    var sty=MUSIC_STYLES[musicStyleIdx];
    if(sty.melodies) shuffledMelodies=shuffleArray(sty.melodies.slice());
    else shuffledMelodies=null;
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

  // --- DRUMS (only for styles that don't handle their own) ---
  var hasOwnDrums = (sty.type==="country"||sty.type==="pop"||sty.type==="electronic"||sty.type==="hiphop"||sty.type==="trap"||sty.type==="dnb");
  if(sc.drums && !hasOwnDrums){
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
    // Softer drums for country
    var dv = vel * 0.35 * sc.energy;
    if(sc.drums && !isFill){
      if(dm.k[step]) playMKick(time, dv);
      if(dm.s[step]) playMSnare(time, dv);
      if(dm.h[step]) playMHat(time, dv*0.7, false);
    }
    // Fingerpicking guitar (louder)
    if(sc.guitar){
      var pp=sty.pickPatterns[musicBar%sty.pickPatterns.length];
      for(var pi=0;pi<pp.length;pi++){
        if(pp[pi][0]===step){
          var ni=pp[pi][1];
          if(ni===-1) playMGuitar(time,sty.bassN[ci],stepDur*3,vel*sc.energy*1.2);
          else if(ni===-2) playMGuitar(time,sty.altBass[ci],stepDur*3,vel*sc.energy);
          else playMGuitar(time,chord[ni%chord.length],stepDur*2,vel*sc.energy*0.9);
        }
      }
    }
    // Strum on chorus/drop
    if((sec==="chorus"||sec==="chorus2"||sec==="drop")&&step===0&&Math.random()<0.6){
      playMStrum(time,chord,barDur*0.4,vel*0.6);
    }
    // Country melody — guitar-like with shuffle
    if(sc.lead && shuffledMelodies){
      var mel = shuffledMelodies[musicBar % shuffledMelodies.length];
      if(Math.random()<0.85) for(var mi=0;mi<mel.length;mi++){
        if(mel[mi][0]===step){
          var mNote = mel[mi][1] * (Math.random()<0.1 ? 2 : 1);
          playMGuitar(time,mNote,stepDur*3.5,vel*1.0*sc.energy);
          playMRichLead(time,mNote,stepDur*3,vel*0.5*sc.energy,"triangle");
        }
      }
    }
    // Bass
    if(sc.bass && step===0){
      playMBass(time,sty.bassN[ci],stepDur*6,vel*0.5*sc.energy);
      playMSub(time,sty.bassN[ci]/2,stepDur*8,vel*0.4);
    }
    // Light pad
    if(sc.pad && step===0) playMPad(time,chord.slice(0,3),barDur*0.9,vel*0.5*sc.energy,sty.padWave);
    return;
  }

  if(sty.type==="pop"){
    // Softer drums for pop
    var pdv = vel * 0.35 * sc.energy;
    if(sc.drums && !isFill){
      if(dm.k[step]) playMKick(time, pdv);
      if(dm.s[step]) playMSnare(time, pdv*0.8);
      if(dm.h[step]) playMHat(time, pdv*0.6, false);
    }
    // Bass (softer)
    if(sc.bass){
      if(step===0){playMBass(time,sty.bassN[ci],stepDur*4,vel*0.5*sc.energy);playMSub(time,sty.bassN[ci]/2,stepDur*6,vel*0.4);}
      else if(step===8&&Math.random()<0.4) playMBass(time,sty.bassN[ci],stepDur*2,vel*0.3*sc.energy);
    }
    // Warm pad
    if(sc.pad && step===0) playMPad(time,chord,barDur*0.95,vel*0.7*sc.energy,sty.padWave);
    // Pop melody (loud, prominent, pre-composed)
    if((sc.melody || sc.lead) && shuffledMelodies){
      var pMel = shuffledMelodies[musicBar % shuffledMelodies.length];
      if(Math.random()<0.9) for(var pmi=0;pmi<pMel.length;pmi++){
        if(pMel[pmi][0]===step){
          var pNote = pMel[pmi][1] * (Math.random()<0.08 ? 2 : 1);
          playMPiano(time,pNote,stepDur*4,vel*1.3*sc.energy);
          if(Math.random()<0.3){
            var hIdx = sty.scale.indexOf(pNote);
            if(hIdx>=0 && hIdx+2<sty.scale.length) playMPiano(time,sty.scale[hIdx+2],stepDur*3.5,vel*0.4*sc.energy);
          }
        }
      }
    }
    // Gentle arp in chorus
    if(sc.arp && (sec==="chorus"||sec==="chorus2"||sec==="drop")){
      var as=sty.arpShapes[currentArpPattern%sty.arpShapes.length];
      if(step%4===0&&Math.random()<0.5){
        var an=chord[as[step%as.length]%chord.length]*2;
        playMArp(time,an,stepDur*1.5,vel*0.4*sc.energy,sty.synthWave);
      }
    }
    // Pluck sparkle in chorus
    if((sec==="chorus"||sec==="chorus2"||sec==="drop")&&step%8===0&&Math.random()<0.3){
      playMPluck(time,chord[Math.floor(Math.random()*chord.length)]*4,stepDur*2,vel*0.3);
    }
    return;
  }

  // --- DEFAULT STYLES (Electronic, Hip Hop, Trap, D&B) ---
  var dVol = (sty.drumVol || 0.8) * vel * sc.energy;
  var mVol = (sty.melodyVol || 0.8) * vel * sc.energy;

  // Drums (style-specific volume)
  if(sc.drums && !isFill){
    if(dm.k[step]) playMKick(time, dVol);
    if(dm.s[step]){playMSnare(time, dVol);if(Math.random()<0.3) playMClap(time,dVol*0.4);}
    if(sty.openHat && sty.openHat[step]) playMHat(time,dVol,true);
    else if(dm.h[step]){
      var hv=(sty.type==="trap"&&step%2!==0)?dVol*0.3:dVol;
      playMHat(time,hv,false);
    } else if(Math.random()<0.08) playMHat(time,dVol*0.15,false);
  }
  // Bass
  if(sc.bass){
    if(step===0){playMBass(time,sty.bassN[ci],stepDur*3,dVol*0.9);playMSub(time,sty.bassN[ci]/2,stepDur*4,dVol*0.7);}
    else if(step===6&&Math.random()<0.6) playMBass(time,sty.bassN[ci],stepDur*2,dVol*0.6);
    else if(step===10&&Math.random()<0.4) playMBass(time,sty.bassN[ci]*1.5,stepDur*1.5,dVol*0.4);
  }
  // Pad
  if(sc.pad && step===0) playMPad(time,chord,barDur*0.95,mVol*0.6,sty.padWave);
  // Pre-composed melody
  if((sc.lead || sc.melody) && shuffledMelodies){
    var sMel = shuffledMelodies[musicBar % shuffledMelodies.length];
    if(Math.random()<0.88) for(var smi=0;smi<sMel.length;smi++){
      if(sMel[smi][0]===step){
        var sNote = sMel[smi][1] * (Math.random()<0.08 ? 2 : 1);
        playMRichLead(time,sNote,stepDur*3,mVol*1.1,sty.synthWave);
        if(Math.random()<0.2){
          var shIdx = sty.scale.indexOf(sNote);
          if(shIdx>=0 && shIdx+2<sty.scale.length) playMRichLead(time,sty.scale[shIdx+2],stepDur*2.5,mVol*0.3,sty.synthWave);
        }
      }
    }
  }
  // Arp (chorus/drop only)
  if(sc.arp && sty.arpShapes && (sec==="chorus"||sec==="chorus2"||sec==="drop")){
    var shape=sty.arpShapes[currentArpPattern%sty.arpShapes.length];
    if(step%2===0&&Math.random()<0.5){
      var cni=shape[step%shape.length]%chord.length;
      var arpNote=chord[cni]*2;
      playMArp(time,arpNote,stepDur*0.8,mVol*0.5,sty.synthWave);
      if(Math.random()<0.2) playMArp(time+stepDur*1.5,arpNote*1.001,stepDur*0.5,mVol*0.2,sty.synthWave);
    }
  }
  // Pluck sparkle
  if((sec==="chorus"||sec==="chorus2"||sec==="drop")&&step%4===0&&Math.random()<0.3){
    playMPluck(time,chord[Math.floor(Math.random()*chord.length)]*4,stepDur*2,mVol*0.4);
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
