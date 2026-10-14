[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
![Maintainer](https://img.shields.io/badge/maintainer-Miccighel-blue)
[![Github all releases](https://img.shields.io/github/downloads/Miccighel/Readersourcing-2.0-RS_Rate/total.svg)](https://GitHub.com/Miccighel/Readersourcing-2.0-RS_Rate/releases/)
[![GitHub stars](https://badgen.net/github/stars/Miccighel/Readersourcing-2.0-RS_Rate)](https://GitHub.com/Miccighel/Readersourcing-2.0-RS_Rate/stargazers/)
[![GitHub watchers](https://badgen.net/github/watchers/Miccighel/Readersourcing-2.0-RS_Rate/)](https://GitHub.com/Miccighel/Readersourcing-2.0-RS_Rate/watchers/)
[![GitHub contributors](https://img.shields.io/github/contributors/Miccighel/Readersourcing-2.0-RS_Rate.svg)](https://GitHub.com/Miccighel/Readersourcing-2.0-RS_Rate/graphs/contributors/)
[![GitHub issues](https://img.shields.io/github/issues/Miccighel/Readersourcing-2.0-RS_Rate.svg)](https://GitHub.com/Miccighel/Readersourcing-2.0-RS_Rate/issues/)
[![GitHub issues-closed](https://img.shields.io/github/issues-closed/Miccighel/Readersourcing-2.0-RS_Rate.svg)](https://GitHub.com/Miccighel/Readersourcing-2.0-RS_Rate/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/Miccighel/Readersourcing-2.0-RS_Rate.svg)](https://GitHub.com/Miccighel/Readersourcing-2.0-RS_Rate/pull/)
[![GitHub pull-requests closed](https://img.shields.io/github/issues-pr-closed/Miccighel/Readersourcing-2.0-RS_Rate.svg)](https://GitHub.com/Miccighel/Readersourcing-2.0-RS_Rate/pull/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

<h1>Info</h1>

This is the official repository of **RS_Rate**, which is part of the **Readersourcing 2.0** ecosystem. This repository is a [Git Submodule](https://git-scm.com/book/it/v2/Git-Tools-Submodules) of the main project, which can be found by taking advantage of the links below.

The current development line is version **2.0.2**.

<h1>Useful Links</h1>

- <a href="https://readersourcing.com">Readersourcing 2.0 (Web Interface)</a>
- <a href="https://github.com/Miccighel/Readersourcing-2.0">Readersourcing 2.0 (GitHub)</a>
- <a href="https://zenodo.org/record/1446468">Original Article</a>
- <a href="https://zenodo.org/record/1452397">Technical Documentation (Zenodo)</a>
- <a href="https://github.com/Miccighel/Readersourcing-2.0-TechnicalDocumentation"> Technical Documentation (GitHub)</a>
- <a href="https://doi.org/10.5281/zenodo.1442599">Zenodo Record</a>

<h1>Description</h1>

**RS_Rate** is an extension designed to function as a client for the Readersourcing 2.0 ecosystem without 
requiring access to its website. Compatible with [Google Chrome](https://www.google.com/chrome/),
[Microsoft Edge](https://www.microsoft.com/en-us/edge/), and [Mozilla Firefox](https://www.mozilla.org/firefox/), the extension allows users to rate
publications directly from their browsers. This eliminates the need to navigate to the main website, 
streamlining the process of providing ratings for publications.

The primary objective of **RS_Rate** is to provide readers with a way to seamlessly rate a publication with minimal 
effort—just a few clicks or keystrokes within the Readersourcing 2.0 ecosystem, contributing to a more dynamic 
online reading experience. **RS_Rate** serves as the initial client of our project, extending beyond the web
interface available on the main portal.

Looking ahead, our vision includes expanding the compatibility of **RS_Rate** to
other major browsers, such as Safari. Our commitment is to make this rating
tool accessible across a broad range of browsers, ensuring users can seamlessly interact with content and provide 
feedback, regardless of their preferred browser.

<h1>Installation</h1>

The original 2019 release of **RS_Rate** was distributed through the Chrome Web Store entry linked below.
The existing identity is retained; the [Chrome distribution instructions](docs/chrome.md) record the submission
status and the requirements for an update.
The current source produces complete builds for Chromium browsers and Firefox, which can be installed locally for
development. The Firefox build can also be packaged for validation and submission to Mozilla Add-ons.
The [Microsoft Edge distribution instructions](docs/edge.md) describe the optional separate store submission.

- _Google Chrome_ entry: <a href="https://chromewebstore.google.com/detail/readersourcing-20-rsrate/hlkdlngpijhdkbdlhmgeemffaoacjagg">original listing</a>

The [privacy policy](PRIVACY.md) describes the extension's handling of information and distinguishes it from the
policy of the RS_Server selected by the reader. A [public copy](https://raw.githubusercontent.com/Miccighel/Readersourcing-2.0-RS_Rate/3db260632d977b337ed3225e93a86fc18dffb67f/PRIVACY.md)
is available without authentication and is linked from the Chrome submission. The Chrome submission of version 2.0.1
was rejected under Red Titanium. Version 2.0.2 is uploaded as a Chrome draft; it has not been submitted for review
or published.
The [distribution instructions](docs/chrome.md) record the submission status.

<h1>Usage</h1>

The image shown below illustrates a section of a Google Chrome instance with the extension active for a publication. 
This scenario depicts the typical situation of a reader visiting a publisher's website to access 
the PDF of a paper they are interested in. The image also displays the initial page that a reader 
encounters when interacting with the client. This page serves as a gateway to the login page, as shown 
in the second figure, or to the registration page. From the login page, a reader who has forgotten their password
can request a recovery link. The link opens RS_Server, where the reader chooses and confirms a new password.

<img src="images/ux-1.png" alt="RS_Rate characterized as an extension having a popup action."/>

<img src="images/login.png" alt="The login page of RS_Rate" width="300"/>

If a reader has yet to sign up for Readersourcing 2.0, they can navigate from the main page to the registration form.
Once they complete the standard registration and login operations, they will find themselves on the rating page.
If the account is created but the confirmation email cannot be sent, the login page explains that the account remains
unconfirmed. The reader can sign in with the same credentials later to request another confirmation email; access remains
unavailable until the email address is confirmed.

<img src="images/rating.png" alt="The rating page of RS_Rate" width="300"/>

<img src="images/signup.png" alt="The user registration page of RS_Rate" width="300"/>

In the central section of the rating page, a reader can use the slider to choose an integer rating from 0 to 100, including both endpoints.
Once they select the desired rating, they only need to click the green `Rate` button, and that's it; with just 
three clicks and a slide action, they can submit their rating. Furthermore, they can also click the options button and, 
if preferred, check an option to anonymize the rating they are about to provide. It's important to note that the reader 
has to be logged in to express an anonymous rating to prevent spamming, which in this case would be a very dangerous 
phenomenon. When such a rating is processed, the information regarding its reader will not be used, except for preventing 
the reader from rating the same publication multiple times.

If the reader prefers to provide their rating at a later time instead of immediately rating the publication,
they can use the `Download` button in the `Save For Later` section. The extension first reports that the publication is
ready to prepare. After the reader continues, RS_Server retrieves the source once, opens it as a PDF, adds the rating page,
and verifies the result before making it available. The status area communicates each phase and distinguishes problems
such as a source that requires browser access, a size limit, an invalid PDF, or a failed final verification.
When the server reports `processing_timeout`, the operation has exceeded its time budget and has been stopped.
The extension offers a retry or an original PDF upload; any previously prepared copy remains available.

Some publishers make a PDF available only through the reader's browser session. In that case, the reader can select
`Use a local PDF` and upload the original file already available on the device. RS_Server subjects the uploaded source to
the same size limit, PDF validation, annotation, and final verification used for a directly retrieved publication.

<img src="images/rating-2.png" alt="The rating page of RS_Rate after a save for later request." width="300"/>

The reader can finally open the prepared publication by clicking on it. Furthermore,
they can also use the refresh button (located to the right of the `Download` button) to, as it says, 
refresh the annotated publication. This means that a new copy of the publication file will be downloaded,
annotated, and made available to the reader. This feature is useful since a publication could be updated at a 
later time by its author.

As soon as the annotated publication is downloaded, the reader will find a PDF containing a new final
page with the rating link and QR Code. Below, an example of such an annotated publication can be seen;
in that case, the reader has chosen to open it with their favorite PDF reader.

<img src="images/reference.png" alt="A publication annotated through RS_Rate."/>

Once the reader clicks on the reference, which is a special link to RS_Server, they will be taken to the RS_Server
application itself. The interface presented allows them to express their rating independently of the browser extension 
used to store the reference. Therefore, if they send their annotated publication to a tablet or a similar device, for example,
they can take advantage of its browser to express their rating. Below, the interface that
the reader sees after clicking on the stored reference is shown. The reader is required to authenticate themselves again as a form 
of security. Without this step, the stored reference could be used by anyone who gets a copy of the annotated publication.

The reader can also upload an annotated publication through the web interface to recover its rating link. RS_Server opens
the uploaded content as a PDF within the configured size limit and verifies that the reference belongs to the publication
and the authenticated reader. The interface opens the returned link only if it uses the selected server's origin and rating
route. If validation fails, it displays the error and leaves the link unopened.

<img src="images/browser.png" alt="The RS_Server interface to rate a publication." width="300"/>

Every time a reader rates a publication, every score is updated according to both `RSM` and `TRM` models, and each reader 
can see the result through RS_Rate. In the bottom section of the rating page, the score of the current publication can 
be seen (one for each model), as shown earlier. To view their score as a reader (once again, one for each model), a user 
must click the profile button in the upper right corner. Once they do that, they will see the corresponding interface. 
From there, they can also edit their password since that interface acts as a profile page.

<img src="images/profile.png" alt="The profile page of RS_Rate." width="300"/>

<h1>Development</h1>

The development stack uses Node.js 24 LTS and Yarn 4. Dependencies are declared in `package.json` and
resolved reproducibly through the committed `yarn.lock`.

The Chromium and Firefox metadata are declared in `manifest.json` and `manifest-ff.json`, respectively. The build
copies the appropriate declaration into each package as `manifest.json`.

Dropzone 5.9.3 is built from its locked upstream source with the development dependency esbuild. The readable bundle
uses native browser features, without the distribution's legacy polyfills. Its source map contains the original modules,
and its MIT license is included. The [Dropzone build instructions](docs/dropzone.md) describe reproduction and checks.

```console
corepack enable
yarn install --immutable
yarn verify
```

`yarn verify` creates complete Manifest V3 extension packages in `dist/chromium/` and `dist/firefox/`, checks that all
executable assets are bundled locally, validates the Firefox package with Mozilla's `web-ext`, and runs the client
contract tests. Firefox validation also scans the bundled runtime libraries. The validator reports warnings in several
of those libraries, including dynamic HTML assignments. The
[validation assessment](docs/security.md) describes all 17 warnings, the data used by the current extension, and the
tests that cover server message escaping and the relevant library behavior. The warnings remain visible. Distribution
through Mozilla Add-ons still requires Mozilla's review and signing.

To try the Chromium build, open the Chrome or Edge extensions management page, enable developer mode,
choose `Load unpacked`, and select `dist/chromium/`. In Firefox, open `about:debugging#/runtime/this-firefox`, choose
`Load Temporary Add-on`, and select `dist/firefox/manifest.json`.

In Firefox, `Use a local PDF` and `Upload a prepared PDF` open the existing upload forms in a normal extension tab.
This avoids the [Firefox panel limitation](https://bugzilla.mozilla.org/show_bug.cgi?id=1378527) affecting file selection.
The popup closes once the upload tab is ready. The tab presents a centered form that fits the available width,
while the toolbar popup retains its usual dimensions.
For an original PDF, the tab displays and retains the publisher's address so the upload belongs to that publication.
The address is held in session storage and removed when the upload tab closes. Extraction uses the uploaded PDF's
annotation and does not require a publisher address. Both operations are also available through RS_Server's web interface.

To create both browser archives:

```console
yarn package
```

The command writes `rs_rate-chromium.zip` and `rs_rate-firefox.zip` to `artifacts/`. It includes the local runtime libraries
and verifies that every archived file matches the unpacked build, without including development dependencies. The CI
workflow also creates and checks both archives. To create only one archive, use:

```console
yarn package:chromium
yarn package:firefox
```

The Firefox archive is not signed. Installation in a regular Firefox release requires Mozilla's signature, including
when the extension is distributed outside the Add-ons catalog. The [Firefox distribution instructions](docs/firefox.md)
describe private signing, source preparation, and the installation checks.

The Firefox target requires Firefox 142 or later and declares the data
categories needed by RS_Rate: account authentication and identity, the current publication URL, rating and save
interactions, and publication/PDF content sent to the configured RS_Server. These categories describe the application
traffic required by the domain workflow. RS_Rate has no separate analytics channel.

The development build uses `http://localhost:3000/` as the initial RS_Server host. The value can be changed from the
extension options and is preserved when the extension is updated. Both regular API calls and PDF extraction use this
same configured host. When a host is saved, the browser asks for permission to contact that HTTP or HTTPS origin.
Chromium uses the selected origin. Firefox grants access to the selected hostname and protocol on all ports because its
[host permission patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) do not
support port numbers. Requests still use the configured server address, including its port and any application path.

In Firefox, the authentication token is kept in the extension's session storage. It is shared by the extension pages
and popup, is not synchronized, and is cleared when the browser closes or the extension is disabled. Logout removes
the local token after RS_Server revokes the credential. API requests in Firefox omit the browser's web session cookies
and supply the extension token explicitly.

To check the direct and transitive dependencies used by the extension:

```console
yarn audit:production
```

The CI workflow runs this check and fails when the registry reports a known vulnerability. To include the development
tools, use `yarn audit`. Both commands check vulnerabilities without treating package deprecation notices as security
advisories. To review those notices as well, run `yarn npm audit --all --recursive`.

As of October 12, 2026, the development dependency `node-forge` has an unresolved
[RSA signature verification advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv) with no patched release.
It is included by `web-ext` through `@devicefarmer/adbkit`, which supports Firefox for Android. The documented build,
validation, and packaging commands do not use Android connections, and the dependency is not copied into either
extension package.

The development dependency `shell-quote` 1.10.0 also has a critical
[command injection advisory](https://github.com/advisories/GHSA-pqg4-j6r4-53mv), corrected in version 1.11.0.
It is included by `web-ext` through `fx-runner` 1.6.0, which requires version 1.10.0 exactly. This dependency is not
copied into either extension package. `fx-runner` 1.7.0 includes the corrected library, but the current `web-ext`
10.7.0 release still requires 1.6.0 exactly. The project awaits a `web-ext` release that includes the correction,
without overriding its dependency requirement. The full `yarn audit` reports both advisories and returns a failure;
neither is excluded.
The production dependency audit passed on the same date.

RS_Rate uses Bootstrap 4 because its views and UI plugins depend on Bootstrap 4 markup and jQuery integration.
Bootstrap 4 is no longer supported. An interface based on Bootstrap 5 would require coordinated changes to those views
and plugins. The development tools also include deprecated releases of ESLint and `whatwg-encoding` through Mozilla's
validator and its HTML parser. These notices remain visible in the complete report.
