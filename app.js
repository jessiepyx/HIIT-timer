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
  let paused = false;

  let elapsed = 0;
  let totalTime = 0;

  // =========================
  // UTIL
  // =========================
  const $ = (id) => document.getElementById(id);

  function bind(id, fn){
    const el = $(id);
    if(el) el.onclick = fn;
  }

  function speak(text){
    try{
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }catch(e){}
  }

  // =========================
  // INIT
  // =========================
  function init(){
    workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");
    bindStaticUI();
    show("home");
    console.log("HIIT READY");
  }

  init();

  // =========================
  // NAV
  // =========================
  function show(page){
    document.querySelectorAll(".page").forEach(p => {
      p.classList.remove("active");
    });
    const target = $(page);
    if(target) target.classList.add("active");
    if(page === "select") renderSelect();
    if(page === "edit")   renderManage();
  }

  // =========================
  // STATIC BUTTONS
  // =========================
  function bindStaticUI(){
    // use bind() helper so a missing element never throws and breaks the rest
    bind("btnChoose",    () => show("select"));
    bind("btnEdit",      () => show("edit"));
    bind("btnBackHome1", () => show("home"));
    bind("btnBackHome2", () => show("home"));
    bind("btnStart",     startSelected);
    bind("btnNew",       newWorkout);
    bind("btnAddEx",     addExercise);
    bind("btnSave",      save);
    bind("btnPause",     togglePause);
    bind("btnSkip",      skip);
    bind("btnRestart",   restartMove);
    bind("btnHome",      goHome);
    bind("btnEndEarly",  goHome);
  }

  function goHome(){
    clearInterval(timer);
    state = "idle";
    paused = false;
    show("home");
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
      div.innerHTML = `
        <b>${w.name}</b><br>
        <button class="edit">Edit</button>
        <button class="del">Delete</button>
      `;
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

  function addExercise(val){
    const list = $("exerciseList");
    if(!list) return;
    const div = document.createElement("div");
    div.className = "exercise";
    const safeVal = (typeof val === "string") ? val : "";
    div.innerHTML = `
      <input placeholder="Exercise name" value="${safeVal}">
      <button type="button">x</button>
    `;
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
    (w.exercises || []).forEach(e => addExercise(e));
  }

  function save(){
    const list = $("exerciseList");
    if(!list) return;
    const ex = [...list.querySelectorAll("input")]
      .map(i => i.value.trim())
      .filter(Boolean);
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
      alert("Please select a workout first.");
      return;
    }
    cfg = workouts[selected];
    exercises = cfg.exercises || [];
    if(exercises.length === 0){
      alert("This workout has no exercises.");
      return;
    }
    idx = 0;
    round = 1;
    elapsed = 0;
    paused = false;

    totalTime =
      cfg.warmup +
      cfg.cooldown +
      cfg.rounds * exercises.length * (cfg.work + cfg.rest);

    const btnPause = $("btnPause");
    if(btnPause){ btnPause.textContent = "Pause"; btnPause.disabled = false; }
    const btnSkip = $("btnSkip");
    if(btnSkip) btnSkip.disabled = false;
    const btnRestart = $("btnRestart");
    if(btnRestart) btnRestart.disabled = false;
    const donePanel = $("donePanel");
    if(donePanel) donePanel.style.display = "none";

    show("run");
    setState("warmup", cfg.warmup, "Warm up");
  }

  function setState(s, dur, label){
    state    = s;
    duration = dur;
    t        = dur;
    paused   = false;
    const btnPause = $("btnPause");
    if(btnPause) btnPause.textContent = "Pause";
    speak(label);
    updateUI();
    run();
  }

  function run(){
    clearInterval(timer);
    timer = setInterval(() => {
      if(state === "idle" || paused) return;
      t--;
      elapsed++;
      if(t > 0 && t <= 3) speak(String(t));
      updateUI();
      if(t <= 0) next();
    }, 1000);
  }

  function next(){
    switch(state){
      case "warmup":
        setState("work", cfg.work, exercises[0]);
        break;
      case "work":
        setState("rest", cfg.rest, "Rest");
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
        clearInterval(timer);
        state = "idle";
        showDone();
        break;
    }
  }

  function showDone(){
    speak("Congratulations! Workout complete!");
    elapsed = totalTime;
    updateUI();
    const donePanel = $("donePanel");
    if(donePanel) donePanel.style.display = "block";
    const btnPause = $("btnPause");
    if(btnPause) btnPause.disabled = true;
    const btnSkip = $("btnSkip");
    if(btnSkip) btnSkip.disabled = true;
    const btnRestart = $("btnRestart");
    if(btnRestart) btnRestart.disabled = true;
  }

  // =========================
  // CONTROLS
  // =========================
  function togglePause(){
    if(state === "idle") return;
    paused = !paused;
    const btnPause = $("btnPause");
    if(btnPause) btnPause.textContent = paused ? "Resume" : "Pause";
    if(paused) speechSynthesis.cancel();
  }

  function skip(){
    if(state === "idle") return;
    t = 0;
    next();
  }

  function restartMove(){
    if(state === "idle") return;
    paused = false;
    const btnPause = $("btnPause");
    if(btnPause) btnPause.textContent = "Pause";
    setState(state, duration, state.toUpperCase());
  }

  // =========================
  // UI UPDATE
  // =========================
  const CIRC = 2 * Math.PI * 90; // ≈ 565

  function updateUI(){
    const timerEl = $("timer");
    if(timerEl) timerEl.textContent = t;

    const phase = $("phase");
    if(phase) phase.textContent = state.toUpperCase();

    const current = $("current");
    if(current) current.textContent = (state === "work") ? (exercises[idx] || "") : "";

    let nextHint = "";
    if(state === "work" && exercises[idx + 1]) nextHint = "Next: " + exercises[idx + 1];
    if(state === "rest" && exercises[idx])      nextHint = "Next: " + exercises[idx];
    const nextEl = $("next");
    if(nextEl) nextEl.textContent = nextHint;

    const meta = $("meta");
    if(meta) meta.textContent = cfg ? `Round ${round} / ${cfg.rounds}` : "";

    const circle = $("progressCircle");
    if(circle && duration > 0){
      const frac = t / duration;
      circle.style.strokeDashoffset = CIRC * (1 - frac);
      circle.style.stroke = (state === "work") ? "#ff9f0a"
                          : (state === "rest") ? "#007aff"
                          : "#34c759";
    }

    const bar = $("totalProgress");
    if(bar && totalTime > 0){
      bar.style.width = Math.min(100, (elapsed / totalTime) * 100) + "%";
    }
  }

})();
