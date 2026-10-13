# Dropzone build

RS_Rate 2.0.2 uses Dropzone 5.9.3, declared in `package.json` and resolved by the committed `yarn.lock`.
The upstream source remains unchanged. Its original MIT license is included in both browser packages.

## Preparation

Use Node.js 24 and the declared Yarn 4 release:

```console
yarn install --immutable
yarn verify
yarn package
```

`scripts/dropzone_entry.js` exposes the original class as `window.Dropzone` and sets its version from the locked
package metadata. `scripts/build_dropzone.mjs` uses esbuild, a development dependency, to bundle that entry and
the original emitter, options, preview template, and Dropzone class. No other source modules are permitted.
The HTML preview template is a local text resource, not executable code.

The bundle is readable, with minification disabled and class and function names retained. It targets native ES2018
features, without adding the legacy core-js polyfills found in the upstream distribution. Executable strings,
ActiveX construction, and the iframe and document write fallbacks are not part of this bundle.
The library's image and EXIF helpers remain original library functions; their Base64 decoding processes image data,
not executable code. The extension's script policy remains `script-src 'self'; object-src 'self';`.

`scripts/build.mjs` places the same generated file at `node_modules/dropzone/dist/dropzone.js` in both targets,
preserving the existing view references. It includes `dropzone.js.map`, with the exact original source contents,
and `node_modules/dropzone/LICENSE`. The map uses relative paths and contains no private checkout address.
Neither esbuild nor its platform binaries is included in the extension packages.

## Verification

The tests reproduce the bundle in a separate directory and compare both code and source map byte for byte.
Build and archive checks reject a Dropzone bundle containing legacy polyfills or dynamic string compilation.
The library is exercised with string compilation disabled, including literal filename and error display,
file selection, PDF type validation, multipart fields, authentication headers, JSON success, and server errors.
Network and DOM objects in those tests are controlled fixtures; they do not replace installation in a browser.

Both unsigned browser archives contain 92 matching build assets. Firefox validation reports no errors and
17 library warnings. The [validation assessment](security.md) describes the warnings without suppressing them.
Preparing and testing these archives does not submit them to a store or establish store approval.

## Chrome review

On October 13, 2026, the publisher received a Red Titanium rejection for version 2.0.1. The quoted fragment occurs
in that retained archive's Dropzone distribution and implements legacy Object.create fallbacks using ActiveX
or an iframe. The [Chrome readability policy](https://developer.chrome.com/docs/webstore/program-policies/code-readability)
allows minification but prohibits obscuring extension functionality. Native execution checks alone do not settle
the readability of all code included in a package.

The retained 2.0.1 archives and signed Firefox XPI remain unchanged. The 2.0.2 Chromium archive was loaded in a
temporary Edge profile and exercised with a synthetic reader against the private server trial. Original PDF upload,
malformed PDF refusal, annotated copy extraction, popup session retention, and logout completed. The
[Chromium installation record](chrome.md#chromium-installation-check) identifies the package and scope of this check.
Regular Firefox distribution still requires a separate Mozilla signature and installation check.
Uploading, requesting review, and publishing each remain separate decisions by the publisher.
