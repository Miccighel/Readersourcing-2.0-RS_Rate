# Firefox distribution

`yarn package:firefox` creates the unsigned Firefox archive from the declarations in `manifest-ff.json` and the
existing source. Temporary installation through `about:debugging` supports development, but does not verify an
installation in a regular Firefox release.

## Signing

Mozilla signs extensions through [Mozilla Add-ons](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).
The `unlisted` channel produces a signed copy for distribution outside the public catalog. It does not create a
public listing, but the extension remains subject to Mozilla's policies and possible review.

Before submitting a version:

1. run `yarn install --immutable`, `yarn verify`, and `yarn package:firefox`;
2. retain the exact archive and its SHA-256 hash;
3. prepare the corresponding source, manifests, build scripts, `package.json`, and `yarn.lock` for review;
4. provide the [validation assessment](security.md), including the 21 visible library warnings;
5. sign in to the Add-ons Developer Hub and select distribution outside the catalog.

The packaging commands replace their usual output files. When retaining an earlier submission, build the new
version with a distinct filename instead:

```console
yarn build
yarn web-ext build --source-dir dist/firefox --artifacts-dir artifacts --filename rs_rate-firefox-2.0.1.zip --ignore-files '!node_modules' '!node_modules/**'
```

Retain the corresponding source and returned signed XPI under distinct filenames as well. The Firefox declaration
uses `version`; the optional Chromium `version_name` field is not part of the Firefox manifest.

The extension retains its original Mozilla identifier, `rs-rate@readersourcing.com`, in the account's existing
RS_Rate entry. Submit a new version through that entry. Do not create another identity or replace an existing signed
version silently.

The source archive must reproduce the package with Node.js 24 and Yarn 4 through `yarn install --immutable` and
`yarn package:firefox`. Do not include credentials, browser profiles, `.env` files, or unrelated project data.

The existing `web-ext` dependency also supports signing from the command line:

```console
yarn web-ext sign --channel unlisted --source-dir dist/firefox --artifacts-dir artifacts --ignore-files '!node_modules' '!node_modules/**'
```

Supply credentials through `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` in a protected local environment or secret manager,
not in the command arguments or repository. Mozilla's [command reference](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/)
describes source submission and review options. Running this command submits the package to Mozilla; packaging alone
does not submit it.

## Installation check

Use a separate temporary profile in a regular Firefox release, with signature enforcement left enabled. Install the
returned signed XPI through the Add-ons Manager rather than through temporary debugging. Verify the extension identity,
version, requested permissions, and declared data categories before accepting installation.

With a synthetic reader and local RS_Server, check login, reopening the popup, preparation, original PDF upload,
annotated PDF extraction, and logout. A browser restart must clear the authentication token while retaining the selected
server address. A signed package is not ready for distribution until these installation checks have passed.

The local browser results are recorded in RS_Server's `docs/integration.md`. Mozilla review and actual signature status
must be recorded separately; a successful local validator does not imply that a package has been signed or approved.

## Submission of October 9, 2026

Mozilla approved version 2.0.0 through the existing extension entry on the unlisted channel for Firefox desktop.
Its version identifier is `6558449`, and its file identifier is `5102587`. Validation reported no errors and 21 warnings.
The corresponding source includes `_locales`, application code, tests, manifests, build scripts, dependency
declarations, the lockfile, and documentation. The source returned by Mozilla matched the submitted archive's hash.

The retained archives have these SHA-256 hashes:

- unsigned package, `rs_rate-firefox.zip`:
  `07dd1e648b8145d52bb124b52f14b7d12d32b20c20b929bf8a0a5b7a4aeee32b`;
- source, `rs_rate-firefox-source.zip`:
  `f1d05ac73378d4be9bce29fe1ebed540dc9fe9b48cb659a54dab761a77a08577`;
- signed package, retained locally as `rs_rate-firefox-signed-2.0.0.xpi`:
  `5d8bb87465158149b2965a40b954b145450e35e9fc4c344ebbe459becb43638f`.

The extracted source rebuilt all 89 package assets using the existing locked dependencies. This check reused the
installed dependencies rather than performing a fresh installation. The signed XPI retains the same manifest values
and application assets; its additions are Mozilla's signature files, with formatting changes to the manifest.

The signed package was installed through the Add-ons Manager in a separate regular Firefox 157.0.1 profile and
appeared active. No signature enforcement preference overrides were found. Its functional installation checks
completed on October 9, 2026 with a synthetic reader and local server. Login remained active when the popup was
reopened. Original PDF upload prepared and opened the annotated copy. Extraction refused the original PDF and
opened the rating page for the annotated copy. Restarting Firefox cleared the login while retaining the selected
server address. Logout revoked the session on the server and returned the reopened popup to the login view.
The user operated Firefox; server responses, session records, and unchanged ratings were checked independently.
No new version was published in the public catalog.

## Development interface

The Firefox popup closes after its upload tab is ready. If opening the tab fails, the popup remains available to
explain the error. Normal extension tabs are not closed as popups. Upload forms use a centered layout that fits the
available width without changing the toolbar popup's dimensions or the captured publication address.

The views use Font Awesome's [SVG nesting](https://docs.fontawesome.com/apis/javascript/configuration#autoreplacesvg-through-nesting)
to retain the original icon elements. This preserves the references used by the existing controllers to show and
hide loading indicators while the library renders the icons.

Views do not use a full page loading overlay. Login, registration, and password forms become available when their
handlers are ready; their indicators accompany requests initiated by the reader. Profile fields remain visible but
disabled while their values are retrieved. A failed read leaves editing disabled and offers another attempt.
Publication checks and PDF operations use their own sections and status messages, leaving navigation available.
Idle indicators and messages are hidden before the controllers initialize. Local loading icons respect the reader's
preference for reduced motion.
Profile values wrap within their existing boxes so that long addresses remain readable without truncation.

The home and publication views display their content after the controller has resolved the local session and upload
context and arranged the initial controls. Navigation remains visible during this setup. There is no fade or minimum
display time, and the view does not wait for server responses. Upload pages use their full page layout from the first
render. If a controller cannot initialize, the view displays an explanation instead of remaining empty.
The publication view establishes its checking state before requesting the active tab. Rating and configuration
controls remain hidden until the publication lookup completes; server responses retain the existing domain actions.

The retained version 2.0.0 XPI, unsigned archive, and submitted source remain unchanged. The version 2.0.1 record
below identifies the package containing these interface revisions, its corresponding source, and its installation
checks.

The development build at commit `74d1740` was checked through temporary loading in a separate Firefox 157.0.1
profile on October 11, 2026. With the synthetic reader and local server, login, reopening the popup, profile reads,
original upload, annotated extraction, and logout completed. The upload tab retained the publisher address and
closed the popup. Preparation displayed its local status while the surrounding view remained visible, then opened
the verified eight-page copy. Extraction refused the original PDF and opened the annotated copy's rating URL.
No profile update or rating was submitted. The complete user, publication, and rating fingerprints remained unchanged.

These browser observations verify interactions and visible state changes rather than frame-by-frame timing of the
first render. They do not replace installation checks of a new signed package. RS_Server's `docs/integration.md`
records the local results and the remaining distribution requirements.

A separate rendering check on October 11, 2026 used the built views and bundled libraries with synthetic session,
tab, and API responses. With the tab read and server response deliberately delayed, frame samples showed the checking
section and no premature rating controls while navigation remained available. At the popup width of 300 pixels, a
long synthetic email fitted its box and retained its complete text. This is a controlled page check, not a timing
measurement of the native Firefox popup. Automatic control did not confirm reloading the revised temporary extension.
RS_Rate passed 125 tests and both build checks; Firefox lint reported no errors and the same 21 library warnings.

## Version 2.0.1

Version 2.0.1 contains the current interface revisions and uses the same extension identifier, domain actions,
dependency declarations, and locked libraries. Both manifests and `package.json` declare the same version.
The Firefox manifest omits `version_name`; Chromium retains it. Tests cover those declarations.

On October 11, 2026, `yarn verify` passed 127 tests and both build checks. Firefox lint reported no errors or notices
and retained the 21 documented library warnings. Both versioned unsigned archives contained 90 assets that matched
their unpacked builds, without development dependencies. The retained version 2.0.0 archives remain unchanged.

The Chromium build was loaded in a separate Edge profile with the synthetic reader and local server. Login remained
active when the popup was reopened. The profile email wrapped within its box at the existing popup width, and the
prepared eight-page PDF opened. Logout returned the empty login form and revoked the issued server credential.
The complete user, publication, and rating fingerprints remained unchanged.

The source was extracted into a separate directory and installed from the unchanged lockfile with
`yarn install --immutable --immutable-cache`, using the existing local cache with network access disabled.
The new installation passed `yarn verify` and reproduced every asset in both unsigned packages. All 47 bundled
library assets also matched the retained version 2.0.0 package byte for byte.

The retained version 2.0.1 files have these SHA-256 hashes:

- Firefox package, `rs_rate-firefox-2.0.1.zip`:
  `f6a88ab35105bfbb22829710932b2c64b3537540b4bfb0dc19d2822ef367f108`;
- Chromium package, `rs_rate-chromium-2.0.1.zip`:
  `d26453c9dcea3082f2a7190ad4e1ddbadd126a5dc35c5f4c17b578c8024d31b3`;
- corresponding source, `rs_rate-firefox-source-2.0.1.zip`:
  `585fdc73369d54ce092bc572765095f0e9739006b696682f41c12c121ba252b9`.

Mozilla approved the version on October 11, 2026 through the existing entry's unlisted channel for Firefox desktop.
Its version identifier is `6565662`, and its file identifier is `5109799`. Validation reported no errors and 21 warnings.
The returned source matched the submitted archive's SHA-256 hash. The signed XPI retains all 90 application assets
and manifest values; its additions are Mozilla's five signature files, with formatting changes to the manifest.
The signed copy is retained as `rs_rate-firefox-signed-2.0.1.xpi`, with SHA-256 hash
`6369dcaa9c094a08b01f90a1a99e9022d7bf25628e6d0a0badc5742c67f1fa0d`.
Build instructions and the validation assessment were also provided in the reviewer notes. No new version was
published in the public catalog.

Reloading the Firefox development build removed the manifest warning shown by the earlier package. The background
script appeared running. The signed package was subsequently installed through the Add-ons Manager in the separate
regular Firefox 157.0.1 profile and appeared active as version 2.0.1. The manager confirmed that access to private
windows was disabled. The existing local server address was retained. Login, reopening the authenticated popup,
and profile reads completed with the synthetic reader. The original upload control opened a centered extension tab,
closed the popup, and retained the publisher address. Upload opened the annotated copy containing eight pages;
the stored seven-page original matched the selected fixture's SHA-256 hash. Extraction refused the original with
a textual explanation and extracted the prepared copy's rating URL for the same publication on the local server.
The rating page required a separate web login; no rating or profile update was submitted.

A complete Firefox restart cleared the extension's local authentication token while retaining the selected server
address. A new login created a separate server credential. Logout revoked that current credential and returned an
empty login form; reopening the popup displayed the actions for an unauthenticated reader. Restarting the browser
does not send a logout request: the earlier server credential remains subject to its expiry and revocation rules.
The complete user, publication, and rating fingerprints remained unchanged throughout the check.

These installation checks completed for the exact signed version 2.0.1. Native control occasionally required
keyboard navigation or the user's assistance to bring the temporary window into focus and confirm the file chooser.
The extraction cases used separate form loads. The observations verify interactions and visible states, not
frame-by-frame timing of the native popup.
