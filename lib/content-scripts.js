/** @module content-scripts */
/* global require, exports */

/** @see {@link http://mzl.la/1wxoihW} */
const {env} = require("sdk/system/environment");

/** @see {@link http://mzl.la/1usXjqK} */
const file = require("sdk/io/file");

/** @see {@link http://mzl.la/1BnKmnp} */
const {attach} = require("sdk/content/mod");

/** @see {@link http://mzl.la/1xW2Ghq} */
const {Style} = require("sdk/stylesheet/style");

/** @see {@link http://mzl.la/1xE3s4k} */
const tabs = require("sdk/tabs");

/**
 * This module injects content scripts and stylesheets found
 * in a directory on the user's hard drive. It does NOT have
 * to be a file in the extension's data directory, it can be
 * anywhere on the disk.
 */
exports.ContentScripts = (function () {
    "use strict";

    /** @access private */
    let _prefs;

    /**
     * @constructor
     * @alias module:content-scripts
     * @param {module:prefs} prefs - instance of Prefs for getting preferences.
     */
    function ContentScripts(prefs) {
        // Ensure instance is constructed
        if (!(this instanceof ContentScripts)) {
            return new ContentScripts(prefs);
        }

        _prefs = prefs;
    }

    /**
     * Get the userscripts/stylesheets directory
     * If there is an environment variable named BUBBLE_USERSCRIPT_DIRECTORY,
     * that is always used. Else if there is a preference set in the extension
     * settings, that is used. Otherwise, ~/.js/ is used, and the extension
     * userscript directory preference is set to that value as a default.
     *
     * @return {string} - the userscript directory
     */
    ContentScripts.prototype.getDirectory = function () {
        let dir = null;

console.warn(file.join(require("sdk/system").pathFor("Home"), ".js"));

        if (env["BUBBLE_USERSCRIPT_DIRECTORY"]) {
            // Environment variable
            dir = env["BUBBLE_USERSCRIPT_DIRECTORY"];

            console.info("got userscript directory from environment: " + dir);
        } else if (_prefs.isSet("userscript_directory")) {
            // Configured preference via sdk/simple-prefs
            dir = _prefs.get("userscript_directory");
        } else {
            // ~/.js - compatible with the "dotjs" extension
            dir = file.join(require("sdk/system").pathFor("Home"), ".js");

            // Set as default
            _prefs.set("userscript_directory", dir);
        }

        if (!dir || !file.dirname(dir)) {
            console.warn("userscript directory (" + dir + ") does not exist.");
            dir = null;
        } else {
            console.info("userscript directory: " + dir);
        }

        return dir;
    };

    /**
     * Get the user's userscript and stylesheet files
     * It would be better to return just filenames and let the browser resolve
     * them however the addon-sdk does not allow loading local filenames
     * dynamically via contentScriptFile/contentStyleFile options, so instead
     * this returns an array containing the full contents of all the detected
     * script and style files to be passed to the sdk's sandboxed eval.
     *
     * @return {object} - An object contaning the userscripts and styles.
     */
    ContentScripts.prototype.getFiles = function () {
        let dir = this.getDirectory();
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

        // Sort by name - allows priority loading For example,
        // 01-jquery.user.js will be loaded before 02-jquery-plugin.user.js,
        // and both will be loaded before my_userscript.user.js,
        // so that dependencies can be ordered correctly.
        ret.scripts = ret.scripts.sort();
        ret.styles = ret.styles.sort();

        console.info("got content scripts/styles", ret.scripts, ret.styles);

        // Read in the contents of scripts and styles
        ret.scripts = this.readFiles(dir, ret.scripts);
        ret.styles = this.readFiles(dir, ret.styles);

        return ret;
    };

    /**
     * This reads an array of file names into an equivalent array containing
     * the contents of those files. The files are sorted by name.
     *
     * @param {string} dir - directory the files are located in
     * @param {array} filenames - array of file names to read
     * @return {array} files - contents of the filenames
     */
    ContentScripts.prototype.readFiles = function (dir, filenames) {
        return filenames.map(function (fileName) {
            return file.read(file.join(dir, fileName));
        }).filter(function (fileContents) {
            // filter out empties just in case
            return "" !== fileContents.trim();
        });
    };

    /**
     * Inject the user's scripts and stylesheets
     * They are injected immediately when the tab's DOM is ready,
     * and immediately have sandboxed access to the document. The
     * `unsafeWindow` property is available for unsandboxed access.
     */
    ContentScripts.prototype.inject = function () {
        let self = this;

        tabs.on("ready", function (tab) {
            // Only run on HTTP urls
            if (!tab.url.startsWith("http")) {
                return;
            }

            console.info("tab loaded at " + tab.url);

            let files = self.getFiles();

            tab.attach({
                contentScript: files.scripts,
                onError: function (error) {
                    // pass errors back to the dev console
                    console.error(error);
                },
            });

            // attach can take an array of string stylesheets
            attach(new Style({source: files.styles}), tab);
        });
    };

    return ContentScripts;
})();
