let workouts = JSON.parse(localStorage.getItem("hiitWorkouts") || "[]");

let currentWorkout;
let exercises = [];
let index = 0;
let round = 1;
let time = 0;
let working = true;
let timer;

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

function saveWorkout() {
  const workout = {
    name: document.getElementById("name").value,
    exercises: document.getElementById("exercises").value.split("\n"),
    work: +document.getElementById("work").value,
    rest: +document.getElementById("rest").value,
    rounds: +document.getElementById("rounds").value
  };

  workouts.push(workout);
  localStorage.setItem("hiitWorkouts", JSON.stringify(workouts));
  renderList();
}

function renderList() {
  const list = document.getElementById("savedList");
  list.innerHTML = "<option>Select workout</option>";

  workouts.forEach((w, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = w.name;
    list.appendChild(opt);
  });
}

function loadWorkout() {
  const i = document.getElementById("savedList").value;
  const w = workouts[i];

  if (!w) return;

  document.getElementById("name").value = w.name;
  document.getElementById("exercises").value = w.exercises.join("\n");
  document.getElementById("work").value = w.work;
  document.getElementById("rest").value = w.rest;
  document.getElementById("rounds").value = w.rounds;
}

function startWorkout() {
  speechSynthesis.cancel();

  currentWorkout = {
    exercises: document.getElementById("exercises").value
      .split("\n")
      .map(e => e.trim())
      .filter(e => e),
    work: +document.getElementById("work").value,
    rest: +document.getElementById("rest").value,
    rounds: +document.getElementById("rounds").value
  };

  exercises = currentWorkout.exercises;
  index = 0;
  round = 1;
  working = true;

  // ⭐ 修复 bug：提前播报第一个动作
  speak("Get ready");
  speak(exercises[0]);

  setTimeout(() => {
    nextPhase();
  }, 1500);
}

function nextPhase() {
  time = working ? currentWorkout.work : currentWorkout.rest;

  if (working) {
    speak("Start");
  } else {
    let next = exercises[index + 1] || exercises[0];
    speak("Rest");
    speak("Next: " + next);
  }

  updateUI();

  timer = setInterval(() => {
    time--;

    if (time <= 5 && time > 0) {
      speak(time.toString());
    }

    updateUI();

    if (time <= 0) {
      clearInterval(timer);

      if (working) {
        working = false;
      } else {
        working = true;
        index++;

        if (index >= exercises.length) {
          index = 0;
          round++;

          if (round > currentWorkout.rounds) {
            speak("Workout complete");
            return;
          } else {
            speak("Round " + round);
          }
        }
      }

      nextPhase();
    }

  }, 1000);
}

function updateUI() {
  document.getElementById("timer").innerText = time;
  document.getElementById("phase").innerText = working ? "WORK" : "REST";
  document.getElementById("current").innerText =
    working ? exercises[index] : "Rest";
}

renderList();
