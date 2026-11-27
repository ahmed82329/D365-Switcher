/*
 * D365 Company & Environment Switcher
 * Copyright © 2026 Ahmed Imam. All Rights Reserved.
 * Proprietary software. See LICENSE.txt.
 */
const D365_DEFAULTS = Object.freeze({
  "variant": "private-reda",
  "variantNote": "Private REDA-configured build. Do not submit this build to public stores.",
  "companies": [
    {
      "code": "R011",
      "description": "Chemical"
    },
    {
      "code": "R083",
      "description": "Oilfield"
    }
  ],
  "environments": [
    {
      "name": "REDA Production",
      "url": "https://redachem.operations.eu.dynamics.com/?cmp=R011&mi=SalesTableListPage"
    }
  ]
});
