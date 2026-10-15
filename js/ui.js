// UI interactions; questionnaire records are owned by personality.js.

function scrollSiteElementIntoView(element, block) {
    if (!element) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
    element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: block || 'start' });
}

// Animate complete compositions; remove animation state after settling.
(function () {
    var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var hero = document.querySelector('.hero-layout');
    var observer;
    var running = new Map();

    function durationFor(element, token) {
        var value = getComputedStyle(element).getPropertyValue(token).trim();
        return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000) || 1200;
    }

    function settle(element) {
        var state = running.get(element);
        if (!state) return;
        clearTimeout(state.timer);
        element.removeEventListener('animationend', state.finish);
        element.removeEventListener('animationcancel', state.finish);
        element.classList.remove(state.className);
        running.delete(element);
    }

    function animate(element, className, token) {
        var state = { className: className };
        state.finish = function (event) {
            if (!event || event.target === element) settle(element);
        };
        running.set(element, state);
        element.addEventListener('animationend', state.finish);
        element.addEventListener('animationcancel', state.finish);
        state.timer = setTimeout(state.finish, durationFor(element, token) + 250);
        element.classList.add(className);
    }

    function skipEntry() { if (hero) settle(hero); }

    function start() {
        if (window.Exhibition) return;
        if (preference.matches) return;
        if (hero) animate(hero, 'is-entering', '--motion-entry');
        if (!('IntersectionObserver' in window)) return;
        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                animate(entry.target, 'is-revealing', '--motion-reveal');
            });
        }, { threshold: 0, rootMargin: '0px 0px -48px 0px' });
        document.querySelectorAll('.section > .container, .footer > .container').forEach(function (group) {
            observer.observe(group);
        });
    }

    document.addEventListener('pointerdown', skipEntry, { capture: true, passive: true });
    document.addEventListener('touchstart', skipEntry, { capture: true, passive: true });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Tab') skipEntry();
    }, true);
    window.addEventListener('pagehide', function () {
        Array.from(running.keys()).forEach(settle);
    });
    function onPreferenceChange() {
        if (!preference.matches) return;
        if (observer) observer.disconnect();
        Array.from(running.keys()).forEach(settle);
    }
    if (preference.addEventListener) preference.addEventListener('change', onPreferenceChange);
    else if (preference.addListener) preference.addListener(onPreferenceChange);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();


// —— 响应式导航 ——
(function () {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('primaryNav');
    if (!toggle || !menu) return;

    function setOpen(open) {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });
    window.addEventListener('resize', function () {
        if (window.innerWidth > 1040) setOpen(false);
    });
})();


// —— 头像点击放大 ——
(function () {
    var trigger = document.getElementById('avatarZoom');
    var modal = document.getElementById('avatarModal');
    var closeBtn = document.getElementById('avatarModalClose');
    var bg = document.getElementById('avatarModalBg');
    var lastFocus = null;

    if (!trigger || !modal || !closeBtn || !bg) return;

    function openAvatar() {
        lastFocus = document.activeElement;
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (window.ImageTransition) window.ImageTransition.open(modal.querySelector('img'), trigger.querySelector('img'));
        closeBtn.focus();
    }

    function closeAvatar() {
        function finish() {
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
        }
        if (window.ImageTransition) window.ImageTransition.close(modal.querySelector('img'), trigger.querySelector('img'), finish);
        else finish();
    }

    trigger.addEventListener('click', openAvatar);
    closeBtn.addEventListener('click', closeAvatar);
    bg.addEventListener('click', closeAvatar);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('visible')) closeAvatar();
    });
})();


// —— 人格卡片点击 →  ——
(function () {
    var cards = document.querySelectorAll('.personality-card');
    var detail = document.getElementById('personalityDetail');
    var detailImg = document.getElementById('detailImg');
    var detailImageZoom = document.getElementById('detailImageZoom');
    var detailContent = document.getElementById('detailContent');
    var backBtn = document.getElementById('detailBack');
    var grid = document.getElementById('personalityGrid');
    var lightbox = document.getElementById('personalityLightbox');
    var lightboxImage = document.getElementById('personalityLightboxImage');
    var lightboxClose = document.getElementById('personalityLightboxClose');
    var activeCard = null;
    var lightboxLastFocus = null;
    var lightboxTouchStartX = null;
    var lightboxTouchStartY = null;

    if (!cards.length || !detail) return;

    function renderPersonalityDetail(card) {
        if (window.PersonalityRecords) return window.PersonalityRecords.render(card.dataset.test, detailImg, detailContent);
        return false;
    }

    window.refreshPersonalityDetail = function () {
        if (activeCard && detail.classList.contains('visible')) {
            renderPersonalityDetail(activeCard);
            if (lightbox && lightbox.classList.contains('visible')) lightboxImage.alt = detailImg.alt;
        }
    };

    function openCard(card) {
        if (window.Exhibition && !window.Exhibition.isApplyingRoute()) {
            window.Exhibition.navigate('personality/' + card.getAttribute('data-test'), { trigger: card });
            return;
        }
        activeCard = card;
        if (!renderPersonalityDetail(card)) return;
            detail.classList.add('visible');
            grid.parentElement.parentElement.style.display = 'none';
            if (!window.Exhibition) scrollSiteElementIntoView(detail);
    }
    window.showPersonalityDetail = openCard;
    window.closePersonalityDetail = function () {
        detail.classList.remove('visible');
        activeCard = null;
        grid.parentElement.parentElement.style.display = '';
    };

    cards.forEach(function (card) {
        card.addEventListener('click', function () { openCard(card); });
        card.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCard(card);
            }
        });
    });

    function openDetailImage() {
        if (!detailImg.src || !lightbox || !lightboxImage || !lightboxClose) return;
        lightboxLastFocus = document.activeElement;
        lightboxImage.src = detailImg.src;
        lightboxImage.alt = detailImg.alt;
        lightbox.classList.add('visible');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (window.ImageTransition) window.ImageTransition.open(lightboxImage, detailImg);
        lightboxClose.focus();
    }

    function closeDetailImage() {
        if (!lightbox || !lightboxImage) return;
        function finish() {
        lightbox.classList.remove('visible');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.removeAttribute('src');
        document.body.style.overflow = '';
        if (lightboxLastFocus && typeof lightboxLastFocus.focus === 'function') lightboxLastFocus.focus();
        }
        if (window.ImageTransition) window.ImageTransition.close(lightboxImage, detailImg, finish);
        else finish();
    }

    if (detailImageZoom && lightbox && lightboxClose) {
        detailImageZoom.addEventListener('click', openDetailImage);
        lightboxClose.addEventListener('click', closeDetailImage);
        lightboxImage.addEventListener('click', closeDetailImage);
        lightboxImage.addEventListener('touchstart', function (event) {
            var touch = event.changedTouches[0];
            lightboxTouchStartX = touch.clientX;
            lightboxTouchStartY = touch.clientY;
        }, { passive: true });
        lightboxImage.addEventListener('touchend', function (event) {
            if (lightboxTouchStartX === null || lightboxTouchStartY === null) return;
            var touch = event.changedTouches[0];
            var movedX = Math.abs(touch.clientX - lightboxTouchStartX);
            var movedY = Math.abs(touch.clientY - lightboxTouchStartY);
            lightboxTouchStartX = null;
            lightboxTouchStartY = null;
            if (Math.max(movedX, movedY) >= 48) closeDetailImage();
        }, { passive: true });
        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) closeDetailImage();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && lightbox.classList.contains('visible')) closeDetailImage();
        });
    }

    backBtn.addEventListener('click', function () {
        if (window.Exhibition) { window.Exhibition.returnTo('personality'); return; }
        var cardToFocus = activeCard;
        detail.classList.remove('visible');
        activeCard = null;
        grid.parentElement.parentElement.style.display = '';
        scrollSiteElementIntoView(document.getElementById('personality'));
        if (cardToFocus && typeof cardToFocus.focus === 'function') cardToFocus.focus();
    });
})();

// —— 邮箱点击复制 ——
(function () {
    var btn = document.getElementById('emailCopy');
    var tip = document.getElementById('copyTip');
    if (!btn || !tip) return;
    btn.addEventListener('click', function () {
        navigator.clipboard.writeText('zouliu520@outlook.com').then(function () {
            tip.classList.add('show');
            setTimeout(function () { tip.classList.remove('show'); }, 2000);
        }).catch(function () {
            var mail = document.querySelector('.contact-mail');
            if (mail) mail.focus();
        });
    });
})();

// —— 主题切换 ——
(function () {
    var toggle = document.getElementById('themeToggle');
    var html = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (_) { /* Storage is optional. */ }
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

    toggle.addEventListener('click', function () {
        var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        if (window.Exhibition) window.Exhibition.refresh();
        try { localStorage.setItem('theme', next); } catch (_) { /* Theme still changes in this session. */ }
    });
})();




// —— 理念区折叠面板（手风琴 + 返回自动收起） ——
// Called by i18n.js after language switch

(function () {
    var panels = [
        { btnId: 'friendToggle', sectionId: 'friend', icon: '🤝', labelKey: 'phil_friend', fallback: '我希望和这样的人交朋友' },
        { btnId: 'loveToggle',   sectionId: 'love',   icon: '❤️', labelKey: 'phil_love', fallback: '我对爱的理解' },
        { btnId: 'childhoodToggle', sectionId: 'childhood', icon: '🧒', labelKey: 'phil_childhood', fallback: '对童年塑造的理解' },
        { btnId: 'sorryToggle', sectionId: 'sorry', icon: '💌', labelKey: 'phil_sorry', fallback: '想对你说' }
    ];

    window.refreshPhilButtons = function() {
        panels.forEach(function(p) {
            var b = document.getElementById(p.btnId);
            var s = document.getElementById(p.sectionId);
            var isOpen = s && s.classList.contains("visible");
            if (!b || b.classList.contains('thought-title-button')) return;
            if (b.hasAttribute('aria-controls')) b.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen) {
                var ct = (typeof DICT !== "undefined" && DICT.phil_collapse) ? DICT.phil_collapse : "收起";
                b.innerHTML = "<span class=\"btn-icon\">" + p.icon + "</span> " + ct;
            } else {
                var lb = (typeof DICT !== "undefined" && DICT[p.labelKey]) ? DICT[p.labelKey] : p.fallback;
                b.innerHTML = "<span class=\"btn-icon\">" + p.icon + "</span> " + lb;
            }
        });
    };
    function closeAll() {
        panels.forEach(function (p) {
            var s = document.getElementById(p.sectionId);
            var b = document.getElementById(p.btnId);
            if (s) s.classList.remove("visible");
            if (b && !b.classList.contains('thought-title-button')) {
                var lb = (typeof DICT !== "undefined" && DICT[p.labelKey]) ? DICT[p.labelKey] : p.fallback;
                b.innerHTML = '<span class="btn-icon">' + p.icon + '</span> ' + lb;
                if (b.hasAttribute('aria-controls')) b.setAttribute('aria-expanded', 'false');
            }
        });
    }

    panels.forEach(function (p) {
        var btn = document.getElementById(p.btnId);
        var section = document.getElementById(p.sectionId);
        if (!btn || !section) return;

        btn.addEventListener('click', function () {
            if (window.Exhibition) { window.Exhibition.navigate(p.sectionId); return; }
            var isOpen = section.classList.contains('visible');
            closeAll();
            if (!isOpen) {
                section.classList.add('visible');
                if (btn.hasAttribute('aria-controls')) btn.setAttribute('aria-expanded', 'true');
                var collapseText = (typeof DICT !== 'undefined' && DICT.phil_collapse) ? DICT.phil_collapse : '收起'; btn.innerHTML = '<span class="btn-icon">' + p.icon + '</span> ' + collapseText;
                setTimeout(function () { scrollSiteElementIntoView(section); }, 100);
            } else {
                window.location.hash = '#philosophy';
            }
        });
    });

    // 所有返回按钮
    document.querySelectorAll('#friend .btn-secondary, #love .btn-secondary, #childhood .btn-secondary, #sorry .btn-secondary').forEach(function (back) {
        back.addEventListener('click', function (e) {
            e.preventDefault();
            if (window.Exhibition) { window.Exhibition.returnTo('philosophy'); return; }
            closeAll();
            scrollSiteElementIntoView(document.getElementById('philosophy'));
        });
    });
})();

// —— 导航高亮 ——
(function () {
    if (!('IntersectionObserver' in window)) return;
    var sections = document.querySelectorAll('section[id]');
    var links = document.querySelectorAll('.nav-links a');
    var observer = new IntersectionObserver(function (entries) {
        if (window.Exhibition) return;
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                links.forEach(function (link) {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { observer.observe(s); });
})();





