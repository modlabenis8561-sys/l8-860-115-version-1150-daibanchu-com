(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        card.classList.toggle('is-filter-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function buildSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card filter-card">' +
      '<a href="./' + escapeHtml(movie.file) + '" class="movie-card-link">' +
      '<div class="movie-cover"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="play-sign">▶</span></div>' +
      '<div class="movie-card-body"><h2>' + escapeHtml(movie.title) + '</h2>' +
      '<p class="movie-line">' + escapeHtml(movie.one_line || '') + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.region || '') + '</span><span>' + escapeHtml(movie.year || '') + '</span><span>' + escapeHtml(movie.type || '') + '</span></div>' +
      '<div class="tag-row">' + tags + '</div></div></a></article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function setupSearchPage() {
    var movies = window.SITE_MOVIES || [];
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var summary = document.querySelector('[data-search-summary]');
    if (!input || !results || !movies.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        return;
      }
      var matched = movies.filter(function (movie) {
        var text = [movie.title, movie.genre, movie.region, movie.year, movie.type, (movie.tags || []).join(' '), movie.one_line].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(buildSearchCard).join('');
      if (title) {
        title.textContent = '搜索结果';
      }
      if (summary) {
        summary.textContent = matched.length ? '已匹配到相关影片，可点击进入详情页。' : '暂无匹配影片，请换一个关键词。';
      }
    }

    input.addEventListener('input', render);
    render();
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-trigger]');
    if (!video || !overlay) {
      return;
    }
    var hlsUrl = video.getAttribute('data-hls') || '';
    var attached = false;

    function attach() {
      if (attached || !hlsUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        video.hlsController = hls;
      } else {
        video.src = hlsUrl;
      }
      attached = true;
    }

    function play() {
      attach();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupPageFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
