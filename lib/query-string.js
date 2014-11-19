/** @module query-string */
/* global require, exports */

const {Ci} = require("chrome");
const events = require("sdk/system/events");
const querystring = require("sdk/querystring");
// const urls = require("sdk/url");
const urlUtils = require("sdk/url/utils");

exports.spec = (function () {
    "use strict";

    let spec = {};

    spec.rules = null;

    /**
     * Filters the URL, adding and removing query params as specified by rules
     *
     * @param {nsIURL} originalURL
     *
     * @return {nsIURL} filtered URL
     */
    spec.filter = function (originalURL) {
        let rules = spec.rules.get(originalURL.spec);
        if (!rules["set_query_parameter"]) {
            return originalURL; // nothing to modify
        }

        let newURI = urlUtils.newURI(originalURL.spec);
        let newURL = newURI.QueryInterface(Ci.nsIURL);
        let parsedQuery = querystring.parse(newURL.query) || {};
        let modified = false; // was anything modified?
        let params = rules["set_query_parameter"];

        Object.keys(params).forEach(function (name) {
            if (params[name] === null) {
                // deleting
                if (name in parsedQuery) {
                    modified = true;
                    delete parsedQuery[name];
                }
            } else {
                // adding - check if it already existed with the same value
                // so it's possible to tell if the URL was modified.
                if (parsedQuery[name] !== params[name]) {
                    modified = true;
                    parsedQuery[name] = params[name];
                }
            }
        });

        if (modified) {
            newURL.query = querystring.stringify(parsedQuery);
            return newURL;
        } else {
            return originalURL;
        }
    };

    /**
     * Observe requests to modify the query string
     */
    spec.requestObserver = function (event) {
        // let {subject, type, data} = event;
        let httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);

        if (httpChannel.URI && httpChannel.URI.spec.startsWith("http")) {
            let originalURL = httpChannel.URI.QueryInterface(Ci.nsIURL);
            let filteredURL = spec.filter(originalURL);
            if (!originalURL.equals(filteredURL)) {
                console.info("modifying url\nfrom: " + originalURL.spec +
                            "\nto:  " + filteredURL.spec);
                httpChannel.redirectTo(filteredURL);
            }
        }
    };

    /**
     * Enable the request observer
     */
    spec.enable = function (rules) {
        spec.rules = rules;
        events.on("http-on-modify-request", spec.requestObserver, true);
    };

    /**
     * Disable the request observer
     */
    spec.disable = function () {
        events.off("http-on-modify-request", spec.requestObserver);
        spec.rules = null;
    };

    return Object.seal(spec);
})();
