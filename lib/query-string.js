/** @module query-string */
/* global require, exports */

const events = require("sdk/system/events");
const querystring = require("sdk/querystring");
const urls = require("sdk/url");
const {Ci} = require("chrome");
const urlUtils = require("sdk/url/utils");

exports.spec = (function () {
    "use strict";

    let spec = {};

    spec.rules = null;

    // @todo - this is fugly, refactor it
    spec.filter = function (urlString) {
        let rules = spec.rules.get(urlString);

        if (!rules["set_query_parameter"]) {
            // Nothing to modify
            return urlString;
        }

        let url = urls.URL(urlString); // !! properties are readonly !!
        let query = url.search ? url.search.replace(/^\?/, "") : "";
        let parsedQuery = query ? (querystring.parse(query) || {}) : {};
        let modified = false;
        let params = rules["set_query_parameter"];

        Object.keys(params).forEach(function (name) {
            if (params[name] === null) {
                // deleting

                if (name in parsedQuery) {
                    modified = true;
                    delete parsedQuery[name];
                }
            } else {
                // adding
                if (parsedQuery[name] !== params[name]) {
                    modified = true;
                    parsedQuery[name] = params[name];
                }
            }
        });

        if (!modified) {
            return urlString;
        }

        let newQueryString = querystring.stringify(parsedQuery);

        if (query === newQueryString ||
            querystring.unescape(newQueryString) === querystring.unescape(query))
        {
            return urlString;
        }

        // Do not prepend "?" if it's empty.
        newQueryString = newQueryString ? ("?" + newQueryString) : "";

        // sadly urls.URL() returns an object with read-only properties
        // so manually reassemble the url for now... @TODO fixme
        let newUrlString = [
            url.protocol || "http:",
            "//",
            url.userPass || "",
            url.host || "",
            url.pathname || "/",
            newQueryString,
            url.hash || "",
        ].join("");

        return newUrlString;
    };

    spec.requestObserver = function (event) {
        // let {subject, type, data} = event;
        let httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);

        if (httpChannel.URI && 0 === httpChannel.URI.spec.indexOf("http")) {
            let originalUrl = httpChannel.URI.spec;
            let filteredUrl = spec.filter(originalUrl);

            // Only modify request when URL has changed
            if (filteredUrl !== originalUrl) {
                console.info("modifying url from \n" + originalUrl + " to \n" + filteredUrl);
                httpChannel.redirectTo(urlUtils.newURI(filteredUrl));
            }
        }
    };

    spec.enable = function (rules) {
        spec.rules = rules;
        events.on("http-on-modify-request", spec.requestObserver, true);
    };

    spec.disable = function () {
        events.off("http-on-modify-request", spec.requestObserver);
        spec.rules = null;
    };

    return Object.seal(spec);
})();
