// ============================================================
// Interview Questions — 23 questions for meaningful conversation
// ============================================================

var interviewQuestions = [
    { zh: "最近一次让你不由自主跟着哼唱或扭动身体的，是哪首歌？", en: "What was the last song you found yourself humming or moving to without thinking?" },
    { zh: "最近有没有尝试什么新东西——哪怕只是换了一条上班路线或做了一道新菜？感觉怎么样？", en: "Have you tried anything new recently\u2014even just a different commute route or a new recipe? How was it?" },
    { zh: "过去几周里，有没有发生什么让你觉得\u201c嘿，还挺走运\u201d的小事？", en: "Over the past few weeks, has anything happened that made you think, \u201chey, that was pretty lucky\u201d?" },
    { zh: "目前最让你着迷、花时间最多的一件事是什么？是怎么被它\u201c钩住\u201d的？", en: "What\u2019s the one thing you\u2019re most obsessed with right now? How did it hook you?" },
    { zh: "有没有什么技能或爱好是你一直心痒想学但还没开始的？它哪里吸引你？", en: "Is there a skill or hobby you\u2019ve been itching to learn but haven\u2019t started? What draws you to it?" },
    { zh: "最近有没有学到什么让你\u201c哇\u201d出来的新知识或观点？", en: "Have you recently learned anything new that made you go \u201cwow\u201d?" },
    { zh: "如果突然获得一个月带薪假期，预算充足，你最想用它来实现什么？", en: "If you suddenly had a month of paid leave with ample budget, what would you most want to do with it?" },
    { zh: "\u201c永远精力旺盛的身体\u201dvs\u201c永远平和睿智的心智\u201d，必须二选一，你选哪个？为什么？", en: "\u201cA body with boundless energy forever\u201d vs \u201ca mind of eternal peace and wisdom\u201d\u2014you must pick one. Which? Why?" },
    { zh: "有什么人事物，是你绝对、任何时候都不能拿来开玩笑的？", en: "What people, things, or topics can you absolutely never joke about, under any circumstances?" },
    { zh: "说出你当下最感恩的三件事。", en: "Name the three things you\u2019re most grateful for right now." },
    { zh: "在一段亲近关系里，你最看重的核心特质是什么？", en: "In a close relationship, what core quality do you value most?" },
    { zh: "对你来说，爱意味着什么？不用下定义，可以说说感受或画面。", en: "What does love mean to you? No need for a definition\u2014just feelings or images." },
    { zh: "你认为什么样的\u201c共同经历\u201d最能巩固一段关系？", en: "What kind of \u201cshared experience\u201d do you think most strengthens a relationship?" },
    { zh: "童年中最明亮、最快活的一段记忆是什么？", en: "What is your brightest, happiest childhood memory?" },
    { zh: "关于你的家庭，你觉得最独特或最想分享的一点是什么？", en: "What is the most unique or share-worthy aspect of your family?" },
    { zh: "你现在如何定义\u201c成功\u201d？和十年前相比，最大的变化是什么？", en: "How do you define \u201csuccess\u201d now? What\u2019s changed most compared to ten years ago?" },
    { zh: "完成这个句子：\u201c我希望有一天，我能……\u201d——以及，为了这个\u201c有一天\u201d，你愿意在当下做出最大的取舍是什么？", en: "Complete this sentence: \u201cI hope that one day, I can\u2026\u201d\u2014and, what is the biggest trade-off you\u2019re willing to make now for that \u201cone day\u201d?" },
    { zh: "你目前最大的个人挑战是什么？正用怎样的心态应对它？", en: "What is your biggest personal challenge right now? What mindset are you using to face it?" },
    { zh: "当你压力大或情绪低落时，你通常怎么照顾自己？", en: "When you\u2019re stressed or feeling low, how do you usually take care of yourself?" },
    { zh: "分享一个最近发生的、有点尴尬但回想起来挺好笑的糗事。", en: "Share a recent embarrassing-but-funny-in-hindsight moment." },
    { zh: "家中失火，家人宠物皆安全，你可以取回一样东西，会取什么？为什么？", en: "Your house is on fire, family and pets are safe. You can grab one item. What do you take? Why?" },
    { zh: "对于衰老，你最大的恐惧和最大的期待分别是什么？", en: "What is your greatest fear and greatest anticipation about aging?" },
    { zh: "关于死亡，你有什么想法？它有没有影响你\u201c如何活着\u201d？", en: "What are your thoughts on death? Has it influenced how you live?" },
];

window.renderInterview = function() {
    var container = document.getElementById('interviewQuestions');
    if (!container) return;
    container.innerHTML = '';
    var isEn = (typeof DICT !== 'undefined' && DICT === EN);
    window.interviewQuestions.forEach(function(q, i) {
        var div = document.createElement('div');
        div.className = 'interview-item';
        div.textContent = (i + 1) + '. ' + (isEn ? q.en : q.zh);
        container.appendChild(div);
    });
    var invite = document.createElement('p');
    invite.className = 'interview-invite';
    invite.innerHTML = (typeof DICT !== 'undefined' && DICT.interview_invite_html) ? DICT.interview_invite_html : '';
    container.appendChild(invite);
};

window.refreshInterviewToggle = function() {
    var btn = document.getElementById('interviewToggle');
    var list = document.getElementById('interviewQuestions');
    if (!btn || !list) return;
    var open = list.style.display === 'block';
    btn.textContent = (typeof DICT!=='undefined' && (open ? DICT.interview_collapse : DICT.interview_expand)) || (open ? '\u6536\u8d77 23 \u4e2a\u95ee\u9898 \u25b4' : '\u5c55\u5f00 23 \u4e2a\u95ee\u9898 \u25be');
};

(function() {
    var btn = document.getElementById('interviewToggle');
    var list = document.getElementById('interviewQuestions');
    if (!btn || !list) return;
    refreshInterviewToggle();
    btn.onclick = function() {
        if (list.style.display === 'none' || list.style.display === '') {
            list.style.display = 'block';
        } else {
            list.style.display = 'none';
        }
        refreshInterviewToggle();
    };
})();