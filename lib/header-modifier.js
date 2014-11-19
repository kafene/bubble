/** @module header-modifier */
/* global require, exports */

const {Ci} = require("chrome");
const events = require("sdk/system/events");

exports.spec = (function () {
    "use strict";

    let spec = {};

    spec.rules = null;

    /** @private */
    let error = function (type, name, value, httpChannel, ex) {
        console.error("failed to set " + type + "header", {
            name: name,
            value: value,
            url: httpChannel.URI.spec,
        });
        ex && console.execption(ex);
    };

    spec.setRequestHeader = function (httpChannel, name, value) {
        name = name.toLowerCase();
        value = (value === null) ? "" : value;

        try {
            httpChannel.setRequestHeader(name, value, false);
        } catch (e) {
            spec.error("request", name, value, httpChannel, e);
        }
    };

    spec.setResponseHeader = function (httpChannel, name, value) {
        name = name.toLowerCase();
        value = (value === null) ? "" : value;

        try {
            httpChannel.setResponseHeader(name, value, false);
        } catch (e) {
            spec.error("response", name, value, httpChannel, e);
        }
    };

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
    },

    spec.enable = function (rules) {
        spec.rules = rules;
        events.on("http-on-modify-request", spec.requestObserver, true);
        events.on("http-on-examine-response", spec.responseObserver, true);
    },

    spec.disable = function () {
        events.off("http-on-modify-request", spec.requestObserver);
        events.off("http-on-examine-response", spec.responseObserver);
        spec.rules = null;
    };

    return Object.seal(spec);
})();
