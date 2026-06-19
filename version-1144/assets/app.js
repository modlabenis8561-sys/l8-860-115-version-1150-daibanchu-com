(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var backgrounds = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-bg]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      backgrounds.forEach(function (background, backgroundIndex) {
        background.classList.toggle("is-active", backgroundIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-video]");
      var button = player.querySelector("[data-play]");
      var loaded = false;
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function attachStream() {
        var videoUrl = video.getAttribute("data-video");
        if (!videoUrl || loaded) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = videoUrl;
        }
        loaded = true;
      }

      function playVideo() {
        attachStream();
        button.classList.add("is-hidden");
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  function renderSearchCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join("");
    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + item.url + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '    <span class="poster-frame">',
      '      <img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '      <span class="poster-glow"></span>',
      '    </span>',
      '    <span class="movie-card-body">',
      '      <span class="movie-meta-line">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span>',
      '      <strong>' + escapeHtml(item.title) + '</strong>',
      '      <span class="movie-desc">' + escapeHtml(item.line) + '</span>',
      '      <span class="movie-tags">' + tags + '</span>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function setupSearch() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var index = window.SEARCH_INDEX || [];
    if (!form || !input || !results || !index.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function applySearch(query) {
      var text = query.trim().toLowerCase();
      if (!text) {
        return;
      }
      var matches = index.filter(function (item) {
        return item.searchText.indexOf(text) !== -1;
      }).slice(0, 72);
      title.textContent = text + " 的搜索结果";
      if (!matches.length) {
        results.innerHTML = '<div class="card-panel detail-main"><h2>没有找到匹配影片</h2><p>可以尝试更换片名、年份、地区或题材词。</p></div>';
        return;
      }
      results.innerHTML = matches.map(renderSearchCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      if (!query) {
        return;
      }
      var target = window.location.pathname + "?q=" + encodeURIComponent(query);
      window.history.replaceState({}, "", target);
      applySearch(query);
    });

    applySearch(initialQuery);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupPlayers();
    setupSearch();
  });
})();
