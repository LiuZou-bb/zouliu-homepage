/**
 * ============================================================
 * 核心原则：永远不读取图片内容。
 * 不对任何图片进行内容读取、分析或处理。
 * ============================================================
 */

// —— 人格测试结论 ——
var conclusions = {
    "16PF": {
        text: '16PF 以 "16 种根源特质" 为框架，得分（0-4 分）越高代表该特质越显著：\n\n' +
              '1. 人际与情绪类特质\n' +
              '温暖（得分 3）：高区间，人际亲和度突出，易与他人建立信任、共情的关系；\n' +
              '情绪稳定（得分 3.2）：高区间，情绪管控能力强，面对压力、变化时状态沉稳，环境适应力优异。\n\n' +
              '2. 认知与决策类特质\n' +
              '推理（得分 3.4）：高区间，抽象思维、逻辑分析能力优异，擅长复杂问题的解构与解决；\n' +
              '支配性（得分 3.5）：高区间，具备较强的主见与领导力，事务决策中倾向于主导节奏，竞争意识与决断力突出。\n\n' +
              '3. 行为风格类特质\n' +
              '活力（得分 1.9）：低区间，精力的外向表达较弱，偏好低刺激、沉稳的环境，更适应 "少喧闹、重深度" 的活动；\n' +
              '规则意识（得分 1.8）：低区间，不盲从权威或既定规则，行为风格灵活变通，更倾向于 "以目标为导向调整规则"；\n' +
              '警觉性（得分 1.6）：低区间，人际信任度高，对他人的猜忌、防备程度低，互动中更坦诚；\n' +
              '对变革开放（得分 3.4）：高区间，对新事物、新方式的接纳度高，不固执于固有模式。\n\n' +
              '4. 自我特质类\n' +
              '自力更生（得分 3.3）：高区间，独立意识强，能自主规划事务、满足自身需求；\n' +
              '张力（得分 1.2）：低区间，心理状态放松，极少出现过度急躁、焦虑的情况。'
    },
    "EPQ-R": {
        text: 'EPQ 基于 "掩饰性（L）、外倾性（E）、神经质（N）、精神质（P）" 框架，得分百分比代表在常模中的相对水平：\n\n' +
              '1. 掩饰性量表（L）：作答信度良好\n' +
              '得分 11（占比 55%），处于中等区间，说明测试过程中无明显刻意修饰、掩饰倾向，结果能真实反映人格特质。\n\n' +
              '2. 外倾性量表（E）：中间型人格，社交 - 独处需求平衡\n' +
              '得分 11（占比 52%），处于 "典型外倾 - 典型内倾" 的中间区间。\n' +
              '特质表现：既不会依赖社交获取能量，也不会回避人际互动，可自然参与社交但偏好适度边界，行为节奏张弛有度。\n\n' +
              '3. 神经质量表（N）：情绪稳定性突出\n' +
              '得分 10（占比 41%），显著低于常模平均水平。\n' +
              '特质表现：负性情绪的唤起频率与强度均较低，面对压力、冲突时情绪管控能力强，心理状态更平稳。\n\n' +
              '4. 精神质量表（P）：人际适配性良好\n' +
              '得分 7（占比 30%），处于低区间（精神质非 "精神病"，是人际疏离、冲动等倾向的指标）。\n' +
              '特质表现：人际表现温和、共情力较好，能顺利适应环境、与他人建立协作关系，无显著的冷漠或对抗倾向。'
    },
    "NEO-PI-R": {
        text: '大五人格以 "开放性（O）、尽责性（C）、外倾性（E）、宜人性（A）、神经质（N）" 为核心框架，得分百分比反映在常模群体中的特质显著度：\n\n' +
              '1. 开放性（O）：认知灵活度与探索欲突出\n' +
              '整体得分 68%，核心分面（审慎、价值开放度）达 84%，处于高区间。\n' +
              '特质表现：对新体验、多元价值观、抽象思维的接纳度极强，认知风格兼具创造性与包容性，既愿意探索新领域，也能理性包容不同观点。\n\n' +
              '2. 神经质（N）：情绪韧性极强\n' +
              '整体得分 26%，核心分面（焦虑、愤怒敌意）均低于 34%，显著低于常模水平。\n' +
              '特质表现：负性情绪（焦虑、易怒、抑郁）的触发阈值高、恢复速度快，面对压力、变化时情绪状态稳定，极少出现过度情绪化的情况。\n\n' +
              '3. 尽责性（C）：目标导向与弹性兼具\n' +
              '整体得分 62%，核心分面（胜任感、条理性）达 78%，处于中等偏上区间。\n' +
              '特质表现：既有责任感与规划能力，能有序推进事务；也不会因过度守规陷入僵化，可根据实际需求灵活调整行为节奏。\n\n' +
              '4. 宜人性（A）：温和且有边界\n' +
              '整体得分 53%，处于中等区间。\n' +
              '特质表现：能共情、协作，同时保持合理的自我边界，不会过度迁就他人，人际互动中呈现 "友善但不盲从" 的特征。\n\n' +
              '5. 外倾性（E）：社交能量聚焦深度互动\n' +
              '整体得分 47%，处于中等偏低区间。\n' +
              '特质表现：并非 "社恐"，而是社交需求以 "深度联结" 为主，偏好低刺激、少喧闹的环境，独处时能保持良好心理状态，社交能量分配更精简。'
    }
};

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
            var data = conclusions[test];
            if (!data) return;
            var cmap={'16PF':'16pf','EPQ-R':'epq','NEO-PI-R':'neo'};
            var ckey='conclusion_'+cmap[test];
            if(typeof DICT!=='undefined'&&DICT===EN&&DICT[ckey]){data={text:DICT[ckey]};}

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
window.refreshPhilButtons = function() {
    panels.forEach(function(p) {
        var b = document.getElementById(p.btnId);
        var s = document.getElementById(p.sectionId);
        var isOpen = s && s.classList.contains('visible');
        if (!b) return;
        if (isOpen) {
            var ct = (typeof DICT !== 'undefined' && DICT.phil_collapse) ? DICT.phil_collapse : '收起';
            b.innerHTML = '<span class="btn-icon">' + p.icon + '</span> ' + ct;
        } else {
            var lb = (typeof DICT !== 'undefined' && DICT[p.labelKey]) ? DICT[p.labelKey] : p.fallback;
            b.innerHTML = '<span class="btn-icon">' + p.icon + '</span> ' + lb;
        }
    });
};

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
        // Set initial labels from DICT
    panels.forEach(function(p) {
        var b = document.getElementById(p.btnId);
        if (b && typeof DICT !== 'undefined' && DICT[p.labelKey]) {
            b.innerHTML = '<span class="btn-icon">' + p.icon + '</span> ' + DICT[p.labelKey];
        }
    });

    panels.forEach(function (p) {
            var s = document.getElementById(p.sectionId);
            var b = document.getElementById(p.btnId);
            if (s) s.classList.remove('visible');
            if (b) { var lb = (typeof DICT !== 'undefined' && DICT[p.labelKey]) ? DICT[p.labelKey] : p.label; b.innerHTML = '<span class="btn-icon">' + p.icon + '</span> ' + (lb || p.fallback); }
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
                    link.style.color = link.getAttribute('href') === '#' + entry.target.id ? 'var(--primary)' : '';
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
        '<h3 style="font-size:1.15rem;color:var(--text);margin-bottom:8px;">' + ((typeof DICT!=='undefined'&&DICT.intimacy_title)?DICT.intimacy_title:'亲密度不够') + '</h3>' +
        '<p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;">' + ((typeof DICT!=='undefined'&&DICT.intimacy_desc)?DICT.intimacy_desc:'梦是灵魂的密语，只对足够亲近的人敞开。') + '</p>' +
        '<p style="color:var(--text-secondary);font-size:0.85rem;margin-top:8px;">' + ((typeof DICT!=='undefined'&&DICT.intimacy_tip)?DICT.intimacy_tip:'当前亲密度不足以查看此内容') + '</p>' +
        '<div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border);">' +
        '<span style="font-size:0.8rem;color:var(--text-secondary);">' + ((typeof DICT!=='undefined'&&DICT.intimacy_hint)?DICT.intimacy_hint:'💡 多聊聊、多见见，亲密度自然会升') + '</span>' +
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
