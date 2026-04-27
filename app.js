let workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");

// ===== STATE =====
let cfg, exercises;
let selected = null;
let editingIndex = null;

let state = "idle";
let idx = 0;
let round = 1;

let t = 0;
let duration = 0;

let timer = null;
let elapsed = 0;
let totalTime = 0;

// ===== SPEECH =====
function speak(text){
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

// ===== NAV =====
function show(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(page).classList.add("active");

  if(page==="select") renderSelect();
  if(page==="edit") renderManage();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", ()=>{
  bindUI();
  show("home");
});

// ===== BIND UI (核心修复点) =====
function bindUI(){

  // home
  document.getElementById("btnChoose")
    .addEventListener("click", ()=>show("select"));

  document.getElementById("btnEdit")
    .addEventListener("click", ()=>show("edit"));

  // back
  document.getElementById("btnBackHome1")
    .addEventListener("click", ()=>show("home"));

  document.getElementById("btnBackHome2")
    .addEventListener("click", ()=>show("home"));

  // edit
  document.getElementById("btnNew")
    .addEventListener("click", newWorkout);

  document.getElementById("btnAddEx")
    .addEventListener("click", ()=>addExercise());

  document.getElementById("btnSave")
    .addEventListener("click", save);

  // select
  document.getElementById("btnStart")
    .addEventListener("click", startSelected);

  // run controls
  document.getElementById("btnPause")
    .addEventListener("click", pause);

  document.getElementById("btnSkip")
    .addEventListener("click", skip);

  document.getElementById("btnRestart")
    .addEventListener("click", restartMove);
}

// ===== LIST =====
function renderSelect(){
  const list=document.getElementById("workoutList");
  list.innerHTML="";

  workouts.forEach((w,i)=>{
    const div=document.createElement("div");
    div.className="card";
    div.innerText=w.name;

    div.addEventListener("click", ()=>{
      selected=i;
      div.style.border="2px solid #007aff";
    });

    list.appendChild(div);
  });
}

function renderManage(){
  const list=document.getElementById("manageList");
  list.innerHTML="";

  workouts.forEach((w,i)=>{
    const div=document.createElement("div");
    div.className="card";

    div.innerHTML=`
      <b>${w.name}</b><br>
      <button data-edit="${i}">Edit</button>
      <button data-del="${i}">Delete</button>
    `;

    div.querySelector("[data-del]").addEventListener("click",()=>{
      workouts.splice(i,1);
      saveLS();
      renderManage();
    });

    div.querySelector("[data-edit]").addEventListener("click",()=>{
      edit(i);
    });

    list.appendChild(div);
  });
}

// ===== FORM =====
function newWorkout(){
  editingIndex=null;
  clearForm();
  show("form");
}

function edit(i){
  editingIndex=i;
  loadForm(workouts[i]);
  show("form");
}

function addExercise(val=""){
  const div=document.createElement("div");
  div.className="exercise";
  div.innerHTML=`
    <input placeholder="Exercise" value="${val}">
    <button onclick="this.parentElement.remove()">x</button>
  `;
  exerciseList.appendChild(div);
}

function clearForm(){
  document.querySelectorAll("#form input").forEach(i=>i.value="");
  exerciseList.innerHTML="";
}

function loadForm(w){
  name.value=w.name;
  work.value=w.work;
  rest.value=w.rest;
  rounds.value=w.rounds;
  water.value=w.water;
  warmup.value=w.warmup;
  cooldown.value=w.cooldown;

  exerciseList.innerHTML="";
  w.exercises.forEach(e=>addExercise(e));
}

function save(){
  const ex=[...document.querySelectorAll("#exerciseList input")]
    .map(i=>i.value).filter(Boolean);

  const w={
    name:name.value,
    work:+work.value,
    rest:+rest.value,
    rounds:+rounds.value,
    water:+water.value,
    warmup:+warmup.value,
    cooldown:+cooldown.value,
    exercises:ex
  };

  if(editingIndex!==null) workouts[editingIndex]=w;
  else workouts.push(w);

  saveLS();
  show("edit");
}

function saveLS(){
  localStorage.setItem("hiitWorkouts", JSON.stringify(workouts));
}

// ===== TIMER ENGINE =====
function startSelected(){
  cfg=workouts[selected];
  exercises=cfg.exercises;

  idx=0;
  round=1;
  elapsed=0;

  totalTime=cfg.warmup+cfg.cooldown+
    cfg.rounds*exercises.length*(cfg.work+cfg.rest);

  show("run");

  setState("warmup", cfg.warmup, "Warm up");
}

function setState(s,dur,label){
  state=s;
  duration=dur;
  t=dur;

  speak(label);
  updateUI();
  run();
}

function run(){
  clearInterval(timer);

  timer=setInterval(()=>{
    t--; elapsed++;

    if(t<=5 && t>0) speak(t.toString());

    updateUI();

    if(t<=0) next();
  },1000);
}

function next(){
  clearInterval(timer);

  switch(state){

    case "warmup":
      speak(exercises[0]);
      setState("work", cfg.work, exercises[0]);
      break;

    case "work":
      setState("rest", cfg.rest, "Rest");
      speak("Next: " + (exercises[idx+1]||exercises[0]));
      break;

    case "rest":
      idx++;

      if(idx>=exercises.length){
        idx=0;
        round++;

        if(round>cfg.rounds){
          setState("cooldown", cfg.cooldown, "Cool down");
        }
      }else{
        setState("work", cfg.work, exercises[idx]);
      }
      break;

    case "cooldown":
      speak("Congratulations");
      state="done";
      break;
  }
}

// ===== CONTROLS =====
function pause(){ clearInterval(timer); }
function skip(){ next(); }
function restartMove(){ setState(state,duration,"Restart"); }

// ===== UI =====
function updateUI(){
  timerEl.innerText=t;
  phase.innerText=state.toUpperCase();
  current.innerText=exercises[idx]||"";
  next.innerText="Next: "+(exercises[idx+1]||exercises[0]);
  meta.innerText=`Round ${round}/${cfg.rounds}`;

  const percent=t/duration;
  progressCircle.style.strokeDashoffset=565*(1-percent);

  totalProgress.style.width=(elapsed/totalTime*100)+"%";
}

// DOM refs
const timerEl=document.getElementById("timer");
const phase=document.getElementById("phase");
const current=document.getElementById("current");
const next=document.getElementById("next");
const meta=document.getElementById("meta");
const progressCircle=document.getElementById("progressCircle");
const totalProgress=document.getElementById("totalProgress");
