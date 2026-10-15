/* Annual chapters share a canvas. Scroll, rather than a timer, reveals each layer. */
(function(){
    'use strict';
    var grid=document.getElementById('momentsGrid'),section=document.getElementById('moments');
    if(!grid||!section)return;
    var request=0,selected=null,activeLayer=0,frame=0,chapters=[],pointer=null,keyboardInput=false;
    var NS='http://www.w3.org/2000/svg';
    var background=document.createElement('div');background.className='life-backdrop';background.setAttribute('aria-hidden','true');
    var layers=[document.createElement('img'),document.createElement('img')];layers.forEach(function(img){img.alt='';background.append(img);});document.body.append(background);
    function text(k){return DICT[k]||k;}
    function field(p,k){return DICT===EN?p[k+'En']:p[k];}
    function reduced(){return document.documentElement.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;}
    function clamp(n){return Math.max(0,Math.min(1,n));}
    function ease(n){n=clamp(n);return n*n*(3-2*n);}
    function el(tag,cls,value){var n=document.createElement(tag);n.className=cls;if(value!==undefined)n.textContent=value;return n;}
    function clear(){
        request++;selected=null;document.body.classList.remove('life-preview','nav-ink');section.classList.remove('has-preview');
        grid.querySelectorAll('.is-selected').forEach(function(e){e.classList.remove('is-selected');});
    }
    function preview(stage,entry,post,url,keyboard){
        // A narrow browser can still have a mouse. Input capability, not width,
        // determines whether the stable photograph footprint has a preview.
        if(reduced()||(!keyboard&&!matchMedia('(any-hover:hover) and (any-pointer:fine)').matches))return;
        clear();var token=++request;selected={stage:stage,entry:entry,keyboard:keyboard};
        entry.classList.add('is-selected');stage.classList.add('is-selected');
        if(!url)return;
        var probe=new Image();probe.src=url;
        function ready(){
            if(token!==request||!selected||selected.stage!==stage)return;
            var target=1-activeLayer;layers[target].src=url;layers[target].classList.add('is-active');layers[activeLayer].classList.remove('is-active');activeLayer=target;
            section.classList.add('has-preview');document.body.classList.add('life-preview','nav-ink');
        }
        if(probe.complete&&probe.naturalWidth)ready();else{probe.onload=ready;probe.onerror=function(){if(token===request)clear();};}
    }
    function update(){
        frame=0;if(!section.getClientRects().length)return;
        var still=reduced(),height=innerHeight;
        chapters.forEach(function(chapter){
            if(chapter.element.hidden)return;
            var top=chapter.row.getBoundingClientRect().top;
            var photos=still?1:ease((height*1.04-top)/(height*.52));
            // Photos arrive before the chapter number, year and subtitle.
            var title=still?1:ease((height*.83-top)/(height*.29));
            chapter.element.dataset.photoProgress=photos.toFixed(3);
            chapter.element.dataset.titleProgress=title.toFixed(3);
            chapter.heading.style.setProperty('--year-reveal',title);
            chapter.cards.forEach(function(card,i){
                var p=still?1:ease((height*1.04-top-i*14)/(height*.52));
                card.entry.style.setProperty('--photo-rise',((1-p)*94).toFixed(2)+'px');
                card.entry.style.setProperty('--photo-tilt',((1-p)*2).toFixed(3)+'deg');
                var bend=Math.sin(Math.PI*p)*.018;
                card.edges.forEach(function(path){path.setAttribute('d','M0 '+bend+' Q.5 '+(-bend)+' 1 '+bend+' L1 '+(1-bend)+' Q.5 '+(1+bend)+' 0 '+(1-bend)+' Z');});
            });
        });
        if(selected&&!selected.keyboard&&pointer){
            var r=selected.stage.getBoundingClientRect();
            if(pointer.x<r.left||pointer.x>r.right||pointer.y<r.top||pointer.y>r.bottom)clear();
        }
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(update);}
    function edge(stage,id){
        var svg=document.createElementNS(NS,'svg'),defs=document.createElementNS(NS,'defs'),clip=document.createElementNS(NS,'clipPath'),path=document.createElementNS(NS,'path');
        svg.classList.add('life-edge-defs');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
        clip.id=id;clip.setAttribute('clipPathUnits','objectBoundingBox');path.setAttribute('d','M0 0 H1 V1 H0 Z');clip.append(path);defs.append(clip);svg.append(defs);stage.append(svg);stage.style.clipPath='url(#'+id+')';return path;
    }
    window.LifeExhibit={clear:clear,refresh:schedule};
    window.renderMoments=function(){
        var intro=section.querySelector('[data-i="moments_intro"]');
        if(intro)intro.textContent=text('moments_intro').replace('{n}',String(momentsPosts.length));
        var focused=document.activeElement.closest&&document.activeElement.closest('[data-post-id]'),id=focused&&focused.dataset.postId;
        clear();chapters=[];grid.replaceChildren();grid.className='moments-timeline';
        grid.dataset.filter='all';
        var posts=momentsPosts.slice().sort(function(a,b){return a.dir.localeCompare(b.dir,undefined,{numeric:true});});
        ['2023','2024','2025','2026'].forEach(function(year,yearIndex){
            var spread=el('section','life-year-spread');spread.id='momentsYear'+year;spread.dataset.year=year;spread.tabIndex=-1;
            var heading=el('header','life-year-heading'),title=el('h3','life-year-mark',year);title.id='lifeYearTitle'+year;spread.setAttribute('aria-labelledby',title.id);
            heading.append(el('p','life-chapter-number',text('life_chapter').replace('{n}',String(yearIndex+1).padStart(2,'0'))),title,el('p','life-year-subtitle',text('moment_'+year)));
            var row=el('div','life-year-gallery'),yearPosts=posts.filter(function(p){return p.dir.startsWith(year);});
            row.dataset.count=yearPosts.length;row.addEventListener('scroll',schedule,{passive:true});var chapter={element:spread,heading:heading,row:row,cards:[]};chapters.push(chapter);
            yearPosts.forEach(function(post){
                var entry=el('article','life-exhibit'+(post.imgs.length?'':' no-image'));entry.dataset.postId=post.dir;
                var link=el('a','life-exhibit-link');link.href='#moments/'+post.dir;link.setAttribute('aria-haspopup','dialog');
                var strip=el('div','life-exhibit-strip'),edges=[];
                // A sparse year can show a triptych, but has only one story.
                var sources=yearPosts.length===1?post.imgs.slice(0,3):post.imgs.slice(0,1);
                if(!sources.length)sources=[null];
                entry.classList.toggle('life-exhibit--sequence',sources.length>1);
                sources.forEach(function(src,imageIndex){
                    var stage=el('div','life-exhibit-stage');stage.dataset.imageIndex=imageIndex;
                    if(src){var img=el('img','life-exhibit-photo');img.src=src;img.alt=field(post,'title')+(sources.length>1?' · '+(imageIndex+1):'');setPublicImageSize(img,src);img.loading='lazy';img.decoding='async';stage.append(img);}
                    var note=el('div','life-exhibit-note');note.append(el('p','',field(post,'body')),el('span','',text('life_read')+' ↗'));stage.append(note);
                    edges.push(edge(stage,'lifeEdge-'+year+'-'+post.dir.replace(/\./g,'-')+'-'+imageIndex));strip.append(stage);
                    if(src){
                        stage.addEventListener('pointerenter',function(e){if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY};preview(stage,entry,post,src,false);});
                        stage.addEventListener('pointerleave',function(){if(selected&&selected.stage===stage)clear();});
                    }
                });link.append(strip);
                var caption=el('div','life-exhibit-caption'),date=el('time','',post.dir);date.dateTime=post.dir.split('.').map(function(v,i){return i?v.padStart(2,'0'):v;}).join('-');
                caption.append(date,el('h4','',field(post,'title')),el('span','life-exhibit-count',post.imgs.length?post.imgs.length+' '+text('moment_img_unit'):text('life_text')));link.append(caption);entry.append(link);row.append(entry);
                chapter.cards.push({entry:entry,edges:edges});
                link.addEventListener('focus',function(){if(keyboardInput&&link.matches(':focus-visible'))preview(strip.firstElementChild,entry,post,post.imgs[0],true);});
                link.addEventListener('blur',function(){if(selected&&selected.entry===entry)clear();});
                link.addEventListener('click',function(e){
                    if(e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;
                    e.preventDefault();var stage=e.target.closest('.life-exhibit-stage'),source=stage&&stage.querySelector('img');
                    clear();window.Exhibition.navigate('moments/'+post.dir,{trigger:source||link});
                });
            });spread.append(heading,row);grid.append(spread);
        });
        if(window.refreshMomentDetail)window.refreshMomentDetail();
        if(id){var replacement=grid.querySelector('[data-post-id="'+id+'"] a');if(replacement)replacement.focus({preventScroll:true});}
        schedule();
    };
    document.addEventListener('pointermove',function(e){
        pointer={x:e.clientX,y:e.clientY};
        if(selected){selected.keyboard=false;var r=selected.stage.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)clear();}
    },{passive:true});
    document.addEventListener('pointerdown',function(){keyboardInput=false;},{passive:true});
    document.addEventListener('keydown',function(e){if(e.key==='Tab')keyboardInput=true;});
    grid.addEventListener('pointerleave',function(){if(selected&&!selected.keyboard)clear();});
    grid.addEventListener('focusout',function(e){if(!grid.contains(e.relatedTarget))clear();});
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',function(){clear();schedule();},{passive:true});
    document.addEventListener('exhibition:route',schedule);
    new MutationObserver(function(){clear();schedule();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
    document.addEventListener('visibilitychange',function(){if(document.hidden)clear();});
    document.addEventListener('DOMContentLoaded',function(){window.renderMoments();},{once:true});
})();
