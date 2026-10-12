# Privacy Policy

Last updated: October 12, 2026.

This policy describes how RS_Rate handles information while acting as a client for the Readersourcing 2.0
ecosystem. It covers the extension's current version 2.0.1 for Chromium browsers and Firefox.
The extension is maintained by Michael Soprano. Questions about its handling of information can be sent to
[michael.soprano@uniud.it](mailto:michael.soprano@uniud.it).

## The selected Readersourcing service

RS_Rate requires a compatible RS_Server and a reader account. The extension's initial server address is
`http://localhost:3000/`; the reader can change it in the options. This extension package does not include a server
or provide a publicly deployed service.

Account requests, publication lookups, ratings, and PDF uploads are sent to the configured RS_Server. The operator
of that service receives and processes these requests. Its own privacy policy describes its account records,
publication storage, technical logs, infrastructure providers, email delivery, and retention. This extension policy
does not replace that service policy.

Use a server whose operator and privacy practices you trust. Requests use the configured address and protocol.
HTTPS protects information in transit to a remote server; an explicitly configured HTTP address does not provide
that protection.

## Account and authentication information

Registration sends the reader's first name, last name, email address, password and confirmation, optional ORCID,
and email subscription preference to the selected server. Login sends the entered email address and password.
The server returns an authentication token, which the extension supplies with authenticated API requests.

Profile views retrieve the reader's name, email address, ORCID, subscription preference, and Readersourcing scores
for display. Profile edits send the values submitted by the reader. Password changes send the current password,
new password, and confirmation to the server. A password recovery request sends the entered email address; the
server handles the recovery email and subsequent reset.

Passwords are used for the requested account operation and are not written to the extension's sync storage.
The browser may provide its own password management independently of RS_Rate.

## Publication addresses and ratings

When an authenticated reader opens the publication view, RS_Rate reads the active tab's URL and sends it to the
selected server to look up the publication and its current state. This lookup occurs before the reader submits
a rating or chooses to prepare a PDF. Subsequent publication actions use the same address.

A rating request sends the publication address, the selected numerical score, and the anonymous rating choice.
Existing publication and reader scores are retrieved from the server for display. Choosing an anonymous rating
does not make the reader anonymous to the server: authentication remains necessary to apply its domain rules
and prevent duplicate ratings.

The extension does not continuously record browsing history, read the contents of publisher pages, or monitor
unrelated tabs. It does not send a copy of publication addresses or ratings to a separate analytics service.

## PDF preparation and extraction

Choosing Save for Later or refreshing a prepared publication asks the selected server to retrieve the publication
from its source address, validate the PDF, and create the annotated copy. The server performs the source request
under its own service rules; RS_Rate does not send the publisher's browser session cookies for that retrieval.

An original PDF upload sends the file explicitly selected by the reader and the publication address to the server.
An extraction upload sends the selected prepared PDF so that the server can verify and recover its rating reference.
These operations require sending the complete selected PDF, not only its filename. Only select files that you intend
to share with the selected service. Server responses include the preparation state and, when successful, a download
or rating link.

The prepared PDF contains a rating URL and QR Code associated with the reader and publication. Sharing that PDF
also shares the reference it contains. The reference is not the extension's authentication token or password;
the compatible server requires the reader to authenticate before using it to submit a rating.

RS_Rate does not retain uploaded PDF contents in extension storage. Prepared copies, account associations, and
rating records are retained by the selected server according to its own policy. Files downloaded or saved by the
reader remain on that device until removed by the reader or the device's own storage controls.

## Information kept in the browser

The selected server address and temporary server messages are kept in the browser's extension sync storage.
They may be synchronized through the browser provider when synchronization is enabled, subject to its settings
and policy. The address can identify a private service. Authentication tokens, passwords, and PDF contents are not
written to that sync storage.

In Chromium browsers, the authentication token is kept in a session cookie belonging to the extension's page.
The browser controls the lifetime of session cookies. In Firefox, it is kept in the extension's session storage,
shared by the extension pages and popup but not synchronized; it is cleared when Firefox closes or the extension
is disabled. Firefox also keeps temporary PDF upload context there, including the operation and the publication
address for an original upload. That context is removed when its upload tab closes or the extension session ends.

Logout removes the local authentication token after the server revokes the current credential. Clearing local data,
disabling the extension, or closing the browser does not by itself send a server logout request or delete account,
publication, or rating records. The selected server's expiry and revocation rules continue to apply.

## Recipients and other services

The configured RS_Server receives the information needed for the operations described above. Its operator may use
hosting, backup, and email providers as described in the service's policy. Browser synchronization may transfer the
selected server address and temporary messages to the browser provider, such as Google, Microsoft, or Mozilla,
depending on the browser and the reader's settings.

The extension has no advertising or independent telemetry service and does not send reader information to the
extension maintainer through a separate reporting channel. If the reader selects a server operated by that maintainer,
the maintainer receives the ordinary service requests in that capacity. Information is used by the extension for
its Readersourcing functions, not for advertising, credit decisions, or sale to data brokers.

Opening an external project website, the server's web interface, or a recovered rating page navigates to that site.
The site and browser then apply their own policies, cookies, and network handling. Browser and extension stores
also apply their own policies to installation, account, and diagnostic information handled outside RS_Rate.

## Reader choices and requests

The reader can choose the server, decline the browser's request for host access, choose whether to submit a rating
or PDF, edit their profile and email subscription preference, and log out. Browser controls can remove extension
data or uninstall the extension. Those controls do not remove files saved elsewhere on the device or data retained
by the selected server.

Requests concerning account records, ratings, stored PDFs, or service retention should be addressed to that server's
operator using its published contact details. Questions about the extension itself can be addressed to
[michael.soprano@uniud.it](mailto:michael.soprano@uniud.it). Future changes to the extension's handling of information
will be reflected in this policy and the corresponding store disclosures.
