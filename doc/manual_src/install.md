% Install Guide

# Installing the FiveUI Extension

FiveUI is distributed as source code and as a browser extension for
both Google Chrome and Mozilla Firefox.  This document describes the
install process for these browsers, assuming that you have the FiveUI
extension on your local computer.

## Installing FiveUI in Firefox

FiveUI is currently supported on Firefox 10, although it should also
work on newer versions and Firefox 3.6.  Due to changes in the
long-term support and Mozilla version numbering scheme, versions 4-9
are not supported.

The FiveUI Firefox extension is packaged in a file called
`fiveui.xpi`.  Locate this file in your distribution (or download) and
take note of the location for the following steps.  We will assume
that it is located at `d:\binaries\fiveui.xpi`

 * Open Firefox, and load the `Add-ons Manager` from the main Firefox
   menu.

![Access the Firefox Add-ons Manager from the main Firefox menu](figures/ff-menu.png)

![The Add-ons Manager Gear menu has an install from file entry.](figures/ff-add-on-installer.png)

 * Within the `Add-ons Manager`, open the Gear menu and select
   `Install Add-on From File`.

 * A file dialog should open, use this to browse to the `fiveui.xpi`
   file (in our case, `d:\binaries\fiveui.xpi`.

 * Click OK, and a warning dialog should appear.  This dialog warns
   that the FiveUI author is not verified.  Because this is a
   development release of FiveUI, the xpi file is not
   cryptographically signed, and therefore, Firefox is unable to
   verify the author identification.

 * Click on the `Install Now` button once it becomes active.

FiveUI is now installed.  The [Getting Started guide](gettingStarted.html)
explains how to configure and use the extension.

## Installing FiveUI in Chrome

All recent versions of Google Chrome should support FiveUI.

Chrome is primarily designed to install extensions from the on-line
extension marketplace, however, local extensions can be installed by
navigating to the extension on disk.  To do this, you must enter a
`file:///` url in the url bar.

The following steps describe how to install FiveUI in Chrome, using an
extension file from the local file system.

The FiveUI Chrome extension is packaged in a file called `fiveui.crx`.
Locate this file in your distribution (or download) and take note of
the location for the following steps.  We will assume that it is
located at `d:\binaries\fiveui.crx`

 * Open Google Chrome, and enter the `file:///` url in the url bar, as
   shown.  In our case, the url is `file:///d:/binaries/fiveui.crx`.

![Use a file:/// url to install local extensions in Chrome.](figures/chrome-file-url.png)

 * Chrome should open a download and install bar at the bottom of the
   window and begin adding FiveUI to the browser.

![Chrome shows an install indicator at the bottom of the window](figures/chrome-adding.png)

 * After a few minutes of processing, Chrome will open a confirmation
   dialog, as shown.  Confirm the installation to complete the
   process.

![Confirm the FiveUI installation to finish adding the extension.](figures/chrome-confirm-add-fiveui.png)

 * The FiveUI Button should appear in the Chrome toolbar after you
   dismiss the confirmation dialog.

![The FiveUI Button will be added to the Chrome toolbar.](figures/chrome-install-done.png)

FiveUI is now installed.  The [Getting Started guide](gettingStarted)
explains how to configure and use the extension.
