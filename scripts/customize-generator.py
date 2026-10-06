"""Customize the pinned v0.9.3 source; fail if its expected structure changes."""
from pathlib import Path
import sys


def replace_once(source: str, old: str, new: str) -> str:
    if source.count(old) != 1:
        raise ValueError(f"Unexpected upstream source: {old[:80]!r}")
    return source.replace(old, new, 1)


def customize(root: Path) -> None:
    api_path = root / "src/github-graphql.ts"
    api = api_path.read_text(encoding="utf-8")
    api = replace_once(
        api,
        "import axios from 'axios';",
        "import axios from 'axios';\nimport { profilePeriod } from './profile-period';",
    )
    api = replace_once(
        api,
        '''    const yearArgs = year
        ? `(from:"${year}-01-01T00:00:00.000Z", to:"${year}-12-31T23:59:59.000Z")`
        : '';''',
        '''    const period = profilePeriod();
    const yearArgs = `(from:"${period.from}", to:"${period.to}")`;''',
    )

    svg_path = root / "src/create-svg.ts"
    svg = svg_path.read_text(encoding="utf-8")
    svg = replace_once(
        svg,
        '''        // radar chart
        radar.createRadarContrib(
            svg,
            userInfo,
            radarX,
            70,
            radarWidth,
            radarHeight,
            settings,
            isForcedAnimation,
        );

''',
        "",
    )
    # Place language statistics in the space previously occupied by the radar.
    svg = replace_once(
        svg,
        '''            40,
            height - pieHeight - 70,
            pieWidth,''',
        '''            width - pieWidth - 40,
            70,
            pieWidth,''',
    )

    calendar_path = root / "src/create-3d-contrib.ts"
    calendar = replace_once(
        calendar_path.read_text(encoding="utf-8"),
        "    const dx = width / 64;",
        "    const dx = width / (weekcount + 10);",
    )
    # Write only after every expected source fragment has been verified.
    api_path.write_text(api, encoding="utf-8")
    svg_path.write_text(svg, encoding="utf-8")
    calendar_path.write_text(calendar, encoding="utf-8")
    (root / "src/profile-period.ts").write_text(
        Path(__file__).with_name("profile-period.ts").read_text(encoding="utf-8"),
        encoding="utf-8",
    )


if __name__ == "__main__":
    customize(Path(sys.argv[1]))
    print("Applied rolling six-month range, removed radar, and adjusted layout.")
