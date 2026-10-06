# Firefox Validation

This assessment covers the runtime libraries included in RS_Rate 2.0.0, as reviewed on October 6, 2026.
Mozilla's validator reports 21 warnings and no errors. The warnings concern HTML assignments and legacy
`Function` constructors in the bundled libraries. They remain visible in `yarn lint:firefox`; none are excluded.

The assessment considers the data and options used by the current extension. It does not establish that every
feature of these libraries is safe, nor does it replace Mozilla's review and signing before distribution.

## Application Data

Server responses, stored messages, and publication filenames are not trusted HTML. `buildErrors` escapes both
attribute names and messages before placing them in the existing error layout. The login page displays a stored
confirmation message through jQuery's `text` method. Profile values, PDF preparation messages, and upload results
are also displayed as text.

The extension uses local HTML views, the default Dropzone preview template, and the bundled Font Awesome icon
definitions. Server data does not configure these templates or icon definitions. The rating slider accepts a
numeric score from 0 to 100, without HTML tick labels. No current view contains a Bootstrap Select control.

## Library Findings

The locations below refer to the files scanned by Mozilla's validator in the Firefox package. Minified file
columns identify distinct assignments on the same line.

| Library | Warnings | Locations | Current use |
| --- | ---: | --- | --- |
| Bootstrap Slider 11.0.2 | 1 | `bootstrap-slider.min.js`, line 4, column 5658 | Tick label HTML is not used. The default label array is empty; the numeric tooltip uses text content. |
| Bootstrap Select 1.13.18 | 5 | `bootstrap-select.min.js`, line 8, columns 9332, 9512, 9714, 10199, 46778 | Option content, group labels, and search result HTML are generated only for a picker. The `.bs-select` initialization has no matching control in the current views. |
| jQuery 3.7.1 | 3 | `jquery.js`, lines 1278, 4770, 6171 | The selector probe uses an internal string. HTML parsing remains necessary for the local error layout, whose server values are escaped. Application controllers do not call the generic `html` setter. |
| Dropzone 5.9.3 | 2 | `dropzone.js`, lines 1724, 6730 | The `Function` constructors are global object fallbacks. Browsers supported by RS_Rate provide `globalThis`, so these branches are not selected. |
| Dropzone 5.9.3 | 2 | `dropzone.js`, lines 2326, 2345 | The document writes belong to legacy ActiveX and iframe fallbacks for `Object.create`. Supported browsers provide the native implementation. |
| Dropzone 5.9.3 | 4 | `dropzone.js`, lines 7631, 7746, 7796, 9935 | HTML is used for a formatted numeric file size, local removal labels, and the local preview template. Removal links are disabled. Filenames and upload errors use text content. |
| Font Awesome 6.7.2 | 4 | `all.min.js`, line 6, columns 1500359, 1507702, 1512833, 1522776 | The assignments insert bundled CSS and generated icon SVG. Views use local icon classes, without custom remote icon definitions or layer text. Pseudo element conversion is disabled by default. |

The manifests retain `script-src 'self'; object-src 'self';`, without permission for dynamic string compilation.
This policy is an additional restriction, not a substitute for treating external values as text.

## Verification

The tests cover escaping in server errors, literal display and consumption of stored confirmation messages,
Dropzone filename and error handling, numeric file size formatting, and slider tooltip text. Dropzone is loaded
in a Node.js context where dynamic string compilation is disabled and legacy document writes, iframes, and
ActiveX construction cause a failure. Its default handlers are exercised separately from layout and networking.
These are targeted unit tests, not a complete browser session.

Configuration checks also cover the absence of HTML tick labels, picker controls, template and dictionary
overrides, and custom Font Awesome configuration in the current views and controllers. Both manifests are
checked for the same script policy. Archive validation confirms that the distributed assets match the build.

Library updates or changes to templates, picker controls, icon configuration, and HTML insertion require a new
review of the affected paths. A submission to Mozilla should include this assessment alongside the validation report.
Dependency vulnerability advisories are tracked separately through the audit commands described in the README;
this assessment does not exclude the unresolved `node-forge` advisory from the development audit.
