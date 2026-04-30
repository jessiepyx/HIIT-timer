// =========================
// TUTORIAL VIDEO SYSTEM
// =========================

// Hardcoded default videos (fallback). User-saved videos in localStorage override these.
// Format: "Exercise Name": "YouTubeVideoId"
// Uses DEFAULT_VIDEOS, EXERCISE_CHINESE from exercises.js

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
  var cnTut = getChineseName(exerciseName);
  var cnTutHtml = cnTut ? ' <span class="cn-name">' + cnTut + '</span>' : '';
  if(vid){
    area.innerHTML =
      '<div class="tutorial-header">Tutorial: ' + exerciseName + cnTutHtml + (isUserSaved ? ' <span style="font-size:0.8em;color:#34c759;">(saved)</span>' : '') + '</div>' +
      '<iframe class="tutorial-frame" src="' + embedUrl(vid) + '" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
      '<div class="tutorial-actions">' +
      '<a class="tutorial-search-btn" href="' + youtubeSearchUrl(exerciseName) + '" target="_blank">YouTube</a> ' +
      '<a class="tutorial-search-btn" href="' + bilibiliSearchUrl(exerciseName) + '" target="_blank">Bilibili</a>' +
      '<div class="tutorial-save"><input class="tutorial-url-input" placeholder="Paste YouTube or Bilibili URL"><button class="tutorial-save-btn" onclick="saveTutorialFromInput(\'' + exerciseName.replace(/'/g, "\\'") + '\')">Save</button></div>' +
      '</div>';
  } else {
    area.innerHTML =
      '<div class="tutorial-header">Tutorial: ' + exerciseName + cnTutHtml + '</div>' +
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
  return '<button class="picker-tutorial-btn" onclick="event.stopPropagation();showTutorialOverlay(\'' + name.replace(/'/g, "\\'") + '\')">Tutorial</button>';
}

// Tutorial link for form exercise rows — opens overlay
function getFormTutorialHtml(name){
  if(!name) return '';
  return '<button class="form-tutorial-btn" onclick="showTutorialOverlay(\'' + name.replace(/'/g, "\\'") + '\')">Tutorial</button>';
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
  var cnOv = getChineseName(name);
  content += '<h3>' + name + (cnOv ? ' <span class="cn-name">' + cnOv + '</span>' : '') + '</h3>';
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

// Pull-down-to-dismiss for tutorial overlay (handle only)
(function(){
  var startY = 0;
  document.addEventListener("touchstart", function(e){
    startY = 0;
    if(e.target.classList.contains("picker-handle")){
      var modal = document.querySelector("#tutorialOverlay .tutorial-modal");
      if(modal && modal.contains(e.target)) startY = e.touches[0].clientY;
    }
  });
  document.addEventListener("touchmove", function(e){
    if(!startY) return;
    var modal = document.querySelector("#tutorialOverlay .tutorial-modal");
    if(!modal) return;
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
