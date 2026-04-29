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
  "Side Plank Left": "",
  "Side Plank Right": "",
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
  return "https://search.bilibili.com/all?keyword=" + encodeURIComponent(name + " exercise tutorial");
}

function embedUrl(vid){
  if(isBilibili(vid)) return "https://player.bilibili.com/player.html?bvid=" + vid + "&high_quality=1";
  return "https://www.youtube.com/embed/" + vid + "?rel=0&modestbranding=1";
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
    if(isUserSaved) content += '<button class="tutorial-change-btn" onclick="removeTutorialVideo()">Remove my video (use default)</button>';
  }
  content += '<a class="tutorial-search-btn" href="' + youtubeSearchUrl(name) + '" target="_blank">YouTube</a> ';
  content += '<a class="tutorial-search-btn" href="' + bilibiliSearchUrl(name) + '" target="_blank">Bilibili</a>';
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
