/** @module content-scripts */
/* global require, exports */

const {env} = require("sdk/system/environment");
const file = require("sdk/io/file");
const {attach} = require("sdk/content/mod");
const {Style} = require("sdk/stylesheet/style");
const simplePrefs = require("sdk/simple-prefs");
const {pathFor} = require("sdk/system").pathFor;
const tabs = require("sdk/tabs");

exports.spec = (function () {
    "use strict";

    let spec = {};

    spec.directory = null;

    /**
     * Get the userscript directory
     * First look in the system environment for BUBBLE_USERSCRIPT_DIRECTORY
     * Next look in the extension preferences for a configured userscript directory
     * Finally default to ~/.js - compatible with the extension "dotjs"
     *
     * @access private
     * @return {string} The userscript directory
     */
    let getDirectory = function () {
        if (spec.directory) {
            return spec.directory;
        }

        let dir = null;

        if (env["BUBBLE_USERSCRIPT_DIRECTORY"]) {
            dir = env["BUBBLE_USERSCRIPT_DIRECTORY"];
        } else if (simplePrefs.prefs["userscript_directory"]) {
            dir = simplePrefs.prefs["userscript_directory"];
        } else {
            dir = file.join(pathFor("Home"), ".js");
            simplePrefs.prefs["userscript_directory"] = dir;
        }

        if (!dir || !file.exists(dir + "/")) {
            console.warn("userscript directory (" + dir + ") does not exist.");
            dir = null;
        } else {
            console.debug("userscript directory: " + dir);
        }

        spec.directory = dir;
    };

    /**
     * Gets the contents of the user scripts and stylesheets.
     * It would be better to just return the file paths and let the browser
     * handle loading them, but sadly the `contentScriptFile` directive
     * in PageMod/tabs does not accept file URLs outside of the extension's
     * folder, so instead this reads them all and returns the actual contents.
     *
     * @return {Object} An object containing the user scripts and stylesheets
     */
    spec.getFiles = function () {
        let files = {scripts: [], styles: []};

        if (!spec.directory) {
            return files;
        }

        // Resolve the files ending in ".user.js" and ".user.css"
        file.list(spec.directory).forEach(function (fileName) {
            if (fileName.endsWith(".user.js")) {
                files.scripts.push(fileName);
            } else if (fileName.endsWith(".user.css")) {
                files.styles.push(fileName);
            }
        });

        files.scripts = files.scripts.sort();
        files.styles = files.styles.sort();

        console.debug("got content scripts/styles", files.scripts, files.styles);

        // Read in the contents of scripts and styles
        files.scripts = spec.readFiles(spec.directory, files.scripts);
        files.styles = spec.readFiles(spec.directory, files.styles);

        return files;
    };

    /**
     * Reads in files from a given directory
     *
     * @param {string} dir The directory to read from
     * @param {array} filenames The filenames to read
     *
     * @return {array} The contents of each file
     */
    spec.readFiles = function (dir, filenames) {
        return filenames.map(function (fileName) {
            return file.read(file.join(dir, fileName));
        }).filter(function (fileContents) {
            return "" !== fileContents.trim();
        });
    };

    /**
     * Handles errors in content scripts and passes them back to the console
     */
    spec.errorHandler = function (error) {
        // pass errors back to the dev console
        console.error(error);
    };

    /**
     * Handles page loads, injecting the content scripts and stylesheets.
     */
    spec.tabHandler = function (tab) {
        // Only run on http(s) urls
        if (!tab.url.startsWith("http")) {
            return;
        }

        console.debug("tab loaded at " + tab.url);

        let files = spec.getFiles();

        if (files.scripts.length) {
            tab.attach({
                contentScript: files.scripts,
                onError: spec.errorHandler,
            });
        }

        if (files.styles.length) {
            // attach can take an array of string stylesheets
            attach(new Style({source: files.styles}), tab);
        }
    };

    /**
     * Enables the content scripts functionality
     */
    spec.enable = function () {
        // When this pref changes, update the cached directory
        simplePrefs.on("userscript_directory", function () {
            console.info("got new userscript_directory pref", simplePrefs.prefs["userscript_directory"]);
            spec.directory = null;
            getDirectory();
        });

        getDirectory();

        tabs.on("ready", spec.tabHandler);
    };

    return Object.seal(spec);
})();
