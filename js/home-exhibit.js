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
    var active=0,slides=[],frame=0,serial=0,hideTimer=0,bookFrame=0,bookProgress=0,bookState='closed',bookPage=0,bookMetrics=null;
    var bookTurn=0,bookTurnFrame=0,bookTurning=false,bookDragging=false,bookClickUntil=0,bookInputUntil=0;
    var lastWheel=0,wheelDirection=0,wheelDistance=0,wheelConsumed=false,acceptedWheel=0,touchStart=null,backgroundSlot=0,lastReduced=null,transitionUntil=0,engaged=false,stagePinned=false;
    var backdrops=Array.from(explore.querySelectorAll('.explore-backdrop')),backgrounds=[],layoutWidth=innerWidth,layoutHeight=innerHeight,resizePinnedUntil=0;
    var galleryPrimed=false,backgroundRequest=0,artworkRequest=0,waitingForArtwork=false;
    function t(key){return DICT[key]||key;}
    function reduced(){return document.documentElement.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;}
    function clamp(n){return Math.max(0,Math.min(1,n));}
    function navHeight(){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'))||80;}
    function syncViewport(){
        // Mobile browser chrome can change the visible height without changing
        // svh. Keep the stage and its sticky backdrop on the same measurement.
        var viewport=window.visualViewport,height=viewport&&Math.abs(viewport.scale-1)<.01?viewport.height:innerHeight;
        layoutWidth=innerWidth;layoutHeight=innerHeight;
        explore.style.setProperty('--exhibit-viewport-height',Math.ceil(height)+'px');
        if((stagePinned||performance.now()<resizePinnedUntil)&&!view.hidden){resizePinnedUntil=performance.now()+250;align();}measureBook();schedule();
    }
    function el(tag,cls,value){var n=document.createElement(tag);n.className=cls;if(value!==undefined)n.textContent=value;return n;}
    function post(id){return window.HomeMedia&&window.HomeMedia.posts[id];}
    function picture(src,cls,alt){
        var box=el('span','exhibit-piece '+cls),img=document.createElement('img');img.dataset.src=src;img.alt=alt;img.decoding='async';
        if(window.setPublicImageSize)window.setPublicImageSize(img,src);box.append(img);return box;
    }
    function loadPanel(index,priority){
        var article=slides[index];if(!article)return Promise.resolve();
        return Promise.all(Array.from(article.querySelectorAll('img[data-src]')).map(function(img){
            img.loading='eager';img.fetchPriority=priority;
            if(!img.getAttribute('src'))img.src=img.dataset.src;
            return img.decode().catch(function(){ /* Keep the title and colour available on a failed image. */ });
        }));
    }
    function preparePanels(){
        if(!galleryPrimed||view.hidden)return;
        var index=active;
        loadPanel(index,'high').then(function(){if(active===index&&!view.hidden)loadPanel(index+1,'low');});
    }
    function bookSurface(page,index,sample,folio){
        var catalogue=sample&&!index,side=el(catalogue?'div':'a','book-page book-page--'+page[0]+' book-page--'+(sample?'preview':'intro'));
        if(!catalogue)side.href='#'+page[1];side.dataset.bookSet=String(index);
        side.addEventListener('click',function(event){if(bookState!=='open'||bookTurning||bookDragging||bookPage!==index||performance.now()<bookClickUntil)event.preventDefault();});
        var questions=window.interviewQuestions||[],heading=sample?t(index?'book_question_sample':'book_reading_sample'):t(page[2]);
        if(sample&&index)heading=heading.replace('{count}',String(questions.length));
        var title=el('h4','',heading),copy=el('div','book-page-copy'+(sample?' book-sample-copy':''));
        title.id='homeBookTitle-'+index+'-'+(sample?'preview':'intro');side.setAttribute('aria-labelledby',title.id);
        if(!sample){
            title.append(el('span','book-enter-hint',t('book_enter_hint')+' ↗'));
            t(page[3]).split('\n').forEach(function(paragraph){copy.append(el('p','',paragraph));});
        }
        else if(!index){
            copy.classList.add('book-catalogue');
            ['reading','games','movies','anime','music'].forEach(function(group,n){
                var item=el('a','book-catalogue-link');item.href='#books';item.dataset.bookGroup=group;
                item.append(el('small','',String(n+1).padStart(2,'0')),el('span','',t('library_'+group)),el('span','book-catalogue-arrow','↗'));
                item.addEventListener('click',function(event){
                    if(bookState!=='open'||bookTurning||bookDragging||bookPage!==0||performance.now()<bookClickUntil){event.preventDefault();return;}
                    if(window.SiteResources)window.SiteResources.selectBookGroup(group);
                    else if(window.LifeLibrary)window.LifeLibrary.selectGroup(group);
                });copy.append(item);
            });
        }else questions.slice(0,2).forEach(function(question,n){
            var item=el('div','book-sample-item book-question-item');item.dataset.question=String(n+1);
            item.append(el('small','',String(n+1).padStart(2,'0')),el('p','',DICT===EN?question.en:question.zh));copy.append(item);
        });
        var number=String(folio).padStart(2,'0'),footer=el('span','book-folio',number);footer.setAttribute('aria-hidden','true');
        side.append(el('small','book-page-number',sample?number:'0'+(index+1)),title,copy,footer);return side;
    }
    function bookIntro(article,index){return article.querySelector('.book-page--intro[data-book-set="'+index+'"]');}
    function book(){
        var object=el('div','exhibit-book'),spread=el('div','book-spread');spread.id='homeBookPages';spread.inert=true;
        ['left','right'].forEach(function(side){
            var board=el('div','book-board book-board--'+side),paper=el('div','book-paper-stack book-paper-stack--'+side);
            board.setAttribute('aria-hidden','true');paper.setAttribute('aria-hidden','true');spread.append(board,paper);
        });
        var binding=el('div','book-binding'),shadow=el('div','book-turn-shadow'),readingLeaf=el('div','book-reading-leaf');
        binding.setAttribute('aria-hidden','true');shadow.setAttribute('aria-hidden','true');spread.append(binding,shadow);
        var pages=[['written','books','book_written','book_written_intro'],['unwritten','interview','book_unwritten','book_unwritten_intro']];
        var writtenIntro=bookSurface(pages[0],0,false,1),writtenSample=bookSurface(pages[0],0,true,2),unwrittenIntro=bookSurface(pages[1],1,false,3),unwrittenSample=bookSurface(pages[1],1,true,4);
        writtenIntro.classList.add('book-page--static','book-page--left');unwrittenSample.classList.add('book-page--static','book-page--right');unwrittenIntro.classList.add('book-page--back');
        readingLeaf.append(writtenSample,unwrittenIntro);spread.append(writtenIntro,readingLeaf,unwrittenSample);object.append(spread);
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
        var reader=el('div','book-reader'),viewport=el('div','book-window'),hint=el('span','book-gesture-hint'),status=el('span','book-page-status');
        hint.id='homeBookGesture';status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
        spread.setAttribute('aria-describedby',hint.id);viewport.append(object);reader.append(viewport,hint,status);return reader;
    }
    function measureBook(){
        var article=slides[4],reader=article&&article.querySelector('.book-reader');if(!reader||!reader.clientHeight)return;
        var narrow=matchMedia('(max-width:600px)').matches,availableHeight=Math.max(1,reader.clientHeight-44),windowRatio=narrow?.66:1,ratio=narrow?1.22:1.5;
        // Show a whole spread on wider screens. A phone keeps the left page
        // readable and exposes the spine plus 32% of the facing page.
        var height=Math.min(availableHeight,Math.max(1,reader.clientWidth-48)/(ratio*windowRatio)),width=height*ratio;
        bookMetrics={narrow:narrow,width:width,windowWidth:width*windowRatio};
        var viewport=reader.querySelector('.book-window'),object=reader.querySelector('.exhibit-book');
        viewport.style.width=bookMetrics.windowWidth+'px';viewport.style.height=height+'px';object.style.width=width+'px';object.style.height=height+'px';object.style.setProperty('--book-height',height+'px');object.style.setProperty('--book-page-width',width*.5+'px');
        reader.querySelector('.book-gesture-hint').textContent=t('book_swipe_hint');positionBook();fitBookCopy();
    }
    function fitBookCopy(){
        var article=slides[4];if(!article)return;
        article.querySelectorAll('.book-page-copy').forEach(function(copy){
            var scale=1;copy.style.setProperty('--book-copy-fit','1');
            for(var n=0;n<6&&copy.clientHeight>0&&copy.scrollHeight>copy.clientHeight+1;n++){
                scale*=Math.min(.95,Math.sqrt(copy.clientHeight/copy.scrollHeight)*.97);copy.style.setProperty('--book-copy-fit',scale.toFixed(4));
            }
        });
    }
    function positionBook(){
        var article=slides[4];if(!article||!bookMetrics)return;
        var open=clamp(bookProgress/.26),m=bookMetrics,object=article.querySelector('.exhibit-book'),bend=Math.sin(Math.PI*bookTurn),busy=bookTurning||bookDragging;
        object.style.setProperty('--book-narrow-shift',((m.windowWidth/2-m.width*.75)*(1-open))+'px');
        object.style.setProperty('--book-turn-shade',String(bend*.26));object.style.setProperty('--book-shadow-opacity',String(bend*.34));object.style.setProperty('--book-shadow-scale',String(.06+bend*.94));
        object.querySelector('.book-reading-leaf').style.transform='translateZ(3px) rotateY('+(-180*bookTurn)+'deg)';
        article.classList.toggle('is-book-turning',busy);article.dataset.bookPage=String(bookPage);article.dataset.bookTurn=bookTurn.toFixed(4);
        object.querySelector('.book-spread').inert=bookProgress<1||bookTurning;
        article.querySelectorAll('.book-page').forEach(function(page){
            var hidden=bookProgress<1||busy||Number(page.dataset.bookSet)!==bookPage,preview=page.classList.contains('book-page--preview');
            page.tabIndex=hidden||page.tagName!=='A'||m.narrow&&preview?-1:0;page.setAttribute('aria-hidden',String(hidden));
            page.querySelectorAll('.book-catalogue-link').forEach(function(link){link.tabIndex=hidden||m.narrow?-1:0;});
        });
    }
    function setBookPage(index){
        if(bookState!=='open'||bookTurning||active!==4||view.hidden)return false;
        var target=index===1?1:0,from=bookTurn,article=slides[4],moveFocus=Array.from(article.querySelectorAll('.book-page')).some(function(page){return page.contains(document.activeElement);});
        bookDragging=false;bookPage=target;
        if(Math.abs(from-target)<.001){bookTurn=target;positionBook();return false;}
        bookTurning=true;positionBook();
        var start=performance.now(),token=serial,duration=reduced()?0:Math.max(180,850*Math.abs(target-from));bookInputUntil=start+duration+220;
        function finish(){
            bookTurnFrame=0;bookTurning=false;bookTurn=target;acceptedWheel=performance.now();wheelDistance=0;wheelConsumed=true;positionBook();
            article.querySelector('.book-page-status').textContent=t(target?'book_unwritten':'book_written');
            if(moveFocus)bookIntro(article,target).focus({preventScroll:true});
        }
        if(!duration){finish();return true;}
        function tick(now){
            if(token!==serial||view.hidden||active!==4){settleBookPage();return;}
            var p=clamp((now-start)/duration);bookTurn=from+(target-from)*p*p*(3-2*p);positionBook();
            if(p<1)bookTurnFrame=requestAnimationFrame(tick);else finish();
        }
        bookTurnFrame=requestAnimationFrame(tick);return true;
    }
    function settleBookPage(){
        cancelAnimationFrame(bookTurnFrame);bookTurnFrame=0;bookTurning=false;bookDragging=false;bookTurn=bookPage;touchStart=null;positionBook();
    }
    function canTurnBook(direction){return bookState==='open'&&(direction>0?bookPage===0:bookPage===1);}
    function paintBook(progress){
        var article=slides[4];if(!article)return;bookProgress=clamp(progress);
        var object=article.querySelector('.exhibit-book'),open=clamp(bookProgress/.26);
        var fullyOpen=bookProgress>=1,spread=object.querySelector('.book-spread'),opener=object.querySelector('.book-opener');
        var moveFocus=fullyOpen&&document.activeElement===opener;
        article.dataset.bookProgress=bookProgress.toFixed(4);article.classList.toggle('is-book-open',fullyOpen);
        spread.inert=!fullyOpen||bookTurning;opener.hidden=fullyOpen;opener.setAttribute('aria-expanded',String(fullyOpen));
        opener.setAttribute('aria-busy',String(bookState==='opening'&&!fullyOpen));
        positionBook();if(moveFocus)bookIntro(article,bookPage).focus({preventScroll:true});
        object.style.setProperty('--book-shift',(-25*(1-open))+'%');
        var cover=object.querySelector('.book-cover');cover.style.transform='rotateY('+(-180*open)+'deg)';cover.style.visibility=open>=.995?'hidden':'visible';
        object.querySelectorAll('.book-leaf').forEach(function(leaf){var flip=clamp((bookProgress-.13-Number(leaf.dataset.leaf)*.035)/.30);leaf.style.transform='rotateY('+(-180*flip)+'deg)';leaf.style.visibility=flip>=.995?'hidden':'visible';leaf.style.zIndex=String(flip<.5?30-Number(leaf.dataset.leaf):Number(leaf.dataset.leaf)+2);});
        object.querySelector('.book-spread').style.opacity=String(clamp((bookProgress-.28)/.20));
        article.querySelector('.exhibit-open').textContent=t(fullyOpen?'book_choose_page':'book_scroll_open')+(fullyOpen?' ↗':'');
    }
    function finishBook(){cancelAnimationFrame(bookFrame);bookFrame=0;bookState='open';paintBook(1);}
    function startBook(){
        if(bookState==='opening'||bookState==='open')return;
        cancelAnimationFrame(bookFrame);bookPage=0;settleBookPage();bookState='opening';if(reduced()){finishBook();return;}
        var start=performance.now(),token=serial,from=bookProgress;
        function tick(now){if(token!==serial||view.hidden||active!==4){bookFrame=0;return;}paintBook(from+(1-from)*clamp((now-start)/2000));if(bookProgress<1)bookFrame=requestAnimationFrame(tick);else{bookFrame=0;bookState='open';}}
        bookFrame=requestAnimationFrame(tick);
    }
    function closeBook(){
        if(bookTurning||bookDragging)return true;
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
    function loadBackgrounds(){var road=post('2025.11.1'),temple=post('2024.11.16');backgrounds=[window.HomeMedia.records['NEO-PI-R'].src,road&&road.imgs[0],temple&&temple.imgs[2],null,null];}
    function background(index,instant){
        explore.style.setProperty('--explore-bg','rgb('+chapters[index].color.join(',')+')');explore.classList.toggle('is-book-atmosphere',index===4);
        var token=++backgroundRequest;if(!galleryPrimed||view.hidden)return;
        var src=backgrounds[index],next=backdrops[1-backgroundSlot];
        if(src)next.src=src;
        var ready=src?next.decode():Promise.resolve();
        ready.then(function(){
            if(token!==backgroundRequest||view.hidden)return;
            var old=backdrops[backgroundSlot];backdrops.forEach(freeze);backgroundSlot=1-backgroundSlot;
            next.style.opacity='0';next.style.transform='translateY(10%)';
            animate(old,[{opacity:old.style.opacity,transform:old.style.transform},{opacity:0,transform:'translateY(-10%)'}],{duration:instant?0:1200});
            animate(next,[{opacity:0,transform:'translateY(10%)'},{opacity:src?1:0,transform:'translateY(0)'}],{duration:instant?0:1200});
        }).catch(function(){ /* A failed replacement never erases the previous backdrop. */ });
    }
    function controls(){
        // No visible navigation buttons. Keep keyboard/swipe navigation and a
        // polite screen-reader announcement independent of the artwork.
        var status=el('span','gallery-status',String(active+1).padStart(2,'0')+' / 05');status.setAttribute('aria-live','polite');host.append(status);
    }
    function render(){
        cancel();var fragment=document.createDocumentFragment();
        chapters.forEach(function(chapter,index){
            var article=el('article','home-exhibit home-exhibit--'+chapter.id);article.dataset.homeId=chapter.id;article.style.display='none';
            var link=el(chapter.id==='dialogue'?'div':'a','home-exhibit-link');if(link.tagName==='A')link.href='#'+chapter.route;link.dataset.homeLink=chapter.id;
            var titleId='homeTitle-'+chapter.id;link.setAttribute('aria-labelledby',titleId);
            var meta=el('div','exhibit-meta');meta.append(el('span','',String(index+1).padStart(2,'0')+' / 05'),el('span','',t('ex_label')));
            var composition=el('div','exhibit-composition'),visual=el('div','exhibit-visual');composition.append(visual);
            if(chapter.id==='meet'){
                var thirdRecord=window.HomeMedia.records['NEO-PI-R'];visual.append(picture(thirdRecord.src,'piece-portrait piece-record-c',t(thirdRecord.alt)));
                ['EPQ-R','16PF'].forEach(function(id,n){var record=window.HomeMedia.records[id];visual.append(picture(record.src,'piece-record-'+(n?'b':'a'),t(record.alt)));});
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
    function select(index,instant,artworkReady){
        if(index<0||index>=chapters.length)return;
        var request=++artworkRequest;
        var pictures=slides[index]&&Array.from(slides[index].querySelectorAll('img[data-src]'))||[];
        if(galleryPrimed&&!instant&&!artworkReady&&pictures.some(function(img){return !img.complete||!img.naturalWidth;})){
            waitingForArtwork=true;host.setAttribute('aria-busy','true');
            loadPanel(index,'high').then(function(){if(request===artworkRequest&&!view.hidden)select(index,false,true);});
            return;
        }
        waitingForArtwork=false;host.removeAttribute('aria-busy');
        settleBookPage();
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
        preparePanels();background(index,instant);hideTimer=setTimeout(function(){if(token===serial)slides.forEach(function(article,n){if(n!==active){article.style.visibility='hidden';article.style.display='none';}});},instant?0:1300);
        if(index===4){measureBook();if(!instant){bookPage=0;bookTurn=0;bookState='closed';paintBook(0);if(reduced())finishBook();}}schedule();
    }
    function aligned(){return !view.hidden&&Math.abs(host.getBoundingClientRect().top-navHeight())<5;}
    function canLeaveStage(){return active===chapters.length-1&&bookState==='open'&&bookPage===1&&!waitingForArtwork&&!bookTurning&&!bookDragging&&performance.now()>=Math.max(transitionUntil,bookInputUntil);}
    function align(){engaged=true;stagePinned=true;resizePinnedUntil=performance.now()+250;scrollTo({top:Math.max(0,host.getBoundingClientRect().top+scrollY-navHeight()),behavior:'instant'});schedule();}
    function step(direction){
        if(waitingForArtwork||performance.now()<transitionUntil)return;
        if(active===4&&(bookTurning||bookDragging||performance.now()<bookInputUntil||bookState==='closing'))return;
        if(active===4&&canTurnBook(direction)){setBookPage(direction>0?1:0);return;}
        if(active===4&&direction>0&&bookState!=='open'){if(bookState!=='opening')startBook();return;}
        if(active===4&&direction<0&&closeBook())return;
        if(active+direction<0){stagePinned=false;resizePinnedUntil=0;scrollTo({top:Math.max(0,host.getBoundingClientRect().top+scrollY-innerHeight),behavior:reduced()?'instant':'smooth'});return;}
        if(active+direction>=chapters.length){stagePinned=false;resizePinnedUntil=0;document.getElementById('contact').scrollIntoView({behavior:reduced()?'instant':'smooth'});return;}align();select(active+direction,false);
    }
    function wheel(event){
        if(event.defaultPrevented||view.hidden||event.ctrlKey||event.target.closest('.navbar,[role="dialog"],input,textarea,select'))return;
        var horizontal=active===4&&bookState==='open'&&Math.abs(event.deltaX)>Math.abs(event.deltaY);
        var delta=(horizontal?event.deltaX:event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(!delta||(!horizontal&&Math.abs(delta)<Math.abs(event.deltaX)))return;
        var direction=Math.sign(delta),now=performance.now(),gap=now-lastWheel,newGesture=gap>160||direction!==wheelDirection;lastWheel=now;wheelDirection=direction;
        // Accumulate small trackpad deltas, then rearm after the entrance.
        // A continuous two-finger scroll must not require a silent interval.
        if(newGesture||(wheelConsumed&&now>=transitionUntil&&now-acceptedWheel>=400)){wheelDistance=0;wheelConsumed=false;}wheelDistance+=Math.abs(delta);
        var r=host.getBoundingClientRect(),nav=navHeight();
        if(r.top>nav+5&&engaged&&active>0){event.preventDefault();align();wheelConsumed=true;acceptedWheel=now;return;}
        if(r.top>nav+5){if(direction>0&&r.top-nav<=Math.max(100,Math.abs(delta))){event.preventDefault();align();wheelConsumed=true;acceptedWheel=now;}return;}
        if(r.top<nav-5&&direction<0&&nav-r.top<=Math.max(100,Math.abs(delta))){event.preventDefault();align();wheelConsumed=true;acceptedWheel=now;return;}
        if(r.top<nav-5&&active<4){event.preventDefault();align();wheelConsumed=true;acceptedWheel=now;return;}
        if(!aligned())return;
        if(now<transitionUntil){event.preventDefault();wheelConsumed=true;wheelDistance=0;return;}
        if(active===4&&(bookTurning||bookDragging||now<bookInputUntil||bookState==='closing')){event.preventDefault();wheelConsumed=true;acceptedWheel=now;wheelDistance=0;return;}
        if(active===4&&canTurnBook(direction)){
            event.preventDefault();if(!wheelConsumed&&wheelDistance>=20&&now-acceptedWheel>=400){wheelConsumed=true;acceptedWheel=now;setBookPage(direction>0?1:0);}return;
        }
        if(horizontal){event.preventDefault();return;}
        if(direction>0&&active===4){
            if(bookState!=='open'){
                if(bookState==='opening'){event.preventDefault();wheelConsumed=true;acceptedWheel=now;wheelDistance=0;return;}
                event.preventDefault();if(!wheelConsumed&&wheelDistance>=12&&now-acceptedWheel>=400){wheelConsumed=true;acceptedWheel=now;startBook();}return;
            }
            if(wheelConsumed||now-acceptedWheel<400)event.preventDefault();return;
        }
        if(direction<0&&active===0){if(wheelConsumed||now-acceptedWheel<400)event.preventDefault();return;}
        event.preventDefault();if(wheelConsumed||wheelDistance<12||now-acceptedWheel<300)return;wheelConsumed=true;acceptedWheel=now;step(direction);
    }
    function update(){
        frame=0;if(view.hidden)return;
        // Scroll anchoring may fire before resize. Preserve the previous
        // alignment before that first scroll update can clear it.
        if(layoutWidth!==innerWidth||layoutHeight!==innerHeight)syncViewport();
        // A wheel event can be coalesced, and dragging the scrollbar does not
        // emit wheel events. Guard the scroll position as well as the input.
        // Explicit navigation to Contact remains a normal link destination.
        if(slides.length){
            var boundary=Math.max(0,host.getBoundingClientRect().top+scrollY-navHeight());
            if(Math.abs(scrollY-boundary)<5)engaged=true;
            if((performance.now()<resizePinnedUntil)||(!canLeaveStage()&&location.hash!=='#contact'&&scrollY>boundary+1)||(engaged&&active>0&&scrollY<boundary-1))scrollTo({top:boundary,behavior:'instant'});
            stagePinned=Math.abs(scrollY-boundary)<5;
        }
        var isReduced=reduced();if(isReduced!==lastReduced&&slides.length){lastReduced=isReduced;if(isReduced){select(active,true);if(active===4)finishBook();}}
        if(isReduced&&bookTurnFrame)settleBookPage();if(isReduced&&bookFrame)finishBook();var r=explore.getBoundingClientRect();if(!document.body.classList.contains('life-preview'))document.body.classList.toggle('nav-ink',r.top<navHeight()&&r.bottom>navHeight());
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(update);}
    function capture(){
        if(view.hidden)return null;var r=host.getBoundingClientRect(),contact=document.getElementById('contact'),region;
        if(r.top<=innerHeight*.35&&r.bottom>innerHeight*.35)return {kind:'home',id:chapters[active].id,progress:0,book:bookProgress,page:bookPage};
        region=contact.getBoundingClientRect().top<innerHeight*.35?contact:explore.getBoundingClientRect().top<innerHeight*.35?explore.querySelector('.explore-stage'):view.querySelector('.hero');
        return {kind:'home',id:region===contact?'contact':region.classList.contains('hero')?'intro':'explore',progress:-region.getBoundingClientRect().top/Math.max(1,region.offsetHeight)};
    }
    function restore(mark){
        if(!mark||mark.kind!=='home'||view.hidden)return false;var index=chapters.findIndex(function(c){return c.id===mark.id;});
        if(index>=0){select(index,true);if(index===4){bookPage=mark.page===1?1:0;bookTurn=bookPage;paintBook(mark.book===undefined?bookProgress:mark.book);bookState=bookProgress>=1?'open':'closed';}align();return true;}
        var region=mark.id==='intro'?view.querySelector('.hero'):mark.id==='contact'?document.getElementById('contact'):explore.querySelector('.explore-stage');if(!region)return false;
        engaged=false;stagePinned=false;resizePinnedUntil=0;if(mark.id!=='contact')select(0,true);
        scrollTo({top:Math.max(0,region.getBoundingClientRect().top+scrollY+(mark.progress||0)*region.offsetHeight),behavior:'instant'});schedule();return true;
    }
    function cancel(){serial++;artworkRequest++;waitingForArtwork=false;host.removeAttribute('aria-busy');clearTimeout(hideTimer);cancelAnimationFrame(bookFrame);bookFrame=0;settleBookPage();bookState=bookProgress>=1?'open':'closed';slides.forEach(function(article){article.querySelectorAll('.exhibit-visual,.exhibit-title,.exhibit-meta,.exhibit-footer').forEach(freeze);});}
    window.HomeExhibit={render:render,refresh:schedule,capture:capture,restore:restore,cancel:cancel};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',syncViewport,{passive:true});addEventListener('pageshow',syncViewport);addEventListener('wheel',wheel,{passive:false});
    if(window.visualViewport)window.visualViewport.addEventListener('resize',syncViewport,{passive:true});syncViewport();
    host.addEventListener('touchstart',function(e){
        if(e.touches.length!==1){if(bookDragging)settleBookPage();touchStart=null;return;}
        var p=e.touches[0],now=performance.now();
        touchStart={x:p.clientX,y:p.clientY,turn:bookTurn,axis:null,blocked:waitingForArtwork||now<transitionUntil||active===4&&(bookTurning||now<bookInputUntil||bookState==='opening'||bookState==='closing')};
    },{passive:true});
    host.addEventListener('touchmove',function(e){
        if(!aligned()||!touchStart||e.touches.length!==1)return;
        var dy=touchStart.y-e.touches[0].clientY,dx=touchStart.x-e.touches[0].clientX;
        if(!touchStart.axis&&Math.max(Math.abs(dx),Math.abs(dy))>8)touchStart.axis=Math.abs(dx)>Math.abs(dy)*1.2?'horizontal':'vertical';
        if(touchStart.blocked){e.preventDefault();return;}
        if(active===4&&bookState==='open'&&touchStart.axis){
            var horizontal=touchStart.axis==='horizontal',distance=horizontal?dx:dy;
            if(!horizontal&&dy>0&&canLeaveStage()){touchStart.leaving=true;return;}
            e.preventDefault();
            if(!horizontal&&!bookDragging&&!canTurnBook(Math.sign(distance)))return;
            touchStart.span=horizontal?bookMetrics.width*.5:host.clientHeight*.5;
            bookDragging=true;bookClickUntil=performance.now()+700;bookTurn=reduced()?touchStart.turn:clamp(touchStart.turn+distance/Math.max(1,touchStart.span));positionBook();return;
        }
        if(touchStart.axis==='horizontal'||(dy>0&&!canLeaveStage())||(dy<0&&active>0))e.preventDefault();
    },{passive:false});
    host.addEventListener('touchend',function(e){
        if(!touchStart||!aligned()){if(bookDragging)settleBookPage();touchStart=null;return;}
        var gesture=touchStart,p=e.changedTouches[0],dy=gesture.y-p.clientY,dx=gesture.x-p.clientX;touchStart=null;
        if(gesture.blocked||gesture.leaving)return;
        var horizontal=gesture.axis?gesture.axis==='horizontal':Math.abs(dx)>Math.abs(dy)*1.2,distance=horizontal?dx:dy;
        if(active===4&&bookState==='open'&&(horizontal||bookDragging||canTurnBook(Math.sign(distance)))){
            var span=gesture.span||(horizontal?bookMetrics.width*.5:host.clientHeight*.5),threshold=Math.max(horizontal?32:45,span*.18),target=Math.abs(distance)>threshold?(distance>0?1:0):bookPage;
            if(bookDragging||Math.abs(distance)>threshold){bookClickUntil=performance.now()+700;setBookPage(target);}return;
        }
        if(Math.abs(dy)>45||Math.abs(dx)>45)step(Math.abs(dy)>Math.abs(dx)?Math.sign(dy):Math.sign(dx));
    },{passive:true});
    host.addEventListener('touchcancel',function(){touchStart=null;if(bookDragging)setBookPage(bookPage);},{passive:true});
    document.addEventListener('keydown',function(e){
        if(view.hidden||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('.navbar,input,textarea,select,[role="dialog"]'))return;
        var r=host.getBoundingClientRect();
        // Focusing a whole book page can scroll it a few pixels into view.
        // Keep keyboard navigation available when focus is within this stage.
        var focusedStage=host.contains(e.target)&&r.top<innerHeight*.35&&r.bottom>innerHeight*.65;
        if(!aligned()&&!focusedStage)return;
        if(active===4&&bookState==='open'&&/^(ArrowLeft|ArrowRight)$/.test(e.key)){e.preventDefault();setBookPage(e.key==='ArrowRight'?1:0);return;}
        var direction=/^(ArrowDown|ArrowRight|PageDown)$/.test(e.key)?1:/^(ArrowUp|ArrowLeft|PageUp)$/.test(e.key)?-1:0;
        if(direction){e.preventDefault();align();step(direction);}
        if(e.key==='Escape'){select(active,true);if(active===4)finishBook();}
    });
    if(document.fonts)document.fonts.ready.then(measureBook);
    if('IntersectionObserver' in window){
        var artworkObserver=new IntersectionObserver(function(entries){
            if(!entries.some(function(entry){return entry.isIntersecting;}))return;
            galleryPrimed=true;preparePanels();background(active,true);artworkObserver.disconnect();
        },{rootMargin:'400px 0px'});artworkObserver.observe(host);
    }else{galleryPrimed=true;}
    addEventListener('pagehide',cancel);document.addEventListener('DOMContentLoaded',function(){if(!slides.length)render();},{once:true});
})();
