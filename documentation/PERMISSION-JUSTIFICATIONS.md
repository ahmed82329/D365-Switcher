# Permission Justifications

## Single purpose

Enable a user to navigate between user-configured Microsoft Dynamics 365 Finance & Operations environments and legal entities without manually editing the active tab's URL.

## `activeTab`

Required only after the user invokes the toolbar popup. The extension reads the active URL to detect the current environment and `cmp` company value, and updates that same tab when the user selects a destination. It does not read background tabs or browsing history.

## `storage`

Required to store the environment names/URLs and company codes/descriptions that the user manages. Storage is local to the extension. No configuration is sent to the developer or a third party.

## Remote code

None. All JavaScript, HTML, CSS, and images are packaged in the extension.

## Host permissions

None. Access is user-initiated through `activeTab`; broad persistent site access is not requested.
