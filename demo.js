// =========================
// EXERCISE DEMO (GIF)
// =========================
const EXERCISE_GIFS = {
  "Arnold Press": "https://api.workoutxapp.com/v1/gifs/0287.gif",
  "Back Extensions": "https://api.workoutxapp.com/v1/gifs/0573.gif",
  "Bench Press": "https://api.workoutxapp.com/v1/gifs/0025.gif",
  "Bent-Over Rows": "https://api.workoutxapp.com/v1/gifs/0027.gif",
  "Bicep Curls": "https://api.workoutxapp.com/v1/gifs/0294.gif",
  "Calf Raises": "https://api.workoutxapp.com/v1/gifs/0108.gif",
  "Chest Dips": "https://api.workoutxapp.com/v1/gifs/0251.gif",
  "Chest Flyes": "https://api.workoutxapp.com/v1/gifs/0308.gif",
  "Chin-ups": "https://api.workoutxapp.com/v1/gifs/0253.gif",
  "Close-Grip Bench Press": "https://api.workoutxapp.com/v1/gifs/0030.gif",
  "Close-Grip Push-ups": "https://api.workoutxapp.com/v1/gifs/0259.gif",
  "Concentration Curls": "https://api.workoutxapp.com/v1/gifs/0297.gif",
  "Crunches": "https://api.workoutxapp.com/v1/gifs/0274.gif",
  "Dead Bug": "https://api.workoutxapp.com/v1/gifs/0276.gif",
  "Deadlifts": "https://api.workoutxapp.com/v1/gifs/0032.gif",
  "Decline Push-ups": "https://api.workoutxapp.com/v1/gifs/0279.gif",
  "Diamond Push-ups": "https://api.workoutxapp.com/v1/gifs/0283.gif",
  "Dumbbell Pullover": "https://api.workoutxapp.com/v1/gifs/0375.gif",
  "Dumbbell Rows": "https://api.workoutxapp.com/v1/gifs/0292.gif",
  "Face Pulls": "https://api.workoutxapp.com/v1/gifs/0203.gif",
  "Front Raises": "https://api.workoutxapp.com/v1/gifs/0310.gif",
  "Front Squats": "https://api.workoutxapp.com/v1/gifs/0042.gif",
  "Glute Bridges": "https://api.workoutxapp.com/v1/gifs/0130.gif",
  "Good Mornings": "https://api.workoutxapp.com/v1/gifs/0044.gif",
  "Hammer Curls": "https://api.workoutxapp.com/v1/gifs/0313.gif",
  "Incline Bench Press": "https://api.workoutxapp.com/v1/gifs/0047.gif",
  "Incline Dumbbell Press": "https://api.workoutxapp.com/v1/gifs/0314.gif",
  "Inverted Rows": "https://api.workoutxapp.com/v1/gifs/0499.gif",
  "Jump Squats": "https://api.workoutxapp.com/v1/gifs/0053.gif",
  "Kettlebell Swings": "https://api.workoutxapp.com/v1/gifs/0549.gif",
  "Lat Pulldowns": "https://api.workoutxapp.com/v1/gifs/0198.gif",
  "Lateral Raises": "https://api.workoutxapp.com/v1/gifs/0334.gif",
  "Lunges": "https://api.workoutxapp.com/v1/gifs/0054.gif",
  "Overhead Press": "https://api.workoutxapp.com/v1/gifs/0091.gif",
  "Overhead Tricep Extension": "https://api.workoutxapp.com/v1/gifs/0194.gif",
  "Preacher Curls": "https://api.workoutxapp.com/v1/gifs/0070.gif",
  "Pull-ups": "https://api.workoutxapp.com/v1/gifs/0017.gif",
  "Push-ups": "https://api.workoutxapp.com/v1/gifs/0258.gif",
  "Rear Delt Flyes": "https://api.workoutxapp.com/v1/gifs/0326.gif",
  "Reverse Curls": "https://api.workoutxapp.com/v1/gifs/0080.gif",
  "Reverse Lunges": "https://api.workoutxapp.com/v1/gifs/0078.gif",
  "Romanian Deadlifts": "https://api.workoutxapp.com/v1/gifs/0085.gif",
  "Russian Twists": "https://api.workoutxapp.com/v1/gifs/0014.gif",
  "Seated Cable Rows": "https://api.workoutxapp.com/v1/gifs/0218.gif",
  "Shoulder Shrugs": "https://api.workoutxapp.com/v1/gifs/0406.gif",
  "Sit-ups": "https://api.workoutxapp.com/v1/gifs/0282.gif",
  "Skull Crushers": "https://api.workoutxapp.com/v1/gifs/0060.gif",
  "Squats": "https://api.workoutxapp.com/v1/gifs/0043.gif",
  "Step-ups": "https://api.workoutxapp.com/v1/gifs/0114.gif",
  "Superman Hold": "https://api.workoutxapp.com/v1/gifs/0803.gif",
  "Tricep Dips": "https://api.workoutxapp.com/v1/gifs/0019.gif",
  "Tricep Kickbacks": "https://api.workoutxapp.com/v1/gifs/0333.gif",
  "Tricep Pushdowns": "https://api.workoutxapp.com/v1/gifs/0201.gif",
  "Upright Rows": "https://api.workoutxapp.com/v1/gifs/0120.gif",
  "Wide Push-ups": "https://api.workoutxapp.com/v1/gifs/1311.gif",
  "Wrist Curls": "https://api.workoutxapp.com/v1/gifs/0126.gif"
};

let demoCache = {};

function showExerciseDemo(exerciseName){
  const container = $("exerciseDemo");
  if(!container) return;

  const gifUrl = EXERCISE_GIFS[exerciseName];
  if(!gifUrl){
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  const img = container.querySelector("img");
  if(!img) return;

  if(demoCache[exerciseName]){
    img.src = demoCache[exerciseName];
  } else {
    img.src = gifUrl;
    demoCache[exerciseName] = gifUrl;
  }
}

function hideExerciseDemo(){
  const container = $("exerciseDemo");
  if(container) container.style.display = "none";
}
