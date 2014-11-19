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
    let cache = {}; // cached rules - @todo

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

    spec.load = function () {
        try {
            return JSON.parse(file.read(spec.getFile()));
        } catch (e) {
            console.error("rules file is not configured / contains invalid JSON");
            console.exception(e);
        }
    };

    spec.get = function (url) {
        if (!urls.isValidURI(url)) {
            throw new Error("invalid url: " + url);
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
        }

        return compiledRules;
    };

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

        // scheme, userPass, host, port, path, hostname, hash, href, origin, protocol, or search
        let pieceToMatch = parsedUrl[matchType];
        if (!pieceToMatch) {
            console.warn("unknown URL key: " + matchType);
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
