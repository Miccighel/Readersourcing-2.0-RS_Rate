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

The legacy privacy form declared remote DataTables code and described the storage permission as inspecting
the current page. The saved declarations for version 2.0.1 describe the bundled executable assets, storage of the
selected server and temporary messages, and access to the active publication address through tabs.

## Privacy

[PRIVACY.md](../PRIVACY.md) describes version 2.0.1 and uses the publisher's selected contact,
`michael.soprano@uniud.it`. It distinguishes the extension's browser storage and selected server from the policies
of a particular RS_Server deployment. The [public policy](https://github.com/Miccighel/Readersourcing-2.0-RS_Rate/blob/codex/rs-rate-privacy-policy/PRIVACY.md)
was checked without authentication and its address is saved in the store's privacy field.

The policy is hosted on `codex/rs-rate-privacy-policy`, based on the existing master commit
`5ee92c77428beaa3a69cf891a5e991d7c5dabe8e`. Commit `d6a0c56b7795229fcd5179980b94e8486fb87109`
adds only `PRIVACY.md`; publishing it did not merge or publish the development branch.

The saved form explains the single purpose and the storage and tabs permissions, and declares no remote code.
It includes personal identification, authentication information, web history, user activity, and website content.
The existing three data use certifications remain selected; they were not changed during draft preparation.
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

The saved store description retains the original scientific explanation and adds the client requirements,
the rating range, PDF preparation limits, and the information sent to the selected server. The home page and support
links point to this repository and its issues. The original icon, screenshot, Tools category, Public visibility,
free distribution, and all regions are retained. Google Analytics was not activated.

Reviewer instructions describe the compatible server, synthetic account workflow, PDF checks, locally bundled
assets, and optional host permissions. No test credential was added or changed. There is no public test server or
remote test account; access suitable for an independent review still needs to be arranged before submission.
The publisher must also confirm the retained data use certifications for the intended distribution.

The dashboard still displays Removed, the rejection dated December 26, 2023, and a Manifest V2 warning on the
package page. The retained 2.0.1 archive uses Manifest V3; the new draft has not received a store review or approval.
No review request, appeal, or publication was submitted, and no Microsoft submission was made.
