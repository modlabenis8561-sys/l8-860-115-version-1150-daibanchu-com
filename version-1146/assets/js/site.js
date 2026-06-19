(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const slider = document.querySelector('.hero-slider');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dot'));
        const prev = slider.querySelector('.hero-prev');
        const next = slider.querySelector('.hero-next');
        let current = 0;
        let timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                const active = itemIndex === current;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        setSlide(0);
        start();
    }

    const filters = Array.from(document.querySelectorAll('.page-filter'));

    filters.forEach(function (input) {
        const grid = document.querySelector('.filter-grid');
        const cards = grid ? Array.from(grid.querySelectorAll('.movie-card')) : [];

        input.addEventListener('input', function () {
            const keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const text = card.textContent.toLowerCase() + ' ' +
                    (card.getAttribute('data-title') || '').toLowerCase() + ' ' +
                    (card.getAttribute('data-region') || '').toLowerCase() + ' ' +
                    (card.getAttribute('data-genre') || '').toLowerCase();
                card.classList.toggle('is-hidden-by-filter', keyword && !text.includes(keyword));
            });
        });
    });

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchTitle = document.getElementById('searchTitle');

    if (searchInput && searchResults && Array.isArray(window.movieSearchData)) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        searchInput.value = query;

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function card(movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + escapeHtml(movie.page) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="poster-shade"></span>',
                '        <span class="score">' + escapeHtml(movie.rating) + '</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <h3><a href="' + escapeHtml(movie.page) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="movie-meta">',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '        </div>',
                '        <div class="mini-tags"><span>' + escapeHtml(movie.genre) + '</span></div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function render(keyword) {
            const normalized = keyword.trim().toLowerCase();
            if (!normalized) {
                searchTitle.textContent = '热门推荐';
                return;
            }

            const results = window.movieSearchData.filter(function (movie) {
                return [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(' ').toLowerCase().includes(normalized);
            }).slice(0, 120);

            searchTitle.textContent = '搜索结果：' + keyword + '（' + results.length + '）';
            searchResults.innerHTML = results.length ? results.map(card).join('') : '<p class="empty-result">未找到相关影片</p>';
        }

        render(query);

        searchInput.addEventListener('input', function () {
            render(searchInput.value);
        });
    }
}());
