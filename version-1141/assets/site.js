(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-toggle]');
    var mobileMenu = qs('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    qsa('[data-hero]').forEach(function (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === current);
            });
        }

        function play() {
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

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                show(idx);
                play();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    });

    qsa('[data-page-filter-form]').forEach(function (form) {
        var input = qs('[data-page-filter-input]', form);
        var grid = qs('[data-filter-grid]');
        if (!input || !grid) {
            return;
        }
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            qsa('[data-movie-card]', grid).forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
            });
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });
        input.addEventListener('input', apply);
    });

    var searchForm = qs('[data-search-filter-form]');
    if (searchForm) {
        var params = new URLSearchParams(window.location.search);
        var qInput = qs('[data-search-input]', searchForm);
        var regionFilter = qs('[data-region-filter]', searchForm);
        var typeFilter = qs('[data-type-filter]', searchForm);
        var yearFilter = qs('[data-year-filter]', searchForm);
        var grid = qs('[data-search-grid]');
        if (qInput && params.get('q')) {
            qInput.value = params.get('q');
        }
        function runSearch() {
            var keyword = qInput ? qInput.value.trim().toLowerCase() : '';
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            qsa('[data-movie-card]', grid).forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var ok = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
            });
        }
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });
        [qInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runSearch);
                control.addEventListener('change', runSearch);
            }
        });
        runSearch();
    }
})();
