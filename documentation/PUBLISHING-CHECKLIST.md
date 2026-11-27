# Publishing Checklist

## Before all submissions

- Use a personal developer account controlled by Ahmed Imam.
- Enable multi-factor authentication and save recovery codes offline.
- Use the **public-store** package only.
- Confirm the publisher display name is Ahmed Imam.
- Host `privacy-policy.html` at a stable public HTTPS URL and use that URL in every listing.
- Supply a monitored support email in each developer dashboard.
- Keep the exact uploaded ZIP/XPI, the SHA-256 file, receipts, review emails, and listing screenshots.
- Do not select an open-source license.

## Chrome Web Store

- Register the developer account and pay the one-time registration fee shown by Google.
- Upload `D365-Switcher-v4.0.0-Chrome.zip`.
- Complete Store Listing, Privacy, Distribution, and Test Instructions.
- Declare a single purpose: D365 environment/legal-entity navigation.
- Justify `activeTab` and `storage` using `PERMISSION-JUSTIFICATIONS.md`.
- Declare no sale, transfer, or use of user data outside the extension's single purpose.
- Upload icon and screenshots from `store-assets/`.
- Submit for review; preserve the submission confirmation.

## Microsoft Edge Add-ons

- Enroll an individual account in the Microsoft Edge program through Partner Center.
- Upload `D365-Switcher-v4.0.0-Edge.zip`.
- Complete Properties, Privacy, Store listings, Availability, and Notes for certification.
- Use the same privacy and permission statements.
- Preserve the submission and certification records.

## Mozilla Add-ons (Firefox and Zen)

- Sign in to AMO with Ahmed Imam's Mozilla account.
- Upload `D365-Switcher-v4.0.0-Firefox-unsigned.xpi` as a listed add-on.
- Select proprietary/custom license terms and link the privacy policy.
- Declare that no data is collected or transmitted.
- The code is unminified and contains no build step or third-party dependencies; the public source is available in `source/public-store/`.
- Download and archive the Mozilla-signed XPI after approval.
- Zen users can install the AMO-listed/signed Firefox add-on.

## Rights evidence

- Import the source into a Git repository controlled by Ahmed Imam.
- Make the initial commit, tag `v4.0.0`, and do not rewrite release history.
- Store the full delivery archive and hashes in at least two independent locations.
- Keep records of the developer accounts, payment receipt, submission timestamps, and approvals.
- Consider professional legal advice and any available Kuwait copyright deposit/registration if stronger evidentiary protection is required.
