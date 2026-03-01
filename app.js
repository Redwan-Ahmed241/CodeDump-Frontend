/**
 * CS Thinking Library — Home Page Logic
 * Handles: search, filters, pagination, and problem listing
 */
(function () {
    'use strict';

    const API = CONFIG.API_BASE_URL;
    const LIMIT = CONFIG.PROBLEMS_PER_PAGE;

    // ── DOM Elements ─────────────────────────────────
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterDifficulty = document.getElementById('filter-difficulty');
    const filterTag = document.getElementById('filter-tag');
    const filterReset = document.getElementById('filter-reset');
    const problemList = document.getElementById('problem-list');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const paginationInfo = document.getElementById('pagination-info');
    const statTotal = document.getElementById('stat-total');
    const statTags = document.getElementById('stat-tags');

    let currentPage = 1;
    let debounceTimer = null;

    // ── Initialization ───────────────────────────────
    init();

    async function init() {
        loadTags();
        loadProblems();
        bindEvents();
    }

    // ── Event Bindings ───────────────────────────────
    function bindEvents() {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentPage = 1;
                loadProblems();
            }, 350);
        });

        filterCategory.addEventListener('change', () => { currentPage = 1; loadProblems(); });
        filterDifficulty.addEventListener('change', () => { currentPage = 1; loadProblems(); });
        filterTag.addEventListener('change', () => { currentPage = 1; loadProblems(); });

        filterReset.addEventListener('click', () => {
            searchInput.value = '';
            filterCategory.value = '';
            filterDifficulty.value = '';
            filterTag.value = '';
            currentPage = 1;
            loadProblems();
        });

        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; loadProblems(); }
        });

        nextPageBtn.addEventListener('click', () => {
            currentPage++;
            loadProblems();
        });
    }

    // ── Load Tags ────────────────────────────────────
    async function loadTags() {
        try {
            const res = await fetch(`${API}/problems/tags`);
            const json = await res.json();
            if (json.success && json.data) {
                statTags.textContent = json.data.length;
                json.data.forEach(tag => {
                    const opt = document.createElement('option');
                    opt.value = tag;
                    opt.textContent = tag;
                    filterTag.appendChild(opt);
                });
            }
        } catch (err) {
            console.warn('Could not load tags:', err);
        }
    }

    // ── Load Problems ────────────────────────────────
    async function loadProblems() {
        show(loadingState);
        hide(emptyState);
        hide(pagination);
        problemList.innerHTML = '';

        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', LIMIT);

        const search = searchInput.value.trim();
        if (search) params.set('search', search);
        if (filterCategory.value) params.set('category', filterCategory.value);
        if (filterDifficulty.value) params.set('difficulty', filterDifficulty.value);
        if (filterTag.value) params.set('tag', filterTag.value);

        try {
            const res = await fetch(`${API}/problems?${params.toString()}`);
            const json = await res.json();

            hide(loadingState);

            if (!json.success) {
                showEmpty(); return;
            }

            statTotal.textContent = json.total_count || 0;

            if (!json.data || json.data.length === 0) {
                showEmpty(); return;
            }

            renderProblems(json.data);
            renderPagination(json.current_page, json.total_pages);
        } catch (err) {
            hide(loadingState);
            console.error('Failed to load problems:', err);
            showEmpty();
        }
    }

    // ── Render Problem Cards ─────────────────────────
    function renderProblems(problems) {
        problemList.innerHTML = '';

        problems.forEach((p, i) => {
            const card = document.createElement('a');
            card.href = `problem.html?slug=${encodeURIComponent(p.slug)}`;
            card.className = 'problem-card';
            card.id = `problem-card-${p.id}`;

            const tagsHTML = (p.tags || [])
                .slice(0, 4)
                .map(t => `<span class="tag">${escapeHTML(t)}</span>`)
                .join('');

            card.innerHTML = `
        <span class="problem-card__number">${String(i + 1 + (currentPage - 1) * LIMIT).padStart(2, '0')}</span>
        <div class="problem-card__body">
          <div class="problem-card__title">${escapeHTML(p.title)}</div>
          <div class="problem-card__tags">${tagsHTML}</div>
        </div>
        <div class="problem-card__meta">
          <span class="badge badge--category" data-cat="${escapeHTML(p.category)}">${escapeHTML(p.category)}</span>
          <span class="badge badge--difficulty" data-diff="${escapeHTML(p.difficulty)}">${escapeHTML(p.difficulty)}</span>
        </div>
      `;

            problemList.appendChild(card);
        });
    }

    // ── Render Pagination ────────────────────────────
    function renderPagination(page, totalPages) {
        if (totalPages <= 1) { hide(pagination); return; }

        show(pagination);
        paginationInfo.textContent = `Page ${page} of ${totalPages}`;
        prevPageBtn.disabled = page <= 1;
        nextPageBtn.disabled = page >= totalPages;
    }

    // ── Helpers ──────────────────────────────────────
    function show(el) { el.style.display = ''; }
    function hide(el) { el.style.display = 'none'; }
    function showEmpty() { show(emptyState); hide(pagination); }

    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
})();
