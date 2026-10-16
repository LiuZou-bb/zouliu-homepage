/* Load a chapter once, before the router reveals or measures its contents. */
(function () {
    'use strict';
    var revision = '20261016-preload-replay1', files = new Map(), pending = new Map(), ready = new Set();
    var groups = {
        meet: { scripts: ['personality.js'] },
        life: { styles: ['life-chapters.css'], scripts: ['moments.js', 'life-exhibit.js'] },
        books: { styles: ['life-library.css'], scripts: ['life-library-data.js', 'life-library-media.js', 'library-notes.js', 'life-library.js'] },
        dream: { styles: ['dream-dialogue.css'], scripts: ['dream-dialogue-data.js', 'dream-dialogue.js'] }
    };
    function file(name, style) {
        var url = (style ? 'css/' : 'js/') + name + '?v=' + revision;
        if (files.has(url)) return files.get(url);
        var promise = new Promise(function (resolve, reject) {
            var element = document.createElement(style ? 'link' : 'script');
            if (style) { element.rel = 'stylesheet'; element.href = url; }
            else { element.src = url; element.async = false; }
            element.onload = function () { resolve(); };
            element.onerror = function () { files.delete(url); element.remove(); reject(new Error('Could not load ' + name)); };
            document.head.append(element);
        });
        files.set(url, promise); return promise;
    }
    function ensure(key) {
        if (!groups[key] || ready.has(key)) return Promise.resolve();
        if (pending.has(key)) return pending.get(key);
        var group = groups[key];
        var styles = Promise.all((group.styles || []).map(function (name) { return file(name, true); }));
        // async=false preserves insertion order while downloading in parallel.
        var scripts = Promise.all(group.scripts.map(function (name) { return file(name, false); }));
        var promise = Promise.all([styles, scripts]).then(function () {
            if (key === 'meet') window.PersonalityRecords.refresh();
            if (key === 'life') window.renderMoments();
            if (key === 'books') {
                if (selectedBookGroup) window.LifeLibrary.selectGroup(selectedBookGroup);
                else window.LifeLibrary.refresh();
            }
            ready.add(key); pending.delete(key);
        }).catch(function (error) { pending.delete(key); throw error; });
        pending.set(key, promise); return promise;
    }
    var selectedBookGroup = null, homePreload = null, bookPreload = null;
    function preloadHomeImages() {
        var home = document.getElementById('homeView');
        if (!home || home.hidden || document.body.dataset.activeScene !== 'home' || !window.HomeExhibit || homePreload) return;
        var avatar = home.querySelector('.avatar-img');
        homePreload = (avatar ? avatar.decode().catch(function () {}) : Promise.resolve())
            .then(function () { return window.HomeExhibit.preloadImages(); })
            .then(function () { return ensure('life'); })
            .then(function () { return window.LifeExhibit.preloadImages(); })
            .catch(function () { homePreload = null; });
    }
    function preloadBookImages() {
        if (bookPreload) return bookPreload;
        bookPreload = ensure('books').then(function () { return window.LifeLibrary.preloadPriority(); })
            .catch(function () { bookPreload = null; });
        return bookPreload;
    }
    window.SiteResources = {
        ensure: ensure,
        preloadBookImages: preloadBookImages,
        ready: function (key) { return !groups[key] || ready.has(key); },
        selectBookGroup: function (key) { selectedBookGroup = key; if (ready.has('books')) window.LifeLibrary.selectGroup(key); }
    };
    document.addEventListener('DOMContentLoaded', preloadHomeImages, { once: true });
    document.addEventListener('exhibition:route', preloadHomeImages);
    // The existing dialogue binds its own clicks once loaded; keep the first
    // activation on the directory and preserve its address and focus contract.
    var openingDream = false;
    document.addEventListener('click', function (event) {
        var trigger = event.target.closest('#dreamToggle');
        if (!trigger || ready.has('dream') || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); event.stopImmediatePropagation();
        if (openingDream) return;
        openingDream = true; trigger.setAttribute('aria-busy', 'true');
        ensure('dream').then(function () {
            if (trigger.getClientRects().length) window.DreamDialogue.open();
        }).catch(function () {
            var status = document.getElementById('sceneStatus'); if (status) status.textContent = DICT.ex_load_failed;
        }).finally(function () { openingDream = false; trigger.removeAttribute('aria-busy'); });
    }, true);
})();
