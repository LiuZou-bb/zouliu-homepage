/* Five seconds of independent world formation, then a quiet living painting. */
(function () {
    'use strict';
    var scene = document.getElementById('dream');
    if (!scene) return;
    var intro = document.getElementById('dreamIntro');
    var ambient = document.getElementById('dreamAmbient');
    var copy = scene.querySelector('.dream-copy');
    var skip = document.getElementById('dreamSkip');
    var title = document.getElementById('dreamTitle');
    var active = false, forming = false, generation = 0, stallTimer = 0;
    var systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function reduced() { return document.documentElement.dataset.motion === 'reduced' || systemMotion.matches; }
    function clearStall() { clearTimeout(stallTimer);stallTimer=0; }
    function source(video) { if (!video.getAttribute('src')) video.src=video.dataset.src; }
    function playAmbient() {
        if (!active || forming || reduced() || document.hidden) return;
        source(ambient);
        var token = generation;
        var playing = ambient.play();
        if (playing) playing.catch(function () { if (token===generation) ambient.classList.remove('is-playing'); });
    }
    function finish() {
        if (!active) return;
        clearStall();
        var restoreFocus = document.activeElement === skip;
        forming=false;intro.pause();intro.hidden=true;skip.hidden=true;
        copy.inert=false;copy.removeAttribute('aria-hidden');
        scene.classList.add('dream-ready');
        playAmbient();
        if (restoreFocus) title.focus({preventScroll:true});
    }
    function watchStall() {
        clearStall();
        if (active && forming && !document.hidden) stallTimer=setTimeout(finish,3000);
    }
    function stop() {
        generation++;active=false;forming=false;clearStall();
        intro.pause();ambient.pause();ambient.classList.remove('is-playing');
        intro.hidden=true;skip.hidden=true;copy.inert=false;copy.removeAttribute('aria-hidden');
        scene.classList.remove('dream-ready');
    }
    function enter(playIntro) {
        stop();active=true;
        if (ambient.readyState) ambient.currentTime=0;
        if (!playIntro || reduced()) { finish();return; }
        forming=true;copy.inert=true;copy.setAttribute('aria-hidden','true');
        intro.hidden=false;skip.hidden=false;source(intro);intro.currentTime=0;
        skip.focus({preventScroll:true});watchStall();
        var token=generation;
        var playing=intro.play();
        if (playing) playing.catch(function () { if(token===generation)finish(); });
    }
    intro.addEventListener('ended',finish);
    intro.addEventListener('error',function(){if(forming)finish();});
    intro.addEventListener('playing',clearStall);
    intro.addEventListener('waiting',watchStall);
    intro.addEventListener('stalled',watchStall);
    skip.addEventListener('click',finish);
    ambient.addEventListener('playing',function(){if(active&&!forming&&!reduced())ambient.classList.add('is-playing');});
    ambient.addEventListener('error',function(){ambient.classList.remove('is-playing');});
    document.addEventListener('exhibition:route',function(event){
        if(scene.classList.contains('visible'))enter(!!(event.detail&&event.detail.playDreamIntro));
        else stop();
    });
    function refreshMotion() {
        if(!active)return;
        if(reduced()){
            if(forming)finish();
            ambient.pause();ambient.classList.remove('is-playing');
        }else playAmbient();
    }
    new MutationObserver(refreshMotion).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
    if(systemMotion.addEventListener)systemMotion.addEventListener('change',refreshMotion);
    document.addEventListener('visibilitychange',function(){
        if(document.hidden){clearStall();intro.pause();ambient.pause();return;}
        if(!active)return;
        if(forming){watchStall();var playing=intro.play();if(playing)playing.catch(finish);}
        else playAmbient();
    });
    document.addEventListener('keydown',function(event){
        if(active&&event.key==='Escape'){
            event.preventDefault();window.Exhibition.returnTo('philosophy');
        }
    });
    window.addEventListener('pagehide',stop);
    window.addEventListener('pageshow',function(event){if(event.persisted&&scene.classList.contains('visible'))enter(false);});
})();
