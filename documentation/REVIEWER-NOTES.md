# Reviewer Notes

The extension has no login, server, analytics, advertising, remote code, or external network requests.

Test procedure:
1. Install the public build.
2. Open the extension and select **Manage lists**.
3. Add an authorized D365 environment such as `https://example.operations.dynamics.com/`.
4. Add a company code such as `USMF` with a description.
5. Open a real authorized D365 Finance & Operations page.
6. Open the popup. Confirm environment and `cmp` detection.
7. Select another configured company and confirm only `cmp` changes.
8. Select another configured environment and confirm path, query, and fragment are preserved.

Without credentials to an actual customer D365 environment, reviewers can still inspect configuration management, import/export, validation, permissions, and source code. The extension does not bypass authentication or authorization.
