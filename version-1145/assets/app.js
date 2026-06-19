(function () {
  var navButton = document.querySelector('.nav-toggle');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navButton && navMenu) {
    navButton.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('open');
      navButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showHero(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var category = form.querySelector('[data-category-filter]');
    var year = form.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function cardMatches(card) {
      var terms = (input ? input.value : '').trim().toLowerCase();
      var selectedCategory = category ? category.value : 'all';
      var selectedYear = year ? year.value : 'all';
      var cardYear = card.getAttribute('data-year') || '';
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();
      var termOk = !terms || haystack.indexOf(terms) !== -1;
      var categoryOk = selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory;
      var yearOk = selectedYear === 'all' || cardYear === selectedYear || (selectedYear === 'older' && Number(cardYear) < 2023);

      return termOk && categoryOk && yearOk;
    }

    function applyFilters() {
      var visible = 0;
      cards.forEach(function (card) {
        var show = cardMatches(card);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, applyFilters);
      }
      if (category) {
        category.addEventListener(eventName, applyFilters);
      }
      if (year) {
        year.addEventListener(eventName, applyFilters);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });

    applyFilters();
  });
})();

function initMoviePlayer(videoUrl) {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var startButton = shell.querySelector('.player-start');
  var hlsInstance = null;
  var prepared = false;

  function prepareVideo() {
    if (prepared || !video) {
      return;
    }

    prepared = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else {
      video.src = videoUrl;
    }
  }

  function playVideo() {
    prepareVideo();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        shell.classList.add('is-playing');
      }).catch(function () {
        shell.classList.remove('is-playing');
      });
    } else {
      shell.classList.add('is-playing');
    }
  }

  if (startButton) {
    startButton.addEventListener('click', function () {
      playVideo();
    });
  }

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });

  video.addEventListener('ended', function () {
    shell.classList.remove('is-playing');
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
