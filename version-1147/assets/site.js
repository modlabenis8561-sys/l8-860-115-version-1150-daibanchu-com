(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function closest(element, selector) {
    while (element && element.nodeType === 1) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('is-open');
      });
    }

    selectAll('.js-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || input.value.trim() === '') {
          event.preventDefault();
          input && input.focus();
        }
      });
    });

    selectAll('[data-hero]').forEach(function (hero) {
      var slides = selectAll('[data-hero-slide]', hero);
      var dots = selectAll('[data-hero-dot]', hero);
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });

      show(0);
      if (slides.length > 1) {
        start();
      }
    });

    selectAll('[data-filter-panel]').forEach(function (panel) {
      var section = closest(panel, '.filter-page') || document;
      var cards = selectAll('.js-card', section);
      var queryInput = panel.querySelector('[data-filter-query]');
      var fields = selectAll('[data-filter-field]', panel);
      var empty = section.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var incoming = params.get('q') || '';

      if (queryInput && incoming) {
        queryInput.value = incoming;
      }

      function matches(card) {
        var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
        var text = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || '',
          card.dataset.tags || ''
        ].join(' ').toLowerCase();

        if (query && text.indexOf(query) === -1) {
          return false;
        }

        for (var i = 0; i < fields.length; i += 1) {
          var field = fields[i];
          var value = field.value;
          var key = field.dataset.filterField;
          if (value && (card.dataset[key] || '') !== value) {
            return false;
          }
        }

        return true;
      }

      function applyFilters() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (queryInput) {
        queryInput.addEventListener('input', applyFilters);
      }
      fields.forEach(function (field) {
        field.addEventListener('change', applyFilters);
      });
      applyFilters();
    });

    selectAll('[data-player-shell]').forEach(function (shell) {
      var video = shell.querySelector('[data-player]');
      var button = shell.querySelector('[data-play-button]');
      var hlsInstance = null;
      var loaded = false;

      function loadStream() {
        if (!video || loaded) {
          return;
        }
        loaded = true;
        var stream = video.dataset.stream;
        if (!stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        loadStream();
        shell.classList.add('is-playing');
        var promise = video && video.play ? video.play() : null;
        if (promise && promise.catch) {
          promise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.currentTime) {
            shell.classList.remove('is-playing');
          }
        });
      }

      shell.addEventListener('click', function (event) {
        if (event.target === video || closest(event.target, 'button')) {
          return;
        }
        play();
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  });
}());
