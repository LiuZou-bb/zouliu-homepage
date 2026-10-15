/* Native-scroll title study. A Chinese unit is a complete vector component. */
(function () {
    'use strict';
    var root = document.documentElement, entries = [], frame = 0, remembered = new Map();
    var NS = 'http://www.w3.org/2000/svg';
    var heroStart=0,heroDone=false,heroVisible=false,heroLanguage='',heroReduced=false,heroDuration=1600;
    var exploreHeld=false,explorePassed=false,exploreWheelTime=0,exploreHeldUntil=0;
    function clamp(n) { return Math.max(0, Math.min(1, n)); }
    function reduced() { return root.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches; }
    function svg(tag) { return document.createElementNS(NS, tag); }
    function wrapPin(stage, className) {
        var pin = stage.querySelector('.' + className);
        if (!pin) {
            pin = document.createElement('div'); pin.className = className;
            while (stage.firstChild) pin.append(stage.firstChild);
            stage.append(pin);
        }
        return pin;
    }
    function add(title, stage, surface, kind, id) {
        if (!title || !stage || !surface || !title.getClientRects().length) return;
        var language = root.lang === 'en' ? 'en' : 'zh';
        var lines = kind === 'hero' ? Array.from(title.querySelectorAll('[data-i]')).map(function (n) { return n.textContent; }) : [title.textContent];
        if(kind==='explore'&&language==='en')lines=['EXP','LORE'];
        if (!lines.length || !lines.join('').trim()) return;
        var missing=lines.some(function(line,index){
            var style=kind==='hero'?(index?'soft':'heavy'):'title';
            var glyphs=window.ArtGlyphs[style]&&window.ArtGlyphs[style][language];
            return !glyphs||Array.from(line).some(function(char){return !/\s/.test(char)&&!glyphs[char];});
        });
        // New copy without rebuilt outlines falls back to real text, not holes.
        if(missing){stage.classList.remove('art-ready');return;}
        var node = svg('svg'); node.classList.add('art-surface'); node.setAttribute('aria-hidden', 'true'); node.setAttribute('focusable', 'false');
        var entry = { title:title, stage:stage, surface:surface, node:node, kind:kind, id:id, parts:[], forced:remembered.get(id)||false };
        var surfaceRect = surface.getBoundingClientRect(), titleRect = title.getBoundingClientRect();
        var width = surface.clientWidth, height = surface.clientHeight;
        if (!width || !height) return;
        node.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        var baseSize = parseFloat(getComputedStyle(title).fontSize), cursorY = titleRect.top - surfaceRect.top;
        if(kind==='explore')cursorY=height*.46-baseSize*(language==='en'?1.04:.48);
        var cursorLeft = Math.max(16, titleRect.left - surfaceRect.left);
        var available = Math.max(80, width - cursorLeft - 18), globalIndex = 0;
        lines.forEach(function (line, lineIndex) {
            var style = kind === 'hero' ? (lineIndex ? 'soft' : 'heavy') : 'title';
            var glyphs = window.ArtGlyphs[style][language];
            var fontSize = baseSize;
            var offset = kind === 'hero' && lineIndex ? (language === 'zh' ? fontSize*.78 : fontSize*.28) : 0;
            var units = Array.from(line).reduce(function (n, char) { return n + (glyphs[char] ? glyphs[char].advance/glyphs[char].units : .32); }, 0);
            var words = language === 'en' && kind === 'hero' && width < 500 ? line.split(' ') : [line];
            var rows = [], row = '';
            words.forEach(function (word) {
                var candidate = row ? row+' '+word : word;
                var rowWidth = Array.from(candidate).reduce(function (n,c) { return n+(glyphs[c] ? glyphs[c].advance/glyphs[c].units : .32); },0)*fontSize;
                if (row && rowWidth > available-offset) { rows.push(row); row=word; } else row=candidate;
            });
            rows.push(row);
            if (rows.length === 1 && units*fontSize > available-offset) fontSize = (available-offset)/units;
            rows.forEach(function (rowText) {
                var rowUnits=Array.from(rowText).reduce(function(n,c){return n+(glyphs[c]?glyphs[c].advance/glyphs[c].units:.32);},0);
                var tracking=kind==='explore'&&language==='en'?fontSize*.18:0;
                var x = kind==='explore' ? (width-rowUnits*fontSize-tracking*(Array.from(rowText).length-1))/2 : cursorLeft + offset;
                var baseline = cursorY + fontSize*.92;
                var lastLetter = -1;
                Array.from(rowText).forEach(function (char) {
                    var glyph = glyphs[char];
                    if (!glyph) { x += fontSize*.32; return; }
                    var punctuation = /[，。,]/.test(char);
                    if (!punctuation && !/\s/.test(char)) lastLetter = globalIndex;
                    glyph.parts.forEach(function (part) {
                        var group=svg('g'), local=svg('g'),path=svg('path'); path.setAttribute('d',part.path);local.append(path);group.append(local);node.append(group);
                        if(part.clip){var clip=svg('clipPath'),box=svg('rect'),clipId='art-clip-'+id+'-'+globalIndex+'-'+entry.parts.length;clip.id=clipId;clip.setAttribute('clipPathUnits','userSpaceOnUse');['x','y','width','height'].forEach(function(k,i){box.setAttribute(k,part.clip[i]);});clip.append(box);node.append(clip);path.setAttribute('clip-path','url(#'+clipId+')');}
                        var b=part.bounds, cx=(b[0]+b[2])/2, cy=(b[1]+b[3])/2, scale=fontSize/glyph.units;
                        local.setAttribute('transform','scale('+scale+' '+(-scale)+') translate('+(-cx)+' '+(-cy)+')');
                        group.dataset.component=part.component;
                        var stagger=kind==='explore'?(language==='en'?[0,-.05,.035,-.025,.045,-.035,.02][globalIndex%7]:(globalIndex%2?.065:-.065))*fontSize:0;
                        entry.parts.push({group:group, x:x+cx*scale, y:baseline-cy*scale+stagger, size:fontSize, char:char,
                            glyphIndex:globalIndex, attached:punctuation?lastLetter:-1, width:(b[2]-b[0])*scale, height:(b[3]-b[1])*scale});
                    });
                    x += glyph.advance/glyph.units*fontSize - (language==='en' ? fontSize*.025 : 0) + tracking;
                    globalIndex++;
                });
                cursorY += fontSize*1.28;
            });
        });
        if (!entry.parts.length) return;
        // Seeded continuous positions, never a shuffled row/column grid.
        var seed=kind==='hero'?37:83,anchors=new Map(),occupied=[];
        function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
        entry.parts.forEach(function(part){
            if(part.attached>=0&&anchors.has(part.attached)){
                var parent=anchors.get(part.attached);part.dx=parent.dx;part.dy=parent.dy;part.angle=parent.angle;return;
            }
            var safeX=12+Math.hypot(part.width,part.height)/2;
            var safeY=16+Math.hypot(part.width,part.height)/2;
            var sx,sy;
            if(kind==='hero'){
                // The whole automatic composition stays inside its title area.
                var radius=width<500?14:32;
                sx=part.x+(random()-.5)*radius*2;
                sy=part.y+(random()-.5)*radius*2;
                sx=Math.max(safeX,Math.min(width-safeX,sx));
                sy=Math.max(titleRect.top-surfaceRect.top+safeY*.4,Math.min(titleRect.bottom-surfaceRect.top-safeY*.3,sy));
            }else{
                var best=-1;
                for(var attempt=0;attempt<120;attempt++){
                    var px=safeX+random()*Math.max(1,width-safeX*2);
                    var py=Math.max(safeY,height*.16)+random()*Math.max(1,height*.66-safeY);
                    // Penalise visual alignments as well as collisions.
                    var score=occupied.reduce(function(min,q){
                        return Math.min(min,Math.hypot(px-q.x,py-q.y),
                            Math.abs(px-q.x)*3,Math.abs(py-q.y)*3);
                    },Infinity);
                    if(score>best){best=score;sx=px;sy=py;}
                }
            }
            occupied.push({x:sx,y:sy});
            part.dx=sx-part.x;part.dy=sy-part.y;part.angle=(random()-.5)*(kind==='hero'?8:20);
            if(!anchors.has(part.glyphIndex))anchors.set(part.glyphIndex,part);
        });
        title.classList.add('art-title-source'); stage.classList.add('art-ready');
        surface.append(node); entries.push(entry);
    }
    function refresh() {
        entries.forEach(function(e){remembered.set(e.id,e.forced);e.node.remove();e.title.classList.remove('art-title-source');}); entries=[];
        if (!window.ArtGlyphs) { document.querySelectorAll('.art-ready').forEach(function(stage){stage.classList.remove('art-ready');});return; }
        var hero=document.querySelector('#homeView .hero');
        if(hero){hero.classList.add('hero-gather');add(hero.querySelector('h1'),hero,hero.querySelector('.hero-layout'),'hero','hero');}
        var explore=document.getElementById('explore');
        if(explore)add(explore.querySelector('h2'),explore,explore.querySelector('.explore-word'),'explore','explore');
        // Life is intentionally static, both on the home index and inside.
        update();
    }
    function update() {
        frame=0;var small=reduced(), nav=parseFloat(getComputedStyle(root).getPropertyValue('--nav-height'))||80;
        entries.forEach(function(entry){
            var r=entry.stage.getBoundingClientRect();
            if(!r.height || r.bottom<0 || r.top>innerHeight){if(entry.kind==='hero')heroVisible=false;return;}
            var rangeStage=entry.kind==='explore'?entry.stage.querySelector('.explore-stage'):entry.stage;
            var rangeRect=rangeStage.getBoundingClientRect();
            var travel=Math.max(1,rangeStage.offsetHeight-entry.surface.offsetHeight);
            var progress=clamp(((entry.kind==='hero'?0:nav)-rangeRect.top)/travel);
            if(entry.kind==='home')travel=Math.max(1,entry.stage.offsetHeight-(innerHeight-nav));
            if(entry.kind==='home')progress=clamp((nav-r.top)/travel);
            var gather;
            if(entry.kind==='hero'){
                var titleRect=entry.title.getBoundingClientRect();
                var visible=titleRect.bottom>nav&&titleRect.top<innerHeight*.94;
                if(visible&&(!heroVisible||heroLanguage!==root.lang||(heroReduced&&!small))){
                    heroStart=performance.now();heroDone=false;entry.forced=false;heroLanguage=root.lang;
                }
                heroVisible=visible;
                if(small||entry.forced)heroDone=true;
                gather=heroDone?1:clamp((performance.now()-heroStart)/heroDuration);
                if(gather===1)heroDone=true;else schedule();
            }else gather=1;
            var eased=gather*gather*(3-2*gather);
            // The gathered word opens into a quiet perimeter, and stays there
            // for every exhibit. It is not another page sliding out above.
            var release=entry.kind==='explore'?clamp((progress-.16)/.84):0;
            release=release*release*(3-2*release);
            if(small&&entry.kind==='explore')release=progress>0?1:0;
            if(entry.kind==='explore'){
                entry.surface.style.setProperty('--perimeter-opacity',String(1-release*.85));
                entry.surface.querySelector('span').style.opacity=String(1-release);
            }
            entry.stage.dataset.gatherProgress=gather.toFixed(4);
            entry.stage.style.setProperty('--gather-content',small||entry.forced?'1':String(clamp((progress-.65)/.2)));
            entry.parts.forEach(function(part,index){
                var q=1-eased;
                var x=part.x+part.dx*q,y=part.y+part.dy*q,scale=1;
                if(entry.kind==='explore'){
                    var anchors=[[.09,.10],[.88,.12],[.13,.88],[.88,.87],[.52,.08],[.08,.50],[.92,.52]];
                    var anchor=anchors[index%anchors.length];
                    x+=(entry.surface.clientWidth*anchor[0]-x)*release;
                    y+=(entry.surface.clientHeight*anchor[1]-y)*release;
                    scale=1-release*.53;
                }
                part.group.setAttribute('transform','translate('+x.toFixed(3)+' '+y.toFixed(3)+') rotate('+(part.angle*q).toFixed(3)+') scale('+scale.toFixed(3)+')');
            });
        });
        heroReduced=small;
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(update);}
    function finishVisible(){entries.forEach(function(e){var r=e.stage.getBoundingClientRect();if(r.top<innerHeight*.55&&r.bottom>innerHeight*.3)e.forced=true;});update();}
    function holdExplore(event){
        var home=document.getElementById('homeView'),stage=document.querySelector('#explore .explore-stage'),surface=document.querySelector('#explore .explore-word');
        if(!home||home.hidden||!stage||!surface||reduced()||event.ctrlKey||event.target.closest('.navbar,[role="dialog"],input,textarea,select'))return;
        var delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
        if(Math.abs(delta)<12||Math.abs(delta)<Math.abs(event.deltaX))return;
        var nav=parseFloat(getComputedStyle(root).getPropertyValue('--nav-height'))||80;
        var stop=Math.ceil(stage.getBoundingClientRect().top+scrollY-nav);
        var now=performance.now(),distinct=now-exploreWheelTime>180;exploreWheelTime=now;
        if(scrollY<stop-8){exploreHeld=false;explorePassed=false;}
        else if(scrollY>stop+8){exploreHeld=false;explorePassed=true;}
        if(delta<0){exploreHeld=false;return;}
        if(exploreHeld){
            if(distinct||now>=exploreHeldUntil){exploreHeld=false;explorePassed=true;return;}
            event.preventDefault();return;
        }
        if(!explorePassed&&scrollY<=stop+1&&scrollY+delta>=stop){
            event.preventDefault();scrollTo({top:stop,behavior:'instant'});exploreHeld=true;exploreHeldUntil=now+450;schedule();
        }
    }
    window.ArtTitles={refresh:refresh,update:schedule,finish:finishVisible};
    addEventListener('scroll',schedule,{passive:true});
    var resizeTimer;addEventListener('resize',function(){clearTimeout(resizeTimer);resizeTimer=setTimeout(refresh,120);},{passive:true});
    document.addEventListener('DOMContentLoaded',refresh,{once:true});
    document.addEventListener('exhibition:route',function(){if(document.getElementById('homeView').hidden)heroVisible=false;refresh();});
    // A wheel gesture no longer completes the hero prematurely. At the next
    // scene, briefly stop on the complete word. Continuous input can then
    // release it toward the perimeter without waiting for a silent interval.
    addEventListener('wheel',holdExplore,{passive:false,capture:true});
    document.addEventListener('keydown',function(event){if(event.key==='Escape'||event.key==='Tab')finishVisible();});
    document.addEventListener('focusin',function(event){if(event.target.matches('a:focus-visible,button:focus-visible')&&event.target.closest('.art-ready'))finishVisible();});
    if(document.fonts)document.fonts.ready.then(refresh);
})();
