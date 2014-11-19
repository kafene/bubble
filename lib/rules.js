/** @module rules */
/* global require, exports */

const {env} = require("sdk/system/environment");
const file = require("sdk/io/file");
const urls = require("sdk/url");
const simplePrefs = require("sdk/simple-prefs");
// const object = require("sdk/util/object");
const {deepmerge} = require("misc");

exports.spec = (function () {
    "use strict";

    let spec = {};

    spec.cache = {}; // cached rules

    /**
     * Get the rules file
     *
     * @return {string} The path to the rules file
     */
    spec.getFile = function () {
        let rulesFile = null;

        if (env["BUBBLE_RULES_FILE"]) {
            rulesFile = env["BUBBLE_RULES_FILE"];
        } else if (simplePrefs.prefs["rules_file"]) {
            rulesFile = simplePrefs.prefs["rules_file"];
        }

        if (!rulesFile || !file.isFile(rulesFile)) {
            console.error("rules file is not configured / does not exist.");
        } else {
            return rulesFile;
        }
    };

    /**
     * Load and parse the contents of the rules file
     *
     * @return {mixed} Parsed json or null on error
     */
    spec.load = function () {
        let rulesFile = spec.getFile();
        let result = null;

        if (rulesFile) {
            try {
                result = JSON.parse(file.read(rulesFile));
            } catch (e) {
                result = null;
                console.error("rules file is not configured / contains invalid JSON");
                console.exception(e);
            }
        }

        return result;
    };

    /**
     * Get all rules for the given URL
     *
     * @param {string} url A valid HTTP url
     *
     * @return {object} The compiled/combined rules
     */
    spec.get = function (url) {
        if (!urls.isValidURI(url)) {
            console.error("invalid url: " + url);
            return {};
        }

        // cached rules
        if (spec.cache[url]) {
            console.info("got rules from cache", spec.cache[url], url);
            return spec.cache[url];
        }

        let rules = spec.load();
        let compiledRules = {};

        rules.forEach(function (rule) {
            if (spec.match(rule, url)) {
                compiledRules = deepmerge(compiledRules, rule);
            }
        });

        if (Object.keys(compiledRules).length > 0) {
            console.info("got rules", compiledRules, url);
            spec.cache[url] = compiledRules;
        }

        return compiledRules;
    };

    /**
     * Determine if a rule matches against the given URL
     *
     * @param {object} rule
     * @param {string} url
     *
     * @return {boolean}
     */
    spec.match = function (rule, url) {
        /*jshint maxstatements:20, camelcase:false */

        // Allow disabling rules
        if (rule.disabled) {
            return false;
        }

        let {match, match_type: matchType} = rule;

        if (match === "<all_urls>") {
            return true;
        }

        // This both parses and normalizes the URL.
        // URL object is similar to an HTMLAnchorElement (html <a> tag)
        let parsedUrl = urls.URL(url);

        // scheme, host, path, hostname, href, origin, etc.
        let pieceToMatch = parsedUrl[matchType];
        if (!pieceToMatch) {
            console.error("unknown URL key: " + matchType);
            return false;
        }

        let regexp = /^\/(.+?)\/([migs]{0,4})$/.exec(match) || false;
        if (regexp) {
            // console.info("testing " + regexp[1] + " against " + pieceToMatch);
            return new RegExp(regexp[1], regexp[2]).test(pieceToMatch);
        } else {
            if (rule["include_subdomains"]) {
                return (match === pieceToMatch) || (pieceToMatch.endsWith("." + match));
            } else {
                return (match === pieceToMatch);
            }
        }
    };

    return Object.seal(spec);
})();
