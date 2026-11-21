// Hand-written extras for each piece in layout.js (kept separate so re-cutting doesn't lose them).
// collide: floor footprint in room pixels, centred on the anchor x with its bottom edge on the anchor y.
//   dx, dy nudge the box; a list of boxes is allowed for diagonal pieces (display case, counter).
// seat: where her feet go when seated. approach: walkable spot she walks to first. face: sitting direction.
//   mug: where her drink stands on the table (or the coffee table, for the armchairs).
//   depth (optional): her depth while seated, when the default (just above or below the chair) is wrong.
//   chair_3_sw needs it to sit in front of the lamp cabinet, and chair_3_nw is approached from the side
//   because it backs onto the railing.
// front (optional): the piece's front floor edge as a polyline, left to right, for long or V-shaped pieces
//   where one anchor y gives the wrong depth. She's drawn in front of the piece when her feet are below
//   this edge at her x. Traced from the lowest opaque pixel per column of the piece PNG.
// Only chairs that exist in layout.js have a seat (table 2 has no ne chair).
export const PROPS = {
  // reading corner
  armchair_l:   { collide: { w: 84, h: 44 }, seat: [227, 478], approach: [272, 506], face: 'se', mug: [300, 458],
                  front: [[170, 491], [212, 507], [268, 482]] },
  armchair_r:   { collide: { w: 80, h: 40 }, seat: [391, 458], approach: [358, 486], face: 'sw', mug: [328, 455],
                  front: [[350, 452], [398, 473], [436, 458]] },
  // the second box closes the gap to armchair_l, which is too narrow for her
  coffee_table: { collide: [{ w: 64, h: 30 }, { w: 26, h: 24, dx: -40, dy: 2 }],
                  front: [[274, 477], [312, 498], [352, 480]] },
  lamp_floor:   { collide: { w: 16, h: 10 } },
  // left wall. She can only stand to the right of the candle bookcase, beside it, so its front edge sits
  // above her and it's always behind her. The book cabinet is only ever behind her or to her left.
  bookcase_l:   { collide: { w: 56, h: 50, dx: -3 }, front: [[60, 470], [147, 470]] },
  book_cabinet: { collide: [{ w: 35, h: 52, dx: -32 }, { w: 51, h: 49, dx: 11, dy: 5 }],
                  front: [[147, 568], [213, 602], [235, 601]] },
  // window table
  table_1:      { collide: { w: 56, h: 28 } },
  chair_1_se:   { collide: { w: 30, h: 16 }, seat: [368, 574], approach: [330, 572], face: 'se', mug: [401, 550] },
  chair_1_sw:   { collide: { w: 30, h: 16 }, seat: [485, 578], approach: [520, 576], face: 'sw', mug: [450, 550] },
  chair_1_ne:   { collide: { w: 44, h: 26 }, seat: [369, 632], approach: [378, 662], face: 'ne', mug: [410, 560] },
  chair_1_nw:   { collide: { w: 44, h: 26 }, seat: [496, 632], approach: [488, 662], face: 'nw', mug: [448, 560] },
  // middle table (three chairs)
  table_2:      { collide: { w: 56, h: 28 } },
  chair_2_se:   { collide: { w: 40, h: 22 }, seat: [590, 578], approach: [552, 592], face: 'se', mug: [613, 515] },
  chair_2_sw:   { collide: { w: 28, h: 14 }, seat: [688, 540], approach: [722, 540], face: 'sw', mug: [654, 515] },
  chair_2_nw:   { collide: { w: 44, h: 24 }, seat: [698, 590], approach: [700, 618], face: 'nw', mug: [654, 525] },
  // corner table (four chairs) and the side cabinet with its lamp
  table_3:      { collide: { w: 56, h: 28 } },
  chair_3_se:   { collide: { w: 30, h: 16 }, seat: [853, 544], approach: [818, 548], face: 'se', mug: [884, 498] },
  chair_3_sw:   { collide: { w: 28, h: 14 }, seat: [962, 542], approach: [940, 540], face: 'sw', mug: [930, 498], depth: 551 },
  chair_3_ne:   { collide: { w: 44, h: 26 }, seat: [851, 572], approach: [850, 602], face: 'ne', mug: [888, 508] },
  chair_3_nw:   { collide: { w: 44, h: 26 }, seat: [966, 572], approach: [914, 587], face: 'nw', mug: [924, 508] },
  // a long diagonal piece: the second box covers its left end, which the first one missed
  lamp_table_r: { collide: [{ w: 36, h: 60, dx: 20 }, { w: 22, h: 21, dx: -8, dy: -33 }],
                  front: [[921, 494], [980, 553], [995, 550]] },
  // counter
  counter_l:    { collide: { w: 72, h: 60, dy: 6 }, front: [[614, 420], [680, 442]] },
  display_case: { collide: [{ w: 56, h: 40, dx: -28, dy: -10 }, { w: 56, h: 40, dx: 28, dy: 18 }],
                  front: [[680, 447], [792, 500]] },
  counter_r:    { collide: [{ w: 60, h: 40, dx: -28, dy: 12 }, { w: 60, h: 40, dx: 30, dy: -10 }],
                  front: [[798, 500], [920, 458]] },
  // entrance. The railing pillars and the garden gate have no footprint: the floor already stops at them
  planter_l:    { collide: { w: 70, h: 30 }, front: [[118, 632], [190, 663]] },
  planter_m:    { collide: { w: 76, h: 30 }, front: [[332, 722], [406, 753], [420, 747]] },
  planter_r:    { collide: { w: 70, h: 30 }, front: [[782, 681], [864, 654]] },
  lamp_post_1:  { collide: { w: 56, h: 24, dy: 8 } },
  lamp_post_2:  { collide: { w: 56, h: 24, dy: 8 } },
  lamp_post_3:  { collide: { w: 54, h: 24, dy: 8 } },
  // she's in front of the arch on the doormat (and outside), behind it anywhere inside the café.
  // The edge is the doormat's inner edges moved down by EDGE_SLACK, so the slack lands on the mat's edge
  arch:         { front: [[640, 718], [687, 700], [730, 719]] },
  chalkboard:   { collide: { w: 70, h: 20 } },
};

// y of a front edge polyline at x (clamped to its ends)
export function edgeY(front, x) {
  if (x <= front[0][0]) return front[0][1];
  for (let i = 1; i < front.length; i++) {
    const [x0, y0] = front[i - 1], [x1, y1] = front[i];
    if (x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
  }
  return front[front.length - 1][1];
}

// every footprint box of a piece as { x, y, w, h } (centre, size) in room pixels
export function boxes(piece) {
  const c = PROPS[piece.key]?.collide;
  if (!c) return [];
  return [c].flat().map(({ w, h, dx = 0, dy = 0 }) => ({ x: piece.x + dx, y: piece.y + dy - h / 2, w, h }));
}
