/**
 * ============================================================
 * 核心原则：永远不读取图片内容。
 * 不对任何图片进行内容读取、分析或处理。
 * ============================================================
 */

// —— 人格测试结论 ——


// —— 人格卡片点击 →  ——
(function () {
    var cards = document.querySelectorAll('.personality-card');
    var detail = document.getElementById('personalityDetail');
    var detailImg = document.getElementById('detailImg');
    var detailContent = document.getElementById('detailContent');
    var backBtn = document.getElementById('detailBack');
    var grid = document.getElementById('personalityGrid');

    if (!cards.length || !detail) return;

    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            var test = card.getAttribute('data-test');
            var cmap={'16PF':'16pf','EPQ-R':'epq','NEO-PI-R':'neo'};
            var ckey='conclusion_'+cmap[test];
            var text = (typeof DICT!=='undefined' && DICT[ckey]) ? DICT[ckey] : '';
            if (!text) return;
            var data = {text: text};

            var img = card.querySelector('img');
            detailImg.src = img.src;
            detailImg.alt = img.alt;

            var lines = data.text.split('\n');
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
            detail.classList.add('visible');
            grid.parentElement.parentElement.style.display = 'none';
            detail.scrollIntoView({ behavior: 'smooth' });
        });
    });

    backBtn.addEventListener('click', function () {
        detail.classList.remove('visible');
        grid.parentElement.parentElement.style.display = '';
        document.getElementById('personality').scrollIntoView({ behavior: 'smooth' });
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
    // 一级折叠：h3 → body-group
    document.querySelectorAll('.body-toggle').forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            var group = toggle.nextElementSibling;
            var isOpen = group.classList.contains('open');
            // close all
            document.querySelectorAll('.body-toggle').forEach(function (t) { t.classList.remove('open'); });
            document.querySelectorAll('.body-group').forEach(function (g) { g.classList.remove('open'); });
            if (!isOpen) {
                toggle.classList.add('open');
                group.classList.add('open');
                // 等 DOM 更新后滚动到新展开的位置
                setTimeout(function () {
                    toggle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            }
        });
    });

    // 二级折叠：h4 → body-sub
    document.querySelectorAll('.body-sub-toggle').forEach(function (toggle) {
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var sub = toggle.nextElementSibling;
            var isOpen = sub.classList.contains('open');
            toggle.classList.toggle('open', !isOpen);
            sub.classList.toggle('open', !isOpen);
        });
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
            if (b) { var lb = (typeof DICT !== "undefined" && DICT[p.labelKey]) ? DICT[p.labelKey] : p.fallback; b.innerHTML = '<span class="btn-icon">' + p.icon + '</span> ' + lb; }
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
    intimacyModal.innerHTML = '<div class="moments-modal-bg"></div>' +
        '<div class="moments-modal-content" style="text-align:center;max-width:420px;">' +
        '<button class="moments-modal-close" id="intimacyClose">&times;</button>' +
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

    dreamBtn.addEventListener('click', function () {
        var t = document.getElementById('intimacyTitle');
        var d = document.getElementById('intimacyDesc');
        var p = document.getElementById('intimacyTip');
        var h = document.getElementById('intimacyHint');
        if (t) t.textContent = (typeof DICT!=='undefined'&&DICT.intimacy_title)?DICT.intimacy_title:'亲密度不够';
        if (d) d.textContent = (typeof DICT!=='undefined'&&DICT.intimacy_desc)?DICT.intimacy_desc:'梦是灵魂的密语，只对足够亲近的人敞开。';
        if (p) p.textContent = (typeof DICT!=='undefined'&&DICT.intimacy_tip)?DICT.intimacy_tip:'当前亲密度不足以查看此内容';
        if (h) h.textContent = (typeof DICT!=='undefined'&&DICT.intimacy_hint)?DICT.intimacy_hint:'💡 多聊聊、多见见，亲密度自然会升';
        intimacyModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    });

    function closeIntimacy() {
        intimacyModal.classList.remove('visible');
        document.body.style.overflow = '';
    }
    closeBtn.addEventListener('click', closeIntimacy);
    bg.addEventListener('click', closeIntimacy);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && intimacyModal.classList.contains('visible')) closeIntimacy();
    });
})();
