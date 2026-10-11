# Microsoft Edge distribution

The Chromium package supports Microsoft Edge. Submission and certification use
[Microsoft Partner Center](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension).
An existing extension should be updated through its existing entry to retain its store identity.

## Package

The retained version 2.0.1 package is `artifacts/rs_rate-chromium-2.0.1.zip`, with SHA-256 hash
`d26453c9dcea3082f2a7190ad4e1ddbadd126a5dc35c5f4c17b578c8024d31b3`.
Its 90 assets match the Chromium build and contain no development dependencies. Both builds passed validation,
and all 127 tests passed. The corresponding source reproduced both packages from a fresh installation of the
unchanged lockfile using the local immutable cache.

The package was loaded in a separate Edge profile against the local server on October 11, 2026. Login remained
active when the popup was reopened, profile values fitted the existing boxes, and the prepared eight-page PDF
opened. Logout displayed the empty login form and revoked the current server credential. The complete user,
publication, and rating fingerprints remained unchanged. This brief check did not repeat upload and extraction.

These local checks do not establish Microsoft certification or installation from the store. The package is not
submitted until Partner Center confirms its upload and submission.

## Listing description

The following text describes the existing application for the store listing:

> RS_Rate is a client for the Readersourcing 2.0 ecosystem. It allows readers to rate scientific publications
> directly from their browser and to prepare a publication for later rating.
>
> After signing in to a compatible RS_Server, the reader can choose a rating from 0 to 100 and submit it for the
> publication open in the current tab. The extension displays the publication's scores and the reader's profile
> values. Anonymous ratings remain subject to authentication and the server's domain rules.
>
> The Save for Later section asks RS_Server to retrieve, validate, and annotate the publication. The prepared PDF
> contains a rating link and QR Code. When the source requires browser access, the reader can upload the original
> PDF already available on the device. A prepared PDF can also be uploaded to recover its rating link. The interface
> explains the preparation status and any validation errors.
>
> RS_Rate requires a compatible RS_Server and a reader account. The initial server address is
> http://localhost:3000/ and can be changed in the extension options. This package does not include a server or
> provide a publicly deployed service. The browser asks for permission to contact the selected server.

The existing logo is `src/img/icon128.png`, a square image of 128 by 128 pixels. Store assets should represent
the current interface and should not contain personal account values, authentication tokens, or download tickets.

## Permissions and data

The declarations should reflect the current code:

- `tabs` reads the active tab's URL when the authenticated publication view opens. That URL is sent to the
  configured RS_Server for publication lookup and is used for subsequent preparation or rating actions.
- `storage` retains the selected server and temporary server messages in browser extension sync storage.
  Synchronization follows the browser's settings. Account credentials and PDF contents are not stored there.
- Optional HTTP and HTTPS host permissions allow a reader to choose a compatible server. Operational access is
  requested when that server is saved; the application directs API calls and PDF uploads to the configured address.

Registration and profile forms transmit the fields entered by the reader to that server, including name, email,
optional ORCID, email subscription preference, and authentication information where required. Publication actions
transmit the selected URL and rating choices. File uploads transmit the PDF explicitly selected by the reader.
Profile and publication scores are retrieved for display. The application does not maintain a continuous browsing
history or read the contents of publisher pages.

Chromium keeps its authentication token in an extension page session cookie, not in sync storage. Logout removes
the local token after RS_Server revokes the credential. The selected server controls its own account records,
publication storage, logs, and retention; its service policy is separate from the extension's local behavior.

Executable assets are bundled in the package. Server responses supply data, not executable code. The manifest
retains `script-src 'self'; object-src 'self';`. The [library assessment](security.md) and the unresolved development
audit findings remain applicable.

An accessible privacy policy URL is required for submission because the extension handles personal and
authentication information. A localhost address or a server policy with unresolved deployment placeholders is
not suitable. The publisher should confirm the policy, contact details, and data declarations before certification.

## Certification notes

The reviewer notes should identify the compatible RS_Server requirement, the configurable initial localhost
address, the bundled assets, and the completed local checks. No public test service is currently deployed.
Do not include personal credentials or private service configuration. A review account or external test service
requires a separate arrangement before its details can be supplied to Microsoft.

Partner Center supports Public and Hidden visibility. Hidden removes the listing from search and browsing but
still permits installation through its listing URL; it is not an access restriction. The publisher chooses the
visibility and confirms any account agreements or certification declarations before the final submission.

## Submission status

On October 11, 2026, the package and submission material were prepared. Partner Center required account access.
No package upload, certification submission, or Microsoft approval has been confirmed.
