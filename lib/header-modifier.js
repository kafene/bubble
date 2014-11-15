/** @module header-modifier */
/* global require, exports */

/** @see {@link http://mzl.la/1ECYHIP|sdk/system/events} */
const events = require("sdk/system/events");

/** @see {@link http://mzl.la/1x0tqiA} */
const {Ci} = require("chrome");

/**
 * This module modifies http request and response headers
 * sent and received by the browser.
 */
exports.HeaderModifier = (function () {
    "use strict";

    /**
     * @constructor
     * @alias module:header-modifier
     * @param {module:rules} rules - instance of Rules for getting rules.
     */
    function HeaderModifier(rules) {
        // Ensure instance is constructed
        if (!(this instanceof HeaderModifier)) {
            return new HeaderModifier(rules);
        }

        /** @access private */
        _rules = rules;
    }

    /**
     * Set a request header, overriding outgoing headers sent from the browser.
     * Header names are case-insensitive.
     * Header values set to the empty string will be removed instead of set.
     * Websites you connect to will see any headers added or replaced
     * by this method instead of the originals. This can be used to override
     * or remove, for example the Referer, Origin, and User-Agent headers.
     *
     * @see {@link http://mzl.la/1vbtw7H|nsIHttpChannel}
     * @param {nsIHttpChannel} channel
     * @param {string} name - header name
     * @param {string} value - header value
     */
    HeaderModifier.prototype.setRequestHeader = function (channel, name, value) {
        name = name.toLowerCase();

        let logMessage = {
            "name": name,
            "value": value,
            "url": channel.URI.spec,
        };

        try {
            // false = don"t append, overwrite it if it exists.
            channel.setRequestHeader(name, value, false);

            console.info("set request header: ", logMessage);
        } catch (e) {
            // Catch and log exception so other headers can be sent if possible.
            logMessage.error = e;
            console.error("failed to set request header: ", logMessage);
            console.exception(e);
        }
    };

    /**
     * Set a response header, overriding incoming headers from websites.
     * Header names are case-insensitive.
     * Header values set to the empty string will be removed instead of set.
     * The browser will interpret the incoming headers after they are
     * processed, so this can be used to override some browser functionality,
     * including introducing security vulnerabilities and other problems by
     * changing headers like Content-Security-Policy, Access-Control-Allow-Origin,
     * Strict-Transport-Security, and other security related headers.
     * If you know what you're doing though, this can be a quite powerful thing!
     * As far as I'm aware, no currently developed AMO extension provides this
     * functionality and it is the main reason for this extension's existence.
     *
     * @see {@link http://mzl.la/1vbtw7H|nsIHttpChannel}
     * @param {nsIHttpChannel} channel
     * @param {string} name - header name
     * @param {string} value - header value
     */
    HeaderModifier.prototype.setResponseHeader = function (channel, name, value) {
        name = name.toLowerCase();

        let logMessage = {
            "name": name,
            "value": value,
            "url": channel.URI.spec,
        };

        try {
            // false = don"t append, overwrite it if it exists.
            channel.setResponseHeader(name, value, false);

            console.info("set response header: ", logMessage);
        } catch (e) {
            // Catch and log exception so other headers can be sent if possible.
            logMessage.error = e;
            console.error("failed to set request header: ", logMessage);
            console.exception(e);
        }
    };

    /**
     * This gets the URI object from an event subject, and validates that it is
     * a valid HTTP url. Some pages seem to present non-HTTP urls for whatever
     * reason, despite the naming of "nsIHttpChannel"
     *
     * @see {@link http://mzl.la/1vbtw7H|nsIHttpChannel}
     * @param subject - the event subject
     * @param nsHttpChannel channel
     * @return {string|false} - the channel url, or false if it was invalid.
     */
    HeaderModifier.prototype.getChannelUrl = function (channel) {
        let uri = channel.URI;

        if (uri && uri.spec && 0 === uri.spec.indexOf("http")) {
            return uri.spec;
        } else {
            console.warn("channel.URI is non-http, headers will not be modified", uri);
            return false;
        }
    };

    /**
     * Attach an observer which handles modifying outgoing http requests
     */
    HeaderModifier.prototype.attachRequestObserver = function () {
        let self = this;

        events.on("http-on-modify-request", function (event) {
            // let {subject, type, data} = event;
            let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
            let url = self.getChannelUrl(channel);

            if (url) {
                let headers = self._rules.get(url)["set_request_header"];
                console.debug("got request headers to modify", url, headers);

                for (let name in headers) {
                    if (headers.hasOwnProperty(name)) {
                        self.setRequestHeader(channel, name, headers[name]);
                    }
                }
            }
        }, true);
    };

    /**
     * Attach an observer which handles modifying incoming http responses
     */
    HeaderModifier.prototype.attachResponseObserver = function () {
        let self = this;

        events.on("http-on-examine-response", function (event) {
            // let {subject, type, data} = event;
            let channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
            let url = self.getChannelUrl(channel);

            if (url) {
                let headers = self._rules.get(url)["set_response_header"];
                console.debug("got response headers to modify", url, headers);

                for (let name in headers) {
                    if (headers.hasOwnProperty(name)) {
                        self.setResponseHeader(channel, name, headers[name]);
                    }
                }
            }
        }, true);
    };

    /**
     * Shorthand to attach both the request and response observers
     */
    HeaderModifier.prototype.attach = function () {
        this.attachRequestObserver();
        this.attachResponseObserver();
    };

    return HeaderModifier;
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
