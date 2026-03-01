/**
 * CS Thinking Library — Problem Detail Page Logic
 * Fetches and renders a single problem by slug from the URL
 */
(function () {
    'use strict';

    const API = CONFIG.API_BASE_URL;

    // ── DOM Elements ─────────────────────────────────
    const detailLoading = document.getElementById('detail-loading');
    const detailError = document.getElementById('detail-error');
    const detailContent = document.getElementById('detail-content');

    const detailTitle = document.getElementById('detail-title');
    const detailCategory = document.getElementById('detail-category');
    const detailDifficulty = document.getElementById('detail-difficulty');
    const detailLanguage = document.getElementById('detail-language');
    const detailTags = document.getElementById('detail-tags');
    const detailMeta = document.getElementById('detail-meta');

    const detailProblemStatement = document.getElementById('detail-problem-statement');
    const detailThoughtProcess = document.getElementById('detail-thought-process');
    const detailEdgeCases = document.getElementById('detail-edge-cases');
    const detailApproach = document.getElementById('detail-approach');
    const detailCode = document.getElementById('detail-code');
    const detailTimeComplexity = document.getElementById('detail-time-complexity');
    const detailSpaceComplexity = document.getElementById('detail-space-complexity');

    const githubLink = document.getElementById('github-link');
    const suggestLink = document.getElementById('suggest-link');

    // ── Init ─────────────────────────────────────────
    init();

    async function init() {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');

        if (!slug) {
            showError();
            return;
        }

        try {
            const res = await fetch(`${API}/problems/${encodeURIComponent(slug)}`);
            const json = await res.json();

            if (!json.success || !json.data) {
                showError();
                return;
            }

            render(json.data);
        } catch (err) {
            console.error('Failed to load problem:', err);
            showError();
        }
    }

    // ── Render Problem ───────────────────────────────
    function render(p) {
        // Update page title
        document.title = `${p.title} — CS Thinking Library`;
        document.querySelector('meta[name="description"]').content = p.problem_statement
            ? p.problem_statement.substring(0, 160)
            : '';

        // Header
        detailTitle.textContent = p.title;

        detailCategory.textContent = p.category;
        detailCategory.setAttribute('data-cat', p.category);

        detailDifficulty.textContent = p.difficulty;
        detailDifficulty.setAttribute('data-diff', p.difficulty);

        detailLanguage.textContent = p.language;

        // Tags
        detailTags.innerHTML = (p.tags || [])
            .map(t => `<span class="tag">${escapeHTML(t)}</span>`)
            .join('');

        // Date
        if (p.created_at) {
            const date = new Date(p.created_at);
            detailMeta.textContent = `Added on ${date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
            })}`;
        }

        // Sections
        detailProblemStatement.textContent = p.problem_statement || '';
        detailThoughtProcess.textContent = p.thought_process || '';
        detailEdgeCases.textContent = p.edge_cases || '';
        detailApproach.textContent = p.approach || '';

        // Code block (with Prism.js highlighting)
        const langMap = { 'C': 'c', 'C++': 'cpp', 'Java': 'java' };
        const prismLang = langMap[p.language] || 'c';
        detailCode.className = `language-${prismLang}`;
        detailCode.textContent = p.code || '';
        if (window.Prism) {
            Prism.highlightElement(detailCode);
        }

        // Complexity
        detailTimeComplexity.textContent = p.time_complexity || '—';
        detailSpaceComplexity.textContent = p.space_complexity || '—';

        // GitHub Links
        if (p.github_url) {
            githubLink.href = p.github_url;
            githubLink.style.display = '';

            suggestLink.href = p.github_url + '/issues/new?title=Alternative+Solution';
            suggestLink.style.display = '';
        }

        // Show content
        detailLoading.style.display = 'none';
        detailContent.style.display = '';
    }

    // ── Helpers ──────────────────────────────────────
    function showError() {
        detailLoading.style.display = 'none';
        detailError.style.display = '';
    }

    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
})();
