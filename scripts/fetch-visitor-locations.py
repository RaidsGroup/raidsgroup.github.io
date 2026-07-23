#!/usr/bin/env python3
"""Scrape public GoatCounter Locations widget into assets/data/visitor-locations.json."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

SITE = "https://raidsgroup.goatcounter.com/?no-websocket=1"
OUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "visitor-locations.json"


def main() -> int:
    try:
        with urllib.request.urlopen(SITE, timeout=30) as res:
            html = res.read().decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        print(f"warn: could not fetch GoatCounter dashboard: {exc}", file=sys.stderr)
        return 0

    idx = html.find("<h2>Locations</h2>")
    if idx < 0:
        print("warn: Locations widget not found", file=sys.stderr)
        return 0

    block = html[idx : idx + 8000]
    locations = []
    for match in re.finditer(
        r'data-key="([A-Z]{2})"[\s\S]{0,500}?cutoff">([^<]+)[\s\S]{0,300}?col-count">(\d+)',
        block,
    ):
        locations.append(
            {
                "code": match.group(1),
                "name": match.group(2).strip(),
                "count": int(match.group(3)),
            }
        )

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for row in locations:
        if row["code"] in seen:
            continue
        seen.add(row["code"])
        unique.append(row)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "updated": date.today().isoformat(),
                "period": "dashboard-default",
                "locations": unique,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT} ({len(unique)} locations)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
