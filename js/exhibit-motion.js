/* Measured line windows: native scroll rolls text upward, without a timer. */
(function () {
    'use strict';
    var root=document.documentElement,blocks=[],frame=0,rebuilding=false;
    var studies=Array.from(document.querySelectorAll('.growth-study'));
    studies.forEach(function(study){study.classList.add('is-prepared');});
    function reduced(){return root.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;}
    function duration(token){var value=getComputedStyle(root).getPropertyValue(token).trim();return parseFloat(value)*(value.endsWith('ms')?1:1000)||650;}
    function clamp(n){return Math.max(0,Math.min(1,n));}
    function clear(element){
        element.querySelectorAll(':scope > .roll-line').forEach(function(n){n.remove();});
        var base=element.querySelector(':scope > .roll-source');
        if(base)element.replaceChildren.apply(element,Array.from(base.childNodes));
        element.classList.remove('is-rolled');
    }
    function hash(text){var n=2166136261;for(var i=0;i<text.length;i++){n^=text.charCodeAt(i);n=Math.imul(n,16777619);}return n>>>0;}
    function prepare(element){
        clear(element);if(!element.getClientRects().length||reduced())return null;
        var base=document.createElement('span');base.className='roll-source';
        while(element.firstChild)base.append(element.firstChild);element.append(base);
        var bounds=element.getBoundingClientRect(),range=document.createRange(),lines=[];
        var walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT),node;
        while((node=walker.nextNode())){
            var index=0;
            Array.from(node.textContent).forEach(function(character){
                range.setStart(node,index);index+=character.length;range.setEnd(node,index);
                var r=range.getBoundingClientRect();if(!r.height||!r.width||!character.trim())return;
                var line=lines.find(function(l){return Math.abs(l.y-r.top)<3;});
                if(!line){line={y:r.top,bottom:r.bottom};lines.push(line);}
                else line.bottom=Math.max(line.bottom,r.bottom);
            });
        }
        range.detach();lines.sort(function(a,b){return a.y-b.y;});
        if(!lines.length){clear(element);return null;}
        var seed=hash(element.textContent),leading=parseFloat(getComputedStyle(element).lineHeight)||24;
        lines.forEach(function(line,i){
            var top=i===0?0:(lines[i-1].bottom+line.y)/2-bounds.top;
            var bottom=i===lines.length-1?bounds.height:(line.bottom+lines[i+1].y)/2-bounds.top;
            var mask=document.createElement('span');mask.className='roll-line';mask.setAttribute('aria-hidden','true');
            mask.style.top=top+'px';mask.style.height=Math.max(1,bottom-top)+'px';
            var copy=base.cloneNode(true);copy.className='roll-copy';
            copy.querySelectorAll('*').forEach(function(n){Array.from(n.attributes).forEach(function(a){if(a.name==='id'||a.name.startsWith('data-i'))n.removeAttribute(a.name);});});
            copy.style.top=-top+'px';
            // Clip the cloned paragraph to this line before moving it; adjacent
            // lines must not slide into this window and repeat the previous text.
            copy.style.clipPath='inset('+Math.max(0,top)+'px 0 '+Math.max(0,bounds.height-bottom)+'px 0)';
            mask.append(copy);element.append(mask);
            line.copy=copy;line.yOffset=line.y-bounds.top;
            // Stable per-line choice: resizing or translating never causes jitter.
            line.distance=leading*(1+((seed+i*17)%2));line.mask=mask;
        });
        element.classList.add('is-rolled');return {element:element,lines:lines};
    }
    function update(){
        frame=0;
        blocks.forEach(function(block){
            var r=block.element.getBoundingClientRect();if(!r.height)return;
            // A shared reveal baseline: one sixteenth of the viewport above
            // the bottom. Each line rolls over its own 1–2 line-height travel.
            var baseline=innerHeight*15/16;
            var p=clamp((baseline-r.top)/block.lines[0].distance);
            block.element.dataset.revealProgress=p.toFixed(3);
            if(block.element.closest('.thought-entry h2'))block.element.closest('h2').style.setProperty('--title-reveal',String(p));
            block.lines.forEach(function(line){
                var amount=clamp((baseline-r.top-line.yOffset)/line.distance);
                var eased=amount*amount*(3-2*amount);
                line.copy.style.transform='translateY('+((1-eased)*line.distance).toFixed(3)+'px)';
            });
        });
        // Each unfinished drawing is revealed once as it enters the viewport.
        // Text stays readable before, during, and without the animation.
        studies.forEach(function(study){
            if(study.classList.contains('is-drawn')||!study.getClientRects().length)return;
            var r=study.getBoundingClientRect();
            if(reduced()||(r.top<innerHeight*.82&&r.bottom>0))study.classList.add('is-drawn');
        });
        if(window.HomeExhibit)window.HomeExhibit.refresh();
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(update);}
    function refresh(){
        if(rebuilding)return;rebuilding=true;
        blocks.forEach(function(b){clear(b.element);});blocks=[];
        var selectors=[
            '.thought-entry h2 [data-i]','.thought-entry .thought-core [data-i]',
            '#friend>.container>.section-title','#love>.container>.section-title',
            '#childhood>.container>.section-title','#sorry>.container>.section-title',
            '.friend-content h3','.friend-content p','.love-content h3',
            '.love-content p','.childhood-content p','.sorry-poem .sorry-subtitle','.sorry-poem p',
            '.thought-short-reader>.container>.section-title','.thought-source-reader>.container>.section-title','.thought-reading p'
        ];
        document.querySelectorAll(selectors.join(',')).forEach(function(element){
            element.classList.add('scroll-reveal');var block=prepare(element);if(block)blocks.push(block);
        });
        rebuilding=false;update();if(window.ArtTitles)window.ArtTitles.refresh();
    }
    function finishFocused(event){
        var block=blocks.find(function(b){return b.element.contains(event.target)||event.target.contains(b.element);});
        if(block&&event.target.matches(':focus-visible')){clear(block.element);blocks=blocks.filter(function(b){return b!==block;});}
    }
    function cancelAll(){if(frame)cancelAnimationFrame(frame);frame=0;if(window.HomeExhibit)window.HomeExhibit.cancel();}
    window.ExhibitMotion={refresh:refresh,enter:schedule,cancelAll:cancelAll,update:schedule,reduced:reduced,duration:duration};
    addEventListener('scroll',schedule,{passive:true});
    var resizeTimer;addEventListener('resize',function(){clearTimeout(resizeTimer);resizeTimer=setTimeout(refresh,120);},{passive:true});
    document.addEventListener('focusin',finishFocused);
    document.addEventListener('DOMContentLoaded',refresh,{once:true});
    if(document.fonts){document.fonts.ready.then(refresh);document.fonts.addEventListener('loadingdone',refresh);}
    document.addEventListener('exhibition:route',refresh);addEventListener('pagehide',cancelAll);
})();
