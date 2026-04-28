// =========================
// EXERCISE DEMO (Wger images)
// =========================

// 36 exercises with 2 images (crossfade animation)
const EXERCISE_ANIMATED = {
  "Bench Press": ["https://wger.de/media/exercise-images/192/Bench-press-1.png", "https://wger.de/media/exercise-images/192/Bench-press-2.png"],
  "Bent-Over Rows": ["https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png", "https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-2.png"],
  "Bicep Curls": ["https://wger.de/media/exercise-images/81/Biceps-curl-1.png", "https://wger.de/media/exercise-images/81/Biceps-curl-2.png"],
  "Calf Raises": ["https://wger.de/media/exercise-images/622/9a429bd0-afd3-4ad0-8043-e9beec901c81.jpeg", "https://wger.de/media/exercise-images/622/d6d57067-97de-462e-a8bb-15228d730323.jpeg"],
  "Chest Flyes": ["https://wger.de/media/exercise-images/238/2fc242d3-5bdd-4f97-99bd-678adb8c96fc.png", "https://wger.de/media/exercise-images/238/c6464fb3-1924-4ff1-adfa-fd36da9b5d13.png"],
  "Chin-ups": ["https://wger.de/media/exercise-images/181/Chin-ups-2.png", "https://wger.de/media/exercise-images/181/Chin-ups-1.png"],
  "Close-Grip Bench Press": ["https://wger.de/media/exercise-images/88/Narrow-grip-bench-press-1.png", "https://wger.de/media/exercise-images/88/Narrow-grip-bench-press-2.png"],
  "Crunches": ["https://wger.de/media/exercise-images/91/Crunches-1.png", "https://wger.de/media/exercise-images/91/Crunches-2.png"],
  "Front Squats": ["https://wger.de/media/exercise-images/191/Front-squat-1-857x1024.png", "https://wger.de/media/exercise-images/191/Front-squat-2-857x1024.png"],
  "Goblet Squats": ["https://wger.de/media/exercise-images/203/1c052351-2af0-4227-aeb0-244008e4b0a8.jpeg", "https://wger.de/media/exercise-images/203/2ab30113-4e08-4d39-9d23-d901ce2c0971.jpeg"],
  "Good Mornings": ["https://wger.de/media/exercise-images/116/Good-mornings-2.png", "https://wger.de/media/exercise-images/116/Good-mornings-1.png"],
  "Hammer Curls": ["https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png", "https://wger.de/media/exercise-images/86/Bicep-hammer-curl-2.png"],
  "Hip Thrusts": ["https://wger.de/media/exercise-images/1614/7f3cfae2-e062-4211-9a6b-5a10851ce7f4.jpg", "https://wger.de/media/exercise-images/1614/d5ebadd8-f676-427f-b755-6a0679c19265.jpg"],
  "Incline Bench Press": ["https://wger.de/media/exercise-images/41/Incline-bench-press-1.png", "https://wger.de/media/exercise-images/41/Incline-bench-press-2.png"],
  "Incline Dumbbell Press": ["https://wger.de/media/exercise-images/16/Incline-press-1.png", "https://wger.de/media/exercise-images/16/Incline-press-2.png"],
  "Lateral Raises": ["https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png", "https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-1.png"],
  "Leg Curls": ["https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-1.png", "https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-2.png"],
  "Leg Press": ["https://wger.de/media/exercise-images/130/Narrow-stance-hack-squats-1-1024x721.png", "https://wger.de/media/exercise-images/130/Narrow-stance-hack-squats-2-1024x721.png"],
  "Leg Raises": ["https://wger.de/media/exercise-images/125/Leg-raises-2.png", "https://wger.de/media/exercise-images/125/Leg-raises-1.png"],
  "Lunges": ["https://wger.de/media/exercise-images/113/Walking-lunges-1.png", "https://wger.de/media/exercise-images/113/Walking-lunges-2.png"],
  "Overhead Press": ["https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png", "https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-2.png"],
  "Overhead Tricep Extension": ["https://wger.de/media/exercise-images/50/695ced5c-9961-4076-add2-cb250d01089e.png", "https://wger.de/media/exercise-images/50/44cf2c72-a78a-4d5e-a8b5-a02c6ea61fb4.jpg"],
  "Pistol Squats": ["https://wger.de/media/exercise-images/456/3b681e59-377b-40db-9113-ca5873ce084b.jpg", "https://wger.de/media/exercise-images/456/c51d875b-0c07-495e-a7cf-08893a9f125d.jpg"],
  "Plank": ["https://wger.de/media/exercise-images/458/b7bd9c28-9f1d-4647-bd17-ab6a3adf5770.png", "https://wger.de/media/exercise-images/458/902e6836-394e-458b-b94e-101d714294e2.png"],
  "Preacher Curls": ["https://wger.de/media/exercise-images/193/Preacher-curl-3-1.png", "https://wger.de/media/exercise-images/193/Preacher-curl-3-2.png"],
  "Rear Delt Flyes": ["https://wger.de/media/exercise-images/822/74affc0d-03b6-4f33-b5f4-a822a2615f68.png", "https://wger.de/media/exercise-images/822/6a770e5d-cd62-4754-a18c-eebe2103d7c5.png"],
  "Reverse Flyes": ["https://wger.de/media/exercise-images/828/2e959dab-f39b-4c7c-9063-eb43064ab5eb.png", "https://wger.de/media/exercise-images/828/abfc7700-fadf-4f2d-ac84-e045e590a2fe.png"],
  "Reverse Hyperextension": ["https://wger.de/media/exercise-images/128/Hyperextensions-1.png", "https://wger.de/media/exercise-images/128/Hyperextensions-2.png"],
  "Reverse Lunges": ["https://wger.de/media/exercise-images/999/d0931eb3-8db0-4049-bb08-aa4036072056.jfif", "https://wger.de/media/exercise-images/999/8548b2d2-004d-48b4-95fd-b1b25f4e53d0.jfif"],
  "Seated Cable Rows": ["https://wger.de/media/exercise-images/143/Cable-seated-rows-2.png", "https://wger.de/media/exercise-images/143/Cable-seated-rows-1.png"],
  "Shoulder Shrugs": ["https://wger.de/media/exercise-images/151/Dumbbell-shrugs-2.png", "https://wger.de/media/exercise-images/151/Dumbbell-shrugs-1.png"],
  "Skull Crushers": ["https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-1.png", "https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-2.png"],
  "Squats": ["https://wger.de/media/exercise-images/1801/60043328-1cfb-4289-9865-aaf64d5aaa28.jpg", "https://wger.de/media/exercise-images/1801/68720d5e-f422-47ac-81e4-c7b51144d302.jpg"],
  "T-Bar Rows": ["https://wger.de/media/exercise-images/106/T-bar-row-1.png", "https://wger.de/media/exercise-images/106/T-bar-row-2.png"],
  "Tricep Dips": ["https://wger.de/media/exercise-images/83/Bench-dips-1.png", "https://wger.de/media/exercise-images/83/Bench-dips-2.png"],
  "Upright Rows": ["https://wger.de/media/exercise-images/694/119e6823-6960-4341-a9e1-aaf78d7fb57c.png", "https://wger.de/media/exercise-images/694/2e69c005-b241-4806-8557-fc5a4d5ee44d.png"]
};

// 24 exercises with 1 image (static)
const EXERCISE_STATIC = {
  "Back Extensions": "https://wger.de/media/exercise-images/1348/a3769120-2445-49f2-97d3-afc1238bfc2a.webp",
  "Bird Dog": "https://wger.de/media/exercise-images/1572/3d14e761-a73d-49da-8804-f3016a7573ff.png",
  "Bulgarian Split Squats": "https://wger.de/media/exercise-images/1102/cf41f3fb-a3e6-4d0b-b704-6404a7e584fc.jpg",
  "Close-Grip Push-ups": "https://wger.de/media/exercise-images/1112/81f40bee-4adf-4317-8476-1a87706e3031.png",
  "Concentration Curls": "https://wger.de/media/exercise-images/1649/441cc0e5-eca2-4828-8b0a-a0e554abb2ff.jpg",
  "Deadlifts": "https://wger.de/media/exercise-images/105/Deadlifts-1.png",
  "Decline Push-ups": "https://wger.de/media/exercise-images/1112/81f40bee-4adf-4317-8476-1a87706e3031.png",
  "Diamond Push-ups": "https://wger.de/media/exercise-images/1200/0a85e41f-5994-4b9c-8b6d-880e6e777076.jpg",
  "Dumbbell Rows": "https://wger.de/media/exercise-images/1198/864906ac-4ac7-4e52-a886-c6bb97950a9f.jpg",
  "Front Raises": "https://wger.de/media/exercise-images/1378/7c1fcf34-fb7e-45e7-a0c1-51f296235315.jpg",
  "Inverted Rows": "https://wger.de/media/exercise-images/1198/864906ac-4ac7-4e52-a886-c6bb97950a9f.jpg",
  "Leg Extensions": "https://wger.de/media/exercise-images/851/4d621b17-f6cb-4107-97c0-9f44e9a2dbc6.webp",
  "Pike Push-ups": "https://wger.de/media/exercise-images/1091/50c8912d-54ef-46c9-99d1-633b6196aa1e.jpg",
  "Plank Jacks": "https://wger.de/media/exercise-images/1091/50c8912d-54ef-46c9-99d1-633b6196aa1e.jpg",
  "Pull-ups": "https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png",
  "Push-ups": "https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png",
  "Romanian Deadlifts": "https://wger.de/media/exercise-images/105/Deadlifts-1.png",
  "Russian Twists": "https://wger.de/media/exercise-images/1193/70ca5d80-3847-4a8c-8882-c6e9e485e29e.png",
  "Sit-ups": "https://wger.de/media/exercise-images/91/Crunches-1.png",
  "Tricep Pushdowns": "https://wger.de/media/exercise-images/921/2555c4c3-a84d-47db-b83b-cbf721f12e45.png",
  "Walking Lunges": "https://wger.de/media/exercise-images/113/Walking-lunges-1.png",
  "Wide Push-ups": "https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png",
  "Wrist Curls": "https://wger.de/media/exercise-images/1012/8270fdb8-28f1-4eff-b410-af8642085b3f.png"
};

let currentDemo = null;

function showExerciseDemo(exerciseName){
  const container = $("exerciseDemo");
  if(!container) return;

  if(currentDemo === exerciseName) return;
  currentDemo = exerciseName;

  // Check animated first
  if(EXERCISE_ANIMATED[exerciseName]){
    const imgs = EXERCISE_ANIMATED[exerciseName];
    container.style.display = "block";
    container.innerHTML =
      '<img class="demo-a" src="' + imgs[0] + '">' +
      '<img class="demo-b" src="' + imgs[1] + '">';
    return;
  }

  // Check static
  if(EXERCISE_STATIC[exerciseName]){
    container.style.display = "block";
    container.innerHTML = '<img src="' + EXERCISE_STATIC[exerciseName] + '">';
    return;
  }

  // No image
  container.style.display = "none";
  container.innerHTML = "";
}

function hideExerciseDemo(){
  const container = $("exerciseDemo");
  if(container){
    container.style.display = "none";
    container.innerHTML = "";
  }
  currentDemo = null;
}
