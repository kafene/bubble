/** @module query-string */
/* global require, exports */

/** @see {@link http://mzl.la/1ECYHIP|sdk/system/events} */
const events = require("sdk/system/events");

/** @see {@link http://mzl.la/1xpwztL} */
const querystring = require("sdk/querystring");

/** @see {@link http://mzl.la/1yECxns} */
const urls = require("sdk/url");

/** @see {@link http://mzl.la/1x0tqiA} */
const {Ci} = require("chrome");

const utils = require('utils');

/**
 * A module for altering query strings
 * Adding and removing parameters on a per-site basis.
 *
 * @todo unimplemented
 */
exports.QueryString = (function () {
    "use strict";

    /**
     * @constructor
     * @alias module:query-string
     */
    function QueryString(rules) {
        // Ensure instance is constructed
        if (!(this instanceof QueryString)) {
            return new QueryString(rules);
        }

        /** @access private */
        this._rules = rules;
    }

    /**
     * Filters the query string, applying user rules
     *
     * @param {string} - The url to filter
     * @return {string} - The url with query string filtered
     */
    QueryString.prototype.filter = function (urlString) {
        let rules = this._rules.get(urlString);

        // No rules to apply, nothing to modify
        if (!rules) {
            console.info("no rules to modify query string for url " + urlString);
            return urlString;
        } else {
            console.info("got rules: ", rules);
        }

        // parsed URL, similar to HTMLAnchorElement
        // This seems to have read only properties though...
        let url = urls.URL(urlString);

        // query string, strip leading "?"
        let query = url.search ? url.search.replace(/^\?/, "") : "";

        // parse query or if none, use empty object.
        let parsedQuery = query ? (querystring.parse(query) || {}) : {};

        if (Array.isArray(rules["remove_query_parameter"])) {
            rules["remove_query_parameter"].forEach(function (paramName) {
                if (paramName in parsedQuery) {
                    delete parsedQuery[paramName];
                }
            });
        }

        if ("[object Object]" === Object.prototype.toString.call(rules["add_query_parameter"])) {
            for (let paramName in rules["add_query_parameter"]) {
                if (rules["add_query_parameter"].hasOwnProperty(paramName)) {
                    parsedQuery[paramName] = (rules["add_query_parameter"][paramName] || "");
                }
            }
        }

        // @todo - might need to use querystring.escape() and unescape() here.

        let newQueryString = querystring.stringify(parsedQuery);

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

    /** @see {@link } */
    QueryString.prototype.attachRequestObserver = function () {
        let self = this;

        /**
         * Add the event listener
         */
        events.on("http-on-modify-request", function (event) {
            // let {subject, type, data} = event;
            let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
            let uri = utils.getChannelUri(channel);

            if (uri && uri.spec) {
                let originalUrl = uri.spec;
                console.info("original url: " + originalUrl);
                let filteredUrl = self.filter(originalUrl);
                console.info("filtered url: " + filteredUrl);

                // Only modify request when URL has changed
                if (filteredUrl !== originalUrl) {
                    console.info("modifying url from \n" + originalUrl + " to \n" + filteredUrl);
                    // channel.redirectTo(filteredUrl);
                    channel.URI.spec = filteredUrl;
                }
            }
        }, true);
    };

    /**
     * Shorthand to attach the request observer,
     * for API compatibility with HeaderModifier
     */
    QueryString.prototype.attach = function () {
        this.attachRequestObserver();
    };

    return QueryString;
})();

/*
function (c) {
    var url = c.url;

    var remove = [
        'utm_source', 'utm_medium', 'utm_term', 'utm_content',
        'utm_campaign', 'utm_reader', 'utm_place', 'ga_source',
        'ga_medium', 'ga_term', 'ga_content', 'ga_campaign',
        'ga_place', 'yclid', '_openstat', 'fb_action_types',
        'fb_action_ids', 'fb_ref', 'fb_source',
        'action_object_map', 'action_type_map', 'action_ref_map',
    ];

    var a = doc.createElement('A');
    a.href = url;

    a.search = '?' + ((a.search || '')
        .replace(/(^[&?#=]+)|([&?#=]+$)/g, '')
        .split('&')
        .map(function (v) {
            return v.split('=');
        })
        .filter(function (v) {
            return v[0].length > 0 && -1 === remove.indexOf(v[0]);
        })
        .map(function (v) {
            return v[0] + (v[1] ? '=' + v[1] : '');
        })
        .join('&')
        .replace(/(^[&?#=]+)|([&?#=]+$)/g, '')
    );

    a.hash = '';

    url = a.href;
    url = url.replace(/[&?#=]+$/, '');
    url = url.replace(/[\/]+$/, '/');
    url = url.replace(/[&?#=]+\/$/, '/');

    c.url = url;
},
*/
