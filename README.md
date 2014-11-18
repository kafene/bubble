**Warning: this extension is not yet complete and not fully tested
or functional. It is not ready for general consumption yet.**

# Bubble

A multipurpose Firefox extension for adding content scripts
(userscripts, user styles), modifying request and response headers,
modifying query parameters, and otherwise customizing your internet experience.

---

Example rules

See [example-rules.json](example-rules.json)

For now these have to be pased in to the extension's preferences
page in `about:addons` - Mozilla's prefences don't have a long text
entry field, so it's a single line, but pasting multi-line content
works fine. In the future it may be changed to a file you can place
anywhere to make editing rules easier.

## Building

You'll need [cfx](http://mzl.la/1x3gBUI) and the
[add-on SDK](http://mzl.la/1EGy2uN) to build and test the extension.
The file "run" is what I use to run the extension during development.
I recommend creating a separate profile for cfx runs, by default it will
use a blank, fresh profile every time which can get a bit irritating when
you want to save a few settings or have some quick access bookmarks or history.

If you're running from the command line you can see error messages and
debug logs there. They also appear in the browser console (`Ctrl+Shift+J`).
Unfortunately some error messages from the browser's internals and the SDK
itself occasionally sneak in, which are unrelated to this extension.

By default cfx sets the `extensions.sdk.console.logLevel` to `info` when
it's running a browser instance. You may wish to go into `about:config` and
add the entry `extensions.jid1-BUBBLEIs7871vQ.sdk.console.logLevel` with the
value "all" to get full debug output.

## SDK Reference

- [sdk/system/environment](http://mzl.la/1wxoihW)
- [sdk/io/file](http://mzl.la/1usXjqK)
- [sdk/url](http://mzl.la/1yECxns)
- [sdk/simple-prefs](http://mzl.la/1v8RVvj)
- [sdk/content/mod](http://mzl.la/1BnKmnp)
- [sdk/stylesheet/style](http://mzl.la/1xW2Ghq)
- [sdk/tabs](http://mzl.la/1xE3s4k)
- [sdk/querystring](http://mzl.la/1xpwztL)
- [sdk/system/events](http://mzl.la/1ECYHIP)
- [nsIHttpChannel](http://mzl.la/1vbtw7H)
- [nsIURI](http://mzl.la/11gFEqM)
- [chrome](http://mzl.la/1x0tqiA)

## License

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
