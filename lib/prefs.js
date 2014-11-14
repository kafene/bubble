/** @module prefs */
/* global require, exports */

/** @see {@link http://mzl.la/1v8RVvj} */
const simplePrefs = require("sdk/simple-prefs");

/**
 * This module helps dealing with preferences
 */
exports.Prefs = (function () {
    "use strict";

    /**
     * @constructor
     * @alias module:prefs
     * @throws {TypeError} - if provided callback is provided but is not a function
     * @param {?function} callback - callback invoked when preferences are changed.
     */
    function Prefs(callback) {
        // Ensure instance is constructed
        if (!(this instanceof Prefs)) {
            return new Prefs(callback);
        }

        if (callback && "function" !== typeof (callback)) {
            throw new TypeError("callback must be a function");
        }

        /**
         * Store a copy of SimplePrefs for other classes to access
         *
         * @access public
         */
        this.simplePrefs = simplePrefs;

        /**
         * Event listener - use the provided callback or fall back to default
         * of just logging the preference change. It receives one argument,
         * the name of the changed preference, as seen below.
         *
         * @access private
         */
        this._listener = (callback || function (name) {
            console.info("preference updated", name, simplePrefs.prefs[name]);
        });

        // set up request listener
        simplePrefs.on("", this._listener);
    }

    /**
     * Remove the event listener added by the constructor
     */
    Prefs.removeListener = function () {
        simplePrefs.removeListener("", this._listener);
    };

    /**
     * Get a preference
     *
     * @throws {Error} - if the preference name does not exist
     * @param string name - preference name
     * @return {*} value - preference value
     */
    Prefs.prototype.get = function (name) {
        if (!this.has) {
            throw new Error("no preference named '" + name + "' exists");
        }

        return simplePrefs.prefs[name];
    };

    /**
     * Set a preference
     *
     * @throws {Error} - if the preference name does not exist
     * @param {string} name - preference name
     * @param {*} value - preference value
     */
    Prefs.prototype.set = function (name, value) {
        if (!this.has(name)) {
            throw new Error("no preference named '" + name + "' exists");
        }

        simplePrefs.prefs[name] = value;
    };

    /**
     * Check if a preference exists.
     * This returns true if "name" is a key in simplePrefs.prefs,
     * regardless of whether it is set to a truthy value or not.
     *
     * @param {string} name - preference name
     * @return {boolean} - whether "name" exists
     */
    Prefs.prototype.has = function (name) {
        return (name in simplePrefs.prefs);
    };

    /**
     * Check if a preference exists and is set to a non empty value
     *
     * @param {string} name - preference name
     * @return {boolean} - whether "name" exists and is non-empty
     */
    Prefs.prototype.isSet = function (name) {
        return (this.has(name) ? !!this.get(name) : false);
    };

    /**
     * Get preference with valid JSON value or return null.
     * The value should parse into an array or object.
     *
     * @param {string} name - preference name
     * @return {*} - decoded json value or null
     */
    Prefs.prototype.getJson = function (name) {
        let value = this.get(name);
        let decoded = null;

        if (value) {
            try {
                decoded = JSON.parse(value);
                console.debug("got value for pref '" + name + "': " + value);
            } catch (e) {
                console.error("invalid json in preference '" + name + "'");
                console.exception(e);
            }
        }

        // Both array and object have type "object"
        if ("object" !== typeof (decoded)) {
            decoded = null;
        }

        return decoded;
    };

    return Prefs;
})();
