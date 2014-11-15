/** @module main */
/* global require, exports */

exports.main = function () {
    "use strict";

    let prefs = require("prefs").Prefs();
    let rules = require("rules").Rules(prefs);
    let headerModifier = require("header-modifier").HeaderModifier(rules);
    let contentScripts = require("content-scripts").ContentScripts(prefs);

    headerModifier.attach();
    contentScripts.inject();
};
