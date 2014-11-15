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
    function QueryString() {
    }

    /** @see {@link } */
    QueryString.prototype.listen = function () {
        let self = this;

        /**
         * Add the event listener
         */
        events.on("http-on-modify-request", function (event) {
            let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
            let url = urls.URL(channel.URI.spec);
            let path = url.pathname;
            let query = querystring.parse(url.search);
            let qpos = path.indexOf("?"); // need to split out #anchor as well?
            let regexp = self.getRegExp(channel.URI.host.replace(/:\d+$/, ""));

            if (regexp !== null && qpos > -1) {
                let args = path.substring(qpos + 1, path.length);
                let changed = args.replace(regexp, "").replace(/^[&]+/i, "");

                if (args !== changed) {
                    path = path.substring(0, qpos);

                    if (changed) {
                        path += "?" + changed;
                    }

                    channel.URI.path = path;
                }
            }
        }, true);
    };

    return function () {
        throw new Error("unimplemented");
    };

};

// This is an example for inspiration
// Adds "html5=1" and "autoplay=0" params to YouTube video URls
/*
events.on('http-on-modify-request', function (event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var href = channel.URI.spec;

    var ytre = /https?:\/\/(www\.)?youtube\.com\/watch/i;
    if (!ytre.test(href)) {
        return;
    }

    var vre = /([?&]v=[^&]+)/i;
    if (!vre.test(href)) {
        return;
    }

    if (!/[?&]html5=[01]/.test(href)) {
        href = href.replace(vre, '$1&html5=1');
    }

    if (!/[?&]autoplay=[01]/.test(href)) {
        href = href.replace(vre, '$1&autoplay=0');
    }

    channel.URI.spec = href;
}, true);
*/
