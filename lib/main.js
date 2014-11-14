/* global require, exports */

/**
 * Note: available console methods are
 *     - console.debug(object[, object, ...])
 *     - console.error(object[, object, ...])
 *     - console.exception(exception)
 *     - console.info(object[, object, ...])
 *     - console.log(object[, object, ...])
 *     - console.time(name)
 *     - console.timeEnd(name)
 *     - console.trace()
 *     - console.warn(object[, object, ...])
 */

// {"Referer": ""}
// {"Content-Security-Policy": "", "X-Content-Security-Policy": "", "X-WebKit-CSP": "",
// "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,GET"}

/*
        "<all_urls>": {
            "remove": [
                "utm_source",
                "utm_medium",
                "utm_term",
                "utm_content",
                "utm_campaign",
                "utm_reader",
                "utm_place",
                "ga_source",
                "ga_medium",
                "ga_term",
                "ga_content",
                "ga_campaign",
                "ga_reader",
                "ga_place",
                "yclid",
                "_openstat",
                "fb_action_ids",
                "fb_action_types",
                "fb_ref",
                "fb_source",
                "action_object_map",
                "action_type_map",
                "action_ref_map",
            ],
        },
        'facebook.com': {
            "remove": ["ref", "fref", "hc_location"],
        },
        'amazon.com': {
            "remove": ["qid", "sr", "keywords", "ie", "s", "ref"],
        },
        'google.com': {
            "remove": ["aq", "client", "rls"],
        },
        '^(chrome|play)\\.google\\.com$': {
            "hostnameAsRegExp": true,
            "remove": ["hl"],
        },
        'addons.opera.com': {
            "includeSubDomains": false,
            "remove": ["display", "language"],
        },
        'addons.mozilla.org': {
            "includeSubDomains": false,
            "remove": ["collection_id", "src"],
        },
        'f-droid.org': {
            "remove": ["fdfilter", "fdpage", "fdid"],
        },
        'imdb.com': {
            "remove": ["ref_"],
        },
        'youtube.com': {
            "remove": ["feature"],
            "add": ["html5=1", "autoplay=0"],
        },
*/

/*
{
    "<all_urls>": {
        "set_response_header": {
            "Content-Security-Policy": "",
            "X-Content-Security-Policy": "",
            "X-WebKit-CSP": ""
        },
        "set_request_header": [],
        "remove_query_parameter": []
    },
    "/^http:\\/\\/(www\\.)?youtube.com\\/watch\\?/i": {
        "add_query_parameter": [
            "html5=1",
            "autoplay=0"
        ]
    },
    "www.reliply.org": {"set_request_header": {"X-Test-Param": "LOL"}},
    "kafene.org": {"set_request_header": {"X-Test-Param": "bubble"}}
}

{"www.reliply.org": {"set_response_header": {"X-Test-Param": "LOL"}},
"pgl.yoyo.org": {"set_response_header": {"X-Test-Param": "bubble"}}}
*/

// YOUTUBE ADD HTML5 + AUTOPLAY PARAMS

// bubble.sdk.events.on('http-on-modify-request', function (event) {
//     var channel = event.subject.QueryInterface(bubble.sdk.components.interfaces.nsIHttpChannel);
//     var href = channel.URI.spec;

//     var ytre = /https?:\/\/(www\.)?youtube\.com\/watch/i;
//     if (!ytre.test(href)) {
//         return;
//     }

//     var vre = /([?&]v=[^&]+)/i;
//     if (!vre.test(href)) {
//         return;
//     }

//     if (!/[?&]html5=[01]/.test(href)) {
//         href = href.replace(vre, '$1&html5=1');
//     }

//     if (!/[?&]autoplay=[01]/.test(href)) {
//         href = href.replace(vre, '$1&autoplay=0');
//     }

//     channel.URI.spec = href;
// }, true);

exports.main = function () {
    "use strict";

    let prefs = require("prefs").Prefs();
    let rules = require("rules").Rules(prefs);
    let headerModifier = require("header-modifier").HeaderModifier(rules);
    let contentScripts = require("content-scripts").ContentScripts(prefs);

    headerModifier.attach();
    contentScripts.inject();
};

// PURE URL

/*
// @see https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/querystring
this.sdk.events.on('http-on-modify-request', function (event) {
    var channel = event.subject.QueryInterface(this.sdk.components.interfaces.nsIHttpChannel);
    var path = channel.URI.path;
    var qpos = path.indexOf('?'); // need to split out #anchor as well?
    var regexp = PureUrl.getRegExp(channel.URI.host.replace(/:\d+$/, ''));

    if (regexp !== null && qpos > -1) {
        var args = path.substring(qpos + 1, path.length);
        var cleaned = args.replace(regexp, '').replace(/^[&]+/i, '');

        if (args !== cleaned) {
            path = path.substring(0, qpos);
            if (cleaned) {
                path += '?' + cleaned;
            }
            channel.URI.path = path;
        }
    }
}, true);
*/
