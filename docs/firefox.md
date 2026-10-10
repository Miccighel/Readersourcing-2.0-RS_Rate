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

These interface revisions belong to the development source, not to the signed version 2.0.0 identified above.
The retained XPI, unsigned archive, and submitted source remain unchanged. Distributing these revisions requires
a new version, its corresponding source, Mozilla signing, and installation checks of the returned package.
