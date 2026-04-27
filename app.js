let workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");
let selected = null;
let editingIndex = null;

function go(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(page).classList.add("active");

  if(page==="select") renderSelect();
  if(page==="edit") renderManage();
}

function renderSelect(){
  const list = document.getElementById("workoutList");
  list.innerHTML = "";

  workouts.forEach((w,i)=>{
    const div = document.createElement("div");
    div.className="card";
    div.innerText = w.name;
    div.onclick = ()=> selected = i;
    list.appendChild(div);
  });
}

function renderManage(){
  const list = document.getElementById("manageList");
  list.innerHTML="";

  workouts.forEach((w,i)=>{
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML = `
      ${w.name}
      <button onclick="edit(${i})">Edit</button>
      <button onclick="del(${i})">Delete</button>
    `;
    list.appendChild(div);
  });
}

function del(i){
  workouts.splice(i,1);
  saveLS();
  renderManage();
}

function newWorkout(){
  editingIndex=null;
  clearForm();
  go("form");
}

function edit(i){
  editingIndex=i;
  loadForm(workouts[i]);
  go("form");
}

function addExercise(val=""){
  const div=document.createElement("div");
  div.className="exercise";
  div.innerHTML=`
    <input value="${val}">
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
  const ex = [...document.querySelectorAll("#exerciseList input")]
    .map(i=>i.value).filter(v=>v);

  const w = {
    name:name.value,
    work:+work.value,
    rest:+rest.value,
    rounds:+rounds.value,
    water:+water.value,
    warmup:+warmup.value,
    cooldown:+cooldown.value,
    exercises:ex
  };

  if(editingIndex!==null){
    workouts[editingIndex]=w;
  } else {
    workouts.push(w);
  }

  saveLS();
  go("edit");
}

function saveLS(){
  localStorage.setItem("hiitWorkouts", JSON.stringify(workouts));
}

function startSelected(){
  if(selected==null) return alert("Select one");
  alert("这里接你之前的计时器逻辑");
}

go("home");
