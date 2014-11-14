
// only do this in the top frame
if (!window.frameElement) {
    alert('it works!');
}

// Open External Links in New Tab, add rel=noreferrer, remove a.ping
(function () {
    var host = window.location.host;

    var handleLink = function (a) {
        if (a.ping) {
            a.ping = '';
            a.removeAttribute('ping');
        }

        if (a.href && 0 === a.href.indexOf('http') && a.host !== host) {
            var rels = a.rel ? a.rel.trim().split(/\s+/) : [];
            a.rel = rels.concat('noreferrer').join(' ');
            a.target = '_blank';
        }
    };

    // run on new nodes
    new MutationObserver(function (mutations, observer) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes) {
                [].forEach.call(mutation.addedNodes, function (node) {
                    if (node instanceof HTMLAnchorElement) {
                        handleLink(node);
                    } else if (node.querySelectorAll) {
                        [].forEach.call(node.querySelectorAll('a'), handleLink);
                    }
                });
            }
        });
    }).observe(document, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });

    // run on existing nodes when DOM is loaded
    [].forEach.call(document.getElementsByTagName('a'), handleLink);
})();
