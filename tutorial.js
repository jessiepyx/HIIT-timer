// =========================
// TUTORIAL VIDEO SYSTEM
// =========================
var exerciseVideos = JSON.parse(localStorage.getItem("hiitVideos") || "{}");

function saveVideos(){
  localStorage.setItem("hiitVideos", JSON.stringify(exerciseVideos));
}

function extractVideoId(url){
  if(!url) return null;
  var m = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function youtubeSearchUrl(name){
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " exercise tutorial proper form");
}

function youtubeEmbedUrl(videoId){
  return "https://www.youtube.com/embed/" + videoId + "?rel=0&modestbranding=1";
}

// Show tutorial during workout (rest/water/pause)
function showWorkoutTutorial(exerciseName){
  var area = $("tutorialArea");
  if(!area) return;
  var vid = exerciseVideos[exerciseName];
  if(vid){
    area.innerHTML =
      '<div class="tutorial-header">Tutorial: ' + exerciseName + '</div>' +
      '<iframe class="tutorial-frame" src="' + youtubeEmbedUrl(vid) + '" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  } else {
    area.innerHTML =
      '<div class="tutorial-header">Tutorial: ' + exerciseName + '</div>' +
      '<a class="tutorial-search-btn" href="' + youtubeSearchUrl(exerciseName) + '" target="_blank">Search on YouTube</a>' +
      '<div class="tutorial-save"><input class="tutorial-url-input" placeholder="Paste YouTube URL to save"><button class="tutorial-save-btn" onclick="saveTutorialFromInput(\'' + exerciseName.replace(/'/g, "\\'") + '\')">Save</button></div>';
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
  exerciseVideos[name] = vid;
  saveVideos();
  showWorkoutTutorial(name);
}

// Tutorial button for picker items
function getTutorialHtml(name){
  var vid = exerciseVideos[name];
  if(vid){
    return '<a class="picker-tutorial" href="' + youtubeEmbedUrl(vid) + '" target="_blank" onclick="event.stopPropagation()">&#9654;</a>';
  }
  return '<a class="picker-tutorial" href="' + youtubeSearchUrl(name) + '" target="_blank" onclick="event.stopPropagation()">&#9654;</a>';
}

// Tutorial link for form exercise rows
function getFormTutorialHtml(name){
  if(!name) return '';
  var vid = exerciseVideos[name];
  var url = vid ? youtubeEmbedUrl(vid) : youtubeSearchUrl(name);
  return '<a class="eq-tutorial" href="' + url + '" target="_blank">&#9654;</a>';
}

// Inline tutorial viewer for picker/form (shows embedded video in a modal-like overlay)
var tutorialOverlayName = null;

function showTutorialOverlay(name){
  var overlay = $("tutorialOverlay");
  if(!overlay) return;
  tutorialOverlayName = name;
  var vid = exerciseVideos[name];
  var content = '<div class="tutorial-modal">';
  content += '<h3>' + name + '</h3>';
  if(vid){
    content += '<iframe class="tutorial-frame" src="' + youtubeEmbedUrl(vid) + '" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    content += '<button class="tutorial-change-btn" onclick="removeTutorialVideo()">Remove saved video</button>';
  } else {
    content += '<a class="tutorial-search-btn" href="' + youtubeSearchUrl(name) + '" target="_blank">Search on YouTube</a>';
    content += '<div class="tutorial-save"><input class="tutorial-url-input" placeholder="Paste YouTube URL to save"><button class="tutorial-save-btn" onclick="saveTutorialOverlay()">Save</button></div>';
  }
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
  var input = document.querySelector(".tutorial-url-input");
  if(!input) return;
  var vid = extractVideoId(input.value);
  if(!vid){ alert("Could not parse YouTube URL"); return; }
  exerciseVideos[tutorialOverlayName] = vid;
  saveVideos();
  showTutorialOverlay(tutorialOverlayName);
}

function removeTutorialVideo(){
  if(!tutorialOverlayName) return;
  delete exerciseVideos[tutorialOverlayName];
  saveVideos();
  showTutorialOverlay(tutorialOverlayName);
}
