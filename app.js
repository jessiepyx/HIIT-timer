(() => {

const EXERCISE_LIBRARY = {
"Upper Body": [
"Arm Circles", "Arnold Press (no weight)", "Bear Crawl Shoulder Taps",
"Bench Dips", "Burpee to Push-up", "Close-Grip Push-ups",
"Commando Plank", "Decline Push-ups", "Diamond Push-ups",
"Dive Bomber Push-ups", "Fingertip Push-ups", "Hand Release Push-ups",
"Handstand Hold", "Hindu Push-ups", "Inchworm",
"Isometric Towel Curl", "Pike Push-ups", "Plank Shoulder Taps",
"Plank Up-Downs", "Push-ups", "Shoulder Taps",
"Superman Pull", "Tricep Dips", "Wide Push-ups", "YTW Raises"
],
"Core": [
"Ab Rollout (towel)", "Bear Crawl", "Bicycle Crunches",
"Bird Dog", "Butterfly Sit-ups", "Crunches",
"Dead Bug", "Dragon Flag (eccentric)", "Flutter Kicks",
"Hanging Knee Raise", "Heel Touches", "Hollow Body Hold",
"L-Sit Hold", "Leg Raises", "Mountain Climbers",
"Pallof Press (band)", "Plank", "Plank Jacks",
"Reverse Crunch", "Russian Twists", "Scissor Kicks",
"Side Plank Left", "Side Plank Right", "Sit-ups",
"Toe Touches", "V-ups", "Windshield Wipers"
],
"Lower Body": [
"Box Jumps", "Bulgarian Split Squats", "Calf Raises",
"Cossack Squats", "Curtsy Lunges", "Donkey Kicks",
"Fire Hydrants", "Frog Squats", "Glute Bridges",
"Goblet Squats (no weight)", "Hip Thrusts", "Jump Lunges",
"Jump Squats", "Lateral Lunges", "Lunges",
"Pistol Squats", "Reverse Lunges", "Romanian Deadlift (single leg)",
"Side-Lying Leg Raises", "Single-Leg Calf Raises", "Single-Leg Glute Bridge",
"Squats", "Step-ups", "Sumo Squats",
"Wall Sit"
],
"Cardio": [
"Bicycle Sprints", "Box Jumps", "Broad Jumps",
"Burpees", "Butt Kicks", "Fast Feet",
"Frog Jumps", "High Knees", "Ice Skaters",
"Invisible Jump Rope", "Jumping Jacks", "Jumping Lunges",
"Lateral Hops", "Mountain Climbers (fast)", "Plank Jacks",
"Power Skips", "Running in Place", "Seal Jacks",
"Shuttle Run", "Skaters", "Speed Step-ups",
"Split Jumps", "Squat Jacks", "Star Jumps",
"Tuck Jumps"
],
"Full Body": [
"Bear Crawl", "Burpees", "Clean and Press (no weight)",
"Devil Press (no weight)", "Inchworm to Push-up", "Man Makers (no weight)",
"Mountain Climber Twist", "Plank to Squat", "Sprawls",
"Squat to Press", "Thrusters (no weight)", "Turkish Get-up",
"Walkout to Push-up"
],
"Flexibility": [
"Cat-Cow Stretch", "Child's Pose", "Cobra Stretch",
"Downward Dog", "Figure Four Stretch", "Hamstring Stretch",
"Hip Circles", "Hip Flexor Stretch", "IT Band Stretch",
"Lizard Pose", "Pigeon Pose", "Quad Stretch",
"Scorpion Stretch", "Seated Forward Fold", "Spinal Twist",
"Standing Side Bend", "World's Greatest Stretch"
]
};

const CATEGORIES = Object.keys(EXERCISE_LIBRARY).concat("Other");

const EXERCISE_CATEGORIES = {};
Object.entries(EXERCISE_LIBRARY).forEach(([cat, arr]) => {
  arr.forEach(name => { EXERCISE_CATEGORIES[name] = cat; });
});

// =========================
// STATE
// =========================
let workouts = [];
let selected = null;
let editingIndex = null;

let cfg = null;
let exercises = [];

let state = "idle";
let idx = 0;
let round = 1;

let t = 0;
let duration = 0;
let timer = null;
let paused = false;

let elapsed = 0;
let totalTime = 0;

let halfSpoken = false;
let announced = false;
let briefingDone = false;
let beepTimeouts = [];

// =========================
// UTIL
// =========================
const $ = (id) => document.getElementById(id);

function bind(id, fn){
  const el = $(id);
  if(el) el.onclick = fn;
}

function normalizeExercises(arr){
  return (arr || []).map(ex => {
    if(typeof ex === "string") return { name: ex, category: EXERCISE_CATEGORIES[ex] || "Other" };
    return { name: ex.name, category: ex.category || EXERCISE_CATEGORIES[ex.name] || "Other" };
  });
}

function formatTime(secs){
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + ":" + String(s).padStart(2, "0");
}

// =========================
// AUDIO
// =========================
let audioCtx = null;

function getAudioCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function beep(freq, dur){
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.01);
  } catch(e){}
}

function scheduleBeep(freq, dur, delaySec){
  if(delaySec <= 0){ beep(freq, dur); return; }
  const tid = setTimeout(() => beep(freq, dur), delaySec * 1000);
  beepTimeouts.push(tid);
}

function clearBeeps(){
  beepTimeouts.forEach(id => clearTimeout(id));
  beepTimeouts = [];
}

function beepCountdown(){
  for(let i = 0; i < 5; i++){
    scheduleBeep(660 + i * 40, 0.15, i);
  }
}

function beepGo(){
  scheduleBeep(880, 0.15, 0);
  scheduleBeep(1100, 0.2, 0.18);
}

// =========================
// SPEECH
// =========================
function speak(text){
  try{
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1.05;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }catch(e){}
}

function speakQueue(text, delay){
  try{
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1.05;
    setTimeout(() => speechSynthesis.speak(utter), (delay || 0) * 1000);
  }catch(e){}
}

// =========================
// INIT
// =========================
function init(){
  workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");
  bindStaticUI();
  show("home");
}

init();

// =========================
// NAV
// =========================
function show(page){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = $(page);
  if(target) target.classList.add("active");
  if(page === "select") renderSelect();
  if(page === "edit")   renderManage();
}

// =========================
// STATIC BUTTONS
// =========================
function bindStaticUI(){
  bind("btnChoose",    () => show("select"));
  bind("btnEdit",      () => show("edit"));
  bind("btnBackHome1", () => show("home"));
  bind("btnBackHome2", () => show("home"));
  bind("btnStart",     startSelected);
  bind("btnNew",       newWorkout);
  bind("btnAddEx",     () => addExercise());
  bind("btnPickEx",    openPicker);
  bind("btnSave",      save);
  bind("btnBackEdit",  () => show("edit"));
  bind("btnPause",     togglePause);
  bind("btnSkip",      skip);
  bind("btnRestart",   restartMove);
  bind("btnHome",      goHome);
  bind("btnEndEarly",  endEarly);
  bind("btnPickerDone",   pickerDone);
  bind("btnPickerCancel", () => { $("pickerOverlay").style.display = "none"; });
}

function goHome(){
  clearInterval(timer);
  clearBeeps();
  speechSynthesis.cancel();
  state = "idle";
  paused = false;
  show("home");
}

function endEarly(){
  if(confirm("End workout early?")){
    clearInterval(timer);
    clearBeeps();
    speechSynthesis.cancel();
    speak("Workout ended");
    state = "idle";
    paused = false;
    setTimeout(() => show("home"), 600);
  }
}

// =========================
// SELECT PAGE
// =========================
function renderSelect(){
  const list = $("workoutList");
  if(!list) return;
  list.innerHTML = "";
  workouts.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = w.name;
    div.addEventListener("click", () => {
      selected = i;
      [...list.children].forEach(c => { c.style.border = "none"; });
      div.style.border = "2px solid #007aff";
    });
    list.appendChild(div);
  });
}

// =========================
// EDIT PAGE
// =========================
function renderManage(){
  const list = $("manageList");
  if(!list) return;
  list.innerHTML = "";
  workouts.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<b>${w.name}</b><br> <button class="edit">Edit</button> <button class="del">Delete</button>`;
    list.appendChild(div);
    div.querySelector(".del").onclick = () => {
      workouts.splice(i, 1);
      saveLS();
      renderManage();
    };
    div.querySelector(".edit").onclick = () => edit(i);
  });
}

// =========================
// EXERCISE PICKER
// =========================
let pickerSelected = new Set();

function openPicker(){
  pickerSelected = new Set();
  const list = $("pickerList");
  list.innerHTML = "";

  Object.entries(EXERCISE_LIBRARY).forEach(([category, exArr]) => {
    const cat = document.createElement("div");
    cat.className = "picker-category";
    cat.textContent = category;
    list.appendChild(cat);

    exArr.forEach(name => {
      const item = document.createElement("div");
      item.className = "picker-item";
      item.innerHTML = `<span class="check">\u25CB</span><span>${name}</span>`;
      item.addEventListener("click", () => {
        if(pickerSelected.has(name)){
          pickerSelected.delete(name);
          item.classList.remove("selected");
          item.querySelector(".check").textContent = "\u25CB";
        } else {
          pickerSelected.add(name);
          item.classList.add("selected");
          item.querySelector(".check").textContent = "\u2713";
        }
      });
      list.appendChild(item);
    });
  });

  $("pickerOverlay").style.display = "flex";
}

function pickerDone(){
  pickerSelected.forEach(name => {
    const cat = EXERCISE_CATEGORIES[name] || "Other";
    addExercise(name, cat);
  });
  pickerSelected = new Set();
  $("pickerOverlay").style.display = "none";
}

// =========================
// WORKOUT FORM
// =========================
function newWorkout(){
  editingIndex = null;
  clearForm();
  show("form");
}

function edit(i){
  editingIndex = i;
  loadForm(workouts[i]);
  show("form");
}

function addExercise(name, category){
  const list = $("exerciseList");
  if(!list) return;
  const div = document.createElement("div");
  div.className = "exercise";
  const safeName = (typeof name === "string") ? name : "";
  const safeCat = category || "Other";
  let options = CATEGORIES.map(c =>
    `<option value="${c}"${c === safeCat ? " selected" : ""}>${c}</option>`
  ).join("");
  div.innerHTML = `<input placeholder="Exercise name" value="${safeName}"><select class="ex-category">${options}</select><button type="button">\u2715</button>`;
  div.querySelector("button").onclick = () => div.remove();
  list.appendChild(div);
}

function clearForm(){
  ["name","work","rest","rounds","water","warmup","cooldown"].forEach(id => {
    const el = $(id);
    if(el) el.value = "";
  });
  const list = $("exerciseList");
  if(list) list.innerHTML = "";
}

function loadForm(w){
  if(!w) return;
  ["name","work","rest","rounds","water","warmup","cooldown"].forEach(id => {
    const el = $(id);
    if(el) el.value = w[id] ?? "";
  });
  const list = $("exerciseList");
  if(!list) return;
  list.innerHTML = "";
  normalizeExercises(w.exercises).forEach(ex => addExercise(ex.name, ex.category));
}

function save(){
  const list = $("exerciseList");
  if(!list) return;
  const rows = [...list.querySelectorAll(".exercise")];
  const ex = rows.map(row => {
    const name = row.querySelector("input").value.trim();
    const cat = row.querySelector("select")?.value || "Other";
    return name ? { name, category: cat } : null;
  }).filter(Boolean);
  const w = {
    name:     $("name")?.value.trim() || "Workout",
    work:     +$("work")?.value   || 20,
    rest:     +$("rest")?.value   || 10,
    rounds:   +$("rounds")?.value || 3,
    water:    +$("water")?.value  || 30,
    warmup:   +$("warmup")?.value || 30,
    cooldown: +$("cooldown")?.value || 30,
    exercises: ex
  };
  if(editingIndex != null){ workouts[editingIndex] = w; }
  else { workouts.push(w); }
  saveLS();
  show("edit");
}

function saveLS(){
  localStorage.setItem("hiitWorkouts", JSON.stringify(workouts));
}

// =========================
// PRE-WORKOUT BRIEFING
// =========================
function briefing(cfg, exercises, onDone){
  const totalMin = Math.round(totalTime / 60);
  const exList = exercises.map(e => e.name).join(", ");
  const msg =
    `Alright, let's get started! Today's workout is ${cfg.name}. ` +
    `You'll do ${cfg.rounds} round${cfg.rounds > 1 ? "s" : ""} of ${exercises.length} exercise${exercises.length > 1 ? "s" : ""}. ` +
    `Each exercise is ${cfg.work} seconds, with ${cfg.rest} seconds rest in between. ` +
    `The total workout time is about ${totalMin} minute${totalMin !== 1 ? "s" : ""}. ` +
    `Your exercises are: ${exList}. ` +
    `We'll start with a ${cfg.warmup}-second warm-up. Get ready!`;

  try {
    const utter = new SpeechSynthesisUtterance(msg);
    utter.lang = "en-US";
    utter.rate = 1.05;
    let called = false;
    const finish = () => {
      if(called) return;
      called = true;
      clearTimeout(fallbackTimer);
      briefingDone = true;
      if(state === "briefing" && !paused && onDone) setTimeout(onDone, 500);
    };
    utter.onend = finish;
    utter.onerror = finish;
    const wordCount = msg.split(" ").length;
    const fallbackTimer = setTimeout(finish, Math.min(wordCount / 2.5 + 2, 30) * 1000);
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  } catch(e) {
    briefingDone = true;
    if(onDone) onDone();
  }
}

// =========================
// TIMER ENGINE
// =========================
function startSelected(){
  if(selected == null || !workouts[selected]){
    alert("Please select a workout first.");
    return;
  }
  const ctx = getAudioCtx();
  if(ctx.state === "suspended") ctx.resume();

  cfg = workouts[selected];
  exercises = normalizeExercises(cfg.exercises);
  if(exercises.length === 0){
    alert("This workout has no exercises.");
    return;
  }
  idx = 0; round = 1; elapsed = 0; paused = false; halfSpoken = false;
  briefingDone = false;

  totalTime =
    cfg.warmup +
    cfg.cooldown +
    cfg.rounds * exercises.length * (cfg.work + cfg.rest);

  state = "briefing";
  t = cfg.warmup;
  duration = cfg.warmup;

  const bp = $("btnPause");
  if(bp){ bp.textContent = "Pause"; bp.disabled = false; }
  const bs = $("btnSkip"); if(bs) bs.disabled = false;
  const br = $("btnRestart"); if(br) br.disabled = false;
  const dp = $("donePanel"); if(dp) dp.style.display = "none";
  const be = $("btnEndEarly"); if(be) be.style.display = "none";

  renderWorkoutInfo();
  show("run");
  updateUI();

  briefing(cfg, exercises, startWarmup);
}

function startWarmup(){
  if(state !== "briefing") return;
  setState("warmup", cfg.warmup, null);
}

function renderWorkoutInfo(){
  const info = $("workoutInfo");
  if(!info) return;
  const exLines = exercises.map((e, i) => `${i + 1}. ${e.name}`).join("<br>");
  info.innerHTML =
    `<div class="info-title">${cfg.name}</div>` +
    `<div class="info-detail">${cfg.rounds} rounds &middot; ${cfg.work}s work &middot; ${cfg.rest}s rest</div>` +
    `<div class="info-exercises">${exLines}</div>`;
  info.style.display = "block";
}

function setState(s, dur, label){
  state    = s;
  duration = dur;
  t        = dur;
  paused   = false;
  announced = false;
  halfSpoken = false;
  const bp = $("btnPause");
  if(bp) bp.textContent = "Pause";
  const be = $("btnEndEarly");
  if(be) be.style.display = "none";
  if(label) speak(label);
  updateUI();
  run();
}

function run(){
  clearInterval(timer);
  timer = setInterval(tick, 1000);
}

function getUpcomingExercise(){
  if(state === "warmup") return exercises[0];
  if(state === "rest"){
    if(idx + 1 < exercises.length) return exercises[idx + 1];
    if(round + 1 <= cfg.rounds) return exercises[0];
  }
  return null;
}

function tick(){
  if(state === "idle" || state === "briefing" || paused) return;
  t--;
  elapsed++;

  checkEncouragement();

  const announceAt = Math.min(8, Math.max(1, duration - 1));
  if(!announced && (state === "warmup" || state === "rest") && t <= announceAt && t > 0){
    announced = true;
    const upcoming = getUpcomingExercise();
    if(upcoming) speak(`Get ready for ${upcoming.name}.`);
  }

  if(t === 5 && (state === "work" || state === "cooldown")) beepCountdown();

  updateUI();
  if(t <= 0) next();
}

function checkEncouragement(){
  if(!cfg || state !== "work") return;
  if(!halfSpoken && t <= Math.floor(duration / 2)){
    halfSpoken = true;
    speakQueue("Halfway there!", 0.5);
  }
}

function next(){
  switch(state){

    case "warmup":
      beepGo();
      setState("work", cfg.work, null);
      setTimeout(() => speak(exercises[idx].name), 600);
      break;

    case "work":
      {
        const upcoming = exercises[idx + 1] !== undefined
          ? exercises[idx + 1]
          : (round < cfg.rounds ? exercises[0] : null);
        let restMsg = "Rest.";
        if(upcoming) restMsg += ` Next up: ${upcoming.name}.`;
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
      beepGo();
      setState("work", cfg.work, null);
      setTimeout(() => speak(exercises[idx].name), 600);
      break;

    case "cooldown":
      clearInterval(timer);
      state = "idle";
      showDone();
      break;
  }
}

function showDone(){
  speak("Congratulations! Workout complete! You crushed it!");
  elapsed = totalTime;
  updateUI();
  renderSummary();
  const dp = $("donePanel"); if(dp) dp.style.display = "block";
  const wi = $("workoutInfo"); if(wi) wi.style.display = "none";
  const bp = $("btnPause");  if(bp) bp.disabled = true;
  const bs = $("btnSkip");   if(bs) bs.disabled = true;
  const br = $("btnRestart");if(br) br.disabled = true;
  const be = $("btnEndEarly"); if(be) be.style.display = "none";
}

function renderSummary(){
  const el = $("summary");
  if(!el) return;

  const totalMin = Math.floor(elapsed / 60);
  const totalSec = elapsed % 60;

  const catCount = {};
  const total = exercises.length * cfg.rounds;
  exercises.forEach(ex => {
    catCount[ex.category] = (catCount[ex.category] || 0) + cfg.rounds;
  });

  let breakdown = "";
  Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const pct = Math.round((count / total) * 100);
      breakdown +=
        `<div class="summary-cat">` +
        `<span class="cat-name">${cat}</span>` +
        `<div class="cat-bar-bg"><div class="cat-bar-fill" style="width:${pct}%"></div></div>` +
        `<span class="cat-pct">${pct}%</span>` +
        `</div>`;
    });

  el.innerHTML =
    `<div class="summary-stat">Duration: ${totalMin}m ${String(totalSec).padStart(2, "0")}s</div>` +
    `<div class="summary-stat">Rounds: ${cfg.rounds} &times; ${exercises.length} exercises</div>` +
    `<div class="summary-heading">Body Parts Worked</div>` +
    breakdown;
}

// =========================
// CONTROLS
// =========================
function togglePause(){
  if(state === "idle") return;
  paused = !paused;
  const bp = $("btnPause");
  if(bp) bp.textContent = paused ? "Resume" : "Pause";
  const be = $("btnEndEarly");
  if(be) be.style.display = paused ? "inline-block" : "none";

  if(paused){
    clearBeeps();
    speechSynthesis.cancel();
    if(state === "briefing") briefingDone = true;
    speak("Paused");
  } else {
    speak("Resumed");
    if(state === "briefing" && briefingDone) startWarmup();
  }
}

function skip(){
  if(state === "idle") return;
  clearInterval(timer);
  clearBeeps();
  speechSynthesis.cancel();

  if(state === "briefing"){
    speak("Skipped");
    briefingDone = true;
    setTimeout(startWarmup, 400);
    return;
  }

  speak("Skipped");
  elapsed += t;
  t = 0;
  setTimeout(() => next(), 400);
}

function restartMove(){
  if(state === "idle" || state === "briefing") return;
  clearBeeps();
  speechSynthesis.cancel();
  const spent = duration - t;
  elapsed = Math.max(0, elapsed - spent);
  paused = false;
  speak("Restarting");
  setState(state, duration, null);
}

// =========================
// UI UPDATE
// =========================
const CIRC = 2 * Math.PI * 96;

function updateUI(){
  const timerEl = $("timer");
  if(timerEl) timerEl.textContent = t;

  const phase = $("phase");
  if(phase){
    const labels = {
      briefing: "GET READY", warmup: "WARM UP", work: "WORK", rest: "REST",
      cooldown: "COOL DOWN", idle: "DONE"
    };
    phase.textContent = labels[state] || state.toUpperCase();
  }

  const cur = $("current");
  if(cur) cur.textContent = (state === "work") ? (exercises[idx]?.name || "") : "";

  let nextHint = "";
  if(state === "work" && exercises[idx + 1]) nextHint = "Next: " + exercises[idx + 1].name;
  if(state === "rest"){
    const nextIdx = idx + 1;
    if(nextIdx < exercises.length) nextHint = "Next: " + exercises[nextIdx].name;
    else if(round + 1 <= cfg.rounds) nextHint = "Next: " + exercises[0].name;
  }
  const nextEl = $("next");
  if(nextEl) nextEl.textContent = nextHint;

  const statRound = $("statRound");
  if(statRound) statRound.textContent = (cfg && state !== "idle")
    ? `${round}/${cfg.rounds}` : "--";

  const statExercise = $("statExercise");
  if(statExercise && cfg){
    if(state === "work" || state === "rest"){
      statExercise.textContent = `${idx + 1}/${exercises.length}`;
    } else {
      statExercise.textContent = "--";
    }
  }

  const statElapsed = $("statElapsed");
  if(statElapsed) statElapsed.textContent = formatTime(elapsed);

  const statRemaining = $("statRemaining");
  if(statRemaining) statRemaining.textContent = formatTime(Math.max(0, totalTime - elapsed));

  const circle = $("progressCircle");
  if(circle && duration > 0){
    const frac = t / duration;
    circle.style.strokeDashoffset = CIRC * (1 - frac);
    circle.style.stroke =
      state === "work"     ? "#ff9f0a" :
      state === "rest"     ? "#007aff" :
      state === "warmup"   ? "#34c759" :
      state === "cooldown" ? "#34c759" : "#aaa";
  }

  const bar = $("totalProgress");
  if(bar && totalTime > 0){
    const pct = Math.min(100, (elapsed / totalTime) * 100);
    bar.style.width = pct + "%";
    const label = $("barLabel");
    if(label) label.textContent = Math.round(pct) + "% complete";
  }
}

})();
