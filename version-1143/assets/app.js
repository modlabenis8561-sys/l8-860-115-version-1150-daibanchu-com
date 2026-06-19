function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function setupMobileNav() {
  const button = qs(".mobile-menu-button");
  const nav = qs(".mobile-nav");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    nav.hidden = expanded;
  });
}

function setupHeroCarousel() {
  const shell = qs("[data-hero-carousel]");
  if (!shell) {
    return;
  }
  const slides = qsa(".hero-slide", shell);
  const dots = qsa("[data-hero-dot]", shell);
  if (slides.length < 2) {
    return;
  }
  let index = 0;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };
  dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
  window.setInterval(() => show(index + 1), 5200);
}

function setupSearchForms() {
  qsa("form.site-search, form.search-page-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = qs("input[name='q']", form);
      const query = input ? input.value.trim() : "";
      const target = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
      window.location.href = target;
    });
  });
}

function setupLocalFilters() {
  const panel = qs("[data-filter-panel]");
  const list = qs("[data-card-list]");
  if (!panel || !list) {
    return;
  }
  const cards = qsa("[data-movie-card]", list);
  const empty = qs("[data-empty-state]");
  const searchInput = qs("[data-local-search]", panel);
  const groups = qsa(".filter-group", panel);
  const activeValues = new Map();
  groups.forEach((group, index) => {
    activeValues.set(index, "all");
    qsa("button", group).forEach((button) => {
      button.addEventListener("click", () => {
        qsa("button", group).forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        activeValues.set(index, button.dataset.filterValue || "all");
        apply();
      });
    });
  });
  const apply = () => {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let shown = 0;
    cards.forEach((card) => {
      const text = (card.dataset.search || "").toLowerCase();
      const values = Array.from(activeValues.values()).filter((value) => value !== "all");
      const matchedValue = values.every((value) => text.includes(value.toLowerCase()));
      const matchedKeyword = !keyword || text.includes(keyword);
      const visible = matchedValue && matchedKeyword;
      card.hidden = !visible;
      if (visible) {
        shown += 1;
      }
    });
    if (empty) {
      empty.hidden = shown !== 0;
    }
  };
  if (searchInput) {
    searchInput.addEventListener("input", apply);
  }
}

async function setupSearchPage() {
  const mount = qs("#search-results");
  const input = qs("#search-page-input");
  if (!mount) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  if (input) {
    input.value = query;
  }
  const module = await import("./search-index.js");
  const source = module.searchIndex || [];
  const normalized = query.toLowerCase();
  const results = normalized
    ? source.filter((movie) => movie.search.toLowerCase().includes(normalized)).slice(0, 120)
    : source.slice(0, 60);
  if (!results.length) {
    mount.classList.add("empty-state");
    mount.textContent = "没有找到匹配影片";
    return;
  }
  mount.classList.remove("empty-state");
  mount.innerHTML = results.map((movie) => `
    <article class="movie-card movie-card-compact">
      <a class="movie-cover" href="${movie.file}" aria-label="${escapeHtml(movie.title)} 在线观看">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="cover-shade"></span>
        <span class="play-chip">播放</span>
      </a>
      <div class="movie-card-body">
        <a class="movie-title" href="${movie.file}">${escapeHtml(movie.title)}</a>
        <p class="movie-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</p>
        <p class="movie-one-line">${escapeHtml(movie.oneLine)}</p>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function initMoviePlayer(options) {
  const video = document.getElementById(options.videoId);
  const overlay = document.getElementById(options.overlayId);
  if (!video || !overlay || !options.source) {
    return;
  }
  let ready = false;
  let hlsInstance = null;
  const attach = async () => {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.source;
    } else {
      const module = await import("./hls.js");
      const Hls = module.H;
      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsInstance.loadSource(options.source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = options.source;
      }
    }
  };
  const play = async () => {
    await attach();
    overlay.classList.add("is-hidden");
    try {
      await video.play();
    } catch (error) {
      overlay.classList.remove("is-hidden");
    }
  };
  overlay.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (!ready) {
      play();
    }
  });
  window.addEventListener("pagehide", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

setupMobileNav();
setupHeroCarousel();
setupSearchForms();
setupLocalFilters();
setupSearchPage();
