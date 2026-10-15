/* A transient clone bridges existing thumbnails and existing dialogs, without blocking input. */
(function () {
    'use strict';
    var running = new Map();
    function reduced() { return document.documentElement.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    function cancel(image) { var state = running.get(image); if (!state) return; state.animation.cancel(); state.clone.remove(); running.delete(image); }
    function bridge(image, source, reverse, done) {
        cancel(image);
        if (reduced() || !source || !source.isConnected || !image.complete || !image.naturalWidth || !image.animate) { if (done) done(); return; }
        var small = source.getBoundingClientRect(), large = image.getBoundingClientRect();
        if (!small.width || !large.width || small.bottom < 0 || small.top > innerHeight) { if (done) done(); return; }
        var clone = image.cloneNode(false); clone.removeAttribute('id'); clone.removeAttribute('data-i-alt'); clone.alt = ''; clone.setAttribute('aria-hidden', 'true'); clone.className = 'image-flight';
        Object.assign(clone.style, { position: 'fixed', left: large.left + 'px', top: large.top + 'px', width: large.width + 'px', height: large.height + 'px', objectFit: 'contain', margin: '0', maxWidth: 'none', maxHeight: 'none', zIndex: '3900', pointerEvents: 'none' });
        document.body.append(clone);
        var from = { transform: 'translate(' + (small.left - large.left) + 'px,' + (small.top - large.top) + 'px) scale(' + small.width / large.width + ',' + small.height / large.height + ')', opacity: .75 };
        var to = { transform: 'none', opacity: 1 }; clone.style.transformOrigin = 'top left';
        var duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-image')) || 350;
        var animation = clone.animate(reverse ? [to, from] : [from, to], { duration: duration, easing: 'cubic-bezier(.22,1,.36,1)' });
        running.set(image, { animation: animation, clone: clone });
        animation.onfinish = function () { clone.remove(); running.delete(image); if (done) done(); };
    }
    window.ImageTransition = { open: function (image, source) {
        cancel(image);
        if (image.complete && image.naturalWidth) bridge(image, source, false);
        else {
            var requested = image.src;
            image.addEventListener('load', function () { if (image.src === requested && image.getClientRects().length) bridge(image, source, false); }, { once: true });
        }
    }, close: function (image, source) { bridge(image, source, true); }, cancel: cancel };
    document.addEventListener('visibilitychange', function () { if (document.hidden) Array.from(running.keys()).forEach(cancel); });
    document.getElementById('motionToggle').addEventListener('click', function () { Array.from(running.keys()).forEach(cancel); });
})();
