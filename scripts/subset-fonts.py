"""裁剪网页字体。改了中文文案后重新运行：python3 scripts/subset-fonts.py
英文 Barlow Condensed 只保留基本拉丁字符；思源宋体只保留 src/ 里实际出现的汉字。"""
import pathlib, re
from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'design-assets/fonts/x'
OUT = ROOT / 'src/fonts'
OUT.mkdir(parents=True, exist_ok=True)

latin = ''.join(chr(c) for c in range(0x20, 0x7F)) + '·—–’“”…°'
text = ''.join(p.read_text(encoding='utf-8') for p in (ROOT / 'src').rglob('*.js*'))
cjk = ''.join(sorted(set(re.findall(r'[　-〿一-鿿＀-￯]', text))))

jobs = [
    ('Barlow_Condensed/BarlowCondensed-ExtraBoldItalic.ttf', 'barlow-condensed-800i.woff', latin),
    ('Barlow_Condensed/BarlowCondensed-SemiBoldItalic.ttf', 'barlow-condensed-600i.woff', latin),
    ('Barlow_Condensed/BarlowCondensed-Medium.ttf', 'barlow-condensed-500.woff', latin),
    ('Noto_Serif_SC/static/NotoSerifSC-Black.ttf', 'noto-serif-sc-900.woff', cjk + latin),
    ('Noto_Serif_SC/static/NotoSerifSC-Bold.ttf', 'noto-serif-sc-700.woff', cjk + latin),
]
for src, out, chars in jobs:
    opts = subset.Options()
    opts.flavor = 'woff'
    opts.layout_features = ['*']
    font = subset.load_font(str(SRC / src), opts)
    s = subset.Subsetter(opts)
    s.populate(text=chars)
    s.subset(font)
    subset.save_font(font, str(OUT / out), opts)
    print(out, (OUT / out).stat().st_size // 1024, 'KB')
print(len(cjk), 'CJK glyphs')
