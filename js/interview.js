// ============================================================
// Interview Questions — 20 questions for meaningful conversation
// ============================================================

var interviewQuestions = [
    { zh: "今天聊完以后，你希望自己获得什么，或者希望我更理解你什么？", en: "After our conversation today, what do you hope to gain—or what do you hope I will understand better about you?" },
    { zh: "最近哪个瞬间让你觉得自己很有生命力、很放松，或者“这才是我”？", en: "What recent moment made you feel fully alive, deeply relaxed, or simply, “this is who I am”?" },
    { zh: "你现在最着迷、最愿意投入时间的事情是什么？它是怎样吸引你的？", en: "What are you most fascinated by and willing to spend time on right now? What drew you in?" },
    { breakBefore: true, zh: "最近有没有一段经历或一个观点，真正改变了你原来的看法？", en: "Has a recent experience or idea genuinely changed the way you used to see something?" },
    { zh: "有什么事情即使没人要求、没有奖励，你仍然愿意主动花时间去做？", en: "What do you willingly spend time doing even when no one asks you to and there is no reward?" },
    { zh: "如果获得一个月完全自由的时间，你希望大多数普通日子怎样度过？为什么？", en: "If you had one completely free month, how would you want most ordinary days to unfold? Why?" },
    { zh: "你现在怎样理解“成功”？这个理解是被哪段经历改变的？", en: "How do you understand “success” now? What experience changed that understanding?" },
    { breakBefore: true, zh: "你想成为怎样的人？最近有哪些实际行为证明你正在靠近他，又有哪些行为与他矛盾？", en: "What kind of person do you want to become? What recent actions show that you are moving toward that person, and what actions contradict it?" },
    { zh: "你身上有没有两个经常彼此拉扯的部分？例如自由与稳定、亲近与独立、感性与理性。你通常如何在它们之间做决定？", en: "Are there two parts of you that often pull in different directions—for example freedom and stability, closeness and independence, feeling and reason? How do you decide between them?" },
    { zh: "有哪些东西是你不愿为了成功、关系或者别人的认可而牺牲的？", en: "What are you unwilling to sacrifice for success, a relationship, or someone else’s approval?" },
    { breakBefore: true, zh: "最近一次你真正感觉“这个人理解我”，发生了什么？对方具体做了什么？", en: "Think of the last time you truly felt, “this person understands me.” What happened, and what did they actually do?" },
    { zh: "在亲近关系中，你最需要的是什么？能否讲一个你确实感受到它，或者没有得到它的具体场景？", en: "What do you need most in a close relationship? Can you describe a specific moment when you felt it—or when it was missing?" },
    { zh: "当关系发生冲突时，你通常会解释、回避、攻击、讨好，还是立刻解决问题？最近一次真实情况是什么？", en: "When conflict happens in a relationship, do you tend to explain, withdraw, attack, please, or solve it immediately? What happened the last time?" },
    { zh: "冲突之后，什么样的回应能帮助你重新靠近一个人？", en: "After conflict, what kind of response helps you feel close to someone again?" },
    { zh: "对你来说，爱更像一种什么感受、画面或行动？它和你过去理解的爱有什么不同？", en: "What does love feel, look, or act like to you? How is that different from how you understood love in the past?" },
    { breakBefore: true, zh: "如果愿意，分享一段对你影响很深的童年记忆。它可以明亮，也可以复杂。", en: "If you are willing, share a childhood memory that deeply affected you. It can be bright, complicated, or both." },
    { zh: "小时候，你在家庭或集体里经常承担怎样的角色？这个角色今天还在影响你吗？", en: "What role did you often take on in your family or group as a child? Does that role still shape you today?" },
    { zh: "有哪些从家庭、学校或社会继承来的观念，是你决定继续保留的？又有哪些正在被你重新改写？", en: "Which beliefs inherited from family, school, or society have you chosen to keep, and which are you actively rewriting?" },
    { breakBefore: true, zh: "你现在愿意分享的一个重要挑战是什么？你正在怎样应对它？压力较大时，你通常怎样照顾自己？", en: "What important challenge are you willing to share right now? How are you responding to it, and how do you care for yourself when the pressure grows?" },
    { zh: "如果一年后的生活更接近你真正想要的状态，一个普通工作日会是什么样子？你愿意为它持续投入什么，又不愿失去什么？", en: "If your life were more aligned with what you truly want a year from now, what would an ordinary workday look like? What would you keep investing in, and what would you refuse to lose?" },
];

window.renderInterview = function() {
    var container = document.getElementById('interviewQuestions');
    if (!container) return;
    container.innerHTML = '';
    var isEn = (typeof DICT !== 'undefined' && DICT === EN);
    window.interviewQuestions.forEach(function(q, i) {
        var div = document.createElement('div');
        div.className = 'interview-item' + (q.breakBefore ? ' interview-stage-gap' : '');
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
    btn.textContent = (typeof DICT!=='undefined' && (open ? DICT.interview_collapse : DICT.interview_expand)) || (open ? '\u6536\u8d77 20 \u4e2a\u95ee\u9898 \u25b4' : '\u5c55\u5f00 20 \u4e2a\u95ee\u9898 \u25be');
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
