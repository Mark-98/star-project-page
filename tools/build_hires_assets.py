#!/usr/bin/env python3
"""Rebuild crisp original-paper figures from the NeurIPS 2026 PDF.
Requires: pip install pymupdf pillow
Run from the project root: python tools/build_hires_assets.py
Preserves PDF vector paths for Figs. 1 & 2 and extracts original image data
for evaluation observations without enlarging source raster pixels.
"""
from __future__ import annotations
import io
import re
from pathlib import Path
import fitz
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
DOC = fitz.open(ROOT / 'paper.pdf')
ASSETS.mkdir(parents=True, exist_ok=True)

# page indices 0-based; bbox is PDF points (x0, y0, x1, y1).
VECTORS = {
    'motivation_diagnostics': (3, (108, 66, 505, 276)),
    'method_overview': (4, (108, 65, 507, 198)),
}
for name, (page_num, box) in VECTORS.items():
    page = DOC[page_num]
    x0, y0, x1, y1 = box
    width, height = x1-x0, y1-y0
    svg = page.get_svg_image(text_as_path=True)
    # Keeping all original PDF vector paths prevents aliasing at any browser zoom.
    svg = re.sub(r'(<svg\b[^>]*?)\bwidth="[^"]+"', rf'\g<1>width="{width}"', svg, count=1)
    svg = re.sub(r'(<svg\b[^>]*?)\bheight="[^"]+"', rf'\g<1>height="{height}"', svg, count=1)
    svg = re.sub(r'(<svg\b[^>]*?)\bviewBox="[^"]+"', rf'\g<1>viewBox="{x0} {y0} {width} {height}"', svg, count=1)
    (ASSETS / (name + '.svg')).write_text(svg, encoding='utf8')
    # Retina/printing fallback: render PDF crop at 5x native PDF units (~360 ppi).
    pix = page.get_pixmap(matrix=fitz.Matrix(5, 5), clip=fitz.Rect(*box), alpha=False)
    pix.save(ASSETS / (name + '.png'), output='png')
    print(name, 'SVG+PNG', width, height, f'{pix.width}x{pix.height}')

font_file='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font_bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def atlas(page_num, xrefs, name, labels, side):
    imdata = []
    page = DOC[page_num]
    for xref in xrefs:
        raw = DOC.extract_image(xref)['image']
        source = Image.open(io.BytesIO(raw)).convert('RGB')
        if source.width != side:
            # 2048px DP originals downsampled only for reasonable website size.
            source.thumbnail((side,side), Image.Resampling.LANCZOS)
        imdata.append(source)
    assert len(imdata) == len(labels)
    pad, gap, caption_space = 24, 18, 80
    out=Image.new('RGB',(pad*2 + side*len(imdata)+gap*(len(imdata)-1),pad*2+side+caption_space),'#ffffff')
    draw = ImageDraw.Draw(out)
    font = ImageFont.truetype(font_bold, 27 if side==512 else 35)
    for idx, (src, label) in enumerate(zip(imdata, labels)):
        x=pad+(side+gap)*idx
        y=pad
        out.paste(src,(x,y))
        text_box=draw.textbbox((0,0),label,font=font)
        w=text_box[2]-text_box[0]
        draw.text((x+(side-w)//2,pad+side+24),label,font=font,fill='#303746')
    out.save(ASSETS / (name + '.png'), format='PNG', optimize=True)
    print(name, 'native-image atlas',out.size,'size', (ASSETS / (name + '.png')).stat().st_size)

atlas(6,[216,217,218,219,220], 'dmc_shift_examples',
      ['Training','Color Easy','Color Hard','Video Easy','Video Hard'],512)
atlas(7,[223,224,225,226,227], 'robosuite_shift_examples',
      ['Original','Easy','Medium','Hard','Video'],512)
atlas(14,[242,243,244], 'diffusion_square_shifts',
      ['Square Easy','Square Medium','Square Hard'],800)
