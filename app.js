
const EQUIPMENT_TAGS = ["Mat","Dumbbells","Barbell","Bench","Pull-up Bar","Cable Machine","Kettlebell","Resistance Band","Box/Step","Machines","Other"];
const EQUIP_TO_TAG = {
  "Dumbbells":"Dumbbells","Dumbbell":"Dumbbells","Barbell":"Barbell","EZ Bar":"Barbell",
  "Bench":"Bench","Incline Bench":"Bench","Preacher Bench":"Bench",
  "Pull-up Bar":"Pull-up Bar","TRX":"Pull-up Bar","Cable Machine":"Cable Machine",
  "Kettlebell":"Kettlebell","Resistance Band":"Resistance Band",
  "Box":"Box/Step","Step":"Box/Step","Mat":"Mat",
  "Leg Press Machine":"Machines","Leg Curl Machine":"Machines","Leg Extension Machine":"Machines",
  "Hyperextension Bench":"Machines","Dip Station":"Machines",
  "Wall":"Other","Weight Plate":"Other","Anchor":"Other","Jump Rope":"Other"
};

function canDoExercise(name, selectedTags){
  const reqs = EXERCISE_EQUIPMENT[name] || [];
  if(reqs.length === 0) return true;
  return reqs.every(function(group){
    return group.some(function(eq){ return selectedTags.has(EQUIP_TO_TAG[eq]); });
  });
}

function getEquipmentLabel(name){
  const reqs = EXERCISE_EQUIPMENT[name] || [];
  if(reqs.length === 0) return "Bodyweight";
  return reqs.map(function(g){ return g.map(function(e){ return EQUIP_TO_TAG[e]||e; }).filter(function(v,i,a){ return a.indexOf(v)===i; }).join("/"); }).join(" + ");
}



// =========================
// STATE
// =========================
let workouts = [];
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
let nearEndSpoken = false;
let announced = false;
let briefingDone = false;
let beepTimeouts = [];
let progressOffset = 0;
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
// SPEECH & VOICE
// =========================
var selectedVoiceName = localStorage.getItem("hiitVoice") || "";
var voices = [];
var isCN = false;

function loadVoices(){
  voices = speechSynthesis.getVoices().filter(function(v){
    return v.lang.startsWith("en") || v.lang.startsWith("zh");
  });
  updateVoiceState();
}
if(speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

function updateVoiceState(){
  var v = getSelectedVoice();
  isCN = v ? v.lang.startsWith("zh") : false;
}

function getSelectedVoice(){
  if(!selectedVoiceName) return null;
  for(var i = 0; i < voices.length; i++){
    if(voices[i].name === selectedVoiceName) return voices[i];
  }
  return null;
}

function cycleVoice(){
  if(voices.length === 0) loadVoices();
  if(voices.length === 0) return;
  var idx = -1;
  for(var i = 0; i < voices.length; i++){
    if(voices[i].name === selectedVoiceName){ idx = i; break; }
  }
  idx = (idx + 1) % voices.length;
  selectedVoiceName = voices[idx].name;
  localStorage.setItem("hiitVoice", selectedVoiceName);
  updateVoiceState();
  updateVoiceUI();
  speak(isCN ? "你好，我是" + voices[idx].name : "Hello, I am " + voices[idx].name);
}

function updateVoiceUI(){
  var btn = $("btnVoice");
  if(btn){
    var v = getSelectedVoice();
    btn.textContent = v ? v.name : "Default Voice";
  }
}

// Translation helper
function tr(en, cn){ return isCN ? (cn || en) : en; }

function exName(exercise){
  if(!exercise) return "";
  var name = typeof exercise === "string" ? exercise : exercise.name;
  if(isCN){
    var cn = (typeof getChineseName === "function") ? getChineseName(name) : "";
    return cn || name;
  }
  return name;
}

function speak(text){
  try{
    var utter = new SpeechSynthesisUtterance(text);
    var v = getSelectedVoice();
    if(v){ utter.voice = v; utter.lang = v.lang; }
    else { utter.lang = "en-US"; }
    utter.rate = 1.05;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }catch(e){}
}

function speakQueue(text, delay){
  try{
    var utter = new SpeechSynthesisUtterance(text);
    var v = getSelectedVoice();
    if(v){ utter.voice = v; utter.lang = v.lang; }
    else { utter.lang = "en-US"; }
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
  updateMusicUI();
  updateVoiceUI();
  show("main");
}

init();

// =========================
// NAV
// =========================
function show(page){
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  const target = $(page);
  if(target) target.style.display = "block";
  if(page === "main")    renderManage();
  if(page === "detail")  renderDetail();
  if(page === "suggest") renderSuggest();
}

// =========================
// STATIC BUTTONS
// =========================
function bindStaticUI(){
  bind("btnSuggest",   () => show("suggest"));
  bind("btnNew",       newWorkout);
  bind("btnStartTop",  () => { if(detailIndex != null) startWorkout(detailIndex); });
  bind("btnStartBottom", () => { if(detailIndex != null) startWorkout(detailIndex); });
  bind("btnDetailEdit", () => { if(detailIndex != null) edit(detailIndex); });
  bind("btnDetailDelete", () => {
    if(detailIndex != null && confirm("Delete this workout?")){
      workouts.splice(detailIndex, 1); saveLS(); detailIndex = null; show("main");
    }
  });
  bind("btnDetailBack", () => show("main"));
  bind("btnAddEx",     () => addExercise());
  bind("btnPickEx",    openPicker);
  bind("btnSave",      save);
  bind("btnBackEdit",  () => { if(detailIndex != null) showDetail(detailIndex); else show("main"); });
  bind("btnBackSuggest", () => show("main"));
  bind("btnGenerate",  generateWorkout);
  bind("btnSelectAll", () => toggleAllParts(true));
  bind("btnDeselectAll", () => toggleAllParts(false));
  bind("btnEqSelectAll", () => { EQUIPMENT_TAGS.forEach(t => suggestEquip.add(t)); renderSuggest(); });
  bind("btnEqDeselectAll", () => { suggestEquip.clear(); renderSuggest(); });
  bind("btnPause",     togglePause);
  bind("btnSkip",      skip);
  bind("btnRestart",   restartMove);
  bind("btnHome",      goHome);
  bind("btnHome2",     goHome);
  bind("btnEndEarly",  endEarly);
  bind("btnMusicToggle", toggleMusic);
  bind("btnMusicStyle",  cycleMusic);
  bind("btnVoice",       cycleVoice);
  bind("btnPickerDone",   pickerDone);
  bind("btnPickerCancel", closePicker);

  // Pull-down-to-dismiss for picker
  var pickerTouchStartY = 0;
  var pickerBox = document.querySelector(".picker-box");
  if(pickerBox){
    pickerBox.addEventListener("touchstart", function(e){
      if(pickerBox.scrollTop <= 0) pickerTouchStartY = e.touches[0].clientY;
      else pickerTouchStartY = 0;
    });
    pickerBox.addEventListener("touchmove", function(e){
      if(pickerTouchStartY && pickerBox.scrollTop <= 0){
        var diff = e.touches[0].clientY - pickerTouchStartY;
        if(diff > 0){
          pickerBox.style.transform = "translateY(" + diff + "px)";
          pickerBox.style.transition = "none";
          e.preventDefault();
        }
      }
    }, {passive: false});
    pickerBox.addEventListener("touchend", function(e){
      if(pickerTouchStartY){
        var diff = e.changedTouches[0].clientY - pickerTouchStartY;
        pickerBox.style.transition = "transform 0.2s";
        pickerBox.style.transform = "";
        if(diff > 80) closePicker();
      }
      pickerTouchStartY = 0;
    });
  }
}

function goHome(){
  clearInterval(timer);
  clearBeeps();
  stopMusic();
  speechSynthesis.cancel();
  state = "idle";
  paused = false;
  show("main");
}

function endEarly(){
  if(confirm("End workout early?")){
    clearInterval(timer);
    clearBeeps();
    stopMusic();
    speechSynthesis.cancel();
    speak(tr("Workout ended","训练结束"));
    const savedState = state;
    state = "idle";
    paused = false;
    renderSummary(true, savedState);
    updateUI();
    const dp = $("donePanel"); if(dp) dp.style.display = "block";
    const dm = $("doneMsg"); if(dm) dm.textContent = "Workout ended early";
    const wi = $("workoutInfo"); if(wi) wi.style.display = "none";
    const bp = $("btnPause");  if(bp) bp.disabled = true;
    const bs = $("btnSkip");   if(bs) bs.disabled = true;
    const br = $("btnRestart");if(br) br.disabled = true;
    const be = $("btnEndEarly"); if(be) be.style.display = "none";
  }
}

// =========================
// MAIN PAGE (workout list)
// =========================
var detailIndex = null;

function renderManage(){
  const list = $("manageList");
  if(!list) return;
  list.innerHTML = "";
  if(workouts.length === 0){
    list.innerHTML = '<p style="color:#888;margin:20px 0;">No workouts yet. Create one below!</p>';
    return;
  }
  workouts.forEach((w, i) => {
    const exCount = (w.exercises || []).length;
    const totalMin = estimateWorkoutMin(w);
    const div = document.createElement("div");
    div.className = "card card-clickable";
    div.innerHTML =
      `<div class="card-info"><b>${w.name}</b><span>${w.rounds} rounds &middot; ${exCount} exercises &middot; ${w.work}s/${w.rest}s &middot; ~${totalMin}min</span></div>`;
    div.onclick = () => showDetail(i);
    list.appendChild(div);
  });
}

function estimateWorkoutMin(w){
  const exCount = (w.exercises || []).length;
  const waterBreaks = w.water > 0 ? Math.max(0, w.rounds - 1) : 0;
  const total = w.warmup + w.cooldown + w.rounds * exCount * (w.work + w.rest) + waterBreaks * (w.water - w.rest);
  return Math.round(total / 60);
}

function showDetail(i){
  detailIndex = i;
  renderDetail();
  show("detail");
}

function renderDetail(){
  if(detailIndex == null || !workouts[detailIndex]) return;
  const w = workouts[detailIndex];
  const exs = normalizeExercises(w.exercises);
  const totalMin = estimateWorkoutMin(w);

  let html = '<h2 class="detail-title">' + w.name + '</h2>';
  html += '<div class="detail-stats">';
  html += '<div class="detail-stat"><span class="detail-stat-val">' + w.rounds + '</span><span class="detail-stat-label">Rounds</span></div>';
  html += '<div class="detail-stat"><span class="detail-stat-val">' + w.work + 's</span><span class="detail-stat-label">Work</span></div>';
  html += '<div class="detail-stat"><span class="detail-stat-val">' + w.rest + 's</span><span class="detail-stat-label">Rest</span></div>';
  html += '<div class="detail-stat"><span class="detail-stat-val">~' + totalMin + 'm</span><span class="detail-stat-label">Total</span></div>';
  html += '</div>';

  if(w.warmup || w.cooldown || w.water){
    html += '<div class="detail-extra">';
    if(w.warmup) html += 'Warmup: ' + w.warmup + 's &middot; ';
    if(w.cooldown) html += 'Cooldown: ' + w.cooldown + 's &middot; ';
    if(w.water) html += 'Water: ' + w.water + 's';
    html += '</div>';
  }

  html += '<h3 class="detail-section-title">Exercises (' + exs.length + ')</h3>';
  html += '<div class="detail-exercise-list">';
  exs.forEach((ex, j) => {
    const eqLabel = getEquipmentLabel(ex.name);
    const hasVid = typeof getVideoId === "function" && getVideoId(ex.name);
    const tutClick = typeof showTutorialOverlay === "function" ?
      ' onclick="showTutorialOverlay(\'' + ex.name.replace(/'/g, "\\'") + '\')"' : '';
    html += '<div class="detail-exercise">';
    html += '<span class="detail-ex-num">' + (j + 1) + '</span>';
    html += '<div class="detail-ex-info">';
    var cnName = (typeof getChineseName === "function") ? getChineseName(ex.name) : "";
    html += '<div class="detail-ex-name">' + ex.name + (cnName ? ' <span class="cn-name">' + cnName + '</span>' : '') + '</div>';
    html += '<div class="detail-ex-meta">' + ex.category + ' &middot; ' + eqLabel + '</div>';
    html += '</div>';
    html += '<span class="detail-ex-tutorial"' + tutClick + '>' + (hasVid ? '&#9654;' : '&#9654;') + '</span>';
    html += '</div>';
  });
  html += '</div>';

  $("detailContent").innerHTML = html;
}

// =========================
// EXERCISE PICKER
// =========================
let pickerSelected = new Set();

let pickerEquip = new Set(EQUIPMENT_TAGS);

function openPicker(){
  pickerSelected = new Set();
  renderPicker();
  $("pickerOverlay").style.display = "flex";
}

function renderPicker(){
  const eqRow = $("pickerEquip");
  if(eqRow){
    eqRow.innerHTML = "";
    var selBtn = document.createElement("button");
    selBtn.textContent = "Select All";
    selBtn.className = "picker-eq-btn";
    selBtn.onclick = () => { EQUIPMENT_TAGS.forEach(t => pickerEquip.add(t)); renderPicker(); };
    eqRow.appendChild(selBtn);
    var deselBtn = document.createElement("button");
    deselBtn.textContent = "Deselect All";
    deselBtn.className = "picker-eq-btn";
    deselBtn.onclick = () => { pickerEquip.clear(); renderPicker(); };
    eqRow.appendChild(deselBtn);
    EQUIPMENT_TAGS.forEach(tag => {
      const btn = document.createElement("button");
      btn.textContent = tag;
      btn.className = "picker-eq-btn" + (pickerEquip.has(tag) ? " selected" : "");
      btn.onclick = () => {
        if(pickerEquip.has(tag)) pickerEquip.delete(tag);
        else pickerEquip.add(tag);
        renderPicker();
      };
      eqRow.appendChild(btn);
    });
  }

  const list = $("pickerList");
  if(!list) return;
  list.innerHTML = "";

  Object.entries(EXERCISE_LIBRARY).forEach(([category, exArr]) => {
    const filtered = exArr.filter(name => canDoExercise(name, pickerEquip));
    if(filtered.length === 0) return;

    const cat = document.createElement("div");
    cat.className = "picker-category";
    cat.textContent = category + " (" + filtered.length + ")";
    list.appendChild(cat);

    filtered.forEach(name => {
      const eqLabel = getEquipmentLabel(name);
      const item = document.createElement("div");
      item.className = "picker-item" + (pickerSelected.has(name) ? " selected" : "");
      var tutBtn = (typeof getTutorialHtml === "function") ? getTutorialHtml(name) : "";
      var cnPick = (typeof getChineseName === "function") ? getChineseName(name) : "";
      var cnPickHtml = cnPick ? ' <span class="cn-name">' + cnPick + '</span>' : '';
      item.innerHTML = `<span class="check">${pickerSelected.has(name) ? "\u2713" : "\u25CB"}</span><span>${name}${cnPickHtml}</span><span class="picker-eq-label">${eqLabel}</span>${tutBtn}`;
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
}

function closePicker(){
  $("pickerOverlay").style.display = "none";
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
  div.draggable = false;
  const safeName = (typeof name === "string") ? name : "";
  const safeCat = category || "Other";
  let options = CATEGORIES.map(c =>
    `<option value="${c}"${c === safeCat ? " selected" : ""}>${c}</option>`
  ).join("");
  const eqLabel = safeName ? getEquipmentLabel(safeName) : "";
  const eqHtml = eqLabel ? `<span class="eq-label">${eqLabel}</span>` : "";
  var tutHtml = (typeof getFormTutorialHtml === "function") ? getFormTutorialHtml(safeName) : "";
  var cnForm = (safeName && typeof getChineseName === "function") ? getChineseName(safeName) : "";
  var cnFormHtml = cnForm ? `<span class="cn-name">${cnForm}</span>` : "";
  div.innerHTML = `<span class="drag-handle">\u2261</span><input placeholder="Exercise name" value="${safeName}">${cnFormHtml}<select class="ex-category">${options}</select>${eqHtml}${tutHtml}<button type="button">\u2715</button>`;
  div.querySelector("button").onclick = () => div.remove();
  initDragHandle(div);
  list.appendChild(div);
}

// Drag-to-reorder exercise rows
var dragEl = null;
var dragStartY = 0;
var dragPlaceholder = null;

function initDragHandle(row){
  var handle = row.querySelector(".drag-handle");
  if(!handle) return;
  handle.addEventListener("touchstart", function(e){
    e.preventDefault();
    dragEl = row;
    dragStartY = e.touches[0].clientY;
    row.classList.add("dragging");
    dragPlaceholder = document.createElement("div");
    dragPlaceholder.className = "drag-placeholder";
    dragPlaceholder.style.height = row.offsetHeight + "px";
    row.parentNode.insertBefore(dragPlaceholder, row);
    row.style.position = "fixed";
    row.style.left = "0";
    row.style.right = "0";
    row.style.zIndex = "50";
    row.style.top = (row.getBoundingClientRect().top) + "px";
  });
  handle.addEventListener("touchmove", function(e){
    if(!dragEl) return;
    e.preventDefault();
    var y = e.touches[0].clientY;
    dragEl.style.top = (y - 20) + "px";
    var list = $("exerciseList");
    if(!list) return;
    var children = Array.from(list.querySelectorAll(".exercise:not(.dragging)"));
    for(var i = 0; i < children.length; i++){
      var rect = children[i].getBoundingClientRect();
      var mid = rect.top + rect.height / 2;
      if(y < mid){
        list.insertBefore(dragPlaceholder, children[i]);
        return;
      }
    }
    list.appendChild(dragPlaceholder);
  }, {passive: false});
  handle.addEventListener("touchend", function(){
    if(!dragEl) return;
    dragEl.classList.remove("dragging");
    dragEl.style.position = "";
    dragEl.style.left = "";
    dragEl.style.right = "";
    dragEl.style.zIndex = "";
    dragEl.style.top = "";
    if(dragPlaceholder && dragPlaceholder.parentNode){
      dragPlaceholder.parentNode.insertBefore(dragEl, dragPlaceholder);
      dragPlaceholder.remove();
    }
    dragEl = null;
    dragPlaceholder = null;
  });

  // Mouse support for desktop
  handle.addEventListener("mousedown", function(e){
    e.preventDefault();
    dragEl = row;
    dragStartY = e.clientY;
    row.classList.add("dragging");
    dragPlaceholder = document.createElement("div");
    dragPlaceholder.className = "drag-placeholder";
    dragPlaceholder.style.height = row.offsetHeight + "px";
    row.parentNode.insertBefore(dragPlaceholder, row);
    row.style.position = "fixed";
    row.style.left = "0";
    row.style.right = "0";
    row.style.zIndex = "50";
    row.style.top = row.getBoundingClientRect().top + "px";

    function onMove(ev){
      if(!dragEl) return;
      ev.preventDefault();
      dragEl.style.top = (ev.clientY - 20) + "px";
      var list = $("exerciseList");
      if(!list) return;
      var children = Array.from(list.querySelectorAll(".exercise:not(.dragging)"));
      for(var j = 0; j < children.length; j++){
        var rect = children[j].getBoundingClientRect();
        if(ev.clientY < rect.top + rect.height / 2){
          list.insertBefore(dragPlaceholder, children[j]);
          return;
        }
      }
      list.appendChild(dragPlaceholder);
    }
    function onUp(){
      if(!dragEl) return;
      dragEl.classList.remove("dragging");
      dragEl.style.position = "";
      dragEl.style.left = "";
      dragEl.style.right = "";
      dragEl.style.zIndex = "";
      dragEl.style.top = "";
      if(dragPlaceholder && dragPlaceholder.parentNode){
        dragPlaceholder.parentNode.insertBefore(dragEl, dragPlaceholder);
        dragPlaceholder.remove();
      }
      dragEl = null;
      dragPlaceholder = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
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
  var savedIdx = (editingIndex != null) ? editingIndex : workouts.length - 1;
  showDetail(savedIdx);
}

function saveLS(){
  localStorage.setItem("hiitWorkouts", JSON.stringify(workouts));
}

// =========================
// SMART WORKOUT GENERATOR
// =========================
let suggestTime = 30;
let suggestIntensity = "moderate";
let suggestParts = new Set();
let suggestEquip = new Set(EQUIPMENT_TAGS);

const INTENSITY_PRESETS = {
  easy:     { work: 30, rest: 30, warmup: 60, cooldown: 60, water: 60 },
  moderate: { work: 45, rest: 20, warmup: 60, cooldown: 60, water: 45 },
  intense:  { work: 60, rest: 15, warmup: 60, cooldown: 60, water: 30 }
};

const BODY_PARTS = Object.keys(EXERCISE_LIBRARY).filter(c => c !== "Flexibility");

function renderSuggest(){
  renderOptionRow("timeOptions", [20, 30, 45, 60], suggestTime, v => {
    suggestTime = v;
    renderSuggest();
  }, v => v + " min");

  renderOptionRow("intensityOptions", ["easy", "moderate", "intense"], suggestIntensity, v => {
    suggestIntensity = v;
    renderSuggest();
  }, v => v.charAt(0).toUpperCase() + v.slice(1));

  const grid = $("bodyPartOptions");
  if(!grid) return;
  grid.innerHTML = "";
  BODY_PARTS.forEach(part => {
    const btn = document.createElement("button");
    btn.textContent = part;
    if(suggestParts.has(part)) btn.classList.add("selected");
    btn.onclick = () => {
      if(suggestParts.has(part)) suggestParts.delete(part);
      else suggestParts.add(part);
      renderSuggest();
    };
    grid.appendChild(btn);
  });

  var eqGrid = $("equipOptions");
  if(!eqGrid) return;
  eqGrid.innerHTML = "";
  EQUIPMENT_TAGS.forEach(function(tag){
    var btn = document.createElement("button");
    btn.textContent = tag;
    if(suggestEquip.has(tag)) btn.classList.add("selected");
    btn.onclick = function(){
      if(suggestEquip.has(tag)) suggestEquip.delete(tag);
      else suggestEquip.add(tag);
      renderSuggest();
    };
    eqGrid.appendChild(btn);
  });
}

function renderOptionRow(id, values, current, onSelect, label){
  const row = $(id);
  if(!row) return;
  row.innerHTML = "";
  values.forEach(v => {
    const btn = document.createElement("button");
    btn.textContent = label(v);
    if(v === current) btn.classList.add("selected");
    btn.onclick = () => onSelect(v);
    row.appendChild(btn);
  });
}

function toggleAllParts(on){
  if(on) BODY_PARTS.forEach(p => suggestParts.add(p));
  else suggestParts.clear();
  renderSuggest();
}

function generateWorkout(){
  if(suggestParts.size === 0){
    alert("Select at least one body part.");
    return;
  }

  const p = INTENSITY_PRESETS[suggestIntensity];
  const totalSecs = suggestTime * 60;
  const available = totalSecs - p.warmup - p.cooldown;
  const cycleTime = p.work + p.rest;

  let best = null;
  for(let r = 2; r <= 5; r++){
    const net = available - (r - 1) * Math.max(0, p.water - p.rest);
    const n = Math.floor(net / (r * cycleTime));
    if(n < 4 || n > 20) continue;
    const dist = Math.abs(n - 10);
    if(!best || dist < best.dist || (dist === best.dist && r > best.rounds)){
      best = { rounds: r, numEx: n, dist };
    }
  }
  if(!best){
    const net = available - Math.max(0, p.water - p.rest);
    best = { rounds: 2, numEx: Math.max(4, Math.floor(net / (2 * cycleTime))) };
  }

  const parts = orderPartsForAlternation([...suggestParts]);
  const ex = pickExercises(parts, best.numEx);

  const w = {
    name: suggestTime + "min " + suggestIntensity.charAt(0).toUpperCase() + suggestIntensity.slice(1),
    work: p.work,
    rest: p.rest,
    rounds: best.rounds,
    water: p.water,
    warmup: p.warmup,
    cooldown: p.cooldown,
    exercises: ex
  };

  editingIndex = null;
  loadForm(w);
  show("form");
}

function orderPartsForAlternation(parts){
  const upper = ["Chest", "Shoulders", "Upper Back", "Arms"];
  const lower = ["Legs", "Glutes"];
  const core = ["Abs", "Lower Back"];
  const other = ["Cardio", "Full Body"];

  const groups = [
    parts.filter(p => upper.includes(p)),
    parts.filter(p => lower.includes(p)),
    parts.filter(p => core.includes(p)),
    parts.filter(p => other.includes(p))
  ].filter(g => g.length > 0);

  const result = [];
  const maxLen = Math.max(...groups.map(g => g.length));
  for(let i = 0; i < maxLen; i++){
    groups.forEach(g => {
      if(i < g.length) result.push(g[i]);
    });
  }
  return result;
}

function pickExercises(orderedParts, count){
  const pools = {};
  orderedParts.forEach(part => {
    const available = (EXERCISE_LIBRARY[part] || []).filter(name => canDoExercise(name, suggestEquip));
    for(let i = available.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    pools[part] = available;
  });

  const result = [];
  let pi = 0;
  while(result.length < count){
    const part = orderedParts[pi % orderedParts.length];
    const pool = pools[part];
    if(pool && pool.length > 0){
      result.push({ name: pool.shift(), category: part });
    }
    pi++;
    if(Object.values(pools).every(p => p.length === 0)) break;
  }
  return result;
}

// =========================
// PRE-WORKOUT BRIEFING
// =========================
function briefing(cfg, exercises, onDone){
  const totalMin = Math.round(totalTime / 60);

  var msg;
  if(isCN){
    const cnIntros = ["好的，开始训练！","准备好了吗？开始！","加油！让我们开始吧！","来吧，开始今天的训练！","准备就绪，出发！"];
    const cnIntro = cnIntros[Math.floor(Math.random() * cnIntros.length)];
    const cnExList = exercises.map(e => exName(e)).join("，");
    msg = `${cnIntro} 今天的训练是${cfg.name}。` +
      `共${cfg.rounds}轮，每轮${exercises.length}个动作。` +
      `每个动作${cfg.work}秒，中间休息${cfg.rest}秒。` +
      `总时间大约${totalMin}分钟。` +
      `动作包括：${cnExList}。` +
      `先进行${cfg.warmup}秒热身，准备好！`;
  } else {
    const intros = ["Alright, let's get started!","Let's do this!","Time to work! Let's go!",
      "Ready to crush it? Here we go!","Let's get after it!","OK, game time!","Here we go, let's make it count!"];
    const intro = intros[Math.floor(Math.random() * intros.length)];
    const exList = exercises.map(e => e.name).join(", ");
    msg = `${intro} Today's workout is ${cfg.name}. ` +
      `You'll do ${cfg.rounds} round${cfg.rounds > 1 ? "s" : ""} of ${exercises.length} exercise${exercises.length > 1 ? "s" : ""}. ` +
      `Each exercise is ${cfg.work} seconds, with ${cfg.rest} seconds rest in between. ` +
      `The total workout time is about ${totalMin} minute${totalMin !== 1 ? "s" : ""}. ` +
      `Your exercises are: ${exList}. ` +
      `We'll start with a ${cfg.warmup}-second warm-up. Get ready!`;
  }

  try {
    const utter = new SpeechSynthesisUtterance(msg);
    var v = getSelectedVoice();
    if(v){ utter.voice = v; utter.lang = v.lang; }
    else { utter.lang = "en-US"; }
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
function startWorkout(i){
  if(!workouts[i]){
    alert("Workout not found.");
    return;
  }
  const ctx = getAudioCtx();
  if(ctx.state === "suspended") ctx.resume();

  cfg = workouts[i];
  exercises = normalizeExercises(cfg.exercises);
  if(exercises.length === 0){
    alert("This workout has no exercises.");
    return;
  }
  idx = 0; round = 1; elapsed = 0; paused = false; halfSpoken = false;
  briefingDone = false; progressOffset = 0;

  const waterBreaks = cfg.water > 0 ? Math.max(0, cfg.rounds - 1) : 0;
  totalTime =
    cfg.warmup +
    cfg.cooldown +
    cfg.rounds * exercises.length * (cfg.work + cfg.rest) +
    waterBreaks * (cfg.water - cfg.rest);

  state = "briefing";
  t = cfg.warmup;
  duration = cfg.warmup;

  const bp = $("btnPause");
  if(bp){ bp.textContent = "Pause"; bp.disabled = false; bp.classList.add("control-highlight"); }
  const bs = $("btnSkip"); if(bs) bs.disabled = false;
  const br = $("btnRestart"); if(br) br.disabled = false;
  const dp = $("donePanel"); if(dp) dp.style.display = "none";
  const be = $("btnEndEarly"); if(be) be.style.display = "none";

  renderWorkoutInfo();
  show("run");
  updateMusicUI();
  updateUI();
  startMusic();

  briefing(cfg, exercises, startWarmup);
}

function startWarmup(){
  if(state !== "briefing") return;
  setState("warmup", cfg.warmup, null);
}

function renderWorkoutInfo(){
  const info = $("workoutInfo");
  if(!info) return;
  const exLines = exercises.map((e, i) => {
    var cn = (typeof getChineseName === "function") ? getChineseName(e.name) : "";
    return `${i + 1}. ${e.name}${cn ? ' <span class="cn-name">' + cn + '</span>' : ''} <span class="info-equip">${getEquipmentLabel(e.name)}</span>`;
  }).join("<br>");
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
  nearEndSpoken = false;
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
  if(state === "water") return exercises[0];
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
  if(!announced && (state === "warmup" || state === "rest" || state === "water") && t <= announceAt && t > 0){
    announced = true;
    const upcoming = getUpcomingExercise();
    if(upcoming) speak(tr("Get ready for " + upcoming.name + ".", "准备做" + exName(upcoming) + "。"));
  }

  if(t === 5) beepCountdown();

  updateUI();
  if(t <= 0) next();
}

function checkEncouragement(){
  if(!cfg || state !== "work") return;

  var halfwayMsgs = isCN ?
    ["已经一半了！","坚持住，一半了！","加油，还有一半！","继续保持！","半程完成！"] :
    ["Halfway there!","Half done, keep going!","Halfway! You've got this!","Halfway point, stay strong!","That's half! Push through!"];
  var nearEndMsgs = isCN ?
    ["快完成了！","最后冲刺！","马上就好！","坚持住！","加油！再来几秒！","你太棒了！","不要停！"] :
    ["Almost done!","Final push!","You're almost there!","Just a few more seconds!","Finish strong!","Don't stop now!","Great work, keep pushing!"];

  if(!halfSpoken && t <= Math.floor(duration / 2)){
    halfSpoken = true;
    speakQueue(halfwayMsgs[Math.floor(Math.random() * halfwayMsgs.length)], 0.3);
  }
  if(!nearEndSpoken && duration >= 10 && t <= Math.floor(duration * 0.2)){
    nearEndSpoken = true;
    speakQueue(nearEndMsgs[Math.floor(Math.random() * nearEndMsgs.length)], 0.3);
  }
}

function next(){
  switch(state){

    case "warmup":
      beepGo();
      setState("work", cfg.work, null);
      setTimeout(() => speak(exName(exercises[idx])), 600);
      break;

    case "work":
      {
        const isLastInRound = (idx + 1 >= exercises.length);
        const hasWaterBreak = cfg.water > 0;
        const hasMoreRounds = round < cfg.rounds;

        if(isLastInRound && hasMoreRounds && hasWaterBreak){
          idx = 0;
          round++;
          speak(tr("Round " + (round - 1) + " complete! Take a water break.", "第" + (round - 1) + "轮完成！喝点水休息一下。"));
          setState("water", cfg.water, null);
        } else {
          const upcoming = exercises[idx + 1] !== undefined
            ? exercises[idx + 1]
            : (round < cfg.rounds ? exercises[0] : null);
          var restMsg, restMsgCn;
          restMsg = "Rest."; restMsgCn = "休息。";
          if(upcoming){ restMsg += " Next up: " + upcoming.name + "."; restMsgCn += "下一个：" + exName(upcoming) + "。"; }
          else if(round >= cfg.rounds){ restMsg += " Last set done! Cool down coming up."; restMsgCn += "最后一组完成！准备放松。"; }
          speak(tr(restMsg, restMsgCn));
          setState("rest", cfg.rest, null);
        }
      }
      break;

    case "rest":
      idx++;
      if(idx >= exercises.length){
        idx = 0;
        round++;
        if(round > cfg.rounds){
          speak(tr("Great job! Now let's cool down.", "做得好！现在放松一下。"));
          setState("cooldown", cfg.cooldown, null);
          return;
        }
      }
      beepGo();
      setState("work", cfg.work, null);
      setTimeout(() => speak(exName(exercises[idx])), 600);
      break;

    case "water":
      beepGo();
      setState("work", cfg.work, null);
      setTimeout(() => speak(exName(exercises[idx])), 600);
      break;

    case "cooldown":
      clearInterval(timer);
      state = "idle";
      showDone();
      break;
  }
}

function showDone(){
  stopMusic();
  speak(tr("Congratulations! Workout complete! You crushed it!", "恭喜！训练完成！你太棒了！"));
  elapsed = totalTime;
  updateUI();
  renderSummary(false, "idle");
  const dp = $("donePanel"); if(dp) dp.style.display = "block";
  const dm = $("doneMsg"); if(dm) dm.innerHTML = "&#x1F389; Workout complete!";
  const wi = $("workoutInfo"); if(wi) wi.style.display = "none";
  const bp = $("btnPause");  if(bp) bp.disabled = true;
  const bs = $("btnSkip");   if(bs) bs.disabled = true;
  const br = $("btnRestart");if(br) br.disabled = true;
  const be = $("btnEndEarly"); if(be) be.style.display = "none";
}

function renderSummary(early, prevState){
  const el = $("summary");
  if(!el) return;

  const totalMin = Math.floor(elapsed / 60);
  const totalSec = elapsed % 60;

  const catCount = {};
  let totalExDone = 0;
  let roundsDisplay = "";

  if(!early){
    exercises.forEach(ex => {
      catCount[ex.category] = (catCount[ex.category] || 0) + cfg.rounds;
    });
    totalExDone = exercises.length * cfg.rounds;
    roundsDisplay = `${cfg.rounds} &times; ${exercises.length} exercises`;
  } else {
    const fullRounds = Math.max(0, round - 1);
    exercises.forEach(ex => {
      catCount[ex.category] = (catCount[ex.category] || 0) + fullRounds;
    });
    let doneInRound = 0;
    if(prevState === "rest") doneInRound = idx + 1;
    else if(prevState === "work") doneInRound = idx;
    else if(prevState === "cooldown") doneInRound = exercises.length;
    else if(prevState === "water") doneInRound = exercises.length;
    for(let i = 0; i < doneInRound; i++){
      catCount[exercises[i].category] = (catCount[exercises[i].category] || 0) + 1;
    }
    totalExDone = fullRounds * exercises.length + doneInRound;
    const roundsDone = fullRounds + (doneInRound > 0 ? 1 : 0);
    roundsDisplay = `${roundsDone}/${cfg.rounds} rounds, ${totalExDone} exercises done`;
  }

  let breakdown = "";
  if(totalExDone > 0){
    Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        const pct = Math.round((count / totalExDone) * 100);
        breakdown +=
          `<div class="summary-cat">` +
          `<span class="cat-name">${cat}</span>` +
          `<div class="cat-bar-bg"><div class="cat-bar-fill" style="width:${pct}%"></div></div>` +
          `<span class="cat-pct">${pct}%</span>` +
          `</div>`;
      });
  }

  el.innerHTML =
    `<div class="summary-stat">Duration: ${totalMin}m ${String(totalSec).padStart(2, "0")}s</div>` +
    `<div class="summary-stat">${roundsDisplay}</div>` +
    (totalExDone > 0 ? `<div class="summary-heading">Body Parts Worked</div>` + breakdown : "");
}

// =========================
// CONTROLS
// =========================
function togglePause(){
  if(state === "idle") return;
  paused = !paused;
  const bp = $("btnPause");
  if(bp){
    bp.textContent = paused ? "Resume" : "Pause";
    bp.classList.toggle("control-highlight", true);
  }
  const be = $("btnEndEarly");
  if(be){
    be.style.display = paused ? "inline-block" : "none";
    be.classList.add("control-danger");
  }

  if(paused){
    clearBeeps();
    stopMusic();
    speechSynthesis.cancel();
    if(state === "briefing") briefingDone = true;
    speak(tr("Paused","已暂停"));
    updateUI();
  } else {
    speak(tr("Resumed","继续"));
    if(musicEnabled) startMusic();
    if(state === "briefing" && briefingDone) startWarmup();
    updateUI();
  }
}

function skip(){
  if(state === "idle") return;
  clearInterval(timer);
  clearBeeps();
  speechSynthesis.cancel();

  if(state === "briefing"){
    speak(tr("Skipped","跳过"));
    briefingDone = true;
    setTimeout(startWarmup, 400);
    return;
  }

  speak(tr("Skipped","跳过"));
  progressOffset += t;
  t = 0;
  setTimeout(() => next(), 400);
}

function restartMove(){
  if(state === "idle" || state === "briefing") return;
  clearBeeps();
  speechSynthesis.cancel();
  progressOffset -= (duration - t);
  paused = false;
  speak(tr("Restarting","重新开始"));
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
      water: "WATER BREAK", cooldown: "COOL DOWN", idle: "DONE"
    };
    phase.textContent = labels[state] || state.toUpperCase();
  }

  const cur = $("current");
  if(cur){
    if(state === "work" && exercises[idx]){
      var cn = (typeof getChineseName === "function") ? getChineseName(exercises[idx].name) : "";
      cur.innerHTML = exercises[idx].name + (cn ? ' <span class="cn-name-lg">' + cn + '</span>' : '');
    } else { cur.innerHTML = ""; }
  }

  const eqEl = $("currentEquip");
  if(eqEl) eqEl.textContent = (state === "work" && exercises[idx]) ? getEquipmentLabel(exercises[idx].name) : "";

  if(typeof showExerciseDemo === "function"){
    if(state === "work" && exercises[idx]) showExerciseDemo(exercises[idx].name);
    else hideExerciseDemo();
  }

  // Tutorial area: show tutorial when paused, show hint during work
  if(typeof showWorkoutTutorial === "function"){
    var tutArea = $("tutorialArea");
    if(tutArea){
      if(paused && state !== "idle"){
        var tutName = null;
        if(state === "rest" || state === "water"){
          var ni = idx + 1;
          if(ni < exercises.length) tutName = exercises[ni].name;
          else if(round + 1 <= cfg.rounds) tutName = exercises[0].name;
        } else if(exercises[idx]) tutName = exercises[idx].name;
        if(tutName) showWorkoutTutorial(tutName);
        else { tutArea.innerHTML = ""; tutArea.style.display = "none"; }
      } else if(state === "work"){
        hideWorkoutTutorial();
        tutArea.innerHTML = '<div class="tutorial-hint-box">Pause to watch tutorial</div>';
        tutArea.style.display = "block";
      } else {
        tutArea.innerHTML = "";
        tutArea.style.display = "none";
      }
    }
  }

  let nextName = "";
  if(state === "work" && exercises[idx + 1]) nextName = exercises[idx + 1].name;
  if(state === "rest"){
    const nextIdx = idx + 1;
    if(nextIdx < exercises.length) nextName = exercises[nextIdx].name;
    else if(round + 1 <= cfg.rounds) nextName = exercises[0].name;
  }
  const nextEl = $("next");
  if(nextEl){
    if(nextName){
      const eqLabel = getEquipmentLabel(nextName);
      var nextCn = (typeof getChineseName === "function") ? getChineseName(nextName) : "";
      nextEl.innerHTML = "Next: <strong>" + nextName + "</strong>" + (nextCn ? ' <span class="cn-name">' + nextCn + '</span>' : '') + " <span class='next-equip'>" + eqLabel + "</span>";
    } else {
      nextEl.innerHTML = "";
    }
  }

  const statRound = $("statRound");
  if(statRound) statRound.textContent = (cfg && state !== "idle")
    ? `${Math.min(round, cfg.rounds)}/${cfg.rounds}` : "--";

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
  if(statRemaining) statRemaining.textContent = formatTime(Math.max(0, totalTime - elapsed - progressOffset));

  const circle = $("progressCircle");
  if(circle && duration > 0){
    const frac = t / duration;
    circle.style.strokeDashoffset = CIRC * (1 - frac);
    circle.style.stroke =
      state === "work"     ? "#ff9f0a" :
      state === "rest"     ? "#007aff" :
      state === "water"    ? "#5ac8fa" :
      state === "warmup"   ? "#34c759" :
      state === "cooldown" ? "#34c759" : "#aaa";
  }

  const bar = $("totalProgress");
  if(bar && totalTime > 0){
    const pct = Math.min(100, ((elapsed + progressOffset) / totalTime) * 100);
    bar.style.width = pct + "%";
    const label = $("barLabel");
    if(label) label.textContent = Math.round(pct) + "% complete";
  }
}

