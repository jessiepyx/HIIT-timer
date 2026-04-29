// =========================
// EXERCISE DEMO (Wger images)
// Uses EXERCISE_ANIMATED and EXERCISE_STATIC from exercises.js
// =========================

var currentDemo = null;

function showExerciseDemo(exerciseName){
  var container = $("exerciseDemo");
  if(!container) return;

  if(currentDemo === exerciseName) return;
  currentDemo = exerciseName;

  if(EXERCISE_ANIMATED[exerciseName]){
    var imgs = EXERCISE_ANIMATED[exerciseName];
    container.style.display = "block";
    container.innerHTML =
      '<img class="demo-a" src="' + imgs[0] + '">' +
      '<img class="demo-b" src="' + imgs[1] + '">';
    return;
  }

  if(EXERCISE_STATIC[exerciseName]){
    container.style.display = "block";
    container.innerHTML = '<img src="' + EXERCISE_STATIC[exerciseName] + '">';
    return;
  }

  container.style.display = "none";
  container.innerHTML = "";
}

function hideExerciseDemo(){
  var container = $("exerciseDemo");
  if(container){
    container.style.display = "none";
    container.innerHTML = "";
  }
  currentDemo = null;
}
