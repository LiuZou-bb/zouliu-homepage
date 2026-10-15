/* One stationary stage. Titles dissolve; only the image layers travel. */
(function () {
    'use strict';
    var view=document.getElementById('homeView'),host=document.getElementById('homeExhibits'),explore=document.getElementById('explore');
    if(!view||!host||!explore)return;
    var chapters=[
        {id:'meet',route:'about',title:'ex_meet',description:'ex_meet_short',color:[42,47,43]},
        {id:'thoughts',route:'philosophy',title:'home_thoughts_title',description:'ex_thoughts_short',color:[49,61,72]},
        {id:'life',route:'skills',title:'nav_skills',description:'ex_life_short',color:[66,53,42]},
        {id:'limits',route:'growthEdges',title:'nav_growth',description:'ex_limits_short',color:[35,38,47]},
        {id:'dialogue',route:'books',title:'ex_books',description:'book_chapter_intro',color:[37,52,48]}
    ];
    var active=0,slides=[],frame=0,serial=0,hideTimer=0,bookFrame=0,bookProgress=0,bookState='closed';
    var lastWheel=0,wheelDirection=0,wheelDistance=0,wheelConsumed=false,acceptedWheel=0,touchStart=null,backgroundSlot=0,lastReduced=null,transitionUntil=0,engaged=false;
    var backdrops=Array.from(explore.querySelectorAll('.explore-backdrop')),backgrounds=[];
    function t(key){return DICT[key]||key;}
    function reduced(){return document.documentElement.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;}
    function clamp(n){return Math.max(0,Math.min(1,n));}
    function navHeight(){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'))||80;}
    function el(tag,cls,value){var n=document.createElement(tag);n.className=cls;if(value!==undefined)n.textContent=value;return n;}
    function post(id){return (window.momentsPosts||[]).find(function(p){return p.dir===id;});}
    function picture(src,cls,alt){
        var box=el('span','exhibit-piece '+cls),img=document.createElement('img');img.src=src;img.alt=alt;img.loading='lazy';img.decoding='async';
        if(window.setPublicImageSize)window.setPublicImageSize(img,src);box.append(img);return box;
    }
    function book(){
        var object=el('div','exhibit-book'),spread=el('div','book-spread');spread.id='homeBookPages';spread.inert=true;
        [['written','books','book_written','book_written_intro','book_written_open'],['unwritten','interview','book_unwritten','book_unwritten_intro','book_unwritten_open']].forEach(function(page){
            var side=el('a','book-page book-page--'+page[0]);side.href='#'+page[1];
            side.append(el('small','book-page-number',page[0]==='written'?'01':'02'),el('h4','',t(page[2])),el('p','',t(page[3])),el('span','book-page-open',t(page[4])+' ↗'));spread.append(side);
        });object.append(spread);
        for(var n=11;n>=0;n--){var leaf=el('div','book-leaf');leaf.dataset.leaf=n;leaf.setAttribute('aria-hidden','true');leaf.append(el('span','leaf-face leaf-front'),el('span','leaf-face leaf-back'));object.append(leaf);}
        var cover=el('div','book-cover');cover.setAttribute('aria-hidden','true');
        var front=el('div','cover-face cover-front');
        var ornament=el('div','book-cover-ornament');
        ornament.innerHTML='<svg viewBox="0 0 360 360" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.3"><path d="M66 270V154a114 114 0 0 1 228 0v116"/><path d="M77 270V154a103 103 0 0 1 206 0v116" opacity=".35"/><path d="M55 270h250M55 283h250" opacity=".55"/><circle cx="180" cy="116" r="29" class="book-cover-sun"/><path d="M180 267c-17-30-15-57 0-82s17-54 0-75"/><path d="M177 236c-34-2-52-20-56-47 30 2 48 17 56 47ZM182 212c34-3 53-20 57-48-30 3-49 19-57 48ZM185 178c-30-5-45-21-46-45 25 4 41 19 46 45Z"/><path d="M121 189l56 47m62-72-57 48m-43-79 46 45" opacity=".4"/><path d="M92 259c24-12 48-12 72 0m32 0c24-12 48-12 72 0M93 300c58-9 116-9 174 0" opacity=".4"/></g><circle cx="180" cy="318" r="2" fill="currentColor"/></svg>';
        var footer=el('div','book-cover-colophon');footer.append(el('em','',t('book_cover_note')),el('span','book-cover-author',t('hero_name')));
        front.append(el('small','book-cover-label','THE BOOK OF LIFE'),el('span','book-cover-title',t('book_cover_title')),ornament,footer);
        cover.append(front,el('div','cover-face cover-back'));object.append(cover);
        // Use the same complete page-turn sequence for clicks and scrolling.
        var opener=el('button','book-opener');opener.type='button';
        opener.setAttribute('aria-label',t('book_scroll_open'));opener.setAttribute('aria-controls',spread.id);opener.setAttribute('aria-expanded','false');
        opener.addEventListener('click',startBook);object.append(opener);
        return object;
    }
    function paintBook(progress){
        var article=slides[4];if(!article)return;bookProgress=clamp(progress);
        var object=article.querySelector('.exhibit-book'),open=clamp(bookProgress/.26);
        var fullyOpen=bookProgress>=1,spread=object.querySelector('.book-spread'),opener=object.querySelector('.book-opener');
        var moveFocus=fullyOpen&&document.activeElement===opener;
        article.dataset.bookProgress=bookProgress.toFixed(4);article.classList.toggle('is-book-open',fullyOpen);
        spread.inert=!fullyOpen;opener.hidden=fullyOpen;opener.setAttribute('aria-expanded',String(fullyOpen));
        opener.setAttribute('aria-busy',String(bookState==='opening'&&!fullyOpen));
        if(moveFocus)spread.querySelector('a').focus({preventScroll:true});
        object.style.setProperty('--book-shift',(-25*(1-open))+'%');
        var cover=object.querySelector('.book-cover');cover.style.transform='rotateY('+(-180*open)+'deg)';cover.style.visibility=open>=.995?'hidden':'visible';
        object.querySelectorAll('.book-leaf').forEach(function(leaf){var flip=clamp((bookProgress-.13-Number(leaf.dataset.leaf)*.035)/.30);leaf.style.transform='rotateY('+(-180*flip)+'deg)';leaf.style.visibility=flip>=.995?'hidden':'visible';leaf.style.zIndex=String(flip<.5?30-Number(leaf.dataset.leaf):Number(leaf.dataset.leaf)+2);});
        object.querySelector('.book-spread').style.opacity=String(clamp((bookProgress-.28)/.20));
        article.querySelector('.exhibit-open').textContent=t(fullyOpen?'book_choose_page':'book_scroll_open')+(fullyOpen?' ↗':'');
    }
    function finishBook(){cancelAnimationFrame(bookFrame);bookFrame=0;bookState='open';paintBook(1);}
    function startBook(){
        if(bookState==='opening'||bookState==='open')return;
        cancelAnimationFrame(bookFrame);bookState='opening';if(reduced()){finishBook();return;}
        var start=performance.now(),token=serial,from=bookProgress;
        function tick(now){if(token!==serial||view.hidden||active!==4){bookFrame=0;return;}paintBook(from+(1-from)*clamp((now-start)/2000));if(bookProgress<1)bookFrame=requestAnimationFrame(tick);else{bookFrame=0;bookState='open';}}
        bookFrame=requestAnimationFrame(tick);
    }
    function closeBook(){
        if(reduced())return false;
        if(bookState==='closing')return true;
        if(bookState==='closed'&&bookProgress===0)return false;
        cancelAnimationFrame(bookFrame);bookState='closing';
        var start=performance.now(),from=bookProgress,token=serial,duration=Math.max(450,1100*from);
        function tick(now){
            if(token!==serial||view.hidden||active!==4){bookFrame=0;return;}
            var p=clamp((now-start)/duration);paintBook(from*(1-p*p*(3-2*p)));
            if(p<1)bookFrame=requestAnimationFrame(tick);else{bookFrame=0;bookState='closed';}
        }
        bookFrame=requestAnimationFrame(tick);return true;
    }
    function freeze(node){var style=getComputedStyle(node),opacity=style.opacity,transform=style.transform;node.getAnimations().forEach(function(a){a.cancel();});node.style.opacity=opacity;node.style.transform=node.classList.contains('exhibit-title')?'':transform;}
    function animate(node,frames,options){if(reduced()){Object.assign(node.style,frames[frames.length-1]);return;}node.animate(frames,Object.assign({duration:1150,easing:'cubic-bezier(.22,.68,.2,1)',fill:'forwards'},options));}
    function loadBackgrounds(){var road=post('2025.11.1'),temple=post('2024.11.16');backgrounds=['images/NEO-PI-R.jpg',road&&road.imgs[0],temple&&temple.imgs[2],null,null];}
    function background(index,instant){
        var src=backgrounds[index],old=backdrops[backgroundSlot],next=backdrops[1-backgroundSlot];backdrops.forEach(freeze);backgroundSlot=1-backgroundSlot;
        if(src)next.src=src;next.style.opacity='0';next.style.transform='translateY(10%)';
        animate(old,[{opacity:old.style.opacity,transform:old.style.transform},{opacity:0,transform:'translateY(-10%)'}],{duration:instant?0:1200});
        animate(next,[{opacity:0,transform:'translateY(10%)'},{opacity:src?1:0,transform:'translateY(0)'}],{duration:instant?0:1200});
        explore.style.setProperty('--explore-bg','rgb('+chapters[index].color.join(',')+')');explore.classList.toggle('is-book-atmosphere',index===4);
    }
    function controls(){
        // No visible navigation buttons. Keep keyboard/swipe navigation and a
        // polite screen-reader announcement independent of the artwork.
        var status=el('span','gallery-status',String(active+1).padStart(2,'0')+' / 05');status.setAttribute('aria-live','polite');host.append(status);
    }
    function render(){
        cancel();var fragment=document.createDocumentFragment();
        chapters.forEach(function(chapter,index){
            var article=el('article','home-exhibit home-exhibit--'+chapter.id);article.dataset.homeId=chapter.id;
            var link=el(chapter.id==='dialogue'?'div':'a','home-exhibit-link');if(link.tagName==='A')link.href='#'+chapter.route;link.dataset.homeLink=chapter.id;
            var titleId='homeTitle-'+chapter.id;link.setAttribute('aria-labelledby',titleId);
            var meta=el('div','exhibit-meta');meta.append(el('span','',String(index+1).padStart(2,'0')+' / 05'),el('span','',t('ex_label')));
            var composition=el('div','exhibit-composition'),visual=el('div','exhibit-visual');composition.append(visual);
            if(chapter.id==='meet'){
                var thirdRecord=document.querySelector('.personality-card[data-test="NEO-PI-R"] img');if(thirdRecord)visual.append(picture(thirdRecord.getAttribute('src'),'piece-portrait piece-record-c',thirdRecord.alt));
                ['EPQ-R','16PF'].forEach(function(id,n){var img=document.querySelector('.personality-card[data-test="'+id+'"] img');if(img)visual.append(picture(img.getAttribute('src'),'piece-record-'+(n?'b':'a'),img.alt));});
            }else if(chapter.id==='thoughts'){
                var road=post('2025.11.1');if(road)visual.append(picture(road.imgs[0],'piece-road',DICT===EN?road.titleEn:road.title));
            }else if(chapter.id==='life'){
                var temple=post('2024.11.16');if(temple)[2,0,1].forEach(function(n,i){visual.append(picture(temple.imgs[n],'piece-temple-'+['a','b','c'][i],DICT===EN?temple.titleEn:temple.title));});
            }else if(chapter.id==='limits'){
                ['growth_overthink_title','growth_perfection_title','growth_acceptance_title'].forEach(function(key,n){var item=el('span','exhibit-limit');item.append(el('small','','0'+(n+1)),el('span','',t(key)));visual.append(item);});
            }else visual.append(book());
            var title=el('h3','exhibit-title',t(chapter.title));title.id=titleId;composition.append(title);
            var footer=el('div','exhibit-footer');footer.append(el('span','',t(chapter.description)),el('span','exhibit-open',t(chapter.id==='dialogue'?'book_scroll_open':'v4_open')+(chapter.id==='dialogue'?'':' ↗')));
            link.append(meta,composition,footer);article.append(link);fragment.append(article);
        });
        host.replaceChildren(fragment);slides=Array.from(host.querySelectorAll('.home-exhibit'));controls();loadBackgrounds();select(active,true);paintBook(bookProgress);schedule();if(window.ArtTitles)window.ArtTitles.refresh();
    }
    function select(index,instant){
        if(index<0||index>=chapters.length)return;
        var previous=active;active=index;serial++;clearTimeout(hideTimer);cancelAnimationFrame(bookFrame);bookFrame=0;
        // Every chapter must complete its title entrance before another
        // forward gesture can replace it, even during a rapid wheel burst.
        transitionUntil=instant||reduced()?0:performance.now()+1450;
        var token=serial,travel=Math.min(300,host.clientHeight*.38),direction=index>=previous?1:-1;
        slides.forEach(function(article,n){
            var wasVisible=article.style.visibility==='visible',selected=n===index;article.inert=!selected;article.setAttribute('aria-hidden',String(!selected));article.classList.toggle('is-active',selected);
            var visual=article.querySelector('.exhibit-visual'),title=article.querySelector('.exhibit-title'),meta=article.querySelector('.exhibit-meta'),footer=article.querySelector('.exhibit-footer');[visual,title,meta,footer].forEach(freeze);
            if(instant||reduced()){
                article.style.visibility=selected?'visible':'hidden';article.style.display=selected?'block':'none';[visual,title,meta,footer].forEach(function(node){node.style.opacity=selected?'1':'0';});visual.style.transform='translateY(0)';return;
            }
            if(!selected&&!wasVisible){article.style.visibility='hidden';article.style.display='none';return;}article.style.visibility='visible';article.style.display='block';
            if(selected){
                animate(visual,[{opacity:wasVisible?visual.style.opacity:0,transform:wasVisible?visual.style.transform:'translateY('+(travel*direction)+'px)'},{opacity:1,transform:'translateY(0)'}]);
                // Opacity only: every title uses identical fixed coordinates.
                animate(title,[{opacity:0},{opacity:0,offset:.38},{opacity:1}],{duration:1250,easing:'ease-in-out'});
                [meta,footer].forEach(function(node){animate(node,[{opacity:0},{opacity:1}],{duration:700,delay:350});});
            }else{
                animate(visual,[{opacity:visual.style.opacity,transform:visual.style.transform},{opacity:0,transform:'translateY('+(-travel*direction)+'px)'}]);
                [title,meta,footer].forEach(function(node){animate(node,[{opacity:node.style.opacity},{opacity:0}],{duration:450,easing:'ease-in-out'});});
            }
        });
        host.dataset.activeChapter=chapters[index].id;host.querySelector('.gallery-status').textContent=String(index+1).padStart(2,'0')+' / 05';
        background(index,instant);hideTimer=setTimeout(function(){if(token===serial)slides.forEach(function(article,n){if(n!==active){article.style.visibility='hidden';article.style.display='none';}});},instant?0:1300);
        if(index===4&&!instant){bookState='closed';paintBook(0);if(reduced())finishBook();}schedule();
    }
    function aligned(){return !view.hidden&&Math.abs(host.getBoundingClientRect().top-navHeight())<5;}
    function align(){engaged=true;scrollTo({top:Math.max(0,host.getBoundingClientRect().top+scrollY-navHeight()),behavior:'instant'});schedule();}
    function step(direction){
        if(performance.now()<transitionUntil)return;
        if(active===4&&direction>0&&bookState!=='open'){if(bookState!=='opening')startBook();return;}
        if(active===4&&direction<0&&closeBook())return;
        if(active+direction<0){scrollTo({top:Math.max(0,host.getBoundingClientRect().top+scrollY-innerHeight),behavior:reduced()?'instant':'smooth'});return;}
        if(active+direction>=chapters.length){document.getElementById('contact').scrollIntoView({behavior:reduced()?'instant':'smooth'});return;}align();select(active+direction,false);
    }
    function wheel(event){
        if(event.defaultPrevented||view.hidden||event.ctrlKey||event.target.closest('.navbar,[role="dialog"],input,textarea,select'))return;
        var delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(!delta||Math.abs(delta)<Math.abs(event.deltaX))return;
        var direction=Math.sign(delta),now=performance.now(),gap=now-lastWheel,newGesture=gap>160||direction!==wheelDirection;lastWheel=now;wheelDirection=direction;
        // A trackpad gesture can begin below the threshold. Consume it only
        // after accepting an action, then absorb the rest of its inertia.
        if(newGesture){wheelDistance=0;wheelConsumed=false;}wheelDistance+=Math.abs(delta);
        var r=host.getBoundingClientRect(),nav=navHeight();
        if(r.top>nav+5&&engaged&&active>0){event.preventDefault();align();wheelConsumed=true;acceptedWheel=now;return;}
        if(r.top>nav+5){if(direction>0&&r.top-nav<=Math.max(100,Math.abs(delta))){event.preventDefault();align();wheelConsumed=true;acceptedWheel=now;}return;}
        if(r.top<nav-5&&direction<0&&nav-r.top<=Math.max(100,Math.abs(delta))){event.preventDefault();align();wheelConsumed=true;acceptedWheel=now;return;}
        if(r.top<nav-5&&active<4){event.preventDefault();align();wheelConsumed=true;acceptedWheel=now;return;}
        if(!aligned())return;
        if(now<transitionUntil){event.preventDefault();wheelConsumed=true;return;}
        if(direction>0&&active===4){
            if(bookState!=='open'){
                if(bookState==='opening'){event.preventDefault();wheelConsumed=true;return;}
                event.preventDefault();if(!wheelConsumed&&wheelDistance>=12&&now-acceptedWheel>=400){wheelConsumed=true;acceptedWheel=now;startBook();}return;
            }
            if(wheelConsumed||now-acceptedWheel<400)event.preventDefault();return;
        }
        if(direction<0&&active===0){if(wheelConsumed||now-acceptedWheel<400)event.preventDefault();return;}
        event.preventDefault();if(wheelConsumed||wheelDistance<12||now-acceptedWheel<300)return;wheelConsumed=true;acceptedWheel=now;step(direction);
    }
    function update(){
        frame=0;if(view.hidden)return;
        // A wheel event can be coalesced, and dragging the scrollbar does not
        // emit wheel events. Guard the scroll position as well as the input.
        // Explicit navigation to Contact remains a normal link destination.
        if(slides.length){
            var boundary=Math.max(0,host.getBoundingClientRect().top+scrollY-navHeight());
            if(Math.abs(scrollY-boundary)<5)engaged=true;
            if((active<4&&location.hash!=='#contact'&&scrollY>boundary+1)||(engaged&&active>0&&scrollY<boundary-1))scrollTo({top:boundary,behavior:'instant'});
        }
        var isReduced=reduced();if(isReduced!==lastReduced&&slides.length){lastReduced=isReduced;if(isReduced){select(active,true);if(active===4)finishBook();}}
        if(isReduced&&bookFrame)finishBook();var r=explore.getBoundingClientRect();if(!document.body.classList.contains('life-preview'))document.body.classList.toggle('nav-ink',r.top<navHeight()&&r.bottom>navHeight());
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(update);}
    function capture(){
        if(view.hidden)return null;var r=host.getBoundingClientRect(),contact=document.getElementById('contact'),region;
        if(r.top<=innerHeight*.35&&r.bottom>innerHeight*.35)return {kind:'home',id:chapters[active].id,progress:0,book:bookProgress};
        region=contact.getBoundingClientRect().top<innerHeight*.35?contact:explore.getBoundingClientRect().top<innerHeight*.35?explore.querySelector('.explore-stage'):view.querySelector('.hero');
        return {kind:'home',id:region===contact?'contact':region.classList.contains('hero')?'intro':'explore',progress:-region.getBoundingClientRect().top/Math.max(1,region.offsetHeight)};
    }
    function restore(mark){
        if(!mark||mark.kind!=='home'||view.hidden)return false;var index=chapters.findIndex(function(c){return c.id===mark.id;});
        if(index>=0){select(index,true);if(index===4){paintBook(mark.book===undefined?bookProgress:mark.book);bookState=bookProgress>=1?'open':'closed';}align();return true;}
        var region=mark.id==='intro'?view.querySelector('.hero'):mark.id==='contact'?document.getElementById('contact'):explore.querySelector('.explore-stage');if(!region)return false;
        engaged=false;if(mark.id!=='contact')select(0,true);
        scrollTo({top:Math.max(0,region.getBoundingClientRect().top+scrollY+(mark.progress||0)*region.offsetHeight),behavior:'instant'});schedule();return true;
    }
    function cancel(){serial++;clearTimeout(hideTimer);cancelAnimationFrame(bookFrame);bookFrame=0;bookState=bookProgress>0?'open':'closed';slides.forEach(function(article){article.querySelectorAll('.exhibit-visual,.exhibit-title,.exhibit-meta,.exhibit-footer').forEach(freeze);});}
    window.HomeExhibit={render:render,refresh:schedule,capture:capture,restore:restore,cancel:cancel};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('wheel',wheel,{passive:false});
    host.addEventListener('touchstart',function(e){var p=e.touches[0];touchStart={x:p.clientX,y:p.clientY};},{passive:true});
    host.addEventListener('touchmove',function(e){if(aligned()&&touchStart){var dy=touchStart.y-e.touches[0].clientY;if((dy>0&&(active<4||bookState!=='open'))||(dy<0&&active>0))e.preventDefault();}},{passive:false});
    host.addEventListener('touchend',function(e){if(!touchStart||!aligned()){touchStart=null;return;}var p=e.changedTouches[0],dy=touchStart.y-p.clientY,dx=touchStart.x-p.clientX;touchStart=null;if(Math.abs(dy)>45||Math.abs(dx)>45)step(Math.abs(dy)>Math.abs(dx)?Math.sign(dy):Math.sign(dx));},{passive:true});
    document.addEventListener('keydown',function(e){
        if(view.hidden||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('.navbar,input,textarea,select,[role="dialog"]'))return;
        var r=host.getBoundingClientRect();
        // Focusing a whole book page can scroll it a few pixels into view.
        // Keep keyboard navigation available when focus is within this stage.
        var focusedStage=host.contains(e.target)&&r.top<innerHeight*.35&&r.bottom>innerHeight*.65;
        if(!aligned()&&!focusedStage)return;
        var direction=/^(ArrowDown|ArrowRight|PageDown)$/.test(e.key)?1:/^(ArrowUp|ArrowLeft|PageUp)$/.test(e.key)?-1:0;
        if(direction){e.preventDefault();align();step(direction);}
        if(e.key==='Escape'){select(active,true);if(active===4)finishBook();}
    });
    addEventListener('pagehide',cancel);document.addEventListener('DOMContentLoaded',function(){if(!slides.length)render();},{once:true});
})();
