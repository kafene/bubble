
// only do this in the top frame
if (!window.frameElement) {
    // alert('it works!');
}

// Open External Links in New Tab, add rel=noreferrer, remove a[ping]
(function () {
    var host = window.location.host;

    var handleLink = function (a) {
        // always remove a[ping]
        if (a.ping) {
            a.ping = '';
            a.removeAttribute('ping');
        }

        // Only add noreferrer and target=_blank to links on different hosts
        if (a.href && 0 === a.href.indexOf('http') && a.host !== host) {
            if (a.rel) {
                a.rel = a.rel.trim().split(/\s+/).concat('noreferrer').join(' ');
            } else {
                a.rel = 'noreferrer';
            }

            a.target = '_blank';
        }
    };

    // run on new nodes
    new MutationObserver(function (mutations, observer) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes) {
                [].forEach.call(mutation.addedNodes, function (node) {
                    if (node instanceof HTMLAnchorElement) {
                        // got a link
                        handleLink(node);
                    } else if (node.querySelectorAll) {
                        // got an element containing links
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

    // run on existing nodes immediately
    [].forEach.call(document.getElementsByTagName('a'), handleLink);
})();
