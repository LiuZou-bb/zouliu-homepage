/* The written half of the existing Book of Life; independent of its animation. */
(function () {
    'use strict';
    var host = document.getElementById('lifeLibrary');
    if (!host || !window.LifeLibraryData) return;
    var group = 'reading', svgNS = 'http://www.w3.org/2000/svg', filters = {};
    var search = host.querySelector('#librarySearch'), categorySelect = host.querySelector('#libraryCategory');
    var toolbar = host.querySelector('.library-toolbar'), toolbarSlot = el('div', 'library-toolbar-slot');
    var navbar = document.querySelector('.navbar'), docked = false, dockFrame = 0;
    toolbar.before(toolbarSlot); toolbarSlot.append(toolbar);
    var movieCategories = ['superhero', 'scifi', 'fantasy', 'disaster', 'horror', 'action', 'spy', 'comedy', 'drama', 'animation'];
    var animeCategories = ['japan', 'china', 'western', 'childhood', 'live', 'film'];
    function t(key) { return DICT[key] || key; }
    function localized(entry, key) { return DICT === EN && entry[key + 'En'] ? entry[key + 'En'] : entry[key]; }
    function el(tag, cls, value) { var node = document.createElement(tag); node.className = cls; if (value !== undefined) node.textContent = value; return node; }
    function duration(record) { return record.hours === null ? t('library_time_unknown') : record.hours + ' ' + t('library_hours') + (record.minutes ? ' ' + record.minutes + ' ' + t('library_minutes') : ''); }
    function hasSearch() { return group !== 'reading' && group !== 'games'; }
    function appendNote(host, entry, cls) {
        var record = window.LibraryNotes && window.LibraryNotes[entry.id];
        if (!record) return;
        var value = localized(record, 'note'), paragraph = el('p', 'library-note' + (cls ? ' ' + cls : ''), value);
        if (value.length > 160 || value.split('\n').length > 4) {
            var details = el('details', 'library-note-details');
            details.append(el('summary', '', t('library_note_expand')), paragraph); host.append(details);
        } else host.append(paragraph);
    }
    function updateDock() {
        dockFrame = 0;
        var navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
        var visible = Boolean(host.getClientRects().length), bottom = visible ? host.getBoundingClientRect().bottom : 0;
        var next = visible && toolbarSlot.getBoundingClientRect().top <= navHeight && bottom > toolbar.offsetHeight;
        docked = next;
        toolbarSlot.style.height = next ? (toolbar.querySelector('.library-groups').getBoundingClientRect().height + 19) + 'px' : '';
        toolbar.classList.toggle('is-docked', next);
        document.body.classList.toggle('library-docked', next);
        if (navbar) { navbar.inert = next; navbar.setAttribute('aria-hidden', String(next)); }
    }
    function scheduleDock() { if (!dockFrame) dockFrame = requestAnimationFrame(updateDock); }
    function state() { return filters[group] || (filters[group] = { query: '', category: '' }); }
    function categoryKey(category) { return 'library_' + (group === 'movies' ? 'movie' : 'anime') + '_' + category; }
    function normalize(value) { return String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim(); }
    function matches(entry) {
        var filter = state();
        if (filter.category && entry.category !== filter.category) return false;
        var key = entry.category ? categoryKey(entry.category) : '';
        var haystack = normalize([entry.title, entry.titleEn, entry.author, entry.authorEn, entry.artist, entry.years, entry.note, ZH[key], EN[key]].join(' '));
        return normalize(filter.query).split(' ').every(function (word) { return haystack.indexOf(word) !== -1; });
    }
    function croppedCover(entry, title) {
        var svg = document.createElementNS(svgNS, 'svg');
        svg.classList.add('library-cropped-image');
        svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', title);
        var label = document.createElementNS(svgNS, 'title'); label.textContent = title; svg.append(label);
        var image = document.createElementNS(svgNS, 'image'); image.setAttribute('href', entry.image); svg.append(image);
        function size(width, height) {
            var r = entry.crop;
            svg.setAttribute('viewBox', [r[0] * width, r[1] * height, r[2] * width, r[3] * height].join(' '));
            svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            image.setAttribute('width', width); image.setAttribute('height', height);
        }
        if (entry.imageWidth) size(entry.imageWidth, entry.imageHeight);
        else { var probe = new Image(); probe.onload = function () { size(probe.naturalWidth, probe.naturalHeight); }; probe.src = entry.image; }
        return svg;
    }
    function card(entry, index) {
        var title = localized(entry, 'title'), item = el('li', 'library-item');
        var article = el('article', 'library-entry'), cover = el('div', 'library-cover'); article.dataset.libraryId = entry.id;
        if (entry.imageWidth > entry.imageHeight * 1.5 && !entry.crop) cover.classList.add('library-cover--wide');
        if (entry.image && entry.crop) cover.append(croppedCover(entry, title));
        else if (entry.image) { var img = document.createElement('img'); img.src = entry.image; img.alt = title; img.loading = 'lazy'; img.decoding = 'async'; if (entry.imageWidth) { img.width = entry.imageWidth; img.height = entry.imageHeight; } cover.append(img); }
        else {
            cover.classList.add('library-cover--type');
            cover.append(el('small', '', group === 'games' ? t('library_game_label') : 'PSYCHOLOGY'), el('span', '', title));
            if (entry.edition) cover.append(el('small', '', t('library_edition').replace('{n}', entry.edition)));
        }
        article.append(cover, el('small', 'library-index', String(index + 1).padStart(2, '0')), el('h3', 'library-title', title));
        if (entry.author) article.append(el('p', 'library-author', localized(entry, 'author')));
        if (group === 'reading') {
            article.dataset.readingStatus = entry.finished === null ? 'unrecorded' : entry.finished ? 'finished' : 'unfinished';
            article.append(el('p', 'library-reading-status' + (entry.finished ? ' library-reading-status--finished' : ''), t(entry.finished === null ? 'library_status_unrecorded' : entry.finished ? 'library_finished' : 'library_unfinished')));
        }
        if (group === 'games') article.append(el('p', 'library-duration', duration(entry)));
        appendNote(article, entry);
        item.append(article); return item;
    }
    function textRecord(entry, index) {
        var item = el('li', 'library-item'), article = el('article', 'library-record');
        article.dataset.libraryId = entry.id;
        var content = el('div', 'library-record-content');
        content.append(el('h3', 'library-title', localized(entry, 'title')));
        if (entry.partial) content.append(el('small', 'library-partial', t('library_partial')));
        var meta = group === 'music' ? entry.artist : [entry.years, entry.category && t(categoryKey(entry.category)), entry.note].filter(Boolean).join(' · ');
        var sequence = group === 'music' ? window.LifeLibraryData.music.length - index : index + 1;
        article.append(el('small', 'library-index', String(sequence).padStart(2, '0')));
        if (entry.image) {
            article.classList.add('library-record--poster');
            var poster = document.createElement('img');
            poster.className = 'library-record-poster'; poster.src = entry.image; poster.alt = '';
            poster.loading = 'lazy'; poster.decoding = 'async'; poster.width = entry.imageWidth; poster.height = entry.imageHeight;
            article.append(poster);
        }
        article.append(content);
        if (meta) article.append(el('p', 'library-record-meta', meta));
        appendNote(content, entry);
        item.append(article); return item;
    }
    function renderFavorites(entries) {
        var section = host.querySelector('.library-favorites'), list = section.querySelector('ol');
        var favorites = window.LifeLibraryData.favorites && window.LifeLibraryData.favorites[group] || [];
        section.hidden = !favorites.length;
        var fragment = document.createDocumentFragment();
        favorites.forEach(function (favorite, index) {
            var entry = entries.find(function (record) { return record.id === favorite.entryId; });
            var item = el('li', 'library-favorite'), button = el('button', 'library-favorite-button');
            var title = localized(favorite, 'title');
            button.type = 'button'; button.dataset.favoriteEntry = favorite.entryId;
            if (favorite.query) button.dataset.favoriteQuery = favorite.query;
            button.setAttribute('aria-label', t('library_favorite_open').replace('{title}', title));
            button.append(el('span', 'library-favorite-rank', String(index + 1).padStart(2, '0')));
            if (entry && entry.image) {
                var cover = el('span', 'library-favorite-cover'), image = document.createElement('img');
                if (entry.imageWidth > entry.imageHeight * 1.5 && !entry.crop) cover.classList.add('library-favorite-cover--wide');
                if (entry.crop) cover.append(croppedCover(entry, title));
                else { image.src = entry.image; image.alt = ''; image.width = entry.imageWidth; image.height = entry.imageHeight; image.decoding = 'async'; cover.append(image); }
                button.append(cover);
            } else if (group === 'games') {
                var typeCover = el('span', 'library-favorite-cover library-favorite-cover--type');
                typeCover.append(el('small', '', t('library_game_label')), el('span', '', title)); button.append(typeCover);
            } else {
                button.classList.add('library-favorite-button--text');
            }
            button.append(el('span', 'library-favorite-title', title));
            if (entry && entry.artist) button.append(el('span', 'library-favorite-artist', entry.artist));
            item.append(button); if (entry) appendNote(item, entry, 'library-favorite-note'); fragment.append(item);
        });
        list.replaceChildren(fragment);
    }
    function renderControls(entries) {
        var filter = state(), categories = group === 'movies' ? movieCategories : group === 'anime' ? animeCategories : [];
        host.querySelector('.library-search').hidden = !hasSearch();
        host.querySelector('.library-controls').hidden = !hasSearch() && !categories.length;
        if (!hasSearch()) { filter.query = ''; filter.category = ''; }
        host.classList.toggle('library-has-categories', Boolean(categories.length));
        host.querySelector('.library-category').hidden = !categories.length;
        if (search.value !== filter.query) search.value = filter.query;
        search.placeholder = t(group === 'movies' ? 'library_search_movies' : group === 'anime' ? 'library_search_anime' : 'library_search_placeholder');
        var all = el('option', '', t('library_all_categories')); all.value = '';
        var options = document.createDocumentFragment(); options.append(all);
        categories.forEach(function (category) {
            var count = entries.filter(function (entry) { return entry.category === category; }).length;
            if (!count) return;
            var option = el('option', '', t(categoryKey(category)) + ' · ' + count); option.value = category; options.append(option);
        });
        categorySelect.replaceChildren(options); categorySelect.value = filter.category;
    }
    function render() {
        var data = window.LifeLibraryData, entries = data[group];
        var storyLink = document.getElementById('libraryStoryLink');
        if (storyLink) storyLink.hidden = group !== 'music';
        host.querySelectorAll('[data-library-group]').forEach(function (button) { var key = button.dataset.libraryGroup; button.setAttribute('aria-pressed', String(group === key)); button.textContent = t('library_' + key) + ' · ' + data[key].length; });
        var finished = data.reading.filter(function (entry) { return entry.finished; }).length;
        var unfinished = data.reading.filter(function (entry) { return entry.finished === false; }).length;
        var unrecorded = data.reading.length - finished - unfinished;
        host.querySelector('.library-context').textContent = t('library_' + group + '_note')
            .replace('{finished}', finished).replace('{unfinished}', unfinished)
            .replace('{unrecorded}', unrecorded ? ' ' + t('library_unrecorded_count').replace('{n}', unrecorded) : '')
            .replace('{total}', data.movieSummary ? data.movieSummary.confirmedCount : '')
            .replace('{n}', entries.length);
        renderFavorites(entries); renderControls(entries); renderResults(entries); scheduleDock();
    }
    function renderResults(entries) {
        entries = entries || window.LifeLibraryData[group];
        var shown = entries.filter(matches), filter = state(), active = Boolean(filter.query.trim() || filter.category);
        host.querySelector('.library-status').textContent = t(active ? 'library_result_count' : 'library_count').replace('{n}', shown.length).replace('{total}', entries.length);
        host.querySelector('.library-clear').hidden = !active;
        host.querySelector('.library-empty').hidden = Boolean(shown.length);
        var grid = host.querySelector('.library-grid'), fragment = document.createDocumentFragment(), isText = group !== 'reading' && group !== 'games';
        grid.classList.toggle('library-grid--text', isText);
        grid.classList.toggle('library-grid--posters', group === 'movies' || group === 'anime');
        shown.forEach(function (entry) { var index = entries.indexOf(entry); fragment.append(isText ? textRecord(entry, index) : card(entry, index)); }); grid.replaceChildren(fragment);
    }
    host.addEventListener('click', function (event) {
        var button = event.target.closest('button'); if (!button || !host.contains(button)) return;
        if (button.dataset.libraryGroup && button.dataset.libraryGroup !== group) {
            var wasDocked = docked; group = button.dataset.libraryGroup; render();
            if (wasDocked) window.scrollTo({ top: toolbarSlot.getBoundingClientRect().top + scrollY, behavior: 'instant' });
        }
        else if (button.hasAttribute('data-favorite-entry')) {
            if (!hasSearch()) {
                var target = host.querySelector('[data-library-id="' + button.dataset.favoriteEntry + '"]');
                if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'center', behavior: 'instant' }); }
                return;
            }
            state().query = button.dataset.favoriteQuery; state().category = ''; search.value = state().query; categorySelect.value = '';
            renderResults(); search.focus({ preventScroll: true }); search.scrollIntoView({ block: 'center', behavior: 'instant' });
        } else if (button.classList.contains('library-clear')) {
            state().query = ''; state().category = ''; search.value = ''; categorySelect.value = ''; renderResults(); search.focus({ preventScroll: true });
        }
    });
    search.addEventListener('input', function (event) { if (!event.isComposing) { state().query = search.value; renderResults(); } });
    search.addEventListener('compositionend', function () { state().query = search.value; renderResults(); });
    categorySelect.addEventListener('change', function () { state().category = categorySelect.value; renderResults(); });
    window.LifeLibrary = { refresh: render, selectGroup: function (key) {
        if (['reading','games','movies','anime','music'].indexOf(key) < 0) return;
        group = key; render();
    } };
    addEventListener('scroll', scheduleDock, { passive: true });
    addEventListener('resize', scheduleDock, { passive: true });
    document.addEventListener('exhibition:route', updateDock);
    document.addEventListener('DOMContentLoaded', render, { once: true });
})();
