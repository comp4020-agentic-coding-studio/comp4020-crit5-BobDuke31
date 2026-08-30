// Contract test for this week's crit (05-game, "A game"): "it can be lost: a
// wrong move is possible, and play ends somewhere — a win, a loss or a
// finish." Tested against the pure rules in src/scripts/path.ts, not the DOM,
// so it holds regardless of how the game is drawn.
import { describe, expect, it } from "vitest";
import { BEAD_RADIUS, isWithinPath, LEVELS, nextState } from "../src/scripts/path";

const level = LEVELS[0];
const start = level.path[0];
const end = level.path[level.path.length - 1];

describe("Steady Hand: the one rule", () => {
  it("starts idle and stays idle away from the start", () => {
    expect(nextState("idle", { x: 0, y: 0 }, level)).toBe("idle");
  });

  it("moving onto the start begins a run", () => {
    expect(nextState("idle", start, level)).toBe("running");
  });

  it("staying on the path keeps the run going", () => {
    const onPath = level.path[2]; // an interior waypoint, dead on the centerline
    expect(nextState("running", onPath, level)).toBe("running");
  });

  it("a wrong move — straying off the path — ends the run in a loss", () => {
    const farOff = { x: level.path[2].x, y: level.path[2].y + 30 };
    expect(isWithinPath(farOff, level.path, level.width)).toBe(false);
    expect(nextState("running", farOff, level)).toBe("lost");
  });

  it("reaching the end finishes the run as a win", () => {
    expect(nextState("running", end, level)).toBe("won");
  });

  it("won and lost are terminal until something resets them", () => {
    expect(nextState("won", start, level)).toBe("won");
    expect(nextState("lost", end, level)).toBe("lost");
  });

  it("on a straight stretch, the whole bead — not just its centre — must stay inside the track", () => {
    // Just past the centerline, still inside the track's half-width, but not
    // with room for the bead's own radius — this used to pass as "on the
    // path" when only the centre point was checked.
    const halfWidth = level.width / 2;
    const grazing = { x: level.path[2].x, y: level.path[2].y + (halfWidth - BEAD_RADIUS / 2) };
    expect(isWithinPath(grazing, level.path, level.width)).toBe(false);
    expect(nextState("running", grazing, level)).toBe("lost");
  });

  it("at a sharp corner, the bead can be covered by the joined area even when it's beyond one segment's own tolerance alone", () => {
    // Level 3's path bends sharply at (28, 52). A point 5 units up from that
    // vertex, along the corner's bisector, is farther from either adjacent
    // segment individually than that segment's own eroded tolerance allows —
    // but the two segments' painted areas overlap there, and a real bead
    // centred at this point is still entirely inside the rendered track
    // (confirmed against the browser's own SVGGeometryElement.isPointInStroke
    // for this exact point). A naive "distance to nearest segment, minus the
    // bead's radius" check wrongly calls this a loss.
    const level3 = LEVELS[2];
    const vertex = level3.path[2];
    expect(vertex).toEqual({ x: 28, y: 52 });
    const nearVertex = { x: vertex.x, y: vertex.y - 5 };
    expect(isWithinPath(nearVertex, level3.path, level3.width)).toBe(true);
    expect(nextState("running", nearVertex, level3)).toBe("running");
  });

  it("later levels narrow the effective tolerance, so difficulty actually increases", () => {
    const tolerances = LEVELS.map((lvl) => lvl.width / 2 - BEAD_RADIUS);
    for (let i = 1; i < tolerances.length; i++) {
      expect(tolerances[i]).toBeLessThan(tolerances[i - 1]);
    }
  });
});
