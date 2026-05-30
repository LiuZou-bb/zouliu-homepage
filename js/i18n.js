// ============================================================
// i18n Engine �?Data-driven translation
// Data: js/zh.js  js/en.js
// ============================================================

var DICT = ZH; // default

// Special-case selectors: elements that need non-textContent handling
// 'tn' = first textNode only  'h' = innerHTML  'btn' = lang button
var MAP = [
    ['.hero h1', 'hero_hi', 'tn'],
    ['.hero-subtitle', 'hero_sub', 'h'],
    ['#langBtn', null, 'btn']
];

function applyI18n() {
    document.documentElement.lang = (DICT === EN) ? 'en' : 'zh';

    // 0. Document title (page_title)
    if (DICT.page_title) document.title = DICT.page_title;

    // 1. Process all data-i elements (covers 95% of translations)
    document.querySelectorAll('[data-i]').forEach(function(el) {
        var key = el.getAttribute('data-i');
        if (DICT[key]) el.textContent = DICT[key];
    });

    // 2. Process placeholder attributes
    document.querySelectorAll('[data-i-placeholder]').forEach(function(el) {
        var key = el.getAttribute('data-i-placeholder');
        if (DICT[key]) el.placeholder = DICT[key];
    });

    // 2b. Process data-i-aria attributes
    document.querySelectorAll('[data-i-aria]').forEach(function(el) {
        var key = el.getAttribute('data-i-aria');
        if (DICT[key]) el.setAttribute('aria-label', DICT[key]);
    });

    // 2d. Process data-i-alt attributes
    document.querySelectorAll('[data-i-alt]').forEach(function(el) {
        var key = el.getAttribute('data-i-alt');
        if (DICT[key]) el.setAttribute('alt', DICT[key]);
    });

    // 2c. Process data-i-inner attributes (innerHTML for formatted text)
    document.querySelectorAll('[data-i-inner]').forEach(function(el) {
        var key = el.getAttribute('data-i-inner');
        if (DICT[key]) el.innerHTML = DICT[key];
    });

    // 3. Special-case MAP (textNode, innerHTML, button)
    MAP.forEach(function(item) {
        var sel = item[0], key = item[1], type = item[2];
        if (type === 'btn') {
            var lb = document.getElementById('langBtn');
            if (lb) lb.textContent = (DICT === EN) ? '\u4e2d' : 'EN';
            return;
        }
        var el = document.querySelector(sel);
        if (!el || !DICT[key]) return;
        if (type === 'tn') {
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === 3) {
                    el.childNodes[i].textContent = DICT[key] + ' ';
                    break;
                }
            }
        } else if (type === 'h') {
            el.innerHTML = DICT[key];
        }
    });
}

// Init
(function() {
    var saved = localStorage.getItem('lang');
    DICT = (saved === 'en') ? EN : ZH;
})();

document.addEventListener('DOMContentLoaded', function() {
    applyI18n();
    if (typeof refreshPhilButtons === 'function') refreshPhilButtons();
    if (typeof renderMoments === 'function') renderMoments();
    var lb = document.getElementById('langBtn');
    if (lb) {
        lb.addEventListener('click', function() {
            DICT = (DICT === EN) ? ZH : EN;
            localStorage.setItem('lang', DICT === EN ? 'en' : 'zh');
            applyI18n();
            if (typeof refreshPhilButtons === 'function') refreshPhilButtons();
            if (typeof renderMoments === 'function') renderMoments();
        });
    }
});