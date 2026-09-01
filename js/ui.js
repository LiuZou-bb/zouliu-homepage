/**
 * ============================================================
 * 核心原则：永远不读取图片内容。
 * 不对任何图片进行内容读取、分析或处理。
 * ============================================================
 */

// —— 人格测试结论 ——


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
        closeBtn.focus();
    }

    function closeAvatar() {
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
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
        var test = card.getAttribute('data-test');
        var cmap={'16PF':'16pf','EPQ-R':'epq','NEO-PI-R':'neo'};
        var ckey='conclusion_'+cmap[test];
        var text = (typeof DICT!=='undefined' && DICT[ckey]) ? DICT[ckey] : '';
        if (!text) return false;

        var img = card.querySelector('img');
        detailImg.src = img.src;
        detailImg.alt = img.alt;

        var lines = text.split('\n');
        var html = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;
            if (line.indexOf('得分') === -1 && line.indexOf('整体') === -1 &&
                line.indexOf('特质表现') === -1 &&
                line.indexOf('Score') === -1 && line.indexOf('Overall') === -1 &&
                line.indexOf('Traits') === -1 && line.indexOf('percentile') === -1 &&
                line.indexOf('：') > 0 && line.length < 40 &&
                !line.match(/^\d/)) {
                html += '<h3>' + line + '</h3>';
            } else {
                html += '<p>' + line + '</p>';
            }
        }
        var note = (typeof DICT!=='undefined' && DICT.personality_note) ? DICT.personality_note : '';
        if (note) html += '<p class="personality-note">' + note + '</p>';
        detailContent.innerHTML = html;
        return true;
    }

    window.refreshPersonalityDetail = function () {
        if (activeCard && detail.classList.contains('visible')) {
            renderPersonalityDetail(activeCard);
        }
    };

    function openCard(card) {
        activeCard = card;
        if (!renderPersonalityDetail(card)) return;
            detail.classList.add('visible');
            grid.parentElement.parentElement.style.display = 'none';
            detail.scrollIntoView({ behavior: 'smooth' });
    }

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
        lightboxClose.focus();
    }

    function closeDetailImage() {
        if (!lightbox || !lightboxImage) return;
        lightbox.classList.remove('visible');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.removeAttribute('src');
        document.body.style.overflow = '';
        if (lightboxLastFocus && typeof lightboxLastFocus.focus === 'function') lightboxLastFocus.focus();
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
        var cardToFocus = activeCard;
        detail.classList.remove('visible');
        activeCard = null;
        grid.parentElement.parentElement.style.display = '';
        document.getElementById('personality').scrollIntoView({ behavior: 'smooth' });
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
        });
    });
})();

// —— 主题切换 ——
(function () {
    var toggle = document.getElementById('themeToggle');
    var html = document.documentElement;
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

    toggle.addEventListener('click', function () {
        var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
})();




// —— 身体快速使用手册折叠 ——
(function () {
    function activateOnKeyboard(toggle, action) {
        toggle.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                action();
            }
        });
    }

    document.querySelectorAll('.body-toggle').forEach(function (toggle) {
        function activate() {
            var group = toggle.nextElementSibling;
            var isOpen = group.classList.contains('open');
            document.querySelectorAll('.body-toggle').forEach(function (t) {
                t.classList.remove('open');
                t.setAttribute('aria-expanded', 'false');
            });
            document.querySelectorAll('.body-group').forEach(function (g) { g.classList.remove('open'); });
            if (!isOpen) {
                toggle.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
                group.classList.add('open');
                setTimeout(function () {
                    toggle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            }
        }
        toggle.addEventListener('click', activate);
        activateOnKeyboard(toggle, activate);
    });

    document.querySelectorAll('.body-sub-toggle').forEach(function (toggle) {
        function activate() {
            var sub = toggle.nextElementSibling;
            var isOpen = sub.classList.contains('open');
            toggle.classList.toggle('open', !isOpen);
            toggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
            sub.classList.toggle('open', !isOpen);
        }
        toggle.addEventListener('click', function (event) {
            event.stopPropagation();
            activate();
        });
        activateOnKeyboard(toggle, activate);
    });
})();
// —— 理念区折叠面板（手风琴 + 返回自动收起） ——
// Called by i18n.js after language switch

(function () {
    var panels = [
        { btnId: 'friendToggle', sectionId: 'friend', icon: '🤝', labelKey: 'phil_friend', fallback: '我希望和这样的人交朋友' },
        { btnId: 'loveToggle',   sectionId: 'love',   icon: '❤️', labelKey: 'phil_love', fallback: '我对爱的理解' },
        { btnId: 'childhoodToggle', sectionId: 'childhood', icon: '🧒', labelKey: 'phil_childhood', fallback: '对童年塑造的理解' },
        { btnId: 'sorryToggle', sectionId: 'sorry', icon: '💌', labelKey: 'phil_sorry', fallback: '想对你说' },
        { btnId: 'dreamToggle',  sectionId: 'dream',  icon: '🌙', labelKey: 'phil_dream', fallback: '我梦的解析' }
    ];

    window.refreshPhilButtons = function() {
        panels.forEach(function(p) {
            var b = document.getElementById(p.btnId);
            var s = document.getElementById(p.sectionId);
            var isOpen = s && s.classList.contains("visible");
            if (!b) return;
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
            if (b) {
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
            var isOpen = section.classList.contains('visible');
            closeAll();
            if (!isOpen) {
                section.classList.add('visible');
                if (btn.hasAttribute('aria-controls')) btn.setAttribute('aria-expanded', 'true');
                var collapseText = (typeof DICT !== 'undefined' && DICT.phil_collapse) ? DICT.phil_collapse : '收起'; btn.innerHTML = '<span class="btn-icon">' + p.icon + '</span> ' + collapseText;
                setTimeout(function () { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
            } else {
                window.location.hash = '#philosophy';
            }
        });
    });

    // 所有返回按钮
    document.querySelectorAll('#friend .btn-secondary, #love .btn-secondary, #childhood .btn-secondary, #sorry .btn-secondary').forEach(function (back) {
        back.addEventListener('click', function (e) {
            e.preventDefault();
            closeAll();
            document.getElementById('philosophy').scrollIntoView({ behavior: 'smooth' });
        });
    });
})();

// —— 滚动动画 ——
(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add('animate');
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.skill-card, .personality-card, .philosophy-card, .section-title, .about-content, .contact-item, .love-content h3, .love-block, .childhood-block p:first-child').forEach(function (el) { observer.observe(el); });
})();

// —— 导航高亮 ——
(function () {
    var sections = document.querySelectorAll('section[id]');
    var links = document.querySelectorAll('.nav-links a');
    var observer = new IntersectionObserver(function (entries) {
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





// —— 梦的解析彩蛋 ——
(function () {
    var dreamBtn = document.getElementById('dreamToggle');
    if (!dreamBtn) return;

    // Create intimacy modal
    var intimacyModal = document.createElement('div');
    intimacyModal.className = 'moments-modal';
    intimacyModal.id = 'intimacyModal';
    intimacyModal.setAttribute('role', 'dialog');
    intimacyModal.setAttribute('aria-modal', 'true');
    intimacyModal.setAttribute('aria-hidden', 'true');
    intimacyModal.innerHTML = '<div class="moments-modal-bg"></div>' +
        '<div class="moments-modal-content" style="text-align:center;max-width:420px;">' +
        '<button class="moments-modal-close" id="intimacyClose" type="button" data-i-aria="dialog_close_aria" aria-label="关闭弹窗">&times;</button>' +
        '<div style="font-size:3rem;margin:20px 0 12px;">🔒</div>' +
        '<h3 id="intimacyTitle" style="font-size:1.15rem;color:var(--text);margin-bottom:8px;">' + ((typeof DICT!=='undefined'&&DICT.intimacy_title)?DICT.intimacy_title:'亲密度不够') + '</h3>' +
        '<p id="intimacyDesc" style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;">' + ((typeof DICT!=='undefined'&&DICT.intimacy_desc)?DICT.intimacy_desc:'梦是灵魂的密语，只对足够亲近的人敞开。') + '</p>' +
        '<p id="intimacyTip" style="color:var(--text-secondary);font-size:0.85rem;margin-top:8px;">' + ((typeof DICT!=='undefined'&&DICT.intimacy_tip)?DICT.intimacy_tip:'当前亲密度不足以查看此内容') + '</p>' +
        '<div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border);">' +
        '<span id="intimacyHint" style="font-size:0.8rem;color:var(--text-secondary);">' + ((typeof DICT!=='undefined'&&DICT.intimacy_hint)?DICT.intimacy_hint:'💡 多聊聊、多见见，亲密度自然会升') + '</span>' +
        '</div></div>';
    document.body.appendChild(intimacyModal);

    var closeBtn = intimacyModal.querySelector('#intimacyClose');
    var bg = intimacyModal.querySelector('.moments-modal-bg');
    var intimacyLastFocus = null;

    dreamBtn.addEventListener('click', function () {
        intimacyLastFocus = dreamBtn;
        var t = document.getElementById('intimacyTitle');
        var d = document.getElementById('intimacyDesc');
        var p = document.getElementById('intimacyTip');
        var h = document.getElementById('intimacyHint');
        if (t) t.textContent = (typeof DICT!=='undefined'&&DICT.intimacy_title)?DICT.intimacy_title:'亲密度不够';
        if (d) d.textContent = (typeof DICT!=='undefined'&&DICT.intimacy_desc)?DICT.intimacy_desc:'梦是灵魂的密语，只对足够亲近的人敞开。';
        if (p) p.textContent = (typeof DICT!=='undefined'&&DICT.intimacy_tip)?DICT.intimacy_tip:'当前亲密度不足以查看此内容';
        if (h) h.textContent = (typeof DICT!=='undefined'&&DICT.intimacy_hint)?DICT.intimacy_hint:'💡 多聊聊、多见见，亲密度自然会升';
        intimacyModal.classList.add('visible');
        intimacyModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    });

    function closeIntimacy() {
        intimacyModal.classList.remove('visible');
        intimacyModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (intimacyLastFocus && typeof intimacyLastFocus.focus === 'function') intimacyLastFocus.focus();
    }
    closeBtn.addEventListener('click', closeIntimacy);
    bg.addEventListener('click', closeIntimacy);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && intimacyModal.classList.contains('visible')) closeIntimacy();
    });
})();

