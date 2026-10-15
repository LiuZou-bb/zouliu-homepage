/* Six volumes share the original cover / twelve-leaf opening choreography. */
(function () {
    'use strict';
    var volumes = [
        { id:'reading', group:0, number:'01', title:'archive_reading', desc:'archive_reading_desc', empty:'book_empty', color:'#e6dfc9', ink:'#29463d', mark:'M26 34h22v36H26zM52 34h22v36H52zM50 30v44' },
        { id:'films', group:0, number:'02', title:'archive_films', desc:'archive_films_desc', empty:'archive_films_empty', color:'#344d59', ink:'#e3d2ac', mark:'M24 28h52v48H24zM24 38h52M24 66h52M40 28v10m20-10v10M40 66v10m20-10v10M45 45l16 8-16 8z' },
        { id:'games', group:0, number:'03', title:'archive_games', desc:'archive_games_desc', empty:'archive_games_empty', color:'#805140', ink:'#f3dfb4', mark:'M30 38h40l10 28-10 5-12-12H42L30 71l-10-5zM31 44v16m-8-8h16M63 47h1m7 9h1' },
        { id:'interviews', group:1, number:'04', title:'archive_interviews', desc:'archive_interviews_desc', empty:'archive_interviews_empty', color:'#485646', ink:'#e9dcbb', mark:'M20 30h40v30H40L28 70V60h-8zM60 40h20v30H68l-8 9V60' },
        { id:'stories', group:1, number:'05', title:'archive_stories', desc:'book_unwritten_intro', color:'#976b70', ink:'#f5e5c6', mark:'M50 78V24M50 56c-20 0-28-14-28-26 18 0 28 12 28 26ZM50 68c20 0 28-14 28-26-18 0-28 12-28 26Z' },
        { id:'questions', group:1, number:'06', title:'archive_questions', desc:'interview_intro_full', color:'#b69b64', ink:'#243d37', mark:'M35 38c0-20 32-20 32 0 0 13-17 12-17 26M50 74v2' }
    ];
    var modal=document.getElementById('archiveReader'),mount=document.getElementById('archiveReaderMount');
    var closeButton=document.getElementById('archiveReaderClose'),previous=document.getElementById('archivePrevious'),next=document.getElementById('archiveNext'),status=document.getElementById('archivePageStatus');
    if(!modal||!mount)return;
    var active=null,object=null,spread=null,page=0,progress=0,frame=0,turnTimer=0,turning=false,version=0,pending=null;
    function t(key){return typeof DICT!=='undefined'&&DICT[key]||key;}
    function en(){return typeof EN!=='undefined'&&DICT===EN;}
    function reduced(){return document.documentElement.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;}
    function clamp(n){return Math.max(0,Math.min(1,n));}
    function node(tag,cls,text){var el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
    function find(id){return volumes.find(function(v){return v.id===id;});}
    function colours(el,volume){el.style.setProperty('--volume-colour',volume.color);el.style.setProperty('--volume-ink',volume.ink);}
    function face(volume){
        var front=node('span','archive-cover');colours(front,volume);
        var mark=node('span','archive-cover-mark');mark.setAttribute('aria-hidden','true');
        // Paths are local, static decorative artwork, never archive-entry HTML.
        mark.innerHTML='<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><circle cx="50" cy="50" r="44" opacity=".35"/><path d="'+volume.mark+'"/></svg>';
        front.append(node('small','archive-volume-number',volume.number+' / 06'),node('strong','archive-volume-title',t(volume.title)),mark,node('span','archive-volume-signature',t('hero_name')));
        return front;
    }
    function createShelf(compact){
        var shelf=node('div','archive-shelves'+(compact?' archive-shelves--compact':''));shelf.dataset.archiveShelf=compact?'compact':'full';
        ['archive_written','archive_unwritten'].forEach(function(key,group){
            var section=node('section','archive-shelf-group');section.setAttribute('aria-label',t(key));
            var heading=node('div','archive-shelf-heading');heading.append(node('span','archive-group-number',group===0?'01':'02'),node(compact?'h4':'h2','archive-section-title',t(key)));
            if(!compact)heading.append(node('p','archive-group-description',t(group===0?'archive_written_desc':'archive_unwritten_desc')));
            var row=node('div','archive-shelf-row');
            volumes.filter(function(v){return v.group===group;}).forEach(function(volume){
                var button=node('button','archive-volume');button.type='button';button.dataset.archiveBook=volume.id;button.setAttribute('aria-label',t('archive_open_book')+' · '+t(volume.title));
                button.append(face(volume));button.addEventListener('click',function(){
                    var rect=button.querySelector('.archive-cover').getBoundingClientRect();pending={id:volume.id,rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}};
                    window.Exhibition.navigate('archive/'+volume.id,{trigger:button});
                });row.append(button);
            });
            section.append(heading,row);shelf.append(section);
        });return shelf;
    }
    function items(){return (window.ArchiveCatalogue&&window.ArchiveCatalogue[active.id])||[];}
    function total(){if(active.id==='questions')return Math.max(1,Math.ceil((window.interviewQuestions||[]).length/2));return Math.max(1,Math.ceil(items().length/2));}
    function paragraph(parent,key,cls){parent.append(node('p',cls||'',t(key)));}
    function renderEntry(side,entry){
        side.append(node('small','archive-page-eyebrow',entry.year||t(active.title)),node('h2','archive-page-title',(en()?entry.titleEn:entry.title)||entry.title));
        if(entry.cover){var image=node('img','archive-entry-image');image.src=entry.cover;image.alt=(en()?entry.titleEn:entry.title)||entry.title;image.loading='lazy';side.append(image);}
        side.append(node('p','',(en()?entry.noteEn:entry.note)||entry.note||''));
    }
    function renderSpread(){
        if(!active||!spread)return;page=Math.max(0,Math.min(page,total()-1));spread.replaceChildren();
        for(var i=0;i<2;i++){
            var side=node('section','book-page archive-page'+(i?' archive-page--right':''));
            if(active.id==='questions'){
                var index=page*2+i,q=(window.interviewQuestions||[])[index];
                side.append(node('small','archive-page-eyebrow',t('archive_questions')+' / '+String(index+1).padStart(2,'0')));
                if(q)side.append(node('h2','archive-question',en()?q.en:q.zh));
                paragraph(side,'archive_question_note','archive-page-note');
            }else if(active.id==='stories'){
                side.append(node('small','archive-page-eyebrow',t('archive_stories')),node('h2','archive-page-title',t(i?'archive_story_begin':'book_invite_title')));
                paragraph(side,i?'book_invite_p2':'book_invite_p1');
                if(i){paragraph(side,'book_privacy','archive-page-note');var mail=node('a','archive-mail',t('book_write_me')+' ↗');mail.href='mailto:zouliu520@outlook.com';side.append(mail,node('span','archive-address','zouliu520@outlook.com'));}
            }else{
                var entry=items()[page*2+i];
                if(entry)renderEntry(side,entry);
                else if(!items().length){
                    side.append(node('small','archive-page-eyebrow',i?t('archive_in_progress'):t(active.group?'archive_unwritten':'archive_written')),node('h2','archive-page-title',t(i?'archive_blank_page':active.title)));
                    paragraph(side,i?active.empty:active.desc);if(i)paragraph(side,'archive_grow_note','archive-page-note');
                }else paragraph(side,'archive_blank_page');
            }
            side.append(node('span','archive-page-folio',String(page*2+i+1).padStart(2,'0')));spread.append(side);
        }
        document.getElementById('archiveReaderTitle').textContent=t(active.title);
        closeButton.setAttribute('aria-label',t('archive_close'));
        previous.setAttribute('aria-label',t('archive_previous'));next.setAttribute('aria-label',t('archive_next'));
        previous.textContent='← '+t('archive_previous');next.textContent=t('archive_next')+' →';
        status.textContent=(page+1)+' / '+total();
        previous.hidden=next.hidden=total()===1;status.hidden=total()===1;
        previous.disabled=page===0||progress<1||turning;next.disabled=page>=total()-1||progress<1||turning;
        if(object){var currentFace=object.querySelector('.archive-cover');if(currentFace)currentFace.replaceWith(face(active));}
    }
    function makeBook(volume){
        var book=node('div','exhibit-book archive-reader-book');colours(book,volume);
        spread=node('div','book-spread');spread.inert=true;book.append(spread);
        for(var n=11;n>=0;n--){var leaf=node('div','book-leaf');leaf.dataset.leaf=n;leaf.setAttribute('aria-hidden','true');leaf.append(node('span','leaf-face leaf-front'),node('span','leaf-face leaf-back'));book.append(leaf);}
        var cover=node('div','book-cover');cover.setAttribute('aria-hidden','true');
        var front=node('div','cover-face archive-reader-front');front.append(face(volume));cover.append(front,node('div','cover-face cover-back'));book.append(cover);return book;
    }
    function paint(value){
        if(!object)return;progress=clamp(value);var open=clamp(progress/.26);
        modal.dataset.openProgress=progress.toFixed(4);object.classList.toggle('is-book-open',progress>=.82);
        object.style.setProperty('--book-shift',(-25*(1-open))+'%');
        var cover=object.querySelector('.book-cover');cover.style.transform='rotateY('+(-180*open)+'deg)';cover.style.visibility=open>=.995?'hidden':'visible';
        object.querySelectorAll('.book-leaf').forEach(function(leaf){var flip=clamp((progress-.13-Number(leaf.dataset.leaf)*.035)/.30);leaf.style.transform='rotateY('+(-180*flip)+'deg)';leaf.style.visibility=flip>=.995?'hidden':'visible';leaf.style.zIndex=String(flip<.5?30-Number(leaf.dataset.leaf):Number(leaf.dataset.leaf)+2);});
        spread.style.opacity=String(clamp((progress-.28)/.20));spread.inert=progress<1;
        previous.disabled=page===0||progress<1||turning;next.disabled=page>=total()-1||progress<1||turning;
    }
    function dismiss(){
        version++;cancelAnimationFrame(frame);clearTimeout(turnTimer);frame=0;turnTimer=0;turning=false;active=null;object=null;spread=null;
        mount.replaceChildren();modal.classList.remove('visible');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';
    }
    function open(id,source){
        dismiss();active=find(id);if(!active)return;page=0;progress=0;modal.dataset.bookId=id;
        object=makeBook(active);var motion=node('div','archive-reader-motion');motion.append(object);mount.append(motion);renderSpread();
        modal.classList.add('visible');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';paint(0);closeButton.focus({preventScroll:true});
        if(reduced()){paint(1);return;}
        if(source){
            var rect=object.querySelector('.book-cover').getBoundingClientRect(),dx=source.x+source.width/2-(rect.left+rect.width/2),dy=source.y+source.height/2-(rect.top+rect.height/2);
            motion.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+(source.width/rect.width)+','+(source.height/rect.height)+')'},{transform:'translate(0,0) scale(1,1)'}],{duration:420,easing:'cubic-bezier(.22,.68,.2,1)'});
        }
        var start=performance.now()+(source?350:0),token=version;
        function tick(now){if(token!==version||!active)return;paint(clamp((now-start)/2000));if(progress<1)frame=requestAnimationFrame(tick);else frame=0;}
        frame=requestAnimationFrame(tick);
    }
    function syncRoute(){
        var parts=location.hash.slice(1).split('/');
        if(parts[0]==='archive'&&find(parts[1])){var source=pending&&pending.id===parts[1]?pending.rect:null;pending=null;open(parts[1],source);}
        else{pending=null;dismiss();}
    }
    function close(){if(!active)return;dismiss();window.Exhibition.returnTo('archive');}
    function turn(direction){
        if(!active||progress<1||turning||page+direction<0||page+direction>=total())return;
        if(reduced()){page+=direction;renderSpread();return;}
        var token=version,leaf=object.querySelector('[data-leaf="0"]');leaf.style.visibility='visible';leaf.style.zIndex='45';
        var animation=leaf.animate([{transform:'rotateY('+(direction>0?0:-180)+'deg)'},{transform:'rotateY('+(direction>0?-180:0)+'deg)'}],{duration:520,easing:'ease-in-out',fill:'forwards'});
        turning=true;previous.disabled=next.disabled=true;
        turnTimer=setTimeout(function(){if(token!==version)return;page+=direction;renderSpread();turnTimer=0;},260);
        animation.finished.then(function(){if(token===version){leaf.style.visibility='hidden';animation.cancel();turning=false;renderSpread();}}).catch(function(){});
    }
    function refresh(){
        document.querySelectorAll('[data-archive-shelf]').forEach(function(shelf){var fresh=createShelf(shelf.dataset.archiveShelf==='compact');shelf.replaceChildren.apply(shelf,Array.from(fresh.childNodes));});
        if(active){renderSpread();if(reduced()){cancelAnimationFrame(frame);paint(1);}}
    }
    closeButton.addEventListener('click',close);modal.querySelector('.archive-reader-backdrop').addEventListener('click',close);
    previous.addEventListener('click',function(){turn(-1);});next.addEventListener('click',function(){turn(1);});
    document.addEventListener('keydown',function(event){if(!active||event.ctrlKey||event.altKey||event.metaKey)return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}else if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();turn(event.key==='ArrowRight'?1:-1);}});
    document.addEventListener('exhibition:route',syncRoute);
    window.ArchiveBooks={createShelf:createShelf,refresh:refresh,dismiss:dismiss};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();
