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

/**
 * A module for altering query strings
 * Adding and removing parameters on a per-site basis.
 *
 * @todo unimplemented
 */
exports.queryString = function () {
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
        // No rules to apply, nothing to modify
        if (!this._rules["remove_query_parameter"].length &&
            !this._rules["add_query_parameter"].length)
        {
            return urlString;
        }

        // parsed URL, similar to HTMLAnchorElement
        let url = urls.URL(urlString);

        // query string, strip leading "?"
        let query = url.search.replace(/^\?/, '');

        // Empty query, nothing to modify
        if (!query) {
            return urlString;
        }

        // parse query
        let parsedQuery = querystring.parse(query);

        if (Array.isArray(this._rules["remove_query_parameter"])) {
            this._rules["remove_query_parameter"].forEach(function (paramName) {
                if (paramName in parsedQuery) {
                    delete parsedQuery[paramName];
                }
            });
        }

        if ("[object Object]" === Object.prototype.toString.call(this._rules["add_query_parameter"])) {
            for (let paramName in this._rules["add_query_parameter"]) {
                let paramValue = this._rules["add_query_parameter"][paramName];

                parsedQuery[paramName] = paramValue;
            }
        }

        let newQueryString = querystring.stringify(parsedQuery);

        url.search = '?' + newQueryString;

        return url.href;
    };

    /** @see {@link } */
    QueryString.prototype.attachRequestObserver = function () {
        let self = this;

        /**
         * Add the event listener
         */
        events.on("http-on-modify-request", function (event) {
            let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
            let originalUrl = channel.URI.spec;

            let filteredUrl = self.filter(originalUrl);

            // Only modify request when URL has changed
            if (filteredUrl !== originalUrl) {
                channel.URI.spec = filteredURL;
            }
        }, true);
    };

    /**
     * Shorthand to attach the request observer,
     * for API compatibility with HeaderModifier
     */
    HeaderModifier.prototype.attach = function () {
        this.attachRequestObserver();
    };

    return QueryString;
};

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
