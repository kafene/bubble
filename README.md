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

## rules.json

You can use a file, containing valid JSON (but called whatever you want) to
specify rules for request/response filtering. Rules can modify request and
response headers, and add and remove query parameters. In the future more
functionality may be added.

The rules file must contain an array of objects, each object representing
a rule. When you visit a URL, all of the rules are iterated through and
the rules that should apply to that URL are combined into a single rule
which is used to perform the modifications.

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

## See Also

**SDK**:

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

**Libraries**:

- [https://github.com/nrf110/deepmerge](nrf110/deepmerge)

## License

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
