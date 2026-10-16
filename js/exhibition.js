/* Native chapter navigation: URLs are fragments, so GitHub Pages needs no router. */
(function () {
    'use strict';
    var root = document.documentElement;
    var main = document.getElementById('exhibitionMain');
    var hero = document.getElementById('homeView');
    var scenes = Array.from(document.querySelectorAll('[data-scene]'));
    if (!main || !hero || scenes.length !== 6) return;
    var canonical = ['about', 'philosophy', 'skills', 'growthEdges', 'books', 'interview'];
    var sceneNames = ['meet', 'thoughts', 'life', 'limits', 'written-book', 'unwritten-book'];
    var titleKeys = ['ex_meet', 'ex_thoughts', 'nav_skills', 'nav_growth', 'book_written', 'book_unwritten'];
    var sceneFor = { about: 0, personality: 0, personalityDetail: 0, philosophy: 1,
        friend: 1, love: 1, beauty: 1, childhood: 1, sorry: 1, lifeDepth: 1, technologyWealth: 1, aiEra: 1, dream: 1, body: 2, skills: 2,
        moments: 2, growthEdges: 3, books: 4, interview: 5, contact: -1 };
    var articles = window.ThoughtEntries ? window.ThoughtEntries.readerIds : ['friend', 'love', 'childhood', 'sorry'];
    function readingId(route) {
        if (!route) return null;
        if (articles.indexOf(route.section) >= 0) return route.section;
        return route.section === 'philosophy' && window.ThoughtEntries ? window.ThoughtEntries.resolve(route.detail) : null;
    }
    var positions = new Map();
    var homeOrigins = new Map();
    var readerOrigins = new Map();
    try {
        positions = new Map(JSON.parse(sessionStorage.getItem('exhibition-positions-v4') || '[]'));
        homeOrigins = new Map(JSON.parse(sessionStorage.getItem('exhibition-home-origins-v4') || '[]'));
        readerOrigins = new Map(JSON.parse(sessionStorage.getItem('exhibition-reader-origins-v5') || '[]'));
    } catch (_) { /* A fresh tab still has valid routes. */ }
    var current = null;
    var applying = false;
    var initialized = false;
    var systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    var motionButton = document.getElementById('motionToggle');
    var manualReduced = readPreference('exhibition-motion') === 'reduced';
    var animationTimers = new Map();
    var lastDepth = null;
    var scrollFrame = 0;
    var positionTimer = 0;
    var routeRevision = 0;

    function capturePosition() {
        if (current && current.index === -1 && window.HomeExhibit) return { y:window.scrollY, home:window.HomeExhibit.capture() };
        var anchor = null;
        if (current && current.index >= 0) {
            var candidates = Array.from(scenes[current.index].querySelectorAll('[id], [data-post-id]')).filter(function(el) { return el.getClientRects().length && !el.closest('[role="dialog"]'); });
            candidates.forEach(function(el) { var r=el.getBoundingClientRect(); if(r.top<=innerHeight*.35 && r.bottom>innerHeight*.35) anchor=el; });
        }
        var progress=anchor && (innerHeight*.35-anchor.getBoundingClientRect().top)/Math.max(1,anchor.offsetHeight);
        return { y:window.scrollY, anchor:anchor && (anchor.id ? {id:anchor.id,progress:progress,viewport:.35} : {post:anchor.dataset.postId,progress:progress,viewport:.35}) };
    }
    function restorePosition(saved) {
        if (!saved) return false;
        if (typeof saved === 'number') saved = { y: saved };
        if (saved.home && window.HomeExhibit && window.HomeExhibit.restore(saved.home)) return true;
        var anchor=saved.anchor && (saved.anchor.id ? document.getElementById(saved.anchor.id) : document.querySelector('[data-post-id="'+saved.anchor.post+'"]'));
        // Old local positions used the element's top as their reference. New
        // positions preserve the same point inside a passage as lines reflow.
        var checkpoint=saved.anchor&&saved.anchor.viewport ? innerHeight*saved.anchor.viewport : 0;
        var y=anchor && anchor.getClientRects().length ? anchor.getBoundingClientRect().top+window.scrollY+saved.anchor.progress*anchor.offsetHeight-checkpoint : saved.y;
        window.scrollTo({top:Math.max(0,Number(y)||0),behavior:'instant'});return true;
    }
    function savePosition() {
        positionTimer=0;
        if(current) positions.set(current.key,capturePosition());
        try {
            sessionStorage.setItem('exhibition-positions-v4',JSON.stringify(Array.from(positions)));
            sessionStorage.setItem('exhibition-home-origins-v4',JSON.stringify(Array.from(homeOrigins)));
            // Navigation state only: no text, answers, or private material.
            sessionStorage.setItem('exhibition-reader-origins-v5',JSON.stringify(Array.from(readerOrigins).map(function(pair){var o=pair[1];return [pair[0],{route:o.route,thought:o.thought,post:o.post,test:o.test}];})));
        } catch (_) {}
    }

    function readPreference(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
    function text(key) { return typeof DICT !== 'undefined' && DICT[key] || key; }
    function reduced() { return systemMotion.matches || manualReduced; }
    function settle(element) {
        clearTimeout(animationTimers.get(element));
        animationTimers.delete(element);
        element.classList.remove('scene-arriving', 'is-entering');
    }
    function animate(element, className, token) {
        settle(element);
        if (reduced()) return;
        var raw = getComputedStyle(root).getPropertyValue(token).trim();
        var ms = parseFloat(raw) * (raw.endsWith('ms') ? 1 : 1000) || 600;
        element.classList.add(className);
        animationTimers.set(element, setTimeout(function () { settle(element); }, ms + 80));
    }
    function settleAll() { Array.from(animationTimers.keys()).forEach(settle); }
    function refreshMotion() {
        root.dataset.motion = reduced() ? 'reduced' : 'full';
        if (motionButton) {
            motionButton.setAttribute('aria-pressed', String(reduced()));
            motionButton.setAttribute('aria-label', text(reduced() ? 'ex_motion_restore' : 'ex_motion_aria'));
            motionButton.title = systemMotion.matches ? text('ex_motion_system') : '';
            var label=motionButton.querySelector('[data-i]');if(label){label.dataset.i=reduced()?'v4_motion_off':'v4_motion_on';label.textContent=text(label.dataset.i);}
        }
        if (window.ExhibitMotion) window.ExhibitMotion.refresh();
        if (reduced()) { settleAll(); resetDepth(); if(window.LifeExhibit)window.LifeExhibit.clear(); }
    }
    function resetDepth() {
        if (!lastDepth) return;
        lastDepth.style.removeProperty('--depth-x');
        lastDepth.style.removeProperty('--depth-y');
        lastDepth.style.removeProperty('--depth-rotate');
        lastDepth = null;
    }
    function parseRoute() {
        var route;
        try { route = decodeURIComponent(location.hash.slice(1)); } catch (_) { route = ''; }
        var parts = route.split('/');
        var section = parts[0];
        // Old dream links now open a window over the thought directory.
        if (section === 'dream') {
            history.replaceState(null, '', '#philosophy');
            return { key: 'philosophy', section: 'philosophy', detail: '', index: 1, openDream: true };
        }
        if (section === 'explore') return { key:'explore', section:'explore', detail:'', index:-1 };
        // Retired handbook addresses still lead to the life chapter.
        if (section === 'body') return { key:route, section:'skills', detail:'', index:2 };
        if (section === 'exhibitionMain') return { key: '', section: '', index: -1 };
        if (!(section in sceneFor)) return { key: '', section: '', index: -1 };
        return { key: route, section: section, detail: parts[1] || '', album: parts[2] === 'image' && /^\d+$/.test(parts[3]) ? Number(parts[3]) - 1 : null, index: sceneFor[section] };
    }
    function hideDialogs() {
        if (window.DreamDialogue) window.DreamDialogue.close(false);
        document.querySelectorAll('[role="dialog"].visible').forEach(function (dialog) {
            dialog.classList.remove('visible');
            dialog.setAttribute('aria-hidden', 'true');
        });
        document.body.style.overflow = '';
    }
    function resetReaders() {
        articles.forEach(function (id) { document.getElementById(id).classList.remove('visible'); });
        scenes[1].classList.remove('is-reading');
        if (typeof window.closePersonalityDetail === 'function') window.closePersonalityDetail();
        if (typeof window.closeMomentDetail === 'function') window.closeMomentDetail();
    }
    function updateProgress() {
        scrollFrame = 0;
        var id=readingId(current);if(!id)return;
        var article = document.getElementById(id);
        var available = Math.max(1, article.offsetHeight - window.innerHeight + 110);
        var progress = Math.min(1, Math.max(0, (window.scrollY - article.offsetTop + 110) / available));
        article.style.setProperty('--read-progress', progress.toFixed(3));
    }
    function applyRoute(options) {
        options = options || {};
        var next = parseRoute();
        next.openDream = next.openDream || options.openDream;
        var revision = ++routeRevision;
        var resource = next.openDream ? 'dream' : next.index === 0 ? 'meet' : next.index === 2 ? 'life' : next.index === 4 ? 'books' : null;
        if (window.SiteResources && !window.SiteResources.ready(resource)) {
            main.setAttribute('aria-busy', 'true');
            var loadingStatus = document.getElementById('sceneStatus');
            if (loadingStatus) loadingStatus.textContent = text('ex_loading');
            window.SiteResources.ensure(resource).then(function () {
                if (revision === routeRevision) applyRoute(Object.assign({}, options, {openDream:next.openDream}));
            }).catch(function () {
                if (revision !== routeRevision) return;
                main.removeAttribute('aria-busy');
                if (loadingStatus) loadingStatus.textContent = text('ex_load_failed');
            });
            return;
        }
        main.removeAttribute('aria-busy');
        if (current && current.key === next.key && !options.force) {
            if (next.openDream && window.DreamDialogue) window.DreamDialogue.open();
            return;
        }
        if (current) savePosition();
        var changedScene = !current || current.index !== next.index;
        if (window.ExhibitMotion) window.ExhibitMotion.cancelAll();
        if (window.ImageTransition) window.ImageTransition.cancelAll();
        settleAll(); resetDepth(); hideDialogs(); resetReaders();
        if(window.LifeExhibit)window.LifeExhibit.clear();
        document.body.classList.remove('nav-ink');
        applying = true;
        hero.hidden = next.index !== -1;
        scenes.forEach(function (scene, index) { scene.hidden = index !== next.index; });
        document.body.dataset.activeScene = next.index < 0 ? 'home' : sceneNames[next.index];
        document.querySelectorAll('#primaryNav a').forEach(function (link, index) {
            link.classList.toggle('active', index === Math.min(next.index,4));
            if (index === Math.min(next.index,4)) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        var focusTarget = next.index < 0 ? hero.querySelector('h1') : scenes[next.index].querySelector('h1');
        var anchor = null;
        var nextReader=readingId(next);
        if (nextReader) {
            var article = document.getElementById(nextReader);
            article.classList.add('visible');
            scenes[1].classList.add('is-reading');
            focusTarget = article.querySelector('h2');
        } else if (next.section === 'philosophy' && /^(fluid|compound|practice|learn)$/.test(next.detail)) {
            anchor = document.getElementById('thought-entry-'+next.detail);
            focusTarget = anchor && anchor.querySelector('h2');
            options.resetPosition = true;
        } else if (next.section === 'personality' && next.detail) {
            var card = Array.from(document.querySelectorAll('[data-test]')).find(function (item) { return item.dataset.test === next.detail; });
            if (card && window.showPersonalityDetail) {
                window.showPersonalityDetail(card);
                anchor = document.getElementById('personalityDetail');
                focusTarget = anchor.querySelector('button');
            }
        } else if (next.section === 'moments' && next.detail && window.showMomentDetail) {
            if (/^20\d{2}$/.test(next.detail)) {
                var yearGroup = document.getElementById('momentsYear' + next.detail);
                if (yearGroup) anchor=yearGroup;
                focusTarget = yearGroup;
            } else window.showMomentDetail(next.detail, next.album, options.initial,options.trigger);
        } else if (next.section === 'interview' && /^\d+$/.test(next.detail)) {
            var question = document.getElementById('interviewQuestion' + next.detail);
            if (question) {
                document.getElementById('interviewQuestions').style.display = 'block';
                if (window.refreshInterviewToggle) window.refreshInterviewToggle();
                anchor = question; focusTarget = question;
            }
        }
        if (!anchor && next.detail === '' && canonical.indexOf(next.section) < 0) anchor = document.getElementById(next.section);
        if (options.anchor) anchor = document.getElementById(next.section);
        current = next;
        applying = false;
        if (window.refreshPhilButtons) window.refreshPhilButtons();
        var restored = positions.get(next.key);
        var y = anchor ? window.scrollY + anchor.getBoundingClientRect().top - (parseFloat(getComputedStyle(root).getPropertyValue('--nav-height')) || 100) : 0;
        if(document.getElementById('momentsModal').classList.contains('visible')&&!options.initial)y=window.scrollY;
        window.scrollTo({ top: Math.max(0,y), behavior: 'instant' });
        if (restored && !options.anchor && !options.resetPosition) restorePosition(restored);
        if (changedScene && !options.initial && next.index >= 0) animate(scenes[next.index], 'scene-arriving', '--motion-scene');
        if (options.returnFocus && options.returnFocus.isConnected) focusTarget = options.returnFocus;
        if (focusTarget && !options.initial && !document.querySelector('[role="dialog"].visible')) {
            if (!focusTarget.matches('a,button,[tabindex]')) focusTarget.setAttribute('tabindex', '-1');
            focusTarget.focus({ preventScroll: true });
        }
        var status = document.getElementById('sceneStatus');
        if (status) status.textContent = next.index < 0 ? text('ex_label') : text(titleKeys[next.index]);
        updateProgress();
        document.dispatchEvent(new CustomEvent('exhibition:route', { detail: { section: next.section } }));
        if (next.openDream && window.DreamDialogue) window.DreamDialogue.open();
        if(window.HomeExhibit)window.HomeExhibit.refresh();
    }
    function navigate(route, options) {
        if (!initialized) return;
        options=options||{};
        if(current && current.index === -1 && (canonical.indexOf(route)>=0 || route==='books') && options.trigger && options.trigger.closest('.home-exhibit-link')) {
            homeOrigins.set(route,{route:current.key,homeId:options.trigger.closest('.home-exhibit-link').dataset.homeLink,focusRoute:route});
            options.resetPosition = true;
        }
        if(window.ImageTransition&&options&&options.trigger)window.ImageTransition.capture(options.trigger);
        var section = route.split('/')[0];
        var detail=route.split('/')[1]||'';
        var isReader = !!readingId({section:section,detail:detail}) || route.indexOf('personality/') === 0 || route.indexOf('moments/') === 0;
        if (isReader && !/^moments\/20\d{2}$/.test(route) && current && current.key !== route && !readingId(current) && (!current.detail || /^moments\/20\d{2}$/.test(current.key))) {
            var trigger=options.trigger||document.activeElement;
            var thought=trigger.closest('[data-thought]'),post=trigger.closest('[data-post-id]'),test=trigger.closest('[data-test]');
            readerOrigins.set(route, {route:current.key,focus:trigger,thought:thought&&thought.dataset.thought,post:post&&post.dataset.postId,test:test&&test.dataset.test});
        }
        var hash = route ? '#' + route : '#';
        if (location.hash !== hash) history.pushState({ exhibition: true }, '', hash);
        applyRoute(Object.assign({ force: true }, options));
    }
    window.Exhibition = {
        navigate: navigate,
        updateDetailRoute: function (route) {
            if (applying || !current || route.split('/')[0] !== current.section || route.split('/')[1] !== current.detail) return;
            var origin = readerOrigins.get(current.key); if (origin) readerOrigins.set(route, origin);
            positions.set(route, capturePosition());
            history.replaceState({ exhibition: true }, '', '#' + route);
            current = parseRoute();
        },
        returnTo: function (fallback) {
            var origin = current && readerOrigins.get(current.key);
            var focus = origin && origin.focus;
            if(origin&&(!focus||!focus.isConnected)){
                var thought=origin.thought&&document.getElementById('thought-entry-'+origin.thought);
                focus=thought&&thought.querySelector('h2 a,h2 button');
                if(!focus&&origin.post)focus=document.querySelector('.life-exhibit[data-post-id="'+CSS.escape(origin.post)+'"] a');
                if(!focus&&origin.test)focus=document.querySelector('[data-test="'+CSS.escape(origin.test)+'"]');
            }
            if (focus && !focus.isConnected) {
                var postId=focus.dataset.postId||focus.getAttribute('href')&&focus.getAttribute('href').split('/')[1];
                if(postId)focus=document.querySelector('.life-exhibit[data-post-id="'+postId+'"] a');
            }
            navigate(origin ? origin.route : fallback, { returnFocus: focus });
        },
        isApplyingRoute: function () { return applying; },
        capturePosition: capturePosition,
        restorePosition: restorePosition,
        refresh: function () {
            refreshMotion();
            if(window.HomeExhibit)window.HomeExhibit.refresh();
            if(window.ArtTitles)window.ArtTitles.refresh();
            document.querySelectorAll('.dialog-language').forEach(function (button) {
                button.textContent = typeof EN !== 'undefined' && DICT === EN ? '中' : 'EN';
                button.lang = typeof EN !== 'undefined' && DICT === EN ? 'zh' : 'en';
            });
            document.querySelectorAll('.dialog-controls [data-i-aria]').forEach(function (button) {
                var label = text(button.dataset.iAria);
                button.setAttribute('aria-label', label);
                button.title = label;
            });
            if (current) {
                var status = document.getElementById('sceneStatus');
                if (status) status.textContent = current.index < 0 ? text('ex_label') : text(titleKeys[current.index]);
            }
            updateProgress();
        }
    };
    function start() {
        /* Build all controls before enabling hidden scenes. */
        document.querySelectorAll('[role="dialog"]').forEach(function (dialog) {
            var controls = document.createElement('div'); controls.className = 'dialog-controls';
            var language = document.createElement('button'); language.type = 'button'; language.className = 'dialog-language';
            language.textContent = typeof EN !== 'undefined' && DICT === EN ? '中' : 'EN'; language.setAttribute('aria-label', text('ex_language'));
            language.dataset.iAria = 'ex_language'; language.title = text('ex_language');
            language.lang = typeof EN !== 'undefined' && DICT === EN ? 'zh' : 'en';
            language.addEventListener('click', function () { document.getElementById('langBtn').click(); });
            var theme = document.createElement('button'); theme.type = 'button'; theme.className = 'dialog-theme';
            theme.dataset.iAria = 'theme_aria'; theme.setAttribute('aria-label', text('theme_aria'));
            theme.title = text('theme_aria');
            document.querySelectorAll('#themeToggle svg').forEach(function (source) {
                var icon = source.cloneNode(true);
                icon.setAttribute('aria-hidden', 'true'); icon.setAttribute('focusable', 'false');
                icon.setAttribute('stroke-width', '1.6'); icon.setAttribute('stroke-linecap', 'round'); icon.setAttribute('stroke-linejoin', 'round');
                theme.appendChild(icon);
            });
            theme.addEventListener('click', function () { document.getElementById('themeToggle').click(); });
            controls.append(theme, language);
            var close = dialog.querySelector('.moments-modal-close,.avatar-modal-close,.img-lightbox-close');
            if (close) {
                close.classList.add('dialog-close');
                close.title = text(close.dataset.iAria);
                close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>';
                controls.appendChild(close);
            }
            dialog.appendChild(controls);
        });
        articles.forEach(function (id) {
            var toolbar = document.createElement('div');
            toolbar.className = 'reader-toolbar';
            var back = document.createElement('a');
            back.href = '#philosophy'; back.dataset.i = 'ex_reader_back'; back.textContent = text('ex_reader_back');
            var progress = document.createElement('div');
            progress.className = 'reader-progress'; progress.setAttribute('aria-hidden', 'true');
            progress.appendChild(document.createElement('span'));
            toolbar.append(back, progress);
            document.getElementById(id).querySelector('.container').prepend(toolbar);
        });
        scenes.forEach(function (scene, index) {
            var next = document.createElement('a');
            next.className = 'scene-next scene-home container';
            next.href = '#explore';
            var hint = document.createElement('span'); hint.dataset.i = 'ex_label'; hint.textContent = text('ex_label');
            var label = document.createElement('span');
            label.dataset.i = 'ex_return_entrance'; label.textContent = text(label.dataset.i);
            var arrow = document.createElement('span'); arrow.textContent = '↖'; arrow.setAttribute('aria-hidden', 'true');
            next.append(hint, label, arrow); scene.appendChild(next);
        });
        /* Life begins with practices; each year then shares one continuous canvas. */
        initialized = true;
        if('scrollRestoration' in history)history.scrollRestoration='manual';
        root.classList.add('exhibition-ready');
        refreshMotion();
        applyRoute({ initial: true });
        if (current && current.index === -1 && window.ExhibitMotion) window.ExhibitMotion.enter();
    }
    document.addEventListener('click', function (event) {
        var link = event.target.closest('a[href^="#"]');
        if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        var route = link.getAttribute('href').slice(1);
        if (route === 'exhibitionMain') {
            event.preventDefault(); main.focus(); return;
        }
        if (route && route !== 'explore' && !(route.split('/')[0] in sceneFor)) return;
        event.preventDefault();
        if(link.classList.contains('scene-home') && current && current.index>=0){
            var homeOrigin=homeOrigins.get(canonical[current.index]);
            var panel=homeOrigin && document.querySelector('[data-home-link="'+homeOrigin.homeId+'"]');
            var focus=panel && (panel.matches('a')?panel:panel.querySelector('a[href="#'+CSS.escape(homeOrigin.focusRoute||'books')+'"]'));
            navigate(homeOrigin?homeOrigin.route:'explore',{returnFocus:focus});return;
        }
        if (readingId(current) && route === 'philosophy') { window.Exhibition.returnTo('philosophy'); return; }
        navigate(route, { anchor: !!link.closest('.scene-jumps') || route==='contact',trigger:link });
    });
    window.addEventListener('popstate', function () { applyRoute(); });
    window.addEventListener('hashchange', function () { applyRoute(); });
    document.addEventListener('pointerdown', settleAll, { passive: true });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Tab') settleAll();
        if (event.key !== 'Tab') return;
        var dialogs = Array.from(document.querySelectorAll('[role="dialog"].visible'));
        if (!dialogs.length) return;
        dialogs.sort(function (a,b) { return (parseInt(getComputedStyle(a).zIndex,10) || 0) - (parseInt(getComputedStyle(b).zIndex,10) || 0); });
        var dialog = dialogs[dialogs.length - 1];
        var controls = Array.from(dialog.querySelectorAll('button,a[href],[tabindex="0"]')).filter(function (el) { return !el.disabled && el.getClientRects().length; });
        if (!controls.length) return;
        var first = controls[0], last = controls[controls.length - 1];
        if (!dialog.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    main.addEventListener('pointermove', function (event) {
        if (window.ExhibitMotion) return; // V3 uses scroll, not pointer sway.
        if (reduced() || !finePointer.matches) return;
        var target = event.target.closest('[data-depth]');
        if (target !== lastDepth) resetDepth();
        if (!target) return;
        lastDepth = target;
        var bounds = target.getBoundingClientRect();
        var amplitude = target.classList.contains('chapter-portal') ? 0 : 12;
        target.style.setProperty('--depth-x', (((event.clientX - bounds.left) / bounds.width - .5) * amplitude).toFixed(2) + 'px');
        target.style.setProperty('--depth-y', (((event.clientY - bounds.top) / bounds.height - .5) * amplitude).toFixed(2) + 'px');
        target.style.setProperty('--depth-rotate', (((event.clientX - bounds.left) / bounds.width - .5) * .8).toFixed(2) + 'deg');
    }, { passive: true });
    main.addEventListener('pointerleave', resetDepth, { passive: true });
    if (motionButton) motionButton.addEventListener('click', function () {
        var position = capturePosition();
        manualReduced = !manualReduced;
        try { localStorage.setItem('exhibition-motion', manualReduced ? 'reduced' : 'full'); } catch (_) { /* Session preference still works. */ }
        refreshMotion();
        restorePosition(position);
    });
    if (systemMotion.addEventListener) systemMotion.addEventListener('change', refreshMotion);
    else if (systemMotion.addListener) systemMotion.addListener(refreshMotion);
    window.addEventListener('scroll', function () { if (!scrollFrame && current && readingId(current)) scrollFrame = requestAnimationFrame(updateProgress);if(!positionTimer)positionTimer=setTimeout(savePosition,180); }, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { settleAll(); resetDepth(); } });
    window.addEventListener('pagehide', function () { savePosition();settleAll(); if (scrollFrame) cancelAnimationFrame(scrollFrame); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
