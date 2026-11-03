import zipfile, io, re
from defusedxml.ElementTree import parse

Z = zipfile.ZipFile('supplai_deck.pptx')
EMU = 914400.0

# slide size
pres = parse(io.BytesIO(Z.read('ppt/presentation.xml')))
# find sldSz
SW = SH = None
for el in pres.iter():
    tag = el.tag.split('}')[-1]
    if tag == 'sldSz':
        SW = int(el.attrib.get('cx', 0)) / EMU
        SH = int(el.attrib.get('cy', 0)) / EMU
print(f'Slide size: {SW:.3f} x {SH:.3f} in')
LIMIT_R = SW + 0.05
LIMIT_B = SH + 0.05

def slide_files():
    return [n for n in Z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)]

def rects(slide_xml):
    root = parse(io.BytesIO(Z.read(slide_xml)))
    ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
          'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
    out = []
    for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
        xf = sp.find('p:spPr/a:xfrm', ns)
        if xf is None: continue
        off = xf.find('a:off', ns); ext = xf.find('a:ext', ns)
        if off is None or ext is None: continue
        x = int(off.attrib['x']); y = int(off.attrib['y'])
        cx = int(ext.attrib['cx']); cy = int(ext.attrib['cy'])
        # is it text?
        tx = sp.find('p:txBody', ns)
        has_text = tx is not None
        # fill type
        fill = 'none'
        solid = sp.find('p:spPr/a:solidFill', ns)
        nofill = sp.find('p:spPr/a:noFill', ns)
        if solid is not None: fill = 'solid'
        elif nofill is not None: fill = 'none'
        # text content
        texts = []
        if has_text:
            for t in tx.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
                texts.append(t.text or '')
        size = None
        for rpr in tx.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr') if has_text else []:
            sz = rpr.attrib.get('sz')
            if sz: size = int(sz)/100 # points (sz is hundredths of a point? actually sz=1800 = 18pt? no, sz in 100ths of point)
        out.append(dict(x=x/EMU, y=y/EMU, w=cx/EMU, h=cy/EMU, text=has_text, fill=fill,
                        content=' | '.join(texts), size=size, slide=slide_xml))
    return out

issues = []
allr = {}
for f in slide_files():
    rs = rects(f)
    allr[f] = rs
    for r in rs:
        if r['x'] < -0.01 or r['y'] < -0.01:
            issues.append((f, 'NEGATIVE POSITION', r['content'][:40], round(r['x'],2), round(r['y'],2)))
        if r['x'] + r['w'] > LIMIT_R:
            issues.append((f, 'RIGHT EDGE OVERFLOW', r['content'][:40], round(r['x']+r['w'],2)))
        if r['y'] + r['h'] > LIMIT_B:
            issues.append((f, 'BOTTOM EDGE OVERFLOW', r['content'][:40], round(r['y']+r['h'],2)))

# text-on-text overlap
import itertools
for f, rs in allr.items():
    boxes = [r for r in rs if r['text']]
    for a, b in itertools.combinations(boxes, 2):
        ix = min(a['x']+a['w'], b['x']+b['w']) - max(a['x'], b['x'])
        iy = min(a['y']+a['h'], b['y']+b['h']) - max(a['y'], b['y'])
        if ix > 0.02 and iy > 0.02:
            areas = min(a['w']*a['h'], b['w']*b['h'])
            ov = (ix*iy)/areas*100
            if ov > 25:
                issues.append((f, 'TEXT OVERLAP', f"{ov:.0f}% :: '{a['content'][:30]}' vs '{b['content'][:30]}'"))

# text width estimate vs box width (Calibri avg char ~0.5em; Cambria ~0.55em)
for f, rs in allr.items():
    for r in rs:
        if not r['text'] or not r['content'] or not r['size']:
            continue
        em = 0.52 if 'Cambria' in str(r.get('font','')) else 0.50
        est_w = len(r['content']) * r['size'] * em / 72.0
        # wraps reduce lines; rough check: single-line texts that exceed box
        if '\n' not in r['content'] and est_w > r['w'] * 1.35:
            issues.append((f, 'TEXT LIKELY OVERFLOWS BOX', f"{r['content'][:40]} est {est_w:.1f}in vs box {r['w']:.1f}in"))

print(f'\nTotal issues: {len(issues)}')
for it in issues:
    print(it)
