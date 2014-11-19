/** @module content-scripts */
/* global require, exports */

const {env} = require("sdk/system/environment");
const file = require("sdk/io/file");
const {attach} = require("sdk/content/mod");
const {Style} = require("sdk/stylesheet/style");
const simplePrefs = require("sdk/simple-prefs");
const tabs = require("sdk/tabs");

exports.spec = (function () {
    "use strict";

    let spec = {};

    spec.getDirectory = function () {
        let dir = null;

        if (env["BUBBLE_USERSCRIPT_DIRECTORY"]) {
            dir = env["BUBBLE_USERSCRIPT_DIRECTORY"];
        } else if (simplePrefs.prefs["userscript_directory"]) {
            dir = simplePrefs.prefs["userscript_directory"];
        } else {
            dir = file.join(require("sdk/system").pathFor("Home"), ".js");
            simplePrefs.prefs["userscript_directory"] = dir;
        }

        if (!dir || !file.dirname(dir)) {
            console.warn("userscript directory (" + dir + ") does not exist.");
            dir = null;
        } else {
            console.info("userscript directory: " + dir);
        }

        return dir;
    };

    spec.getFiles = function () {
        let dir = spec.getDirectory();
        let ret = {scripts: [], styles: []};

        if (!dir) {
            return ret;
        }

        // Resolve the files ending in ".user.js" and ".user.css"
        file.list(dir).forEach(function (fileName) {
            if (fileName.endsWith(".user.js")) {
                ret.scripts.push(fileName);
            } else if (fileName.endsWith(".user.css")) {
                ret.styles.push(fileName);
            }
        });

        ret.scripts = ret.scripts.sort();
        ret.styles = ret.styles.sort();

        console.info("got content scripts/styles", ret.scripts, ret.styles);

        // Read in the contents of scripts and styles
        ret.scripts = spec.readFiles(dir, ret.scripts);
        ret.styles = spec.readFiles(dir, ret.styles);

        return ret;
    };

    spec.readFiles = function (dir, filenames) {
        return filenames.map(function (fileName) {
            return file.read(file.join(dir, fileName));
        }).filter(function (fileContents) {
            return "" !== fileContents.trim();
        });
    };

    spec.errorHandler = function (error) {
        // pass errors back to the dev console
        console.error(error);
    };

    spec.tabHandler = function (tab) {
        // Only run on http(s) urls
        if (!tab.url.startsWith("http")) {
            return;
        }

        console.info("tab loaded at " + tab.url);

        let files = spec.getFiles();

        tab.attach({
            contentScript: files.scripts,
            onError: spec.errorHandler,
        });

        // attach can take an array of string stylesheets
        attach(new Style({source: files.styles}), tab);
    };

    spec.enable = function () {
        tabs.on("ready", spec.tabHandler);
    };

    return Object.seal(spec);
})();
