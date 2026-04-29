// exercises.js - Single source of truth for all exercise data
// To add/delete/modify exercises, only change this file.
var EXERCISE_DATA = {
  // Chest
  "Bench Press":{cat:"Chest",equip:[["Bench"], ["Dumbbells", "Barbell"]],cn:"卧推",video:"BV18W411F7jR",images:["https://wger.de/media/exercise-images/192/Bench-press-1.png", "https://wger.de/media/exercise-images/192/Bench-press-2.png"]},
  "Chest Dips":{cat:"Chest",equip:[["Dip Station"]],cn:"双杠臂屈伸",video:"BV1iW411F7Wf",images:null},
  "Chest Flyes":{cat:"Chest",equip:[["Bench"], ["Dumbbells"]],cn:"飞鸟",video:"",images:["https://wger.de/media/exercise-images/238/2fc242d3-5bdd-4f97-99bd-678adb8c96fc.png", "https://wger.de/media/exercise-images/238/c6464fb3-1924-4ff1-adfa-fd36da9b5d13.png"]},
  "Close-Grip Bench Press":{cat:"Chest",equip:[["Bench"], ["Dumbbells", "Barbell"]],cn:"窄握卧推",video:"",images:["https://wger.de/media/exercise-images/88/Narrow-grip-bench-press-1.png", "https://wger.de/media/exercise-images/88/Narrow-grip-bench-press-2.png"]},
  "Decline Push-ups":{cat:"Chest",equip:[["Box", "Bench"]],cn:"下斜俯卧撑",video:"",images:["https://wger.de/media/exercise-images/1112/81f40bee-4adf-4317-8476-1a87706e3031.png"]},
  "Dumbbell Pullover":{cat:"Chest",equip:[["Bench"], ["Dumbbell"]],cn:"哑铃仰卧上拉",video:"",images:null},
  "Incline Bench Press":{cat:"Chest",equip:[["Incline Bench"], ["Dumbbells", "Barbell"]],cn:"上斜卧推",video:"",images:["https://wger.de/media/exercise-images/41/Incline-bench-press-1.png", "https://wger.de/media/exercise-images/41/Incline-bench-press-2.png"]},
  "Incline Dumbbell Press":{cat:"Chest",equip:[["Incline Bench"], ["Dumbbells"]],cn:"上斜哑铃卧推",video:"",images:["https://wger.de/media/exercise-images/16/Incline-press-1.png", "https://wger.de/media/exercise-images/16/Incline-press-2.png"]},
  "Push-ups":{cat:"Chest",equip:[],cn:"俯卧撑",video:"BV1Rs411n74M",images:["https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png"]},
  "Svend Press":{cat:"Chest",equip:[["Dumbbell", "Weight Plate"]],cn:"斯文德推举",video:"",images:null},
  "Wide Push-ups":{cat:"Chest",equip:[],cn:"宽距俯卧撑",video:"",images:["https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png"]},
  // Shoulders
  "Arnold Press":{cat:"Shoulders",equip:[["Dumbbells"]],cn:"阿诺德推举",video:"",images:null},
  "Bus Drivers":{cat:"Shoulders",equip:[["Dumbbell", "Weight Plate"]],cn:"方向盘转体",video:"",images:null},
  "Face Pulls":{cat:"Shoulders",equip:[["Cable Machine", "Resistance Band"]],cn:"面拉",video:"",images:null},
  "Front Raises":{cat:"Shoulders",equip:[["Dumbbells"]],cn:"前平举",video:"",images:["https://wger.de/media/exercise-images/1378/7c1fcf34-fb7e-45e7-a0c1-51f296235315.jpg"]},
  "Handstand Hold":{cat:"Shoulders",equip:[["Wall"]],cn:"倒立支撑",video:"",images:null},
  "Lateral Raises":{cat:"Shoulders",equip:[["Dumbbells"]],cn:"侧平举",video:"",images:["https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png", "https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-1.png"]},
  "Overhead Press":{cat:"Shoulders",equip:[["Dumbbells", "Barbell"]],cn:"肩上推举",video:"",images:["https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png", "https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-2.png"]},
  "Pike Push-ups":{cat:"Shoulders",equip:[],cn:"屈体俯卧撑",video:"",images:["https://wger.de/media/exercise-images/1091/50c8912d-54ef-46c9-99d1-633b6196aa1e.jpg"]},
  "Rear Delt Flyes":{cat:"Shoulders",equip:[["Dumbbells"]],cn:"反向飞鸟",video:"",images:["https://wger.de/media/exercise-images/822/74affc0d-03b6-4f33-b5f4-a822a2615f68.png", "https://wger.de/media/exercise-images/822/6a770e5d-cd62-4754-a18c-eebe2103d7c5.png"]},
  "Shoulder Shrugs":{cat:"Shoulders",equip:[["Dumbbells", "Barbell"]],cn:"耸肩",video:"",images:["https://wger.de/media/exercise-images/151/Dumbbell-shrugs-2.png", "https://wger.de/media/exercise-images/151/Dumbbell-shrugs-1.png"]},
  "Upright Rows":{cat:"Shoulders",equip:[["Dumbbells", "Barbell"]],cn:"直立划船",video:"",images:["https://wger.de/media/exercise-images/694/119e6823-6960-4341-a9e1-aaf78d7fb57c.png", "https://wger.de/media/exercise-images/694/2e69c005-b241-4806-8557-fc5a4d5ee44d.png"]},
  "Y-T-W Raises":{cat:"Shoulders",equip:[["Dumbbells"]],cn:"Y-T-W举",video:"",images:null},
  // Upper Back
  "Band Pull-Aparts":{cat:"Upper Back",equip:[["Resistance Band"]],cn:"弹力带拉伸",video:"",images:null},
  "Bent-Over Rows":{cat:"Upper Back",equip:[["Dumbbells", "Barbell"]],cn:"俯身划船",video:"",images:["https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png", "https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-2.png"]},
  "Chin-ups":{cat:"Upper Back",equip:[["Pull-up Bar"]],cn:"反握引体向上",video:"",images:["https://wger.de/media/exercise-images/181/Chin-ups-2.png", "https://wger.de/media/exercise-images/181/Chin-ups-1.png"]},
  "Dumbbell Rows":{cat:"Upper Back",equip:[["Dumbbell"], ["Bench"]],cn:"哑铃划船",video:"",images:["https://wger.de/media/exercise-images/1198/864906ac-4ac7-4e52-a886-c6bb97950a9f.jpg"]},
  "Inverted Rows":{cat:"Upper Back",equip:[["Pull-up Bar", "TRX"]],cn:"反向划船",video:"",images:["https://wger.de/media/exercise-images/1198/864906ac-4ac7-4e52-a886-c6bb97950a9f.jpg"]},
  "Lat Pulldowns":{cat:"Upper Back",equip:[["Cable Machine"]],cn:"高位下拉",video:"",images:null},
  "Pull-ups":{cat:"Upper Back",equip:[["Pull-up Bar"]],cn:"引体向上",video:"BV1os411p7Yd",images:["https://wger.de/media/exercise-images/1551/a6a9e561-3965-45c6-9f2b-ee671e1a3a45.png"]},
  "Renegade Rows":{cat:"Upper Back",equip:[["Dumbbells"]],cn:"叛逆划船",video:"",images:null},
  "Reverse Flyes":{cat:"Upper Back",equip:[["Dumbbells"]],cn:"俯身反向飞鸟",video:"",images:["https://wger.de/media/exercise-images/828/2e959dab-f39b-4c7c-9063-eb43064ab5eb.png", "https://wger.de/media/exercise-images/828/abfc7700-fadf-4f2d-ac84-e045e590a2fe.png"]},
  "Seated Cable Rows":{cat:"Upper Back",equip:[["Cable Machine"]],cn:"坐姿绳索划船",video:"",images:["https://wger.de/media/exercise-images/143/Cable-seated-rows-2.png", "https://wger.de/media/exercise-images/143/Cable-seated-rows-1.png"]},
  "Straight-Arm Pulldowns":{cat:"Upper Back",equip:[["Cable Machine", "Resistance Band"]],cn:"直臂下压",video:"",images:null},
  "T-Bar Rows":{cat:"Upper Back",equip:[["Barbell"]],cn:"T杠划船",video:"",images:["https://wger.de/media/exercise-images/106/T-bar-row-1.png", "https://wger.de/media/exercise-images/106/T-bar-row-2.png"]},
  // Lower Back
  "Back Extensions":{cat:"Lower Back",equip:[["Hyperextension Bench"]],cn:"背部伸展",video:"",images:["https://wger.de/media/exercise-images/1348/a3769120-2445-49f2-97d3-afc1238bfc2a.webp"]},
  "Bird Dog":{cat:"Lower Back",equip:[["Mat"]],cn:"鸟狗式",video:"",images:["https://wger.de/media/exercise-images/1572/3d14e761-a73d-49da-8804-f3016a7573ff.png"]},
  "Deadlifts":{cat:"Lower Back",equip:[["Dumbbells", "Barbell"]],cn:"硬拉",video:"BV1Ys411j7mq",images:["https://wger.de/media/exercise-images/105/Deadlifts-1.png"]},
  "Good Mornings":{cat:"Lower Back",equip:[["Dumbbells", "Barbell"]],cn:"早安式体前屈",video:"",images:["https://wger.de/media/exercise-images/116/Good-mornings-2.png", "https://wger.de/media/exercise-images/116/Good-mornings-1.png"]},
  "Jefferson Curls":{cat:"Lower Back",equip:[["Dumbbell", "Barbell"]],cn:"杰斐逊弯举",video:"",images:null},
  "Kettlebell Swings":{cat:"Lower Back",equip:[["Kettlebell", "Dumbbell"]],cn:"壶铃摆荡",video:"BV1qs411G7ER",images:null},
  "Reverse Hyperextension":{cat:"Lower Back",equip:[["Hyperextension Bench"]],cn:"反向背伸展",video:"",images:["https://wger.de/media/exercise-images/128/Hyperextensions-1.png", "https://wger.de/media/exercise-images/128/Hyperextensions-2.png"]},
  "Romanian Deadlifts":{cat:"Lower Back",equip:[["Dumbbells", "Barbell"]],cn:"罗马尼亚硬拉",video:"",images:["https://wger.de/media/exercise-images/105/Deadlifts-1.png"]},
  "Superman Hold":{cat:"Lower Back",equip:[["Mat"]],cn:"超人式",video:"",images:null},
  // Arms
  "Bicep Curls":{cat:"Arms",equip:[["Dumbbells", "Barbell", "EZ Bar"]],cn:"二头弯举",video:"",images:["https://wger.de/media/exercise-images/81/Biceps-curl-1.png", "https://wger.de/media/exercise-images/81/Biceps-curl-2.png"]},
  "Close-Grip Push-ups":{cat:"Arms",equip:[],cn:"窄距俯卧撑",video:"",images:["https://wger.de/media/exercise-images/1112/81f40bee-4adf-4317-8476-1a87706e3031.png"]},
  "Concentration Curls":{cat:"Arms",equip:[["Dumbbell"]],cn:"集中弯举",video:"",images:["https://wger.de/media/exercise-images/1649/441cc0e5-eca2-4828-8b0a-a0e554abb2ff.jpg"]},
  "Diamond Push-ups":{cat:"Arms",equip:[],cn:"钻石俯卧撑",video:"",images:["https://wger.de/media/exercise-images/1200/0a85e41f-5994-4b9c-8b6d-880e6e777076.jpg"]},
  "Hammer Curls":{cat:"Arms",equip:[["Dumbbells"]],cn:"锤式弯举",video:"",images:["https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png", "https://wger.de/media/exercise-images/86/Bicep-hammer-curl-2.png"]},
  "Overhead Tricep Extension":{cat:"Arms",equip:[["Dumbbell", "EZ Bar"]],cn:"过顶三头臂屈伸",video:"",images:["https://wger.de/media/exercise-images/50/695ced5c-9961-4076-add2-cb250d01089e.png", "https://wger.de/media/exercise-images/50/44cf2c72-a78a-4d5e-a8b5-a02c6ea61fb4.jpg"]},
  "Preacher Curls":{cat:"Arms",equip:[["Dumbbell", "EZ Bar"], ["Preacher Bench", "Incline Bench"]],cn:"托臂弯举",video:"",images:["https://wger.de/media/exercise-images/193/Preacher-curl-3-1.png", "https://wger.de/media/exercise-images/193/Preacher-curl-3-2.png"]},
  "Reverse Curls":{cat:"Arms",equip:[["Dumbbells", "Barbell", "EZ Bar"]],cn:"反握弯举",video:"",images:null},
  "Skull Crushers":{cat:"Arms",equip:[["Bench"], ["Dumbbells", "Barbell", "EZ Bar"]],cn:"仰卧臂屈伸",video:"",images:["https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-1.png", "https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-2.png"]},
  "Tricep Dips":{cat:"Arms",equip:[["Bench"]],cn:"三头臂屈伸",video:"",images:["https://wger.de/media/exercise-images/83/Bench-dips-1.png", "https://wger.de/media/exercise-images/83/Bench-dips-2.png"]},
  "Tricep Kickbacks":{cat:"Arms",equip:[["Dumbbells"]],cn:"三头回扣",video:"",images:null},
  "Tricep Pushdowns":{cat:"Arms",equip:[["Cable Machine", "Resistance Band"]],cn:"三头下压",video:"",images:["https://wger.de/media/exercise-images/921/2555c4c3-a84d-47db-b83b-cbf721f12e45.png"]},
  "Wrist Curls":{cat:"Arms",equip:[["Dumbbells", "Barbell"]],cn:"腕弯举",video:"",images:["https://wger.de/media/exercise-images/1012/8270fdb8-28f1-4eff-b410-af8642085b3f.png"]},
  "Zottman Curls":{cat:"Arms",equip:[["Dumbbells"]],cn:"佐特曼弯举",video:"",images:null},
  // Abs
  "Bicycle Crunches":{cat:"Abs",equip:[["Mat"]],cn:"自行车卷腹",video:"",images:null},
  "Crunches":{cat:"Abs",equip:[["Mat"]],cn:"卷腹",video:"",images:["https://wger.de/media/exercise-images/91/Crunches-1.png", "https://wger.de/media/exercise-images/91/Crunches-2.png"]},
  "Dead Bug":{cat:"Abs",equip:[["Mat"]],cn:"死虫式",video:"",images:null},
  "Flutter Kicks":{cat:"Abs",equip:[["Mat"]],cn:"交替踢腿",video:"",images:null},
  "Hanging Knee Raise":{cat:"Abs",equip:[["Pull-up Bar"]],cn:"悬垂举腿",video:"",images:null},
  "Heel Touches":{cat:"Abs",equip:[["Mat"]],cn:"触踵",video:"",images:null},
  "Hollow Body Hold":{cat:"Abs",equip:[["Mat"]],cn:"空心支撑",video:"",images:null},
  "Leg Raises":{cat:"Abs",equip:[["Mat"]],cn:"仰卧举腿",video:"",images:["https://wger.de/media/exercise-images/125/Leg-raises-2.png", "https://wger.de/media/exercise-images/125/Leg-raises-1.png"]},
  "Mountain Climbers":{cat:"Abs",equip:[],cn:"登山者",video:"",images:null},
  "Plank":{cat:"Abs",equip:[["Mat"]],cn:"平板支撑",video:"",images:["https://wger.de/media/exercise-images/458/b7bd9c28-9f1d-4647-bd17-ab6a3adf5770.png", "https://wger.de/media/exercise-images/458/902e6836-394e-458b-b94e-101d714294e2.png"]},
  "Plank Jacks":{cat:"Abs",equip:[],cn:"平板开合跳",video:"",images:["https://wger.de/media/exercise-images/1091/50c8912d-54ef-46c9-99d1-633b6196aa1e.jpg"]},
  "Reverse Crunch":{cat:"Abs",equip:[["Mat"]],cn:"反向卷腹",video:"",images:null},
  "Russian Twists":{cat:"Abs",equip:[["Mat"]],cn:"俄罗斯转体",video:"",images:["https://wger.de/media/exercise-images/1193/70ca5d80-3847-4a8c-8882-c6e9e485e29e.png"]},
  "Side Plank":{cat:"Abs",equip:[["Mat"]],cn:"侧平板支撑",video:"",images:null},
  "Sit-ups":{cat:"Abs",equip:[["Mat"]],cn:"仰卧起坐",video:"",images:["https://wger.de/media/exercise-images/91/Crunches-1.png"]},
  "Toe Touches":{cat:"Abs",equip:[["Mat"]],cn:"触脚尖",video:"",images:null},
  "V-ups":{cat:"Abs",equip:[["Mat"]],cn:"V字起坐",video:"",images:null},
  "Windshield Wipers":{cat:"Abs",equip:[["Mat"]],cn:"雨刷式",video:"",images:null},
  // Glutes
  "Banded Walks":{cat:"Glutes",equip:[["Resistance Band"]],cn:"弹力带侧走",video:"",images:null},
  "Cable Kickbacks":{cat:"Glutes",equip:[["Cable Machine"]],cn:"绳索后踢",video:"",images:null},
  "Clamshells":{cat:"Glutes",equip:[["Mat"]],cn:"蚌式",video:"",images:null},
  "Curtsy Lunges":{cat:"Glutes",equip:[],cn:"交叉弓步",video:"",images:null},
  "Donkey Kicks":{cat:"Glutes",equip:[["Mat"]],cn:"驴踢",video:"",images:null},
  "Fire Hydrants":{cat:"Glutes",equip:[["Mat"]],cn:"消防栓式",video:"",images:null},
  "Frog Pumps":{cat:"Glutes",equip:[["Mat"]],cn:"蛙泵",video:"",images:null},
  "Glute Bridges":{cat:"Glutes",equip:[["Mat"]],cn:"臀桥",video:"",images:null},
  "Hip Thrusts":{cat:"Glutes",equip:[["Bench"]],cn:"臀推",video:"",images:["https://wger.de/media/exercise-images/1614/7f3cfae2-e062-4211-9a6b-5a10851ce7f4.jpg", "https://wger.de/media/exercise-images/1614/d5ebadd8-f676-427f-b755-6a0679c19265.jpg"]},
  "Single-Leg Glute Bridge":{cat:"Glutes",equip:[["Mat"]],cn:"单腿臀桥",video:"",images:null},
  "Sumo Deadlifts":{cat:"Glutes",equip:[["Dumbbells", "Barbell", "Kettlebell"]],cn:"相扑硬拉",video:"",images:null},
  // Legs
  "Box Jumps":{cat:"Legs",equip:[["Box"]],cn:"跳箱",video:"BV1CW411F7w1",images:null},
  "Bulgarian Split Squats":{cat:"Legs",equip:[["Bench", "Box"]],cn:"保加利亚分腿蹲",video:"",images:["https://wger.de/media/exercise-images/1102/cf41f3fb-a3e6-4d0b-b704-6404a7e584fc.jpg"]},
  "Calf Raises":{cat:"Legs",equip:[],cn:"提踵",video:"",images:["https://wger.de/media/exercise-images/622/9a429bd0-afd3-4ad0-8043-e9beec901c81.jpeg", "https://wger.de/media/exercise-images/622/d6d57067-97de-462e-a8bb-15228d730323.jpeg"]},
  "Cossack Squats":{cat:"Legs",equip:[],cn:"哥萨克蹲",video:"",images:null},
  "Front Squats":{cat:"Legs",equip:[["Dumbbells", "Barbell", "Kettlebell"]],cn:"前蹲",video:"BV1Ns4115776",images:["https://wger.de/media/exercise-images/191/Front-squat-1-857x1024.png", "https://wger.de/media/exercise-images/191/Front-squat-2-857x1024.png"]},
  "Goblet Squats":{cat:"Legs",equip:[["Dumbbell", "Kettlebell"]],cn:"高脚杯深蹲",video:"",images:["https://wger.de/media/exercise-images/203/1c052351-2af0-4227-aeb0-244008e4b0a8.jpeg", "https://wger.de/media/exercise-images/203/2ab30113-4e08-4d39-9d23-d901ce2c0971.jpeg"]},
  "Jump Squats":{cat:"Legs",equip:[],cn:"跳蹲",video:"",images:null},
  "Lateral Lunges":{cat:"Legs",equip:[],cn:"侧弓步",video:"",images:null},
  "Leg Curls":{cat:"Legs",equip:[["Leg Curl Machine"]],cn:"腿弯举",video:"",images:["https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-1.png", "https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-2.png"]},
  "Leg Extensions":{cat:"Legs",equip:[["Leg Extension Machine"]],cn:"腿伸展",video:"",images:["https://wger.de/media/exercise-images/851/4d621b17-f6cb-4107-97c0-9f44e9a2dbc6.webp"]},
  "Leg Press":{cat:"Legs",equip:[["Leg Press Machine"]],cn:"腿举",video:"",images:["https://wger.de/media/exercise-images/130/Narrow-stance-hack-squats-1-1024x721.png", "https://wger.de/media/exercise-images/130/Narrow-stance-hack-squats-2-1024x721.png"]},
  "Lunges":{cat:"Legs",equip:[],cn:"弓步",video:"",images:["https://wger.de/media/exercise-images/113/Walking-lunges-1.png", "https://wger.de/media/exercise-images/113/Walking-lunges-2.png"]},
  "Nordic Hamstring Curls":{cat:"Legs",equip:[["Anchor"]],cn:"北欧腿弯举",video:"",images:null},
  "Pistol Squats":{cat:"Legs",equip:[],cn:"单腿深蹲",video:"BV1Cs411p79v",images:["https://wger.de/media/exercise-images/456/3b681e59-377b-40db-9113-ca5873ce084b.jpg", "https://wger.de/media/exercise-images/456/c51d875b-0c07-495e-a7cf-08893a9f125d.jpg"]},
  "Reverse Lunges":{cat:"Legs",equip:[],cn:"反向弓步",video:"",images:["https://wger.de/media/exercise-images/999/d0931eb3-8db0-4049-bb08-aa4036072056.jfif", "https://wger.de/media/exercise-images/999/8548b2d2-004d-48b4-95fd-b1b25f4e53d0.jfif"]},
  "Single-Leg Calf Raises":{cat:"Legs",equip:[],cn:"单腿提踵",video:"",images:null},
  "Split Squats":{cat:"Legs",equip:[],cn:"分腿蹲",video:"",images:null},
  "Squats":{cat:"Legs",equip:[],cn:"深蹲",video:"BV1AW411A7YD",images:["https://wger.de/media/exercise-images/1801/60043328-1cfb-4289-9865-aaf64d5aaa28.jpg", "https://wger.de/media/exercise-images/1801/68720d5e-f422-47ac-81e4-c7b51144d302.jpg"]},
  "Step-ups":{cat:"Legs",equip:[["Box", "Bench"]],cn:"登台阶",video:"",images:null},
  "Sumo Squats":{cat:"Legs",equip:[],cn:"相扑深蹲",video:"",images:null},
  "Walking Lunges":{cat:"Legs",equip:[],cn:"行走弓步",video:"",images:["https://wger.de/media/exercise-images/113/Walking-lunges-1.png"]},
  "Wall Sit":{cat:"Legs",equip:[],cn:"靠墙静蹲",video:"",images:null},
  // Cardio
  "Broad Jumps":{cat:"Cardio",equip:[],cn:"立定跳远",video:"",images:null},
  "Burpees":{cat:"Cardio",equip:[],cn:"波比跳",video:"BV1YW411c71b",images:null},
  "Butt Kicks":{cat:"Cardio",equip:[],cn:"后踢跑",video:"",images:null},
  "Fast Feet":{cat:"Cardio",equip:[],cn:"快速小碎步",video:"",images:null},
  "Frog Jumps":{cat:"Cardio",equip:[],cn:"蛙跳",video:"",images:null},
  "High Knees":{cat:"Cardio",equip:[],cn:"高抬腿",video:"",images:null},
  "Ice Skaters":{cat:"Cardio",equip:[],cn:"滑冰者",video:"",images:null},
  "Jumping Jacks":{cat:"Cardio",equip:[],cn:"开合跳",video:"",images:null},
  "Jumping Lunges":{cat:"Cardio",equip:[],cn:"跳跃弓步",video:"",images:null},
  "Jump Rope":{cat:"Cardio",equip:[["Jump Rope"]],cn:"跳绳",video:"",images:null},
  "Lateral Hops":{cat:"Cardio",equip:[],cn:"侧跳",video:"",images:null},
  "Power Skips":{cat:"Cardio",equip:[],cn:"高跳",video:"",images:null},
  "Running in Place":{cat:"Cardio",equip:[],cn:"原地跑",video:"",images:null},
  "Seal Jacks":{cat:"Cardio",equip:[],cn:"海豹开合跳",video:"",images:null},
  "Shuttle Run":{cat:"Cardio",equip:[],cn:"折返跑",video:"",images:null},
  "Skaters":{cat:"Cardio",equip:[],cn:"滑冰者",video:"",images:null},
  "Speed Step-ups":{cat:"Cardio",equip:[["Box", "Step"]],cn:"快速登台阶",video:"",images:null},
  "Split Jumps":{cat:"Cardio",equip:[],cn:"分腿跳",video:"",images:null},
  "Star Jumps":{cat:"Cardio",equip:[],cn:"星形跳",video:"",images:null},
  "Tuck Jumps":{cat:"Cardio",equip:[],cn:"团身跳",video:"",images:null},
  // Full Body
  "Bear Crawl":{cat:"Full Body",equip:[],cn:"熊爬",video:"",images:null},
  "Clean and Press":{cat:"Full Body",equip:[["Dumbbells", "Barbell", "Kettlebell"]],cn:"翻举推举",video:"",images:null},
  "Devil Press":{cat:"Full Body",equip:[["Dumbbells"]],cn:"魔鬼推举",video:"",images:null},
  "Inchworm":{cat:"Full Body",equip:[],cn:"蠕虫式",video:"",images:null},
  "Man Makers":{cat:"Full Body",equip:[["Dumbbells"]],cn:"人体制造者",video:"",images:null},
  "Plank to Squat":{cat:"Full Body",equip:[],cn:"平板转深蹲",video:"",images:null},
  "Sprawls":{cat:"Full Body",equip:[],cn:"俯卧扩展",video:"",images:null},
  "Thrusters":{cat:"Full Body",equip:[["Dumbbells", "Barbell", "Kettlebell"]],cn:"推举深蹲",video:"",images:null},
  "Turkish Get-up":{cat:"Full Body",equip:[["Dumbbell", "Kettlebell"]],cn:"土耳其起立",video:"",images:null},
  "Walkout to Push-up":{cat:"Full Body",equip:[],cn:"手走俯卧撑",video:"",images:null},
  // Flexibility
  "Cat-Cow Stretch":{cat:"Flexibility",equip:[["Mat"]],cn:"猫牛式",video:"",images:null},
  "Child's Pose":{cat:"Flexibility",equip:[["Mat"]],cn:"婴儿式",video:"",images:null},
  "Cobra Stretch":{cat:"Flexibility",equip:[["Mat"]],cn:"眼镜蛇式",video:"",images:null},
  "Downward Dog":{cat:"Flexibility",equip:[["Mat"]],cn:"下犬式",video:"",images:null},
  "Figure Four Stretch":{cat:"Flexibility",equip:[["Mat"]],cn:"四字拉伸",video:"",images:null},
  "Hamstring Stretch":{cat:"Flexibility",equip:[["Mat"]],cn:"腿后拉伸",video:"",images:null},
  "Hip Circles":{cat:"Flexibility",equip:[],cn:"髋关节绕环",video:"",images:null},
  "Hip Flexor Stretch":{cat:"Flexibility",equip:[["Mat"]],cn:"髋屈肌拉伸",video:"",images:null},
  "Lizard Pose":{cat:"Flexibility",equip:[["Mat"]],cn:"蜥蜴式",video:"",images:null},
  "Pigeon Pose":{cat:"Flexibility",equip:[["Mat"]],cn:"鸽子式",video:"",images:null},
  "Quad Stretch":{cat:"Flexibility",equip:[],cn:"股四头肌拉伸",video:"",images:null},
  "Scorpion Stretch":{cat:"Flexibility",equip:[["Mat"]],cn:"蝎子式拉伸",video:"",images:null},
  "Seated Forward Fold":{cat:"Flexibility",equip:[["Mat"]],cn:"坐位体前屈",video:"",images:null},
  "Spinal Twist":{cat:"Flexibility",equip:[["Mat"]],cn:"脊柱扭转",video:"",images:null},
  "Standing Side Bend":{cat:"Flexibility",equip:[],cn:"站姿侧弯",video:"",images:null},
  "World's Greatest Stretch":{cat:"Flexibility",equip:[["Mat"]],cn:"世界最伟大拉伸",video:"",images:null},
};

// Total: 155 exercises

// --- Derived constants (auto-built from EXERCISE_DATA) ---

// Category -> exercise names
var EXERCISE_LIBRARY = {};
var EXERCISE_EQUIPMENT = {};
var EXERCISE_CHINESE = {};
var DEFAULT_VIDEOS = {};
var EXERCISE_ANIMATED = {};
var EXERCISE_STATIC = {};

(function(){
  for(var name in EXERCISE_DATA){
    var d = EXERCISE_DATA[name];
    if(!EXERCISE_LIBRARY[d.cat]) EXERCISE_LIBRARY[d.cat] = [];
    EXERCISE_LIBRARY[d.cat].push(name);
    if(d.equip.length) EXERCISE_EQUIPMENT[name] = d.equip;
    if(d.cn) EXERCISE_CHINESE[name] = d.cn;
    if(d.video) DEFAULT_VIDEOS[name] = d.video;
    if(d.images && d.images.length >= 2) EXERCISE_ANIMATED[name] = d.images;
    else if(d.images && d.images.length === 1) EXERCISE_STATIC[name] = d.images[0];
  }
})();

var CATEGORIES = Object.keys(EXERCISE_LIBRARY).concat("Other");
