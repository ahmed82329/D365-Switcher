#!/usr/bin/env python3
import csv
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_SOURCE = ROOT / "source" / "public-store"
PUBLIC_PACKAGES = {
    "D365-Switcher-v4.0.0-Chrome.zip": "manifest.chromium.json",
    "D365-Switcher-v4.0.0-Edge.zip": "manifest.chromium.json",
    "D365-Switcher-v4.0.0-Firefox-unsigned.xpi": "manifest.firefox.json",
}
EVIDENCE_FILES = (
    "GIT-BUNDLE-README.txt",
    "GIT-BUNDLE-VERIFY.txt",
    "GIT-COMMIT-RECORD.txt",
    "VALIDATION-REPORT.txt",
    "validate_release.py",
)
checks = []


def check(name, passed):
    checks.append((name, bool(passed)))
    print(("PASS" if passed else "FAIL"), name)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def release_files():
    files = [ROOT / "README.md", ROOT / "SECURITY.md"]
    for folder in ("documentation", "source/public-store", "store-assets"):
        files.extend(path for path in (ROOT / folder).rglob("*") if path.is_file())
    files.extend(ROOT / "packages" / name for name in PUBLIC_PACKAGES)
    files.extend(ROOT / "evidence" / name for name in EVIDENCE_FILES)
    return sorted(files, key=lambda path: path.relative_to(ROOT).as_posix())


for manifest_name in ("manifest.chromium.json", "manifest.firefox.json", "manifest.json"):
    path = PUBLIC_SOURCE / manifest_name
    try:
        manifest = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        check(f"public-store/{manifest_name} JSON", False)
        continue
    check(f"public-store/{manifest_name} JSON", True)
    check(f"public-store/{manifest_name} MV3", manifest.get("manifest_version") == 3)
    check(
        f"public-store/{manifest_name} minimal permissions",
        set(manifest.get("permissions", [])) == {"activeTab", "storage"},
    )
    check(f"public-store/{manifest_name} no host permissions", "host_permissions" not in manifest)

config_text = (PUBLIC_SOURCE / "config.js").read_text(encoding="utf-8")
config_match = re.search(r"D365_DEFAULTS\s*=\s*Object\.freeze\((\{.*?\})\);", config_text, re.S)
try:
    config = json.loads(config_match.group(1)) if config_match else {}
except json.JSONDecodeError:
    config = {}
check("public config has public variant", config.get("variant") == "public")
check("public config has empty defaults", config.get("companies") == [] and config.get("environments") == [])

source_files = {
    path.relative_to(PUBLIC_SOURCE).as_posix(): path
    for path in PUBLIC_SOURCE.rglob("*")
    if path.is_file() and path.name not in ("manifest.chromium.json", "manifest.firefox.json")
}
expected_archive_files = set(source_files)
for package_name, manifest_name in PUBLIC_PACKAGES.items():
    package_path = ROOT / "packages" / package_name
    try:
        with zipfile.ZipFile(package_path) as archive:
            names = {name for name in archive.namelist() if not name.endswith("/")}
            manifest = json.loads(archive.read("manifest.json"))
            check(f"{package_name} manifest root", "manifest.json" in names)
            check(f"{package_name} archive integrity", archive.testzip() is None)
            check(f"{package_name} exact public file set", names == expected_archive_files)
            check(
                f"{package_name} HTML references",
                all(name in names for name in ("popup.html", "options.html", "popup.js", "options.js", "config.js", "styles.css")),
            )
            popup = archive.read("popup.html").decode("utf-8")
            check(f"{package_name} popup dependency order", popup.index("config.js") < popup.index("popup.js"))
            for name, source_path in source_files.items():
                expected_path = PUBLIC_SOURCE / manifest_name if name == "manifest.json" else source_path
                check(f"{package_name} matches public source: {name}", archive.read(name) == expected_path.read_bytes())
            if package_name.endswith(".xpi"):
                check(
                    f"{package_name} no-data declaration",
                    manifest.get("browser_specific_settings", {})
                    .get("gecko", {})
                    .get("data_collection_permissions", {})
                    .get("required")
                    == ["none"],
                )
    except (OSError, KeyError, ValueError, zipfile.BadZipFile) as error:
        check(f"{package_name} readable package", False)

for path in sorted(PUBLIC_SOURCE.rglob("*.js")):
    check(
        f"{path.relative_to(ROOT).as_posix()} copyright",
        "Copyright © 2026 Ahmed Imam" in path.read_text(encoding="utf-8"),
    )

bundle_path = ROOT / "evidence" / "D365-Switcher-v4.0.0.gitbundle"
check("full-history bundle excluded", not bundle_path.exists())
expected_files = release_files()
expected_paths = [path.relative_to(ROOT).as_posix() for path in expected_files]
check("release manifest is public-only", all(path.is_file() for path in expected_files))

manifest_path = ROOT / "evidence" / "FILE-MANIFEST.tsv"
try:
    with manifest_path.open(encoding="utf-8", newline="") as stream:
        manifest_rows = list(csv.DictReader(stream, delimiter="\t"))
except OSError:
    manifest_rows = []
manifest_paths = [row.get("path", "") for row in manifest_rows]
check("file manifest contains exactly public release files", manifest_paths == expected_paths)
for path, row in zip(expected_files, manifest_rows):
    check(
        f"file manifest integrity: {row.get('path', '')}",
        row.get("size_bytes") == str(path.stat().st_size) and row.get("sha256") == sha256(path),
    )

sum_path = ROOT / "evidence" / "SHA256SUMS.txt"
try:
    sums = {}
    for line in sum_path.read_text(encoding="utf-8").splitlines():
        digest, name = line.split("  ", 1)
        sums[name] = digest
except (OSError, ValueError):
    sums = {}
check("SHA256 list contains exactly public release files", list(sums) == expected_paths)
for path, name in zip(expected_files, expected_paths):
    check(f"SHA256 matches: {name}", sums.get(name) == sha256(path))

failed = [name for name, passed in checks if not passed]
print(f"\n{len(checks) - len(failed)}/{len(checks)} checks passed")
if failed:
    print(f"{len(failed)} checks failed", file=sys.stderr)
    sys.exit(1)
