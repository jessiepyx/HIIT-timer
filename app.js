(() => {

// =========================
// EXERCISE LIBRARY
// =========================
const EXERCISE_LIBRARY = {
“Upper Body”: [
“Push-ups”, “Wide Push-ups”, “Diamond Push-ups”, “Pike Push-ups”,
“Tricep Dips”, “Arm Circles”, “Shoulder Taps”
],
“Core”: [
“Plank”, “Crunches”, “Bicycle Crunches”, “Leg Raises”,
“Mountain Climbers”, “Russian Twists”, “Side Plank Left”, “Side Plank Right”
],
“Lower Body”: [
“Squats”, “Jump Squats”, “Lunges”, “Reverse Lunges”,
“Glute Bridges”, “Calf Raises”, “Wall Sit”, “Step-ups”
],
“Cardio”: [
“Jumping Jacks”, “High Knees”, “Burpees”, “Box Jumps”,
“Skaters”, “Jump Rope”, “Fast Feet”, “Squat Jumps”
],
“Full Body”: [
“Burpees”, “Bear Crawl”, “Inchworm”, “Turkish Get-up”,
“Sprawls”, “Thrusters”, “Man Makers”
]
};

// =========================
// STATE
// =========================
let workouts = [];
let selected = null;
let editingIndex = null;

let cfg = null;
let exercises = [];

let state = “idle”;
let idx = 0;
let round = 1;

let t = 0;
let duration = 0;
let timer = null;
let paused = false;

let elapsed = 0;
let totalTime = 0;

// encouragement tracking
let halfSpoken = false;

// =========================
// UTIL
// =========================
const $ = (id) => document.getElementById(id);

function bind(id, fn){
const el = $(id);
if(el) el.onclick = fn;
}

// =========================
// AUDIO — beep via Web Audio API
// =========================
let audioCtx = null;

function getAudioCtx(){
if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
return audioCtx;
}

function beep(freq = 880, duration = 0.12, delay = 0){
try {
const ctx = getAudioCtx();
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.connect(gain);
gain.connect(ctx.destination);
osc.frequency.value = freq;
osc.type = “sine”;
const start = ctx.currentTime + delay;
gain.gain.setValueAtTime(0.4, start);
gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
osc.start(start);
osc.stop(start + duration + 0.01);
} catch(e){}
}

// play 5 beeps, one per second, starting now
function beepCountdown(){
for(let i = 0; i < 5; i++){
beep(660 + i * 40, 0.15, i);
}
}

// single “go!” double-beep
function beepGo(){
beep(880, 0.15, 0);
beep(1100, 0.2, 0.18);
}

// =========================
// SPEECH
// =========================
function speak(text, delay = 0){
try{
const utter = new SpeechSynthesisUtterance(text);
utter.lang = “en-US”;
utter.rate = 1.05;
if(delay > 0){
setTimeout(() => {
speechSynthesis.cancel();
speechSynthesis.speak(utter);
}, delay * 1000);
} else {
speechSynthesis.cancel();
speechSynthesis.speak(utter);
}
}catch(e){}
}

function speakQueue(text, delay = 0){
// speak without cancelling previous (for chained announcements)
try{
const utter = new SpeechSynthesisUtterance(text);
utter.lang = “en-US”;
utter.rate = 1.05;
setTimeout(() => speechSynthesis.speak(utter), delay * 1000);
}catch(e){}
}

// =========================
// INIT
// =========================
function init(){
workouts = JSON.parse(localStorage.getItem(“hiitWorkouts”) || “[]”);
bindStaticUI();
show(“home”);
}

init();

// =========================
// NAV
// =========================
function show(page){
document.querySelectorAll(”.page”).forEach(p => p.classList.remove(“active”));
const target = $(page);
if(target) target.classList.add(“active”);
if(page === “select”) renderSelect();
if(page === “edit”)   renderManage();
}

// =========================
// STATIC BUTTONS
// =========================
function bindStaticUI(){
bind(“btnChoose”,    () => show(“select”));
bind(“btnEdit”,      () => show(“edit”));
bind(“btnBackHome1”, () => show(“home”));
bind(“btnBackHome2”, () => show(“home”));
bind(“btnStart”,     startSelected);
bind(“btnNew”,       newWorkout);
bind(“btnAddEx”,     addExercise);
bind(“btnPickEx”,    openPicker);
bind(“btnSave”,      save);
bind(“btnPause”,     togglePause);
bind(“btnSkip”,      skip);
bind(“btnRestart”,   restartMove);
bind(“btnHome”,      goHome);
bind(“btnEndEarly”,  goHome);
bind(“btnPickerDone”,   pickerDone);
bind(“btnPickerCancel”, () => { $(“pickerOverlay”).style.display = “none”; });
}

function goHome(){
clearInterval(timer);
speechSynthesis.cancel();
state = “idle”;
paused = false;
show(“home”);
}

// =========================
// SELECT PAGE
// =========================
function renderSelect(){
const list = $(“workoutList”);
if(!list) return;
list.innerHTML = “”;
workouts.forEach((w, i) => {
const div = document.createElement(“div”);
div.className = “card”;
div.textContent = w.name;
div.addEventListener(“click”, () => {
selected = i;
[…list.children].forEach(c => { c.style.border = “none”; });
div.style.border = “2px solid #007aff”;
});
list.appendChild(div);
});
}

// =========================
// EDIT PAGE
// =========================
function renderManage(){
const list = $(“manageList”);
if(!list) return;
list.innerHTML = “”;
workouts.forEach((w, i) => {
const div = document.createElement(“div”);
div.className = “card”;
div.innerHTML = `<b>${w.name}</b><br> <button class="edit">Edit</button> <button class="del">Delete</button>`;
list.appendChild(div);
div.querySelector(”.del”).onclick = () => {
workouts.splice(i, 1);
saveLS();
renderManage();
};
div.querySelector(”.edit”).onclick = () => edit(i);
});
}

// =========================
// EXERCISE PICKER
// =========================
let pickerSelected = new Set();

function openPicker(){
pickerSelected = new Set();
const list = $(“pickerList”);
list.innerHTML = “”;


Object.entries(EXERCISE_LIBRARY).forEach(([category, exArr]) => {
  const cat = document.createElement("div");
  cat.className = "picker-category";
  cat.textContent = category;
  list.appendChild(cat);

  exArr.forEach(name => {
    const item = document.createElement("div");
    item.className = "picker-item";
    item.innerHTML = `<span class="check">○</span><span>${name}</span>`;
    item.addEventListener("click", () => {
      if(pickerSelected.has(name)){
        pickerSelected.delete(name);
        item.classList.remove("selected");
        item.querySelector(".check").textContent = "○";
      } else {
        pickerSelected.add(name);
        item.classList.add("selected");
        item.querySelector(".check").textContent = "✓";
      }
    });
    list.appendChild(item);
  });
});

$("pickerOverlay").style.display = "flex";

}

function pickerDone(){
pickerSelected.forEach(name => addExercise(name));
pickerSelected = new Set();
$(“pickerOverlay”).style.display = “none”;
}

// =========================
// WORKOUT FORM
// =========================
function newWorkout(){
editingIndex = null;
clearForm();
show(“form”);
}

function edit(i){
editingIndex = i;
loadForm(workouts[i]);
show(“form”);
}

function addExercise(val){
const list = $(“exerciseList”);
if(!list) return;
const div = document.createElement(“div”);
div.className = “exercise”;
const safeVal = (typeof val === “string”) ? val : “”;
div.innerHTML = `<input placeholder="Exercise name" value="${safeVal}"> <button type="button">✕</button>`;
div.querySelector(“button”).onclick = () => div.remove();
list.appendChild(div);
}

function clearForm(){
[“name”,“work”,“rest”,“rounds”,“water”,“warmup”,“cooldown”].forEach(id => {
const el = $(id);
if(el) el.value = “”;
});
const list = $(“exerciseList”);
if(list) list.innerHTML = “”;
}

function loadForm(w){
if(!w) return;
[“name”,“work”,“rest”,“rounds”,“water”,“warmup”,“cooldown”].forEach(id => {
const el = $(id);
if(el) el.value = w[id] ?? “”;
});
const list = $(“exerciseList”);
if(!list) return;
list.innerHTML = “”;
(w.exercises || []).forEach(e => addExercise(e));
}

function save(){
const list = $(“exerciseList”);
if(!list) return;
const ex = […list.querySelectorAll(“input”)]
.map(i => i.value.trim()).filter(Boolean);
const w = {
name:     $(“name”)?.value.trim() || “Workout”,
work:     +$(“work”)?.value   || 20,
rest:     +$(“rest”)?.value   || 10,
rounds:   +$(“rounds”)?.value || 3,
water:    +$(“water”)?.value  || 30,
warmup:   +$(“warmup”)?.value || 30,
cooldown: +$(“cooldown”)?.value || 30,
exercises: ex
};
if(editingIndex != null){ workouts[editingIndex] = w; }
else { workouts.push(w); }
saveLS();
show(“edit”);
}

function saveLS(){
localStorage.setItem(“hiitWorkouts”, JSON.stringify(workouts));
}

// =========================
// PRE-WORKOUT BRIEFING
// =========================
function briefing(cfg, exercises){
const totalMin = Math.round(totalTime / 60);
const exList = exercises.join(”, “);
const msg =
`Alright, let's get started! Today's workout is ${cfg.name}. ` +
`You'll do ${cfg.rounds} round${cfg.rounds > 1 ? "s" : ""} of ${exercises.length} exercise${exercises.length > 1 ? "s" : ""}. ` +
`Each exercise is ${cfg.work} seconds, with ${cfg.rest} seconds rest in between. ` +
`The total workout time is about ${totalMin} minute${totalMin !== 1 ? "s" : ""}. ` +
`Your exercises are: ${exList}. ` +
`We'll start with a ${cfg.warmup}-second warm-up. Get ready!`;
speak(msg);
// return approximate speech duration so we can delay the timer start
return msg.split(” “).length / 2.5; // ~2.5 words/sec
}

// =========================
// TIMER ENGINE
// =========================
function startSelected(){
if(selected == null || !workouts[selected]){
alert(“Please select a workout first.”);
return;
}
cfg = workouts[selected];
exercises = cfg.exercises || [];
if(exercises.length === 0){
alert(“This workout has no exercises.”);
return;
}
idx = 0; round = 1; elapsed = 0; paused = false; halfSpoken = false;

totalTime =
  cfg.warmup +
  cfg.cooldown +
  cfg.rounds * exercises.length * (cfg.work + cfg.rest);

const bp = $("btnPause");
if(bp){ bp.textContent = "Pause"; bp.disabled = false; }
bind("btnSkip",     skip);    const bs = $("btnSkip");    if(bs) bs.disabled = false;
bind("btnRestart",  restartMove); const br = $("btnRestart"); if(br) br.disabled = false;
const dp = $("donePanel"); if(dp) dp.style.display = "none";

show("run");

// play briefing, then start after a short pause
const speechSecs = briefing(cfg, exercises);
const delay = Math.min(speechSecs, 12); // cap at 12s
setTimeout(() => {
  setState("warmup", cfg.warmup, null); // null = no speak, briefing already going
}, delay * 1000);

}

function setState(s, dur, label){
state    = s;
duration = dur;
t        = dur;
paused   = false;
const bp = $(“btnPause”);
if(bp) bp.textContent = “Pause”;
if(label) speak(label);
updateUI();
run();
}

function run(){
clearInterval(timer);
timer = setInterval(tick, 1000);
}

function tick(){
if(state === “idle” || paused) return;
t–;
elapsed++;


// encouragement
checkEncouragement();

// beep countdown for last 5 seconds
if(t === 5) beepCountdown();

updateUI();
if(t <= 0) next();


}

function checkEncouragement(){
if(!cfg) return;


// "halfway there" when total elapsed hits 50%
if(!halfSpoken && elapsed >= totalTime * 0.5){
  halfSpoken = true;
  speakQueue("Halfway there! Keep it up!", 0.5);
}

// random encouragement during work phase at roughly 1/3 remaining
if(state === "work" && t === Math.floor(duration * 0.33)){
  const lines = [
    "Great work, keep pushing!",
    "You're doing amazing!",
    "Stay strong!",
    "Don't stop now!",
    "Looking good, keep going!"
  ];
  speakQueue(lines[Math.floor(Math.random() * lines.length)], 0);
}


}

function next(){
switch(state){


  case "warmup":
    // announce first exercise, beep into it
    announceAndStart(exercises[0]);
    break;

  case "work":
    // rest: announce the next exercise coming up
    {
      const upcoming = exercises[idx + 1] !== undefined
        ? exercises[idx + 1]
        : (round < cfg.rounds ? exercises[0] : null);
      let restMsg = "Rest.";
      if(upcoming) restMsg += ` Next up: ${upcoming}.`;
      else if(round >= cfg.rounds) restMsg += " Last set done! Cool down coming up.";
      speak(restMsg);
      setState("rest", cfg.rest, null);
    }
    break;

  case "rest":
    idx++;
    if(idx >= exercises.length){
      idx = 0;
      round++;
      if(round > cfg.rounds){
        speak("Great job! Now let's cool down.");
        setState("cooldown", cfg.cooldown, null);
        return;
      }
    }
    announceAndStart(exercises[idx]);
    break;

  case "cooldown":
    clearInterval(timer);
    state = "idle";
    showDone();
    break;
}


}

// announce next exercise during rest/warmup, then beep into work
function announceAndStart(exerciseName){
// speak the exercise name now
speak(`Get ready for ${exerciseName}.`);
// after ~2s, play a go beep and start the work phase
setTimeout(() => {
beepGo();
setState(“work”, cfg.work, null);
// speak exercise name again right as it starts
setTimeout(() => speak(exerciseName), 300);
}, 2000);
}

function showDone(){
speak(“Congratulations! Workout complete! You crushed it!”);
elapsed = totalTime;
updateUI();
const dp = $(“donePanel”); if(dp) dp.style.display = “block”;
const bp = $(“btnPause”);  if(bp) bp.disabled = true;
const bs = $(“btnSkip”);   if(bs) bs.disabled = true;
const br = $(“btnRestart”);if(br) br.disabled = true;
}

// =========================
// CONTROLS
// =========================
function togglePause(){
if(state === “idle”) return;
paused = !paused;
const bp = $(“btnPause”);
if(bp) bp.textContent = paused ? “Resume” : “Pause”;
if(paused) speechSynthesis.cancel();
}

function skip(){
if(state === “idle”) return;
clearInterval(timer);
t = 0;
next();
}

function restartMove(){
if(state === “idle”) return;
paused = false;
const bp = $(“btnPause”);
if(bp) bp.textContent = “Pause”;
setState(state, duration, null);
}

// =========================
// UI UPDATE
// =========================
const CIRC = 2 * Math.PI * 90; // ≈ 565

function updateUI(){
// timer number
const timerEl = $(“timer”);
if(timerEl) timerEl.textContent = t;


// phase label
const phase = $("phase");
if(phase){
  const labels = {
    warmup: "WARM UP", work: "WORK", rest: "REST",
    cooldown: "COOL DOWN", idle: "DONE"
  };
  phase.textContent = labels[state] || state.toUpperCase();
}

// current exercise
const cur = $("current");
if(cur) cur.textContent = (state === "work") ? (exercises[idx] || "") : "";

// next hint
let nextHint = "";
if(state === "work" && exercises[idx + 1]) nextHint = "Next: " + exercises[idx + 1];
if(state === "rest" && exercises[idx])      nextHint = "Next: " + exercises[idx];
const nextEl = $("next");
if(nextEl) nextEl.textContent = nextHint;

// round counter
const meta = $("meta");
if(meta) meta.textContent = (cfg && state !== "warmup" && state !== "cooldown" && state !== "idle")
  ? `Round ${round} / ${cfg.rounds}`
  : "";

// SVG ring — fills as phase counts DOWN (starts full, drains to empty)
const circle = $("progressCircle");
if(circle && duration > 0){
  const frac = t / duration; // 1→0
  circle.style.strokeDashoffset = CIRC * (1 - frac);
  circle.style.stroke =
    state === "work"     ? "#ff9f0a" :
    state === "rest"     ? "#007aff" :
    state === "warmup"   ? "#34c759" :
    state === "cooldown" ? "#34c759" : "#aaa";
}

// total progress bar
const bar = $("totalProgress");
if(bar && totalTime > 0){
  const pct = Math.min(100, (elapsed / totalTime) * 100);
  bar.style.width = pct + "%";
  const label = $("barLabel");
  if(label) label.textContent = Math.round(pct) + "% complete";
}

}

})();
