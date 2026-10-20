/* ==========================================================================
   The CRPG Codex — catalogue logic
   No accounts, no progress tracking. Just the shelf and a way to the store.
   ========================================================================== */

(() => {
  'use strict';

  const games = Array.isArray(window.CRPG_GAMES) ? window.CRPG_GAMES : [];
  const storeData = window.CRPG_STORES && typeof window.CRPG_STORES === 'object' ? window.CRPG_STORES : {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));

  const pad = (value) => String(value).padStart(3, '0');

  const hashString = (value) => {
    let hash = 0;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash * 31 + text.charCodeAt(index)) | 0;
    }
    return Math.abs(hash);
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     Platform families
     ------------------------------------------------------------------------ */

  const platformFamilies = [
    { id: 'windows', label: 'Windows', short: 'PC', platforms: ['Windows', 'MS-DOS'] },
    { id: 'macos', label: 'macOS', short: 'Mac', platforms: ['macOS'] },
    { id: 'linux', label: 'Linux', short: 'Linux', platforms: ['Linux'] },
    { id: 'playstation', label: 'PlayStation', short: 'PlayStation', platforms: ['PlayStation 3', 'PlayStation 4', 'PlayStation 5'] },
    { id: 'xbox', label: 'Xbox', short: 'Xbox', platforms: ['Xbox', 'Xbox 360', 'Xbox One', 'Xbox Series'] },
    { id: 'switch', label: 'Switch', short: 'Switch', platforms: ['Nintendo Switch'] },
    { id: 'mobile', label: 'Mobile', short: 'Mobile', platforms: ['iOS', 'iPadOS', 'Android', 'Windows Mobile', 'Palm OS'] },
  ];

  const shortPlatformNames = {
    Windows: 'PC',
    macOS: 'Mac',
    Linux: 'Linux',
    'MS-DOS': 'DOS',
    'PlayStation 5': 'PS5',
    'PlayStation 4': 'PS4',
    'PlayStation 3': 'PS3',
    'Xbox Series': 'Xbox Series',
    'Xbox One': 'Xbox One',
    'Xbox 360': 'Xbox 360',
    Xbox: 'Xbox',
    'Nintendo Switch': 'Switch',
    iOS: 'iOS',
    iPadOS: 'iPadOS',
    Android: 'Android',
    'Windows Mobile': 'Win Mobile',
    'Palm OS': 'Palm OS',
  };

  const familyByPlatform = new Map();
  platformFamilies.forEach((family) => {
    family.platforms.forEach((platform) => familyByPlatform.set(platform, family));
  });

  const collectionPattern = /(Collection|Complete|Saga|Trilogy|Pack|Archives|Series|1\+2|1\+2\+3|4\+5\+6|Underworld 1\+2)/i;

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  function normalizeStore(store) {
    if (!store || typeof store.url !== 'string' || typeof store.name !== 'string') return null;
    if (!/^https?:\/\//i.test(store.url)) return null;
    return { name: store.name, url: store.url };
  }

  const catalogue = games.map((game, order) => {
    const families = platformFamilies.filter((family) => game.platforms.some((platform) => family.platforms.includes(platform)));
    const isCollection = collectionPattern.test(game.title);
    const searchText = [
      game.title,
      game.year,
      game.released,
      game.platforms.join(' '),
      families.map((family) => family.label).join(' '),
      families.map((family) => family.short).join(' '),
      game.note || '',
      isCollection ? 'collection omnibus' : '',
    ].join(' ').toLowerCase();

    return {
      ...game,
      order,
      families,
      isCollection,
      searchText,
      store: normalizeStore(storeData[game.id]),
      date: new Date(`${game.released}T00:00:00Z`),
    };
  });

  const totalGames = catalogue.length;
  const uniquePlatformCount = new Set(catalogue.flatMap((game) => game.platforms)).size;
  const yearValues = catalogue.map((game) => game.year);
  const oldestYear = Math.min(...yearValues);
  const newestYear = Math.max(...yearValues);

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */

  const storage = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        /* The shelf works without memory. */
      }
    },
  };

  const state = {
    query: '',
    platform: 'all',
    era: 'all',
    sort: 'title',
    view: storage.get('crpg-codex-view', 'grid') === 'list' ? 'list' : 'grid',
  };

  const dom = {
    header: $('#site-header'),
    themeToggle: $('#theme-toggle'),
    platformTabs: $('#platform-tabs'),
    resultCount: $('#result-count'),
    searchInput: $('#search-input'),
    eraFilter: $('#era-filter'),
    sortSelect: $('#sort-select'),
    viewGrid: $('#view-grid'),
    viewList: $('#view-list'),
    filterSummary: $('#filter-summary'),
    activeFilters: $('#active-filters'),
    clearFilters: $('#clear-filters'),
    gameGrid: $('#game-grid'),
    emptyState: $('#empty-state'),
    emptyReset: $('#empty-reset'),
    decadeChart: $('#decade-chart'),
    platformChart: $('#platform-chart'),
    landmarks: $('#landmarks'),
    featured: $('#featured'),
    featuredCover: $('#featured-cover'),
    featuredGlow: $('#featured-glow'),
    featuredFallback: $('#featured-fallback'),
    featuredNumber: $('#featured-number'),
    featuredTitle: $('#featured-title'),
    featuredMeta: $('#featured-meta'),
    gameDialog: $('#game-dialog'),
    gameDialogContent: $('#game-dialog-content'),
    gameDialogClose: $('#game-dialog-close'),
    rollDialog: $('#roll-dialog'),
    rollDialogClose: $('#roll-dialog-close'),
    rollStage: $('#roll-stage'),
    rollResult: $('#roll-result'),
    rollOpen: $('#roll-open'),
    rollAgain: $('#roll-again'),
    rollNote: $('#roll-note'),
    toast: $('#toast'),
    footerYear: $('#footer-year'),
    navLinks: $$('.primary-nav a'),
    rollTriggers: $$('[data-roll]'),
  };

  /* ------------------------------------------------------------------------
     Small renderers
     ------------------------------------------------------------------------ */

  function coverSource(game) {
    return `assets/covers/${game.id}.jpg`;
  }

  function platformList(game) {
    return game.platforms.map((platform) => shortPlatformNames[platform] || platform).join(' · ');
  }

  function truncatePlatforms(game, maximum = 3) {
    const labels = game.platforms.map((platform) => shortPlatformNames[platform] || platform);
    if (labels.length <= maximum) return labels.join(' · ');
    return `${labels.slice(0, maximum).join(' · ')} +${labels.length - maximum}`;
  }

  function fallbackMarkup(game, extraClass = '') {
    const hue = hashString(game.title) % 360;
    const initials = game.title
      .replace(/[^A-Za-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');

    return `<span class="cover-fallback ${extraClass}" style="--fallback-hue: ${hue}" aria-hidden="true">
      <span class="fallback-mark">${escapeHTML(initials || 'C')}</span>
      <span class="fallback-title">${escapeHTML(game.title)}</span>
    </span>`;
  }

  function coverImage(game, className, options = {}) {
    const { loading = 'lazy', alt = '', sizes = '' } = options;
    const sizeAttribute = sizes ? ` sizes="${escapeHTML(sizes)}"` : '';
    return `<img class="${className}" src="${coverSource(game)}" alt="${escapeHTML(alt)}" loading="${loading}" decoding="async"${sizeAttribute} onerror="this.style.display='none'">`;
  }

  function renderStats() {
    const years = newestYear - oldestYear + 1;
    $$('[data-stat="games"]').forEach((node) => { node.textContent = totalGames; });
    $$('[data-stat="years"]').forEach((node) => { node.textContent = years; });
    $$('[data-stat="platforms"]').forEach((node) => { node.textContent = uniquePlatformCount; });
    $$('[data-stat="families"]').forEach((node) => { node.textContent = platformFamilies.length; });
    $$('[data-colophon="games"]').forEach((node) => { node.textContent = totalGames; });
    $$('[data-colophon="platforms"]').forEach((node) => { node.textContent = uniquePlatformCount; });
    $$('[data-colophon="families"]').forEach((node) => { node.textContent = platformFamilies.length; });
    $$('[data-colophon="span"]').forEach((node) => { node.textContent = `${oldestYear}—${newestYear}`; });
  }

  function renderPlatformTabs() {
    const allCount = totalGames;
    const items = [{ id: 'all', label: 'All platforms', count: allCount }, ...platformFamilies.map((family) => ({
      id: family.id,
      label: family.label,
      count: catalogue.filter((game) => game.families.some((gameFamily) => gameFamily.id === family.id)).length,
    }))];

    dom.platformTabs.innerHTML = items.map((item) => `
      <button class="platform-tab" type="button" data-platform="${item.id}" aria-pressed="${state.platform === item.id}">
        ${escapeHTML(item.label)}
        <span class="tab-count">${item.count}</span>
      </button>
    `).join('');
  }

  /* ------------------------------------------------------------------------
     Filtering
     ------------------------------------------------------------------------ */

  function getFilteredGames() {
    const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);

    const filtered = catalogue.filter((game) => {
      if (state.platform !== 'all' && !game.families.some((family) => family.id === state.platform)) {
        return false;
      }

      if (state.era !== 'all' && String(Math.floor(game.year / 10) * 10) !== state.era) {
        return false;
      }

      if (terms.length && !terms.every((term) => game.searchText.includes(term))) {
        return false;
      }

      return true;
    });

    const byTitle = (a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });

    switch (state.sort) {
      case 'title-desc':
        filtered.sort((a, b) => byTitle(b, a));
        break;
      case 'newest':
        filtered.sort((a, b) => b.date - a.date || byTitle(a, b));
        break;
      case 'oldest':
        filtered.sort((a, b) => a.date - b.date || byTitle(a, b));
        break;
      default:
        filtered.sort(byTitle);
    }

    return filtered;
  }

  function hasActiveFilters() {
    return Boolean(state.query) || state.platform !== 'all' || state.era !== 'all';
  }

  function eraLabel(era) {
    return era === 'all' ? '' : `${era}s`;
  }

  function filterChip(label, action) {
    return `<button class="filter-chip" type="button" data-clear="${action}">
      ${escapeHTML(label)}
      <svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>
    </button>`;
  }

  function renderFilterLine(shownCount) {
    dom.resultCount.textContent = shownCount;
    dom.filterSummary.textContent = shownCount === totalGames
      ? `Showing all ${totalGames} volumes`
      : `Showing ${shownCount} of ${totalGames} volumes`;

    const chips = [];
    if (state.query) chips.push(filterChip(`Search: ${state.query}`, 'query'));
    if (state.platform !== 'all') {
      const family = platformFamilies.find((entry) => entry.id === state.platform);
      if (family) chips.push(filterChip(family.label, 'platform'));
    }
    if (state.era !== 'all') chips.push(filterChip(eraLabel(state.era), 'era'));

    dom.activeFilters.innerHTML = chips.join('');
    dom.clearFilters.hidden = !hasActiveFilters();
  }

  /* ------------------------------------------------------------------------
     Library
     ------------------------------------------------------------------------ */

  function cardMarkup(game) {
    const title = escapeHTML(game.title);
    const fullPlatforms = escapeHTML(game.platforms.join(', '));

    return `
      <article class="game-card" data-id="${escapeHTML(game.id)}">
        <a class="game-card-link" href="#game/${escapeHTML(game.id)}" data-game-id="${escapeHTML(game.id)}" aria-label="Open ${title}">
          <figure class="card-cover cover-frame">
            ${fallbackMarkup(game)}
            ${coverImage(game, 'card-cover-image')}
            <span class="card-year">${game.year}</span>
            ${game.isCollection ? '<span class="collection-badge">Collection</span>' : ''}
            <span class="card-open" aria-hidden="true"><svg class="icon"><use href="#icon-arrow-up-right"></use></svg></span>
          </figure>
          <div class="card-body">
            <div class="card-title-row">
              <h3 class="card-title">${title}</h3>
              ${game.note ? '<span class="card-note" title="Has a catalogue note"><svg class="icon" aria-hidden="true"><use href="#icon-note"></use></svg></span>' : ''}
            </div>
            <p class="card-platforms" title="${fullPlatforms}">${escapeHTML(truncatePlatforms(game))}</p>
          </div>
          <span class="card-end" aria-hidden="true">${game.year}<svg class="icon"><use href="#icon-chevron-right"></use></svg></span>
        </a>
      </article>
    `;
  }

  function renderLibrary() {
    const filtered = getFilteredGames();
    dom.gameGrid.innerHTML = filtered.map(cardMarkup).join('');
    dom.gameGrid.hidden = filtered.length === 0;
    dom.emptyState.hidden = filtered.length !== 0;
    renderFilterLine(filtered.length);
  }

  /* ------------------------------------------------------------------------
     The Index
     ------------------------------------------------------------------------ */

  function renderCharts() {
    const decades = ['1980', '1990', '2000', '2010', '2020'];
    const decadeCounts = decades.map((decade) => ({
      decade,
      count: catalogue.filter((game) => Math.floor(game.year / 10) * 10 === Number(decade)).length,
    }));
    const decadeMax = Math.max(...decadeCounts.map((entry) => entry.count), 1);

    dom.decadeChart.innerHTML = `
      <div class="bar-chart decade-chart-content">
        ${decadeCounts.map((entry) => {
          const active = state.era === entry.decade;
          const width = Math.max(3, Math.round((entry.count / decadeMax) * 100));
          return `
            <button class="bar-row${active ? ' is-active' : ''}" type="button" data-era="${entry.decade}" aria-pressed="${active}" aria-label="${entry.decade}s: ${entry.count} games">
              <span class="bar-label">${entry.decade}s</span>
              <span class="bar-track"><span class="bar-fill" style="--bar-width: ${width}%"></span></span>
              <span class="bar-count">${entry.count}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;

    const platformCounts = platformFamilies.map((family) => ({
      family,
      count: catalogue.filter((game) => game.families.some((gameFamily) => gameFamily.id === family.id)).length,
    }));
    const platformMax = Math.max(...platformCounts.map((entry) => entry.count), 1);

    dom.platformChart.innerHTML = `
      <div class="bar-chart platform-chart-content">
        ${platformCounts.map((entry) => {
          const active = state.platform === entry.family.id;
          const width = Math.max(3, Math.round((entry.count / platformMax) * 100));
          return `
            <button class="bar-row${active ? ' is-active' : ''}" type="button" data-platform-chart="${entry.family.id}" aria-pressed="${active}" aria-label="${entry.family.label}: ${entry.count} games">
              <span class="bar-label">${escapeHTML(entry.family.label)}</span>
              <span class="bar-track"><span class="bar-fill" style="--bar-width: ${width}%"></span></span>
              <span class="bar-count">${entry.count}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function landmarkMarkup(kicker, game, meta) {
    return `
      <a class="landmark" href="#game/${escapeHTML(game.id)}" data-game-id="${escapeHTML(game.id)}" aria-label="${escapeHTML(kicker)}: ${escapeHTML(game.title)}">
        <span class="landmark-cover cover-frame">
          ${fallbackMarkup(game)}
          ${coverImage(game, '', { sizes: '62px' })}
        </span>
        <span class="landmark-body">
          <span class="landmark-kicker">${escapeHTML(kicker)}</span>
          <span class="landmark-title">${escapeHTML(game.title)}</span>
          <span class="landmark-meta">${escapeHTML(meta)}</span>
        </span>
        <span class="landmark-arrow" aria-hidden="true"><svg class="icon"><use href="#icon-arrow-up-right"></use></svg></span>
      </a>
    `;
  }

  function renderLandmarks() {
    if (!catalogue.length) {
      dom.landmarks.innerHTML = '';
      return;
    }

    const oldest = [...catalogue]
      .filter((game) => !game.isCollection)
      .sort((a, b) => a.date - b.date || a.title.localeCompare(b.title))[0] || catalogue[0];

    const newest = [...catalogue]
      .sort((a, b) => b.date - a.date || a.title.localeCompare(b.title))[0];

    const mostPlatforms = [...catalogue]
      .sort((a, b) => b.platforms.length - a.platforms.length || a.title.localeCompare(b.title))[0];

    dom.landmarks.innerHTML = [
      landmarkMarkup('Oldest volume', oldest, `${oldest.year} · ${truncatePlatforms(oldest, 4)}`),
      landmarkMarkup('Latest arrival', newest, `${newest.year} · ${truncatePlatforms(newest, 4)}`),
      landmarkMarkup('Most travelled', mostPlatforms, `${mostPlatforms.platforms.length} platforms · ${mostPlatforms.year}`),
    ].join('');
  }

  function renderFeatured() {
    if (!catalogue.length) return;

    const dayNumber = Math.floor(Date.now() / 86400000);
    const game = catalogue[dayNumber % catalogue.length];
    const source = coverSource(game);

    dom.featured.href = `#game/${game.id}`;
    dom.featured.dataset.gameId = game.id;
    dom.featured.setAttribute('aria-label', `Open the cover of the day: ${game.title}`);
    dom.featuredCover.src = source;
    dom.featuredCover.alt = `Cover art for ${game.title}`;
    dom.featuredGlow.src = source;
    dom.featuredNumber.textContent = `No. ${pad(game.order + 1)}`;
    dom.featuredTitle.textContent = game.title;
    dom.featuredMeta.textContent = `${game.year} · ${truncatePlatforms(game, 4)}`;

    const hue = hashString(game.title) % 360;
    const initials = game.title
      .replace(/[^A-Za-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
    dom.featuredFallback.style.setProperty('--fallback-hue', hue);
    dom.featuredFallback.innerHTML = `<span class="fallback-mark">${escapeHTML(initials || 'C')}</span><span class="fallback-title">${escapeHTML(game.title)}</span>`;
  }

  function currentGameIdFromHash() {
    const match = window.location.hash.match(/^#game\/(.+)$/);
    if (!match) return null;
    try {
      return decodeURIComponent(match[1]);
    } catch (error) {
      return match[1];
    }
  }

  function syncDialogBodyClass() {
    const anyOpen = Boolean(document.querySelector('dialog[open]'));
    document.body.classList.toggle('dialog-open', anyOpen);
  }

  function scrollToLibrary() {
    const library = $('#library');
    if (!library) return;
    library.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function storeButtonMarkup(game) {
    if (!game.store) return '';
    const label = `View on ${game.store.name}`;
    return `<a class="button button--outline detail-store" href="${escapeHTML(game.store.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(`${label}: ${game.title} (opens in a new tab)`)}">
      <svg class="icon" aria-hidden="true"><use href="#icon-external"></use></svg>
      <span>${escapeHTML(label)}</span>
    </a>`;
  }

  function openGame(gameId) {
    const game = catalogue.find((entry) => entry.id === gameId);
    if (!game || !dom.gameDialog) return;

    const hue = hashString(game.title) % 360;
    const platformChips = game.platforms.map((platform) => {
      const family = familyByPlatform.get(platform);
      if (!family) return `<span class="platform-chip">${escapeHTML(platform)}</span>`;
      return `<button class="platform-chip" type="button" data-platform-filter="${family.id}" title="Show ${escapeHTML(family.label)} games">${escapeHTML(platform)}</button>`;
    }).join('');

    const note = game.note
      ? `<div class="detail-note">
           <svg class="icon" aria-hidden="true"><use href="#icon-note"></use></svg>
           <p>${escapeHTML(game.note)}</p>
         </div>`
      : '';

    dom.gameDialogContent.innerHTML = `
      <div class="detail-art">
        <div class="detail-art-bg" style="background-image: url('${coverSource(game)}')" aria-hidden="true"></div>
        <figure class="detail-cover cover-frame">
          ${fallbackMarkup(game)}
          ${coverImage(game, '', { loading: 'eager', alt: `Cover art for ${game.title}` })}
        </figure>
        <p class="detail-volume">Volume ${pad(game.order + 1)} / ${pad(totalGames)}</p>
      </div>
      <div class="detail-body">
        <p class="eyebrow">
          <svg class="icon" aria-hidden="true"><use href="#icon-book"></use></svg>
          Codex entry · ${game.year}
        </p>
        <h2 class="detail-title" id="game-dialog-title">${escapeHTML(game.title)}</h2>
        <dl class="detail-facts">
          <div class="detail-fact">
            <dt>Released</dt>
            <dd>${escapeHTML(dateFormatter.format(game.date))}</dd>
          </div>
          <div class="detail-fact">
            <dt>Platforms</dt>
            <dd>${game.platforms.length} editions</dd>
          </div>
          <div class="detail-fact">
            <dt>Families</dt>
            <dd>${escapeHTML(game.families.map((family) => family.label).join(' · '))}</dd>
          </div>
        </dl>
        <div class="detail-platforms">
          <span class="detail-label">Platforms</span>
          <div class="platform-chips">${platformChips}</div>
        </div>
        ${game.store ? `<div class="detail-store">${storeButtonMarkup(game)}</div>` : ''}
        ${note}
        <div class="detail-footer">
          <button class="button button--primary" type="button" data-detail-roll>
            <svg class="icon" aria-hidden="true"><use href="#icon-dice"></use></svg>
            <span>Roll the dice</span>
          </button>
          <button class="button button--ghost" type="button" data-close-dialog>Back to the shelf</button>
        </div>
      </div>
    `;

    dom.gameDialogContent.scrollTop = 0;
    const detailBody = $('.detail-body', dom.gameDialogContent);
    if (detailBody) detailBody.scrollTop = 0;
    if (!dom.gameDialog.open) dom.gameDialog.showModal();
    dom.gameDialog.dataset.currentGame = game.id;
    syncDialogBodyClass();
  }

  function syncFromHash() {
    const gameId = currentGameIdFromHash();
    if (gameId) {
      openGame(gameId);
    } else if (dom.gameDialog && dom.gameDialog.open) {
      dom.gameDialog.close();
    }
  }

  /* ------------------------------------------------------------------------
     Roll the dice
     ------------------------------------------------------------------------ */

  let rollTimer = null;
  let currentRoll = null;

  function rollPool() {
    const filtered = getFilteredGames();
    return filtered.length ? filtered : [];
  }

  function renderRollResult(game) {
    const hue = hashString(game.title) % 360;
    const initials = game.title
      .replace(/[^A-Za-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');

    dom.rollResult.innerHTML = `
      <div class="roll-card">
        <span class="roll-cover">
          ${fallbackMarkup(game)}
          ${coverImage(game, '', { loading: 'eager', alt: '' })}
        </span>
        <span class="roll-body">
          <span class="roll-kicker">Volume ${pad(game.order + 1)} / ${pad(totalGames)}</span>
          <span class="roll-title">${escapeHTML(game.title)}</span>
          <span class="roll-meta">${game.year} · ${escapeHTML(truncatePlatforms(game, 3))}</span>
        </span>
      </div>
    `;
  }

  function rollTheDice() {
    if (!dom.rollDialog.open) return;
    const pool = rollPool();
    if (!pool.length) {
      dom.rollDialog.close();
      showToast('No volumes match the current filters.');
      return;
    }

    window.clearTimeout(rollTimer);
    dom.rollStage.classList.add('is-rolling');
    dom.rollResult.hidden = true;
    dom.rollOpen.disabled = true;
    dom.rollNote.textContent = hasActiveFilters()
      ? `One volume from the current ${pool.length}.`
      : `One volume from all ${pool.length}, chosen without judgement.`;

    rollTimer = window.setTimeout(() => {
      if (!dom.rollDialog.open) return;
      const game = pool[Math.floor(Math.random() * pool.length)];
      currentRoll = game;
      renderRollResult(game);
      dom.rollStage.classList.remove('is-rolling');
      dom.rollResult.hidden = false;
      dom.rollOpen.disabled = false;
    }, prefersReducedMotion ? 30 : 760);
  }

  function openRoll() {
    if (!catalogue.length) {
      showToast('The shelf is still being arranged.');
      return;
    }

    if (!dom.rollDialog.open) {
      dom.rollDialog.showModal();
    }
    syncDialogBodyClass();
    rollTheDice();
  }

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */

  let toastTimer = null;

  function showToast(message) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      dom.toast.classList.remove('is-visible');
    }, 3200);
  }

  /* ------------------------------------------------------------------------
     Filters and view
     ------------------------------------------------------------------------ */

  function refreshChrome() {
    renderPlatformTabs();
    renderCharts();
    renderLibrary();
  }

  function setPlatform(platform) {
    state.platform = platform === 'all' || platformFamilies.some((family) => family.id === platform) ? platform : 'all';
    refreshChrome();
  }

  function setEra(era) {
    state.era = ['1980', '1990', '2000', '2010', '2020'].includes(era) ? era : 'all';
    if (dom.eraFilter) dom.eraFilter.value = state.era;
    renderCharts();
    renderLibrary();
  }

  function resetFilter(kind) {
    if (kind === 'query') {
      state.query = '';
      if (dom.searchInput) dom.searchInput.value = '';
    } else if (kind === 'platform') {
      state.platform = 'all';
    } else if (kind === 'era') {
      state.era = 'all';
      if (dom.eraFilter) dom.eraFilter.value = 'all';
    } else {
      state.query = '';
      state.platform = 'all';
      state.era = 'all';
      if (dom.searchInput) dom.searchInput.value = '';
      if (dom.eraFilter) dom.eraFilter.value = 'all';
    }
    refreshChrome();
  }

  function applyView(view) {
    state.view = view === 'list' ? 'list' : 'grid';
    dom.gameGrid.classList.toggle('is-list', state.view === 'list');
    dom.viewGrid.setAttribute('aria-pressed', String(state.view === 'grid'));
    dom.viewList.setAttribute('aria-pressed', String(state.view === 'list'));
    storage.set('crpg-codex-view', state.view);
  }

  /* ------------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------------ */

  function applyTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    const next = nextTheme === 'dark' ? 'light' : 'dark';
    dom.themeToggle.setAttribute('aria-label', `Switch to ${next} mode`);
    dom.themeToggle.title = `Switch to ${next} mode`;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = nextTheme === 'dark' ? '#12110e' : '#f1eadc';
    storage.set('crpg-codex-theme', nextTheme);
  }

  /* ------------------------------------------------------------------------
     Navigation and reveal
     ------------------------------------------------------------------------ */

  function initHeader() {
    let ticking = false;
    const updateHeader = () => {
      dom.header.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    };

    updateHeader();
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    }, { passive: true });
  }

  function initNavObserver() {
    const sections = ['library', 'index', 'about']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const linkById = new Map(dom.navLinks.map((link) => [link.dataset.nav, link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        linkById.forEach((link) => link.classList.remove('is-active'));
        const link = linkById.get(entry.target.id);
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }

  function initReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    elements.forEach((element) => observer.observe(element));
  }

  /* ------------------------------------------------------------------------
     Events
     ------------------------------------------------------------------------ */

  function initEvents() {
    let searchTimer = null;

    dom.searchInput.addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        state.query = dom.searchInput.value.trim();
        renderLibrary();
      }, 90);
    });

    dom.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && dom.searchInput.value) {
        event.preventDefault();
        dom.searchInput.value = '';
        state.query = '';
        renderLibrary();
      }
    });

    dom.platformTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-platform]');
      if (!button) return;
      setPlatform(button.dataset.platform);
    });

    dom.eraFilter.addEventListener('change', () => {
      setEra(dom.eraFilter.value);
    });

    dom.sortSelect.addEventListener('change', () => {
      state.sort = dom.sortSelect.value;
      renderLibrary();
    });

    dom.viewGrid.addEventListener('click', () => applyView('grid'));
    dom.viewList.addEventListener('click', () => applyView('list'));

    dom.activeFilters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-clear]');
      if (!button) return;
      resetFilter(button.dataset.clear);
    });

    dom.clearFilters.addEventListener('click', () => resetFilter('all'));
    dom.emptyReset.addEventListener('click', () => resetFilter('all'));

    dom.decadeChart.addEventListener('click', (event) => {
      const button = event.target.closest('[data-era]');
      if (!button) return;
      setEra(state.era === button.dataset.era ? 'all' : button.dataset.era);
      scrollToLibrary();
    });

    dom.platformChart.addEventListener('click', (event) => {
      const button = event.target.closest('[data-platform-chart]');
      if (!button) return;
      setPlatform(state.platform === button.dataset.platformChart ? 'all' : button.dataset.platformChart);
      scrollToLibrary();
    });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-game-id]');
      if (!link) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const gameId = link.dataset.gameId;
      if (gameId) {
        window.location.hash = `game/${gameId}`;
      }
    });

    dom.gameDialogClose.addEventListener('click', () => dom.gameDialog.close());
    dom.rollDialogClose.addEventListener('click', () => dom.rollDialog.close());

    [dom.gameDialog, dom.rollDialog].forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
      dialog.addEventListener('close', () => {
        syncDialogBodyClass();
        if (dialog === dom.rollDialog) window.clearTimeout(rollTimer);
      });
    });

    dom.gameDialog.addEventListener('close', () => {
      if (window.location.hash.startsWith('#game/')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });

    dom.gameDialogContent.addEventListener('click', (event) => {
      const filterButton = event.target.closest('[data-platform-filter]');
      if (filterButton) {
        const family = filterButton.dataset.platformFilter;
        dom.gameDialog.close();
        setPlatform(family);
        scrollToLibrary();
        return;
      }

      if (event.target.closest('[data-close-dialog]')) {
        dom.gameDialog.close();
        return;
      }

      if (event.target.closest('[data-detail-roll]')) {
        dom.gameDialog.close();
        openRoll();
      }
    });

    dom.rollAgain.addEventListener('click', rollTheDice);

    dom.rollOpen.addEventListener('click', () => {
      if (!currentRoll) return;
      const gameId = currentRoll.id;
      dom.rollDialog.close();
      window.location.hash = `game/${gameId}`;
    });

    dom.rollTriggers.forEach((trigger) => {
      trigger.addEventListener('click', openRoll);
    });

    dom.themeToggle.addEventListener('click', () => {
      applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
    });

    document.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const typing = target instanceof HTMLElement && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
      if (event.key === '/' && !typing && !document.querySelector('dialog[open]')) {
        event.preventDefault();
        dom.searchInput.focus();
        dom.searchInput.select();
      }
    });

    window.addEventListener('hashchange', syncFromHash);
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */

  function init() {
    if (!dom.gameGrid) return;

    dom.footerYear.textContent = new Date().getFullYear();
    dom.featuredCover.addEventListener('error', () => { dom.featuredCover.style.display = 'none'; });
    dom.featuredGlow.addEventListener('error', () => { dom.featuredGlow.style.display = 'none'; });

    applyTheme(document.documentElement.dataset.theme);
    applyView(state.view);
    renderStats();
    renderPlatformTabs();
    renderFeatured();
    renderCharts();
    renderLandmarks();
    renderLibrary();
    initHeader();
    initNavObserver();
    initReveal();
    initEvents();
    syncFromHash();
  }

  init();
})();

