(function () {
  window.initMoviePlayer = function (videoId, buttonId, coverId, mediaUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var attached = false;

    if (!video || !button || !cover || !mediaUrl) {
      return;
    }

    function attachMedia() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    }

    function start() {
      attachMedia();
      video.controls = true;
      cover.classList.add("is-hidden");
      var playAction = video.play();

      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
}());
