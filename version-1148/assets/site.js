(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNavigation() {
        var searchToggle = qs("[data-search-toggle]");
        var searchPanel = qs("[data-search-panel]");
        var menuToggle = qs("[data-menu-toggle]");
        var mobileNav = qs("[data-mobile-nav]");

        if (searchToggle && searchPanel) {
            searchToggle.addEventListener("click", function () {
                searchPanel.classList.toggle("is-open");
                var input = qs("input", searchPanel);
                if (searchPanel.classList.contains("is-open") && input) {
                    input.focus();
                }
            });
        }

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        qsa("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input[type='search'], input[type='text']", form);
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            });
        });
    }

    function initHero() {
        var slider = qs("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = qsa(".hero-slide", slider);
        var dots = qsa(".hero-dot", slider);
        var nextButton = qs("[data-hero-next]", slider);
        var prevButton = qs("[data-hero-prev]", slider);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        qsa("[data-filter-root]").forEach(function (root) {
            var input = qs("[data-filter-input]", root);
            var yearSelect = qs("[data-filter-year]", root);
            var typeSelect = qs("[data-filter-type]", root);
            var cards = qsa(".movie-card", root).concat(qsa(".list-card", root));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                });
            }

            [input, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function movieCard(movie) {
        return [
            "<article class=\"movie-card\" data-search-text=\"" + escapeHtml(movie.searchText || "") + "\" data-year=\"" + escapeHtml(movie.year || "") + "\" data-type=\"" + escapeHtml(movie.type || "") + "\">",
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"movie-badge\">" + escapeHtml(movie.type || "影视") + "</span></a>",
            "<div class=\"card-body\"><h3 class=\"card-title\"><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p class=\"card-desc\">" + escapeHtml(movie.oneLine || "") + "</p>",
            "<div class=\"card-meta\"><span class=\"strong-pill\">" + escapeHtml(movie.year || "") + "</span><span>" + escapeHtml(movie.region || "") + "</span></div></div>",
            "</article>"
        ].join("");
    }

    function initSearchPage() {
        var results = qs("#search-results");
        if (!results || !window.SITE_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = qs("#search-page-input");
        var title = qs("#search-page-title");

        if (input) {
            input.value = query;
        }
        if (title) {
            title.textContent = query ? "搜索：" + query : "站内搜索";
        }

        var lower = query.toLowerCase();
        var movies = window.SITE_MOVIES;
        var matched = lower
            ? movies.filter(function (movie) {
                return String(movie.searchText || "").toLowerCase().indexOf(lower) !== -1;
            })
            : movies.slice(0, 96);

        matched = matched.slice(0, 180);
        if (!matched.length) {
            results.innerHTML = "<div class=\"empty-state\">暂无匹配影片，换个关键词再试。</div>";
            return;
        }
        results.innerHTML = matched.map(movieCard).join("");
    }

    function initBase() {
        initNavigation();
        initHero();
        initFilters();
        initSearchPage();
    }

    function initializePlayer(source) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var overlay = qs("[data-play-button]");
            var hlsInstance = null;
            var initialized = false;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (initialized) {
                    return;
                }
                initialized = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                attachSource();
                video.setAttribute("controls", "controls");
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        video.setAttribute("controls", "controls");
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    window.initializePlayer = initializePlayer;
    ready(initBase);
})();
