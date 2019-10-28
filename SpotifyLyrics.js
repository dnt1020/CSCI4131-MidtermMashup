var song = {
  name: "NONE",
  artist: "NONE",
  spotifyTrackID: "NONE",
  musixMatchTrackID: "NONE",
  musixMatchLink: "NONE",
  albumImage: "NONE",
  album: "NONE"
}

function submit(){
  song.name = document.getElementById("songTitle").value;
  song.artist = document.getElementById("artist").value;
  song.albumImage = "NONE";

  document.getElementById("songTitle").value="";
  document.getElementById("artist").value="";

  var url = getMusixMatchURL(song.name, song.artist);

  //Make JSONP call
  callScript(url);
}

function getCurrentSong(){
  $.ajax({
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    success: currentlyPlayingCallback,
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  })
}

// LYRICS PART
function getTrackCallback(data){
  if(data.message.header.status_code != 200){
    var oldSongElement = document.getElementById("songInfo");
    var songElement = document.createElement("h1");
    songElement.innerHTML = "Error in Finding Song - Check Name and Artist";
    songElement.id = "songInfo";
    oldSongElement.parentNode.replaceChild(songElement, oldSongElement);
    return;
  }
  song.name = data.message.body.track.track_name;
  song.artst = data.message.body.track.artist_name;
  song.musixMatchTrackID = data.message.body.track.track_id;
  song.musixMatchLink = data.message.body.track.track_share_url;
  song.album = data.message.body.track.album_name;
  console.log(song.musixMatchLink);
  var url = getLyricsURL(song.musixMatchTrackID);
  callScript(url);
}

function getLyricsCallback(data){
  //Building of Song Info Divider
  var oldSongElement = document.getElementById("songInfo");
  var songElement = document.createElement("div");

  if (song.albumImage != "NONE"){
    var image = document.createElement("img");
    image.id = "albumArt";
    image.src = song.albumImage;
    songElement.appendChild(image);
  }

  var name = document.createElement("h1");
  name.id = "name";
  name.innerHTML = song.name;
  songElement.appendChild(name);

  var album = document.createElement("h2")
  album.id = "album";
  album.innerHTML = song.album;
  songElement.appendChild(album);

  var artist = document.createElement("h3");
  artist.id = "artist";
  artist.innerHTML = "By " + song.artist;
  songElement.appendChild(artist);

  if(data.message.header.status_code!=200 || data.message.body.lyrics.lyrics_body=="")
  {
    var noLyrics = document.createElement("h1");
    noLyrics.id = "noLyrics";
    noLyrics.innerHTML = "No Lyrics Found";
    songElement.appendChild(noLyrics);

    var buttonHTML = "<button id=\"fllLyricButton\" onclick=\"window.open('" + song.musixMatchLink + "', '_blank')\">Link to Musix Match</button>";
    songElement.innerHTML += buttonHTML;
    songElement.id="songInfo";
    oldSongElement.parentNode.replaceChild(songElement, oldSongElement);
    return;
  }

  song.lyrics = data.message.body.lyrics.lyrics_body;
  console.log(song.lyrics);

  var lyrics = document.createElement("p");
  lyrics.id = "songLyrics"
  lyrics.innerHTML = song.lyrics.replace(/\n/g, "<br>");
  var buttonHTML = "<br><button id=\"fllLyricButton\" onclick=\"window.open('" + song.musixMatchLink + "', '_blank')\">Full Lyrics</button>";
  lyrics.innerHTML = lyrics.innerHTML.replace("<br>...<br>", "<br>" + buttonHTML + "<br>");
  songElement.appendChild(lyrics);

  songElement.id="songInfo";
  oldSongElement.parentNode.replaceChild(songElement, oldSongElement);
}

function callScript(url){
  var script = document.createElement('script');
  script.src= url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

function getMusixMatchURL(songTitle, artist){
  songTitle = songTitle.replace(" ", "%20");
  artist = artist.replace(" ", "%20");
  return "https://api.musixmatch.com/ws/1.1/matcher.track.get?format=jsonp&callback=getTrackCallback&q_artist=" + artist + "&q_track=" + songTitle + "&apikey=eb746d3e393a423afdb72c3495c6a0c1"
}

function getLyricsURL(id){
  return "https://api.musixmatch.com/ws/1.1/track.lyrics.get?format=jsonp&callback=getLyricsCallback&track_id=" + id + "&apikey=eb746d3e393a423afdb72c3495c6a0c1"
}

// SONG PART
function currentlyPlayingCallback(response){
  if(!response.is_playing){
    var oldSongElement = document.getElementById("songInfo");
    var songElement = document.createElement("h1");
    songElement.innerHTML = "No Currently Playing Song";
    songElement.id="songInfo";
    oldSongElement.parentNode.replaceChild(songElement, oldSongElement);
    return;
  }

  song.name = response.item.name;
  song.artist = response.item.artists[0].name;
  song.albumImage = response.item.album.images[0].url;
  console.log("artist: " + song.artist);
  console.log("song: " + song.name);
  var url = getMusixMatchURL(song.name, song.artist);
  callScript(url);
}

function loginCallback(response){
  userElement = document.getElementById('user');
  console.log(response);
  var image = response.images;
  if (image[0] != null) {
    var imageElement = document.createElement("img");
    imageElement.id = "userImg";
    imageElement.src = response.images[0].url;
    userElement.appendChild(imageElement);
  }

  userInfoElement = document.createElement("dl");
  userInfoElement.id= "userInfo";

  var displayName = response.display_name;
  var displayNameHTML = "<dt>Display Name</dt>\n<dd>" + displayName + "</dd>";
  userInfoElement.innerHTML += displayNameHTML;

  var id = response.id;
  var idHTML = "<dt>ID</dt>\n<dd>" + id + "</dd>";
  userInfoElement.innerHTML += idHTML;

  var spotifyLink = response.external_urls.spotify;
  var spotifyLinkHTML = "<br><dt><a href=\"" + spotifyLink  + "\" target=\"_blank\">User Profile on Spotify</a></dt>";
  userInfoElement.innerHTML += spotifyLinkHTML;

  userElement.appendChild(userInfoElement);    
}

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams(){
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

var params = getHashParams();
var access_token = params.access_token,
  refresh_token = params.refresh_token,
  error = params.error;

if (error) {
  alert('There was an error during the authentication');
}
else {
  if (access_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        success: loginCallback,
        headers: {
          'Authorization': 'Bearer ' + access_token
        }
    });
    $('#login').hide();
    $('#loggedin').show();
  } 
  else {
    // render initial screen
    $('#login').show();
    $('#loggedin').hide();
  }
}
