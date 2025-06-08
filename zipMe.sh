#!/bin/sh
# Build for webkit
cat chrome_manifest.json > manifest.json
zip -r -FS chrome.zip * -x .git\* \*.zip \*.sh tests\* screenshoots\* \*_manifest.json \*.md icon.png
# Build for gecko
cat firefox_manifest.json | tr '\n' '\f' | sed 's/\f}\f$/,\f    "browser_specific_settings": {\f        "gecko": {\f            "id": "simple_url_switcher@lp177.fr",\f            "strict_min_version": "109.0"\f        }\f    }\f}/' | tr '\f' '\n' > manifest.json
zip -r -FS firefox.zip * -x .git\* \*.zip \*.sh tests\* screenshoots\* \*_manifest.json \*.md icon.png