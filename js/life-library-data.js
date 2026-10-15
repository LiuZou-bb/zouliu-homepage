/* From the user's supplied material. Played is not completed. GTA V records
   are combined at the user's request; private screenshots stay outside the site. */
(function () {
    'use strict';
    var root = 'images/life-library/';
    function book(id, title, titleEn, author, asset, crop) {
        return { id: id, title: title, titleEn: titleEn, author: author, image: asset ? root + asset + '.jpg' : null, crop: crop };
    }
    var reading = [
        book('white-nights', '白夜', 'White Nights', '陀思妥耶夫斯基', 'white-nights', [0, .127, 1, .746]),
        book('sophies-world', '苏菲的世界', "Sophie's World", '乔斯坦·贾德', 'sophies-world'),
        book('the-craft-of-writing', '写作是门手艺', 'The Craft of Writing', '刘军强', 'the-craft-of-writing'),
        book('me-and-the-temple-of-earth', '我与地坛', 'Me and the Temple of Earth', '史铁生', 'me-and-the-temple-of-earth'),
        book('thinking-fast-and-slow', '思考，快与慢', 'Thinking, Fast and Slow', '丹尼尔·卡尼曼', 'thinking-fast-and-slow'),
        book('introduction-to-jungian-psychology', '荣格心理学入门', 'Introduction to Jungian Psychology', '河合隼雄', 'introduction-to-jungian-psychology'),
        book('economics-in-one-lesson', '一课经济学', 'Economics in One Lesson', '亨利·黑兹利特', 'economics-in-one-lesson'),
        book('the-kite-runner', '追风筝的人', 'The Kite Runner', '卡勒德·胡赛尼', 'the-kite-runner'),
        book('how-to-read-a-book', '如何阅读一本书', 'How to Read a Book', '莫提默·J.艾德勒 / 查尔斯·范多伦', 'how-to-read-a-book'),
        book('relationship-bridge-to-the-soul', '亲密关系：通往灵魂的桥梁', 'Relationship: Bridge to the Soul', '克里斯多福·孟', 'relationship-bridge-to-the-soul'),
        book('introduction-to-psychology', '心理学导论：思想与行为的认识之路', 'Introduction to Psychology: Gateways to Mind and Behavior', 'Dennis Coon / John O. Mitterer', null),
        book('the-courage-to-be-disliked', '被讨厌的勇气', 'The Courage to Be Disliked', '岸见一郎 / 古贺史健', 'the-courage-to-be-disliked'),
        book('stray-birds', '飞鸟集', 'Stray Birds', '泰戈尔', 'tagore-poetry', [.067, .24, .395, .574]),
        book('the-crescent-moon', '新月集', 'The Crescent Moon', '泰戈尔', 'tagore-poetry', [.51, .24, .40, .574]),
        book('don-quixote', '堂吉诃德', 'Don Quixote', '塞万提斯', 'don-quixote'),
        book('social-psychology', '社会心理学', 'Social Psychology', 'David G. Myers', 'social-psychology'),
        book('think-again', '重新思考：知所未知的力量', 'Think Again', 'Adam Grant', 'think-again')
    ];
    var authorNames = ['Fyodor Dostoevsky', 'Jostein Gaarder', 'Liu Junqiang', 'Shi Tiesheng', 'Daniel Kahneman', 'Hayao Kawai', 'Henry Hazlitt', 'Khaled Hosseini', 'Mortimer J. Adler / Charles Van Doren', 'Christopher Moon', 'Dennis Coon / John O. Mitterer', 'Ichiro Kishimi / Fumitake Koga', 'Rabindranath Tagore', 'Rabindranath Tagore', 'Miguel de Cervantes', 'David G. Myers', 'Adam Grant'];
    var finishedBookIds = ['the-craft-of-writing', 'me-and-the-temple-of-earth', 'introduction-to-jungian-psychology', 'how-to-read-a-book', 'relationship-bridge-to-the-soul', 'introduction-to-psychology', 'the-courage-to-be-disliked', 'think-again'];
    reading.forEach(function (entry, index) {
        entry.authorEn = authorNames[index];
        entry.finished = finishedBookIds.indexOf(entry.id) !== -1;
    });
    var psychology = reading.find(function (entry) { return entry.id === 'introduction-to-psychology'; });
    psychology.edition = '13';
    var sociology = book('invitation-to-sociology', '与社会学同游：人文主义的视角', 'Invitation to Sociology: A Humanistic Perspective', '彼得·L.伯格', null);
    sociology.authorEn = 'Peter L. Berger'; sociology.finished = null;
    var toads = book('counselling-for-toads', '蛤蟆先生去看心理医生', 'Counselling for Toads: A Psychological Adventure', '罗伯特·戴博德', null);
    toads.authorEn = 'Robert de Board'; toads.finished = true;
    reading.push(sociology, toads);
    var suppliedBookCovers = {
        "the-crescent-moon": [
                "images/life-library/the-crescent-moon.jpg",
                1024,
                1500
        ],
        "invitation-to-sociology": [
                "images/life-library/invitation-to-sociology.jpg",
                1280,
                1926
        ],
        "don-quixote": [
                "images/life-library/don-quixote.jpg",
                800,
                800
        ],
        "sophies-world": [
                "images/life-library/sophies-world.png",
                293,
                428
        ],
        "the-craft-of-writing": [
                "images/life-library/the-craft-of-writing.png",
                302,
                431
        ],
        "me-and-the-temple-of-earth": [
                "images/life-library/me-and-the-temple-of-earth.png",
                287,
                439
        ],
        "thinking-fast-and-slow": [
                "images/life-library/thinking-fast-and-slow.png",
                292,
                431
        ],
        "introduction-to-jungian-psychology": [
                "images/life-library/introduction-to-jungian-psychology.png",
                295,
                406
        ],
        "economics-in-one-lesson": [
                "images/life-library/economics-in-one-lesson.png",
                299,
                414
        ],
        "the-kite-runner": [
                "images/life-library/the-kite-runner.png",
                304,
                424
        ],
        "the-courage-to-be-disliked": [
                "images/life-library/the-courage-to-be-disliked.png",
                306,
                456
        ],
        "stray-birds": [
                "images/life-library/stray-birds.png",
                310,
                424
        ],
        "counselling-for-toads": [
                "images/life-library/counselling-for-toads.png",
                304,
                447
        ],
        "introduction-to-psychology": [
                "images/life-library/introduction-to-psychology.jpg",
                800,
                800
        ],
        "social-psychology": [
                "images/life-library/social-psychology.jpg",
                600,
                800
        ],
        "think-again": [
                "images/life-library/think-again.jpg",
                330,
                495
        ]
};
    reading.forEach(function (entry) {
        var cover = suppliedBookCovers[entry.id]; if (!cover) return;
        entry.image = cover[0]; entry.imageWidth = cover[1]; entry.imageHeight = cover[2]; delete entry.crop;
    });
    function readingOrder(entry) { return entry.finished === true ? 0 : entry.finished === false ? 1 : 2; }
    reading.sort(function (a, b) { return readingOrder(a) - readingOrder(b); });
    var sheets = [
        { image: root + 'game-library-01.png', width: 2467, height: 1553, xs: [.007, .149, .291, .432, .574, .716, .858], ys: [.018, .348, .678], w: .125, h: .278 },
        { image: root + 'game-library-02.png', width: 2450, height: 1541, xs: [.010, .153, .297, .439, .582, .724, .867], ys: [.016, .348, .677], w: .126, h: .285 },
        { image: root + 'game-library-03.png', width: 2119, height: 1614, xs: [.004, .257, .510, .763], ys: [.012, .535], w: .223, h: .389 }
    ];
    function game(id, title, titleEn, hours, sheet, cell, minutes) {
        var s = sheets[sheet], columns = s.xs.length;
        return { id: id, title: title, titleEn: titleEn, hours: hours, minutes: minutes || 0, image: s.image,
            imageWidth: s.width, imageHeight: s.height,
            crop: [s.xs[cell % columns], s.ys[Math.floor(cell / columns)], s.w, s.h] };
    }
    var games = [
        game('naraka', '永劫无间', 'NARAKA: BLADEPOINT', 758.8, 0, 0),
        // 492.6 h + 168.6 h + 7 h 21 min = 668 h 33 min, merged by request.
        game('gta-v', '侠盗猎车手 V', 'Grand Theft Auto V', 668, 0, 1, 33),
        game('counter-strike', '反恐精英', 'Counter-Strike', 466.9, 0, 2),
        game('total-war-three-kingdoms', '全面战争：三国', 'Total War: THREE KINGDOMS', 206.4, 0, 3),
        game('forza-horizon-5', '极限竞速：地平线 5', 'Forza Horizon 5', 110.2, 0, 5),
        game('stellaris', '群星', 'Stellaris', 85.9, 0, 6),
        game('oxygen-not-included', '缺氧', 'Oxygen Not Included', 83.3, 0, 7),
        game('black-myth-wukong', '黑神话：悟空', 'Black Myth: Wukong', 73, 0, 8),
        game('cyberpunk-2077', '赛博朋克 2077', 'Cyberpunk 2077', 71.6, 0, 9),
        game('tale-of-immortal', '鬼谷八荒', 'Tale of Immortal', 50.7, 0, 10),
        game('persona-5-royal', '女神异闻录 5 皇家版', 'Persona 5 Royal', 42.4, 0, 11),
        game('slay-the-spire', '杀戮尖塔', 'Slay the Spire', 31.6, 0, 12),
        game('it-takes-two', '双人成行', 'It Takes Two', 28.7, 0, 13),
        game('the-binding-of-isaac', '以撒的结合：重生', 'The Binding of Isaac: Rebirth', 28.4, 0, 14),
        game('skyrim-special-edition', '上古卷轴 V：天际 特别版', 'The Elder Scrolls V: Skyrim Special Edition', 23.7, 0, 16),
        game('battlefield-v', '战地 V', 'Battlefield V', 18.6, 0, 17),
        game('cities-skylines', '都市：天际线', 'Cities: Skylines', 15, 0, 18),
        game('the-witcher-3', '巫师 3：狂猎', 'The Witcher 3: Wild Hunt', 14.4, 0, 19),
        game('dead-or-alive-6', '死或生 6', 'DEAD OR ALIVE 6', 14.2, 0, 20),
        game('euro-truck-simulator-2', '欧洲卡车模拟 2', 'Euro Truck Simulator 2', 13.1, 1, 0),
        game('mirror', 'Mirror', 'Mirror', 12.6, 1, 1),
        game('hello-love', '你好！我们还有场恋爱没谈', 'Hello! We Still Have a Romance to Talk About', 12.4, 1, 2),
        game('forza-horizon-4', '极限竞速：地平线 4', 'Forza Horizon 4', 11.4, 1, 3),
        game('love-is-all-around', '完蛋！我被美女包围了！', 'Love Is All Around', 11.3, 1, 4),
        game('knowledge-or-know-lady', '美女，请别影响我学习', 'Knowledge, or Know Lady', 11.1, 1, 5),
        game('tomb-raider', '古墓丽影', 'Tomb Raider', 9.3, 1, 7),
        game('mandate-of-heaven', '盛世天下', 'Mandate of Heaven', 9.2, 1, 8),
        game('emotional-scam', '情感反诈模拟器', 'Emotional Scam Simulator', 9.1, 1, 9),
        game('mount-and-blade-2', '骑马与砍杀 II：霸主', 'Mount & Blade II: Bannerlord', 48, 1, 10),
        game('chinese-parents', '中国式家长', 'Chinese Parents', 6.6, 1, 11),
        game('assassins-creed-origins', '刺客信条：起源', "Assassin's Creed Origins", 6.1, 1, 12),
        game('besiege', '围攻', 'Besiege', 5.1, 1, 13),
        game('vanity-fair', '名利游戏', 'Vanity Fair', 4.4, 1, 14),
        game('venus-vacation', '死或生：沙滩排球 维纳斯假期', 'DEAD OR ALIVE Xtreme Venus Vacation', 3.9, 1, 15),
        game('dont-starve-together', '饥荒联机版', "Don't Starve Together", 3.6, 1, 16),
        game('love-after-divorce', '恋爱从离婚开始', 'Love After Divorce', 3.6, 1, 17),
        game('apex-legends', 'Apex 英雄', 'Apex Legends', 3.5, 1, 18),
        game('red-dead-redemption-2', '荒野大镖客：救赎 2', 'Red Dead Redemption 2', 93, 2, 0, 40),
        game('kingdom-come-deliverance', '天国：拯救', 'Kingdom Come: Deliverance', 91, 2, 1, 40),
        game('civilization-6', '文明 VI', "Sid Meier's Civilization VI", 79, 2, 2, 31),
        game('borderlands-3', '无主之地 3', 'Borderlands 3', 28, 2, 3, 50),
        game('two-point-hospital', '双点医院', 'Two Point Hospital', 23, 2, 4, 34),
        game('hogwarts-legacy', '霍格沃茨之遗', 'Hogwarts Legacy', 6, 2, 6, 41),
        game('death-stranding', '死亡搁浅', 'Death Stranding', 4, 2, 7, 41)
    ];
    // Added from the user's current Top 3 and explicitly supplied playtimes.
    games.push({ id: 'expedition-33', title: '33号远征队', titleEn: 'Expedition 33', hours: 86, minutes: 0, image: 'images/life-library/expedition-33.png', imageWidth: 743, imageHeight: 350 });
    games.push({ id: 'kingdom-come-deliverance-2', title: '天国：拯救Ⅱ', titleEn: 'Kingdom Come: Deliverance II', hours: 140, minutes: 0, image: 'images/life-library/kingdom-come-deliverance-2.png', imageWidth: 749, imageHeight: 351 });
    games.sort(function (a, b) { return (b.hours + b.minutes / 60) - (a.hours + a.minutes / 60); });
    window.LifeLibraryData = { reading: reading, games: games };
})();
