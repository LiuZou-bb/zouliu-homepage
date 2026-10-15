/* A page-local conversation: refreshing begins a new visit. */
(function () {
    'use strict';
    var scene = document.getElementById('dream'), data = window.DreamDialogueData;
    if (!scene || !data) return;
    var body = document.getElementById('dreamDialogueBody');
    var content = document.getElementById('dreamDialogueContent');
    var choices = document.getElementById('dreamChoices');
    var caption = document.getElementById('dreamCaption');
    var greeting = document.getElementById('dreamGreeting');
    var feedback = document.getElementById('dreamFeedback');
    var secret = document.getElementById('dreamSecret');
    var secretBody = document.getElementById('dreamSecretBody');
    var secretTitle = document.getElementById('dreamSecretTitle');
    var language = document.getElementById('dreamLanguage');
    var entry = document.getElementById('dreamToggle');
    var state = { node: 1, count: 0, reachedEnd: false, secretShown: false };
    var active = false, revisiting = false, inputLocked = false;
    var returnScroll = 0, returnFocus = null, previousOverflow = '', openingHash = '';
    var secretDelay = 0, revealTimer = 0, backdropStart = false;
    var systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var currentBubble = null;
    function reduced() { return document.documentElement.dataset.motion === 'reduced' || systemMotion.matches; }
    function isEnding() { return data.nodes[state.node].final === true; }
    function t(key) { return typeof DICT !== 'undefined' && typeof DICT[key] === 'string' ? DICT[key] : ZH[key] || key; }
    // Retire the former cross-refresh progress without restoring it.
    try { sessionStorage.removeItem('dream-dialogue-session-v1'); } catch (_) { /* Progress lives only in this page. */ }
    function paragraphCopy(host, copy) {
        host.replaceChildren();
        copy.split('\n\n').forEach(function (group) {
            var p = document.createElement('p');
            group.split('\n').forEach(function (line, index) { if (index) p.appendChild(document.createElement('br')); p.appendChild(document.createTextNode(line)); });
            host.appendChild(p);
        });
    }
    function updateFeedbackButton() {
        var button = choices.querySelector('button[data-choice="0"]');
        if (isEnding() && button) {
            if (state.count >= data.bubbles.length) button.setAttribute('aria-disabled', 'true');
            else button.removeAttribute('aria-disabled');
        }
    }
    function clearBubbles() { if (currentBubble) currentBubble.remove(); currentBubble = null; feedback.style.removeProperty('--feedback-clearance'); }
    function clearFeedback() { clearBubbles(); clearTimeout(secretDelay); secretDelay = 0; secret.hidden = true; updateFeedbackButton(); }
    function cancelReveal() { clearTimeout(revealTimer); revealTimer = 0; body.classList.remove('is-waiting'); body.removeAttribute('aria-hidden'); }
    function animateCopy() {
        if (!reduced() && body.animate) {
            body.getAnimations().forEach(function (animation) { animation.cancel(); });
            body.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 230, easing: 'ease-out' });
        }
    }
    function finishReveal() { cancelReveal(); if (active && state.node === 9) animateCopy(); }
    function keepFeedbackVisible() { if (active && isEnding()) content.scrollTop = content.scrollHeight; }
    function refreshCopy() {
        var node = data.nodes[state.node];
        paragraphCopy(body, t(node.text));
        caption.hidden = !node.caption; caption.textContent = node.caption ? t(node.caption) : '';
        greeting.hidden = !revisiting; greeting.textContent = t('dream_greeting');
        choices.setAttribute('aria-label', t('dream_choices_aria'));
        document.getElementById('dreamArchive').textContent = t('dream_archive');
        language.textContent = typeof EN !== 'undefined' && DICT === EN ? '中' : 'EN';
        language.setAttribute('aria-label', t('ex_language'));
        choices.querySelectorAll('button').forEach(function (button, index) { button.querySelector('.dream-choice-label').textContent = t(node.options[index].label); });
        choices.querySelectorAll('.dream-bubble[data-copy]').forEach(function (item) { item.textContent = t(item.dataset.copy); });
        secretTitle.textContent = t('dream_secret_title');
        if (!secret.hidden) paragraphCopy(secretBody, t('dream_secret'));
        if (currentBubble) arrangeBubbles();
        else if (!secret.hidden) keepFeedbackVisible();
        updateFeedbackButton();
    }
    function render(focus) {
        cancelReveal(); clearFeedback();
        scene.dataset.node = String(state.node); scene.classList.toggle('dream-ending', isEnding());
        feedback.hidden = !isEnding(); choices.replaceChildren();
        data.nodes[state.node].options.forEach(function (option, index) {
            var holder = document.createElement('div'); holder.className = 'dream-choice-slot';
            var button = document.createElement('button'); button.type = 'button'; button.className = 'dream-choice'; button.dataset.choice = String(index);
            var label = document.createElement('span'); label.className = 'dream-choice-label';
            button.appendChild(label); holder.appendChild(button); choices.appendChild(holder);
        });
        refreshCopy(); content.scrollTop = 0;
        if (focus && state.node === 9 && !reduced()) {
            body.classList.add('is-waiting'); body.setAttribute('aria-hidden', 'true'); revealTimer = setTimeout(finishReveal, 500); return;
        }
        if (focus) { body.focus({ preventScroll: true }); animateCopy(); }
    }
    function arrangeBubbles() {
        if (currentBubble) feedback.style.setProperty('--feedback-clearance', Math.max(52, currentBubble.getBoundingClientRect().height + 24) + 'px');
        else feedback.style.removeProperty('--feedback-clearance');
        keepFeedbackVisible();
    }
    function bubble(button) {
        // A new click immediately removes the preceding reply. Never loop past fifty.
        clearBubbles();
        if (!isEnding() || state.count >= data.bubbles.length) return;
        var copy = data.bubbles[state.count]; state.count++;
        var item = document.createElement('span'); item.className = 'dream-bubble';
        if (copy.indexOf('dream_bubble_') === 0) { item.dataset.copy = copy; item.textContent = t(copy); } else item.textContent = copy;
        if (copy === '') { item.classList.add('is-silent'); item.setAttribute('aria-hidden', 'true'); }
        else { item.setAttribute('role', 'status'); item.setAttribute('aria-live', 'polite'); }
        button.parentElement.appendChild(item); currentBubble = item; arrangeBubbles();
        if (state.count === data.bubbles.length) secretDelay = setTimeout(showSecret, 500);
        updateFeedbackButton();
    }
    function showSecret() {
        secretDelay = 0;
        if (!active || !isEnding() || state.count < data.bubbles.length) return;
        clearBubbles(); state.secretShown = true;
        secretTitle.textContent = t('dream_secret_title'); paragraphCopy(secretBody, t('dream_secret'));
        secret.hidden = false; keepFeedbackVisible(); updateFeedbackButton();
    }
    function open() {
        if (scene.open) return;
        returnScroll = window.scrollY; openingHash = location.hash;
        returnFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : entry;
        previousOverflow = document.body.style.overflow;
        active = true; revisiting = state.reachedEnd; scene.showModal(); document.body.style.overflow = 'hidden';
        render(false); document.getElementById('dreamTitle').focus({ preventScroll: true });
        if (state.count >= data.bubbles.length) showSecret();
    }
    function close(restore) {
        if (!active && !scene.open) return;
        active = false;
        cancelReveal(); clearFeedback(); if (scene.open) scene.close(); document.body.style.overflow = previousOverflow;
        if (restore !== false && location.hash === openingHash) {
            if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
            window.scrollTo({ top: returnScroll, behavior: 'instant' });
        }
    }
    document.addEventListener('click', function (event) {
        var trigger = event.target.closest('#dreamToggle');
        if (!trigger || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); event.stopPropagation(); open();
    }, true);
    choices.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-choice]');
        if (!active || !button || !choices.contains(button)) return;
        var option = data.nodes[state.node].options[Number(button.dataset.choice)];
        // Sitting together is a pause, with no rerender, replay, timer or feedback count.
        if (option.wait) return;
        if (option.next === 'bubble') { bubble(button); return; }
        if (inputLocked || event.detail > 1) return;
        inputLocked = true; requestAnimationFrame(function () { inputLocked = false; });
        if (option.next === null) { close(); return; }
        state.node = option.next; state.reachedEnd = state.reachedEnd || isEnding(); revisiting = false; render(true);
    });
    choices.addEventListener('keydown', function (event) { if (!isEnding() && event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });
    language.addEventListener('click', function () { document.getElementById('langBtn').click(); });
    scene.addEventListener('cancel', function (event) { event.preventDefault(); close(); });
    scene.addEventListener('keydown', function (event) {
        if (event.key !== 'Tab') return;
        var controls = Array.from(scene.querySelectorAll('button:not([disabled])')).filter(function (button) { return button.getClientRects().length; });
        var first = controls[0], last = controls[controls.length - 1], focused = document.activeElement;
        if (event.shiftKey && (focused === first || focused === scene || focused.id === 'dreamTitle')) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && focused === last) { event.preventDefault(); first.focus(); }
    });
    scene.addEventListener('close', function () { if (active && !scene.open) close(); });
    function outside(event) { var r = scene.getBoundingClientRect(); return event.target === scene && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom); }
    scene.addEventListener('pointerdown', function (event) { backdropStart = outside(event); });
    scene.addEventListener('click', function (event) { if (backdropStart && outside(event)) close(); backdropStart = false; });
    document.addEventListener('exhibition:route', function () { if (active) close(false); });
    new MutationObserver(function () { if (revealTimer && reduced()) finishReveal(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    if (systemMotion.addEventListener) systemMotion.addEventListener('change', function () { if (revealTimer && reduced()) finishReveal(); });
    new ResizeObserver(function () { if (currentBubble) arrangeBubbles(); else if (!secret.hidden) keepFeedbackVisible(); }).observe(choices);
    window.addEventListener('pagehide', function () { close(false); });
    window.DreamDialogue = { refresh: refreshCopy, open: open, close: close };
    render(false);
})();
