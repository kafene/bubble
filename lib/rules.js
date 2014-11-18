/** @module rules */
/* global require, exports */

/** @see {@link http://mzl.la/1yECxns} */
const urls = require("sdk/url");

/**
 * This module is for dealing with the rules preference.
 * It"s in a separate module because it"s a bit complex.
 */
exports.Rules = (function () {
    "use strict";

    /*
     * @constructor
     * @alias module:rules
     * @param {module:prefs} prefs - instance of prefs for getting preferences.
     */
    function Rules(prefs) {
        // Ensure instance is constructed
        if (!(this instanceof Rules)) {
            return new Rules(prefs);
        }

        /** @access private */
        this._prefs = prefs;
    }

    /**
     * Parse a single rule
     *
     * @param {object} rules - the already parsed rules
     * @param {object|array} item - the rule definition
     * @return {?object} - the parsed rule definition
     */
    Rules.prototype.parse = function (rules, item) {
        /*jshint maxstatements:20 */
        rules = rules || {};

        // merge set_response_header rules
        if ("[object Object]" === Object.prototype.toString.call(item["set_response_header"])) {
            let prop = "set_response_header";

            for (let key in item[prop]) {
                if (item[prop].hasOwnProperty(key)) {
                    rules[prop][key] = item[prop][key];
                }
            }
        }

        // merge set_request_header rules
        if ("[object Object]" === Object.prototype.toString.call(item["set_request_header"])) {
            let prop = "set_request_header";

            for (let key in item[prop]) {
                if (item[prop].hasOwnProperty(key)) {
                    rules[prop][key] = item[prop][key];
                }
            }
        }

        // merge add_query_parameter rules
        if ("[object Object]" === Object.prototype.toString.call(item["add_query_parameter"])) {
            let prop = "add_query_parameter";

            for (let key in item[prop]) {
                if (item[prop].hasOwnProperty(key)) {
                    rules[prop][key] = item[prop][key];
                }
            }
        }

        // merge remove_query_parameter rules
        if (Array.isArray(item["remove_query_parameter"])) {
            let prop = "remove_query_parameter";
            rules[prop] = rules[prop].concat(item[prop]);
        }

        return rules;
    };

    /**
     * Get rules
     *
     * @throws {Error} - if the url param is provided but is not a valid url
     * @param {?string} url - a valid URL; if not provided all rules are returned.
     * @return {object} - all found rules
     */
    Rules.prototype.get = function (url) {
        // retrieve rules from the injected prefs object
        let prefRules = this._prefs.getJson("rules");

        // ensure url is valid if provided
        if (url && !urls.isValidURI(url)) {
            throw new Error("invalid url: " + url);
        }

        /**
         * Return value object with empty default vaules
         *
         * @property {object} set_response_header:
         *     request headers to change in outgoing requests
         * @property {object} set_request_header:
         *     response headers to change in incoming responses
         * @property {array}  add_query_parameter:
         *     query parameters to add to urls in outgoing requests
         * @property {array}  remove_query_parameter:
         *     query parameters to remove from urls in outgoing requests
         * @type {object}
         */
        let rules = {
            "set_response_header": {},
            "set_request_header": {},
            "add_query_parameter": {},
            "remove_query_parameter": [],
        };

        for (let name in prefRules) {
            // only collect matched items
            if (!this.match(name, url)) {
                continue;
            }

            rules = this.parse(rules, prefRules[name]);
        }

        return rules;
    };

    /**
     * Test if a rule matches against a given url. The rule name is either
     * a hostname, host, or regex bounded by `//`
     *
     * @param {string} name - rule name - url or pattern to match against url param
     * @param {object} url - a URL object from sdk/url.URL()
     * @return {boolean} - whether the rule URL matches the given URL
     */
    Rules.prototype.match = function (name, url) {
        /*jshint maxstatements:20 */

        if ("<all_urls>" === name) {
            // special - match all urls
            return true;
        }

        // This both parses and normalizes the URL.
        // URL object is similar to an HTMLAnchorElement (html <a> tag)
        let a = urls.URL(url);

        // exact match against host or href
        // "google.com:80" will match only "google.com:80"
        // "http://google.com/" will match only "http://google.com/"
        if (a.href === name || name === a.host) {
            return true;
        }

        // exact match against hostname
        // "google.com:80" will match "google.com:443"
        // but NOT "www.google.com:80"
        if (name === a.hostname) {
            return true;
        }

        // match subdomains against host
        // rule named "google.com:80" will match "mail.google.com:80"
        // but NOT mail.google.com:443
        if (a.host.endsWith("." + name)) {
            return true;
        }

        // match subdomains against hostname
        // rule named "google.com" will match "mail.google.com"
        // as well as mail.google.com:80, mail.google.com:443, etc.
        if (a.hostname.endsWith("." + name)) {
            return true;
        }

        // regular expression formatted like "/url/", or "/url/i"
        // matched only against the full URL.
        if (/^\/.*?\/i?$/.test(name)) {
            let isCaseSensitive = name.endsWith("/i");
            let regexString = name.replace(/(^\/|\/i?$)/g, "");
            let flag = isCaseSensitive ? "i" : "";

            return new RegExp(regexString, flag).test(a.href);
        }

        // no match
        return false;
    };

    return Rules;
})();
