**Warning: this extension is not yet complete and not fully tested or functional. It is not ready for general consumption yet.**

# ![icon](https://raw.githubusercontent.com/kafene/bubble/master/icons/icon.png "icon") Bubble

A multipurpose Firefox extension for adding content scripts (userscripts, user styles), modifying request and response headers, modifying query parameters, and otherwise customizing your internet experience.

## rules.json

You can use a file, containing valid JSON (but called whatever you want) to specify rules for request/response filtering. Rules can modify request and response headers, and add and remove query parameters. In the future more functionality may be added.

The rules file must contain an array of objects, each object representing a rule. When you visit a URL, all of the rules are iterated through and the rules that should apply to that URL are combined into a single rule which is used to perform the modifications.

Here is an example rule, containing all of the available keys:

```json
{
    "disabled": false,
    "@comment": "This rule is not disabled",
    "match": "google.com",
    "match_type": "hostname",
    "include_subdomains": true,
    "set_request_header": {
        "X-Google-Message": "Hello, Google!"
    },
    "set_response_header": {
        "X-Google-Reply": "Hello from Google!"
    },
    "set_query_parameter": {
        "q": "I always search for this",
        "client": null
    }
}
```

**What these do:**

- **disabled**: Determines whether the rule is disabled or not.
- **@comment**: Nothing, it's just for adding a comment, since JSON does not otherwise support comments.
- **match**: This is the pattern to match. It can either be an exact string, or a regular expression, regular expressions are formatted like `"/^(www\\.)?domain\\.tld/i"` - much like a literal javascript regular expression. The supported flags are `g`, `m`, `s`, and `i`; the only one of much use is `i`, to set the matching to be case-insensitive. The special value `<all_urls>` matches all urls.
- **match_type**: This decides the key which **match** will be executed against. Valid keys are `scheme`, `userPass`, `host`, `port`, `path`, `hostname`, `pathname`, `hash`, `href`, `origin`, `protocol`, and `search`. The most useful ones are going to be `hostname` and `href`, but you can use any of them. You can read more about what each means at [the addon-sdk documentation for sdk/url](http://mzl.la/1F0L1t3).
- **include_subdomains**: For matches against `host` or `hostname`, this determines whether subdomains will be included in the match. This is only compatible with simple strings, not regular expressions. It is essentially equivalent to the regular expression `/(^|\.)domain\.tld$/i`.
- **set_request_header**: These are request headers which will be sent by the browser. You may provide the empty string, or `null` to remove a header instead of setting it. Header names are case-insensitive. This can be used to override or remove, for example the `Referer`, `Origin`, and `User-Agent` headers.
- **set_response_header**: These are the response headers which the browser will receive. You may provide the empty string, or `null` to remove a header instead of setting it. Header names are case-insensitive. This can be used to override some browser functionality, including introducing security vulnerabilities and other problems by changing headers like `Content-Security-Policy`, `Access-Control-Allow-Origin`, `Strict-Transport-Security`, and other security related headers. If you know what you're doing though, this can be a quite powerful thing! As far as I'm aware, no currently developed extension provides this functionality and it is the main reason for this extension's existence.
- **set_query_parameter**: These are query parameters which will be added or removed from matching URLs. To remove a query parameter, set its value to `null`, to set it, any string will do.

For more examples, see [example-rules.json](/example-rules.json).

## Attaching content scripts

If there is an environment variable named `BUBBLE_USERSCRIPT_DIRECTORY`, that is always used as the directory for content scripts. Else if there is a preference set in the extension settings, that is used. Otherwise, ~/.js/ is used, and the extension userscript directory preference is set to that value as a default.

Content scripts are loaded sorted by name -- this allows priority loading. For example, 01-jquery.user.js will be loaded before 02-jquery-plugin.user.js, and both will be loaded before my_userscript.user.js, so that dependencies can be ordered correctly.

Content scripts are injected immediately when the tab's DOM is ready, and immediately have sandboxed access to the document. The `unsafeWindow` property is available for unsandboxed access.

## Building

You'll need [cfx](http://mzl.la/1x3gBUI) and the [add-on SDK](http://mzl.la/1EGy2uN) to build and test the extension. You can look at or use the Makefile command `make run` to run the extension in a test environment. I recommend creating a separate profile for cfx runs, by default it will use a blank, fresh profile every time which can get a bit irritating when you want to save a few settings or have some quick access bookmarks or history for use during testing.

If you're running from the command line you can see error messages and debug logs there. They also appear in the browser console (`Ctrl+Shift+J`). Unfortunately some error messages from the browser's internals and the SDK itself occasionally sneak in, which are unrelated to this extension.

By default cfx sets the `extensions.sdk.console.logLevel` to `info` when it's running a browser instance. You may wish to go into `about:config` and add the entry `extensions.jid1-BUBBLEIs7871vQ@jetpack.sdk.console.logLevel` with the value "all" to get full debug output.

## Links

**SDK**:

- [The add-on SDK](http://mzl.la/1EGy2uN)
- [mozilla/addon-sdk on GitHub](https://github.com/mozilla/addon-sdk)
- [cfx](http://mzl.la/1x3gBUI)

**SDK APIs**

- [sdk/io/file](http://mzl.la/1usXjqK)
- [sdk/url](http://mzl.la/1yECxns)
- [sdk/simple-prefs](http://mzl.la/1v8RVvj)
- [sdk/page-mod](http://mzl.la/1v8RmBw)
- [sdk/content/mod](http://mzl.la/1BnKmnp)
- [sdk/stylesheet/style](http://mzl.la/1xW2Ghq)
- [sdk/tabs](http://mzl.la/1xE3s4k)
- [sdk/querystring](http://mzl.la/1xpwztL)
- [sdk/system](http://mzl.la/1AghgVu)
- [sdk/system/events](http://mzl.la/1ECYHIP)
- [sdk/system/environment](http://mzl.la/1wxoihW)
- [sdk/util/object](http://mzl.la/1wTOUtD)
- [nsIHttpChannel](http://mzl.la/1vbtw7H)
- [nsIURI](http://mzl.la/11gFEqM)
- [nsIURL](http://mzl.la/1ymjqid)
- [chrome](http://mzl.la/1x0tqiA)

**Libraries**:

- [https://github.com/nrf110/deepmerge](nrf110/deepmerge)

---

Icon courtesy of [rejon at openclipart.org](https://openclipart.org/detail/177671/hand-drawn-bubble-remix-by-rejon-177671), licensed [in the public domain](https://creativecommons.org/publicdomain/zero/1.0/).

## TODO

- [ ] tests, tests, tests!
- [ ] documentation - verify all jsdoc syntax and generate
- [x] improve readme
- [ ] use a generator for faster loading content scripts
- [x] Query string parameter removal and adding
- [x] maybe have an includeSubdomains directive in rules
- [ ] Only change query string in top frame?
- [ ] Once sdk/io/fs.watchFile is implemented, use that instead of loading the config files on every request.
- [ ] More detailed matching semantics for rules?
- [ ] Some per-domain logic for loading content scripts and styles, maybe use something like "www.example.com.user.js" and look up filenames by hostname. Do allow something like "N.default.user.js" or just "default.user.js" for scripts that load on all pages. Maybe strip numeric prefix after sorting.
- [ ] Cookie tweaks

## License

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
