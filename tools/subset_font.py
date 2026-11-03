"""Rebuild fonts/zhuque-fangsong-subset.woff2 from the characters used on the site.

Run after editing any page text:

    pip install fonttools brotli
    python tools/subset_font.py path/to/ZhuqueFangsong-Regular.ttf

The full font (about 8.8 MB) is not stored in the repository. Download it from
https://github.com/TrionesType/zhuque/releases (SIL Open Font License 1.1).
Characters missing from the subset fall back to the system FangSong font.
"""
import html
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "research.html", "app.js"]
EXTRA = (
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz "
    "，。、；：？！“”‘’（）《》「」—…·%+-−←→.,:;?!()'\"/"
)


def used_characters() -> str:
    text = EXTRA
    for name in PAGES:
        source = (ROOT / name).read_text(encoding="utf-8")
        if name.endswith(".html"):
            source = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", source)
            source = html.unescape(re.sub(r"<[^>]+>", " ", source))
        text += source
    return "".join(sorted({c for c in text if c == " " or not c.isspace()}))


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    chars = used_characters()
    out = ROOT / "fonts" / "zhuque-fangsong-subset.woff2"
    subprocess.run(
        [sys.executable, "-m", "fontTools.subset", sys.argv[1], f"--text={chars}",
         "--flavor=woff2", "--layout-features=*", f"--output-file={out}"],
        check=True,
    )
    print(f"{len(chars)} characters -> {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
