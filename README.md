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

## Setting request headers

Setting request headers overrides outgoing headers sent from the browser.
Header names are case-insensitive.
Header values set to the empty string or `null` will be removed instead of set.
Websites you connect to will see any headers added or replaced instead of
the originals. This can be used to override or remove, for example the
`Referer`, `Origin`, and `User-Agent` headers.

## Setting response headers

Setting response headers overrides incoming headers from websites.
Header names are case-insensitive.
Header values set to the empty string or `null` will be removed instead of set.
The browser will interpret the incoming headers after they are processed,
so this can be used to override some browser functionality, including
introducing security vulnerabilities and other problems by changing headers
like `Content-Security-Policy`, `Access-Control-Allow-Origin`,
`Strict-Transport-Security`, and other security related headers.
If you know what you're doing though, this can be a quite powerful thing!

As far as I'm aware, no currently developed AMO extension provides this
functionality and it is the main reason for this extension's existence.

## Attaching content scripts

If there is an environment variable named `BUBBLE_USERSCRIPT_DIRECTORY`,
that is always used as the directory for content scripts.
Else if there is a preference set in the extension settings, that is used.
Otherwise, ~/.js/ is used, and the extension userscript directory preference
is set to that value as a default.

Content scripts are loaded sorted by name -- this allows priority loading.
For example, 01-jquery.user.js will be loaded before 02-jquery-plugin.user.js,
and both will be loaded before my_userscript.user.js, so that dependencies
can be ordered correctly.

Content scripts are injected immediately when the tab's DOM is ready, and
immediately have sandboxed access to the document. The `unsafeWindow`
property is available for unsandboxed access.

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
- [sdk/util/object](http://mzl.la/1wTOUtD)
- [nsIHttpChannel](http://mzl.la/1vbtw7H)
- [nsIURI](http://mzl.la/11gFEqM)
- [chrome](http://mzl.la/1x0tqiA)

## License

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
