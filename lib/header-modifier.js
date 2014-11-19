/** @module header-modifier */
/* global require, exports */

const {Ci} = require("chrome");
const events = require("sdk/system/events");

exports.spec = (function () {
    "use strict";

    let spec = {};

    spec.rules = null;

    /** @access private */
    let error = function (type, name, value, httpChannel, exception) {
        console.error("failed to set " + type + "header", {
            name: name,
            value: value,
            url: httpChannel.URI.spec,
        });

        if (exception) {
            console.execption(exception);
        }
    };

    /**
     * Set a request header
     *
     * @param {nsIHttpChannel} httpChannel
     * @param {string} name Header name
     * @param {string|null} value Header value
     */
    spec.setRequestHeader = function (httpChannel, name, value) {
        name = name.toLowerCase();
        value = (value === null) ? "" : value;

        try {
            httpChannel.setRequestHeader(name, value, false);
        } catch (e) {
            error("request", name, value, httpChannel, e);
        }
    };

    /**
     * Set a response header
     *
     * @param {nsIHttpChannel} httpChannel
     * @param {string} name Header name
     * @param {string|null} value Header value
     */
    spec.setResponseHeader = function (httpChannel, name, value) {
        name = name.toLowerCase();
        value = (value === null) ? "" : value;

        try {
            httpChannel.setResponseHeader(name, value, false);
        } catch (e) {
            error("response", name, value, httpChannel, e);
        }
    };

    /**
     * The observer for modifying requests (http-on-modify-request)
     */
    spec.requestObserver = function (event) {
        let httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);

        if (httpChannel.URI && 0 === httpChannel.URI.spec.indexOf("http")) {
            let url = httpChannel.URI.spec;
            let headers = spec.rules.get(url)["set_request_header"];

            if (headers) {
                console.info("got request headers to modify", url, headers);
                Object.keys(headers).forEach(function (name) {
                    spec.setRequestHeader(httpChannel, name, headers[name]);
                });
            }
        }
    };

    /**
     * The observer for modifying responses (http-on-examine-response)
     */
    spec.responseObserver = function (event) {
        let httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);

        if (httpChannel.URI && 0 === httpChannel.URI.spec.indexOf("http")) {
            let url = httpChannel.URI.spec;
            let headers = spec.rules.get(url)["set_response_header"];

            if (headers) {
                console.info("got response headers to modify", url, headers);
                Object.keys(headers).forEach(function (name) {
                    spec.setResponseHeader(httpChannel, name, headers[name]);
                });
            }
        }
    };

    /**
     * Enables the header modifier functionality
     */
    spec.enable = function (rules) {
        spec.rules = rules;
        events.on("http-on-modify-request", spec.requestObserver, true);
        events.on("http-on-examine-response", spec.responseObserver, true);
    };

    /**
     * Disables the header modifier functionality
     */
    spec.disable = function () {
        events.off("http-on-modify-request", spec.requestObserver);
        events.off("http-on-examine-response", spec.responseObserver);
        spec.rules = null;
    };

    return Object.seal(spec);
})();
