# Chrome Web Store distribution

RS_Rate's existing Chrome Web Store item is `hlkdlngpijhdkbdlhmgeemffaoacjagg`.
Updates use that same item rather than creating a new extension identity. The Chromium package also supports Edge;
a separate Microsoft Edge Add-ons submission is optional.

## Current package

The retained package is `artifacts/rs_rate-chromium-2.0.1.zip`, with SHA-256 hash
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

The legacy privacy form still declared remote DataTables code and described the storage permission as inspecting
the current page. Those declarations do not describe the current package. Its executable assets are bundled locally;
storage retains the selected server and temporary messages, while tabs supplies the active publication address.

## Privacy preparation

[PRIVACY.md](../PRIVACY.md) describes version 2.0.1 and uses the publisher's selected contact,
`michael.soprano@uniud.it`. It distinguishes the extension's browser storage and selected server from the policies
of a particular RS_Server deployment. The document is prepared for publisher review; it has not been published at
a confirmed public URL or entered into the store form.

Before submitting an update:

1. approve the policy and make it available at a stable public URL;
2. check that the URL works without authentication and enter it in the store's privacy field;
3. align the single purpose, permission explanations, remote code declaration, and data categories with the package;
4. confirm the data use certifications and the retained distribution settings;
5. provide review instructions appropriate to the selected compatible server, without sharing personal credentials.

The data disclosures must account for names, email and optional ORCID, authentication information, the active
publication URL, ratings, and selected PDF contents. Reading one active publication address is not continuous
history recording, but its transmission must still be disclosed. Account data and PDFs go to the configured service;
the selected server and temporary messages may also be synchronized by the browser.

The source and privacy policy do not themselves confirm compliance with every service operator's practices.
The [Chrome privacy requirements](https://developer.chrome.com/docs/webstore/program-policies/privacy) require
an accurate accessible policy and corresponding disclosures. Do not certify unresolved statements or substitute
an inaccessible localhost URL for the public policy.

## Submission status

The original item was inspected without modifying its draft. The publisher chose to complete the privacy work
before uploading the version 2.0.1 package. No new package, review request, appeal, or publication was submitted.
