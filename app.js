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
  // UTIL
  // =========================
  const $ = (id) => document.getElementById(id);

  function speak(text){
    try{
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }catch(e){}
  }

  function safe(fn){
    try{ fn(); }catch(e){ console.log(e); }
  }

  // =========================
  // INIT
  // =========================
  document.addEventListener("DOMContentLoaded", init);

  function init(){

    workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");

    bindStaticUI();
    show("home");

    console.log("HIIT READY ✔");
  }

  // =========================
  // NAV
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
  // STATIC BUTTONS
  // =========================
  function bindStaticUI(){

    const btnChoose = $("btnChoose");
    if(btnChoose) btnChoose.onclick = () => show("select");

    const btnEdit = $("btnEdit");
    if(btnEdit) btnEdit.onclick = () => show("edit");

    const btnBack1 = $("btnBackHome1");
    if(btnBack1) btnBack1.onclick = () => show("home");

    const btnBack2 = $("btnBackHome2");
    if(btnBack2) btnBack2.onclick = () => show("home");

    const btnStart = $("btnStart");
    if(btnStart) btnStart.onclick = startSelected;

    const btnNew = $("btnNew");
    if(btnNew) btnNew.onclick = newWorkout;

    const btnAdd = $("btnAddEx");
    if(btnAdd) btnAdd.onclick = addExercise;

    const btnSave = $("btnSave");
    if(btnSave) btnSave.onclick = save;

    const btnPause = $("btnPause");
    if(btnPause) btnPause.onclick = pause;

    const btnSkip = $("btnSkip");
    if(btnSkip) btnSkip.onclick = skip;

    const btnRestart = $("btnRestart");
    if(btnRestart) btnRestart.onclick = restartMove;
  }

  // =========================
  // SELECT PAGE
  // =========================
  function renderSelect(){

    const list = $("workoutList");
    if(!list) return;

    list.innerHTML = "";

    workouts.forEach((w,i)=>{

      const div = document.createElement("div");
      div.className = "card";
      div.textContent = w.name;

      div.addEventListener("click", () => {
        selected = i;

        [...list.children].forEach(c=>{
          c.style.border = "none";
        });

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

    workouts.forEach((w,i)=>{

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <b>${w.name}</b><br>
        <button class="edit">Edit</button>
        <button class="del">Delete</button>
      `;

      list.appendChild(div);

      div.querySelector(".del").onclick = () => {
        workouts.splice(i,1);
        saveLS();
        renderManage();
      };

      div.querySelector(".edit").onclick = () => {
        edit(i);
      };
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
      .forEach(id=>{
        const el = $(id);
        if(el) el.value = "";
      });

    const list = $("exerciseList");
    if(list) list.innerHTML = "";
  }

  function loadForm(w){

    if(!w) return;

    ["name","work","rest","rounds","water","warmup","cooldown"]
      .forEach(id=>{
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
  // TIMER ENGINE
  // =========================
  function startSelected(){

    if(selected == null || !workouts[selected]){
      alert("Select workout");
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
  // UI UPDATE
  // =========================
  function updateUI(){

    const timerEl = $("timer");
    if(timerEl) timerEl.textContent = t;

    const phase = $("phase");
    if(phase) phase.textContent = state.toUpperCase();

    const current = $("current");
    if(current) current.textContent = exercises[idx] || "";

    const nextEl = $("next");
    if(nextEl) nextEl.textContent = "Next: " + (exercises[idx+1] || "");

    const meta = $("meta");
    if(meta) meta.textContent = `Round ${round}/${cfg?.rounds || 0}`;
  }

})();
