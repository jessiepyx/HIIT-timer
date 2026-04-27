let workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");

let state = "idle"; 
let timer;
let t = 0;
let duration = 0;

let cfg, exercises;
let idx = 0, round = 1;

let totalTime = 0;
let elapsed = 0;

function speak(text){
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function saveWorkout(){
  const w = getConfig();
  workouts.push(w);
  localStorage.setItem("hiitWorkouts", JSON.stringify(workouts));
  renderList();
}

function deleteWorkout(){
  const i = document.getElementById("savedList").value;
  workouts.splice(i,1);
  localStorage.setItem("hiitWorkouts", JSON.stringify(workouts));
  renderList();
}

function renderList(){
  const list = document.getElementById("savedList");
  list.innerHTML="";
  workouts.forEach((w,i)=>{
    const o=document.createElement("option");
    o.value=i;
    o.text=w.name;
    list.appendChild(o);
  });
}

function loadWorkout(){
  const w = workouts[document.getElementById("savedList").value];
  if(!w)return;
  Object.keys(w).forEach(k=>{
    if(document.getElementById(k))
      document.getElementById(k).value = w[k];
  });
}

function getConfig(){
  return {
    name: name.value,
    exercises: exercisesEl.value.split("\n").filter(e=>e),
    work:+work.value,
    rest:+rest.value,
    rounds:+rounds.value,
    water:+water.value,
    warmup:+warmup.value,
    cooldown:+cooldown.value
  };
}

function startWorkout(){
  cfg = getConfig();
  exercises = cfg.exercises;
  idx=0; round=1;
  elapsed=0;

  totalTime =
    cfg.warmup +
    cfg.rounds * (
      exercises.length * (cfg.work + cfg.rest)
    ) +
    (cfg.rounds-1)*cfg.water +
    cfg.cooldown;

  setState("warmup", cfg.warmup, "Warm up");
}

function setState(s, dur, label){
  state = s;
  duration = dur;
  t = dur;

  speak(label);
  updateUI();
  run();
}

function run(){
  clearInterval(timer);
  timer = setInterval(()=>{
    t--; elapsed++;

    if(t<=5 && t>0) speak(t.toString());

    updateUI();

    if(t<=0){
      next();
    }
  },1000);
}

function next(){
  clearInterval(timer);

  switch(state){
    case "warmup":
      speak(exercises[0]);
      setState("work", cfg.work, "Start");
      break;

    case "work":
      setState("rest", cfg.rest, "Rest");
      speak("Next "+ (exercises[idx+1]||exercises[0]));
      break;

    case "rest":
      idx++;
      if(idx>=exercises.length){
        idx=0;
        round++;
        if(round>cfg.rounds){
          setState("cooldown", cfg.cooldown, "Cool down");
        } else {
          setState("water", cfg.water, "Water break");
        }
      } else {
        setState("work", cfg.work, exercises[idx]);
      }
      break;

    case "water":
      setState("work", cfg.work, exercises[idx]);
      break;

    case "cooldown":
      speak("Congratulations");
      state="done";
      break;
  }
}

function pause(){
  clearInterval(timer);
}

function skip(){
  next();
}

function restartMove(){
  setState(state, duration, "Restart");
}

function updateUI(){
  timerEl.innerText = t;
  phase.innerText = state.toUpperCase();
  current.innerText = exercises[idx]||"";

  nextEl.innerText = "Next: " + (exercises[idx+1]||exercises[0]);

  meta.innerText = `Round ${round}/${cfg?.rounds || 0}`;

  // circle
  const percent = t/duration;
  progressCircle.style.strokeDashoffset = 565*(1-percent);

  // total progress
  totalProgress.style.width = (elapsed/totalTime*100)+"%";
}

const exercisesEl = document.getElementById("exercises");
const timerEl = document.getElementById("timer");
const phase = document.getElementById("phase");
const current = document.getElementById("current");
const nextEl = document.getElementById("next");
const meta = document.getElementById("meta");
const progressCircle = document.getElementById("progressCircle");
const totalProgress = document.getElementById("totalProgress");

renderList();
