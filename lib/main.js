/** @module main */
/* global require, exports */

exports.main = function () {
    "use strict";

    let {spec: rules} = require("rules");
    //require("header-modifier").spec.enable(rules);
    require("query-string").spec.enable(rules);
    //require("content-scripts").spec.enable();
};
