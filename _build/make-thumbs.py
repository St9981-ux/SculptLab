"""Makes the small copies used for finish and gallery thumbnails (assets/thumbs/, 400 px, WebP, quality 90).
Run after adding or replacing a photograph:  python3 _build/make-thumbs.py   (needs Pillow: pip install pillow)
Then run  npm run build  in _build/, which checks that every thumbnail exists."""
import os, re
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = open(os.path.join(ROOT, 'data.js'), encoding='utf-8').read()
sources = sorted(set(re.findall(r'"(/assets/[\w.-]+\.(?:webp|png|jpg))"', data)))
out_dir = os.path.join(ROOT, 'assets', 'thumbs'); os.makedirs(out_dir, exist_ok=True)
made = 0
for src in sources:
    path = os.path.join(ROOT, src.lstrip('/')); target = os.path.join(out_dir, os.path.basename(src))
    if os.path.exists(target) and os.path.getmtime(target) >= os.path.getmtime(path): continue
    im = Image.open(path); im.load()
    im = im.convert('RGBA') if im.mode in ('P', 'LA', 'RGBA') else im.convert('RGB')
    im.thumbnail((400, 400), Image.LANCZOS)
    im.save(os.path.splitext(target)[0] + '.webp' if target.endswith('.webp') else target, quality=90, method=6)
    made += 1
print(f'{len(sources)} photographs, {made} thumbnail(s) written to assets/thumbs/')
