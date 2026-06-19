(function () {
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    var backTop = document.querySelector('[data-back-top]');

    function onScroll() {
        if (header) {
            header.classList.toggle('is-scrolled', window.scrollY > 18);
        }
        if (backTop) {
            backTop.classList.toggle('is-visible', window.scrollY > 320);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function getSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function yearMatches(cardYear, selected) {
        if (!selected || selected === 'all') {
            return true;
        }
        var year = parseInt(cardYear || '0', 10);
        if (!year) {
            return true;
        }
        if (selected.indexOf('-') > -1) {
            var parts = selected.split('-').map(function (item) {
                return parseInt(item, 10);
            });
            return year >= parts[0] && year <= parts[1];
        }
        return String(year) === selected;
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
        panels.forEach(function (panel) {
            var keyword = panel.querySelector('.js-filter-keyword');
            var region = panel.querySelector('.js-filter-region');
            var type = panel.querySelector('.js-filter-type');
            var year = panel.querySelector('.js-filter-year');
            var genre = panel.querySelector('.js-filter-genre');
            var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-card]'));
            var empty = panel.querySelector('[data-empty]');
            var initialQuery = getSearchQuery();

            if (keyword && initialQuery) {
                keyword.value = initialQuery;
            }

            function apply() {
                var q = normalize(keyword ? keyword.value : '');
                var selectedRegion = normalize(region ? region.value : 'all');
                var selectedType = normalize(type ? type.value : 'all');
                var selectedYear = year ? year.value : 'all';
                var selectedGenre = normalize(genre ? genre.value : 'all');
                var visible = 0;

                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute('data-search'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardGenre = normalize(card.getAttribute('data-genre'));
                    var cardYear = card.getAttribute('data-year');
                    var match = true;

                    if (q && searchText.indexOf(q) === -1) {
                        match = false;
                    }
                    if (selectedRegion !== 'all' && cardRegion.indexOf(selectedRegion) === -1) {
                        match = false;
                    }
                    if (selectedType !== 'all' && cardType.indexOf(selectedType) === -1) {
                        match = false;
                    }
                    if (selectedGenre !== 'all' && cardGenre.indexOf(selectedGenre) === -1 && searchText.indexOf(selectedGenre) === -1) {
                        match = false;
                    }
                    if (!yearMatches(cardYear, selectedYear)) {
                        match = false;
                    }

                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [keyword, region, type, year, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayer() {
        var video = document.querySelector('[data-player]');
        if (!video) {
            return;
        }
        var overlay = document.querySelector('[data-player-overlay]');
        var source = video.querySelector('source');
        var src = source ? source.getAttribute('src') : video.getAttribute('src');
        var hlsInstance = null;

        if (src) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = src;
            }
        }

        function start() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
        initPlayer();
    });
}());
