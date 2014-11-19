/** @module main */
/* global require, exports */

// const {Cc, Ci} = require("chrome");
// const urls = require("sdk/url");
// const urlUtils = require("sdk/url/utils");

// require("sdk/system/events").on("http-on-modify-request", function (event) {
//     let httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);
//     let ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);

//     let uri = ioService.newURI("https://www.youtube.com/watch?v=iodjsdoifjsdof#tip", null, null);
//     let url = uri.QueryInterface(Ci.nsIURL);
//     url.query = "foo=bar";

//     console.info(url);
// }, false);

exports.main = function () {
    "use strict";

    let {spec: rules} = require("rules");
    //require("header-modifier").spec.enable(rules);
    require("query-string").spec.enable(rules);
    //require("content-scripts").spec.enable();
};
