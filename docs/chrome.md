# Chrome Web Store distribution

RS_Rate's existing Chrome Web Store item is `hlkdlngpijhdkbdlhmgeemffaoacjagg`.
Updates use that same item rather than creating a new extension identity. The Chromium package also supports Edge;
a separate Microsoft Edge Add-ons submission is optional.

## Current package

The retained submitted package is `artifacts/rs_rate-chromium-2.0.1.zip`, with SHA-256 hash
`d26453c9dcea3082f2a7190ad4e1ddbadd126a5dc35c5f4c17b578c8024d31b3`.
It uses Manifest V3 and contains the 90 verified Chromium build assets, without development dependencies.
The existing dependency declarations and domain actions are unchanged. Local verification and the Edge checks
are recorded in [the distribution record](firefox.md#version-201).

Uploading an update, submitting it for review, and publishing it are distinct operations in the
[Chrome Web Store workflow](https://developer.chrome.com/docs/webstore/update).
Preparing a local package does not perform any of them.

## Existing item check

On October 12, 2026, the developer dashboard retained the original item but displayed its status as Removed.
Its published package was `1.0.14-alpha`; its draft was `1.0.15`. The package page required a Manifest V3 update
before republication. The draft status also recorded a rejection dated December 26, 2023 for an unavailable
privacy policy link, identified by the store as Purple Nickel.

The item retained Public visibility, free distribution, and all regions. The Hidden choice discussed for Microsoft
does not change those Chrome settings. No distribution setting was changed during this inspection.

The legacy privacy form declared remote DataTables code and described the storage permission as inspecting
the current page. The saved declarations for version 2.0.1 describe the bundled executable assets, storage of the
selected server and temporary messages, and access to the active publication address through tabs.

## Privacy

[PRIVACY.md](../PRIVACY.md) describes version 2.0.1 and uses the publisher's selected contact,
`michael.soprano@uniud.it`. It distinguishes the extension's browser storage and selected server from the policies
of a particular RS_Server deployment. The [public policy](https://github.com/Miccighel/Readersourcing-2.0-RS_Rate/blob/d6a0c56b7795229fcd5179980b94e8486fb87109/PRIVACY.md)
was checked without authentication and its address is saved in the store's privacy field.

The policy is hosted on `codex/rs-rate-privacy-policy`, based on the existing master commit
`5ee92c77428beaa3a69cf891a5e991d7c5dabe8e`. Commit `d6a0c56b7795229fcd5179980b94e8486fb87109`
adds only `PRIVACY.md`; publishing it did not merge or publish the development branch.
The store uses the permalink to that commit. Its validator reported the branch URL as unreachable, although it
was publicly readable; saving the permalink to the same document enabled submission without changing its contents.

The saved form explains the single purpose and the storage and tabs permissions, and declares no remote code.
It includes personal identification, authentication information, web history, user activity, and website content.
The existing three data use certifications remain selected; the publisher confirmed them before authorizing review.
The optional HTTP and HTTPS host permissions are explained in the reviewer notes: they allow a reader to select
a compatible server, with access requested for the selected origin rather than automatically granted for all sites.

The data disclosures must account for names, email and optional ORCID, authentication information, the active
publication URL, ratings, and selected PDF contents. Reading one active publication address is not continuous
history recording, but its transmission must still be disclosed. Account data and PDFs go to the configured service;
the selected server and temporary messages may also be synchronized by the browser.

The source and privacy policy do not themselves confirm compliance with every service operator's practices.
The [Chrome privacy requirements](https://developer.chrome.com/docs/webstore/program-policies/privacy) require
an accurate accessible policy and corresponding disclosures. Do not certify unresolved statements or substitute
an inaccessible localhost URL for the public policy.

## Submission status

On October 12, 2026, the publisher authorized uploading `rs_rate-chromium-2.0.1.zip` only as a draft in the existing
item. The package page confirms draft version `2.0.1` and retains published version `1.0.14-alpha`.
The downloaded draft CRX confirms Manifest V3. Its 89 other build assets match the uploaded archive byte for byte;
Google adds its update URL to the manifest and a verification metadata file.

The [store description](chrome-description.txt) explains the extension's functions, client requirements, rating range,
PDF preparation limits, and information sent to the selected server. The scientific background remains in the README
and project documentation. The home page and support links point to this repository and its issues. The original
icon, screenshot, Tools category, Public visibility, free distribution, and all regions are retained.
Google Analytics was not activated.

Reviewer instructions describe the compatible server, synthetic account workflow, PDF checks, locally bundled
assets, and optional host permissions. No test credential was added or changed. There is no public test server or
remote test account. This limitation is stated in the reviewer notes and may affect independent functional checks.

The first review request for version 2.0.1 was submitted with the publisher's authorization and deferred publication
on October 12, 2026. It was rejected that day under Yellow Argon, identifying the long scientific introduction in
the description as excessive metadata. The [store's guidance](https://developer.chrome.com/docs/webstore/troubleshooting/#keyword-stuffing)
calls for a description focused on the extension's functions.

The publisher authorized shortening that description and resubmitting the same package. The revised English text
contains 1,126 characters and its saved value was checked before submission. The package, policy contents,
permissions, dependency declarations, and scientific README text were not changed.

The dashboard confirmed the second submission with automatic publication disabled. On October 13, 2026, the
publisher received a Red Titanium rejection identifying the legacy Object.create polyfill in
`node_modules/dropzone/dist/dropzone.js`. That fragment is present in the retained submitted package.
No appeal, publication, or Microsoft submission was made.

## Local version 2.0.2

Version 2.0.2 uses a [readable build of Dropzone 5.9.3](dropzone.md) from its locked upstream source, with source
maps and its original license. The application controllers, upload fields, permissions, and store identity remain
unchanged. esbuild is declared only as a development dependency. The package is prepared locally and has not been
uploaded, submitted for review, or published. Browser installation remains to be checked before submission.

The retained local archive is `artifacts/rs_rate-chromium-2.0.2.zip`, containing 92 verified build assets.
Its SHA-256 hash is `6baf15103fa77540b7f908660f20f5207c52aa9a6a7eaba46021c47e672202ab`.

The local privacy policy covers versions 2.0.1 and 2.0.2. Its information handling is unchanged; the store's
saved policy link still points to the previously published document covering version 2.0.1.
