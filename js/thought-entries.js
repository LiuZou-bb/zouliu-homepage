/* Thought reader routes share the existing return and reading-progress UI. */
(function () {
    'use strict';
    var readerIds=['friend','love','beauty','childhood','sorry','lifeDepth','technologyWealth','aiEra'];
    function refresh() {
        readerIds.forEach(function(id){
            document.querySelectorAll('#'+id+' .container h3,#'+id+' .container p').forEach(function(node,index){if(!node.id)node.id=id+'-passage-'+index;});
        });
        // Local readers always precede the external-article group, including
        // when a future entry is appended at the end of the source list.
        var entries=document.querySelector('.thought-entries');
        if(entries){
            function isExternal(node){var link=node.querySelector('h2 a');return link&&/^(https?:)?\/\//i.test(link.getAttribute('href')||'');}
            var external=Array.from(entries.children).find(function(node){return node.matches('.thought-entry')&&isExternal(node);});
            if(external)Array.from(entries.children).filter(function(node){return node.matches('.thought-entry')&&!isExternal(node);}).forEach(function(node){
                // Leave correctly placed nodes attached so returning readers
                // retain their keyboard focus as well as their scroll position.
                if(external.compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING)entries.insertBefore(node,external);
            });
            var friend=document.getElementById('thought-entry-friend');
            if(external&&friend&&friend.nextElementSibling!==external)entries.insertBefore(friend,external);
        }
    }
    refresh();
    document.addEventListener('exhibition:route',refresh);
    window.ThoughtEntries={readerIds:readerIds,resolve:function(){return null;},refresh:refresh};
})();
