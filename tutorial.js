// =========================
// TUTORIAL VIDEO SYSTEM
// =========================

// Hardcoded default videos (fallback). User-saved videos in localStorage override these.
// Format: "Exercise Name": "YouTubeVideoId"
var DEFAULT_VIDEOS = {
  // Chest
  "Bench Press": "",
  "Chest Dips": "",
  "Chest Flyes": "",
  "Close-Grip Bench Press": "",
  "Decline Push-ups": "",
  "Dumbbell Pullover": "",
  "Incline Bench Press": "",
  "Incline Dumbbell Press": "",
  "Push-ups": "",
  "Svend Press": "",
  "Wide Push-ups": "",
  // Shoulders
  "Arnold Press": "",
  "Bus Drivers": "",
  "Face Pulls": "",
  "Front Raises": "",
  "Handstand Hold": "",
  "Lateral Raises": "",
  "Overhead Press": "",
  "Pike Push-ups": "",
  "Rear Delt Flyes": "",
  "Shoulder Shrugs": "",
  "Upright Rows": "",
  "Y-T-W Raises": "",
  // Upper Back
  "Band Pull-Aparts": "",
  "Bent-Over Rows": "",
  "Chin-ups": "",
  "Dumbbell Rows": "",
  "Inverted Rows": "",
  "Lat Pulldowns": "",
  "Pull-ups": "",
  "Renegade Rows": "",
  "Reverse Flyes": "",
  "Seated Cable Rows": "",
  "Straight-Arm Pulldowns": "",
  "T-Bar Rows": "",
  // Lower Back
  "Back Extensions": "",
  "Bird Dog": "",
  "Deadlifts": "",
  "Good Mornings": "",
  "Jefferson Curls": "",
  "Kettlebell Swings": "",
  "Reverse Hyperextension": "",
  "Romanian Deadlifts": "",
  "Superman Hold": "",
  // Arms
  "Bicep Curls": "",
  "Close-Grip Push-ups": "",
  "Concentration Curls": "",
  "Diamond Push-ups": "",
  "Hammer Curls": "",
  "Overhead Tricep Extension": "",
  "Preacher Curls": "",
  "Reverse Curls": "",
  "Skull Crushers": "",
  "Tricep Dips": "",
  "Tricep Kickbacks": "",
  "Tricep Pushdowns": "",
  "Wrist Curls": "",
  "Zottman Curls": "",
  // Abs
  "Bicycle Crunches": "",
  "Crunches": "",
  "Dead Bug": "",
  "Flutter Kicks": "",
  "Hanging Knee Raise": "",
  "Heel Touches": "",
  "Hollow Body Hold": "",
  "Leg Raises": "",
  "Mountain Climbers": "",
  "Plank": "",
  "Plank Jacks": "",
  "Reverse Crunch": "",
  "Russian Twists": "",
  "Side Plank": "",
  "Sit-ups": "",
  "Toe Touches": "",
  "V-ups": "",
  "Windshield Wipers": "",
  // Glutes
  "Banded Walks": "",
  "Cable Kickbacks": "",
  "Clamshells": "",
  "Curtsy Lunges": "",
  "Donkey Kicks": "",
  "Fire Hydrants": "",
  "Frog Pumps": "",
  "Glute Bridges": "",
  "Hip Thrusts": "",
  "Single-Leg Glute Bridge": "",
  "Sumo Deadlifts": "",
  // Legs
  "Box Jumps": "",
  "Bulgarian Split Squats": "",
  "Calf Raises": "",
  "Cossack Squats": "",
  "Front Squats": "",
  "Goblet Squats": "",
  "Jump Squats": "",
  "Lateral Lunges": "",
  "Leg Curls": "",
  "Leg Extensions": "",
  "Leg Press": "",
  "Lunges": "",
  "Nordic Hamstring Curls": "",
  "Pistol Squats": "",
  "Reverse Lunges": "",
  "Single-Leg Calf Raises": "",
  "Split Squats": "",
  "Squats": "",
  "Step-ups": "",
  "Sumo Squats": "",
  "Walking Lunges": "",
  "Wall Sit": "",
  // Cardio
  "Broad Jumps": "",
  "Burpees": "",
  "Butt Kicks": "",
  "Fast Feet": "",
  "Frog Jumps": "",
  "High Knees": "",
  "Ice Skaters": "",
  "Jumping Jacks": "",
  "Jumping Lunges": "",
  "Jump Rope": "",
  "Lateral Hops": "",
  "Power Skips": "",
  "Running in Place": "",
  "Seal Jacks": "",
  "Shuttle Run": "",
  "Skaters": "",
  "Speed Step-ups": "",
  "Split Jumps": "",
  "Star Jumps": "",
  "Tuck Jumps": "",
  // Full Body
  "Bear Crawl": "",
  "Clean and Press": "",
  "Devil Press": "",
  "Inchworm": "",
  "Man Makers": "",
  "Plank to Squat": "",
  "Sprawls": "",
  "Thrusters": "",
  "Turkish Get-up": "",
  "Walkout to Push-up": "",
  // Flexibility
  "Cat-Cow Stretch": "",
  "Child's Pose": "",
  "Cobra Stretch": "",
  "Downward Dog": "",
  "Figure Four Stretch": "",
  "Hamstring Stretch": "",
  "Hip Circles": "",
  "Hip Flexor Stretch": "",
  "Lizard Pose": "",
  "Pigeon Pose": "",
  "Quad Stretch": "",
  "Scorpion Stretch": "",
  "Seated Forward Fold": "",
  "Spinal Twist": "",
  "Standing Side Bend": "",
  "World's Greatest Stretch": ""
};

// User-saved overrides (localStorage)
var userVideos = JSON.parse(localStorage.getItem("hiitVideos") || "{}");

function saveUserVideos(){
  localStorage.setItem("hiitVideos", JSON.stringify(userVideos));
}

// Lookup: user-saved > hardcoded default > null
function getVideoId(name){
  if(userVideos[name]) return userVideos[name];
  if(DEFAULT_VIDEOS[name]) return DEFAULT_VIDEOS[name];
  return null;
}

function extractVideoId(url){
  if(!url) return null;
  // Bilibili: BV id
  var bv = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if(bv) return bv[1];
  // YouTube
  var yt = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return yt ? yt[1] : null;
}

function isBilibili(vid){
  return vid && vid.startsWith("BV");
}

function youtubeSearchUrl(name){
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " exercise tutorial proper form");
}

function bilibiliSearchUrl(name){
  var cn = EXERCISE_CHINESE[name] || name;
  return "https://search.bilibili.com/all?keyword=" + encodeURIComponent(cn + " 教程 正确姿势");
}

var EXERCISE_CHINESE = {
  "Bench Press":"卧推","Chest Dips":"双杠臂屈伸","Chest Flyes":"飞鸟","Close-Grip Bench Press":"窄握卧推",
  "Decline Push-ups":"下斜俯卧撑","Dumbbell Pullover":"哑铃仰卧上拉","Incline Bench Press":"上斜卧推",
  "Incline Dumbbell Press":"上斜哑铃卧推","Push-ups":"俯卧撑","Svend Press":"斯文德推举","Wide Push-ups":"宽距俯卧撑",
  "Arnold Press":"阿诺德推举","Bus Drivers":"方向盘转体","Face Pulls":"面拉","Front Raises":"前平举",
  "Handstand Hold":"倒立支撑","Lateral Raises":"侧平举","Overhead Press":"肩上推举","Pike Push-ups":"屈体俯卧撑",
  "Rear Delt Flyes":"反向飞鸟","Shoulder Shrugs":"耸肩","Upright Rows":"直立划船","Y-T-W Raises":"Y-T-W举",
  "Band Pull-Aparts":"弹力带拉伸","Bent-Over Rows":"俯身划船","Chin-ups":"反握引体向上","Dumbbell Rows":"哑铃划船",
  "Inverted Rows":"反向划船","Lat Pulldowns":"高位下拉","Pull-ups":"引体向上","Renegade Rows":"叛逆划船",
  "Reverse Flyes":"俯身反向飞鸟","Seated Cable Rows":"坐姿绳索划船","Straight-Arm Pulldowns":"直臂下压","T-Bar Rows":"T杠划船",
  "Back Extensions":"背部伸展","Bird Dog":"鸟狗式","Deadlifts":"硬拉","Good Mornings":"早安式体前屈",
  "Jefferson Curls":"杰斐逊弯举","Kettlebell Swings":"壶铃摆荡","Reverse Hyperextension":"反向背伸展",
  "Romanian Deadlifts":"罗马尼亚硬拉","Superman Hold":"超人式",
  "Bicep Curls":"二头弯举","Close-Grip Push-ups":"窄距俯卧撑","Concentration Curls":"集中弯举",
  "Diamond Push-ups":"钻石俯卧撑","Hammer Curls":"锤式弯举","Overhead Tricep Extension":"过顶三头臂屈伸",
  "Preacher Curls":"托臂弯举","Reverse Curls":"反握弯举","Skull Crushers":"仰卧臂屈伸",
  "Tricep Dips":"三头臂屈伸","Tricep Kickbacks":"三头回扣","Tricep Pushdowns":"三头下压",
  "Wrist Curls":"腕弯举","Zottman Curls":"佐特曼弯举",
  "Bicycle Crunches":"自行车卷腹","Crunches":"卷腹","Dead Bug":"死虫式","Flutter Kicks":"交替踢腿",
  "Hanging Knee Raise":"悬垂举腿","Heel Touches":"触踵","Hollow Body Hold":"空心支撑","Leg Raises":"仰卧举腿",
  "Mountain Climbers":"登山者","Plank":"平板支撑","Plank Jacks":"平板开合跳","Reverse Crunch":"反向卷腹",
  "Russian Twists":"俄罗斯转体","Side Plank":"侧平板支撑","Sit-ups":"仰卧起坐","Toe Touches":"触脚尖",
  "V-ups":"V字起坐","Windshield Wipers":"雨刷式",
  "Banded Walks":"弹力带侧走","Cable Kickbacks":"绳索后踢","Clamshells":"蚌式","Curtsy Lunges":"交叉弓步",
  "Donkey Kicks":"驴踢","Fire Hydrants":"消防栓式","Frog Pumps":"蛙泵","Glute Bridges":"臀桥",
  "Hip Thrusts":"臀推","Single-Leg Glute Bridge":"单腿臀桥","Sumo Deadlifts":"相扑硬拉",
  "Box Jumps":"跳箱","Bulgarian Split Squats":"保加利亚分腿蹲","Calf Raises":"提踵","Cossack Squats":"哥萨克蹲",
  "Front Squats":"前蹲","Goblet Squats":"高脚杯深蹲","Jump Squats":"跳蹲","Lateral Lunges":"侧弓步",
  "Leg Curls":"腿弯举","Leg Extensions":"腿伸展","Leg Press":"腿举","Lunges":"弓步",
  "Nordic Hamstring Curls":"北欧腿弯举","Pistol Squats":"单腿深蹲","Reverse Lunges":"反向弓步",
  "Single-Leg Calf Raises":"单腿提踵","Split Squats":"分腿蹲","Squats":"深蹲","Step-ups":"登台阶",
  "Sumo Squats":"相扑深蹲","Walking Lunges":"行走弓步","Wall Sit":"靠墙静蹲",
  "Broad Jumps":"立定跳远","Burpees":"波比跳","Butt Kicks":"后踢跑","Fast Feet":"快速小碎步",
  "Frog Jumps":"蛙跳","High Knees":"高抬腿","Ice Skaters":"滑冰者","Jumping Jacks":"开合跳",
  "Jumping Lunges":"跳跃弓步","Jump Rope":"跳绳","Lateral Hops":"侧跳","Power Skips":"高跳",
  "Running in Place":"原地跑","Seal Jacks":"海豹开合跳","Shuttle Run":"折返跑","Skaters":"滑冰者",
  "Speed Step-ups":"快速登台阶","Split Jumps":"分腿跳","Star Jumps":"星形跳","Tuck Jumps":"团身跳",
  "Bear Crawl":"熊爬","Clean and Press":"翻举推举","Devil Press":"魔鬼推举","Inchworm":"蠕虫式",
  "Man Makers":"人体制造者","Plank to Squat":"平板转深蹲","Sprawls":"俯卧扩展","Thrusters":"推举深蹲",
  "Turkish Get-up":"土耳其起立","Walkout to Push-up":"手走俯卧撑",
  "Cat-Cow Stretch":"猫牛式","Child's Pose":"婴儿式","Cobra Stretch":"眼镜蛇式","Downward Dog":"下犬式",
  "Figure Four Stretch":"四字拉伸","Hamstring Stretch":"腿后拉伸","Hip Circles":"髋关节绕环",
  "Hip Flexor Stretch":"髋屈肌拉伸","Lizard Pose":"蜥蜴式","Pigeon Pose":"鸽子式","Quad Stretch":"股四头肌拉伸",
  "Scorpion Stretch":"蝎子式拉伸","Seated Forward Fold":"坐位体前屈","Spinal Twist":"脊柱扭转",
  "Standing Side Bend":"站姿侧弯","World's Greatest Stretch":"世界最伟大拉伸"
};

function embedUrl(vid){
  if(isBilibili(vid)) return "https://player.bilibili.com/player.html?bvid=" + vid + "&high_quality=1";
  return "https://www.youtube.com/embed/" + vid + "?rel=0&modestbranding=1";
}

function getChineseName(name){
  return EXERCISE_CHINESE[name] || "";
}

function displayName(name){
  var cn = EXERCISE_CHINESE[name];
  return cn ? name + " " + cn : name;
}

// Show tutorial during workout (rest/water/pause)
function showWorkoutTutorial(exerciseName){
  var area = $("tutorialArea");
  if(!area) return;
  var vid = getVideoId(exerciseName);
  var isUserSaved = !!userVideos[exerciseName];
  if(vid){
    area.innerHTML =
      '<div class="tutorial-header">Tutorial: ' + exerciseName + (isUserSaved ? ' <span style="font-size:0.8em;color:#34c759;">(saved)</span>' : '') + '</div>' +
      '<iframe class="tutorial-frame" src="' + embedUrl(vid) + '" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
      '<div class="tutorial-actions">' +
      '<a class="tutorial-search-btn" href="' + youtubeSearchUrl(exerciseName) + '" target="_blank">YouTube</a> ' +
      '<a class="tutorial-search-btn" href="' + bilibiliSearchUrl(exerciseName) + '" target="_blank">Bilibili</a>' +
      '<div class="tutorial-save"><input class="tutorial-url-input" placeholder="Paste YouTube or Bilibili URL"><button class="tutorial-save-btn" onclick="saveTutorialFromInput(\'' + exerciseName.replace(/'/g, "\\'") + '\')">Save</button></div>' +
      '</div>';
  } else {
    area.innerHTML =
      '<div class="tutorial-header">Tutorial: ' + exerciseName + '</div>' +
      '<a class="tutorial-search-btn" href="' + youtubeSearchUrl(exerciseName) + '" target="_blank">YouTube</a> ' +
      '<a class="tutorial-search-btn" href="' + bilibiliSearchUrl(exerciseName) + '" target="_blank">Bilibili</a>' +
      '<div class="tutorial-save"><input class="tutorial-url-input" placeholder="Paste YouTube or Bilibili URL"><button class="tutorial-save-btn" onclick="saveTutorialFromInput(\'' + exerciseName.replace(/'/g, "\\'") + '\')">Save</button></div>';
  }
  area.style.display = "block";
}

function hideWorkoutTutorial(){
  var area = $("tutorialArea");
  if(area){
    area.style.display = "none";
    area.innerHTML = "";
  }
}

function saveTutorialFromInput(name){
  var input = document.querySelector(".tutorial-url-input");
  if(!input) return;
  var vid = extractVideoId(input.value);
  if(!vid){ alert("Could not parse YouTube URL"); return; }
  userVideos[name] = vid;
  saveUserVideos();
  showWorkoutTutorial(name);
}

// Tutorial button for picker items — opens overlay
function getTutorialHtml(name){
  return '<span class="picker-tutorial" onclick="event.stopPropagation();showTutorialOverlay(\'' + name.replace(/'/g, "\\'") + '\')">&#9654;</span>';
}

// Tutorial link for form exercise rows — opens overlay
function getFormTutorialHtml(name){
  if(!name) return '';
  return '<span class="eq-tutorial" onclick="showTutorialOverlay(\'' + name.replace(/'/g, "\\'") + '\')">&#9654;</span>';
}

// Tutorial overlay (used in picker and form)
var tutorialOverlayName = null;

function showTutorialOverlay(name){
  var overlay = $("tutorialOverlay");
  if(!overlay) return;
  tutorialOverlayName = name;
  var vid = getVideoId(name);
  var isUserSaved = !!userVideos[name];
  var content = '<div class="tutorial-modal" onclick="event.stopPropagation()">';
  content += '<div class="picker-handle"></div>';
  content += '<h3>' + name + '</h3>';
  if(vid){
    content += '<iframe class="tutorial-frame" src="' + embedUrl(vid) + '" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  }
  content += '<div class="tutorial-btn-row">';
  content += '<a class="tutorial-search-btn" href="' + youtubeSearchUrl(name) + '" target="_blank">YouTube</a>';
  content += '<a class="tutorial-search-btn" href="' + bilibiliSearchUrl(name) + '" target="_blank">Bilibili</a>';
  if(vid && isUserSaved) content += '<button class="tutorial-remove-btn" onclick="removeTutorialVideo()">Remove saved</button>';
  content += '</div>';
  content += '<div class="tutorial-save"><input class="tutorial-url-input" placeholder="Paste YouTube or Bilibili URL"><button class="tutorial-save-btn" onclick="saveTutorialOverlay()">Save</button></div>';
  content += '<button class="tutorial-close-btn" onclick="closeTutorialOverlay()">Close</button>';
  content += '</div>';
  overlay.innerHTML = content;
  overlay.style.display = "flex";
}

function closeTutorialOverlay(){
  var overlay = $("tutorialOverlay");
  if(overlay){ overlay.style.display = "none"; overlay.innerHTML = ""; }
  tutorialOverlayName = null;
}

function saveTutorialOverlay(){
  if(!tutorialOverlayName) return;
  var input = document.querySelector("#tutorialOverlay .tutorial-url-input");
  if(!input) return;
  var vid = extractVideoId(input.value);
  if(!vid){ alert("Could not parse YouTube URL"); return; }
  userVideos[tutorialOverlayName] = vid;
  saveUserVideos();
  showTutorialOverlay(tutorialOverlayName);
}

function removeTutorialVideo(){
  if(!tutorialOverlayName) return;
  delete userVideos[tutorialOverlayName];
  saveUserVideos();
  showTutorialOverlay(tutorialOverlayName);
}

// Pull-down-to-dismiss for tutorial overlay
(function(){
  var startY = 0;
  document.addEventListener("touchstart", function(e){
    var modal = document.querySelector("#tutorialOverlay .tutorial-modal");
    if(!modal || modal.scrollTop > 0) { startY = 0; return; }
    if(modal.contains(e.target)) startY = e.touches[0].clientY;
    else startY = 0;
  });
  document.addEventListener("touchmove", function(e){
    if(!startY) return;
    var modal = document.querySelector("#tutorialOverlay .tutorial-modal");
    if(!modal || modal.scrollTop > 0) { startY = 0; return; }
    var diff = e.touches[0].clientY - startY;
    if(diff > 0){
      modal.style.transform = "translateY(" + diff + "px)";
      modal.style.transition = "none";
      e.preventDefault();
    }
  }, {passive: false});
  document.addEventListener("touchend", function(e){
    if(!startY) return;
    var modal = document.querySelector("#tutorialOverlay .tutorial-modal");
    if(modal){
      var diff = e.changedTouches[0].clientY - startY;
      modal.style.transition = "transform 0.2s";
      modal.style.transform = "";
      if(diff > 80) closeTutorialOverlay();
    }
    startY = 0;
  });
})();
