// Hand-written extras for each piece in layout.js (kept separate so re-cutting doesn't lose them).
// collide: floor footprint in room pixels, centred on the anchor x with its bottom edge on the anchor y.
//   dx, dy nudge the box; a list of boxes is allowed for diagonal pieces (display case, counter).
// seat: where her feet go when seated. approach: walkable spot she walks to first. face: sitting direction.
// Only chairs that exist in layout.js have a seat (table 2 has no ne chair).
export const PROPS = {
  // reading corner
  armchair_l:   { collide: { w: 84, h: 44 }, seat: [224, 478], approach: [272, 506], face: 'se' },
  armchair_r:   { collide: { w: 80, h: 40 }, seat: [388, 458], approach: [352, 486], face: 'sw' },
  coffee_table: { collide: { w: 64, h: 30 } },
  lamp_floor:   { collide: { w: 16, h: 10 } },
  // window table
  table_1:      { collide: { w: 56, h: 28 } },
  chair_1_se:   { collide: { w: 30, h: 16 }, seat: [366, 562], approach: [330, 572], face: 'se' },
  chair_1_sw:   { collide: { w: 30, h: 16 }, seat: [484, 566], approach: [520, 576], face: 'sw' },
  chair_1_ne:   { collide: { w: 44, h: 26 }, seat: [388, 632], approach: [378, 662], face: 'ne' },
  chair_1_nw:   { collide: { w: 44, h: 26 }, seat: [477, 632], approach: [488, 662], face: 'nw' },
  // middle table (three chairs)
  table_2:      { collide: { w: 56, h: 28 } },
  chair_2_se:   { collide: { w: 40, h: 22 }, seat: [590, 578], approach: [552, 592], face: 'se' },
  chair_2_sw:   { collide: { w: 28, h: 14 }, seat: [688, 530], approach: [722, 540], face: 'sw' },
  chair_2_nw:   { collide: { w: 44, h: 24 }, seat: [686, 590], approach: [700, 618], face: 'nw' },
  // corner table (four chairs) and the side cabinet with its lamp
  table_3:      { collide: { w: 56, h: 28 } },
  chair_3_se:   { collide: { w: 30, h: 16 }, seat: [853, 536], approach: [818, 548], face: 'se' },
  chair_3_sw:   { collide: { w: 28, h: 14 }, seat: [962, 532], approach: [966, 556], face: 'sw' },
  chair_3_ne:   { collide: { w: 44, h: 26 }, seat: [866, 572], approach: [850, 602], face: 'ne' },
  chair_3_nw:   { collide: { w: 44, h: 26 }, seat: [946, 572], approach: [960, 602], face: 'nw' },
  lamp_table_r: { collide: { w: 36, h: 60, dx: 20 } },
  // counter
  counter_l:    { collide: { w: 72, h: 60, dy: 6 } },
  display_case: { collide: [{ w: 56, h: 40, dx: -28, dy: -10 }, { w: 56, h: 40, dx: 28, dy: 18 }] },
  counter_r:    { collide: [{ w: 60, h: 40, dx: -28, dy: 12 }, { w: 60, h: 40, dx: 30, dy: -10 }] },
  // entrance
  planter_l:    { collide: { w: 70, h: 30 } },
  planter_m:    { collide: { w: 76, h: 30 } },
  planter_r:    { collide: { w: 70, h: 30 } },
  lamp_post_1:  { collide: { w: 56, h: 24, dy: 8 } },
  lamp_post_2:  { collide: { w: 56, h: 24, dy: 8 } },
  lamp_post_3:  { collide: { w: 54, h: 24, dy: 8 } },
  chalkboard:   { collide: { w: 70, h: 20 } },
};

// every footprint box of a piece as { x, y, w, h } (centre, size) in room pixels
export function boxes(piece) {
  const c = PROPS[piece.key]?.collide;
  if (!c) return [];
  return [c].flat().map(({ w, h, dx = 0, dy = 0 }) => ({ x: piece.x + dx, y: piece.y + dy - h / 2, w, h }));
}
