"""Cut furniture out of room.webp into separate PNGs that line up exactly on the background.

    python3 tools/cut_pieces.py                 # writes public/assets/furniture/*.png and src/data/layout.js
    python3 tools/cut_pieces.py --check DIR     # also writes check images (contact sheet, overview) into DIR

Each piece is a hand-traced outline (`poly`) snug around the furniture, in room.webp pixels, used
directly as the mask. A thin strip of floor inside the outline is fine: the pixels are identical to
the background, so it only shows where the piece covers the witch. `anchor` is the floor contact
point used for depth sorting. To re-cut a piece, edit its outline here and run the script again.
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ROOM = ROOT / 'public/assets/images/room.webp'
OUT = ROOT / 'public/assets/furniture'
LAYOUT = ROOT / 'src/data/layout.js'

PIECES = {
    # reading corner
    'armchair_l':   dict(anchor=(218, 500), poly=[(172,410),(176,400),(183,394),(227,393),(233,400),(241,418),(268,437),(272,476),(266,484),(240,490),(215,506),(205,506),(172,492),(166,450)]),
    'armchair_r':   dict(anchor=(400, 468), poly=[(341,407),(353,401),(362,379),(371,363),(395,360),(432,372),(442,384),(440,450),(432,462),(410,470),(400,474),(390,470),(350,452),(338,440)]),
    'coffee_table': dict(anchor=(314, 496), poly=[(297,408),(328,408),(330,440),(358,448),(358,460),(352,486),(342,480),(318,474),(316,498),(308,498),(306,476),(282,484),(274,476),(270,450),(295,440)]),
    'lamp_floor':   dict(anchor=(347, 425), poly=[(327,313),(371,313),(371,349),(356,356),(355,401),(340,401),(340,356),(327,349)]),
    # left wall: the candle bookcase and the low book cabinet against the railing (railing pixels included)
    'bookcase_l':   dict(anchor=(118, 564), poly=[(60,468),(84,446),(108,446),(120,456),(147,478),(147,558),(122,566),(60,540)]),
    'book_cabinet': dict(anchor=(200, 600), poly=[(146,551),(158,544),(176,534),(194,541),(203,546),(220,553),(234,566),(235,600),(213,602),(147,568)]),
    # window table
    'table_1':      dict(anchor=(428, 632), poly=[(410,524),(440,524),(444,546),(465,550),(473,560),(472,578),(455,586),(435,588),(435,612),(449,618),(449,632),(430,636),(408,632),(408,618),(419,612),(419,588),(398,586),(380,578),(379,560),(390,550),(406,546)]),
    'chair_1_se':   dict(anchor=(363, 572), poly=[(345,541),(350,537),(378,536),(380,540),(380,560),(384,570),(349,573),(345,562)]),
    'chair_1_sw':   dict(anchor=(487, 576), poly=[(461,529),(470,527),(496,536),(497,566),(491,577),(483,577),(480,572),(470,560),(459,550),(459,535)]),
    'chair_1_ne':   dict(anchor=(385, 648), poly=[(347,572),(352,569),(383,580),(385,600),(412,608),(411,640),(404,650),(375,651),(355,642),(348,625)]),
    'chair_1_nw':   dict(anchor=(480, 648), poly=[(478,572),(500,568),(512,571),(512,615),(503,640),(482,651),(470,650),(456,642),(449,612),(449,603),(478,592)]),
    # middle table (three chairs)
    'table_2':      dict(anchor=(631, 596), poly=[(619,489),(646,489),(650,512),(672,520),(679,532),(677,546),(658,556),(641,558),(641,577),(651,584),(651,593),(631,598),(610,592),(610,584),(625,577),(625,558),(598,551),(586,543),(585,529),(598,515),(616,512)]),
    'chair_2_se':   dict(anchor=(588, 594), poly=[(555,510),(577,499),(588,502),(591,531),(616,558),(616,568),(612,583),(605,584),(592,596),(583,596),(582,575),(566,584),(558,581),(560,540),(555,535)]),
    'chair_2_sw':   dict(anchor=(690, 538), poly=[(665,497),(671,494),(699,503),(701,534),(688,540),(678,531),(666,518)]),
    'chair_2_nw':   dict(anchor=(690, 604), poly=[(679,539),(710,528),(712,540),(709,593),(704,597),(684,607),(675,607),(673,592),(657,596),(650,592),(650,562),(658,557),(679,553)]),
    # corner table (four chairs) and the side cabinet with its lamp
    'table_3':      dict(anchor=(908, 575), poly=[(894,469),(921,470),(925,492),(945,498),(954,511),(950,527),(931,536),(916,538),(916,557),(929,562),(929,573),(907,577),(888,572),(889,562),(901,557),(901,538),(875,533),(862,523),(861,509),(874,495),(892,492)]),
    'chair_3_se':   dict(anchor=(850, 545), poly=[(828,493),(855,481),(865,484),(866,512),(864,521),(830,513)]),
    'chair_3_ne':   dict(anchor=(862, 589), poly=[(829,512),(863,519),(866,540),(889,543),(891,560),(889,580),(880,580),(879,566),(866,566),(865,590),(857,590),(856,568),(841,562),(840,579),(831,579),(828,540)]),
    'chair_3_sw':   dict(anchor=(965, 540), poly=[(952,496),(959,493),(979,500),(981,514),(950,516),(951,505)]),
    'chair_3_nw':   dict(anchor=(950, 588), poly=[(948,514),(981,512),(983,544),(979,560),(978,579),(971,579),(970,566),(955,569),(954,589),(947,589),(946,569),(931,562),(930,580),(923,580),(922,546),(947,535)]),
    'lamp_table_r': dict(anchor=(955, 550), poly=[(930,402),(968,402),(972,437),(964,444),(972,455),(995,476),(994,550),(989,553),(982,549),(981,513),(979,501),(958,493),(953,495),(952,500),(921,492),(921,470),(918,460),(935,452),(937,440),(926,437)]),
    # counter
    'counter_l':    dict(anchor=(646, 432), poly=[(610,350),(628,313),(672,313),(672,345),(682,372),(681,444),(612,420)]),
    'display_case': dict(anchor=(738, 478), poly=[(683,345),(710,340),(817,390),(818,420),(796,455),(795,503),(678,446),(676,418),(678,362)]),
    'counter_r':    dict(anchor=(858, 485), poly=[(808,380),(833,338),(865,348),(877,360),(912,366),(917,390),(919,458),(800,500),(796,455),(817,420)]),
    # entrance
    'pillar_1':     dict(anchor=(220, 683), poly=[(200,604),(212,598),(237,607),(237,675),(225,683),(200,672)]),
    'gate_l':       dict(anchor=(270, 690), poly=[(233,624),(242,610),(258,602),(275,603),(292,612),(305,630),(310,648),(301,655),(301,708),(237,678),(233,660)]),
    'pillar_2':     dict(anchor=(322, 712), poly=[(300,660),(320,648),(344,658),(344,705),(322,715),(300,708)]),
    'pillar_r':     dict(anchor=(880, 662), poly=[(853,601),(875,590),(899,601),(899,650),(880,662),(866,662),(866,615),(853,608)]),
    'planter_l':    dict(anchor=(158, 645), poly=[(116,600),(125,590),(140,588),(170,600),(190,612),(200,620),(200,656),(190,664),(118,632),(114,615)]),
    'planter_m':    dict(anchor=(375, 735), poly=[(328,689),(340,672),(365,672),(395,690),(412,697),(422,707),(420,748),(403,754),(332,722),(330,700)]),
    'planter_r':    dict(anchor=(822, 668), poly=[(781,628),(798,617),(816,606),(834,600),(852,602),(868,625),(864,655),(785,682),(778,676),(778,640)]),
    'lamp_post_1':  dict(anchor=(450, 712), poly=[(435,669),(452,669),(467,682),(466,708),(478,712),(478,782),(450,795),(422,785),(422,712),(440,705),(435,690)]),
    'lamp_post_2':  dict(anchor=(607, 700), poly=[(598,634),(612,634),(623,648),(622,672),(635,678),(635,758),(605,765),(578,755),(578,680),(593,670),(590,648)]),
    'lamp_post_3':  dict(anchor=(755, 705), poly=[(744,592),(756,592),(767,606),(766,628),(782,636),(782,705),(755,715),(728,705),(728,640),(742,630),(738,607)]),
    # the entrance arch as one U shape (outer edge, post bottoms, inner edge), without the doormat
    'arch':         dict(anchor=(690, 708), poly=[(631,739),(630,668),(633,652),(642,637),(655,624),(670,615),(685,613),(700,616),(715,623),(727,633),(736,645),(736,703),(725,708),(716,708),(715,650),(708,636),(697,627),(683,625),(668,629),(656,639),(648,652),(645,668),(646,738),(638,741)]),
    'chalkboard':   dict(anchor=(545, 758), poly=[(519,672),(562,655),(570,659),(583,746),(577,751),(552,748),(545,766),(536,766),(522,752),(508,757),(507,744),(517,690)]),
}


def poly_mask(size, poly):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).polygon([tuple(p) for p in poly], fill=255)
    return np.array(m) > 0


def cut():
    room = np.array(Image.open(ROOM).convert('RGBA'))
    OUT.mkdir(parents=True, exist_ok=True)
    layout = []
    for key, p in PIECES.items():
        m = poly_mask((room.shape[1], room.shape[0]), p['poly']) & (room[:, :, 3] > 0)
        ys, xs = np.nonzero(m)
        left, top, right, bottom = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        piece = room[top:bottom, left:right].copy()
        piece[:, :, 3] = np.where(m[top:bottom, left:right], piece[:, :, 3], 0)
        Image.fromarray(piece).save(OUT / f'{key}.png', optimize=True)
        ax, ay = p['anchor']
        layout.append(dict(key=key, x=ax, y=ay, left=int(left), top=int(top), w=int(right - left), h=int(bottom - top)))
    lines = ',\n'.join('  ' + json.dumps(e, separators=(', ', ': ')).replace('"', "'") for e in layout)
    LAYOUT.write_text(
        '// Generated by tools/cut_pieces.py. Do not edit by hand: change the outlines there and re-run.\n'
        '// x, y = anchor (floor contact point, used for depth). left, top = top-left of the PNG in room pixels.\n'
        '// In Phaser: add.image(x, y, key).setOrigin((x - left) / w, (y - top) / h).setDepth(y)\n'
        f'export const PIECES = [\n{lines},\n];\n')
    print(f'{len(layout)} pieces -> {OUT.relative_to(ROOT)}, {LAYOUT.relative_to(ROOT)}')
    return room, layout


def check(room, layout, d):
    d = Path(d)
    d.mkdir(parents=True, exist_ok=True)
    # 1. registration: every opaque pixel of every piece must equal the background pixel under it
    worst = 0
    for e in layout:
        a = np.array(Image.open(OUT / f"{e['key']}.png"))
        under = room[e['top']:e['top'] + e['h'], e['left']:e['left'] + e['w']]
        on = a[:, :, 3] > 0
        worst = max(worst, int(np.abs(a[on].astype(int) - under[on].astype(int)).max()))
    print('registration max pixel diff:', worst)

    # 2. contact sheet: each piece at 3x on mint, labelled
    S, mint, cols = 3, (150, 225, 200, 255), 6
    cells = [Image.open(OUT / f"{e['key']}.png") for e in layout]
    cw = max(c.width for c in cells) * S + 20
    ch = max(c.height for c in cells) * S + 36
    rows = (len(cells) + cols - 1) // cols
    sheet = Image.new('RGBA', (cols * cw, rows * ch), (255, 255, 255, 255))
    dr = ImageDraw.Draw(sheet)
    for i, (e, c) in enumerate(zip(layout, cells)):
        cx, cy = (i % cols) * cw, (i // cols) * ch
        dr.rectangle([cx + 4, cy + 4, cx + cw - 4, cy + ch - 24], fill=mint)
        big = c.resize((c.width * S, c.height * S), Image.NEAREST)
        sheet.alpha_composite(big, (cx + (cw - big.width) // 2, cy + 4 + (ch - 28 - big.height) // 2))
        dr.text((cx + 8, cy + ch - 20), e['key'], fill=(40, 30, 30, 255))
    sheet.convert('RGB').save(d / 'pieces.png')

    # 3. overview: room faded, pieces at full strength in place, anchors as dots
    ov = Image.new('RGBA', room.shape[1::-1], (255, 255, 255, 255))
    faded = Image.fromarray(room).copy()
    faded.putalpha(Image.fromarray((room[:, :, 3] * 0.3).astype(np.uint8)))
    ov.alpha_composite(faded)
    for e, c in zip(layout, cells):
        ov.alpha_composite(c, (e['left'], e['top']))
    dr = ImageDraw.Draw(ov)
    for e in layout:
        dr.ellipse([e['x'] - 3, e['y'] - 3, e['x'] + 3, e['y'] + 3], fill=(230, 40, 90, 255))
    ov = ov.resize((ov.width * 2, ov.height * 2), Image.NEAREST)
    ov.convert('RGB').save(d / 'overview.png')
    print('check images ->', d)


if __name__ == '__main__':
    room, layout = cut()
    if '--check' in sys.argv:
        check(room, layout, sys.argv[sys.argv.index('--check') + 1])
