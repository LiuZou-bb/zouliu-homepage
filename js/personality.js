/* One catalogue owns both list and detail. File names are legacy, not test names. */
(function () {
    'use strict';
    var catalogue = {
        '16PF': { image: 'images/EPQ-R.jpg', title: 'personality_card_16pf', name: 'personality_16pf', intro: 'record_16pf_intro', points: [
            { title: 'record_16pf_1', body: 'record_16pf_1_body', scores: ['record_warmth', 'record_dominance'], values: ['3 / 4', '3.5 / 4'] },
            { title: 'record_16pf_2', body: 'record_16pf_2_body', scores: ['record_change', 'record_independence'], values: ['3.4 / 4', '3.3 / 4'] },
            { title: 'record_16pf_3', body: 'record_16pf_3_body', scores: ['record_liveliness', 'record_tension'], values: ['1.9 / 4', '1.2 / 4'] }
        ] },
        'EPQ-R': { image: 'images/16PF.jpg', title: 'personality_card_epq', name: 'personality_epq', intro: 'record_epq_intro', points: [
            { title: 'record_epq_1', body: 'record_epq_1_body', scores: ['record_e'], values: ['E = 11 · 52%'] },
            { title: 'record_epq_2', body: 'record_epq_2_body', scores: ['record_n'], values: ['N = 10 · 41%'] },
            { title: 'record_epq_3', body: 'record_epq_3_body', scores: ['record_p', 'record_l'], values: ['P = 7 · 30%', 'L = 11 · 55%'] }
        ] },
        'NEO-PI-R': { image: 'images/NEO-PI-R.jpg', title: 'personality_card_neo', name: 'personality_neo', intro: 'record_neo_intro', totals: [
            ['record_o', 'O', 132, 68], ['record_c', 'C', 100, 62], ['record_a', 'A', 102, 53], ['record_e', 'E', 91, 47], ['record_n', 'N', 50, 26]
        ], points: [
            { title: 'record_neo_1', body: 'record_neo_1_body', scores: ['record_values', 'record_aesthetics','record_ideas','record_actions'], values: ['27 · 84%', '25 · 78%','25 · 78%','16 · 50%'] },
            { title: 'record_neo_2', body: 'record_neo_2_body', scores: ['record_deliberation', 'record_order'], values: ['27 · 84%', '18 · 56%'] },
            { title: 'record_neo_3', body: 'record_neo_3_body', scores: ['record_neo_warmth','record_assertiveness','record_gregariousness','record_activity','record_n'], values: ['19 · 59%','19 · 59%','12 · 37%','11 · 34%','50 · 26%'] }
        ] }
    };
    function text(key) { return typeof DICT !== 'undefined' && DICT[key] || key; }
    function element(tag, className, key) {
        var el = document.createElement(tag); if (className) el.className = className;
        if (key) { el.dataset.i = key; el.textContent = text(key); } return el;
    }
    function refreshCards() {
        document.querySelectorAll('[data-test]').forEach(function (card) {
            var record = catalogue[card.dataset.test]; if (!record) return;
            var img = card.querySelector('img'); img.src = record.image; img.alt = text(record.name);
            card.setAttribute('aria-label', card.dataset.test + ' · ' + text(record.name));
            var title = element('h3'); title.textContent = card.dataset.test;
            var info = card.querySelector('.personality-info'); info.replaceChildren(title, element('p', '', record.name));
        });
    }
    function renderDetail(id, image, container) {
        var record = catalogue[id]; if (!record) return false;
        image.src = record.image; image.alt = text(record.name);
        var technical = element('small', 'record-technical'); technical.textContent = id;
        container.replaceChildren(technical, element('h2', 'record-title', record.title), element('p', 'record-intro', record.intro),element('p','record-self-note','record_self_note'));
        if (record.totals) {
            var chart = element('dl', 'record-chart');
            record.totals.forEach(function (total) {
                var row = element('div', 'record-chart-row');
                row.append(element('dt', '', total[0]));
                var value = element('dd'); value.textContent = total[1] + ' = ' + total[2] + ' · ' + total[3] + '%';
                var bar = element('span', 'record-bar'); bar.style.setProperty('--value', total[3] + '%'); bar.setAttribute('aria-hidden', 'true');
                row.append(value, bar); chart.append(row);
            });
        }
        record.points.forEach(function (point, index) {
            var block = element('section', 'record-point'); var number = element('span', 'record-number'); number.textContent = '0' + (index + 1);
            block.append(number, element('h3', '', point.title), element('p', '', point.body));
            var scores = element('dl', 'record-scores');
            point.scores.forEach(function (key, i) { var row = element('div'); row.append(element('dt', '', key)); var value = element('dd'); value.textContent = point.values[i]; row.append(value); scores.append(row); });
            var disclosure=element('details','record-score-disclosure');
            disclosure.append(element('summary','','record_score_toggle'),scores);
            block.append(disclosure); container.append(block);
        });
        if(chart)container.append(chart);
        container.append(element('p', 'record-values-note', id === '16PF' ? 'record_raw_note' : 'record_percent_note'), element('p', 'personality-note', 'personality_note'), element('p', 'personality-note', 'record_limit'));
        return true;
    }
    window.PersonalityRecords = { render: renderDetail, refresh: refreshCards };
    refreshCards();
})();
