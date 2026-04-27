document.addEventListener("DOMContentLoaded", () => {

  // ===== DOM =====
  const exerciseList = document.getElementById("exerciseList");

  const name = document.getElementById("name");
  const work = document.getElementById("work");
  const rest = document.getElementById("rest");
  const rounds = document.getElementById("rounds");
  const water = document.getElementById("water");
  const warmup = document.getElementById("warmup");
  const cooldown = document.getElementById("cooldown");

  const workoutList = document.getElementById("workoutList");
  const manageList = document.getElementById("manageList");

  const timerEl = document.getElementById("timer");
  const phase = document.getElementById("phase");
  const current = document.getElementById("current");
  const next = document.getElementById("next");
  const meta = document.getElementById("meta");
  const progressCircle = document.getElementById("progressCircle");
  const totalProgress = document.getElementById("totalProgress");

  // ===== STATE =====
  let workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");
  let selected = null;

  // ===== NAV =====
  function show(page){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById(page).classList.add("active");

    if(page==="select") renderSelect();
    if(page==="edit") renderManage();
  }

  // ===== BUTTONS =====
  document.getElementById("btnChoose").onclick = () => show("select");
  document.getElementById("btnEdit").onclick = () => show("edit");

  document.getElementById("btnBackHome1").onclick = () => show("home");
  document.getElementById("btnBackHome2").onclick = () => show("home");

  // ===== LIST RENDER =====
  function renderSelect(){
    workoutList.innerHTML = "";

    workouts.forEach((w,i)=>{
      const div = document.createElement("div");
      div.className = "card";
      div.innerText = w.name;

      div.onclick = () => selected = i;

      workoutList.appendChild(div);
    });
  }

  function renderManage(){
    manageList.innerHTML = "";

    workouts.forEach((w,i)=>{
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <b>${w.name}</b><br>
        <button id="e${i}">Edit</button>
        <button id="d${i}">Delete</button>
      `;

      manageList.appendChild(div);
    });
  }

  console.log("APP LOADED ✔");

});
