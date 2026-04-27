(() => {

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

  let elapsed = 0;
  let totalTime = 0;

  // =========================
  // SAFE DOM HELPER
  // =========================
  const $ = (id) => document.getElementById(id);

  function safe(el, fn){
    if(!el) return;
    try { fn(el); } catch(e){ console.log("safe error:", e); }
  }

  // =========================
  // SPEECH
  // =========================
  function speak(text){
    try{
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }catch(e){}
  }

  // =========================
  // INIT
  // =========================
  document.addEventListener("DOMContentLoaded", init);

  function init(){

    // load data
    workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");

    bindUI();
    show("home");

    console.log("HIIT APP READY ✔");
  }

  // =========================
  // UI NAV
  // =========================
  function show(page){
    document.querySelectorAll(".page").forEach(p=>{
      p.classList.remove("active");
    });

    const target = $(page);
    if(target) target.classList.add("active");

    if(page === "select") renderSelect();
    if(page === "edit") renderManage();
  }

  // =========================
  // UI BINDING (SAFE)
  // =========================
  function bindUI(){

    safe($("btnChoose"), el => el.onclick = () => show("select"));
    safe($("btnEdit"), el => el.onclick = () => show("edit"));

    safe($("btnBackHome1"), el => el.onclick = () => show("home"));
    safe($("btnBackHome2"), el => el.onclick = () => show("home"));

    safe($("btnStart"), el => el.onclick = startSelected);

    safe($("btnNew"), el => el.onclick = newWorkout);
    safe($("btnAddEx"), el => el.onclick = addExercise);
    safe($("btnSave"), el => el.onclick = save);

    safe($("btnPause"), el => el.onclick = pause);
    safe($("btnSkip"), el => el.onclick = skip);
    safe($("btnRestart"), el => el.onclick = restartMove);
  }

  // =========================
  // RENDER LIST
  // =========================
  function renderSelect(){
    const list = $("workoutList");
    if(!list) return;

    list.innerHTML = "";

    workouts.forEach((w,i)=>{
      const div = document.createElement("div");
      div.className = "card";
      div.textContent = w.name;

      div.onclick = () => selected = i;

      list.appendChild(div);
    });
  }

  function renderManage(){
    const list = $("manageList");
    if(!list) return;

    list.innerHTML = "";

    workouts.forEach((w,i)=>{
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <b>${w.name}</b><br>
        <button id="e${i}">Edit</button>
        <button id="d${i}">Delete</button>
      `;

      list.appendChild(div);

      safe($("d"+i), el => el.onclick = () => {
        workouts.splice(i,1);
        saveLS();
        renderManage();
      });

      safe($("e"+i), el => el.onclick = () => edit(i));
    });
  }

  // =========================
  // WORKOUT EDIT
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

  function addExercise(val=""){
    const list = $("exerciseList");
    if(!list) return;

    const div = document.createElement("div");
    div.className = "exercise";

    div.innerHTML = `
      <input placeholder="Exercise" value="${val}">
      <button type="button">x</button>
    `;

    div.querySelector("button").onclick = () => div.remove();

    list.appendChild(div);
  }

  function clearForm(){
    ["name","work","rest","rounds","water","warmup","cooldown"]
      .forEach(id => {
        const el = $(id);
        if(el) el.value = "";
      });

    const list = $("exerciseList");
    if(list) list.innerHTML = "";
  }

  function loadForm(w){
    if(!w) return;

    ["name","work","rest","rounds","water","warmup","cooldown"]
      .forEach(id => {
        const el = $(id);
        if(el) el.value = w[id] ?? "";
      });

    const list = $("exerciseList");
    if(!list) return;

    list.innerHTML = "";
    (w.exercises || []).forEach(e => addExercise(e));
  }

  function save(){
    const list = $("exerciseList");
    if(!list) return;

    const ex = [...list.querySelectorAll("input")]
      .map(i => i.value)
      .filter(Boolean);

    const w = {
      name: $("name")?.value || "Workout",
      work: +$("work")?.value || 20,
      rest: +$("rest")?.value || 10,
      rounds: +$("rounds")?.value || 3,
      water: +$("water")?.value || 30,
      warmup: +$("warmup")?.value || 30,
      cooldown: +$("cooldown")?.value || 30,
      exercises: ex
    };

    if(editingIndex != null){
      workouts[editingIndex] = w;
    } else {
      workouts.push(w);
    }

    saveLS();
    show("edit");
  }

  function saveLS(){
    localStorage.setItem("hiitWorkouts", JSON.stringify(workouts));
  }

  // =========================
  // TIMER ENGINE (SAFE)
  // =========================
  function startSelected(){

    if(selected == null || !workouts[selected]){
      alert("Please select workout");
      return;
    }

    cfg = workouts[selected];
    exercises = cfg.exercises || [];

    if(exercises.length === 0){
      alert("No exercises");
      return;
    }

    idx = 0;
    round = 1;
    elapsed = 0;

    totalTime =
      cfg.warmup +
      cfg.cooldown +
      cfg.rounds * exercises.length * (cfg.work + cfg.rest);

    show("run");

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

    timer = setInterval(() => {
      if(state === "idle") return;

      t--;
      elapsed++;

      if(t <= 5 && t > 0) speak(String(t));

      updateUI();

      if(t <= 0) next();
    }, 1000);
  }

  function next(){

    switch(state){

      case "warmup":
        speak(exercises[0]);
        setState("work", cfg.work, exercises[0]);
        break;

      case "work":
        setState("rest", cfg.rest, "Rest");
        speak("Next: " + (exercises[idx+1] || exercises[0]));
        break;

      case "rest":
        idx++;

        if(idx >= exercises.length){
          idx = 0;
          round++;

          if(round > cfg.rounds){
            setState("cooldown", cfg.cooldown, "Cool down");
            return;
          }
        }

        setState("work", cfg.work, exercises[idx]);
        break;

      case "cooldown":
        speak("Congratulations");
        state = "idle";
        break;
    }
  }

  // =========================
  // CONTROLS
  // =========================
  function pause(){
    clearInterval(timer);
  }

  function skip(){
    next();
  }

  function restartMove(){
    setState(state, duration, "Restart");
  }

  // =========================
  // UI UPDATE (SAFE)
  // =========================
  function updateUI(){

    safe($("timer"), el => el.textContent = t);
    safe($("phase"), el => el.textContent = state.toUpperCase());
    safe($("current"), el => el.textContent = exercises[idx] || "");
    safe($("next"), el => el.textContent = "Next: " + (exercises[idx+1] || ""));
    safe($("meta"), el => el.textContent = `Round ${round}/${cfg?.rounds || 0}`);

  }

})();
