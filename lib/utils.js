/** @module utils */
/* global require, exports */

const simplePrefs = require("sdk/simple-prefs");
const {Cc, Ci} = require("chrome");

/**
 * Parse json, logging any parse errors.
 *
 * @param {string} jsonString
 * @return {*} - decoded json value or null
 */
exports.parseJson = function (jsonString, expectedReturnType) {
    let decoded = null;

    if (value) {
        try {
            decoded = JSON.parse(jsonString);
        } catch (e) {
            console.error("invalid json", jsonString);
            console.exception(e);
        }
    }

    if ("string" === typeof (expectedReturnType) && expectedReturnType !== typeof (decoded)) {
        let errMsg = "parsed json was not of expected type '" + expectedReturnType + "'";
        console.error(errMsg);
        decoded = null;
    }

    return decoded;
};

/**
 * This gets the URI object from an nsIHttpChannel, and validates that it
 * is a valid HTTP url. Some pages seem to present non-HTTP urls for
 * whatever reason, despite the naming of "nsIHttpChannel"
 *
 * @param subject - the event subject
 * @param nsHttpChannel channel
 *
 * @return {nsIURI|false} - the channel URI, or false if it was invalid.
 */
exports.getChannelUri = function (channel) {
    if (!channel || !channel.URI) {

        throw new TypeError("instance of nsIHttpChannel expected");

    } else if (channel.URI.spec && 0 === channel.URI.spec.indexOf('http')) {

        return channel.URI;

    } else {
        console.warn("channel.URI is non-http, query string will not be modified", uri);

        return false;
    }
};

/**
 * Redirect an nsIHttpChannel to the given URL
 *
 * @param {nsIHttpChannel} channel
 * @param {string} url - a valid HTTP url string
 */
exports.redirectChannelToUrl = function (channel, url) {
    let ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    let newUri = ioService.newURI(url, null, null);

    channel.redirectTo(newUri);
};

/**
 * Get a nsIDOMWindow instance for an nsIHttpChannel
 *
 * @see {@link https://stackoverflow.com/questions/12062419}
 *
 * @param {nsIHttpChannel} channel
 *
 * @return {nsIDOMWindow}
 */
exports.getBrowserForChannel = function (channel) {
    let notificationCallbacks = channel.notificationCallbacks ?
        channel.notificationCallbacks :
        channel.loadGroup.notificationCallbacks;

    if (notificationCallbacks) {
        return notificationCallbacks.getInterface(Ci.nsIDOMWindow);
    }
};

/**
 * Determine if the given nsIHttpChannel is for the top document (not a frame)
 *
 * @see {@link https://stackoverflow.com/questions/12062419}
 *
 * @param {nsIHttpChannel} channel
 *
 * @return {boolean}
 */
exports.isChannelForTopDocument = function (channel) {
    let dom = exports.getBrowserForChannel(channel);
    if (dom) {
        if (dom.top.document && dom.location === dom.top.document.location) {
            return true;
        }
    }

    return false;
};
